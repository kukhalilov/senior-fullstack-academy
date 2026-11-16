# transactions savepoints retry execution strategies and concurrency — Reference: Optimistic concurrency exceptions and state resolution

## Scope and version

Based on Microsoft's [concurrency conflict guide](https://learn.microsoft.com/en-us/ef/core/saving/concurrency) and [transaction/savepoint guide](https://learn.microsoft.com/en-us/ef/core/saving/transactions). Token and provider transaction-conflict behavior varies by database.

## How this group fits the mental model

Optimistic concurrency protects a row from stale updates. EF detects that the update predicate did not match and throws; application code chooses which values to preserve. A savepoint can restore a surrounding transaction after a failed SaveChanges when supported, but it does not resolve the semantic conflict.

## Supplied names explained

- **DbUpdateConcurrencyException** — EF exception when an update/delete expected one row but the concurrency/key predicate matched none; insert uniqueness violations are generally provider-specific exceptions instead.
- **Concurrency token** — Property whose originally read value is included in update/delete condition.
- **IsConcurrencyToken** — Configures property as a token; application/database must change it when relevant writes occur.
- **IsRowVersion** — Configures database-generated rowversion semantics where provider supports them; SQL Server `rowversion` is provider-specific.
- **GetDatabaseValuesAsync** — Retrieves latest stored values for affected entry; null if row no longer exists.
- **ReloadAsync** — Discards local values and reloads the entity from database; store-wins behavior, and entity can become detached if row was deleted.
- **CurrentValues** — Proposed values the application was attempting to persist.
- **OriginalValues** — Values originally read/tracked, including original concurrency token.
- **Store wins** — Replace conflicting local values with database values, discarding the client's change.
- **Client wins** — Reapply client intent after refreshing original token; may overwrite another writer, so use only under explicit policy.
- **Custom merge resolution** — Compare original, current/proposed, and database values per property and preserve nonconflicting edits while surfacing collisions.
- **Retry after refreshing original values** — Update the entry's original values/token to latest database values and retry only after choosing a valid current-value merge.
- **Concurrency conflict loop** — Bounded reload/merge/retry process; stop on deletion, cancellation, conflict policy decision, or retry budget.
- **Provider transaction conflict** — Deadlock, serialization failure, lock timeout, and token mismatch are distinct categories. Provider errors may be transient/retryable, but only provider strategy/classification can decide infrastructure retry; domain conflicts need resolution.
- **Savepoint after concurrency error** — When SaveChanges ran inside an outer transaction and EF created a savepoint, it normally rolls back that failed SaveChanges to the savepoint. The outer transaction remains open; fix values and retry only if provider/transaction state is known (MARS caveat applies).

## Cross-item comparison

Transient retry repeats work because infrastructure may recover; token conflict reports changed data and needs a business decision. Store wins discards proposed values; client wins preserves them after refreshing the baseline; merge combines only when domain rules permit. Provider transaction errors such as deadlocks/serialization aborts may be retry candidates, whereas `DbUpdateConcurrencyException` is not automatically a retry-policy decision.

## Examples

```csharp
catch (DbUpdateConcurrencyException ex)
{
    var entry = ex.Entries.Single();
    var database = await entry.GetDatabaseValuesAsync(cancellationToken);
    if (database is null)
    {
        // Row was deleted; report or apply explicit recreate policy.
        throw;
    }

    var original = entry.OriginalValues;
    var proposed = entry.CurrentValues;
    // Compare original/proposed/database per field; choose or report conflicts.
    entry.OriginalValues.SetValues(database);
    // Reapply only resolved current values, revalidate, and retry with a finite limit.
}
```

The snippet omits field merge logic because no single merge rule is correct for every domain. A transaction savepoint only makes it possible to keep using an outer transaction after failure; it does not pick the winning data.

## Common mistakes

- Retrying the same stale values without refreshing the token or merging.
- Automatically selecting client-wins for every conflict.
- Treating unique constraint or deadlock exceptions as `DbUpdateConcurrencyException`.
- Ignoring null from database values, which signals the row was deleted.
- Continuing after a failed save when MARS prevented savepoint creation and transaction state is uncertain.
- Leaving conflict loops unbounded.

## Knowledge checks with answers

1. **What are the three value sets used for merge?** Original, proposed/current, and current database values.
2. **Does a savepoint resolve concurrent edits?** No; it only restores transaction position.
3. **What does null from `GetDatabaseValuesAsync` mean?** Row no longer exists.
4. **Is a unique insert violation normally a concurrency-token exception?** No; it is a provider-specific constraint error.
