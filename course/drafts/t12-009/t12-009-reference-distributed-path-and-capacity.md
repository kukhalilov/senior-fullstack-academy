# End-to-end performance engineering for web applications — Reference: Network, dependencies, caching, and capacity

## Scope and version

This reference describes provider-neutral system behavior. Exact queue, autoscaling, CPU-limit, and cache behavior depends on runtime and platform.

## How this group fits the mental model

End-to-end latency is shaped by serial waits, parallel fan-out, queueing, retries, and capacity. A service can be CPU-idle while blocked on a pool or downstream dependency. Monitor the critical path and the queue that forms near saturation.

## Supplied names explained

- `DNS and connection setup time` — Name resolution and connection/TLS establishment can add latency on cold paths; cache and reuse make their contribution conditional.
- `Distributed trace critical path` — The spans whose delays determine end-to-end completion, including serial dependencies and the slowest required branch of parallel work.
- `Fan-out latency` — Calling multiple dependencies can make completion depend on a slow branch; increasing branch count can worsen tail probability even when average branch latency is stable.
- `Dependency timeout budget` — A deadline allocation for downstream calls within an end-to-end budget. Nested deadlines should leave time to return a useful response and avoid every layer waiting for the full outer timeout.
- `Retry amplification` — Retries increase offered load while a dependency is slow or failing. Bound attempts and deadlines, use jitter, and avoid retrying permanent errors.
- `Bounded queue and queue depth` — A queue with a maximum capacity prevents unbounded memory growth; depth and age indicate waiting demand. Reject, shed, or defer work when it cannot complete usefully.
- `Cache hit ratio and miss penalty` — Hit rate describes reuse frequency; miss penalty is the extra source work/latency on misses. A high hit ratio can still hide very expensive cold misses or skewed keys.
- `Cache stampede` — Many requests regenerate the same expired/missing entry at once. Single-flight, stale serving, jitter, or early refresh can reduce load with coordination/freshness tradeoffs.
- `Stale data budget` — The acceptable age/window for a cached representation. TTL alone is not a guarantee of freshness if invalidation or replication is delayed.
- `Load shedding` — Rejecting or deferring lower-priority work under overload to preserve critical work and recovery capacity.
- `Bulkhead isolation` — Separating resource pools or concurrency limits so one dependency or workload cannot consume all capacity.
- `CPU throttling and memory limit` — Container limits can cap CPU or memory and change latency/GC behavior. Requests and limits have platform-specific scheduling semantics; inspect runtime metrics and platform telemetry.
- `Autoscaling delay` — Time for a scaling signal, decision, provisioning, and readiness. Scaling cannot address a burst instantly and may amplify dependency load.
- `Capacity headroom` — Unused sustainable capacity reserved for bursts, failures, deployments, and uncertainty.
- `Failover capacity` — Capacity remaining after a component/zone/region failure. Healthy components may become overloaded when traffic shifts.

## Cross-item comparison

Retries create demand; bounded queues and load shedding constrain it. Caches reduce repeated origin work but require a staleness budget. Bulkheads isolate resources; autoscaling adds capacity after a delay. Failover capacity must be planned for traffic concentration, not only normal load.

## Examples

If three parallel services are all required, end-to-end latency follows the slowest branch; trace each branch and avoid retrying all three on every timeout. If a hot cache key expires, single-flight or stale-while-revalidate may protect the origin. During a region failure, verify remaining capacity can handle shifted traffic while preserving database connection budgets.

## Common mistakes

- Increasing retries when the dependency is overloaded.
- Treating a cache hit ratio as proof that all users benefit.
- Autoscaling app instances without checking database connection capacity.
- Setting queue capacity without a maximum wait age or rejection policy.
- Planning failover with only average demand.

## Knowledge checks with answers

1. Why can fan-out worsen p99? A request can be delayed by its slowest required branch.
2. Why can autoscaling worsen a database incident? More app replicas may create more concurrent database demand.
3. Does a TTL guarantee data freshness? No; it bounds one cache lifetime but invalidation/replication windows still matter.

### Sources

- [Google SRE: Handling overload](https://sre.google/sre-book/handling-overload/)
- [Google SRE: Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [ASP.NET Core performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices?view=aspnetcore-11.0)
- [EF Core performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis)
