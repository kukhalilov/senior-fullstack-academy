# change tracking identity resolution no tracking and concurrency tokens — Reference: Concurrency tokens, exceptions, and application resolution

## Scope and version

Based on Microsoft [concurrency handling](https://learn.microsoft.com/en-us/ef/core/saving/concurrency), [change tracking](https://learn.microsoft.com/en-us/ef/core/change-tracking/), and [EF Core 11 final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). Token generation and row-version type/behavior are provider-specific.

## How this group fits the mental model

Optimistic concurrency lets work proceed without locking rows up-front, then asks the database whether the row still matches the version originally read. EF detects a failed conditional write; application/domain code resolves it.

## Supplied names explained

- **Optimistic concurrency** — Assumes conflicts are relatively uncommon; saves use a condition that fails if a tracked concurrency token no longer matches the database.
- **Concurrency token** — Property whose original value participates in update/delete predicates. It can be a database-generated version or an application-managed value.
- **IsConcurrencyToken** — Fluent metadata that marks a property as a token; the application/provider must ensure it changes when intended.
- **IsRowVersion** — Configures a database-generated row-version token where provider supports it; not portable as identical CLR/store behavior.
- **rowversion token** — SQL Server-specific binary counter type that changes automatically on row update; it is not a clock timestamp and should not be generalized to other databases.
- **Database-generated concurrency token** — Store changes token automatically (for example SQL Server rowversion); EF reads updated value after successful save.
- **Application-managed concurrency token** — Application/provider code assigns a new token value when relevant changes occur, such as a GUID or integer revision. Forgetting to update it disables detection for those writes.
- **DbUpdateConcurrencyException** — EF exception when an update/delete expected to affect one row affects none due to token/key mismatch, including a row deleted concurrently.
- **GetDatabaseValues** — Synchronously retrieves current persisted values for conflict resolution; can return null if the row has been deleted.
- **GetDatabaseValuesAsync** — Asynchronous version; pass cancellation where supported and handle deletion/null.
- **Reload** — Reloads entry values/state from database, discarding unsaved local changes; use only when that is the intended resolution.
- **ReloadAsync** — Asynchronous reload. It is effectively a store-wins path for the entry and can detach an entity if the row no longer exists.
- **Resolve concurrency conflict** — Application decision to preserve store state, retry client intent, merge fields, or report conflict. Authorization and domain invariants must be rechecked.
- **Store wins** — Replace/accept current database values and discard conflicting local edits.
- **Client wins** — Reapply client intent after refreshing the original token so a retry can succeed; it can overwrite other changes, so use only by explicit policy.
- **Merge original current and database values** — Compare original values (what caller read), current values (proposed edit), and database values (latest state); merge non-overlapping changes and surface incompatible changes.
- **SaveChanges retry after conflict** — Retry only after refreshing token and resolving values. Blindly retrying stale state repeats the conflict or overwrites data.
- **Concurrency predicate in UPDATE** — SQL condition includes key and original token (and possibly other conditions). A zero affected-row count triggers conflict handling.
- **Conflict resolution loop** — Bounded procedure: load database values, choose updated current/original values, retry; stop when resolved, deleted, canceled, or retry budget is reached.
- **Nonconcurrent last-write-wins behavior** — Without a concurrency token or other constraint, later writes can overwrite earlier writes; that may be intentional but must be an explicit domain choice.

## Cross-item comparison

Database-generated tokens avoid application coordination but depend on provider support. Application-managed tokens work across providers but require correctly updating the token. `Reload` is destructive store-wins behavior; `GetDatabaseValues` lets code inspect values and merge. Client-wins means reapply intent after fetching a fresh baseline, not blindly rerun the same stale command. Concurrency tokens protect row-level writes; they do not replace uniqueness constraints or authorization.

## Examples

```csharp
try
{
    await db.SaveChangesAsync();
}
catch (DbUpdateConcurrencyException exception)
{
    var entry = exception.Entries.Single();
    var databaseValues = await entry.GetDatabaseValuesAsync();
    if (databaseValues is null)
    {
        // Row was deleted: report, recreate only if domain policy allows, or abandon.
        throw;
    }

    var original = entry.OriginalValues;
    var proposed = entry.CurrentValues;
    // Resolve field-level conflicts here; then update OriginalValues to databaseValues
    // and retry only after the domain's merge policy has produced a valid result.
}
```

The placeholder intentionally does not implement a universal merge rule: it depends on field semantics and related invariants.

## Common mistakes

- Treating a unique index violation on insert as `DbUpdateConcurrencyException`.
- Retrying indefinitely without refreshing values or limiting attempts.
- Choosing client-wins globally when concurrent edits can affect related fields/invariants.
- Using SQL Server `rowversion` assumptions for another provider.
- Forgetting to rotate an application-managed token.
- Calling `Reload` and losing user edits unintentionally.
- Assuming concurrency token also prevents unauthorized updates.

## Knowledge checks with answers

1. **What makes EF throw the exception?** A conditional update/delete affects zero rows when EF expected one, often because a token changed or the row disappeared.
2. **What does store-wins do?** Discards the local conflicting edit in favor of current database state.
3. **Why can inserts fail with another exception?** Unique/PK constraints raise provider-specific database errors; optimistic token checks generally apply to updates/deletes.
4. **What must an application-managed token do?** Change on each relevant mutation so stale writes fail the comparison.
