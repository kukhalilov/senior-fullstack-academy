# loading navigation properties eager explicit lazy and N+1 — Exercises and worked solutions

Source basis: Microsoft [eager loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager), [explicit loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/explicit), [lazy loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/lazy), [single/split queries](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries), and the [EF Core 11 final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Goals

- Select a loading strategy that matches data needed and interaction timing.
- Detect N+1 and sibling-collection multiplication from SQL and query counts.
- Account for tracking fix-up, filtered includes, and loaded-state metadata.
- Evaluate split query round trips, buffering, and consistency rather than choosing by slogan.

## Worked example

An order summary needs order number, customer display name, and count of lines. A detail panel later shows the latest five line items.

```csharp
var summary = await db.Orders
    .Where(order => order.Id == id)
    .Select(order => new OrderSummary(
        order.Number,
        order.Customer.DisplayName,
        order.Lines.Count))
    .SingleAsync(cancellationToken);

var order = await db.Orders.SingleAsync(x => x.Id == id, cancellationToken);
var latestLines = await db.Entry(order)
    .Collection(x => x.Lines)
    .Query()
    .OrderByDescending(line => line.CreatedAt)
    .ThenByDescending(line => line.Id)
    .Take(5)
    .Select(line => new LineSummary(line.Id, line.Description))
    .ToListAsync(cancellationToken);
```

The summary does not materialize the full graph. The detail query runs only when needed and is bounded. The unique tie-breaker stabilizes the selected top rows.

## Exercises

1. A controller loops over 80 blogs and reads `blog.Posts.Count`. Logs show 81 SQL commands. Diagnose and fix it without loading all posts.
2. A tracking context first loads all `Order` rows, then queries customers with a filtered include for orders over $1,000. The navigation contains lower-value orders too. Explain and repair.
3. A query includes `Posts` and `Contributors` collections on each blog. One blog has 12 posts and 8 contributors. Estimate single-query joined row multiplicity and give two alternatives.
4. A developer sets `AutoInclude` for a large `AuditEvents` collection. Later every query on `User` becomes slow. Diagnose and remediate.
5. Describe when `IgnoreAutoIncludes` will not stop a navigation from being loaded.
6. A proxy-lazy-loaded entity is serialized after its context has been disposed. Explain likely failure modes and the preferred API response design.
7. A query uses `AsSplitQuery` and reports 3 SQL commands. Is that N+1? What other measurements matter?
8. Concurrent writes happen between root and child statements of a split query. Explain consistency options and costs.
9. A filtered include returns only recent children and `IsLoaded` is true. Why won't `LoadAsync` fetch the rest?
10. Explain difference between `Collection(...).LoadAsync()` and `Collection(...).Query().CountAsync()`.
11. What effect may SQL Server MARS have on split-query buffering and what does it not permit?
12. In the EF Core 11 release line, what include SQL shape improved and which major split-query tradeoffs remain?

## Progressive hints

1. The query is a classic per-root lazy load. Aggregate the count server-side in projection or use a grouped/batched query.
2. Tracking fix-up uses all previously tracked matching relationship entities. Use a fresh context or no-tracking result for an isolated filtered graph.
3. Sibling joins can return 12×8 = 96 combinations for that blog. Consider split query or project only needed values.
4. AutoInclude is implicit graph expansion. Remove it or load only in targeted queries; use `IgnoreAutoIncludes` for user-configured paths on selected queries.
5. Owned-type navigations are auto-included by convention.
6. Accessing unloaded navigation can attempt to use disposed context; serialization can also trigger N+1/cycles. Return DTOs with explicit loaded fields.
7. No, bounded split statements differ from per-parent N+1. Measure command count, rows/bytes, duration, buffering, plans, and consistency.
8. Use snapshot/serializable transaction if point-in-time consistency is required and supported; account for locks/version-store/performance costs.
9. Filtered include marks the navigation loaded; EF assumes no further load is needed despite omitted rows.
10. `LoadAsync` materializes children; `Query().CountAsync()` sends an aggregate and returns count only.
11. MARS can permit multiple active readers and affect intermediate buffering. It does not make a DbContext safe for parallel operations.
12. EF11 prunes some redundant to-one joins in split queries and redundant reference keys in ordering; round trips, buffering, and multi-statement consistency remain.

## Complete solutions

1. `blog.Posts.Count` triggers one lazy query for each blog. Project counts in SQL (`Select(b => new { b.Id, Count = b.Posts.Count })`) or execute one grouped count query for the selected blog IDs. Do not eagerly materialize every post solely for counts.

2. The same context tracks the lower-value orders, and navigation fix-up adds them to the tracked customer collections. Use a new context or `AsNoTracking` for the filtered query, and return a DTO if the API needs a strictly filtered set. `IsLoaded` can still be true for this partial result.

3. Approximately 96 joined rows can be returned for a blog with 12×8 sibling child combinations (plus outer-join behavior for empty sets). Alternatives: `.AsSplitQuery()` to avoid cross-product duplication, or a DTO projection that fetches only needed fields/aggregates.

4. Remove model-wide auto-inclusion for unbounded audit events. Query them only in audit-specific endpoints with filters/paging. For a user query, `IgnoreAutoIncludes()` suppresses user-configured rules (but not owned navigations). Check generated SQL and all paths that return `User` indirectly.

5. Owned navigations are configured for auto-inclusion by convention; `IgnoreAutoIncludes` does not suppress them.

6. Accessing an unloaded navigation after context disposal can throw because the lazy loader cannot query. Before disposal, serialization can issue many hidden queries or traverse cycles/large graphs. Project a deliberate DTO while context is alive and serialize it; avoid returning persistence entities.

7. Three split statements are a fixed, query-shape-based count, not one per each root, so not N+1. Measure latency and command count, result rows/bytes, intermediate buffer memory, database plans, consistency requirements, and effect of reference joins/provider version.

8. Each statement may see a different committed state depending on isolation. If a consistent graph is required, execute under snapshot/serializable isolation where supported, but account for version-store pressure, locks, blocking, retries, and longer resource retention. If eventual/inconsistent snapshot is acceptable, state that contract explicitly.

9. A filtered include sets `NavigationEntry.IsLoaded` to true; EF will not attempt another explicit/lazy load. Use a fresh context or issue a separate explicit query and represent the partial result separately.

10. `LoadAsync` retrieves and materializes all related entities into the navigation (subject to current filters/tracking). `Query().CountAsync()` lets provider compute count, usually transferring one scalar and avoiding entity materialization.

11. MARS can permit multiple active data readers and change buffering needs when split statements are consumed. It does not allow simultaneous EF operations on the same context and does not eliminate extra round trips or consistency window.

12. EF Core 11 removes some unnecessary to-one joins from split collection statements and redundant reference keys from `ORDER BY`; exact gains depend on shape/provider. Split mode still uses several statements/network round trips, may buffer earlier results, and can observe concurrent changes between statements.

## Tests and edge cases

- Assert SQL command counts for list endpoints and fail performance tests on unbounded N+1 regressions.
- Test filtered includes with both a fresh context and pretracked related rows.
- Verify one unique filter set per collection path and loaded-state behavior.
- Compare sibling collection row counts and payload under single vs split mode.
- Exercise both empty and large child collections.
- Test lazy loading after disposal and serialization without EF entities in the response.
- Measure split-query buffering on the production provider with and without supported MARS/multiple reader settings.
- Test concurrency/transaction isolation if a consistent graph is required.
- Verify EF11 SQL against the actual provider; do not port an optimization expectation from SQL Server to another engine without evidence.

## Reflection questions

- What data does this response actually need?
- How many SQL commands and rows does each strategy execute/return?
- Could this navigation be triggered outside the method where it was requested?
- Does the result need a consistent point-in-time graph?
- Would a DTO projection express the use case more directly than an entity graph?
