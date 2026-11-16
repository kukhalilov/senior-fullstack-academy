# loading navigation properties eager explicit lazy and N+1 — Reference: Single versus split queries, consistency, and round trips

## Scope and version

Based on Microsoft's [single versus split query guidance](https://learn.microsoft.com/en-us/ef/core/querying/single-split-queries), [eager loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/eager), and EF Core 11 [query improvements](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew) plus [final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). EF11's reference-join optimizations do not remove split query's multi-statement behavior.

## How this group fits the mental model

Single and split modes are alternative SQL shapes for eager loading. Single mode joins a graph; split mode queries root/collections separately and assembles them. Both load related data; neither is inherently fastest or more correct for every workload.

## Supplied names explained

- **AsSplitQuery** — Requests separate SQL queries for included collections, reducing sibling-join multiplication in many workloads.
- **AsSingleQuery** — Forces one joined query for the include graph.
- **QuerySplittingBehavior.SingleQuery** — Context/query default for joined loading.
- **QuerySplittingBehavior.SplitQuery** — Context/query default for split collection loading.
- **UseQuerySplittingBehavior** — Relational options configuration selecting a default split mode.
- **Multiple collection include warning** — EF warns when multiple collections are included without explicit query-splitting choice/configuration because the joined query may have performance issues.
- **Split query round trips** — Each SQL statement currently adds a database network round trip; high-latency databases can make this cost dominate.
- **Split query buffering** — Providers without multiple active result sets may require earlier result sets to be buffered before later split statements execute, increasing memory.
- **MARS interaction** — SQL Server Multiple Active Result Sets can permit multiple active commands/readers and affects buffering constraints; it does not enable concurrent operations on one `DbContext`.
- **Split query consistency under concurrent updates** — Multiple statements can observe different database moments. Snapshot/serializable transactions may stabilize reads at additional cost/locking/version-store effects.
- **Cartesian explosion** — Sibling collection joins multiply row counts; split query can avoid that particular cross-product expansion.
- **Duplicate parent columns** — Single-query joins repeat principal columns for each dependent row, which is costly for wide/large columns. Projection can omit unused columns.
- **Filtered include navigation fix-up caveat** — Tracking context may add previously loaded entities that fail the include filter; navigation is considered loaded despite omitted database rows.
- **Tracking query navigation fix-up** — Includes entities already tracked by key and synchronizes relationships; this can make observed collection contents broader than the current query alone.
- **No-tracking include behavior** — No-tracking queries avoid context tracker fix-up from earlier tracked instances, but may materialize duplicate entity instances unless identity-resolving no-tracking is used.
- **N+1 versus split-query distinction** — N+1 issues one additional query per root/object access; split query issues a bounded set of queries for the requested graph (often one per included collection path), not one per parent.

## Cross-item comparison

Use split query when sibling-collection row multiplication/duplicate payload dominates and the additional round trips and consistency window are acceptable. Use single query when round-trip latency dominates and result multiplication is modest. Use projection when a full entity graph is unnecessary. EF11 prunes some redundant to-one joins and ordering columns, improving certain include SQL shapes; that release change does not remove every reference join in every shape or split-query costs.

## Examples

```csharp
var blogs = await db.Blogs
    .Include(blog => blog.Posts)
    .Include(blog => blog.Contributors)
    .AsSplitQuery()
    .ToListAsync(cancellationToken);
```

This avoids the sibling collection cross product of a single joined query, but currently adds round trips. If a consistent point-in-time graph is required, choose an appropriate transaction isolation strategy and assess its operational cost. Verify SQL, query count, row counts, payload, and plans using the target provider.

## Common mistakes

- Treating every include warning as “always use split query.”
- Ignoring split-query latency, intermediate buffering, and multi-statement consistency.
- Confusing a bounded split query with per-row N+1.
- Believing SQL Server MARS makes one context thread-safe.
- Assuming EF11 query pruning makes all split queries one statement or removes every join.
- Ignoring repeated wide parent columns in single-query results.
- Benchmarking only elapsed time without measuring command count and transferred rows.

## Knowledge checks with answers

1. **What does split query trade away?** Some join multiplication for more round trips and possible buffering/consistency windows.
2. **Is split query N+1?** No; its query count is bounded by query/include shape, not each result entity.
3. **How can a split graph be made more consistent?** Use a suitable snapshot/serializable transaction if justified and supported.
4. **What did EF11 improve?** It prunes some redundant to-one joins/order keys in included query shapes; measure exact provider output.
