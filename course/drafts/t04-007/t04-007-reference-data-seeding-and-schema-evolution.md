# migrations schema evolution seeds and deployment — Reference: Model-managed and runtime seeding, compatibility, and backfill

## Scope and version

Based on Microsoft [data seeding](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding), [migration management](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing), and [migration application](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying). `UseSeeding`/`UseAsyncSeeding` were introduced in EF Core 9; EF Core 11.0.0 shipped 2026-11-10.

## How this group fits the mental model

Seeding initializes application data; migration operations evolve schema/data in a versioned transition. Model-managed fixed values fit the migration snapshot. Runtime initialization and large backfills need idempotency, concurrency handling, and operations planning.

## Supplied names explained

- **HasData** — Adds model-managed data whose values/keys are stored in the model snapshot and emitted as migration insert/update/delete operations. Not a general startup seeder.
- **UseSeeding** — EF9+ synchronous options callback for initialization. Invoked during `EnsureCreated`, `Migrate`, CLI database update, and migration bundles, under EF migration locking, even when no migration changes exist.
- **UseAsyncSeeding** — Async equivalent for async initialization/migration operations. Implement both callbacks because tools/bundles currently invoke synchronous `UseSeeding`.
- **Model-managed data** — Fixed data managed through migrations; requires stable explicit key values and predictable changes.
- **Runtime data seeding** — Initialization logic executed through EF seeding callbacks/app initialization rather than model snapshot diffs. Make it idempotent and enforce uniqueness in the database.
- **Seed migration operation** — MigrationBuilder operation for seed rows, normally generated from `HasData`; review key changes and deletes like other migration data operations.
- **Seed-data key stability** — Stable keys prevent migration churn and accidental delete/reinsert semantics; generated database keys are unsuitable for snapshot-managed rows unless explicitly fixed.
- **Data backfill** — Populates or transforms existing rows after a schema expansion. Large backfills should be bounded, observable, resumable, throttled, and safe to repeat.
- **Expand-and-contract schema migration** — Multi-release pattern: add backward-compatible schema, deploy compatible code, backfill, switch reads/writes, then remove old schema after old code is gone.
- **Backward-compatible schema evolution** — Transitional schema works with both currently running old and new application versions during rolling deployment.
- **Default value for existing rows** — Adding a default can populate existing rows or affect future inserts depending on DDL/provider; understand exact migration SQL and distinguish database default from one-time backfill.
- **Large-table migration** — Schema/data change on a high-row-count table; assess locks, logging, transaction size, index rebuilds, and application traffic.
- **Online schema change** — Provider/database-specific technique for minimizing blocking during DDL/index changes; EF has no universal guarantee that generated operation is online.
- **Migration data transformation** — Explicit update/copy/normalize operations during migration. Keep transaction size, restart/recovery behavior, and Down data-loss implications visible.
- **Multiple DbContext migrations** — Separate contexts can own different model areas; configure distinct migrations assemblies/history tables or context ownership to avoid applying the wrong sequence/colliding IDs.
- **Separate migrations assembly** — Places migration classes/snapshot outside the startup/data project; configure the assembly and design-time context consistently.
- **ExcludeFromMigrations** — Relational mapping option to keep a table out of migration generation when another system owns its schema; it does not remove runtime mapping.
- **Squashing migrations** — Manually replaces a long history with a baseline migration/history adjustment. EF does not provide a safe automatic squash; protect existing data and every environment's known state.
- **Migration history baseline** — Establishes a new migration as already applied to an existing schema, commonly during a squash. Test both empty-database creation and existing-database baseline paths.

## Cross-item comparison

`HasData` is stable snapshot-managed data; `UseSeeding` is custom idempotent initialization under EF's migration lock. SQL scripts do not execute runtime delegates; bundle/CLI/Migrate do. A migration backfill is versioned but can create a long blocking transaction; a separate job supports batching/retry/monitoring but needs deployment coordination. Defaults and backfills are separate: one sets omitted future values, the other corrects existing rows. Expand-contract protects old/new app compatibility; a single destructive migration does not.

## Examples

```csharp
options.UseSeeding((context, _) =>
{
    if (!context.Set<Role>().Any(role => role.Code == "reader"))
    {
        context.Add(new Role { Id = 10, Code = "reader" });
        context.SaveChanges();
    }
})
.UseAsyncSeeding(async (context, _, cancellationToken) =>
{
    if (!await context.Set<Role>().AnyAsync(role => role.Code == "reader", cancellationToken))
    {
        context.Add(new Role { Id = 10, Code = "reader" });
        await context.SaveChangesAsync(cancellationToken);
    }
});
```

The stable code/key should also be protected by a unique constraint. For a large backfill, use a separate job with a checkpoint and bounded batches rather than placing an unbounded loop into a schema migration.

## Common mistakes

- Using `HasData` for mutable runtime-owned records.
- Implementing only async seeding and finding CLI/bundle paths do not run it.
- Assuming a seeding callback runs when an external SQL script executes.
- Making seed logic non-idempotent or relying only on pre-checks without uniqueness.
- Treating adding a default as a complete controlled backfill.
- Putting a multi-million-row transformation in one lock-heavy migration without rehearsal.
- Contracting/removing old columns while old instances still run.
- Squashing history without recording/baseline testing every environment.
- Assuming `ExcludeFromMigrations` prevents application queries.

## Knowledge checks with answers

1. **When use `HasData`?** Stable fixed values with explicit stable keys that belong in migration history.
2. **Why configure sync and async seed delegates?** EF CLI/bundles call the synchronous delegate.
3. **How are large data backfills safer?** Bounded/idempotent batches with progress, retry/checkpointing, throttling, and monitoring.
4. **What is the order of expand-contract?** Expand schema, deploy compatible code, backfill/switch use, then contract after old code is retired.
