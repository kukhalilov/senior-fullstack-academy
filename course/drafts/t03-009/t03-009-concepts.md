# query processing execution plans cardinality and parameter sensitivity — Core concepts and how they fit together

# Learning objectives

Distinguish estimated, actual, and live plans; read common operators and properties without treating icons as diagnoses; locate estimate divergence; explain parameter sniffing, PSPO, and OPPO; use Query Store for durable comparison; and measure changes with repeatable runtime evidence.

# Prerequisites

Know SELECT, joins, predicates, indexes, statistics basics, and SQL Server parameterized statements. Index design is in t03-008; detailed waits/locking are covered elsewhere.

# Core concepts

The optimizer receives query text, schema/index metadata, statistics, parameter/context information, and engine rules. It explores a bounded search space and chooses a good plan using estimated row counts and a cost model. It does not prove global optimality or promise a particular operator. SQL is declarative: logical result requirements do not specify the physical join order or access method.

# Plans are trees, not ranked icon lists

Graphical arrows show data flow from right to left; execution demand is pull-driven from the root toward children. Read leaf access, then transformations/joins/aggregates, then the root. Logical operators describe required relational work; physical operators implement it. A table scan can be best for a small table or broad result. An index seek can read a broad range, apply a residual predicate, and perform a lookup thousands of times. Operators must be understood with predicates, rows, executions, rebinds/rewinds, workers, memory, and warnings.

An estimated plan is compiled without execution. An actual plan includes runtime data for one completed execution. Live Query Statistics adds in-flight row flow and progress estimates and refreshes periodically with instrumentation overhead. Never compare an actual plan from one parameter to an estimated plan compiled under another context without recording that difference.

# Find the first consequential cardinality error

Compare estimated versus actual rows at operators that feed joins, lookups, sorts, aggregates, and memory-consuming operators. The earliest large mismatch often propagates downstream: a join chosen for 10 rows may be disastrous when it receives 100,000; an overestimate can request too much memory or choose excessive parallelism. Check row counts, execution count, and rows read versus returned. Other causes include stale/sampled statistics, skew, correlation assumptions, implicit conversions, non-SARGable expressions, unknown values, table-valued functions, and parameter-sensitive distributions.

The cost model is useful for choosing among alternatives but estimated subtree cost is not actual duration and cannot be compared as an absolute benchmark across different plans/environments. Use STATISTICS IO/TIME, actual rows, CPU, elapsed time, memory grant/spill details, and representative executions.

# Parameter behavior: three distinct tools

**Parameter sniffing** uses compile-time parameter values to produce a reusable plan. It is beneficial if future values have similar needs. **PSP optimization** can generate a dispatcher and child variants for eligible skewed equality predicates; dispatcher boundaries come from statistics, candidate selection is limited, and variants still need runtime validation. SQL Server 2025 compat 170 expands PSP to eligible DML and can select multiple predicates from one table, with a maximum of three total. **OPPO** addresses eligible optional predicates such as `(@p IS NULL OR col = @p)`, routing NULL and non-NULL cases to variants because one seek plan may not be valid for both. It requires compat 170 and `OPTIONAL_PARAMETER_OPTIMIZATION`.

These mechanisms do not cover arbitrary dynamic search patterns. OPTION(RECOMPILE) can compile for current values but costs CPU; OPTIMIZE FOR, DISABLE_PARAMETER_SNIFFING, or a Query Store hint intentionally alters optimization assumptions and can age badly. Prefer evidence and address a root cause such as statistics or query shape first.

# Query Store versus plan cache

The plan cache is an evictable in-memory store of reusable compiled plans. Query Store persists query/plan and interval runtime history and can capture waits; SQL Server 2022+ enables it by default for new databases in read-write mode. It exposes plan regressions and supports plan forcing and Query Store hints, which have different mechanisms: forcing requests a captured plan; a hint alters compilation behavior. Both can fail, override expectations, or turn harmful after data/schema/compatibility changes. Query Store hints override in-text and plan-guide hints; unsupported or contradictory hints may be ignored (ABORT_QUERY_EXECUTION intentionally blocks execution).

# Repeatable diagnosis loop

1. Define a performance objective and collect same-workload baselines.
2. Reproduce with representative parameter values and plan-affecting session/database settings.
3. Locate earliest estimate error or runtime-heavy operator; measure logical reads, CPU, elapsed time, memory, spill, and waits.
4. Check Query Store for plan changes and interval/capture gaps; compare normalized query identity and plan hashes cautiously.
5. Change one thing, rerun all parameter classes, and evaluate total system impact, not one screenshot.
6. Remove temporary hints/forcing when no longer justified; record owner, rationale, alerts, and revalidation date for retained controls.

# Current feature boundaries

Compatibility 170 affects many SQL Server 2025 capabilities but not every feature has the same minimum level. CE feedback for expressions specifically lists SQL Server 2025 compat 160, while Azure SQL Database lists 170. OPPO uses compat 170; PSP core started in SQL Server 2022 compat 160, with SQL Server 2025 compat 170 expansions. DOP feedback requires Query Store. Check current product matrix and scoped configuration, then test plan regressions.

# Mechanisms and relationships

Statistics inform cardinality; cardinality feeds operator cost, memory grants, join selection, and parallelism. A downstream spill may therefore originate in an earlier estimate error. Query Store records outcomes across time; it does not itself explain why the estimate was wrong. PSPO and OPPO add a dispatcher/variant layer to eligible query compilation, while Query Store forcing and hints are administrator controls applied to plan generation.

# Worked examples

For an optional search parameter, `WHERE (@p IS NULL OR Status = @p)`, the NULL case may require a broad scan and the non-NULL case may use a selective seek. OPPO can split eligible states into variants at compatibility 170. For skewed customer IDs with equality predicates, PSP can bucket cardinality ranges. In both cases check Showplan and Query Store for the actual dispatcher/variants, then measure NULL, common, and rare values.

# Misconceptions and edge cases

- Parameter sniffing is not inherently a defect; it often improves plans.
- New compatibility level enables eligibility but cannot make every query eligible or guarantee better performance.
- A histogram on one column does not describe arbitrary correlation between columns.
- Recompilation can fit current values but repeated compile CPU may harm throughput.
- A query hint can be ignored or become stale when data distribution, schema, or plan validity changes.

# Knowledge checks with answers

1. What is the core PSP issue? One reusable plan can fit poorly when parameter values imply very different cardinalities.
2. What does OPPO split? Eligible optional-parameter NULL and non-NULL states.
3. Why compare Query Store history? To distinguish a current regression from long-standing query behavior and plan changes.

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
