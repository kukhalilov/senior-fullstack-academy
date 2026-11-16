# query performance indexes projection pagination split queries and compiled queries — Reference: Database indexes, query shape, and generated SQL

## Scope and version

This lesson follows Microsoft's [efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying), [advanced performance topics](https://learn.microsoft.com/en-us/ef/core/performance/advanced-performance-topics), [pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination), [query diagnostics](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis), and [EF Core 11 changes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew). EF Core 11.0.0 shipped on 2026-11-10; indexes and physical plans remain database/provider concerns.

## How this group fits the mental model

EF translates a query expression to provider SQL; the database optimizer chooses how to execute it. Index alignment matters only when the actual query predicates/order and data distribution allow the optimizer to benefit. Inspect both EF output and the database's actual plan.

## Supplied names explained

- `Database index use` — an index is an access structure the database may choose for filtering, ordering, joining, or covering requested data. Its presence does not guarantee use; selectivity, statistics, query shape, and cost estimates matter.
- `SARGable filter` — a search argument shaped so the optimizer can use an index predicate efficiently. A direct range/equality on a column is often more seekable than applying a function to that column. Exact behavior is database-specific.
- `Composite index prefix` — a multi-key index is generally most useful for predicates using its leading key columns. An index `(TenantId, CreatedAt)` can support tenant-scoped time ordering; it usually cannot efficiently seek on `CreatedAt` alone.
- `Index key order` — column sequence and ascending/descending direction affect which filters and orderings an index can satisfy. Choose from measured query patterns, including equality prefixes followed by range/order columns.
- `Covering index` — an index contains all columns needed by a query (as keys or provider-specific included columns), avoiding extra row lookups. Coverage reduces reads but wider indexes cost storage and slow writes.
- `Filtered index` — an index contains only rows meeting a database-specific predicate. It can reduce size and maintenance for a stable subset, but the query must imply compatible conditions for use.
- `Function on indexed column` — applying a function/cast/collation to a column can prevent a normal index seek. Possible solutions include changing predicate shape, using a computed/expression index, or matching types/collations; verify the real plan.
- `Collation mismatch` — comparison semantics (case, accents, sort order) can differ between a column, expression, and query/database collation. Applying a different collation to an indexed column may prevent normal index use; choose consistent schema/query semantics or a compatible index, and verify provider/database behavior.
- `Client-side filter cost` — filtering after materialization means rows have already crossed the network and may have been allocated/tracked. Keep translatable selective filters server-side; since EF Core 3, most unsupported client evaluation inside a filter throws rather than silently downloading all rows.
- `Query plan inspection` — use database tooling to view actual operators, row estimates/counts, reads, sorts/spills, and warnings for a representative execution. Estimated plans alone may not show runtime cardinality or waits; protect sensitive values when capturing plans.
- `ToQueryString` — EF's debugging extension returns a SQL representation of an `IQueryable`. It helps inspect translation but is not a runtime plan, timing report, or guarantee that the displayed SQL is exactly how every command executes.
- `Database command logging` — EF diagnostics/logging expose executed commands, duration, and parameters according to configuration. Use structured logging and avoid leaking sensitive data; aggregate command counts and correlate with database telemetry.
- `Query tags` — annotations added to query SQL to identify its source in logs and database monitoring. Keep tags stable, concise, and free of secrets or untrusted input.
- `TagWith` — LINQ extension that adds a literal query comment/tag to generated SQL. It supports attribution, not query optimization by itself; dynamic tag variation can also complicate observability and cache behavior.
- `Parameterization` — represent values as parameters rather than embedding them as varying SQL literals. EF caches by expression-tree shape; parameterized values often reuse EF compilation and database plan cache entries. Some databases may sniff values or need parameter-sensitive strategies.
- `Parameter-sensitive plan` — one parameterized plan may perform poorly for different value distributions (for example, rare versus common tenant). Diagnose with actual plans and database tools before choosing recompilation, plan variants, or other provider/database-specific remedies.
- `Explicit compiled query` — application-compiled EF delegate that bypasses normal EF query-cache lookup for a fixed query shape. Use only after profiling shows EF expression processing matters; it does not fix SQL/database work.
- `EF.CompileQuery` — creates a synchronous compiled-query delegate for reuse across contexts of one model. It has model and parameter-expression restrictions; benchmark against the already cached ordinary query.
- `EF.CompileAsyncQuery` — creates the asynchronous compiled-query delegate; it can return an async enumerable or scalar task-like result based on query shape. Use simple scalar parameters and a compatible fixed model.
- `Compiled query model restriction` — a compiled delegate is valid for a single EF model. If instances of the same context type are configured with genuinely different models (such as per-tenant model variants), one compiled query cannot safely cover them all.
- `Compiled query benchmark threshold` — there is no universal row count or percentage threshold. Query caching already removes much compilation cost; compare warmed, equivalent executions and ensure EF overhead is a meaningful part of latency before adding complexity.
- `Query cache hit rate` — EF Core metric showing how often query execution uses its internal query cache. For stable query shapes it should approach 100% after warm-up; persistent misses suggest unstable/dynamic shapes or constants.
- `Query compilation overhead` — EF's expression processing and translation work before executing a query. It matters for very fast/local or high-volume workloads, but network and database work usually dominate; measure before optimizing it.

## Cross-item comparison

`ToQueryString` shows translation, while `Query plan inspection` shows the database's chosen execution and, with an actual plan, runtime evidence. `Parameterization` improves reuse for stable shapes, but a `Parameter-sensitive plan` can still need database-specific handling. An `Explicit compiled query` skips EF cache lookup; normal queries are already cached by shape, so benchmark before choosing `EF.CompileQuery` or `EF.CompileAsyncQuery`. `Covering index` can reduce lookups while increasing write/storage costs.

## Examples

For a tenant feed, the predicate is `TenantId == tenant && CreatedAt < cursor`, ordered by `TenantId`, then `CreatedAt`, then unique `Id`. An index beginning with tenant and followed by the ordering keys may support it; confirm using a representative actual plan and data distribution. Do not wrap indexed date columns in a formatting function to compare dates.

For query diagnosis, first capture the exact EF command and its duration, then run it with representative values in the database's plan tool. Compare estimated and actual rows, logical reads, and sort/spill behavior. A generated query string by itself cannot establish that the index is used.

## Common mistakes

- Creating an index for every filter without measuring write costs or selectivity.
- Treating `ToQueryString` as proof of plan choice or runtime parameter values.
- Embedding constants into dynamic expression trees, causing repeated compilations/cache pollution.
- Assuming a compiled query must be faster than a stable cached query.
- Logging parameter values or placing user input in query tags.
- Rewriting query semantics to force a seek without verifying correctness and plan behavior.

## Knowledge checks with answers

1. **Why might the database ignore an index?** The optimizer estimates another plan cheaper, predicates are not seekable, statistics/data distribution differ, or the index order does not match.
2. **Does `ToQueryString` prove a query is fast?** No; inspect the actual plan and runtime measures.
3. **Why parameterize dynamic query values?** Stable expression/SQL shape improves reuse and avoids repeated compilation or plan-cache pollution.
4. **What is the safe way to decide on compiled queries?** Profile first, compare warmed equivalent executions, and confirm a single model/simple parameter constraints fit.
