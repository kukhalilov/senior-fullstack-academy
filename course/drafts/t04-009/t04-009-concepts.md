# query performance indexes projection pagination split queries and compiled queries — Core concepts and how they fit together

Sources: Microsoft's [efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying), [advanced performance topics](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics), [pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination), [single and split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries), [performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis), and [EF Core 11 release notes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew). EF Core 11.0.0 shipped on November 10, 2026. Its relational improvements include pruning some unnecessary reference joins and ordering keys, better GroupBy translation, and stripping some no-op casts. These improve particular translations; the provider, database plan, and workload still determine performance.

## Learning objectives

Separate database, network, and EF costs; explain why generated SQL is not a performance verdict; select projection, pagination, indexing, loading, and tracking strategies; and build a repeatable benchmark instead of guessing.

## Prerequisites

Understand LINQ query composition, relational tables and joins, indexes, `DbContext`, change tracking, and async database calls. Provider-specific physical plan operators belong in the database track; the workflow here applies across providers.

## Core concepts

### Diagnose before changing code

Capture a baseline with representative row counts, skew, parameter values, network latency, and concurrency. Observe end-to-end latency, p50/p95/p99 where relevant, command count and duration, rows/bytes returned, allocations, CPU, and database waits. Tiny test fixtures hide problems. Separate cold start (first model initialization/query) from warm repeated execution. Do not infer that a LINQ expression is faster because it looks simpler.

Use EF command logging or diagnostics in a safe environment, `ToQueryString` to inspect translated SQL, and query tags to find important statements in database monitoring. `ToQueryString` does not report actual runtime parameters, actual plan, rows, or elapsed time. Inspect the database's actual execution plan and compare estimated with actual rows. Avoid exposing sensitive parameter values in production logs.

### Reduce work and bytes early

A UI card query that materializes whole entities may transfer unused columns and pay entity construction and tracking costs. Project only needed values into a DTO or anonymous object. Entity instances embedded in a projection can still be tracked by default; a pure scalar/DTO projection generally has no entity to track. Filter before results cross the connection and bound page size. Projection can also prevent transferring repeated large principal columns in collection joins.

`AsAsyncEnumerable` streams results as the consumer advances; `ToListAsync` buffers the full result. Streaming can bound application result-list memory, but the database can still sort or materialize internally. EF may internally buffer for retry strategies or split queries on providers unable to keep multiple result sets active. Streaming holds a reader/connection during enumeration and complicates error handling. It is not automatically lower end-to-end cost.

### Align query shape and indexes

The database optimizer chooses the access plan. An index is not guaranteed to be used just because it exists. A SARGable predicate can use an index search efficiently; wrapping an indexed column in a function or applying incompatible conversions/collation may prevent a seek unless an expression/computed-column index is available. For a composite index `(A, B)`, leading key order matters: it commonly supports lookup beginning with `A`, not a query on `B` alone. Included/covering columns may avoid lookups but increase index storage and write cost. A filtered index reduces footprint for a subset, but query predicates and provider/database behavior must align.

Inspect plans for scans, seeks, lookups, sorts, spills, and cardinality errors, then test representative parameters. Parameterization usually stabilizes EF query shapes and may reuse database plans; skewed values can still make one plan unsuitable for every execution. Remedies are database- and version-specific: for example, SQL Server's Parameter Sensitive Plan optimization has eligibility rules and requires the relevant compatibility level. Tags help attribute SQL; never put secrets or untrusted text in them. A client-side filter after materialization can turn a selective server query into a table-sized transfer. EF11 removes some redundant casts in generated SQL, but application/provider type mismatches can still harm index use.

### Paginate with deterministic semantics

Offset paging (`Skip`/`Take`) supports arbitrary page jumps, but the database may scan and discard preceding rows; concurrent inserts/deletes can shift pages. Keyset/seek paging remembers the last key and adds a lexicographic `WHERE`, usually scaling better for next/previous navigation with a matching index. Every strategy needs a fully unique order. For `(CreatedAt, Id)`, both ordering and cursor predicate must include both values, with `Id` breaking ties. Nulls, sort direction, collation, timestamp precision lost while serializing a cursor, and mixed ascending/descending keys need deliberate predicates. Keyset avoids some shifts from changes before the cursor but does not freeze the entire result set. Choose snapshot/consistency semantics if the product requires them.

### Choose relationship query shape

A single SQL query with sibling collection joins multiplies rows: 8 posts and 6 contributors for one blog can yield 48 rows. It may repeat large parent columns too. A split query avoids that cross product by querying roots and collections separately. The trade is more round trips, possible buffering, and a window for concurrent changes to make the combined graph inconsistent. A transaction with suitable isolation may be needed for a consistent snapshot, at extra cost. Review actual commands; counts and SQL depend on provider, query, and EF release. EF11 prunes some redundant reference joins and order keys in include SQL, but does not remove every query-shape tradeoff.

