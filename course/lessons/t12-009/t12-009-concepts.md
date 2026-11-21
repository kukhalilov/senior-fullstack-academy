# End-to-end performance engineering for web applications — Core concepts and how they fit together

## Learning objectives

- Define a measurable performance goal for a user journey and workload.
- Read latency distributions, throughput, errors, resource use, and queue signals together.
- Connect browser, React, ASP.NET Core, EF Core, SQL Server, and dependency behavior.
- Choose an appropriate profiler or test method and interpret its limits.
- Validate an optimization with controlled before/after measurements and safe rollout.

## Prerequisites

Know request/response flow, React rendering, asynchronous .NET, EF Core/SQL basics, logs/metrics/traces, and load testing. A percentile gives a point below which that proportion of measured requests fall. A trace connects timed operations across a request path. A queue holds waiting work.

## Core concepts

### Define what “fast” means

Start with a user-visible journey, such as searching, viewing details, or completing checkout. State the population and device/network, workload arrival rate, payload/data shape, cache state, and failure conditions. Define measures at boundaries: p50/p95/p99 duration, throughput, error rate, LCP/INP, and resource/cost limits. SLOs make a service target measurable over a period; they do not prescribe one universal target.

An average hides tails. One slow dependency can dominate a small fraction of requests, especially with fan-out. A load generator that waits for one response before issuing the next can miss time during pauses (coordinated omission). Use an appropriate arrival model and state the tool’s measurement method.

### Follow the whole critical path

Browser time includes resource discovery, network, render-blocking CSS/JavaScript, main-thread work, React rendering, hydration, and interactions. Server time includes queueing, middleware, application CPU, serialization, and waiting for database or remote services. SQL time includes query execution and waits, but the caller may also wait for connection-pool capacity or network transfer. A distributed trace helps separate these intervals; do not add nested/overlapping durations as if they were sequential.

In .NET, async I/O can let a request thread return to the pool while waiting. It does not make CPU-bound serialization or computation faster. Sync-over-async, lock contention, thread-pool starvation, allocations, GC, connection pools, and queue growth can cause distinct symptoms. In React, use browser and React profiling to distinguish expensive committed render work from network and browser layout.

For EF Core and SQL Server, measure query count, returned rows/columns, actual plans, waits, and representative parameters. Reduce unnecessary round trips and data first. Indexes, projection, pagination, and query shape often matter more than ORM overhead. Compiled queries or context pooling target narrower costs and should follow evidence.

### Treat queues and retries as part of latency

Under load, queue wait can become larger than service time. Retries multiply requests; unbounded queues retain work that may miss its useful deadline. Set end-to-end deadlines and allocate smaller time budgets to dependencies. Use bounded queues, admission control, load shedding, and bulkheads where appropriate. Keep retries bounded and jittered, and make repeated side effects safe through idempotency. Autoscaling has delay and cannot instantly solve every overload.

### Optimize as an experiment

State a hypothesis: “Projecting only needed columns will lower transferred bytes and SQL work for this route.” Choose evidence that can disprove it. Record baseline, workload and cache state. Change one material factor, re-run, and check user latency, throughput, errors, CPU/memory, database cost, and correctness. A gain in one metric can move the bottleneck or increase another cost.

## Mechanisms and relationships

Use browser performance traces for resource/render timing, React Profiler for React commits, .NET counters/traces/profiles for runtime behavior, EF logging for generated commands, SQL plans/waits/Query Store for database behavior, and distributed traces for cross-service critical path. Use microbenchmarks for isolated operation costs, load tests for system behavior under a modelled workload, and RUM for real user distributions. No one instrument covers every layer.

## Worked examples

### Slow list endpoint

If SQL returns 100,000 rows to render 50, first paginate and project fields. Inspect actual plan and round trips. Then profile serialization and payload size. Do not start with compiled queries if row transfer dominates.

### High tail latency

If p50 is stable but p99 rises while a dependency queue grows, inspect dependency waits, fan-out, retry count, and thread-pool queue. Averages and CPU alone may miss a saturated connection pool or slow remote tail.

## Misconceptions and edge cases

- “Async makes the endpoint faster.” It can improve thread utilization during waits; it does not reduce CPU service time by itself.
- “A low average means users are fine.” Tail latency and error rate can be poor.
- “More cache is always faster.” Cache introduces stale data, invalidation, memory pressure, and stampede risks.
- “The ORM is slow.” First determine SQL shape, round trips, rows, network, and database waits.
- “A benchmark result is production capacity.” It depends on workload, environment, concurrency, data, and measurement method.
- “A CPU profile shows the whole request.” It may omit time spent waiting on I/O or queues.
- “More concurrency always increases throughput.” It can increase contention and queueing after saturation.

## Knowledge checks with answers

1. Why measure p95/p99 as well as average? Tail behavior can degrade while the average remains stable.
2. What does a React Profiler not measure? Complete network and server duration.
3. Why bound retries? They can amplify load and delay recovery during dependency failure.
4. What is the first EF/SQL investigation? Query shape, rows/columns, round trips, actual plan, parameters, and waits.
5. How do you prove an optimization helped? Comparable before/after workload and boundaries, with user and resource measures plus safe rollout.

### Sources

- [.NET performance best practices](https://learn.microsoft.com/en-us/aspnet/core/performance/performance-best-practices?view=aspnetcore-11.0)
- [EF Core performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis)
- [SQL Server performance monitoring](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitor-and-tune-for-performance?view=sql-server-ver17)
- [React Profiler](https://react.dev/reference/react/Profiler)
- [Google SRE: Handling overload](https://sre.google/sre-book/handling-overload/)
