# migrations schema evolution seeds and deployment — Reference: Scaffolding, migration operations, and model snapshots

## Scope and version

Based on Microsoft [migration management](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing), [migration overview](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/), and final [EF Core 11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). Provider DDL and transactional support differ.

## How this group fits the mental model

Scaffolding compares the model snapshot with the current model and generates a proposed transition. The migration source is code to be reviewed and version-controlled; the snapshot is EF's comparison baseline, not a live view of the database.

## Supplied names explained

- **dotnet ef migrations add** — CLI command that scaffolds a named migration and updates migration source/snapshot files; inspect the generated operations before applying.
- **Add-Migration** — Visual Studio Package Manager Console counterpart to migration scaffolding.
- **Migration class** — Ordered class containing forward `Up` and reverse `Down` operations plus generated metadata.
- **Up method** — Defines operations to move the schema/data forward.
- **Down method** — Attempts to reverse operations. It cannot restore data that `Up` dropped or transformed without preservation logic.
- **MigrationBuilder** — API used within migration methods to create schema/data operations and execute provider SQL.
- **ModelSnapshot** — C# representation of the last model used for migration comparison. It is source-controlled, not read from database state.
- **BuildTargetModel** — Generated migration metadata method that reconstructs the model associated with a migration for tooling/history operations.
- **Migration ID** — Chronological identifier/name for an ordered migration; databases record applied IDs.
- **Migration metadata** — Generated attributes/target model information needed to associate a migration with context/product/version and build historical models.
- **AddColumn** — Adds a column operation. For a required column on existing rows, provide a safe default/backfill/nullable expansion plan based on provider data/lock behavior.
- **AlterColumn** — Changes column facets/type/nullability/default; may rewrite data or lock/rebuild tables.
- **DropColumn** — Removes a column and its data. `Down` re-adding a column does not recover prior values.
- **CreateTable** — Adds table and its columns/constraints; generated SQL and provider support must be checked.
- **DropTable** — Removes table/data; potentially destructive and not generally reversible.
- **AddForeignKey** — Adds referential constraint. Existing data must satisfy it; large tables may require separate validation/online rollout.
- **DropForeignKey** — Removes constraint; preserve integrity through replacement rules/application behavior.
- **CreateIndex** — Adds an index. Build method, lock behavior, online/concurrent options, and transaction support are provider-specific.
- **RenameColumn** — Preserves existing column data when the provider supports rename; review scaffolded drop/add operations if a CLR rename is intended to retain data.
- **Sql migration operation** — Executes provider SQL via `MigrationBuilder.Sql`, useful for provider-specific operations or controlled data transformation; keep it reviewed/tested and account for transaction suppression.
- **Custom migration operation** — A migration-specific operation beyond generated scaffolding, such as provider-specific SQL or batched data transformation; it needs reliable SQL generation and reversibility/rollback assessment.
- **PendingModelChangesWarning** — EF warning/error boundary used by migration application when current model has changes absent from a migration (EF Core 9+ `Migrate`/`MigrateAsync` throws for pending model changes).
- **Model changes check** — Compare model to snapshot through tooling/programmatic checks to catch a forgotten migration before release.
- **dotnet ef migrations has-pending-model-changes** — CLI check for model changes not included in a migration; added in EF Core 8.
- **Database.HasPendingModelChanges** — Programmatic equivalent, useful in a CI test.
- **Migration versus database schema state** — Migrations/history describe intended/applied sequence, while live schema can drift via manual DDL, partial restore, failed scripts, or out-of-band tools; verify the actual database.

## Cross-item comparison

`ModelSnapshot` is current comparison baseline; `__EFMigrationsHistory` records which migration IDs are marked applied; neither independently proves actual schema correctness. `RenameColumn` preserves data where supported, while a drop/add guess may erase it. `Up` moves forward; `Down` is only a reverse program, not a data backup. `HasPendingModelChanges` checks code model against snapshot; pending migrations compare migration IDs with the database's history.

## Examples

```bash
dotnet ef migrations add RenameCustomerName
dotnet ef migrations has-pending-model-changes
```

If a CLR `Name` becomes `DisplayName`, inspect the migration. Replace `DropColumn` + `AddColumn` with an appropriate rename operation if the stored values must survive, and test the provider SQL against existing data.

## Common mistakes

- Treating migration scaffolding as proof that a production database has the expected schema.
- Deleting an applied migration or changing its meaning after deployment.
- Assuming a generated `Down` recovers lost values.
- Accepting a drop/add for a rename without checking data impact.
- Adding a non-nullable column without accounting for existing rows and lock duration.
- Assuming all providers support an operation or transaction identically.

## Knowledge checks with answers

1. **What are the two migration-comparison inputs?** Current model and last model snapshot.
2. **Does migration history certify live schema is correct?** No; out-of-band drift is possible.
3. **What should a data-preserving rename use?** A rename operation or explicit transformation, not an unreviewed drop/add.
4. **What does `has-pending-model-changes` check?** Model versus snapshot, not database-applied migration state.
