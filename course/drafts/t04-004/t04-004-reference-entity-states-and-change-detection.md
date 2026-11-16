# change tracking identity resolution no tracking and concurrency tokens — Reference: State manager, snapshots, notifications, and SaveChanges

## Scope and version

Based on Microsoft [change tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/), [change detection](https://learn.microsoft.com/en-us/ef/core/change-tracking/change-detection), [debug views](https://learn.microsoft.com/en-us/ef/core/change-tracking/debug-views), [explicit tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/explicit-tracking), and EF Core 11 [final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). EF Core 11.0.0 shipped 2026-11-10.

## How this group fits the mental model

The state manager holds the context's tracked instances, keys, original snapshots, and relationship metadata. Change detection turns CLR mutations into property/entity state; `SaveChanges` converts those states into database operations.

## Supplied names explained

- **ChangeTracker** — Context API for inspecting and controlling tracked state, detection, query tracking defaults, and cascade behavior.
- **EntityEntry** — Metadata/state wrapper for one tracked entity; exposes current/original values, member entries, and state.
- **EntityState.Detached** — Entity is not tracked; there is no pending persistence action.
- **EntityState.Unchanged** — Tracked entity matches its accepted/original values; no update is issued unless a member is marked modified.
- **EntityState.Added** — Tracked as new; insert is attempted on save.
- **EntityState.Modified** — Entity has one or more modified members; relational updates ordinarily write modified columns.
- **EntityState.Deleted** — Existing tracked entity is scheduled for deletion.
- **ChangeTracker.Entries** — Enumerates tracked entries, optionally filtered by entity type; enumeration can trigger change detection depending on API/call path.
- **ChangeTracker.HasChanges** — Reports whether tracked entries currently indicate pending changes; detection may run according to normal tracker behavior.
- **ChangeTracker.DebugView** — Human-readable short/long diagnostics for tracked entity state, keys, values, relationships, and temporary values; diagnostic format is not an application serialization contract.
- **ChangeTracker.DetectChanges** — Compares current CLR state with snapshots and detects property/relationship changes. SaveChanges invokes detection by default.
- **AutoDetectChangesEnabled** — Controls automatic detection during common tracker operations. Disabling can help only after measurement and requires explicit detection before relying on states.
- **Snapshot change tracking** — Default strategy: EF snapshots values when tracking begins and compares values at detection points.
- **Notification change tracking** — Detects values when correctly implemented notification events fire; exact strategy must match complete property notifications.
- **ChangeTrackingStrategy.Snapshot** — Snapshot comparisons; does not require entity notifications.
- **ChangeTrackingStrategy.ChangedNotifications** — Uses `INotifyPropertyChanged`; original values are generally not maintained like strategies requiring changing notifications, so features needing originals are constrained.
- **ChangingAndChangedNotifications strategy** — Uses both `INotifyPropertyChanging` and `INotifyPropertyChanged`, allowing original values to be captured immediately before a change and change state to be updated after.
- **ChangeTrackingStrategy.ChangingAndChangedNotificationsWithOriginalValues** — Uses both notifications but also retains original values for all properties, increasing memory relative to strategies that capture originals selectively.
- **Change-tracking proxy** — Runtime subclass that intercepts virtual property changes and notifies EF; the instance must be proxy-created and entity/member shape must satisfy proxy restrictions.
- **UseChangeTrackingProxies** — Configures proxy-based detection. It is not the same as lazy-loading proxy setup; proxy creation and virtual members are required, and creating entities with ordinary `new` can bypass interception.
- **INotifyPropertyChanged** — .NET event contract indicating a property value changed; notification strategy requires correct events for all mapped changed properties.
- **INotifyPropertyChanging** — Event contract indicating a property is about to change; permits EF to capture original values before mutation.
- **DbContext.Add** — Tracks an entity graph as Added (subject to graph/key behavior); new reachable entities can be inserted.
- **DbContext.Attach** — Tracks a graph as existing/Unchanged by default for keyed entities; generated-key unset entities may be treated as Added.
- **DbContext.Update** — Tracks graph entities and usually marks keyed existing entities Modified; unset generated keys may identify new entities. It can write every mapped property of existing graph nodes.
- **DbContext.Remove** — Marks an entity Deleted; removing an Added entity can detach/cancel the pending insert instead.
- **EntityEntry.State** — Gets/sets the state of one tracked entry. Setting `Modified` broadly may mark all properties modified; prefer property-level control for partial updates.
- **EntityEntry.DebugView** — Short/long diagnostic view for one entry, including member flags and original values where available.
- **EntityEntry.IsKeySet** — Reports whether key properties have values other than unset/generated sentinels; it is useful for graph-state decisions but does not prove database existence or authorization.
- **EntityEntry.Property** — Accesses a scalar property entry to read values and control per-property modification/generation state.
- **EntityEntry.Collection** — Accesses a collection-navigation entry for loading, state inspection, and relationship operations.
- **EntityEntry.Reference** — Accesses a reference-navigation entry for loading and state inspection.
- **SaveChanges** — Detects changes by default, sends required database writes, and accepts changes as the new baseline on success.
- **SaveChangesAsync** — Async form; await it before reusing the context, which cannot execute concurrent operations safely.
- **AcceptAllChanges** — Marks current tracked state as accepted (typically Unchanged), clearing pending Added/Modified/Deleted intent after successful persistence.
- **SaveChanges(acceptAllChangesOnSuccess)** — Overload option to postpone `AcceptAllChanges` when false; caller must coordinate later acceptance/rollback carefully to avoid a tracker baseline that disagrees with committed data.
- **ChangeTracker.Clear** — Efficiently detaches all tracked entities, but short-lived context disposal is the normal unit-of-work boundary.
- **OriginalValues** — Values captured when tracking began or after acceptance/reload; used for change detection and concurrency predicates.
- **CurrentValues** — Current scalar values as read from the entity/entry; can be copied/applied deliberately to tracked entries.
- **GetDatabaseValues** — Reads current persisted values for the entity key into a value buffer; returns null if no database row exists. Does not itself resolve/accept a conflict.

## Cross-item comparison

Snapshot strategy trades periodic comparisons for minimal entity requirements. Notification strategies reduce comparison work but place strict correctness obligations on entities; proxy strategies require EF-created proxy instances. `Attach` says “treat this keyed graph as existing”; `Update` often says “treat its mapped values as modified,” which is dangerous for partial payloads. `EntityEntry.State` is entity-wide; property entries allow narrow updates. `AcceptAllChanges` changes tracker state, not the database; `SaveChanges` writes first, then normally accepts. Debug views inspect internals; they are diagnostics, not stable machine-readable contracts.

## Examples

```csharp
var entry = db.Entry(customer);
entry.Property(x => x.DisplayName).IsModified = true;
await db.SaveChangesAsync();

// Diagnostic: inspect why EF believes an update is pending.
db.ChangeTracker.DetectChanges();
Console.WriteLine(db.ChangeTracker.DebugView.LongView);
```

Manual state changes should be paired with authorization, key/existence validation, and concurrency policy. Turning automatic detection off is safe only when code explicitly runs detection before save or marks every state correctly.

## Common mistakes

- Treating `IsKeySet` as proof a row exists.
- Turning off automatic detection and forgetting `DetectChanges`.
- Implementing notifications for only some mutable mapped properties.
- Creating proxy entities with `new` and expecting proxy interception.
- Assuming `Update` is a safe partial-update operation.
- Reusing a context as a long-lived cache and accumulating stale tracked state.
- Calling `AcceptAllChanges` before persistence succeeds.
- Treating debug view text as a stable API format.

## Knowledge checks with answers

1. **When does snapshot detection happen?** At change-detection points, including `SaveChanges` by default; it can also be forced explicitly.
2. **What is the main cost of `Update` on a disconnected graph?** It may mark many properties and reachable entities modified, producing unintended writes.
3. **Does `ChangeTracker.Clear` commit changes?** No; it detaches tracked state and discards its pending work.
4. **Why use `SaveChanges(false)`?** To delay accepting tracker state until a surrounding persistence protocol is confirmed; caller then owns correct acceptance/recovery.
