# query performance indexes projection pagination split queries and compiled queries — Reference: Projection, row limits, pagination, and result transfer

## Scope and version

This lesson explains the supplied inventory through Microsoft's [efficient querying](https://learn.microsoft.com/en-us/ef/core/performance/efficient-querying), [pagination](https://learn.microsoft.com/en-us/ef/core/querying/pagination), [single and split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries), and [.NET 11 EF Core 11 release notes](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew). EF Core 11.0.0 shipped on 2026-11-10. Provider behavior, translation, and database limits vary; inspect actual commands and plans.

## How this group fits the mental model

Result shape controls the amount of work before it reaches application code: rows, columns, duplicated bytes, database commands, and materialized objects. Choose a bounded, deterministic shape first; then decide whether entity tracking, batched saves, or relationship loading fits the operation.

## Supplied names explained

- `Select projection` — use LINQ `Select` to ask for a scalar, anonymous object, or DTO rather than blindly materializing a whole entity. Projection affects SQL selection and can reduce transfer and client work. If the projection contains entity instances, those instances may still be tracked.
- `Project only required columns` — select the fields the caller actually needs. This is especially valuable when entities have large text/binary columns or joins repeat principal data. Verify generated SQL instead of assuming a projection was translated as expected.
- `Take` — bounds the maximum rows returned by the query when translated. Pair it with an appropriate order for paging; without an order, which rows are selected is not deterministic.
- `Skip` — requests that preceding rows be skipped, commonly implemented as an offset. Deep skips can require substantial database work, and concurrent changes can shift rows between requests.
- `Offset pagination` — combine a deterministic order with `Skip` and `Take`. It supports page-number navigation but often costs more as offsets grow and can skip/duplicate rows under concurrent changes. Use only when arbitrary page jumps justify those tradeoffs.
- `Keyset pagination` — continue after a remembered key value with a predicate such as `Id > lastId`. It is efficient for forward/backward traversal with a supporting index; it does not inherently support jumping to page N.
- `Seek pagination` — another name for keyset-style pagination: the cursor values become a seek predicate over the ordered keys. For compound ordering, form a lexicographic predicate that includes every key and direction.
- `Unique pagination ordering` — order by enough columns to uniquely identify position, usually ending in a key. Relational results have no default order. If the primary sort key ties, add a deterministic tie-breaker in both `ORDER BY` and cursor predicate.
- `Large-offset cost` — the server may have to locate and discard all earlier rows before returning the requested page. A suitable index helps but does not make arbitrary deep offsets equivalent to a keyset seek.
- `AsAsyncEnumerable streaming` — expose rows as an asynchronous sequence so application code can consume incrementally. It can reduce list buffering but holds the data reader/connection while consumed; some provider/EF paths internally buffer, so measure memory and resource lifetime.
- `ToList buffering` — `ToListAsync` reads the sequence and stores all result objects in memory before returning. It simplifies repeated access and closes enumeration before later work, but memory scales with result size.
- `AsNoTracking read-only query` — skips attaching entity results to the context's change tracker. It fits read-only entity workflows; it does not remove entity materialization, and later mutation will not be persisted by that context unless explicitly attached/handled.
- `ExecuteUpdate` — issues a set-based update from a query without loading each row. The context's tracked copies are not synchronized; concurrency checks, affected-row verification, and `SaveChanges` interceptors/logic need deliberate handling.
- `ExecuteDelete` — issues a set-based delete without materializing each entity. Tracked copies can remain stale. Check provider translation, filters, cascades, and affected-row semantics.
- `Bulk operation does not use change tracker` — set-based update/delete executes against the database directly; it does not discover per-entity changes or keep tracked objects synchronized. This can reduce round trips and allocations, but changes the behavior and safeguards expected from tracked `SaveChanges`.
- `Batching SaveChanges commands` — EF can group multiple modification commands into fewer database round trips according to provider capabilities and settings. Batching is not one SQL command for every provider; transaction semantics and command limits remain relevant.
- `MaxBatchSize` — relational provider option that caps commands in a batch. A lower cap can avoid provider/database limits but increase trips; a higher cap is not automatically faster. Benchmark for the actual provider and workload.
- `Parameter count limit provider boundary` — database/provider command parameter ceilings differ. Large `Contains` lists or bulk operations can exceed them; chunk safely or use provider-specific table-valued/array/temp-table mechanisms from the relevant provider lesson.
- `Network round trip count` — each command has latency and server coordination cost in addition to SQL execution. Count actual commands, including lazy loads, split query parts, retries, and application loops.
- `Cartesian explosion` — sibling collection joins form combinations of child rows per parent (for example, 8 posts × 6 contributors produces 48 rows for that parent). This can multiply transferred bytes and work even when EF later reconstructs a smaller object graph.
- `Single-query loading` — retrieve root and related data through one relational query, usually with joins. It minimizes command trips but may duplicate parent data or multiply sibling collections.
- `Split-query loading` — retrieve roots and collections with separate SQL commands to reduce join duplication. It adds round trips and can see concurrent changes between commands; use an appropriate transaction/isolation policy if consistency requires it. EF11 prunes some unnecessary reference joins/order keys but does not erase these tradeoffs.

## Cross-item comparison

`Offset pagination` works for arbitrary page numbers while `Keyset pagination` suits sequential navigation and avoids growing skip work when indexed. `AsAsyncEnumerable streaming` lowers application-side full-result buffering while `ToList buffering` supports repeated in-memory use at memory cost. `Single-query loading` trades fewer commands for join duplication; `Split-query loading` trades less duplication for extra commands and a consistency window. `ExecuteUpdate`/`ExecuteDelete` avoid entity loading but bypass tracked change behavior; they are not semantically identical to per-entity `SaveChanges`.

## Examples

For a descending feed ordered by `(CreatedAt, Id)`, use a cursor containing both values. The next-page condition is `CreatedAt < cursorDate || (CreatedAt == cursorDate && Id < cursorId)`, followed by the same descending order and a bounded `Take`. The unique tie-breaker prevents gaps where timestamps match. Preserve timestamp precision when encoding the cursor.

For a read-only result, project directly to a response DTO. If returning an entity graph with two sibling collections, inspect the row count for one query and compare it with split query command count and consistency needs. A no-tracking query still materializes entities; a DTO projection may do less work.

## Common mistakes

- Applying `Take` without a unique order and assuming stable pages.
- Thinking `AsAsyncEnumerable` guarantees no internal buffers or releases the connection before enumeration ends.
- Expecting `AsNoTracking` to avoid all object creation.
- Using set-based writes and then trusting tracked entities to reflect database state.
- Increasing `MaxBatchSize` without considering provider/database parameter or command limits.
- Assuming a one-command query is always cheaper than several commands, or that split loading is always faster.

## Knowledge checks with answers

1. **What makes pagination deterministic?** A fully unique ordering and a cursor predicate that matches all ordering keys and directions.
2. **Why can a projection improve response latency?** It can reduce columns, network transfer, entity construction, and tracking.
3. **What must be reconsidered after `ExecuteUpdate`?** Tracked-state freshness, concurrency detection, affected-row verification, and logic normally run by `SaveChanges`.
4. **When can split loading be a bad choice?** When round-trip latency dominates, result duplication is small, or separate statements violate required snapshot consistency.
