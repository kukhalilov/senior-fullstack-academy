# performance troubleshooting monitoring waits and query tuning — Reference: CPU, I/O, memory, concurrency, and capacity diagnosis

# Scope and version

SQL Server 2025 (17.x) is the current scope. This catalog is bounded to the exact inventory names below. DMV permissions, counter scope, and feature eligibility vary by object/version; use the linked specific documentation for the target build.

# How this group fits the mental model

A bottleneck is a constrained resource relative to a workload, not just a metric with a large number. Link the user symptom to query-level work, wait mechanism, and shared resource before selecting a remedy.

# Supplied names explained

- `CPU saturation` — A sustained lack of runnable CPU capacity relative to demand, shown through OS and SQL scheduler evidence. High CPU in one query differs from instance saturation; inspect CPU per operation and concurrency.

- `High logical reads` — Many buffer-pool page accesses, which consume CPU and memory bandwidth even when no storage read occurs. Often points to excessive rows/pages processed or repeated lookups, not necessarily slow disks.

- `Physical read latency` — Time to fetch pages from storage into SQL Server buffers. Correlate file-level deltas and PAGEIOLATCH waits with I/O volume, storage contention, and query read patterns.

- `Transaction-log write latency` — Delay in flushing committed log records. Measure log-file write deltas and WRITELOG waits; causes include storage latency, high commit frequency, and log-path contention.

- `Memory pressure` — Competition for memory across buffer cache, query execution grants, OS, and other consumers. Distinguish page-read churn from grant starvation and external OS pressure.

- `Memory grant wait` — A query waits to receive workspace memory for memory-intensive operators such as sorts or hashes; inspect waiting and granted requests alongside plan estimates and concurrency.

- `RESOURCE_SEMAPHORE` — Wait indicating a query is queued for a query execution memory grant. Find which requests hold or request grants and reduce excessive estimates/work before indiscriminately increasing memory.

- `PAGEIOLATCH wait` — A task waits for a data/index page read into the buffer pool. It can reflect slow storage, but also excessive physical reads; inspect file latency and query read volume together.

- `WRITELOG wait` — A task waits for transaction log flush completion. Relate wait time to log-device latency, commit rate, transaction size, and durability requirements.

- `SOS_SCHEDULER_YIELD wait` — A worker yields its scheduler after consuming its quantum. High signal can indicate CPU pressure or CPU-intensive work; confirm runnable queues, CPU use, and query cost before changing settings.

- `CXPACKET wait` — Parallel exchange wait associated with producer threads in current SQL Server versions. SQL Server 2022+ tracks exchange synchronization using additional CXSYNC_* waits; older builds grouped some synchronization under CXPACKET. It is not automatically harmful: inspect build, plan, skew, CPU, and duration. [Wait-type version notes](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-wait-stats-transact-sql?view=sql-server-ver17)

- `CXCONSUMER wait` — Wait associated with consumer threads in parallel exchanges, commonly expected coordination. SQL Server 2022+ has additional CXSYNC_* categories; evaluate version, plan shape, and skew rather than treating counts as a standalone defect. [Wait-type version notes](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-wait-stats-transact-sql?view=sql-server-ver17)

- `THREADPOOL wait` — A request cannot obtain a worker thread. Investigate worker exhaustion, blocking chains, excessive concurrency, long requests, and connection/request patterns; increasing worker limits alone may not fix the cause.

- `Lock blocking` — A transaction holds a lock needed by another request. Identify the blocker and chain, transaction age, lock resource, and application transaction scope; distinguish blocking from deadlock cycles.

- `Deadlock frequency` — Rate of cyclic lock/resource dependencies that SQL Server resolves by aborting a victim. Capture deadlock graphs and identify competing access order or transaction design.

- `Tempdb contention` — Competition for tempdb allocation, metadata, or I/O resources. Separate in-memory latch contention from physical I/O and spills, then use evidence to choose configuration or query changes.

- `Tempdb spill` — A sort/hash or similar operation writes intermediate work to tempdb, often because memory grant or cardinality estimates were insufficient. Inspect plan warnings, rows, and grant feedback; spills are symptoms, not an automatic mandate to add memory.

- `Connection-pool exhaustion` — The application cannot obtain a pooled connection promptly, often due to long-held connections, leaked disposal, slow operations, or pool configuration. It can look like a database outage while SQL Server has capacity.

- `Compilation storm` — A burst of simultaneous query compilation consumes CPU and locks/resources, often due to ad hoc variation or recompilation. Inspect compile rate and query text patterns; parameterization and SQL Server 2025 OPTIMIZED_SP_EXECUTESQL may be relevant with appropriate workload testing.

- `Parameter-sensitive regression` — A cached plan suits some parameter values but performs poorly for others because selectivity differs. Compare parameter cohorts and plan history; options include query redesign, PSP/OPPO eligibility, or carefully tested mitigation.

- `Long-running transaction` — A transaction remains open while doing work or waiting, retaining locks and log state and potentially delaying cleanup. Find its owner and lifecycle before killing it, which causes rollback work.

- `Storage throughput limit` — The storage path is saturated in operations, bandwidth, or latency for the workload. Measure data and log paths separately and correlate queueing and workload demand; a product specification alone does not establish usable throughput.

- `Queueing delay` — Time work spends waiting for a constrained resource, which rises sharply as utilization approaches capacity. Include queue and service time when explaining observed response time.

- `Little's Law workload estimate` — For a stable system, average work in the system L equals arrival rate lambda times average time in the system W. It provides a consistency check for concurrency and latency, not a causal diagnosis or a tail-latency formula.

- `Tail latency` — Slow-end response behavior, commonly reported with p95 or p99 rather than only an average. It can worsen from rare waits, queueing, skew, retries, or outliers even while the mean looks acceptable.

- `Baseline comparison` — Comparison with a representative prior window under similar traffic, data shape, configuration, and cache conditions. Record restart/reset boundaries and avoid treating unlike workloads as a controlled comparison.

- `Regression detection` — Identifying a statistically and operationally meaningful degradation against a defined baseline, segmented by query, parameter, workload, and time. Confirm signal before changing production.

# Cross-item comparison

These items answer different points in the evidence chain. Live DMVs describe transient requests/tasks; cumulative DMVs describe a counter window; Query Store persists interval history; Extended Events capture selected event timelines; OS counters add shared-system context. Within each family, correlate scope and lifetime before combining values. A plan forcing or tuning recommendation is a mitigation decision after comparison, not raw diagnostic evidence.

# Examples

```text
Observation: endpoint p95 rose from 180 ms to 900 ms; request rate is stable.
Evidence: SQL requests show PAGEIOLATCH waits and a 3x increase in logical reads.
Hypothesis: the endpoint now processes more pages; storage latency alone is not yet established.
Next: compare query plan/parameter cohort and file-level I/O deltas for the same interval.
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

1. Does `PAGEIOLATCH` distinguish slow storage from excessive reads? **No; both evidence classes matter.**
2. What does `RESOURCE_SEMAPHORE` signify? **A query is waiting for an execution memory grant.**
3. Is `CXCONSUMER` always actionable as a defect? **No; interpret parallel coordination with plan behavior and skew.**
4. Are application pool exhaustion and `THREADPOOL` the same? **No; one is in the client pool, the other is SQL Server worker availability.**

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
