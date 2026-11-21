# query performance indexes projection pagination split queries and compiled queries — Exercises and worked solutions

Sources: Microsoft's [efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying), [pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination), [single and split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries), [advanced performance topics](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics), and [performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis). EF Core 11.0.0 shipped on 2026-11-10; provider SQL and plan details must be verified in the target environment.

## Goals

Practice a repeatable query-performance investigation, design deterministic pagination, compare result shapes, and optimize only after identifying the dominant cost.

## Worked example

An API returns a newest-first product feed. It needs `Id`, `Name`, `Price`, and `CreatedAt`; each page has at most 40 rows. A stable cursor contains `(CreatedAt, Id)`. The LINQ shape should project only those values, apply tenant/authorization and search filters on the server, use a lexicographic cursor predicate consistent with descending order, order by both keys, and apply `Take(40)`. Then inspect SQL and an actual plan, verify an index supports tenant/filter/order, and measure rows, bytes, commands, and latency. The cursor does not replace authorization.

## Exercises

1. A page request uses `.OrderBy(x => x.CreatedAt).Skip(page * 50).Take(50)`. Improve semantics for next-page navigation and state when offset remains justified.
2. A blog query includes `Posts` and `Contributors`, each a collection. For a blog with 8 posts and 6 contributors, estimate joined rows and choose evidence to compare a split query.
3. A search endpoint returns full entities but displays only three fields. Explain the projection and tracking implications.
4. EF logs show the same query shape recompiling repeatedly. The application dynamically builds expression trees with constants. Diagnose and propose a correction.
5. The first request is slow for a model with hundreds of entities; warm requests are fast. Which optimization might help, what must be measured, and which optimization is unlikely to help?
6. A team wants to enable context pooling. List state-leak risks and a safe validation plan.

## Progressive hints

1. A timestamp may not be unique. Use a tie-breaker and cursor predicate matching order; random page jumps are a separate requirement.
2. Sibling collections form a product per parent. Count commands, duplicate rows/bytes, and consistency requirements rather than choosing by command count alone.
3. A DTO projection may omit unused columns and avoid entity tracking, but entity objects inside a projection may still be tracked.
4. Values should usually become parameters so the expression-tree shape remains stable; prefer ordinary captured values over expression APIs when possible.
5. Separate cold model initialization from database query latency. A compiled model targets first-use model startup, not SQL.
6. Pooled instances are reused across request scopes; inspect tenant fields, per-request services/configuration, manually opened connections, and other driver state.

## Complete solutions

1. For a unique ascending `(CreatedAt, Id)` order, remember both last values and apply `CreatedAt > lastDate || (CreatedAt == lastDate && Id > lastId)`, then `OrderBy(CreatedAt).ThenBy(Id).Take(50)`. Ensure the cursor preserves timestamp precision and the database index supports filters/order. Offset paging remains valid for arbitrary page jumps if the product needs them, but deep offsets can be costly and concurrent writes can shift page boundaries.
2. The single-query join can return `8 × 6 = 48` rows for one blog. Compare the actual command, rows, duplicate bytes, elapsed time, and allocation for one versus split. Split queries add commands/round trips and can see concurrent changes between statements; if one consistent snapshot is required, test a suitable transaction/isolation level. Projection of large unused parent columns may solve some duplication without splitting.
3. Project a DTO containing only the displayed fields. A projection containing no entity instances generally has no entity to track; a projection that also contains an entity may track that entity by default. Inspect generated SQL to confirm the columns are restricted. If the result is editable, define an explicit update path rather than assuming the DTO is tracked.
4. Embedding varying constants creates distinct expression trees and SQL literals, causing EF recompilation and possibly DB plan-cache pollution. Parameterize values and keep the query shape stable. Check the EF query cache hit-rate after warm-up and verify SQL/plan reuse; dynamic optional filters may still legitimately produce a finite set of shapes.
5. Measure first-use model initialization separately from DB connection and query time, and repeat across cold process starts. A generated compiled model may help when model initialization is a measured bottleneck. Explicit compiled queries target repeated query processing, not model startup; neither will make a slow DB plan fast.
6. `OnConfiguring` runs only when the pooled context is first created; do not depend on it for request-varying state. Ensure tenant/user state is set on every checkout, reset before return, and fail closed when missing. Restore manually modified connection/driver state before disposal. Load-test concurrent requests for cross-tenant leakage and compare latency/allocations against an unpooled baseline; keep separate context instances per concurrent operation.

## Tests and edge cases

- Two rows share the timestamp cursor key; the unique ID tie-breaker must return each exactly once.
- A cursor timestamp loses fractional precision during serialization; reproduce against database precision and preserve the stored value's exact precision.
- The result filter has low selectivity; an index may not be chosen, so compare actual rows/read counts.
- A page is canceled after a write; cancellation does not prove rollback, so use an idempotency/verification strategy for uncertain writes.
- A split result changes between its root and collection command; decide whether the endpoint tolerates this or requires a transaction snapshot.
- A pooled context is reused for a different tenant; ensure old state cannot influence a query filter.

## Reflection questions

1. Which measured value identifies whether the database, network, EF, or application dominates?
2. What correctness requirements must a cursor preserve besides a last row ID?
3. What evidence would justify adding a covering index, and what write cost would you check?
4. Which result-shape optimization would you try before compiled queries, and why?
5. How would you prove that pooling improved p95 without causing tenant-state leakage?
