# performance troubleshooting monitoring waits and query tuning — Exercises and worked solutions

# Goals

Practice turning a symptom into evidence, distinguishing queues, and choosing measurable, reversible experiments.

# Worked example

A nightly report’s p95 rises after a statistics refresh. Query Store shows a new plan and more CPU, but interval averages combine parameter values. First capture the report’s parameter distribution and the plan/runtime rows for a comparable window. Verify whether the new plan is responsible for the affected cohort; inspect CPU, reads, waits, and concurrency. Test a bounded mitigation with both typical and extreme parameters. Compare p50/p95/p99, throughput, errors, CPU and reads per execution. If a forced plan is used as a short-term mitigation, verify successful forcing and define when/how to unforce it.

# Exercises

Try each scenario before reading its solution.

1. Instance wait counters show many hours of PAGEIOLATCH waits, but the issue started ten minutes ago. What evidence do you collect next?
2. `WRITELOG` rises during a write-heavy workload. List two distinct hypotheses and the measurements that separate them.
3. An app reports timeout, but Query Store does not show a slow query. Trace the likely boundary sequence.
4. A candidate index makes one SELECT twice as fast but increases p99 write latency and storage. Decide what to do and what extra evidence is needed.
5. After upgrading to SQL Server 2025, a team attributes an improvement to OPPO. What eligibility and evidence must be checked?
6. A plan forced through Query Store stops being used. What does this mean, and what should operations verify?

# Progressive hints

1. Compare a before/after interval and use live waits for “now”; check reset/start time and query attribution.
2. Separate flush latency from commit frequency/transaction shape.
3. An application timer can include pool acquisition and client/network work outside SQL execution.
4. The affected SELECT is one part of the workload; quantify total read/write mix and user SLOs.
5. SQL Server 2025 does not imply every feature is active; check compatibility level 170 for OPPO and observe eligible query behavior.
6. Plan forcing is an attempt to reuse an eligible recorded plan, not a guarantee.

# Complete solutions

1. Timestamp a fresh snapshot; inspect `sys.dm_os_waiting_tasks`/active requests and the affected query’s Query Store history. Compare wait deltas over the incident window, file-I/O latency and volume, plan/parameter mix, and deployment changes. Historical cumulative totals cannot prove the ten-minute cause.
2. Hypothesis A: log device flush latency. Check log-file write latency/stalls and storage path contention. Hypothesis B: excessive synchronous commits or tiny transaction batches. Check commit rate, transaction size, and application call pattern. Both can coexist; compare latency per flush and work per operation.
3. Follow application request start, pool-acquisition duration, connection checkout, SQL request begin/end, network transfer, timeout/cancel, and retry. Check whether SQL work continues after the client deadline and whether connections are held/leaked. Query Store aggregation can also hide a short event or wrong query identity.
4. Do not deploy based on the SELECT microbenchmark alone. Run a representative mixed read/write workload, quantify storage and write latency changes, other plans, concurrency, tail latency, and throughput. Keep the index only if aggregate user outcomes and capacity goals justify the cost; otherwise revise or reject it.
5. OPPO is supported in SQL Server 2025 at compatibility level 170. Check database compatibility, feature/database-scoped configuration and query eligibility, plan variants/Query Store evidence, parameter distribution, and a controlled before/after workload. Do not attribute a generic version-upgrade improvement to OPPO without evidence. [IQP feature requirements](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)
6. Inspect Query Store and the plan-forcing failure event, compatibility and query context, and whether the recorded plan remains eligible. Compare live plan and performance; use a tested alternate mitigation or unforce, then verify the regression under representative parameters. [Plan forcing behavior](https://learn.microsoft.com/en-us/sql/relational-databases/performance/tune-performance-with-the-query-store?view=sql-server-ver17)

# Tests and edge cases

- Compare at least one steady window and one expected peak window.
- Include parameter extremes and relevant concurrency, data volume, and background jobs.
- Verify DMV permissions under a least-privilege diagnostic principal.
- Label counter snapshots with engine start/reset, database, and timestamps.
- Test cancellation/retry behavior and connection disposal after timeouts.
- Set canary rollback triggers for errors, p99, throughput, CPU, log latency, and storage headroom.
- Check that Query Store remains in its intended capture state and has sufficient storage/retention.

# Reflection questions

Which part of the user-visible timer is outside SQL execution? Which metric identifies scope versus cause? What measurement would disprove your hypothesis? What other workload can pay the cost of your fix? Who can reverse it, and what exact signal triggers rollback?

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
