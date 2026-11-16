# query processing execution plans cardinality and parameter sensitivity — Reference: Estimation, parameter effects, and adaptive compilation

# Scope and version

Targets SQL Server 2025 (17.x), with compatibility and eligibility boundaries called out separately. Azure SQL products can expose different release/update policies. These are the exact names frozen for this reference group; consult the cited Microsoft reference for operators and options outside this curated list.

# Supplied names explained

| Exact inventory item | Meaning and important edge |
| --- | --- |
| `Cardinality estimation` | Prediction of rows flowing through each plan stage. Estimates combine statistics, constraints, and assumptions and shape join, access, memory, and parallelism choices. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `Statistics histogram` | A sampled or full-scan summary of value distribution. A stats object has a histogram on its first key column, bounded to at most 200 steps; it cannot express arbitrary correlation. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server?view=sql-server-ver17)) |
| `Data skew` | Uneven frequency across values. One cached plan can be poor for values selecting very different row counts; inspect distributions and parameter-specific runtime behavior. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server?view=sql-server-ver17)) |
| `Parameter sniffing` | Compilation can use parameter values to estimate a reusable plan. It is a feature that helps when values behave similarly and a risk when distributions differ materially. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `Parameter-sensitive query` | A parameterized query whose efficient plan changes for different parameter values or resulting cardinalities. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17)) |
| `Parameter Sensitive Plan optimization (PSPO)` | Adaptive optimization that may cache a dispatcher and multiple query variants for eligible parameterized equality predicates with materially different cardinalities. Qualification is selective. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `Query Store plan forcing` | Requests reuse of a previously captured plan to mitigate a regression. Forcing can fail or become inappropriate after schema/data changes; monitor forcing status and reevaluate. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store?view=sql-server-ver17)) |
| `OPTION(RECOMPILE)` | Compiles a fresh plan for the current execution and discards that temporary plan after execution. It can fit current values but spends compile CPU and does not fix a bad schema/statistics model. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `OPTIMIZE FOR query hint` | Directs compilation to use a specified parameter value or unknown-value assumption. It changes estimates, not returned values; a fixed representative value can become unrepresentative. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `Local variable estimate` | A local variable often lacks a sniffed runtime value at optimization, so the optimizer uses a generic estimate unless statement recompilation/embedding changes the context. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17)) |
| `Parameter embedding optimization` | Compilation can substitute known parameter values into a statement, commonly with recompile contexts, allowing constant folding and value-specific plans at a compilation cost. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `Optional Parameter Plan Optimization (OPPO)` | SQL Server 2025 adaptive feature for eligible optional predicates such as `Column = @p OR @p IS NULL`; it dispatches NULL and non-NULL states to variants. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization?view=sql-server-ver17)) |
| `Parameter-sensitive plan dispatcher` | A parent plan evaluates selected parameter cardinality ranges or optional states and routes execution to a query variant. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17)) |
| `Query variant` | A child plan compiled for one dispatcher bucket/state. Variants are independently visible in plan cache/Query Store metadata; seeing variants does not imply all values are covered optimally. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17)) |
| `Cardinality estimation feedback` | An Intelligent Query Processing family of feedback mechanisms that can adjust assumptions for repeat executions; eligibility, persistence, and exact behavior vary by feedback type and release. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `Memory grant feedback` | Adjusts later memory grants based on prior execution use/spills. It is iterative, has eligibility/disable cases, and does not replace fixing incorrect row estimates or pathological query shapes. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `Degree of parallelism feedback` | Can tune DOP for repeating queries when eligible; in SQL Server it requires Query Store and should be evaluated with CPU and elapsed-time objectives. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `Interleaved execution` | For eligible multi-statement table-valued functions, pauses optimization to use a first-execution row count, then resumes compilation; that observed cardinality can still be unrepresentative later. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `Table variable deferred compilation` | Defers compilation for eligible table-variable statements until first execution can observe its row count. It improves the initial estimate but does not create full distribution statistics. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `Batch mode on rowstore` | Allows eligible rowstore plans to use batch processing without requiring a columnstore index. Eligibility is optimizer-selected and not a guarantee for every query. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `Intelligent Query Processing` | A family of automatic optimizer improvements enabled by version/compatibility-specific eligibility. Raising compatibility can change plans; test regressions rather than treating the label as a single switch. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `Cardinality Estimator model version` | Showplan property identifying the CE model used for optimization. It helps correlate compatibility/CE changes with plan differences but does not diagnose the cause by itself. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server?view=sql-server-ver17)) |
| `Legacy CE model 70` | Legacy CE family associated with model version 70; it uses assumptions such as independence, uniformity, and simple containment. A legacy-CE override can help one query and regress others. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server?view=sql-server-ver17)) |
| `Modern CE model 120 and later` | Modern CE family beginning at model version 120, with changed assumptions including join containment. Latest CE is generally recommended, but compatibility upgrades require workload validation. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server?view=sql-server-ver17)) |
| `Simple containment assumption` | Assumes join inputs overlap after filters are applied, which can lower estimated join output. It can misestimate when filtered value domains do not overlap as assumed. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server?view=sql-server-ver17)) |
| `Base containment assumption` | Estimates join selectivity from base distributions before applying input filters, reflecting a different overlap model. Compare its prediction with actual filtered-domain overlap. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/cardinality-estimation-sql-server?view=sql-server-ver17)) |
| `Parameter Sensitive Plan predicate limit` | PSP selects at most three interesting predicates per query, limiting dispatcher and variant growth. It can select fewer or none when eligibility evidence is absent. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `PSP equality-predicate eligibility boundary` | PSP currently targets eligible equality predicates with parameter-sensitive cardinalities; do not assume arbitrary range, expression, or optional predicates qualify. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `PSP support for DML at compatibility 170` | SQL Server 2025 at compatibility 170 expands PSP to eligible INSERT, UPDATE, DELETE, and MERGE statements. Confirm a dispatcher/variant actually appears for the statement. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `OPTIONAL_PARAMETER_OPTIMIZATION configuration` | Database-scoped setting that controls OPPO. SQL Server 2025 enables it by default, but compatibility level 170 and an eligible query pattern are also required. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17)) |
| `OPPO compatibility level 170 requirement` | OPPO requires SQL Server 2025 compatibility level 170. Meeting this prerequisite does not mean every optional predicate qualifies. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization?view=sql-server-ver17)) |
| `DISABLE_OPTIONAL_PARAMETER_OPTIMIZATION hint` | USE HINT option that disables OPPO for a statement and overrides the database-scoped setting; it can also be applied through Query Store hints. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17)) |
| `OPPO eligible NULL optional predicate` | A documented eligible pattern is Column = @p OR @p IS NULL, where NULL and non-NULL states may need different scan/seek plans. Other dynamic-search forms are not guaranteed to qualify. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization?view=sql-server-ver17)) |
| `PSP and OPPO dispatcher/variant distinction` | Both use Multiplan dispatch, but PSP selects cardinality ranges for skewed predicates while OPPO splits eligible optional NULL states. A query can qualify for both; inspect Showplan metadata. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/optional-parameter-optimization?view=sql-server-ver17)) |
| `CE feedback for expressions in SQL Server 2025` | Learns across repeating expressions and selects more suitable CE model assumptions. SQL Server 2025 lists compatibility 160; Azure SQL Database lists 170, so verify product-specific availability. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `OPTIMIZED_SP_EXECUTESQL` | SQL Server 2025 database-scoped configuration that serializes concurrent compilation for equivalent sp_executesql batches to reduce compilation storms. It addresses compilation concurrency, not execution-plan quality. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `DOP feedback Query Store requirement` | Degree-of-parallelism feedback tunes eligible repeating queries and requires Query Store. Check Query Store state and feedback eligibility before expecting a learned DOP. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |
| `DISABLE_PARAMETER_SNIFFING hint` | USE HINT that disables parameter sniffing for a statement and uses generic estimates. This can avoid one bad sniffed plan while harming values that benefit from specialization. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `Parameter Sensitive Plan recompile boundary` | Dispatcher plans can be rebuilt after significant distribution changes; variants can recompile independently under normal recompile conditions. A variant is not permanently fixed to its first plan. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/parameter-sensitive-plan-optimization?view=sql-server-ver17)) |
| `Memory grant feedback persistence` | Supported memory grant feedback can persist learned adjustments through Query Store when Query Store is enabled in READ_WRITE mode. Eligibility and persistence do not guarantee feedback for every query. ([source](https://learn.microsoft.com/en-us/sql/relational-databases/performance/intelligent-query-processing?view=sql-server-ver17)) |

# How to use this reference

Read the plan from data-producing leaves toward the root, then trace what drives repeated work from root toward leaves. Compare estimated and actual rows at the first divergence; check executions, rows read versus returned, memory grant/spills, and runtime evidence. A seek, scan, warning, or high estimated cost is a clue, not a verdict.

# How this group fits the mental model

This inventory names the plan, estimate, or diagnostic surface needed to explain a query's behavior. Connect each property to a question: what did the optimizer predict, what happened at runtime, and where did the difference begin?

# Cross-item comparison

Estimated rows describe the forecast; actual rows describe one execution. A seek predicate navigates a key range; a residual predicate filters rows after access. A plan hash describes a shape; Query Store runtime intervals describe observed workload behavior. Use pairs together instead of treating any one as a score.

# Examples

If a Nested Loops inner seek executes 80,000 times, inspect Actual Executions and rows per execution even if the icon looks selective. If estimated rows at an upstream filter are 5 but actual rows are 40,000, trace statistics, parameter values, and predicates before blaming the downstream Hash Match spill.

# Common mistakes

- Calling every scan bad or every seek good.
- Comparing estimated subtree cost to elapsed milliseconds.
- Reading plan arrows as invocation direction; graphical flow and pull execution direction differ.
- Treating a warning as proof of a fix without checking the operator and runtime impact.

# Knowledge checks with answers

1. What is the earliest useful location for an estimate diagnosis? The first consequential estimated/actual row divergence.
2. Does an actual plan generalize to all values? No; it records one execution context.
3. What does a residual predicate imply? Rows can be read before the predicate rejects them; compare rows read and returned.

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
