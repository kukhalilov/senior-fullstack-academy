# query processing execution plans cardinality and parameter sensitivity — Exercises and worked solutions

# Goals

Use execution evidence to distinguish access-path, estimate, parameter, memory, and plan-history causes. Every exercise asks for a testable diagnosis, not a magic hint.

# Worked example

A parameterized report runs quickly for most customers but slowly for a few large customers. Capture Query Store intervals and plans, then execute the same statement with representative low/medium/high-cardinality values while recording compile context, actual plan, actual/estimated rows, logical reads, CPU, duration, grant, spills, and concurrency. If a plan is compiled on a small customer and reused for a large one, test PSP eligibility and dispatcher variants. Do not force the large-customer scan for all customers. Compare a supported automatic variant strategy, an alternative query shape, or controlled recompile against the same workload and write down compile overhead and stability.

# Exercises

1. An estimated plan shows a seek and actual plan shows 400,000 rows plus 400,000 lookups. Explain why “seek” did not make this cheap.
2. A Hash Match spills after receiving 50 times its estimated rows. Identify the earliest evidence to inspect and propose a safe experiment.
3. The actual plan's first estimate mismatch is at a filter on two correlated columns. Explain why a single-column histogram can miss the joint distribution.
4. One cached query plan is good for most account IDs and poor for a handful. Compare parameter sniffing, PSP, recompile, and Query Store plan forcing.
5. A search query uses `(@status IS NULL OR status = @status)`. Explain the seek/scan validity conflict and OPPO prerequisites.
6. A team changes compatibility from 160 to 170 and reports a regression. Give a rollout and Query Store rollback strategy.
7. A query has high estimated subtree cost but low elapsed time; another has low cost but high duration. Explain the difference and evidence needed.
8. A plan shows an implicit conversion and a warning. Determine how to verify which side converts, whether it affects seekability, and what data types should be aligned.
9. A Query Store forced plan is no longer successful after index changes. What should the operator inspect, and what is the rollback path?
10. A memory grant is ten times larger than peak used memory, reducing concurrency. Compare grant feedback, estimate correction, and an explicit hint.
11. Compilation CPU spikes for many concurrent identical `sp_executesql` batches on SQL Server 2025. Identify the release feature and its scope.
12. An actual plan shows parallel exchange skew. Explain why MAXDOP alone may not fix it.
13. SQL Server 2025 Query Store shows a regression only on a readable secondary. Explain how to verify secondary capture, identify the replica group, and apply or remove a scoped hint safely while accounting for preview status.
14. PSP is enabled, but a query has no dispatcher. Explain how to distinguish unsupported predicate shape from missing feature eligibility using Showplan and Extended Events; explain why three selected predicates can still produce more than three variants.

# Progressive hints

1. Multiply per-row lookup work by actual execution count; compare rows read with rows returned.
2. Find the first divergence, not just the spill icon; check stats, skew, predicates, and value class.
3. Histograms are limited; multi-column density is not a joint histogram.
4. Separate the general sniffing behavior from eligibility-driven PSP and the operational override of forcing.
5. A seek plan must remain correct when the optional parameter is NULL.
6. Use Query Store before and after, test representative parameters, and keep a compatibility rollback plan.

# Complete solutions

