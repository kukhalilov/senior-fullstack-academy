# change tracking identity resolution no tracking and concurrency tokens — Core concepts and how they fit together

This lesson follows Microsoft [change tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/), [change detection](https://learn.microsoft.com/en-us/ef/core/change-tracking/change-detection), [identity resolution](https://learn.microsoft.com/en-us/ef/core/change-tracking/identity-resolution), [tracking queries](https://learn.microsoft.com/en-us/ef/core/querying/tracking), and [concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency) documentation.

## Learning objectives

Predict what `SaveChanges` will do from entity state; explain how detection, original values, and identity resolution work; choose a query tracking mode; safely attach or update disconnected data; and resolve optimistic concurrency conflicts without discarding changes unintentionally.

## Prerequisites

Know what a `DbContext` and entity key are, and how relationships/FKs connect object graphs. A context is a short-lived unit of work, not a global cache or thread-safe session.

## Core concepts

### State is the unit-of-work instruction

- `Detached`: not tracked; EF has no pending action.
- `Added`: insert on save.
- `Unchanged`: tracked, with no detected modifications.
- `Modified`: update on save; property-level flags decide what values are written.
- `Deleted`: delete on save.

State and database existence are related but not interchangeable in disconnected applications. A client-supplied key does not prove that a row exists or that the caller may modify it.

### Detection and snapshots

Snapshot tracking is default: EF stores original property values when tracking starts, then compares at change-detection points. `SaveChanges` detects changes by default. `DetectChanges` can be invoked explicitly. Turning off `AutoDetectChangesEnabled` may reduce repeated scanning in a measured hot path, but code must explicitly detect changes at the right time; otherwise modifications or graph changes can be missed.

Notification strategies can report changes through `INotifyPropertyChanged` and/or `INotifyPropertyChanging`. The strategy must match the entity's notifications on every mapped property; partial notification coverage can silently miss changes. Proxies require the proxy package/configuration and proxy-created instances, and impose virtual/member constraints. Snapshot detection is simpler and often the right default.

### Identity resolution

A context can track only one instance for a given entity type/key, so repeated rows resolve to the same object instance. This prevents conflicting current values and relationships. Attaching a second instance with that same key throws. Resolve duplicate graphs before attaching: consolidate values into one instance or query the tracked instance and apply updates to it.

### Tracking modes

Tracking is default for entity-returning queries. A no-tracking query reflects database results without using the context state manager; it does not incorporate pending local changes and can produce separate objects for repeated keys. `AsNoTrackingWithIdentityResolution` uses a temporary standalone tracker to deduplicate within that result, but leaves returned objects untracked by the context. A projection that contains an entity instance can still track that entity; a projection of only scalars/DTO values has no entity to track. Keyless entity types are never tracked.

### Disconnected graph state

`Add`, `Attach`, `Update`, and `Remove` traverse reachable graphs. With generated keys, unset key values help identify new instances. `Attach` usually treats keyed entities as existing/Unchanged; `Update` generally marks existing graph entities Modified, potentially updating columns the client never intended to change. For HTTP edits, load the authorized row and copy allowed DTO fields, or explicitly set property states. Never trust a posted graph's key/ownership as authorization.

### Concurrency is a compare-and-write check

EF stores the original concurrency token. On update/delete, it adds the token to the `WHERE` condition. If no row matches, EF reports a concurrency conflict. Store wins reloads database values; client wins refreshes the original token then retries intended values; merge combines non-overlapping changes or asks a user. Each policy has domain and authorization consequences. Inserts do not normally produce `DbUpdateConcurrencyException`; unique-key collisions use provider-specific exceptions.

## Mechanisms and relationships

`EntityEntry` exposes state and property/reference/collection entries. `OriginalValues` and `CurrentValues` distinguish before/after snapshots. `GetDatabaseValues` retrieves current persisted values for a tracked entity; it can return null if the row no longer exists. `Reload` replaces tracked values/state from the database. `AcceptAllChanges` treats current values as the new baseline; `SaveChanges(acceptAllChangesOnSuccess: false)` lets an application postpone this acceptance, for example when coordinating custom transaction/outbox flow. `ChangeTracker.Clear` efficiently stops tracking all current entities; it is usually unnecessary when a short-lived context is disposed.

## Worked examples

```csharp
var customer = await db.Customers.SingleAsync(x => x.Id == id); // tracked
customer.Name = request.Name;
await db.SaveChangesAsync(); // detects and persists the change
```

For disconnected partial updates, prefer loading and patching:

```csharp
var customer = await db.Customers.SingleAsync(x => x.Id == request.Id);
customer.DisplayName = request.DisplayName; // only explicitly allowed field
await db.SaveChangesAsync();
```

Avoid blindly calling `Update(requestMappedEntity)` when omitted properties must remain unchanged.

## Misconceptions and edge cases

- A tracking query may return stale tracked values instead of overwriting the tracked instance with new database values.
- `AsNoTracking` is not automatically faster in every projection/workload; measure query, materialization, and memory costs.
- A no-tracking projection can still track an entity embedded in its result.
- Disabling auto detection is a correctness change unless detection is restored/explicitly invoked.
- `SaveChanges` is not safe to run concurrently with another operation on the same context.
- `Update` can over-post every reachable property; a key value is not authorization.
- Refreshing a concurrency token and retrying without reapplying policy is not a merge.
- A duplicate insert detected by a unique index is not the same error as a stale update token.

## Knowledge checks with answers

1. **What makes a tracked value persist?** A tracked entity is Added, Deleted, or has detected modified properties when SaveChanges runs.
2. **Can one context track two instances with the same key?** No; consolidate or apply changes to the existing tracked instance.
3. **What does `AsNoTrackingWithIdentityResolution` track?** A temporary query-scoped identity map, not entities in the context tracker.
4. **Why can `Update` be unsafe for a partial API payload?** It may mark every reachable existing property modified and overwrite omitted values.
5. **What does a concurrency token do?** It makes a save conditional on the originally read token still matching; conflict policy belongs to the application.
6. **What does `GetDatabaseValues` returning null indicate?** The row no longer exists in the database.
