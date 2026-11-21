# performance troubleshooting monitoring waits and query tuning — Reference: Controlled tuning, regression safety, and verification

# Scope and version

SQL Server 2025 (17.x) is the current scope. This catalog is bounded to the exact inventory names below. DMV permissions, counter scope, and feature eligibility vary by object/version; use the linked specific documentation for the target build.

# How this group fits the mental model

Tuning is a controlled experiment. The reference items describe a measurement discipline and common interventions; none guarantees success without representative validation.

# Supplied names explained

- `Reproduce representative workload` — Recreate realistic query mix, concurrency, parameter distribution, data size, and arrival pattern. A single query in isolation can miss contention and queueing effects.

- `Capture query and plan baseline` — Store query identity, plan, runtime distributions, CPU, reads, waits, parameter cohort, configuration, and observation window before change so later comparisons have context.

- `Change one factor at a time` — Make a bounded change with a hypothesis and rollback route, then measure it under comparable conditions. Multiple simultaneous changes make causation and regression attribution difficult.

- `Query Store plan comparison` — Compare plan versions and interval-level runtime measures for the same query, including execution count and resource use; account for context settings and changing parameter mix.

- `Index change impact` — Evaluate read improvement against added storage, write amplification, maintenance, concurrency, and plan effects across all important queries, not just the motivating statement.

- `Statistics update decision` — Update statistics when stale or misleading distribution data plausibly drives a bad estimate, after inspecting modification and sampling context. Updates can trigger recompilation and do not guarantee a better plan.

- `Parameter-sensitive mitigation` — Choose mitigation after measuring parameter cohorts: query shape, indexes/statistics, PSP/OPPO eligibility, recompile, or hints may fit different cases. Validate plan stability and compile cost.

- `Query hint rollback plan` — Document the hint scope, expected effect, monitoring criteria, expiry/review date, and exact reversal. Hints constrain optimizer choices and can become harmful as data and engine versions change.

- `MAXDOP configuration boundary` — Controls maximum parallel worker use for a query or configuration scope; it is not a universal CPU throttle. Tune using topology, workload, parallel plans, and Microsoft guidance for the current SQL Server release.

- `Cost threshold for parallelism` — Estimated optimizer cost threshold for considering parallel plans, not a millisecond duration or direct CPU limit. The best value depends on workload; raising it changes plan choices and must be tested.

- `Batch-size reduction` — Smaller transactions can reduce lock duration, log bursts, and memory/resource spikes, but increase round trips and overhead. Measure a batch-size curve rather than assuming smaller is always better.

- `Application timeout diagnosis` — A client timeout is an observation at the application boundary, not proof SQL Server stopped work. Correlate request, cancellation behavior, retries, server execution, and pool occupancy.

- `Connection pooling diagnosis` — Inspect pool wait time, connection lifetime/disposal, concurrency, per-connection settings, and server session state. Pool saturation and server worker starvation are distinct queues.

- `Capacity headroom` — Unused capacity under expected peak and failure conditions, measured for the limiting resource. Capacity planning includes growth, concurrency, operational jobs, and failover margin.

- `Before-and-after measurement` — Compare the same outcomes under equivalent workload and configuration, using distributions and normalized resource cost; account for cache warmup, background activity, and counter resets.

- `p50 latency` — Median response time: half of measured requests complete no slower and half no faster. It describes typical behavior but can hide tail degradation.

- `p95 latency` — The 95th percentile response time: 95% of observations are no slower, while 5% are slower. Sample size, window, and workload segmentation matter.

- `p99 latency` — The 99th percentile response time, sensitive to rare slow events and requiring enough observations for a stable estimate. Track it with throughput and error rate.

- `Throughput per second` — Completed useful operations per unit time. Higher request arrival rate is not higher successful throughput if queues, failures, or retries grow.

- `Logical reads per operation` — Buffer-pool pages touched by a representative operation, a useful normalized measure of work independent of whether pages came from storage during that execution.

- `CPU time per operation` — CPU consumed per completed business operation, useful for comparing efficiency while controlling for throughput and query mix.

- `Rollback and mitigation plan` — Predefine how to reverse the change, restore prior settings/plans, or route traffic away, and name measurable triggers and decision ownership.

- `Canary validation` — Expose a small controlled portion of traffic to the change and compare it with a control group while monitoring errors, latency tails, and resource costs.

- `Load test workload realism` — A load test should approximate production data volume, parameter distribution, concurrency, think time, arrival bursts, and background work; unrealistic tests can rank changes incorrectly.

# Cross-item comparison

These items answer different points in the evidence chain. Live DMVs describe transient requests/tasks; cumulative DMVs describe a counter window; Query Store persists interval history; Extended Events capture selected event timelines; OS counters add shared-system context. Within each family, correlate scope and lifetime before combining values. A plan forcing or tuning recommendation is a mitigation decision after comparison, not raw diagnostic evidence.

# Examples

```text
Hypothesis: candidate covering index reduces reads for one measured endpoint.
Control: replay the same parameter distribution and concurrent write mix.
Guardrails: p99, successful throughput, CPU/operation, logical reads/operation, write latency.
Decision: retain only if user impact improves without violating workload guardrails.
```

The code is a diagnostic pattern, not a claim that it was executed against your server. Grant only the permissions needed for the target DMVs. For actual tuning, record the workload, build, interval, and output alongside the result.

# Common mistakes

- Reading cumulative counters as if they represented the incident window.
- Assigning root cause from one wait type, missing-index suggestion, or average.
- Comparing plan or file counters from different reset periods.
- Collecting broad event streams indefinitely, or treating a bounded ring buffer as permanent history.
- Forcing a plan or changing parallelism without a verification and removal path.
- Declaring a win from one isolated query while ignoring p95/p99, throughput, writes, and other query regressions.

# Knowledge checks with answers

1. Why replay realistic concurrent writes for an index test? **Indexes add write and storage costs that a read-only test misses.**
2. What complements p95 when checking a release? **p50/p99, errors, successful throughput, and normalized CPU/reads.**
3. Why define rollback triggers first? **They make the response to a harmful canary measurable and quick.**
4. Why change one factor? **To attribute observed outcomes to the intervention.**

# Sources

- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitor-and-tune-for-performance?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/system-dynamic-management-views?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-wait-stats-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-requests-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-sessions-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-query-stats-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-sql-text-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-query-plan-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-waiting-tasks-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-io-virtual-file-stats-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-index-usage-stats-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-missing-index-details-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/how-query-store-collects-data?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/tune-performance-with-the-query-store?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/manage-the-query-store?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-for-secondary-replicas?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/extended-events/extended-events?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/extended-events/quick-start-extended-events-in-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance-monitor/use-sql-server-objects?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/database-engine-tuning-advisor?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/sql/database-engine/performance/troubleshoot-slow-running-queries)
- [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/sql/database-engine/performance/troubleshoot-sql-io-performance)
- [Microsoft Learn](https://learn.microsoft.com/en-us/troubleshoot/sql/database-engine/performance/troubleshoot-memory-grant-issues)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/databases/tempdb-database?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-usage-scenarios?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-schedulers-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-sys-info-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-performance-counters-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-query-memory-grants-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-procedure-stats-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-cached-plans-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-task-space-usage-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-db-session-space-usage-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-query-store-force-plan-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/system-stored-procedures/sp-query-store-unforce-plan-transact-sql?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/extended-events/use-the-system-health-session?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/configure-the-cost-threshold-for-parallelism-server-configuration-option?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/database-engine/configure-windows/configure-the-max-degree-of-parallelism-server-configuration-option?view=sql-server-ver17)
