# performance troubleshooting monitoring waits and query tuning — Reference: Waits, DMVs, Query Store, and event collection

# Scope and version

SQL Server 2025 (17.x) is the current scope. This catalog is bounded to the exact inventory names below. DMV permissions, counter scope, and feature eligibility vary by object/version; use the linked specific documentation for the target build.

# How this group fits the mental model

Choose evidence based on the question: current activity, historical query behavior, event details, or host pressure. A trustworthy timeline connects these sources without pretending their counters have identical lifetime or attribution.

# Supplied names explained

- `Wait statistics` — Accumulated measurements of time SQL Server workers spent waiting for resources or events; interpret them as workload clues and correlate them with the affected query and interval.

- `sys.dm_os_wait_stats` — Instance-level counters for waits that have completed. They are cumulative since startup or reset, omit current waits, and do not attribute waits to a query; take timestamped deltas.

- `sys.dm_exec_requests` — One row per request currently executing in SQL Server; use it for live request status, elapsed and CPU time, reads, wait type, and blocking relationships.

- `sys.dm_exec_sessions` — Session-level connection and activity metadata. It helps relate requests to login, client, host, and session settings but a sleeping session is not itself a running query.

- `sys.dm_exec_query_stats` — Aggregated execution metrics for completed executions associated with cached plans. Rows can disappear when plans leave cache, so it is not durable history.

- `sys.dm_exec_sql_text` — Returns SQL text for a SQL handle, including batch or module text. Handle and offsets determine which statement within a batch is relevant.

- `sys.dm_exec_query_plan` — Returns cached plan XML for a plan handle. A plan can be absent after cache eviction, and an estimated/cached plan does not show every actual runtime row count.

- `sys.dm_os_waiting_tasks` — Shows tasks that are currently waiting and their resources/blocking context. It complements completed historical wait counters and is a transient snapshot.

- `sys.dm_io_virtual_file_stats` — Cumulative file-level I/O counts, bytes, and stall times since counters began; derive latency from deltas and separate data-file and log-file activity.

- `sys.dm_db_index_usage_stats` — Counts index seeks, scans, lookups, and updates since counters began. Resets and workload observation windows matter; low reads do not alone prove an index is useless.

- `sys.dm_db_missing_index_details` — One component of optimizer-generated missing-index suggestions. Recommendations are limited, can overlap, omit write/storage cost and some index designs, and must be tested against the full workload.

- `Query Store` — Database-persisted query text, plans, and aggregated performance history, useful for changes over time where the plan cache is transient. Check its state, capture policy, size, and retention.

- `Query Store runtime statistics` — Per-plan metrics aggregated in configured time intervals, including execution count and runtime/CPU/I/O measures; averages can hide tails and parameter cohorts.

- `Query Store wait statistics` — Wait categories associated with Query Store tracked query plans on supported versions; it improves query-level diagnosis but does not replace live task inspection or workload correlation.

- `Query Store plan forcing` — Requests that a previously recorded plan be used. The optimizer can fail to force it and emit an event; compare outcome, monitor regressions, and unforce when it is no longer appropriate.

- `Extended Events` — A low-overhead, configurable event infrastructure for targeted diagnosis. Select narrowly scoped events, actions, predicates, and retention because broad/high-volume collection still costs resources and may capture sensitive values.

- `event session` — A configured Extended Events collection that specifies events, actions, predicates, and targets; start/stop it deliberately and avoid collecting everything indefinitely.

- `event target` — Destination that buffers, aggregates, or persists event data. The target affects durability, volume, and how evidence is queried.

- `ring_buffer target` — In-memory Extended Events target useful for short-lived inspection; it is bounded and volatile, so it can overwrite or lose older evidence and should not be treated as durable logging.

- `event_file target` — Extended Events target that writes event data to files for durable post-event analysis; plan rollover, size, access, and retention.

- `system_health session` — Built-in Extended Events session that captures selected health diagnostics, including useful severe errors and deadlock evidence. Its bounded target rolls over; inspect the configured files and window.

- `SQL Server Profiler legacy boundary` — Profiler and SQL Trace are legacy tracing tools; prefer Extended Events for new SQL Server diagnostics, while recognizing existing environments may still contain traces.

- `Performance Monitor counter` — Windows performance counter sampled over time to correlate SQL Server with OS CPU, memory, disk, and network behavior. Counter rate and scope must match the diagnostic question.

