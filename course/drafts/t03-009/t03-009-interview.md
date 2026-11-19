# query processing execution plans cardinality and parameter sensitivity — Interview questions and reasoning

# Core questions

1. What inputs shape the SQL Server optimizer's plan choice?
2. Estimated versus actual execution plan?
3. Why is an index seek not inherently faster than a scan?
4. Logical versus physical operator?
5. How do you locate the first important cardinality error?
6. What is parameter sniffing, and when is it beneficial?
7. PSP versus OPPO?
8. When is OPTION(RECOMPILE) appropriate, and what does it cost?
9. Query Store versus plan cache?
10. Plan forcing versus Query Store hints?
11. What does a spill or large memory grant tell you?
12. How do compatibility level and IQP features affect rollout?
13. Why are query hash and plan hash useful but insufficient?
14. How would you safely tune a plan regression in production?
15. What changes when Query Store captures readable-secondary workloads, and how would you scope a hint to one replica group?
16. What does PSP's three-predicate limit actually constrain, and how would you diagnose why a query was skipped?

# Concise interview answers

1. Query text/shape, schema and indexes, statistics, parameter/context information, and optimizer cost/heuristics.
2. Estimated is compilation output without runtime observations. Actual adds one completed execution's runtime context; neither proves behavior for all parameter values.
3. A seek can read a wide range, filter residually, or trigger many lookups; a scan can be cheaper for broad results or small tables.
4. Logical states required relational operation; physical describes implementation algorithm selected by the optimizer.
5. Compare estimated and actual rows from leaves toward root; find earliest mismatch before interpreting downstream join, lookup, sort, or grant costs.
6. A compile-time value informs reusable-plan estimates. It is beneficial for representative values and problematic with materially different cardinalities.
7. PSP variants address eligible cardinality skew (primarily equality predicates); OPPO routes eligible optional NULL/non-NULL predicate states. They share adaptive Multiplan infrastructure but solve different patterns and have distinct eligibility.
8. It specializes estimates/plan for each execution and can solve a skew case, but adds compilation CPU, so measure total workload and frequency.
9. Plan cache is transient and stores reusable compiled plans; Query Store persists query, plan, runtime interval, and optionally wait history.
10. Forcing requests a historical plan; Query Store hints alter compile behavior without changing SQL text. Both need monitoring, may fail/be ignored, and can age badly.
11. Spill suggests insufficient grant for an operator's runtime needs, often from estimate error; a large unused grant can reduce concurrency. Inspect actual rows, requested/granted/used memory and feedback eligibility.
12. Compatibility makes release features eligible but can change plans broadly. Stage it, compare Query Store baselines, replay representative parameter values, and keep a rollback path.
13. Hashes help group query/plan shapes, but do not encode parameter distribution, runtime resources, data state, or guarantee collision-free identity.
14. Establish baseline and parameter classes, inspect plan/runtime/Query Store evidence, isolate one cause, test a reversible change, monitor total workload and remove temporary controls when no longer needed.
15. On supported SQL Server 2025/Azure platforms, secondary query runtime and wait data can be streamed to the primary Query Store; SQL Server 2025's feature is preview. Verify `READ_CAPTURE_SECONDARY`, join `replica_group_id` through `sys.query_store_replicas`, and use the optional `@replica_group_id` on `sys.sp_query_store_set_hints` only after testing and confirming the exact scope/status.
16. It caps selected predicates, not total variants: range combinations can multiply. PSP currently targets eligible equality predicates; inspect the PSP skipped-reason Extended Event and decode `psp_skipped_reason_enum` through `sys.dm_xe_map_values`, then confirm the actual dispatcher or query variant in Showplan/Query Store. Eligibility still does not promise improved runtime.

# Deep follow-up answers

A scan is not inherently wrong: optimizer choice depends on qualifying rows and required columns. Conversely, a seek followed by many lookups can read more pages than a scan. Count rows/executions and logical reads, then use actual plans to see residual predicates and lookup work.

PSP and OPPO do not create arbitrary plans for every input. PSP uses statistics to select a limited set of at-risk predicates and ranges; OPPO detects eligible optional NULL patterns. In SQL Server 2025, PSP supports eligible DML and multiple predicates per table at compat 170, up to three total. OPPO requires compat 170 and its scoped configuration. Always verify actual dispatcher/variant evidence.

Hints are controls with an owner and expiry condition. Before forcing/hinting, check query shape, statistics, indexes, compatibility, parameter distributions, and waits. Query Store can retain the intervention and history, but changed data or schema may invalidate its assumptions.

# Scenario questions

**A production query became slow immediately after deployment.** Compare Query Store plan/runtime history before and after; confirm same query, parameter classes, data volume, SET options, and infrastructure. Find the earliest estimate/plan divergence, test the previous plan against current data and schema, use a reversible targeted mitigation only if validated, and monitor its success/failure state and expiry criteria.

# Tradeoffs and alternatives

Query Store forcing is fast to apply and avoids changing application SQL, but pins a plan whose assumptions may age. Query Store hints can target compilation behavior without a code release, but they need ownership and revalidation. Query rewrites or schema/statistics changes address causes more directly but require deployment and broad regression tests. Recompile specializes per run but consumes compile CPU.

# Common weak answers

- “A seek is always faster than a scan.”
- “Parameter sniffing is a bug; disable it everywhere.”
- “The plan says 90% cost, so this is where the wall-clock time went.”
- “Raise compatibility and the optimizer will fix the workload.”
- “Force the old plan permanently without checking whether data or schema changed.”

# Self-check rubric

Score each response 0–2: (0) names a tool without evidence, (1) identifies relevant evidence but misses context/cost, (2) compares representative parameter values, plan properties, runtime metrics, Query Store history, feature eligibility, and a reversible validation/monitoring path. A strong answer treats the plan as evidence, not a verdict.

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
