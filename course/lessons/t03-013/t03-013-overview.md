# performance troubleshooting monitoring waits and query tuning — Big-picture orientation and mental model

# Problem and purpose

Performance work begins when a user-visible operation is slow, inconsistent, or costly. The task is to locate where time and resources go, establish which workload is affected, and test a change without shifting cost elsewhere. “The database is slow” is a symptom description, not a diagnosis.

# Plain-language mental model

Imagine a service desk. Requests arrive, receive service, and sometimes wait for a worker, memory, storage, or another transaction. A query plan is the route through the work; runtime counters describe what happened; wait evidence describes where a request paused. No single counter tells the whole story. First identify the operation and interval, then join evidence from the application, active requests, history, and server resources.

# How the parts fit together

1. Define the affected operation, user impact, time range, and recent changes.
2. Establish whether the symptom is latency, throughput, errors, or resource cost, and segment it by endpoint/query and parameter shape.
3. Compare a representative baseline with current behavior. Account for traffic, engine restart, counter reset, and cache state.
4. Find evidence at the right level: live requests and waits for “now”; Query Store for persisted query/plan history; Extended Events for a targeted event timeline; operating-system counters for shared CPU, memory, and I/O context.
5. Form a testable bottleneck hypothesis, change one factor in a controlled environment or canary, and compare both user outcomes and resource cost.

# Concept map

| Question | Evidence | Limitation |
| --- | --- | --- |
| What is waiting now? | Active requests and waiting tasks | A snapshot can miss a transient wait |
| What changed for this query? | Query Store plans and time-bucketed runtime statistics | Aggregation can hide parameter and tail behavior |
| Is the instance saturated? | OS counters, scheduler, memory, file I/O, workload concurrency | Server-wide totals can hide a single bad query |
| What happened at a particular event? | A scoped Extended Events session | Collection has overhead and retention limits |
| Did a change help? | Equivalent before/after workload and a control/canary | Unlike workload windows are not causal evidence |

# End-to-end walkthrough

Suppose an endpoint’s p95 latency rises after a deployment while its request rate is unchanged. Record the time window and build/setting changes. Confirm the endpoint’s database calls and parameter cohorts. Compare its Query Store intervals and plans to the prior window; inspect live blocked requests if the problem is ongoing. If the query plan’s logical reads rose, check the actual workload and index/statistics hypothesis; if requests wait on log flushes, compare log-file latency and commit frequency. Apply one reversible change to a realistic replay or canary. Compare p50/p95/p99, successful throughput, errors, logical reads, and CPU per operation; revert if the predefined guardrail worsens.

# When to use it and tradeoffs

DMVs are excellent for a current snapshot and counters but many are volatile or cumulative. Query Store supplies historical context but consumes database storage and may stop capturing when read-only. Extended Events can capture precise evidence but must be narrowly scoped. Query hints or forced plans can mitigate an urgent regression but need monitoring and an unforce/rollback path. A change that lowers average duration while reducing throughput or worsening p99 is not automatically a win.

# What later lessons cover

The concepts lesson develops evidence scope and measurement. The three reference lessons cover diagnostic APIs/tools, bottleneck interpretation, and controlled remediation. Practice and interview lessons apply them to production-style scenarios. Execution-plan operator interpretation belongs to t03-009; index internals to t03-008; transaction semantics to t03-010.

# Recent version changes

SQL Server 2025 adds expression cardinality-estimation feedback, OPPO at compatibility level 170, and `OPTIMIZED_SP_EXECUTESQL`; their eligibility and configuration differ. Query Store for readable secondary replicas is available in SQL Server 2025 but is opt-in. Do not infer that a feature is active merely because the engine version supports it. [IQP features](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17) [secondary Query Store](https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-for-secondary-replicas?view=sql-server-ver17) [SQL Server 2025 changes](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)

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
