# Kubernetes workloads configuration scheduling and networking — Interview questions and reasoning

Sources: [Kubernetes objects](https://kubernetes.io/docs/concepts/overview/working-with-objects/), [Workload controllers](https://kubernetes.io/docs/concepts/workloads/controllers/), [Services](https://kubernetes.io/docs/concepts/services-networking/service/), [Scheduling and eviction](https://kubernetes.io/docs/concepts/scheduling-eviction/), [HPA](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/), and [Kubernetes v1.37 release announcement](https://kubernetes.io/blog/2026/08/26/kubernetes-v1-37-release/).

## Core questions

1. Trace a Deployment update from API request to a user request reaching a new Pod.
2. Why is a Pod not normally a durable unit of identity?
3. Explain startup, liveness and readiness probes and describe a damaging configuration.
4. Choose between Deployment, StatefulSet, DaemonSet, Job and CronJob for five example workloads.
5. How does a Service continue to work while Pods are replaced?
6. Compare Ingress and Gateway API, including the role of an implementation/controller.
7. Distinguish a request from a limit and explain CPU throttling versus memory OOM termination.
8. Explain how node affinity, taints/tolerations and topology spread interact.
9. What does a PodDisruptionBudget protect against, and what does it not protect against?
10. How would you diagnose an API deployment that is Available but receives no traffic?
11. How do HPA and a node autoscaler differ, and what must be installed for each to work?
12. What changes in a scale-to-zero design compared with a minimum-one-replica service?
13. Explain the separate stages of Kubernetes authentication, authorization and admission.
14. What is required for NetworkPolicy and a CRD to have their intended behavior?
15. Which recent upstream Kubernetes changes matter to workload teams in v1.37?
16. How can a workload modify persistent-volume performance without reprovisioning, and what does a group snapshot actually guarantee?

## Concise interview answers

1. A client sends a typed object to the API server. The request is authenticated, authorized, admitted and validated; stored desired state is observed by controllers. Deployment creates/updates a ReplicaSet, which creates Pods. The scheduler binds each feasible Pod to a node; kubelet/runtime start containers and report status. Readiness affects endpoint eligibility; EndpointSlices and Service data-plane forwarding then route traffic. Each stage can fail independently.
2. A Pod is replaceable; its UID and IP can change. Stable identity should come from a Service or a controller's stateful identity model, while durable data belongs in suitable persistent storage or a database.
3. Startup gates other probes while initialization completes; liveness asks whether a restart is useful; readiness decides traffic eligibility. A liveness endpoint that fails whenever a shared database is down can restart every application Pod and intensify an outage.
4. Deployment for interchangeable stateless replicas; StatefulSet for stable ordinal/storage identity and ordering; DaemonSet for node-local agents; Job for finite completion; CronJob for scheduled Job creation with concurrency/missed-schedule caveats.
5. The Service selects Pods and exposes a stable virtual identity. The EndpointSlice controller publishes endpoints and the data plane implements forwarding. Readiness and labels determine which Pods are usable.
6. Ingress is a stable but frozen HTTP(S) API requiring an Ingress controller. Gateway API separates infrastructure class, Gateway listeners and route resources, with Standard/Experimental channels. Both need an implementation; Gateway feature support varies by conformance/version.
7. Requests drive scheduling and resource accounting. CPU limits can throttle; memory above a limit can lead to OOM kill. QoS is based on requests/limits and affects eviction preference, not guaranteed uptime.
8. Affinity filters or prefers nodes/Pods; taints repel unless tolerated, while tolerations only permit placement; topology spread controls replica distribution across labeled domains. Hard rules can leave no feasible node.
9. A PDB constrains supported voluntary eviction through the eviction API. It cannot stop node failure, prevent every deletion, create replicas or guarantee application availability.
10. Check selector/Pod labels, Pod Ready conditions, Service/EndpointSlices, target port/listener, DNS, route/controller status, NetworkPolicy/CNI enforcement, and application signals. Start at the first boundary that differs from expected state.
11. HPA changes Pod replica count from metrics and needs a metrics source/adapter. Node autoscaling changes node capacity and usually integrates with provider node groups. Neither is instantaneous; requests and scheduling constraints determine whether capacity can be used.
12. The scale-up metric must remain available with zero Pods, the trigger must handle cold start, and HTTP traffic needs buffering or an always-on front door if requests cannot fail during startup. In v1.37 suitable object/external metric scaling to zero is Beta and enabled by default upstream.
13. Authentication identifies the caller; authorization checks requested action/resource; admission validates or mutates the object. Passing one stage does not imply passing the next or that runtime behavior will succeed.
14. NetworkPolicy needs a compatible enforcing CNI; CRD validation comes from the definition, while reconciliation needs its controller/operator. API acceptance alone is not proof of enforcement.
15. v1.37 is currently listed as latest at the source snapshot date. Workload-relevant changes include stable metrics.k8s.io/v1, Beta HPA scale-to-zero with suitable metrics, Beta gang scheduling/workload-aware preemption, and stable DRA enhancements. Verify provider support, component versions and feature configuration.
16. A PVC can select a `VolumeAttributesClass`; the CSI driver must support `ModifyVolume` and its parameters are driver-specific. `VolumeGroupSnapshot` can capture a crash-consistent set of PVCs through the CSI group-snapshot API, but restore and application/database recovery still need to be tested.

## Deep follow-up answers

### How would you design a safe rollout for a stateful API?

Separate backward-compatible schema expansion from application rollout. Keep old and new application versions able to operate during the overlap window; add new fields/tables first, deploy code that can read both forms, backfill, then remove old forms only after rollback is no longer needed. Use readiness to remove an instance that cannot serve correctly, set surge/unavailable bounds based on spare capacity, and observe application-level error rate and latency. A Kubernetes rollout history only records controller template revisions; it does not restore database state or reverse external messages. Practice rollback and forward-fix paths before production.

### What happens when a Pod is Pending?

Pending includes time before scheduling and time after scheduling while setup proceeds. First inspect `.status.conditions`, Events and `spec.nodeName`. An unschedulable Pod points toward scheduler feasibility: requests versus allocatable, node selector/affinity, taints/tolerations, topology, PVC binding/topology, quota and priority. If already assigned, inspect kubelet events, image pull, volumes, sandbox/CNI and admission/runtime behavior. Do not add nodes until you know a new node would satisfy the constraints.

### How would you investigate a sudden restart spike?

Correlate start time and node/event changes. Inspect `restartCount`, `lastState`, exit code/reason, current and previous logs, probe failures, OOM status, resource usage, rollout revisions, configuration changes and node pressure. Check whether liveness tests a local recoverable condition; if many Pods restart together due to a shared dependency, remove the restart trigger only after confirming the process can recover safely without it. A restart can erase in-memory state and increase load on the same failing dependency.

### How do you prevent a maintenance drain from deadlocking?

Set replicas across independent eligible domains, ensure PDB values permit at least one intended eviction, confirm replacement capacity and readiness, and inspect Pod priority/taints/storage topology. A PDB that requires every replica available can block a drain if one is unhealthy. `unhealthyPodEvictionPolicy` may allow eviction of unhealthy replicas. Coordinate controller and storage behavior, and recognize that the PDB cannot protect against the node failing abruptly.

### When would you choose an HPA metric other than CPU?

For queue workers, queue depth or oldest-message age may represent demand better than CPU, especially when the worker is blocked on I/O. An external/custom metric requires a reliable adapter and clear units/aggregation. Design scale-up and scale-down rate policies, stabilization, per-replica throughput assumptions, max capacity, downstream limits and zero-replica visibility together. Autoscaling on a lagging or duplicated metric can oscillate or create overload.

### What is different about in-place resize?

Stable since v1.35, it requests CPU/memory resource changes for a running Pod using `/resize`; `resizePolicy` can require a container restart, and a change can remain deferred if capacity is unavailable. It is distinct from updating a Deployment template, which creates replacement Pods through rollout semantics. Use live resize when its narrower behavior fits; retain controller-managed templates as the source of desired workload configuration so drift does not later undo the change.

## Scenario questions

### Scenario A: traffic fails only after a new rollout

Give the ordered evidence you would inspect and how you would decide to roll back. Strong answers include the new ReplicaSet and image, Pod startup/readiness/events/logs, service selector/endpoints, routing and application metrics; they distinguish controller success from user success and account for database compatibility before rollback.

### Scenario B: a Pod is Pending in a full cluster

Explain how you decide whether to scale nodes, relax constraints, or reduce requests. Strong answers check exact scheduler events, resource requests/allocatable, affinity/taints/topology, PVC topology, quota and whether a new node group can satisfy constraints. They avoid lowering requests without measurement.

### Scenario C: node drain hangs

Explain how PDB and unhealthy replicas can block voluntary eviction. Strong answers check allowed disruptions, PDB selector versus controller labels, replica health, replacement capacity and storage detach. They do not delete Pods blindly or claim PDB prevents node crashes.

### Scenario D: service must handle a queue with idle periods

Explain whether HPA-to-zero is appropriate. Strong answers require a metric available at zero replicas, an external/object metric adapter, cold-start tolerance, durable queueing, and cluster-level scheduling capacity. They distinguish worker queueing from direct HTTP requests to zero backends.

## Tradeoffs and alternatives

- Kubernetes provides a uniform workload API and composable control loops, while a managed application/container platform can reduce cluster operating burden for simpler cases.
- Deployment maximizes interchangeability and simple rollouts; StatefulSet provides identity/storage ordering at the cost of more careful state and upgrade operations.
- Ingress is widely established and simple for HTTP(S); Gateway API offers a richer role-oriented model, but support/conformance must be verified per implementation.
- Hard placement and disruption rules express stronger intent but can make workloads unschedulable or maintenance impossible when capacity is insufficient.
- Autoscaling improves elasticity but adds metric delay, cold start, oscillation and cost uncertainty; fixed capacity is simpler but may waste or lack resources.
- Kubernetes Secret and RBAC are built-in primitives; external secret/key systems may add rotation/integration features but also another dependency and controller.

## Common weak answers

- “Kubernetes restarts it, so it is highly available.” This ignores replicas, data, zones, health, traffic and recovery.
- “The Pod is Running, so it is healthy.” Running is not readiness or application correctness.
- “The Service routes to the Deployment.” The Service selects endpoints by labels; controllers, readiness and data plane determine the path.
- “Requests and limits are the same.” Requests drive scheduling/accounting; limits constrain runtime usage.
- “Tolerations put Pods on special nodes.” They only permit matching taints; affinity/selectors may be needed to attract.
- “PDB prevents downtime.” It limits selected voluntary disruptions, not involuntary failures or all deletion paths.
- “HPA adds servers.” It changes Pod replicas; a node autoscaler may add nodes separately.
- “A Kubernetes Secret is encrypted.” Encryption at rest and access controls must be configured and verified.
- “Apply succeeded, so deployment is done.” API acceptance is only the first boundary.
- “A rollout undo restores everything.” It changes a workload template; database and external state may be irreversible.

## Self-check rubric

Rate yourself from 0 to 2 for each item: **0** = cannot explain; **1** = can define but misses failure cases; **2** = can explain mechanism, tradeoff and diagnosis.

1. Trace API write, admission, reconciliation, scheduling, kubelet/runtime, readiness and traffic.
2. Explain Pod lifecycle, startup/readiness/liveness and graceful termination accurately.
3. Select controllers by replica identity and completion semantics.
4. Debug Service discovery and external route attachment by checking selectors/endpoints/implementations.
5. Reason about storage durability, requests/limits, QoS and in-place resize without confusing them.
6. Combine affinity, tolerations, topology, PDB and autoscaling without claiming guarantees they do not provide.
7. Separate identity, authorization, admission, runtime security and network enforcement.
8. State current version-sensitive behavior with a release source and distinguish upstream from provider support.

Aim for 14/16 before describing yourself as interview-ready. For every score below 2, revisit the corresponding reference lesson and solve its scenario without notes.
