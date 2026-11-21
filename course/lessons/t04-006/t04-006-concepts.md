# loading navigation properties eager explicit lazy and N+1 — Core concepts and how they fit together

This lesson follows Microsoft [eager loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager), [explicit loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/explicit), [lazy loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/lazy), and [single/split query](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries) guidance. EF Core 11's current reference-join optimizations are described in the [What's New page](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew); its banner is stale, so release status is confirmed by the [final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Learning objectives

Choose a loading strategy from a use case; recognize when an entity graph query is more expensive than a projection; explain filtered-include and fix-up behavior; detect N+1; and compare single/split SQL by round trips, row counts, memory, and consistency.

## Prerequisites

Know EF relationships, navigation fix-up, tracking modes, and LINQ translation. A navigation is a model access path, not a promise that related rows are present or loaded.

## Core concepts

### Eager, explicit, and lazy are timing policies

- Eager loading uses `Include`/`ThenInclude` in the original query.
- Explicit loading calls `Load`/`LoadAsync` later at a visible decision point. A navigation's `Query()` gives an `IQueryable` to filter or aggregate without materializing every related entity.
- Lazy loading occurs transparently when a navigation is accessed, typically through proxies or `ILazyLoader`. It can issue SQL in loops, mapping, view rendering, and serializers.
- Projection selects the required read shape, often fewer columns/entities than an `Include` graph.

### Include shape and tracking fix-up

`ThenInclude` traverses deeper paths. Multiple includes may share a path. Filtered include supports `Where`, ordering, `Skip`, and `Take` on collection navigation. Only one unique filter set is allowed for a collection path (or repeat the same filter on repeated include paths). In a tracking query, previously tracked related entities can be added by navigation fix-up even if they fail the filter; EF marks that navigation loaded, so explicit/lazy loading will not fill omitted rows. Use a fresh context or no-tracking query when the filtered result must be isolated.

`AutoInclude` adds model-wide navigation loading; it can unexpectedly expand query graphs. `IgnoreAutoIncludes` suppresses user-configured auto-includes, but owned-type navigations are auto-included by convention and are not suppressed by that method.

### Lazy loading and N+1

If a result contains N parents and touching each navigation triggers one query, the application may issue 1+N queries. The number of queries is only one symptom: total rows, payload, latency, and plans matter too. Proxy lazy loading requires an inheritable entity and overridable (typically virtual) navigation; it uses proxy instances. `ILazyLoader`/delegate injection avoids proxy inheritance/virtual requirements but couples entity access to a loader service/delegate. Accessing an unloaded navigation after context disposal cannot perform the database load. Serialization may traverse unloaded properties, trigger queries, expose unintended data, or encounter cycles.

### Single and split queries

A relational single query joins included data. Multiple sibling collection joins can produce a cross product: 10 posts and 10 contributors for one blog yield 100 joined rows. Parent columns can also be repeated for every child. A nested collection path does not necessarily produce the same sibling cross product, but can still transfer duplicated data.

Split queries issue a root query plus related-data queries. They reduce join multiplication but current EF behavior uses additional network round trips. On providers without multiple active result sets, earlier results may be buffered before later queries. Concurrent writes between statements can make the assembled graph inconsistent; a snapshot/serializable transaction may help at a cost. EF Core 11 prunes some redundant to-one joins from split queries and redundant reference keys from `ORDER BY`, but still evaluate actual SQL and plan.

### Loading status is metadata, not collection truth

`NavigationEntry.IsLoaded` indicates EF considers a navigation loaded. It does not prove a filtered include returned every related database row. Conversely, an initialized collection can be empty while the database contains rows. Inspect the query/load path and tracking state, not just property nullness/count.

## Mechanisms and relationships

`AsSingleQuery` forces joined loading; `AsSplitQuery` requests split execution. `QuerySplittingBehavior` and `UseQuerySplittingBehavior` configure defaults. EF may warn when multiple collections are loaded without an explicit choice. `MARS` (SQL Server's Multiple Active Result Sets) can alter whether multiple commands/readers can be active and whether split-query buffering is needed; it does not make arbitrary context operations thread-safe.

## Worked examples

```csharp
var summaries = await db.Orders
    .Where(order => order.CreatedAt >= cutoff)
    .Select(order => new OrderSummary(
        order.Id,
        order.Customer.Name,
        order.Lines.Count))
    .ToListAsync(cancellationToken);

var topPosts = await db.Entry(blog)
    .Collection(x => x.Posts)
    .Query()
    .Where(post => post.IsPublished)
    .OrderByDescending(post => post.PublishedAt)
    .Take(5)
    .ToListAsync(cancellationToken);
```

The projection loads a read shape; the explicit query fetches a bounded subset. Neither requires loading every related entity merely to display a summary.

## Misconceptions and edge cases

- `Include` is not a performance optimization by itself; it can expand rows, columns, and entity materialization.
- Filtered include plus a reused tracking context can contain entities outside the filter.
- Lazy loading can create N+1 even when each property access looks harmless.
- Split query is not synonymous with N+1: it issues a bounded number of queries based on include paths, not one per parent.
- Split queries trade join duplication for round trips, intermediate buffering, and consistency concerns.
- EF11 improves some reference join SQL but does not remove the need to measure provider-specific output.
- `IsLoaded` can be true for a filtered, intentionally partial collection.
- `IgnoreAutoIncludes` does not suppress owned navigations configured as auto-included by convention.

## Knowledge checks with answers

1. **Which strategy is best for a small API response containing three fields?** Projection is usually the clearest way to select only those values.
2. **Why can filtered include return out-of-filter entities?** Tracking navigation fix-up adds previously tracked related entities.
3. **Why is split query not N+1?** Query count is usually bounded by included collections, not multiplied by each root row.
4. **What does EF11 optimize here?** Some redundant to-one joins and reference ordering keys, not the core split-query round trips/consistency tradeoffs.
5. **Can `IgnoreAutoIncludes` disable owned navigations?** No; owned navigations remain included by convention.
