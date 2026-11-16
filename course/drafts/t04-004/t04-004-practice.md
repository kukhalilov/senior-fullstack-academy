# change tracking identity resolution no tracking and concurrency tokens — Exercises and worked solutions

Source basis: Microsoft [change tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/), [change detection](https://learn.microsoft.com/en-us/ef/core/change-tracking/change-detection), [identity resolution](https://learn.microsoft.com/en-us/ef/core/change-tracking/identity-resolution), [explicit tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/explicit-tracking), and [concurrency](https://learn.microsoft.com/en-us/ef/core/saving/concurrency).

## Goals

- Predict state transitions and SQL intent for tracked and disconnected entities.
- Choose tracking mode from read/write and identity needs.
- Avoid accidental overposting, duplicate tracking, and lost updates.
- Resolve concurrency conflicts through explicit policy and test them with two independent contexts.

## Worked example

An HTTP endpoint edits a customer's display name from a DTO. The safe unit of work loads the authorized row, applies only the allowed field, and saves with a concurrency token configured on the entity.

```csharp
var customer = await db.Customers.SingleOrDefaultAsync(x => x.Id == id, cancellationToken);
if (customer is null) return Results.NotFound();
if (!await authorization.CanEditAsync(user, customer, cancellationToken))
    return Results.Forbid();

customer.DisplayName = request.DisplayName;
try
{
    await db.SaveChangesAsync(cancellationToken);
}
catch (DbUpdateConcurrencyException)
{
    return Results.Conflict(); // A real endpoint may return a conflict payload.
}
```

The tracked query keeps original values and token. Loading before patching also ensures authorization and update scope are based on the current record. A conflict response avoids silently discarding either writer's intent.

## Exercises

1. An entity is loaded as `Unchanged`, its `Name` is changed, and SaveChanges succeeds. Describe detection, state, and property-level update intent.
2. Compare `AsNoTracking` and `AsNoTrackingWithIdentityResolution` for a query returning the same blog repeatedly through a join.
3. A DTO includes `Id` and `Name`; the context already tracks another instance with that ID. Explain the error and a safe resolution.
4. A developer calls `Update(mappedEntity)` from a partial PATCH request. Identify the data-loss risks and show a safer strategy.
5. With `AutoDetectChangesEnabled = false`, a tracked entity's CLR property changes but no property flag is set. What must happen before save?
6. An application uses `ChangingAndChangedNotifications` but emits only `PropertyChanged`. Predict the risk.
7. A stale update affects zero rows. Write a conflict policy that merges unrelated field changes and surfaces overlapping edits.
8. A row is deleted concurrently. What may `GetDatabaseValuesAsync` return, and what options does the application have?
9. Explain when `SaveChanges(false)` might be useful and the state-management obligation it creates.
10. Design a test that proves a concurrency token prevents a lost update.
11. Explain why duplicate tracking often occurs in object deserialization and how you would normalize a graph.

## Progressive hints

1. Change detection compares current values against snapshots before generating persistence operations.
2. The first mode has no identity map; the second uses a temporary one and still does not track in the context.
3. A key maps to one context instance; load/query that instance and copy changes into it.
4. `Update` may mark omitted values modified. Query the existing row and set only allowed fields.
5. Explicitly run `DetectChanges()` or accurately mark each changed entry/property before SaveChanges.
6. EF cannot capture old values or detect all changes if the configured notification protocol is incomplete.
7. Compare original, proposed, and latest database values per field and retry with the latest token only after merge.
8. A null database value means the row no longer exists. Recreate only if domain policy permits; otherwise report deletion/conflict.
9. It delays accepting tracker state after a successful write; later acceptance/rollback must be coordinated with the transaction protocol.
10. Use two contexts: both read same token, first saves, second must throw on save.
11. Deduplicate by entity type/key and merge allowed field changes before attaching; do not attach duplicates and hope EF chooses one.

## Complete solutions

1. SaveChanges normally runs detection, finds `Name` differs from its original snapshot, marks the entity Modified and `Name` modified, and emits an update for the changed column plus key/token predicates as applicable.

2. `AsNoTracking` materializes duplicate blog keys as separate instances; it is not tracked by the context. `AsNoTrackingWithIdentityResolution` returns one object per key within the result using a standalone query tracker; instances remain detached from the context. The latter is useful when graph consistency matters but persistence tracking is not needed.

3. EF throws because a context tracks at most one instance per entity type/key. Query the tracked instance and apply DTO fields, or consolidate duplicates before attaching. If the tracked instance is stale, resolve it deliberately; do not clear tracking automatically without considering pending work.

4. `Update` can mark all mapped properties (and reachable existing entities) modified, so omitted fields may be overwritten with defaults/nulls and ownership links may be tampered with. Load the authorized entity, copy only permitted fields, validate business rules, and save. For a true blind update, explicitly mark only known modified properties and include concurrency protection.

5. Run `db.ChangeTracker.DetectChanges()` before relying on state; SaveChanges auto-detection is skipped while disabled. Alternatively set `Property(...).IsModified = true` precisely. Restore the setting in `finally` if it is temporarily changed.

6. The strategy requires both changing and changed notifications. Without `PropertyChanging`, EF may not capture original values before mutation; without complete notifications, updates can be missed. Use a matching strategy or complete event implementation and test every mapped mutation path.

7. Capture original/current/database values. If a field changed only in the client, preserve it; if only in the database, preserve database state; if both changed, apply field-specific merge rules or return a conflict for user choice. Set the entry's original values to current database values, apply the resolved values, and retry with a bounded policy. Revalidate invariants and authorization.

8. `GetDatabaseValuesAsync` can return null. Treat it as a deletion conflict; report that the row disappeared, abandon the change, or recreate only when the domain explicitly allows it. Do not silently reinsert the same key.

9. It is useful when a surrounding transaction/outbox protocol needs to control when EF accepts local tracker state. Since successful SaveChanges(false) leaves entries pending/modified, explicitly call `AcceptAllChanges` only after the commit is confirmed, or clear/recreate the context after rollback. Avoid accidental duplicate writes.

10. Create two contexts and load the same row/token. Change and save through context A. Change a conflicting value through context B and assert `DbUpdateConcurrencyException`. Then test the chosen resolution (store-wins/merge/client-wins) separately. Use the production relational provider or a provider with equivalent token semantics.

11. Deserialization often creates repeated copies of the same logical row along different graph branches. Group nodes by entity type/key, choose one canonical instance, merge permitted values/references into it, then attach a graph with unique identities. Reject inconsistent duplicate values rather than silently picking one.

## Tests and edge cases

- Assert the state and property modified flags before and after `DetectChanges`.
- Test Add/Attach/Update graph behavior with unset and set generated keys.
- Test identity resolution both within a tracking query and within identity-resolving no-tracking results.
- Verify projection tracking when an entity instance is embedded versus scalar-only output.
- Test disconnected patch authorization and omission semantics.
- Use separate contexts for optimistic concurrency tests; one context cannot model two independent readers reliably.
- Test application-managed token rotation and database-generated token refresh.
- Test missing-row conflicts, deletion conflicts, retry exhaustion, and cancellation.
- Verify save/accept behavior with `SaveChanges(false)` and transaction rollback paths.

## Reflection questions

- What is the smallest state mutation this request should persist?
- Does this query need context identity, only result identity, or neither?
- Which values are trusted from a disconnected graph and which are reloaded/authorized?
- Who decides between store wins, client wins, merge, and rejection?
- Does the concurrency test use the same provider behavior as production?
