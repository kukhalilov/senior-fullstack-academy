# performance profiling capacity and .NET diagnostics — Reference: Latency, throughput, workload profiles, statistical interpretation, and test types

# Scope and version

This lesson covers general performance measurement and workload terminology. The principles are vendor-neutral; OS profiler commands, test tool defaults, and statistical estimators vary. Current .NET tooling notes are dated 2026-11-20. Define a workload and acceptance criteria before interpreting measurements. [SRE SLO workbook](https://sre.google/workbook/implementing-slos/) [Flame graphs](https://www.brendangregg.com/flamegraphs.html)

# How this group fits the mental model

Performance data is meaningful only against a user requirement and a workload. Latency, throughput, and concurrency describe related but distinct properties. Tests control offered demand; profilers provide evidence about resource use. Noise, warmup, queueing, and load-generator behavior can change the conclusion.

# Supplied names explained

## Workload and demand model

- `Performance engineering` — The iterative practice of measuring performance requirements, locating constraints, changing a system, and verifying results. It balances latency, throughput, reliability, and cost rather than optimizing one score.
- `Performance requirement` — A measurable target such as p99 latency under a stated load or cost per completed operation. It includes scope, percentile, environment, and acceptance/failure conditions.
- `Workload model` — A description of request mix, arrival rate, concurrency, payloads, data size, dependencies, and user behavior used to test a system. It should represent the decision the benchmark is intended to support.
- `Representative workload` — A workload preserving the characteristics that drive system behavior for the production question. It need not copy all production traffic, but simplifications must be explicit.
- `Open-loop load test` — A test issuing arrivals according to a schedule independent of completion time. It exposes sustained offered demand and queue growth, but needs controlled backlog and generator capacity.
- `Closed-loop load test` — A test that starts new work as prior work completes. It models some user populations but can lower offered load as latency increases, hiding overload.
- `Coordinated omission` — Measurement bias when a generator delays issuing or recording work during a system stall, omitting the waiting time users would have experienced. Use tools and reporting that account for the intended arrival schedule.

## Time, volume, and resource measures

- `Latency` — Elapsed time observed between a defined request start and completion boundary. It includes queueing and waits inside that boundary.
- `Response time` — The duration seen for a request/response operation, commonly used as an end-to-end latency measure. State whether the client or server measures it and which parts of the path are included.
- `Service time` — Time actively spent processing work within a system boundary. It differs from response time when queueing or downstream waits occur.
- `Queueing delay` — Time work waits before a resource can serve it. A growing delay often signals arrival rate near/above capacity or an admission bottleneck.
- `Throughput` — Completed work per unit time, such as requests or jobs per second. State what counts as completed; accepted-but-later-failed work should not inflate success throughput.
- `Concurrency` — Number of operations simultaneously in progress. It is not the same as arrival rate; sustained latency growth can increase in-flight work.
- `Utilization` — Fraction of a resource’s capacity in use over a period. High utilization leaves little room for bursts, while low host utilization can coexist with throttling or a downstream bottleneck.
- `Saturation` — A state in which demand approaches or exceeds effective service capacity, often revealed by growing queues and waits. It is more informative alongside utilization than from a single percentage.
- `Tail latency` — The slow end of a latency distribution, commonly inspected with higher percentiles. A small affected fraction can still represent many customers at scale.
- `Latency distribution` — The distribution of individual observed durations over a defined workload and interval. It preserves information that a mean alone hides.
- `Percentile` — A rank statistic: the p-th percentile is a value at or below which approximately p percent of observations fall, subject to estimation method and sample size. It is not a per-request guarantee.
- `p50 latency` — The median observed latency. It describes a typical middle observation but can conceal a long tail.
- `p90 latency` — The 90th percentile latency. Its usefulness depends on window, sample count, and histogram resolution.
- `p95 latency` — The 95th percentile latency, showing slower requests than the median. Read it alongside traffic and errors.
- `p99 latency` — The 99th percentile latency, sensitive to rarer slow cases and low sample counts. It is not a guaranteed maximum.
- `Maximum latency` — The single slowest observed duration in the sample. It is highly sensitive to sample count, outliers, and test/runtime noise.
- `Mean latency` — Arithmetic average of observed durations. It can remain low while a small, important tail is very slow.

## Test timing and experiment types

- `Warm-up period` — A preliminary phase allowing JIT, caches, connection pools, and runtime state to approach the intended operating condition before measurement. Warmup policy should be repeated and documented.
- `Cold-start latency` — Latency measured when a process, instance, or component starts with cold runtime/cache state. It matters for scale-out and infrequent workloads and should be measured separately from steady-state.
- `Steady-state performance` — Behavior after transient startup effects settle under a stable representative workload. A steady state does not cover spikes, cold starts, or long-duration drift.
- `Microbenchmark` — A small controlled benchmark of a specific operation. It can compare implementation details but may not predict whole-application behavior or real data effects.
- `Macrobenchmark` — A broader test covering an application workflow or subsystem. It captures interactions but may make it harder to isolate a single cause.
- `Load test` — A test at expected or planned demand to validate behavior and service targets. It should include realistic mix and sufficient duration to expose queues and resource use.
- `Stress test` — A test beyond normal design load to find breaking points and failure behavior. Define safety boundaries and recovery expectations first.
- `Spike test` — A sudden demand increase used to observe burst handling, autoscaling delay, queues, and recovery. A sustainable average-load test cannot substitute for it.
- `Soak test` — A sustained test over time to expose leaks, fragmentation, queue accumulation, and drift. It needs realistic duration, telemetry, and bounded side effects.
- `Endurance test` — A long-running test evaluating sustained operation and resource stability. It overlaps with soak testing; define the specific endurance risk being assessed.
- `Capacity test` — A test estimating the maximum sustainable workload that meets acceptance criteria with stated headroom and environment. A peak before collapse is not automatically usable capacity.
- `Scalability test` — A test measuring how performance and cost change as resources, workload, or both increase. It can distinguish vertical scaling limits from efficiency or coordination costs.
- `Baseline benchmark` — A repeatable reference measurement for comparison. Record build, environment, workload, warmup, and statistical variation.
- `A/B performance comparison` — A controlled comparison of two implementations or configurations under equivalent conditions. Randomize or alternate order when drift and cache effects could bias results.
- `Benchmark noise` — Variation unrelated to the intended code change, from scheduling, thermal state, background tasks, network, JIT, or infrastructure. Repeated runs and confidence estimates help distinguish signal.
- `Confidence interval` — A range estimated to contain a parameter under a stated statistical model and confidence level. It is not a guarantee; the model and sample independence assumptions matter.
- `Variance` — A measure of spread of observations around their mean. High variance can reveal unstable performance and makes single-run comparisons unreliable.
- `Outlier` — An observation far from the typical pattern. Determine whether it is measurement error or a real user-facing event before discarding it.
- `Profiler overhead` — Execution or resource cost added by profiling. It can change the bottleneck or tail; measure overhead and compare the least intrusive evidence source.

## Profiling concepts

- `Sampling profiler` — A profiler that periodically records executing stacks and estimates where time/samples accumulate. It has lower perturbation than tracing every call, but may miss very short or rare operations.
- `Instrumentation profiler` — A profiler that instruments or hooks selected calls/events for detailed counts or timing. Added work can distort runtime behavior, so validate overhead.
- `Deterministic profiler` — A profiler that records each selected event/call rather than sampling. It can offer precise call data with potentially substantial perturbation and volume.
- `Flame graph` — A visualization of aggregated stack samples, with stack paths vertically and sample weight horizontally. Width is not a timeline; compare the selected metric and capture interval.
- `Call tree` — A hierarchical view of callers and callees and their measured cost. Inclusive and exclusive values answer different questions.
- `Hot path` — A call path or operation consuming a meaningful portion of the selected cost. It deserves optimization only if it matters to the user-facing workload.
- `Bottleneck` — A constrained resource or stage limiting throughput, latency, or capacity. It may move after an optimization and can involve queueing or dependency limits rather than CPU.
- `Amdahl's law` — A bound on overall speedup based on the fraction of work improved and the speedup of that part. It explains why a dramatic micro-optimization can have little end-to-end effect.
- `Little's Law` — The stable-system relationship `L = λW` between average work in system, throughput/arrival rate, and average time in system. Apply it to a consistent boundary and do not treat it as a capacity predictor during instability.

## Resource constraints and reproducibility

- `Resource saturation` — Demand pressing against effective resource capacity, often appearing as queueing, throttling, or wait time. Identify which resource and boundary are saturated before scaling.
- `Performance regression` — A measurable worsening against a relevant baseline or requirement. Define tolerance and statistical confidence to avoid treating noise as a regression.
- `Performance budget` — The allowed latency/resource/cost share assigned to a component or operation. Budgets make tradeoffs explicit and help identify where integration consumes the end-to-end target.
- `Performance test environment` — The hardware, runtime, OS, network, dependencies, quotas, data, and configuration used in a test. Differences from production can invalidate capacity conclusions.
- `Benchmark reproducibility` — The ability to repeat a benchmark with sufficiently controlled and documented conditions. Preserve source/build, workload, seeds, tool versions, and raw results.

# Cross-item comparison

| Test | Main question | Typical duration/pattern |
| --- | --- | --- |
| Load | Does expected demand meet targets? | Planned steady workload |
| Stress | Where/how does behavior break? | Increasing beyond design load |
| Spike | Can the system absorb sudden demand? | Abrupt step up/down |
| Soak/endurance | Does behavior drift or leak? | Sustained long run |
| Capacity | What sustainable rate meets criteria with headroom? | Controlled load curve |
| Scalability | How does cost/performance change with scale? | Multiple resource/workload points |

Open-loop testing controls offered arrivals; closed-loop testing controls active workers/users. Neither is inherently correct in all cases. A/B comparisons need equivalent workload and environment, and percentiles require sufficient observations. [SRE workbook](https://sre.google/workbook/implementing-slos/)

# Examples

Suppose a service completes 500 jobs/second and average time in its queue-plus-worker boundary is 0.4 seconds. Little’s Law estimates about 200 jobs in that boundary on average. If latency doubles at the same throughput, the average work in progress roughly doubles; investigate where it waits rather than assuming CPU work doubled.

For an API with p50=80 ms, p95=250 ms, p99=2 s, and mean=120 ms, the mean hides a long tail. Compare queue time, dependency timing, route mix, and sample counts around the slow observations. A maximum of 18 seconds from a single request should be investigated, not silently discarded, but repeated independent runs are needed to assess reproducibility.

# Common mistakes

- Reporting “requests per second” without saying successful, completed, or accepted work.
- Using only a mean or maximum to compare latency.
- Treating p99 as a guaranteed upper bound.
- Running load that is closed-loop and concluding the service handles the intended fixed arrival rate.
- Discarding outliers before determining whether they are real user impact.
- Comparing builds with different data, warmup, background load, or cache state.
- Calling a long run a soak test without monitoring leak/queue/GC drift.
- Treating microbenchmark gains as end-to-end improvement.
- Applying Little’s Law to an overloaded, changing, or inconsistent measurement boundary.

# Knowledge checks with answers

1. What does latency include that service time may not? **Queueing and waits within the measured end-to-end boundary.**
2. Why can a closed-loop load generator understate demand during slowdowns? **It waits for completions before issuing more work, so offered load falls as response time grows.**
3. Does p99 mean every request finishes within the value? **No; it is an estimated rank over observed samples and conditions.**
4. What distinguishes stress from capacity testing? **Stress explores behavior beyond design load/breaking points; capacity seeks sustainable workload meeting acceptance criteria with headroom.**
5. What does a flame graph width mean? **Aggregated stack sample weight, not chronological duration.**

# Sources

[SRE workbook: implementing SLOs](https://sre.google/workbook/implementing-slos/) · [Brendan Gregg flame graphs](https://www.brendangregg.com/flamegraphs.html) · [.NET diagnostics overview](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/)
