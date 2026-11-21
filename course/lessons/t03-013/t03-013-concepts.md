# performance troubleshooting monitoring waits and query tuning — Core concepts and how they fit together

# Learning objectives

- Turn an imprecise performance complaint into a bounded, testable question.
- Distinguish a current wait from accumulated wait history and query-attributed evidence.
- Build a timeline from application latency, Query Store, DMVs, and targeted events.
- Test a remedy with representative traffic and a reversible deployment.

# Prerequisites

Understand query plans, indexes/statistics, transactions, connection pools, and basic latency/throughput measures. The operator-by-operator plan guide is in t03-009; this lesson concerns diagnosis across a workload.

# Core concepts

## Start from workload and user impact

Name the operation, affected users, start time, current status, and recent changes. Separate response time from throughput and error rate. Segment by query identity, parameter distribution, tenant or request type where safe, and deployment version. If an endpoint spends time waiting for a pooled connection before SQL begins, a database query plan cannot explain that portion of latency.

## Evidence has scope and a lifetime

A live request DMV is a snapshot of what is executing now. `sys.dm_os_waiting_tasks` shows present waits; `sys.dm_os_wait_stats` accumulates completed waits since engine startup/reset and has no query attribution. Query Store stores query/plan records and interval-aggregated runtime data, while plan-cache statistics depend on cached plans. File and index counters also have reset windows. Every comparison should record collection time, instance/database, uptime or reset, and the query window.

For SQL Server 2022 and later, many server performance DMVs require `VIEW SERVER PERFORMANCE STATE` rather than the older `VIEW SERVER STATE`; consult the exact DMV permissions and grant a narrowly scoped diagnostic identity. [DMV permissions](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/system-dynamic-management-views?view=sql-server-ver17) [wait counter lifetime](https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-wait-stats-transact-sql?view=sql-server-ver17)

## Waits are leads, not diagnoses

A wait means work could not proceed immediately. `PAGEIOLATCH` is associated with reading pages into the buffer pool; more reads can create more such waits even if the storage itself has not changed. `WRITELOG` points to log flush waiting, which could arise from log latency or commit pattern. `SOS_SCHEDULER_YIELD` is one CPU-pressure clue, not a proof; correlate runnable work and CPU. `CXPACKET` and `CXCONSUMER` are parallel-exchange coordination waits and need a plan/skew/concurrency interpretation. `PAGELATCH` concerns an in-memory latch and differs from a page-I/O latch. Do not sort a wait list and blindly apply a fix.

## Query Store and plan cache answer different questions

Query Store persists query text, plans, and aggregated runtime measures per time interval. It can show plan changes and regression windows after a cached plan disappears. Its data is aggregated: means do not disclose every parameter cohort or p99. Check capture state, storage usage, interval and retention. Plan forcing requests reuse of a recorded plan but optimizer forcing can fail; retain a validation and unforce step. Query Store is on by default for new SQL Server databases starting in 2022, not necessarily existing databases. Query Store for readable secondaries is available in SQL Server 2025 but not on by default. [collection](https://learn.microsoft.com/en-us/sql/relational-databases/performance/how-query-store-collects-data?view=sql-server-ver17) [management](https://learn.microsoft.com/en-us/sql/relational-databases/performance/manage-the-query-store?view=sql-server-ver17) [forcing](https://learn.microsoft.com/en-us/sql/relational-databases/performance/tune-performance-with-the-query-store?view=sql-server-ver17) [secondary availability](https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-for-secondary-replicas?view=sql-server-ver17)

## Resource symptoms need corroboration

- **CPU:** compare CPU time per operation, concurrent runnable demand, and throughput. A CPU-heavy query can be locally expensive without saturating the server.
- **Reads and I/O:** logical reads represent buffer pages touched; physical reads require storage. Compare deltas by file and query, not only server wait totals.
- **Memory grants:** sorts/hashes can queue on `RESOURCE_SEMAPHORE` or spill to tempdb when grants and estimates do not fit. Inspect request grants, plan estimates, concurrency, and memory feedback.
- **Locks:** identify the blocking chain and transaction age. A deadlock is a cycle chosen for victim rollback; ordinary blocking can persist without a cycle.
- **Tempdb:** determine if the evidence is allocation latch contention, metadata contention, I/O, or query spill before selecting a fix.
- **Workers and pools:** SQL worker starvation (`THREADPOOL`) and application pool exhaustion are different queues at different boundaries.

## Use an experiment, not folklore

A sound experiment states the hypothesis, predicted measure, affected population, control window, rollback trigger, and owner. Change one factor; compare under equivalent arrival rate, parameters, data volume, cache conditions, and background activity. Include distribution metrics (p50, p95, p99), successful throughput and errors, and normalized resource use such as CPU/logical reads per operation. A local query win can increase write cost or harm another endpoint.

# Mechanisms and relationships

A practical evidence chain is: user timer -> application pool/driver -> SQL session/request -> query/plan -> waits and resource counters -> storage/OS. Collect each layer only as needed, use a monotonic time basis where possible, and correlate IDs carefully. Extended Events should collect only the events and fields that test the hypothesis; event files are more durable than bounded in-memory buffers but require disk, access control, and retention.

Missing-index suggestions are candidate signals. They do not price write amplification, overlap, storage, filtered designs, or whole-workload impact. An index change should be justified with representative query evidence and regression checks. Statistics changes can trigger recompilation; a hint or forced plan can age poorly as data changes. Each intervention needs an expiry/review point.

# Worked examples

A query becomes slow only for a large date range. Query Store shows two plans but interval averages mix small and large parameter values. Capture a representative parameter distribution, compare plan/runtime behavior per cohort, and inspect live execution evidence. Do not conclude the “new plan is bad” from one aggregate row. Test a candidate mitigation against both cohorts and total throughput; preserve the ability to revert.

# Misconceptions and edge cases

- Large cumulative wait time is not necessarily the current bottleneck; it can predate the incident or reflect a busy workload.
- A wait type does not name its root cause, and server-wide wait stats do not identify the responsible query.
- `sys.dm_exec_query_stats` is plan-cache data, not an audit-grade historical record.
- A Query Store average can hide high p99, a rare spill, or a parameter subgroup.
- Lower logical reads can still be a regression if CPU, writes, concurrency, or tail latency gets worse.
- Killing a long transaction can incur lengthy rollback and does not remove the underlying cause.
- A client timeout does not prove SQL Server stopped executing; check cancellation, retries, and connection occupancy.
- Missing-index output is not a command to create every suggested index.

# Knowledge checks with answers

1. Do `sys.dm_os_wait_stats` rows show waits currently in progress? **No.** They record completed waits cumulatively since start/reset; use waiting tasks or active requests for a current snapshot.
2. Does `PAGEIOLATCH` prove the storage hardware is faulty? **No.** Excess physical reads, storage latency, and workload changes must be separated.
3. What does Query Store add over plan cache? **Persisted query/plan and interval history**, subject to capture and storage configuration.
4. If an app times out while SQL shows no expensive query, what boundary should be checked? **Pool acquisition, driver/network time, request cancellation, and whether work continued.**
5. Why keep p99 and throughput when evaluating an index? **Averages and isolated query speed can hide tail or workload-wide regressions.**

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
