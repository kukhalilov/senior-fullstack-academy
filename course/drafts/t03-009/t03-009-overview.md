# query processing execution plans cardinality and parameter sensitivity — Big-picture orientation and mental model

# Problem and purpose

SQL Server translates declarative T-SQL into a physical execution strategy. The optimizer predicts cardinalities and costs, but one cached plan can behave very differently as parameter values, data distributions, or workload conditions change. Reliable tuning requires linking plan structure to runtime evidence and history.

# Plain-language mental model

Treat a plan as a hypothesis about how to produce a result. The estimated plan is the optimizer's forecast. An actual plan adds observations from one execution. Query Store is the flight recorder: it preserves query, plan, and runtime history that the plan cache alone cannot retain. Start at the earliest estimate error or expensive repeated operation, then test one cause at a time.

# How the parts fit together

1. Capture the exact statement, parameter values, compatibility level, SET options, and representative workload context.
2. Compare estimated and actual plans; read physical operators with their properties and child inputs.
3. Find the first important row-estimate divergence, then test statistics, skew, parameter sensitivity, conversions, and query shape.
4. Compare CPU, elapsed time, logical reads, waits, memory grants, spills, and executions across representative parameter classes.
5. Use Query Store to establish whether plan choice changed over time; test a fix and keep rollback/monitoring ready.

# Concept map

| Question | Evidence | Limit |
| --- | --- | --- |
| What strategy did optimizer compile? | Estimated plan / Showplan XML | Estimates only; no runtime observations |
| What happened on this execution? | Actual plan, STATISTICS IO/TIME, Live Query Statistics | One execution context is not the workload |
| Why was a join/access path chosen? | Cardinality estimates, statistics, operator properties | Cost is an estimate, not wall-clock truth |
| Does one parameter change the plan needs? | Parameter classes, dispatcher and variants, Query Store | PSPO/OPPO are eligibility-driven, not guaranteed |
| Did performance regress with a plan change? | Query Store plans, intervals, runtime and wait statistics | Correlation does not isolate data/concurrency changes |

# End-to-end walkthrough

Suppose `Orders` has 40 million rows. `CustomerId = @id` selects 1 row for most customers but 500,000 for a few. The query uses a cached plan compiled for a rare customer and performs many key lookups for a large customer. First compare actual and estimated rows at the seek and lookup, then test both parameter classes with consistent reads and CPU. Check whether SQL Server 2022+ PSPO created a dispatcher/variants; if not, inspect eligibility and statistics rather than assuming the feature must engage. Use Query Store to compare plan/runtime history. Recompile, rewrite, or a targeted Query Store hint is an experiment with compile, stability, and lifecycle costs—not the default first fix.

# Version and platform boundaries

SQL Server 2025 PSP improvements require compatibility level 170 for DML support and multiple eligible predicates from one table; the feature remains selective and at most three predicates are chosen. OPPO requires compatibility 170 and its database-scoped configuration. CE feedback for expressions is available in SQL Server 2025 at compat 160, whereas Azure SQL Database uses compat 170. `OPTIMIZED_SP_EXECUTESQL` is a SQL Server 2025 addition. Validate exact deployment/update policy and feature state. [IQP matrix](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17) · [PSP](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17) · [OPPO](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization?view=sql-server-ver17).

# When to use it and tradeoffs

Use estimated plans to inspect optimizer choices without executing, actual plans to explain a completed run, live statistics for a currently executing query, and Query Store to compare across intervals. Each adds overhead or limited context; select evidence that answers the question and compare representative runs.

# What later lessons cover

Index selection and maintenance live in t03-008; SELECT semantics in t03-005; joins in t03-006; locking and deadlocks in t03-010; Query Store/wait operational practice is expanded in t03-013.

# Sources

- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/execution-plans?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/display-and-save-execution-plans?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/showplan-logical-and-physical-operators-reference?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/statistics/statistics?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-usage-scenarios?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-for-secondary-replicas?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/performance/query-store-hints?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/t-sql/queries/hints-transact-sql-query?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/relational-databases/extended-events/extended-events?view=sql-server-ver17)
- [Microsoft Learn](https://learn.microsoft.com/en-us/sql/sql-server/what-s-new-in-sql-server-2025?view=sql-server-ver17)
