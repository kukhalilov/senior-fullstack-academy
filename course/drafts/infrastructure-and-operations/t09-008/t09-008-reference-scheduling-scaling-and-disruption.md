# Kubernetes workloads configuration scheduling and networking — Reference: Placement constraints, cluster scaling, autoscaling, and safe eviction

Sources: [Scheduling, preemption and eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/), [Pod priority and preemption](https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/), [Pod topology spread constraints](https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/), [Horizontal Pod Autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/), [Pod disruptions](https://kubernetes.io/docs/concepts/workloads/pods/disruptions/), [Kubernetes v1.37 release announcement](https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/), [HPA scale-to-zero in v1.37](https://kubernetes.io/blog/2026/09/02/kubernetes-v1-37-hpa-scale-to-zero-beta/), and [DRA updates in v1.37](https://kubernetes.io/blog/2026/09/03/kubernetes-v1-37-dra-updates/).

## Scope and version

This reference covers Pod placement, capacity control, eviction and selected current scheduling/resource APIs. The official release page lists Kubernetes v1.37.1 as latest on 2026-11-16. In v1.37, HPA scaling to zero for suitable object/external metrics is Beta and enabled by default; gang scheduling and workload-aware preemption are Beta; several DRA surfaces reach Stable. Feature gates, API versions, metrics adapters, scheduler configuration and node/provider capacity must still be checked in the target cluster.

## How this group fits the mental model

The scheduler chooses a feasible node for an unscheduled Pod. Resource requests, topology and constraints limit feasibility. The kubelet executes the assignment. HPA adjusts workload replica count from metrics; a node autoscaler may provision capacity for unschedulable Pods. PDB and eviction APIs coordinate some voluntary maintenance. These loops have latency and can conflict if resource requests, limits, metrics and cluster capacity are inaccurate.

## Supplied names explained

### Scheduler, nodes, placement constraints

- `kube-scheduler` — Control-plane component that filters feasible nodes, scores candidates and binds Pods. It does not create machine capacity.
- `Node` — Cluster worker resource with labels, taints, capacity, allocatable resources and conditions. Node readiness and allocatable capacity differ from raw machine size.
- `kubelet` — Node agent that observes assigned Pods and works with runtime, storage and network components to realize them and report status.
- `Node selector` — Simple required node-label match in a Pod spec. It is easy to read but less expressive than node affinity.
- `Node affinity` — Required or preferred node-label rules. `requiredDuringSchedulingIgnoredDuringExecution` is a hard scheduling requirement; `preferredDuringSchedulingIgnoredDuringExecution` is a scoring preference. “IgnoredDuringExecution” means changing labels later does not automatically evict the Pod.
- `requiredDuringSchedulingIgnoredDuringExecution` — Node-affinity rule that must match at scheduling time; an unsatisfied rule leaves the Pod unscheduled.
- `preferredDuringSchedulingIgnoredDuringExecution` — Weighted preference used in node scoring, not a placement guarantee.
- `Pod affinity` — Attracts a Pod near existing matching Pods within a topology domain; label selectors/namespaces/topology matter and hard rules can block scheduling.
- `Pod anti-affinity` — Repels matching Pods from a topology domain, often used to avoid colocating replicas; hard rules can create impossible placements.
- `Topology spread constraint` — Distributes matching Pods across topology domains such as zones or nodes, with skew and eligibility rules.
- `topologyKey` — Node label key defining the topology domain used by affinity/anti-affinity and, historically, spread constraints. Current spread API uses `topologyKey` in each constraint.
- `maxSkew` — Maximum permitted difference in matching Pod counts between eligible topology domains for a spread constraint.
- `minDomains` — Minimum number of eligible domains considered for a spread constraint; affects global minimum calculations when fewer domains are eligible.
- `whenUnsatisfiable` — Whether a spread constraint blocks scheduling (`DoNotSchedule`) or influences scoring (`ScheduleAnyway`).
- `DoNotSchedule topology policy` — Hard spread constraint: a Pod that would violate the skew cannot be placed.
- `ScheduleAnyway topology policy` — Soft preference for reducing skew while allowing placement when ideal spread is impossible.
- `Node taint` — Node-side repulsion marker with key/value/effect. A matching Pod toleration permits placement but does not attract it.
- `Node toleration` — Pod-side permission for a matching taint. Operator, value, effect and optional toleration seconds determine matching.
- `NoSchedule taint effect` — Prevents scheduling new non-tolerating Pods; existing Pods are not evicted solely by this effect.
- `PreferNoSchedule taint effect` — Scheduler preference against placing non-tolerating Pods; not a hard ban.
- `NoExecute taint effect` — Prevents new non-tolerating Pods and can evict existing Pods; `tolerationSeconds` can bound continued residence.
- `Pod priority` — Numeric importance used by scheduling/preemption decisions; higher priority does not create resources or guarantee application availability.
- `PriorityClass` — Cluster-scoped named priority value and optional global default; privilege to use very high priorities should be controlled.
- `Preemption` — Scheduler may remove lower-priority Pods to schedule a higher-priority Pod, subject to feasibility and policies. It can disrupt services and may not solve topology/claim constraints.

### Disruption, eviction, and scheduling readiness

- `PodDisruptionBudget (PDB)` — Policy limiting some voluntary evictions, usually during drains. It does not prevent involuntary node failure or all deletion paths.
- `minAvailable` — PDB desired minimum available Pods; can be an integer or percentage. Percentage rounding and replica count matter.
- `unhealthyPodEvictionPolicy` — PDB field controlling eviction treatment for unhealthy Pods; `AlwaysAllow` can permit a drain to evict already unhealthy instances.
- `Eviction API` — Graceful API used for voluntary Pod eviction that honors PDB where applicable. Direct deletion and involuntary termination are different paths.
- `Voluntary disruption` — Planned action such as node drain or cluster maintenance; PDB can constrain supported eviction operations.
- `Involuntary disruption` — Failure outside PDB control, such as node crash, hardware failure or kernel panic.
- `Pod scheduling gates` — Named gates that keep a Pod unschedulable until another actor removes them; they allow coordinated workflows but require a reliable gate manager.
- `Node-pressure eviction` — Kubelet action to reclaim local resources under memory/disk/inode pressure, using thresholds and Pod priority/QoS factors.
- `Pod topology and zone failure domain` — Placement concern where spreading across nodes/zones reduces some correlated failures but does not guarantee independence or regional recovery.

### Horizontal and node autoscaling

- `HorizontalPodAutoscaler (HPA)` — Controller that adjusts a scalable target's replica count from observed metrics. It does not add nodes itself.
- `HPA scale target` — Usually a Deployment, StatefulSet or other Scale-subresource object; target must expose correct desired/observed replica fields.
- `HPA resource metric` — CPU/memory metric relative to Pod requests (utilization) or absolute value; resource requests are needed for utilization calculations.
- `HPA custom metric` — Application metric exposed through the Custom Metrics API, commonly associated with Pods or another object.
- `HPA external metric` — Metric not tied to a Kubernetes object, such as queue depth from an external adapter; adapter availability and metric freshness matter.
- `HPA behavior scaleUp` — Optional rate policies and stabilization behavior limiting replica increases.
- `HPA behavior scaleDown` — Optional stabilization/rate policy preventing rapid oscillation or abrupt capacity removal.
- `HPA stabilization window` — Period over which recent recommendations are considered to avoid flapping; it adds response delay by design.
- `HPA scaling to zero` — In v1.37, Beta and enabled by default for suitable object/external metrics. Use an explicit zero minimum and a metric that remains observable with no Pods.
- `HPA minReplicas zero` — Allows no workload replicas when scale-to-zero is supported and valid for the selected metrics/cluster; zero Pods means the app cannot serve directly until it scales back up.
- `HPA object metric` — Metric associated with a Kubernetes object such as a queue or service-level resource; it can remain available when workload replicas are zero.
- `metrics.k8s.io` — Resource metrics API used by `kubectl top` and HPA resource metrics, typically served by Metrics Server.
- `metrics.k8s.io/v1` — Stable resource metrics API in Kubernetes v1.37; clients should migrate while compatible beta API continues during the transition.
- `metrics.k8s.io/v1beta1` — Earlier beta resource metrics API; it remains usable during transition according to the v1.37 announcement but should not be the only assumed future API.
- `Metrics Server` — Common aggregator that supplies resource usage samples to the Metrics API; it is not a long-term monitoring or general custom-metrics system.
- `Custom Metrics API` — Adapter-backed API for metrics associated with Kubernetes objects, used by HPA custom metrics.
- `External Metrics API` — Adapter-backed API for metrics external to a particular Kubernetes object, used by HPA and scale-to-zero cases.
- `Cluster Autoscaler` — Common node-group autoscaler that may add/remove nodes in response to pending Pods and utilization; it is provider/configuration dependent and not an upstream core controller.

### Gang scheduling and Dynamic Resource Allocation

- `Dynamic Resource Allocation (DRA)` — Kubernetes API framework for requesting/allocating specialized devices and resources through drivers and claims rather than only static extended-resource counts.
- `DeviceClass` — Cluster API resource describing a class of devices and selection constraints that claims may request.
- `ResourceClaim` — API object representing a request/allocation of devices/resources for a workload or Pod; scheduling/driver coordination determines whether it can be satisfied.
- `ResourceClaimTemplate` — Template allowing a workload controller to create claims for its Pods.
- `ResourceSlice` — Driver-published inventory of available devices and their attributes/capacity for allocation.
- `DRA driver` — Component implementing resource discovery/allocation and node-side preparation for a device/resource type.
- `DRA extended resource support` — Stable in v1.37: a DRA driver can satisfy requests through the traditional extended resource mechanism without a separate device plugin for that resource path.
- `DeviceTaintRule` — API rule applying taints to matching DRA devices; device taints communicate unavailable or restricted hardware capacity.
- `Device taint` — Device-side restriction that prevents a claim/workload from selecting a device unless a matching device toleration is present.
- `Device toleration` — Claim/workload permission for a matching device taint; it is distinct from node taints and Pod tolerations.
- `resource.kubernetes.io/numaNode` — Standard DRA device attribute name for NUMA-node placement information, enabling consistent comparison across drivers.
- `ResourceClaim status devices` — Stable v1.37 claim status data reporting allocated device-specific information, including driver-provided details such as network information where applicable.
- `Gang scheduling` — Coordinated scheduling of a group of Pods, enabling all-or-nothing progress for tightly coupled jobs; in v1.37 this capability advances to Beta through Workload API/PodGroup concepts.
- `Workload API` — API family describing a group of Pods that should be scheduled or managed together; exact version/support must be checked.
- `Workload` — Group-level API object representing a coordinated unit of Pods/resources, especially for batch/HPC/AI scenarios.
- `PodGroup` — Group of Pods used for scheduling policy such as minimum member count and coordinated placement; implementation/version maturity is evolving.
- `PodGroup queueing` — Coordinates workloads waiting for scheduling capacity rather than admitting arbitrary partial groups; verify queue controller and scheduler support.
- `Workload-aware preemption` — Beta v1.37 scheduling behavior considering a workload group when preempting; it aims to avoid disrupting lower priority Pods without letting the group make progress.

## Cross-item comparison

| Mechanism | What it changes | What it cannot guarantee |
|---|---|---|
| HPA | Number of workload Pods | Node capacity, metric quality, readiness or request buffering |
| Node autoscaler | Number/type of worker nodes | Fast startup, cloud quota, feasible constraints or application health |
| PDB | Some voluntary evictions | Protection from crashes, direct deletion or all failures |
| Node affinity | Which nodes are eligible/preferred | Capacity or future node availability |
| Toleration | Permission to tolerate a taint | Attraction to a node |
| Topology spread | Distribution of matching Pods | Independent failure domains or cross-region recovery |

## Examples

A resource metric HPA needs resource requests for meaningful utilization:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata: {name: worker}
spec:
  scaleTargetRef: {apiVersion: apps/v1, kind: Deployment, name: worker}
  minReplicas: 2
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target: {type: Utilization, averageUtilization: 65}
```

For a v1.37 scale-to-zero design, use a suitable object/external metric and `minReplicas: 0`; ensure that the metric source works with zero Pods and accept cold-start delay. A Kubernetes Service does not hold inbound HTTP requests while no backend is Ready.

For topology constraints, decide whether failure to spread should block placement (`DoNotSchedule`) or merely influence placement (`ScheduleAnyway`). Hard constraints improve placement guarantees only when enough eligible domains and capacity exist.

## Common mistakes

- Expecting kube-scheduler to provision a node.
- Setting CPU utilization HPA without container resource requests.
- Expecting Metrics Server to provide application latency or queue-depth metrics.
- Scaling to zero on a metric that vanishes when there are no Pods.
- Forgetting cold start and request buffering for zero-replica HTTP services.
- Treating a toleration as node selection or a PDB as protection from node failure.
- Combining hard affinity, anti-affinity and topology rules that leave no feasible nodes.
- Ignoring PVC topology when diagnosing a pending Pod.
- Using high Pod priority to preempt capacity without measuring disruption to other workloads.
- Applying device tolerations as if they were node tolerations.
- Enabling evolving Workload/PodGroup APIs without compatible scheduler/controller support.

## Knowledge checks with answers

1. `An HPA wants more Pods but they stay Pending. What next?` Inspect scheduling events and node capacity, constraints, PVC topology, quotas and node autoscaler configuration.
2. `Why is a CPU request needed for utilization-based HPA?` Utilization is computed relative to requested CPU; without a request the value may be undefined for that container.
3. `What protection does a PDB provide?` It limits some supported voluntary evictions, not crashes or every deletion operation.
4. `Does a toleration select a GPU node?` No. Combine device/node requests and placement requirements; toleration only allows matching taints.
5. `What special issue appears at zero replicas?` A per-Pod metric may disappear. Choose an object/external metric that can signal demand while the workload is absent.
6. `When is gang scheduling useful?` When a coupled workload needs a minimum set of Pods scheduled together to make progress; support and API maturity must match the cluster.
