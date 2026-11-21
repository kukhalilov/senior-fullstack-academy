# End-to-end performance engineering for web applications — Interview questions and reasoning

## Core questions

1. How do you start investigating a slow feature?
2. What is the difference between latency and throughput?
3. Why measure percentiles instead of only average latency?
4. How do browser, React, ASP.NET Core, EF Core, and SQL Server measurements fit together?
5. When does async improve .NET performance, and when does it not?
6. How do you decide whether a cache or index is appropriate?
7. How do you prove an optimization is safe and useful?

## Concise interview answers

1. Define user journey, workload, target, baseline, and failure conditions; then locate the critical path with traces and profiles.
2. Latency is time per operation; throughput is completed work per time.
3. Averages can hide slow tails that users experience, especially with fan-out and queues.
4. Browser tools measure resource/render/interaction work; traces cross service boundaries; runtime profiles show CPU/allocation; EF/SQL evidence explains queries and waits.
5. Async improves thread utilization while awaiting I/O; it does not make CPU-bound work faster.
6. Use evidence. An index has read benefit and write/storage cost; a cache trades repeated work for freshness and invalidation complexity.
7. Compare equivalent workloads before and after, include user and resource/correctness measures, then canary with a rollback threshold.

## Deep follow-up answers

Performance is an end-to-end property. Define p95/p99 and throughput with a workload population, request mix, data shape, cache state, and time window. Trace a representative slow request and avoid double-counting nested spans. For a browser page, separate LCP/INP from API latency. For .NET, distinguish CPU, allocations/GC, blocking, ThreadPool scheduling, connection-pool waits, serialization, and dependency time. For EF/SQL, inspect query count, rows, plans, parameters, waits, and round trips. Under overload, queue wait and retries can dominate even when CPU seems moderate.

Choose a bounded intervention that targets the measured bottleneck. Caching needs a freshness and invalidation policy; indexes increase write and storage costs; concurrency can worsen contention; compression saves network bytes at CPU cost. Test with comparable data and load, then watch errors, tails, capacity, and cost in a canary.

## Scenario questions

1. The endpoint average is 100 ms but p99 is 4 s. What evidence do you gather?
2. SQL plan looks good but endpoint latency is high. How do you check pool waits, network, serialization, and downstream calls?
3. React has frequent commits but users do not report slowness. Should you memoize? Explain your measurement threshold.
4. An optimization lowers p95 but doubles memory use. How do you decide whether to ship?
5. A cache improves latency but occasionally returns stale authorization data. What should change first?

## Tradeoffs and alternatives

Benchmark isolated code for operation cost; load-test the system for queues and saturation; use RUM for actual user distributions. Add cache only when repeated work and staleness policy justify it. Use a database index when query evidence supports it and write cost is acceptable. Use streaming for bounded producer/consumer flow, or durable background work when the user need not wait synchronously. Profile before adding complexity.

## Common weak answers

- “The database is slow” without a plan, wait, or timing trace.
- “Async makes it faster” without distinguishing I/O wait from CPU work.
- “We improved performance by 40%” without workload, percentile, baseline, or measurement method.
- “Add Redis” without a key, freshness, invalidation, or failure policy.
- Optimizing React render counts without measuring commit cost or user experience.
- Raising retries, queues, or connection limits without considering load amplification.

## Self-check rubric

Score 0–2 each: (0) assertion without evidence, (1) identifies tools/components, (2) defines a user metric and workload, traces the relevant path, explains tradeoffs, validates correctness/capacity, and plans safe rollout. Strong answers name what evidence would disprove their hypothesis.

### Sources

- [Google SRE: Implementing SLOs](https://sre.google/workbook/implementing-slos/)
- [ASP.NET Core performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices?view=aspnetcore-11.0)
- [EF Core performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis)
- [SQL Server performance monitoring](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitor-and-tune-for-performance?view=sql-server-ver17)
- [React Profiler](https://react.dev/reference/react/Profiler)
