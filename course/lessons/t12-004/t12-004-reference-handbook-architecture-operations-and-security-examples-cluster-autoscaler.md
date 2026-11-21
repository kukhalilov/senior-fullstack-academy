# architecture patterns multi-region tenancy and reliability — Reference: Cluster Autoscaler

Sources: [HLD Handbook](https://hld.handbook.academy/), [Kubernetes Cluster Autoscaler project](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler), [Cluster Autoscaler FAQ](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/FAQ.md), [Kubernetes scheduling](https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/), [Kubernetes Pod disruption budgets](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/).

## Scope and version

Cluster Autoscaler (CA) is the Kubernetes project component that adjusts configured node groups in response to pending/unschedulable Pods and opportunities to remove unneeded nodes. Cloud-provider integration, supported options, and node provisioning behavior vary. This lesson describes the project model, not one cloud’s exact configuration.

## How this group fits the mental model

The scheduler decides whether a Pod fits on currently available nodes. If replicas requested by a workload controller cannot be scheduled, CA evaluates whether adding a node group could make them schedulable and asks the cloud provider to increase capacity within configured bounds. When the cluster has spare capacity, CA may drain and remove nodes that are safe to empty. New node boot, cluster registration, image pulls, and Pod readiness are downstream work; CA does not make those operations instantaneous.

CA is a cluster-capacity controller, not an application-demand controller. HPA may raise replica count from application metrics; the scheduler then exposes insufficient node capacity as pending Pods, which can trigger CA. Overprovisioned nodes do not necessarily cause HPA to reduce application replicas, and a utilization-based VM autoscaler that ignores Kubernetes scheduling can fight CA.

## Supplied names explained

- **Cluster Autoscaler** — Kubernetes autoscaling component that expands supported node groups to place pending Pods and contracts them when nodes are unneeded and their workloads can be safely moved, subject to configured limits and provider behavior.

### Scale-up reasoning

CA looks for unschedulable Pods and simulates whether a node from a configured group could fit them based on Pod requests, node labels/taints, affinity, topology constraints, storage, and other scheduler-relevant requirements that the integration models. If no group can satisfy a pending Pod, simply increasing a group’s maximum will not fix the mismatch; inspect the Pod’s scheduling events and node-template labels/resources. Cloud-provider quota, capacity stockout, bootstrap errors, or registration failure can also prevent a requested increase from becoming usable nodes.

Use realistic requests because scheduling and node planning rely heavily on declared resource requirements, not only momentary CPU use. Configure node-group min/max and total cluster bounds deliberately. Ensure the node group template reflects labels, taints, accelerators, and other constraints used by workloads. Track pending-Pod age, CA decisions, provider API errors, time to node-ready, and time to Pod-ready.

### Scale-down reasoning

Low utilization alone does not guarantee a node is removable. Pods must be movable under scheduling constraints; eviction must respect PodDisruptionBudgets and termination behavior, and some system or annotated workloads may prevent removal. Scale-down uses delays and safety checks to avoid churn. A PDB can also prevent voluntary eviction when its disruption allowance is exhausted, so PDBs need to reflect availability requirements without permanently blocking maintenance or autoscaling.

## Cross-item comparison

| Controller | Decision | Typical limiting factor |
|---|---|---|
| HPA | How many workload Pods should exist? | Application metrics, replica bounds, dependency capacity |
| Cluster Autoscaler | How many nodes are needed to schedule Pods safely? | Node-group fit, provider quota/capacity, drain constraints |
| Cloud VM autoscaler | How many VMs match its configured metric/schedule? | May not understand Pod scheduling and can conflict with CA |
| Karpenter or provider-native node provisioning | Which node shape should be provisioned for pending Pods? | Provider-specific behavior, policies, consolidation and disruption settings |

Choose one node-capacity authority for a given node group unless the product explicitly documents safe cooperation. CA’s usefulness depends on the cloud-provider integration and group model. Alternative provisioners may offer more flexible instance selection, but compare operational maturity, constraints, disruption behavior, and the team’s support model before switching.

## Examples

**Pods pending despite scale-up.** An HPA increases an API Deployment to 40 replicas, but 12 Pods remain pending with an affinity requirement for a GPU node label. CA sees a general-purpose group that cannot satisfy the template and does not solve the problem by adding ordinary nodes. Inspect events, register a compatible GPU group with correct labels/capacity limits, and verify provider quota and bootstrap. Track the complete time from unschedulable Pod to serving endpoint.

**Node consolidation blocked.** A node looks idle, but its workload has a restrictive PDB and the only replica cannot be evicted. CA preserves the node. Validate whether the PDB expresses the true user-availability requirement, add replicas or spread them if appropriate, and ensure termination hooks finish within operational limits. Do not remove the guardrail without validating service impact.

## Common mistakes

- Assuming CA scales based on CPU load like a generic VM metric autoscaler; its core scale-up trigger is pending Pods that could fit a node.
- Setting only a high maximum while leaving node templates incompatible with labels, taints, storage, topology, or resource requests.
- Treating a cloud scale-up API response as proof the node registered and Pods became ready.
- Running independent CA and metric-based node-group autoscalers against the same group.
- Believing a low-utilization node is removable despite PDBs, non-evictable Pods, affinities, or minimum-size bounds.
- Setting resource requests far below real needs, which can make bin packing and autoscaling decisions unsafe.
- Expecting autoscaling to absorb a sudden surge faster than node creation and application startup permit; keep baseline capacity or use pre-scaling where needed.

## Knowledge checks with answers

1. **What event typically drives CA scale-up?** A Pod remains unschedulable and CA can identify a configured node group that could satisfy its scheduling requirements.
2. **Why might increasing `maxNodes` have no effect?** No available node group fits the Pod’s constraints, provider quota/capacity is unavailable, or node bootstrap/registration is failing.
3. **Why might an idle node stay?** Its Pods cannot be safely evicted or rescheduled, a PDB blocks disruption, a scale-down guard applies, or configured bounds/delays prevent removal.
4. **How do HPA and CA work together?** HPA adjusts Pod replicas from workload metrics; pending Pods can then lead CA to provision nodes so those replicas can schedule.
