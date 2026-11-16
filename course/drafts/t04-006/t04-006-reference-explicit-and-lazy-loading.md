# loading navigation properties eager explicit lazy and N+1 — Reference: Entry-based explicit loading and proxy or lazy-loader patterns

## Scope and version

Based on Microsoft's [explicit loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/explicit) and [lazy loading](https://learn.microsoft.com/en-us/ef/core/querying/related-data/lazy) references. Proxy packages, entity construction, context behavior, and provider I/O should be checked against the EF Core version used.

## How this group fits the mental model

Explicit loading makes a later data request visible in code. Lazy loading hides that request behind navigation access. Both use the context to query; neither should be confused with relationship fix-up, which only synchronizes entities already known to the tracker.

## Supplied names explained

- **Explicit loading** — Deliberately loads one navigation or its filtered query after the principal/entity has been obtained.
- **EntityEntry.Reference** — Returns an entry for a reference navigation, used for `Load`, `Query`, and loaded-state inspection.
- **EntityEntry.Collection** — Returns an entry for a collection navigation with loading/query/status APIs.
- **ReferenceEntry.Load** — Synchronously loads the referenced entity if needed.
- **CollectionEntry.Load** — Synchronously loads collection contents if needed.
- **ReferenceEntry.LoadAsync** — Asynchronous reference load; pass cancellation token when available.
- **CollectionEntry.LoadAsync** — Asynchronous collection load.
- **ReferenceEntry.Query** — Returns a provider-backed query for the related reference; useful for filtering/aggregating without loading the object graph.
- **CollectionEntry.Query** — Returns query for related collection; apply `CountAsync`, filters, or projection server-side rather than materializing all children.
- **Lazy loading** — Loads an unloaded navigation when its getter/access path is invoked; hidden I/O can occur in loops, serializers, UI templates, and mapping code.
- **UseLazyLoadingProxies** — Enables proxy-based lazy loading through `Microsoft.EntityFrameworkCore.Proxies`; navigation members must be overridable and the entity inheritable; instances must be proxy-created.
- **ILazyLoader** — Service injected into entity constructors/members to load navigations without inheritance proxies.
- **ILazyLoader.Load** — Loader method used in a navigation getter to load an entity/collection on access.
- **Lazy-loader delegate injection** — Injects an `Action<object,string>`-style loader delegate instead of referencing the `ILazyLoader` interface/package in entity types; it still couples access to context-backed loading behavior.
- **Virtual navigation requirement** — Proxy lazy loading needs overridable (usually `virtual`) navigation properties on inheritable classes. ILazyLoader injection does not require virtual navigation members.
- **Lazy-loading proxy package** — `Microsoft.EntityFrameworkCore.Proxies`, a separate package enabled in options. Keep its EF major version aligned with EF Core packages.
- **N+1 query problem** — One root query plus additional lazy/explicit queries per returned entity (or group), creating excessive round trips. Fix with projection, eager/split loading, or batched explicit queries based on the use case.
- **Lazy load after context disposal** — An unloaded proxy navigation cannot query after its owning context is disposed and may throw. Previously loaded values remain in memory but no longer lazy-fetch.
- **Lazy loading serialization hazard** — Serializers can traverse navigation getters, issue many queries, produce cycles, or expose data beyond the intended DTO. Serialize deliberate DTOs, not a live lazy entity graph.
- **Navigation not loaded state** — Navigation may be null/empty/uninitialized because it has not loaded; inspect `IsLoaded` and the query path rather than interpreting collection contents as database truth.
- **IsLoaded flag** — Entry metadata indicating EF believes the navigation is loaded; a filtered include can set it true while only a subset is present.
- **NavigationEntry.IsLoaded** — Gets/sets loaded state on a navigation entry. Manually changing it affects EF loading decisions, not whether every database row was actually retrieved.
- **Explicit query aggregate** — Uses `Reference/Collection(...).Query()` followed by server-side aggregate/filter, e.g. `CountAsync`, without materializing all related entities.

## Cross-item comparison

Explicit load/query is visible and conditional; lazy loading is convenient but hidden. `LoadAsync` materializes related entity objects; `Query().CountAsync()` can answer a count without building the collection. Proxy lazy loading requires virtual members and proxy-created entities; `ILazyLoader`/delegate injection trades proxies for entity-loader coupling. `IsLoaded` controls EF's loading behavior; it is not a proof of completeness after filtering.

## Examples

```csharp
var blog = await db.Blogs.SingleAsync(x => x.Id == id, cancellationToken);
var publishedCount = await db.Entry(blog)
    .Collection(x => x.Posts)
    .Query()
    .CountAsync(post => post.IsPublished, cancellationToken);

await db.Entry(blog)
    .Reference(x => x.Owner)
    .LoadAsync(cancellationToken);
```

The count query does not materialize all posts. The owner load is a deliberate follow-up and makes the extra database operation visible.

## Common mistakes

- Calling a lazy navigation in a loop without observing SQL/round trips.
- Enabling proxies but constructing entities manually and expecting interception.
- Assuming all EF `virtual` properties lazy-load; only configured navigations with proxy support do.
- Calling `Load` on every entity instead of batching or querying the navigation.
- Serializing entity graphs with lazy loading enabled.
- Treating `IsLoaded = true` as proof a filtered collection is complete.
- Disposing context before accessing an unloaded lazy navigation.

## Knowledge checks with answers

1. **How can you count children without loading them?** Use `Collection(...).Query().CountAsync()`.
2. **Which strategy has hidden data access?** Lazy loading.
3. **Do ILazyLoader navigations need to be virtual?** No; proxy-based lazy loading does.
4. **What is one serialization risk?** It can trigger lazy queries, cycles, and unintended data access.
