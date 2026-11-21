# change tracking identity resolution no tracking and concurrency tokens — Reference: Tracking queries, identity resolution, and read-only query modes

## Scope and version

Based on Microsoft [tracking queries](https://learn.microsoft.com/en-us/ef/core/querying/tracking), [identity resolution](https://learn.microsoft.com/en-us/ef/core/change-tracking/identity-resolution), [change tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/), [explicit tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/explicit-tracking), and [relationship fix-up](https://learn.microsoft.com/en-us/ef/core/change-tracking/relationship-changes).

## How this group fits the mental model

Tracking mode decides whether query results join the current context's unit of work. Identity resolution ensures a single object per key in a tracked graph. No-tracking modes avoid context state, with an optional temporary identity map for result consistency.

## Supplied names explained

- **Tracking query** — Query returning keyed entities tracked by the context (default for entity results); subsequent detected changes can be saved.
- **AsTracking** — Forces tracking for a query even when context default is no-tracking.
- **AsNoTracking** — Returns entity instances without adding them to the context tracker. Repeated keys can materialize as distinct instances; results reflect database query data rather than local tracked modifications.
- **AsNoTrackingWithIdentityResolution** — Performs identity resolution within the result using a standalone temporary tracker, but returned entities are not tracked by the context.
- **QueryTrackingBehavior.TrackAll** — Context default tracking mode for entity-returning queries.
- **QueryTrackingBehavior.NoTracking** — Context default no-tracking mode. Override per query when a unit-of-work query should be tracked.
- **Identity resolution** — Reuses one entity instance for a given entity type/key in a tracking context or query-scoped identity-resolution operation.
- **State manager identity map** — Context-internal key-to-instance map used to maintain a coherent tracked graph; not a general application cache.
- **Duplicate entity instance tracking error** — `InvalidOperationException` when a context attempts to track a second instance with the same key. Consolidate values into one tracked object instead of attaching both.
- **Attach graph** — Attaching a disconnected root traverses reachable entities according to graph/key state rules. Validate keys, ownership, and authorization before trusting the graph.
- **EntityGraphAttacher** — EF internal graph traversal implementation used by attach/update methods; it is not a public application configuration API. Prefer public `Attach`, `Update`, and `TrackGraph` surfaces.
- **Navigation fix-up** — Aligns navigations/FKs among entities already tracked or materialized; it does not load missing related rows.
- **No-tracking entity instance duplication** — A no-tracking result can contain separate CLR instances for repeated database keys because there is no identity map.
- **Projection containing entity instance** — A custom projection that embeds an entity can still track that entity unless the query is no-tracking.
- **Scalar-only projection tracking boundary** — A projection containing only scalar/DTO values has no entity instance to track; client evaluation that materializes an entity can change this boundary.
- **Keyless entity never tracked** — Keyless model types are not tracked even when query tracking is otherwise enabled.
- **TrackGraph** — Public graph traversal API with a callback to choose state for each reachable entity, useful for custom disconnected graph policies.
- **ChangeTracker.TrackGraph** — Context entry point for `TrackGraph`; callback must make explicit state/authorization decisions for every node.

## Cross-item comparison

`AsTracking` uses the context state manager; `AsNoTracking` uses none; `AsNoTrackingWithIdentityResolution` uses a separate query-scoped tracker. Only the first enables ordinary persistence through that same context. No-tracking is a tracking policy, not a guarantee of fewer materialized objects or better performance for every query. `TrackGraph` gives custom state decisions; `Attach`/`Update` apply standard graph rules. A projection with entity instances can track; a pure scalar/DTO projection cannot.

## Examples

```csharp
var list = await db.Posts
    .AsNoTrackingWithIdentityResolution()
    .Include(post => post.Blog)
    .ToListAsync();

// For edits, query the tracked entity and apply allowed request fields.
var tracked = await db.Posts.SingleAsync(post => post.Id == request.Id);
tracked.Title = request.Title;
await db.SaveChangesAsync();
```

Do not query no-tracking and then attach the same object to the same context as a routine pattern; it loses tracker-held original/shadow information and adds work.

## Common mistakes

- Using no-tracking for an entity that must later be saved without attaching/configuring it.
- Assuming a read-only query's projection cannot track a nested entity instance.
- Attaching a DTO-mapped object while another instance with that key is already tracked.
- Treating `EntityGraphAttacher` as supported public API.
- Trusting posted graph keys or navigation links without authorization checks.
- Forgetting that no-tracking queries ignore local unsaved additions/modifications.

## Knowledge checks with answers

1. **Does identity-resolving no-tracking attach results to the context?** No; identity resolution uses a temporary tracker.
2. **Why does duplicate tracking throw?** EF needs one authoritative current value set and relationship graph per key.
3. **Can a scalar projection be tracked?** No entity instances are present to track, although an entity inside a projection can be.
4. **What is the supported customization point for disconnected graph state?** `ChangeTracker.TrackGraph` with an explicit per-node state policy.
