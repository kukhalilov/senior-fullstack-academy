# architecture patterns multi-region tenancy and reliability — Reference: Horizontal Pod Autoscaler (HPA)

Sources: [HLD Handbook](https://hld.handbook.academy/), [Kubernetes Horizontal Pod Autoscaling](https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/), [HPA v2 API reference](https://kubernetes.io/docs/reference/kubernetes-api/autoscaling/horizontal-pod-autoscaler-v2/), [Kubernetes resource metrics pipeline](https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/).

## Scope and version

This lesson covers Kubernetes HPA behavior and design trade-offs, using the autoscaling/v2 API documentation checked on 2026-11-20. HPA controller defaults, metrics adapters, and feature gates may vary by Kubernetes release and cluster distribution; check the version actually deployed.

## How this group fits the mental model

HPA is a feedback controller that changes the replica count of a scalable workload, such as a Deployment, based on observed metrics. It does not create compute nodes; a separate node-provisioning layer must provide room for replicas. Conversely, nodes can exist while an application remains under-replicated if HPA has no useful metric or cannot reach its maximum.

The loop is: collect a metric, compare it with the target, calculate a desired replica count, apply scaling behavior and bounds, update the workload’s scale subresource, schedule new Pods, then wait for them to become ready. Metrics delay, startup time, image pulls, quotas, and readiness can make actual capacity lag demand. Set expectations around end-to-end usable capacity, not just the controller’s replica decision.

## Supplied names explained

- **Horizontal Pod Autoscaler (HPA)** — Kubernetes control-plane resource and controller that adjusts the replica count of a scalable workload from observed resource, custom, or external metrics. It is horizontal at the Pod/workload level; node capacity and application readiness are separate concerns.

### Metrics and calculation

- Resource metrics include CPU and, where configured and available, memory. CPU utilization is evaluated against declared resource requests; missing or unrealistic requests make the signal misleading or unusable. CPU averages can also miss queue depth, latency, or a saturated downstream dependency.
- Custom metrics describe Kubernetes objects or Pods; external metrics come from outside the cluster through a compatible metrics API/adapter. Examples include queue backlog, request rate, or concurrent jobs. Ensure the metric can be attributed and has meaningful units and freshness.
- With multiple metrics, HPA computes a desired replica count for each and selects the largest recommendation. Thus one high demand signal can drive scale-out; it also means a bad/noisy metric can dominate. Missing metrics and not-yet-ready Pods receive conservative treatment in the algorithm; investigate metric collection and events before tuning thresholds.
- The familiar proportional formula is only a model: desired replicas are approximately current replicas × current metric / target metric, then rounded and constrained by tolerance, min/max bounds, stabilization, and rate policies. Do not operate from the formula alone; inspect the actual API/controller version.

### Behavior and safe design

`autoscaling/v2` allows scale-up and scale-down behavior policies, stabilization windows, and limits on how quickly replicas change. Scale-down stabilization helps avoid oscillation when a brief low sample follows a peak; aggressive scale-up may be appropriate for latency-sensitive services but can amplify dependency pressure. Minimum replicas preserve a warm floor; maximum replicas cap cost and protect downstream systems. Alert when HPA is at maximum while target SLI degrades.

Scaling is not a substitute for load testing or capacity planning. Define what metric predicts useful capacity, tune requests/limits, account for startup/readiness, and test a sudden burst. If queue processing is the objective, scale from backlog per worker or age of oldest message and keep consumers idempotent. Do not scale workers so quickly that the database or third-party API becomes the new bottleneck.

## Cross-item comparison

| Mechanism | Scales | Signal or trigger | Important limit |
|---|---|---|---|
| HPA | Pod replicas | Resource/custom/external metrics | New Pods still need schedulable node capacity and warm-up time |
| Cluster Autoscaler | Cloud/node groups | Unschedulable Pods and node utilization/removability | Provisioning and boot/registration take time; provider quota can block it |
| Vertical Pod Autoscaler | Pod resource requests | Observed resource use (mode-dependent) | Can cause restarts/evictions and is not a substitute for replica scaling |
| Scheduled/predictive scaling | Capacity before expected demand | Calendar or forecast | Forecast error; pair with reactive safeguards and capacity bounds |

HPA and node autoscaling can form a chain: demand raises desired replicas, the scheduler marks some unschedulable, node autoscaling provisions capacity, and Pods then start. Measure this whole path. A sudden load spike may exceed that chain’s reaction time, so keep a baseline or use caching, queues, admission control, or pre-scaling where appropriate.

## Examples

**API deployment.** A Deployment has a minimum replica floor and a maximum chosen from tested database connection and cost limits. HPA tracks CPU plus a custom request-latency/queue signal, with a stabilization window on scale-down. If metric-server data disappears, an alert identifies missing metrics; if the HPA reaches max replicas and p95 latency still rises, the incident runbook checks database saturation and request admission rather than raising max blindly.

**Queue workers.** A worker has low CPU while blocked on I/O, so CPU utilization is a poor capacity indicator. An external metric exposes backlog divided by target work per replica and possibly oldest-message age. HPA increases Pods, but database concurrency is bounded and consumers use idempotency. Node autoscaling provides capacity for unschedulable Pods; a minimum node/Pod buffer handles bursts faster than cold provisioning.

## Common mistakes

- Expecting HPA to provision nodes or to guarantee new Pods are ready instantly.
- Using CPU utilization without sensible CPU requests or using CPU when queue backlog/latency is the real bottleneck.
- Setting an unbounded maximum or ignoring downstream database, connection-pool, and provider limits.
- Tuning only target utilization while ignoring metric freshness, startup/readiness delays, stabilization, and scale-rate policies.
- Treating a healthy replica count as proof that user-facing SLOs are healthy.
- Running two independent controllers that both write the same workload replica count.
- Reading one controller formula as a guarantee that precisely that number of replicas will appear; the control loop has sampling and scheduling delays.

## Knowledge checks with answers

1. **What does HPA scale?** A scalable workload’s Pod replica count; separate infrastructure automation must supply nodes if Pods cannot schedule.
2. **Why can a queue worker need a custom metric?** CPU may be low while work waits on I/O; backlog or oldest-message age can be closer to the service’s actual demand.
3. **If HPA reaches `maxReplicas` while latency worsens, should the limit immediately increase?** First check whether the app/dependency can safely use more concurrency, whether the metric is correct, and whether capacity is blocked elsewhere.
4. **Why use stabilization and rate policies?** They reduce flapping and constrain how quickly capacity changes; they must be tuned against workload response and failure costs.
