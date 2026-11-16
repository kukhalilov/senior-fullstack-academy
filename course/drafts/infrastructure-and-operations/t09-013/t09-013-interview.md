# performance profiling capacity and .NET diagnostics — Interview questions and reasoning

# Core questions

1. **How do you approach an unexplained p99 latency regression?**
2. **What is the difference between latency, service time, throughput, and concurrency?**
3. **What is coordinated omission, and how can it distort a load test?**
4. **When would you use an open-loop rather than closed-loop load test?**
5. **What does a CPU flame graph show, and what does it not show?**
6. **How do you distinguish high allocation rate from a memory leak?**
7. **Which .NET diagnostic tool would you start with for high CPU, thread-pool starvation, and retained heap?**
8. **What is EventPipe and how does it differ from OS profiling?**
9. **Why might `dotnet-counters` show different runtime metrics across .NET versions?**
10. **How do CPU quota and host CPU utilization relate in a container?**
11. **What does Little’s Law tell you?**
12. **How do you define sustainable throughput?**
13. **What should capacity planning include for a zone failure?**
14. **How do you make a before/after performance comparison trustworthy?**
15. **What risks come with collecting process dumps or traces?**

# Concise interview answers

1. Confirm the symptom and workload; compare latency distribution, offered/completed throughput, errors, resource saturation, and dependency timing; form a hypothesis; capture the least intrusive relevant evidence; change one factor and rerun the same workload.
2. Latency is end-to-end elapsed time, service time is active work, throughput is completed work per time, and concurrency is simultaneous work in progress. Queueing and dependency waits can increase latency without increasing CPU service time.
3. Coordinated omission occurs when a generator does not record requests that should have arrived during a stall. It understates tail latency. Use an arrival model and measurement tool that accounts for intended arrivals.
4. Open-loop is useful when arrivals are independent of response completion, especially bursts and fixed offered rate. Closed-loop models users/workers that wait for completion, but may hide overload as offered rate declines.
5. A flame graph aggregates stack samples and their selected weight. It is not a timeline or a full record of every call; width, sampling, interval, and metric determine interpretation.
6. Compare allocation rate and GC activity with post-collection managed heap and root paths. Stable retained heap with high churn suggests allocation pressure, not necessarily a leak; working set may also be native memory.
7. High CPU: bounded `dotnet-trace` sample; starvation: counters and thread stacks/trace; retained managed heap: `dotnet-gcdump`; full thread/lock/native analysis may require a process dump and analysis.
8. EventPipe is a cross-platform .NET runtime event mechanism, used by `dotnet-trace` and related tools. OS profiling adds system scheduling, syscalls, native library, or kernel evidence and often different privileges.
9. .NET 9+ exposes the `System.Runtime` meter; .NET 8 and earlier do not and `dotnet-counters` falls back to EventCounters.
10. A cgroup CPU quota can throttle the container while the host still has idle CPU. Inspect target-level throttling and quota rather than only host utilization.
11. For a stable system and consistent boundary, average work in system equals throughput/arrival rate times average time in system (`L=λW`). It helps check queues/concurrency but does not identify a bottleneck.
12. The rate maintained for a meaningful duration while meeting latency, error, correctness, and resource criteria with stated workload and headroom.
13. Peak and correlated demand, surviving-zone capacity, dependencies, database connections, autoscale/traffic-shift delay, cache warmup, network/storage limits, and a tested failure scenario.
14. Fix workload, environment, build/runtime, warmup, cache, duration, and capture configuration; repeat runs, compare distributions and confidence, and change one material variable.
15. Artifacts can pause or burden the process, consume disk, and contain credentials/customer data. Bound collection, restrict access/transfer, set retention, and remove securely.

# Deep follow-up answers

## What is your profiling workflow for a slow .NET service?

Start with a reproducible workload and baseline: p50/p95/p99, throughput, errors, CPU/throttling, allocation, GC, ThreadPool queue, working set, and dependency timing. If CPU is a candidate, take a short EventPipe sample in the slow interval; use OS profiling if native/kernel cost is suspected. For memory, distinguish allocation churn from retained managed objects and native memory before choosing a GC dump or process dump. Inspect symbols and target version, record overhead, formulate one change, then repeat identical conditions and compare user outcomes and resource cost.

## Why is “CPU is 100%” not enough to recommend more replicas?

