# performance troubleshooting monitoring waits and query tuning — Interview questions and reasoning

# Core questions

1. How do you start diagnosing “SQL Server is slow”?
2. What is the difference between `sys.dm_os_wait_stats` and `sys.dm_os_waiting_tasks`?
3. Why use Query Store if the plan cache has plans?
4. How should a team interpret a dominant wait type?
5. How do you distinguish database time from connection-pool delay?
6. How do you safely evaluate an index or query hint?
7. What are the limits of a missing-index recommendation?
8. What should be measured before and after a performance change?
9. What does SQL Server 2025 change for Query Store on readable secondaries and OPPO?
10. What is a safe operational use of Query Store plan forcing?

# Concise interview answers

1. Bound the symptom by workload, time, user impact, and changes; compare baseline, current requests, query history, and correlated resources.
2. Wait stats are completed cumulative waits since reset/start; waiting tasks are a current snapshot and neither alone attributes the whole workload.
3. Query Store persists query/plan and interval runtime history after plans leave cache and supports regression comparisons, subject to capture/storage configuration.
4. Treat it as a hypothesis generator; correlate query, time window, plan, resource counters, and competing causes.
5. Measure app pool acquisition and request stages separately from SQL request execution and return.
6. Specify a predicted metric and representative workload, change one factor, canary, monitor broader costs, and document reversal triggers.
7. It is an incomplete optimizer signal that omits important design and workload costs; merge/validate candidates with full workload evidence.
8. Latency distribution, successful throughput, errors, CPU and reads per operation, writes/log latency, storage/capacity, and workload context.
9. Secondary Query Store is available starting SQL Server 2025 but opt-in; OPPO is available in SQL Server 2025 at compatibility level 170.
10. Use a recorded plan as a measured temporary mitigation, check forcing outcome, monitor its fit, and keep an unforce/rollback path.

# Deep follow-up answers

Explain counter lifetimes and permissions. For waits, distinguish PAGEIOLATCH from in-memory PAGELATCH and avoid assigning cause from labels. Query Store runtime rows aggregate by interval and plan, which may mix parameter values; query text/context and distributions matter. Query Store forcing can fail. A successful forced plan may still become unsuitable as data distribution or workload changes. An index can reduce reads yet increase write cost, storage, and maintenance. SQL Server 2022+ DMV permissions differ from older guidance, so diagnostic access should be granted specifically.

# Scenario questions

**A dashboard shows CPU low, yet an API is slow.** Inspect connection acquisition, current waits/blockers, network/serialization, external dependencies, and timeouts; low instance CPU does not rule out queueing elsewhere.

**A query regression follows an engine upgrade.** Compare Query Store plan history and compatibility level, workload and parameter distribution, waits, configuration, and build-specific changes. Establish the causal chain before rolling back a version or adding a hint.

**Most server waits are parallelism waits.** Identify affected queries and plans, worker skew, runnable CPU demand, duration, and throughput. Do not globally change MAXDOP or cost threshold because a wait label dominates.

# Tradeoffs and alternatives

DMVs offer low-latency point-in-time or cumulative evidence but are volatile and permission-sensitive. Query Store preserves database-local history with storage and capture costs. Extended Events offer precise event evidence with collection/retention costs. OS counters reveal shared host pressure but not query identity. Plan forcing and hints can restore stability quickly but age and need active maintenance.

# Common weak answers

- “The top wait is the root cause.”
- “High logical reads means the disk is slow.”
- “Query Store is always enabled on every database.”
- “A missing-index recommendation should be created as written.”
- “The query got faster, so production got faster.”
- “A timeout proves SQL Server canceled the request.”
- “Set MAXDOP to one to remove parallel waits.”

# Self-check rubric

Score each answer 0–2: 0 = names a metric/fix only; 1 = explains the mechanism but misses scope or alternatives; 2 = states evidence lifetime and attribution, proposes a falsifiable test, includes workload-wide tradeoffs, and gives a rollback criterion.

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