- `Database Engine Tuning Advisor boundary` — Workload-based tool that can propose indexes or partitioning configurations. Treat output as candidates to review and validate, not automatic proof or a replacement for workload-wide design.

- `sys.dm_os_schedulers` — Scheduler-level view of online schedulers and worker/task queues. Runnable queue length and active workers add CPU scheduling context but must be correlated with processor utilization and workload.

- `sys.dm_os_sys_info` — Returns SQL Server host and engine startup information, including `sqlserver_start_time`; use it to identify a counter lifetime boundary, not as historical telemetry.

- `sys.dm_os_performance_counters` — Exposes SQL Server performance counters and raw values. Interpret `cntr_type`, instance, base counters, and rate semantics correctly; take timed samples for rates.

- `sys.dm_exec_query_memory_grants` — Lists queries that have requested or received execution memory grants, including grant and wait state. Combine with plan estimates and concurrency to diagnose grant pressure.

- `sys.dm_exec_procedure_stats` — Aggregated performance statistics for cached stored-procedure plans. Rows disappear with plan eviction and do not represent durable procedure history.

- `sys.dm_exec_cached_plans` — Describes cached query plans and their cache-object metadata. Cache presence is transient and should not be confused with persisted Query Store history.

- `sys.dm_db_task_space_usage` — Reports tempdb space allocated/deallocated by task for active requests, helping locate request-level tempdb use. Capture while the task exists.

- `sys.dm_db_session_space_usage` — Reports tempdb allocations/deallocations attributed to sessions, often after task accounting is aggregated; interpret with session lifetime and request state.

- `sys.query_store_query` — Query Store catalog view for tracked query identities and context settings. A query text can have multiple entries under different contexts or module execution.

- `sys.query_store_plan` — Query Store catalog view of persisted plan records associated with query entries. Stored plans are estimated plan representations, not a full actual runtime trace.

- `sys.query_store_runtime_stats` — Query Store catalog view with interval-aggregated runtime measures per plan; use its interval relation and execution counts to avoid mixing periods.

- `sys.query_store_wait_stats` — Query Store catalog view with aggregated wait-category data for tracked plans and intervals where supported/enabled; interpret collection support and aggregation scope.

- `sys.query_store_runtime_stats_interval` — Query Store catalog view that defines the time windows used for runtime aggregation; align interval IDs and UTC boundaries during comparisons.

- `sys.database_query_store_options` — Reports configured and actual Query Store state, capture mode, storage use/limit, and read-only reason. Verify actual state before interpreting absent history.

- `sp_query_store_force_plan` — Requests that Query Store force a plan previously recorded for the query. Forcing can fail; check status/events and measure outcome.

- `sp_query_store_unforce_plan` — Removes Query Store plan forcing for a query/plan pair so normal optimization can resume; verify the next plan and workload behavior.

- `xml_deadlock_report event` — Extended Events event containing a deadlock graph with participants, resources, and victim. Use it to reconstruct a cycle and access order; a deadlock graph is not an ordinary blocking snapshot.

# Cross-item comparison

These items answer different points in the evidence chain. Live DMVs describe transient requests/tasks; cumulative DMVs describe a counter window; Query Store persists interval history; Extended Events capture selected event timelines; OS counters add shared-system context. Within each family, correlate scope and lifetime before combining values. A plan forcing or tuning recommendation is a mitigation decision after comparison, not raw diagnostic evidence.

# Examples

```sql
-- Snapshot completed waits for a known interval; this does not show current waits.
SELECT wait_type, waiting_tasks_count, wait_time_ms
FROM sys.dm_os_wait_stats
ORDER BY wait_time_ms DESC;

-- Current waits require a separate live snapshot.
SELECT session_id, wait_type, wait_duration_ms, blocking_session_id
FROM sys.dm_os_waiting_tasks;
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

1. Which DMV provides current waiting tasks? **`sys.dm_os_waiting_tasks`; `sys.dm_os_wait_stats` is completed cumulative history.**
2. Which tool preserves plan/runtime history by interval? **Query Store, when enabled and capturing.**
3. Is a ring buffer durable? **No; it is in-memory and bounded.**
4. Is a missing-index row a design command? **No; it is a limited candidate to validate.**

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