The measurement may be host, process, or container normalized; the container may be throttled; the bottleneck could be a single-threaded path, lock, or downstream dependency; more replicas may exceed connection/database limits or increase coordination. Determine sustainable per-instance throughput and dependency headroom under the target load before scaling.

## How do you plan for peak and failover capacity?

Model peak and burst demand, growth, service objectives, per-instance load, failure-domain loss, autoscale and warmup delay, connection/file/socket budgets, and downstream dependencies. Maintain explicit headroom and test the loss scenario under realistic correlated demand. State assumptions and uncertainty; do not equate maximum tested throughput with a guarantee.

## What is the difference between a trace and a profile?

A trace records timestamped events/operations and can expose the timeline of work and waits; a profile samples or records resource usage such as CPU stacks or allocations across an interval. They answer different questions and can be correlated, but neither is automatically a complete execution history.

## How do you decide whether an optimization is successful?

Compare the user metric tied to the requirement and the intended resource metric under equivalent conditions. A CPU reduction without latency improvement may still reduce cost, but it has not met a latency goal. Check correctness, error rates, tail, resource headroom, and whether the bottleneck moved. Define rollback criteria and preserve the tradeoff decision.

# Scenario questions

## Scenario: CPU is moderate but p99 is 5 seconds

Inspect queueing, thread-pool queue and stacks, database/HTTP connection pool waits, dependency spans, lock contention, retries, and storage/network delays. Compare service time versus total latency; do not assume a CPU optimization helps.

## Scenario: working set grows, GC heap remains flat

Investigate native allocation, mappings, stacks/thread growth, runtime/JIT, and page residency. Use OS/process diagnostics or a suitable dump; a managed heap snapshot may not explain the growth. Protect the artifact.

## Scenario: throughput stops increasing while latency and queue depth rise

The system is at or above a bottleneck. Examine load curve, completion versus offered rate, saturation, and dependency capacity. Apply bounded admission/backpressure or add capacity at the actual constraint; then rerun with a defined target.

## Scenario: a benchmark shows a 20% improvement on one run

Repeat and control order/environment, inspect variance/confidence, ensure the workload is representative and the measurement isn’t coordinated-omission biased, and validate the relevant user metric. Do not claim a general improvement from one noisy run.

# Tradeoffs and alternatives

Sampling is less intrusive and estimates hot paths; instrumentation can be more precise but perturb timing. EventPipe provides portable .NET runtime evidence; OS tools provide kernel/native detail at higher platform/privilege complexity. GC dumps inspect managed heap; process dumps inspect broader state and carry higher size/sensitivity risk. Scale out adds parallelism but grows state coordination and dependency connections; scale up is simpler until its physical/service ceiling. Open-loop preserves offered demand; closed-loop can model waiting users.

# Common weak answers

- “Optimize the slowest method.” It may not dominate the critical path.
- “High memory means a leak.” It could be native memory, cache, or expected working set.
- “Just add threads/replicas.” It may worsen contention and dependency saturation.
- “p99 is the maximum.” It is a rank statistic and depends on sample size/method.
- “CPU profile is a request trace.” A flame graph aggregates stack samples, not a timeline.
- “Load test passed at 2,000 RPS.” It omits workload, success criteria, duration, errors, and headroom.
- “A green host CPU means the container is not CPU-bound.” Quotas can throttle independently.
- “The dump is safe to send to a public issue.” It may contain sensitive process memory.

# Self-check rubric

Score 0 (cannot explain), 1 (partial), or 2 (clear and evidence-based):

- I state a workload and measurable performance requirement before profiling.
- I separate latency, service time, queueing, throughput, concurrency, and saturation.
- I recognize coordinated omission, test noise, and warm/cold-state differences.
- I match .NET counters, traces, GC dumps, process dumps, and stacks to hypotheses.
- I distinguish managed heap from process working set and allocation churn from retention.
- I account for container throttling and dependency capacity.
- I define sustainable throughput, headroom, and failure capacity.
- I protect diagnostic artifacts and repeat before/after comparisons.

Below 12 suggests revisiting performance measurement and .NET diagnostic reference lessons; 12–14 indicates good troubleshooting fundamentals; 15–16 indicates strong interview readiness with version/platform details still verified against the target runtime.

# Sources

[.NET diagnostics](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/) · [EventPipe](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/eventpipe) · [dotnet-counters](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-counters) · [dotnet-trace](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/dotnet-trace) · [SRE implementing SLOs](https://sre.google/workbook/implementing-slos/)