### Tracking, bulk commands, and materialization

Tracking performs identity resolution and stores original values, costing memory and CPU as a graph grows. `AsNoTracking` fits read-only entity results. `AsNoTrackingWithIdentityResolution` deduplicates repeated entity keys with a temporary tracker without attaching results to the context. DTO projection can avoid entity materialization entirely. `ValueComparer` can add snapshot, equality, and hash work for converted or mutable values. Measure allocations and graph size.

Set-based `ExecuteUpdate` and `ExecuteDelete` change rows in the database without loading or synchronizing tracked instances. They do not automatically use ordinary `SaveChanges` change detection or concurrency-token handling; include concurrency predicates and inspect affected-row counts where needed. Other tracked objects can become stale. They are not universal replacements for `SaveChanges`.

### Optimize EF overhead only when proven

Normal queries are cached by expression-tree shape, so different parameter values can reuse compilation. Dynamically generating different tree shapes or embedding constants can miss EF's cache and pollute a database plan cache. The query-cache hit-rate metric should approach 100% after warm-up for stable application query shapes; investigate persistent misses. Explicit compiled queries (`EF.CompileQuery`/`EF.CompileAsyncQuery`) skip cache lookup and help only when EF query processing is material compared with database/network costs. They target one EF model and use simple scalar parameters.

DbContext pooling reuses context instances; connection pooling belongs to the provider/driver and is independent. Context pooling targets setup overhead only. A pooled instance is reused: `OnConfiguring` runs at creation, and application-owned mutable state (tenant IDs, manually opened connections or driver state) must be initialized/reset so it cannot leak. A context is not thread-safe; parallel operations need separate contexts. Compiled models target first-use model initialization for very large models; regenerate them when the model changes. None of these fixes poor SQL.

## Mechanisms and relationships

Use this sequence: (1) reproduce and measure, (2) locate application, EF, network, or database delay, (3) inspect SQL/plan/result shape, (4) reduce rows, columns, round trips, and duplication, (5) align indexes to exact predicates/order, (6) remeasure, then (7) tune materialization or EF setup. Change one factor at a time and retain the baseline. A DB improvement can increase application memory; fewer commands can transfer more duplicate bytes; lower p50 can hide worse tail latency under contention.

## Worked examples

For a newest-first feed, assume `(CreatedAt, Id)` is unique and both sort descending. The next-page predicate is `CreatedAt < cursorDate || (CreatedAt == cursorDate && Id < cursorId)`, followed by the same order and bounded `Take`. Build an index supporting these conditions, verify null/precision behavior, and inspect the actual plan. Select only card columns. Validate the cursor and keep authorization predicates in the query; a cursor is not authorization.

For a blog with two sibling collections, compare command count, rows, transferred bytes, and latency for one query and a split query. If a large `Blog.Description` is unused, projection may remove its duplication without splitting. If split loading is selected and a single consistent snapshot is required, evaluate transaction isolation with the database. Choose from evidence, not a rule that split is always faster.

## Misconceptions and edge cases

- A compiled query does not make a table scan fast or create a stored procedure.
- An index may be ignored, harm writes, or fail to help a low-selectivity filter.
- Stable ordering needs a unique tie-breaker; a primary key is not implicitly ordered.
- Keyset paging is efficient for sequential traversal but does not naturally jump to arbitrary pages or guarantee one snapshot across requests.
- `ToListAsync` is not required for async I/O; streaming can hold resources longer and client operators after `AsAsyncEnumerable` run in application code.
- `AsNoTracking` still materializes requested entity objects.
- Context pooling is not connection pooling; application-owned state can leak across requests if not reset.
- Parallel operations on one `DbContext` are unsupported; use separate contexts.
- EF11 query improvements are specific optimizations; still inspect provider SQL and actual plans.

## Knowledge checks with answers

1. **Why can DTO projection help?** It can reduce selected columns, network bytes, materialization, and tracking; inspect the query to ensure unused data is actually omitted.
2. **When is keyset pagination preferable?** Sequential navigation over a large ordered set with a unique cursor and matching index. Offset remains useful for arbitrary jumps.
3. **What justifies adding an index?** A representative slow query and actual plan showing the bottleneck, followed by measured benefit including write/storage costs.
4. **Why can split queries be slower?** Extra round trips, possible buffering, and consistency requirements can outweigh fewer duplicated rows.
5. **What do persistent EF query-cache misses suggest?** Inspect dynamic query shapes, embedded constants, and unstable query construction.
6. **When use context pooling?** When measurements show context setup matters and all state/driver resources are safely reset between uses.
