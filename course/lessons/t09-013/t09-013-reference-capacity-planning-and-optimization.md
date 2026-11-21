# performance profiling capacity and .NET diagnostics — Reference: Demand models, headroom, autoscaling limits, and performance decisions

# Scope and version

This lesson covers capacity and optimization decision vocabulary. Capacity is workload- and environment-specific; cloud SKUs, quotas, and autoscaler behavior change and are outside this fixed unit. All estimates should state assumptions and service objectives. [SRE implementing SLOs](https://sre.google/workbook/implementing-slos/) [.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/)

# How this group fits the mental model

Capacity planning estimates the demand a system can sustain while meeting a service target, including variation and failures. Optimization changes a measured constraint. Scaling adds resources, but new resources can take time and move the bottleneck to a dependency. Reserve and failure capacity are deliberate design choices, not spare waste.

# Supplied names explained

## Demand and capacity model

- `Capacity planning` — Estimating resources and operating limits required for expected, peak, and failure workloads. It combines measurements, forecasts, dependency budgets, cost, and headroom.
- `Peak demand` — The highest meaningful demand expected over a specified period and population. Define whether peaks are short spikes or sustained periods and how they correlate across tenants/services.
- `Average demand` — Mean workload over a stated interval. It is useful for cost planning but can hide bursts and peak resource requirements.
- `Burst demand` — A short-term demand increase above normal or sustained load. Buffers, rate limits, queue capacity, and scale-out delay determine whether it can be absorbed safely.
- `Growth forecast` — An estimate of future demand based on business growth, seasonality, product changes, and historical data. Forecast uncertainty should be explicit and periodically recalibrated.
- `Capacity headroom` — Intentional unused capacity to absorb variance, failover, maintenance, or growth while meeting objectives. The appropriate margin depends on workload uncertainty and recovery time.
- `N+1 capacity` — A design capable of meeting a specified demand after losing one relevant unit (such as a node or zone), under stated assumptions. N+1 does not guarantee resilience to correlated failures or data loss.
- `Sustainable throughput` — The completed rate a system can maintain while meeting latency, error, correctness, and resource criteria. It is more useful than a brief maximum burst.
- `Maximum tested throughput` — The highest workload point observed in a specific test. It is evidence for that configuration only and should include failures, latency, duration, and environment.
- `Queue stability` — A condition where service capacity keeps up with arrivals over time so queue size does not grow without bound. A queue may be stable yet too large to meet latency targets.
- `Capacity model` — A representation linking workload to resources, limits, and performance. It can be measured, analytical, or hybrid and should be validated against observed load curves.
- `Load curve` — Performance and resource behavior plotted as demand increases. It reveals saturation knees, throughput plateau, and latency/error escalation.
- `Concurrency curve` — Behavior as simultaneous work increases. It helps identify where more concurrency stops increasing throughput and starts increasing contention or queues.
- `Bottleneck migration` — A constraint shifting to another resource after an optimization or scale change. Remeasure the full path instead of assuming the original bottleneck remains.
- `Cost per request` — Infrastructure/operation cost divided by a defined completed request population. Include retries, idle reserve, dependencies, storage, and failures as appropriate.
- `Capacity reserve` — Resources held available for failover, burst, maintenance, or uncertainty. A reserve is useful only if it is reachable and its limits are tested.
- `Failover capacity` — Capacity available on alternate systems after a failure. It must account for all shifted demand and dependencies, not simply target-instance CPU.
- `Zone failure capacity` — The capacity remaining when a failure domain such as an availability zone is unavailable. Test whether remaining zones meet objectives at correlated peak load.
- `Degraded-mode capacity` — The demand a service can support while operating with reduced features or quality. Define which functions are shed and how correctness is preserved.

## Scaling and autoscaling constraints

- `Autoscaling signal` — A measured variable used to trigger scale changes, such as queue age, CPU, or concurrent requests. Choose a signal that predicts/reflects the constrained resource without reacting too late or too noisily.
- `Scale-out delay` — Time from a scale-out decision to useful added capacity, including detection, provisioning, startup, warmup, and readiness. Demand may exceed capacity during this interval.
- `Scale-up limit` — A maximum size or resource boundary for vertical scaling, imposed by service, hardware, quota, or cost. Beyond the limit, architecture or sharding may be required.
- `Cold-start capacity` — The ability to serve demand when new instances start without warm caches, JIT state, or established connections. Warm steady-state capacity does not cover startup bursts.
- `Resource request sizing` — Choosing CPU/memory requests used for scheduling and resource allocation. Under-requesting can destabilize placement; over-requesting reduces schedulable density.
- `Resource limit sizing` — Setting an enforced maximum for a resource such as memory or CPU. Limits protect shared infrastructure but can cause throttling or termination if sized below workload needs.
- `CPU throttling` — Runtime restriction of CPU execution due to quota or scheduler policy. It can raise latency even when host-wide CPU is not saturated.
- `Memory headroom` — Space between expected peak memory usage and the enforcement/host limit. Include runtime overhead, bursts, native memory, and dump/GC peaks.
- `Connection capacity` — The maximum usable concurrent connections across pools, proxies, and dependencies. Increasing one pool can exceed the server, file-descriptor, or network capacity elsewhere.
- `Database connection budget` — A shareable limit on concurrent database connections across services/instances. Allocate with total replica count, admin/recovery clients, and database limits in mind.
- `File descriptor limit` — The OS process limit for open files/sockets and related descriptors. High concurrency can exhaust it despite available CPU and memory.
- `Socket capacity` — The practical limit on concurrent/open network sockets and related kernel state. Ephemeral ports, file descriptors, NAT, and TIME_WAIT behavior can constrain it.
- `Rate limit capacity` — The allowed request rate for a service, tenant, or downstream dependency. Design thresholds and bursts around sustainable processing rather than advertised peak only.
- `Per-instance capacity` — Sustainable demand handled by one instance under defined workload/conditions. It can vary with affinity, cache, placement, and noisy neighbors.

## Decision criteria and continuous improvement

- `Performance acceptance criterion` — A pass/fail threshold such as p99 latency and error ratio under a stated workload. It should include duration, resource ceilings, and correctness.
- `Optimization hypothesis` — A testable prediction linking a change to a measured bottleneck and expected result. It prevents random tuning and defines what would disconfirm the idea.
- `Before-and-after profile` — Comparable profiling evidence collected before and after a change. Use the same workload, environment, duration, symbols, and capture configuration.
- `Optimization tradeoff` — A cost, complexity, reliability, security, maintainability, or latency consequence introduced by a performance change. Document what improved and what worsened.
- `Performance rollback criterion` — A measurable condition that triggers stopping or reversing a performance change. Set it before deployment and include correctness or resource regressions.
- `Production canary measurement` — Performance and reliability evidence from a small production population during a staged change. A canary needs representative traffic, guardrails, and a prompt abort path.
- `Capacity review cadence` — A scheduled review of assumptions, forecast, load tests, quotas, and headroom. Update it after major workload or architecture changes, not just annually.

# Cross-item comparison

| Scaling choice | Strength | Constraint to check |
| --- | --- | --- |
| Scale out | Adds parallel capacity and failure isolation | Coordination, state, startup, dependency and connection growth |
| Scale up | Adds resources to a single unit | Hardware/service ceiling, cost, failure blast radius |
| Autoscale | Adjusts capacity as measured demand changes | Detection/startup delay and signal choice |
| Capacity reserve | Absorbs burst/failure demand | Cost and whether it is truly available during correlated failure |

A request target should be linked to resources and dependency budgets. The maximum tested throughput is not sustainable throughput unless latency/errors remain within the acceptance criteria for a meaningful duration, with headroom and expected failure behavior.

# Examples

A service sustains 600 requests/second at the p99 target on 6 instances, or about 100 requests/second per instance under the tested mix. Planning a zone-loss case with two of three zones means remaining capacity must handle the full peak without exceeding database connection budget. If scale-out takes three minutes, a 30-second traffic spike must be absorbed by existing reserve, bounded queueing, or admission control; autoscaling cannot respond instantly. A load curve should test this scenario and record the failure margin.

After optimizing serialization, a before/after profile shows CPU per request decreased 18%, but p99 is unchanged and database pool wait rises. The change may improve cost but did not improve the user latency target; increasing replicas could worsen the database saturation. Report both outcomes and update the capacity model.

# Common mistakes

- Planning to average demand and ignoring peaks, burst correlation, or failures.
- Treating maximum tested throughput as a service commitment.
- Assuming autoscaling protects against demand during its startup delay.
- Ignoring aggregate database connections when adding app replicas.
- Counting N+1 capacity without testing a correlated zone failure and dependency limits.
- Optimizing CPU when latency is mostly queue or dependency wait.
- Accepting a canary because it has few errors despite insufficient representative traffic.
- Failing to set rollback criteria before a risky performance change.

# Knowledge checks with answers

1. How does sustainable throughput differ from maximum tested throughput? **It meets defined latency/error/correctness targets over a meaningful period with stated conditions; maximum tested is merely the highest point observed.**
2. Why does scale-out delay matter? **New capacity is unavailable while provisioning, startup, warmup, and readiness occur.**
3. What must a database connection budget include? **All service replicas/pools plus administration, recovery, and other clients relative to the database limit.**
4. What does N+1 capacity assume? **Loss of one specified unit while meeting a target under the modeled workload; it does not cover every correlated failure.**
5. Why measure cost per completed request? **It links resource expenditure to useful work and exposes retries, idle capacity, or failed operations.**

# Sources

[SRE implementing SLOs](https://sre.google/workbook/implementing-slos/) · [.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) · [Kubernetes resource management](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)
