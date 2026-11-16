# scaling availability replication sharding load balancing — Reference: Capacity growth, elasticity, workload state, and scale limits

Sources: [Design to scale out](https://learn.microsoft.com/en-us/azure/architecture/guide/design-principles/scale-out), [queue-based load leveling](https://learn.microsoft.com/en-us/azure/architecture/patterns/queue-based-load-leveling), and [scalability design](https://learn.microsoft.com/en-us/azure/well-architected/scalability/design-scale).

## Scope and version

This provider-neutral architecture reference covers the exact capacity terms in the manifest. It does not list product-specific autoscaler settings or cloud service SKUs.

## How this group fits the mental model

Scaling follows evidence about demand, queueing, bottlenecks, and user-facing latency. A service may scale vertically, horizontally, or elastically, but only if its dependencies and state model support the extra work. Workload separation, flow control, and safe instance removal are part of capacity design.

## Supplied names explained

- `Scalability` is the ability to increase useful throughput or workload capacity as resources are added. Measure throughput gained per resource increase and identify coordination that prevents proportional growth.
- `Vertical scaling (scale up)` increases resources assigned to one unit, such as compute or memory. It is simple while headroom exists, but remains bounded by machine/service limits and can preserve one bottleneck.
- `Vertical scaling (scale down)` reduces resources assigned to one unit to reduce cost or match lower demand. Validate peak-load headroom and latency before shrinking.
- `Horizontal scaling (scale out)` adds parallel instances or partitions. It works when work can be distributed and instances do not rely on hidden local state; shared dependencies still need capacity.
- `Horizontal scaling (scale in)` removes instances or partitions. Stop new work, drain connections, checkpoint or requeue long tasks, and ensure remaining capacity can carry demand.
- `Elasticity` is the ability to adjust capacity as workload changes. It requires measurable signals, safe startup/drain, and limits that protect dependencies.
- `Reactive autoscaling` changes capacity after current metrics cross a condition. It responds to demand but may lag sudden bursts because provisioning takes time.
- `Scheduled autoscaling` changes capacity at known times, such as a predictable business-day peak. It can pre-warm resources but needs adjustment when patterns change.
- `Predictive autoscaling` forecasts future demand and provisions before it arrives. Forecast errors can cause cost or capacity problems, so retain safety margins and reactive controls.
- `Scale-in stabilization` delays or dampens scale-in after a temporary demand drop. It prevents oscillation and premature removal but may keep spare capacity longer.
- `Graceful instance drain` stops assigning new requests while existing work finishes or times out safely. It reduces failed requests during scale-in and deployments.
- `Capacity planning` estimates resource needs using workload forecasts, measured per-unit capacity, failure reserve, and growth assumptions. Revisit it after traffic or architecture changes.
- `Load test capacity curve` relates offered load to throughput, latency, errors, and resource use. The knee where latency/errors rise sharply is more useful than one maximum-throughput number.
- `Throughput per resource unit` measures work completed per unit such as CPU, memory, instance, or cost. Compare like-for-like workload and latency targets.
- `Bottleneck migration` occurs when fixing one limiting resource exposes another. A faster application tier can saturate the database or network, so measure again after each change.
- `Little's Law capacity implication` uses L = λW for a stable system: average in-flight work L equals arrival rate λ times average time W. It estimates concurrency and queue occupancy, not safe maximum capacity.
- `Amdahl's law` bounds parallel speedup by the fraction that must remain serial. Shared coordination or one sequential step limits gains from adding workers.
- `Stateless service instance` can handle a request without depending on process-local session data from a previous request. Statelessness makes balancing and replacement easier; dependencies may still be stateful.
- `Externalized session state` stores session data in a shared service or signed client token instead of one process's memory. It supports routing to any instance but adds dependency, latency, expiry, and security concerns.
- `Session affinity (sticky session)` routes a client repeatedly to the same instance. It can preserve local state, but creates skew and complicates balancing, instance loss, and scale-in.
- `Workload isolation` separates workloads with different resource, security, latency, or scaling needs. It limits noisy-neighbor effects but can increase infrastructure and operations.
- `Queue-based load leveling` buffers asynchronous work so consumers process it at a controlled rate. It absorbs bursts temporarily; sustained production above consumption grows backlog and latency.
- `Back-pressure` communicates downstream capacity limits upstream so producers slow, pause, or reject work. It prevents unbounded queues and cascading overload.
- `Admission control` decides whether to accept, defer, or reject work based on capacity or policy. Early controlled rejection can protect existing requests and critical functions.
- `Independent scaling boundary` is a component/workload whose capacity can change without scaling unrelated parts. Clear ownership and asynchronous boundaries help; chatty synchronous dependencies reduce the benefit.
- `Scale unit` is the repeatable unit of capacity added or removed, such as an instance group, partition, or complete service slice. Define its resource envelope, health, startup, and drain behavior.

## Cross-item comparison

| Strategy | Changes | Useful when | Limitation |
|---|---|---|---|
| Vertical | Resources inside one unit | One unit has headroom; simplicity matters | Finite ceiling and shared failure |
| Horizontal | Number of independent units | Work can be distributed | Coordination and shared bottlenecks |
| Elastic | Capacity follows workload | Demand varies | Provisioning delay and control-loop errors |
| Queue-based leveling | Deferred buffer and consumer rate | Work is asynchronous | Backlog grows if average demand is too high |

## Examples

If request volume doubles but throughput per instance does not change, add instances only if the data store has headroom. Otherwise, admission control or bounded queueing may protect the dependency while it is addressed. Use a capacity curve to test failure reserve: expected peak must be served when one scale unit is unavailable.

## Common mistakes

- Scaling on CPU alone when queue depth or latency shows the real bottleneck.
- Adding capacity only after saturation despite long provisioning time.
- Scaling in based on a short quiet interval.
- Draining without accounting for long-running requests or queued jobs.
- Treating maximum test load as safe sustained capacity.
- Letting elastic consumers overload a downstream dependency.

## Knowledge checks with answers

1. Does doubling instances always double throughput? **No; shared bottlenecks and serial work limit the gain.**
2. What does Little's Law estimate? **Average in-flight work from arrival rate and average time in a stable system.**
3. Why use scale-in stabilization? **To avoid oscillation and premature removal after a brief demand dip.**
4. When can a queue worsen a problem? **When producers exceed consumers on average, causing unbounded backlog and rising latency.**

### Exact terms covered

- `Scalability`
- `Vertical scaling (scale up)`
- `Vertical scaling (scale down)`
- `Horizontal scaling (scale out)`
- `Horizontal scaling (scale in)`
- `Elasticity`
- `Reactive autoscaling`
- `Scheduled autoscaling`
- `Predictive autoscaling`
- `Scale-in stabilization`
- `Graceful instance drain`
- `Capacity planning`
- `Load test capacity curve`
- `Throughput per resource unit`
- `Bottleneck migration`
- `Little's Law capacity implication`
- `Amdahl's law`
- `Stateless service instance`
- `Externalized session state`
- `Session affinity (sticky session)`
- `Workload isolation`
- `Queue-based load leveling`
- `Back-pressure`
- `Admission control`
- `Independent scaling boundary`
- `Scale unit`