1. The seek can locate a broad range; the residual filter may discard rows only after reading them. Each actual qualifying row may trigger a lookup. Compare total logical reads with a scan or covering alternative; “seek” describes navigation, not total work.
2. Compare estimated/actual rows at the filter and its inputs, then inspect statistic freshness/distribution, predicate conversions, and parameter context. Correct the estimate cause or test eligible memory-grant feedback; verify repeated executions and concurrency. Do not begin by blindly increasing grants.
3. If predicates correlate, independence assumptions can multiply selectivities as if columns were independent. Inspect multi-column stats/density and actual distribution; test suitable statistics or query formulation and compare estimates across values.
4. Sniffing reuses the first compiled plan; PSP may build a dispatcher and variants for eligible skewed equality predicates. Recompile specializes each execution at compile cost. Query Store forcing pins a known plan and can fail or become stale. Test all options over the parameter distribution and monitor lifecycle/compile cost.
5. When status is NULL, the predicate is true for all rows and a scan may be needed; when non-NULL, seek may be better. OPPO in SQL Server 2025 requires compat 170 and enabled `OPTIONAL_PARAMETER_OPTIMIZATION`, and only eligible forms receive dispatcher variants. Verify actual variant metadata and runtime benefit.
6. Baseline Query Store plans/runtime/waits, stage compatibility change, replay representative workload, monitor regressions, and use Query Store plan forcing only as a temporary targeted mitigation when the prior plan is still valid. Roll back compatibility or clear forcing/hints according to the tested plan; retain evidence and revalidate after updates.
7. Subtree cost is a relative optimizer estimate from its model, not elapsed time. Compare logical/physical reads, CPU, waits, duration, parameter, concurrency, and plan operators; environmental waits or underestimation can reverse observed ranking.
8. Identify the convert expression in Showplan XML and actual predicate, compare declared/column types and collation, then test a correctly typed parameter/literal. Conversion on the indexed column can impair seekability; confirm with plan properties and reads rather than assuming every warning has the same effect.
9. Check forcing failure reason/state, plan validity, schema/index changes, compatibility and Query Store read/write/capacity. Unforce the stale plan or restore a validated plan; compare current unforced behavior and replace the force only after testing.
10. Check actual row estimates, operator memory requirements, grant feedback eligibility/persistence, and Query Store state. Fix row estimates where possible; feedback may converge over executions. Explicit grant hints can harm other values/concurrency and require revalidation.
11. SQL Server 2025 `OPTIMIZED_SP_EXECUTESQL` can serialize equivalent concurrent `sp_executesql` compilation work to reduce compilation storms. Validate its database-scoped configuration, application workload, and compile/runtime measurements.
12. Exchanges redistribute rows; one worker may receive a disproportionate share because of key/data skew or distribution requirements. Inspect per-thread rows and upstream estimates/keys, then address skew/query shape. MAXDOP changes worker count but cannot remove a fundamentally uneven distribution and may worsen CPU or latency.
13. Confirm Query Store is `READ_WRITE` on the primary and the secondary reports `READ_CAPTURE_SECONDARY` with the documented readonly reason. Join runtime-stat replica-group IDs to `sys.query_store_replicas`; failover can change roles, so never assume numeric IDs. Query Store for readable secondaries remains preview. If a scoped hint is justified, use `sys.sp_query_store_set_hints` with an ID obtained from the replica view, inspect `sys.query_store_query_hints` for applied/failure status, and document a clear-hint rollback and revalidation condition.
14. PSP currently requires eligible equality predicates and can select at most three interesting predicates. Check the compatibility level, CE/statistics and query shape, then inspect `parameter_sensitive_plan_optimization_skipped_reason` and the `psp_skipped_reason_enum` map via `sys.dm_xe_map_values`. A dispatcher in Showplan is direct evidence of engagement. Each selected predicate can have up to three cardinality buckets, so combinations can create more than three variants.

# Tests and edge cases

- Include NULL and non-NULL optional parameter values, common and rare skew values, empty and large result sets.
- Compare estimates with actual row counts at every major join/filter boundary.
- Separate compile CPU, execution CPU, elapsed time, reads, waits, grants, and spills.
- Test changes under representative concurrency and with the intended compatibility level/SET options.
- Check Query Store capture mode, read-write state, storage cap, cleanup policy, and plan-force/hint status before drawing conclusions from gaps.

# Reflection questions

Where did the first consequential estimate error occur? Which metrics prove the query improved? Which parameter class might regress? How will you detect and retire an override? Which evidence is durable in Query Store versus transient in the plan cache?

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
