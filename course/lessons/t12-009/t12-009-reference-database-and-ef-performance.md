# End-to-end performance engineering for web applications — Reference: EF Core query shape and SQL Server execution

## Scope and version

This lesson connects EF query generation to database execution and response behavior. Validate all changes with representative data and the deployed SQL Server/provider version.

## How this group fits the mental model

ORM and database are one data-access path, but they have separate costs: expression translation, command count, network round trips, database plan/execution, row transfer, materialization, and tracking. Diagnose each boundary before choosing an optimization.

## Supplied names explained

- `Query count and round trips` — Number of database commands and network exchanges. Multiple small queries may dominate latency even when each is inexpensive.
- `N+1 query pattern` — One query loads a parent set and then one additional query runs per parent. It multiplies round trips and should be detected through command logs/traces.
- `Projection and selected column count` — Selecting only needed fields reduces transfer and materialization. Projection must preserve authorization and business rules.
- `Rows read versus rows returned` — A query may examine many rows to return few. Compare actual plan/IO evidence and predicates; returned-row count alone can hide a scan.
- `Index seek versus scan evidence` — A seek navigates an index to a range/key; a scan reads a broader structure. Neither is automatically bad; selectivity, lookup cost, and workload determine whether the plan is appropriate.
- `Actual execution plan` — Runtime plan evidence including actual row counts and operators for an execution. Plans are workload/parameter-specific and collection overhead/permissions matter.
- `Cardinality estimation` — The optimizer’s estimate of row counts. Estimation errors can lead to a poor join/order/memory strategy; compare estimated and actual rows.
- `Parameter sensitivity` — A query plan suitable for one parameter distribution may perform poorly for another. Use Query Store and current SQL Server guidance before forcing a plan or changing query form.
- `Lock wait and blocking` — A session may wait for another transaction’s lock. Identify blocker, transaction duration, isolation behavior, and workload; adding an index or changing isolation has tradeoffs.
- `Connection pool wait` — The app may wait for a free database connection before command execution. Pool saturation can result from slow queries, too much concurrency, leaked/long-lived work, or a low limit.
- `Keyset pagination` — Continue from the last ordered key rather than skipping a large offset. It needs a stable unique ordering and has different random-page semantics.
- `Split query round trip tradeoff` — Splitting related data queries can reduce join duplication/cartesian explosion but adds round trips and may observe consistency differences unless transaction semantics are chosen.
- `Batching and bulk operations` — Combining writes can reduce per-command overhead, but bulk paths may bypass tracking, entity events, or concurrency logic. Confirm semantics before use.
- `Query Store regression comparison` — Query Store retains query/plan/runtime history to compare performance across time and plan changes. Retention and capture policies should be bounded and appropriate.

## Cross-item comparison

Reduce data and round trips first; then inspect plans and waits. Keyset pagination changes navigation semantics. Split queries trade row duplication for more round trips. Bulk operations trade ORM behavior for throughput. Query Store helps identify temporal plan regressions but does not replace workload reproduction.

## Examples

For a page showing 25 orders, project only displayed columns, filter/order in SQL, and paginate deterministically. Count commands to reveal N+1 behavior. Compare actual plan and IO with representative parameters. If a split query improves payload duplication but worsens p95 due to extra round trips, reconsider projection or loading shape.

## Common mistakes

- Calling a scan bad without selectivity and plan context.
- Benchmarking an empty database and extrapolating production behavior.
- Adding indexes without measuring write/maintenance costs.
- Replacing tracked writes with bulk updates without rechecking concurrency and audit behavior.
- Assuming compiled EF queries fix a poor SQL plan.

## Knowledge checks with answers

1. What is often more important than ORM compilation cost? Query shape, plan, rows, round trips, and transfer.
2. What does keyset pagination require? Stable ordering with a unique continuation key.
3. Why can a split query be slower? It may add network round trips and consistency complexity.

### Sources

- [EF Core performance diagnosis](https://learn.microsoft.com/en-us/ef/core/performance/performance-diagnosis)
- [EF Core efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying)
- [EF Core pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination)
- [EF Core single and split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries)
- [SQL Server query processing architecture](https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide?view=sql-server-ver17)
- [SQL Server Query Store](https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store?view=sql-server-ver17)
