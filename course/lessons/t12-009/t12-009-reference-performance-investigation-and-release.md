# End-to-end performance engineering for web applications — Reference: Profile, experiment, and safely ship improvements

## Scope and version

Tools and metric names change by runtime and platform. Use current documentation for the target release and protect sensitive production data collected during diagnostics.

## How this group fits the mental model

A profile is an observation tool. It shows where a particular workload spent resources; it is not by itself proof that a proposed change improves users. Establish a baseline, test a hypothesis, and measure comparable behavior after the change.

## Supplied names explained

- `Symptom hypothesis measurement loop` — State the symptom, form a falsifiable explanation, collect targeted evidence, make a bounded change, and repeat measurement.
- `Browser performance waterfall` — Shows navigation/resource sequence, timing, cache, and protocol clues. Pair it with rendering and main-thread traces.
- `.NET CPU and allocation profile` — Samples or records runtime CPU stacks and allocation behavior. It may not show time blocked on external I/O; correlate with traces and counters.
- `Database wait and plan evidence` — Waits, plans, runtime statistics, and query history help separate blocking, scans, estimation, and resource pressure. Capture evidence with bounded overhead and permissions.
- `Baseline and controlled comparison` — Record a stable pre-change result and compare under materially equivalent conditions. Repeat measurements to account for noise.
- `Representative test data` — Data volume, distribution, cardinality, skew, and parameter values should resemble the target workload. Empty or uniform data can select different plans.
- `Load test versus benchmark` — A benchmark measures an operation under a controlled environment; a load test measures system behavior under concurrent offered work. Neither automatically predicts real users.
- `Load stress spike and soak test` — Load tests evaluate expected demand; stress tests exceed capacity to discover limits; spike tests change demand abruptly; soak tests run long enough to reveal leaks or degradation.
- `Flame graph interpretation` — A folded stack visualization summarizes sampled stack frequency. Width is sample share, not necessarily wall-clock duration; distinguish inclusive and exclusive time and understand the profiler’s sampling method.
- `Before-and-after confidence interval` — A range expressing uncertainty around an estimated change under a stated method. Do not claim significance from two noisy single runs.
- `Canary performance monitoring` — Release to a limited cohort and compare performance/error/resource signals with a control or prior cohort before expanding.
- `Regression threshold and rollback` — A predeclared unacceptable change in user or system measures that triggers investigation, pause, or rollback. Choose based on product impact and measurement noise.
- `Cost per successful request` — Resource or financial cost divided by successfully completed useful operations. It can reveal optimizations that reduce latency by using disproportionate resources.
- `Privacy-safe telemetry` — Collect only necessary data, avoid secrets and personal content, control retention/access, and use bounded-cardinality labels.

## Cross-item comparison

Profiles explain resource use; traces explain cross-boundary time; load tests exercise capacity; synthetic tests provide repeatability; RUM and canaries show user impact. Use each for the question it can answer.

## Examples

Before changing JSON serialization, record CPU profile, allocation rate, payload sizes, p95/p99, and throughput under representative concurrency. After a controlled change, compare the same metrics and verify error behavior and memory. Canary the deployment; roll back if user latency or cost crosses the planned threshold.

## Common mistakes

- Comparing runs with different payload, cache, concurrency, or host conditions.
- Interpreting flame graph width as exact end-to-end time.
- Capturing production dumps/traces without access and privacy controls.
- Treating a local microbenchmark as proof of production capacity.

## Knowledge checks with answers

1. What does a profile establish? Resource behavior for a specific observed workload, not universal performance.
2. Why can a load test differ from a benchmark? It exercises concurrent system interactions and queues.
3. What makes a canary useful? It limits exposure and compares actual release behavior before full rollout.

### Sources

- [.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/)
- [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace)
- [SQL Server monitor and tune](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitor-and-tune-for-performance?view=sql-server-ver17)
- [Brendan Gregg: Flame Graphs](https://www.brendangregg.com/flamegraphs.html)
- [Google SRE: Implementing SLOs](https://sre.google/workbook/implementing-slos/)
