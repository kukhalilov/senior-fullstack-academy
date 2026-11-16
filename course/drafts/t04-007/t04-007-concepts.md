# migrations schema evolution seeds and deployment — Core concepts and how they fit together

This lesson uses official Microsoft [migration overview](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/), [apply/deployment guide](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying), [migration management](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing), and [seeding guide](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding). EF Core 11 is released; see its [final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Learning objectives

Explain the model snapshot versus actual database state; review scaffolded migration operations; choose a deployment artifact; plan forward/rollback and compatibility; select a seeding strategy; and design safe expand/backfill/contract sequences for production data.

## Prerequisites

Know EF relational models, SQL DDL/DML, database transactions, indexes/constraints, deployment environments, and application version rollout. Migration command examples here primarily target relational providers; provider capabilities differ.

## Core concepts

### Migration files record transitions, not a live schema diff

EF compares the current model to the last model snapshot when scaffolding. The migration source is version-controlled; generated operations describe what EF thinks changed. The snapshot is not queried from the database. A database's `__EFMigrationsHistory` records applied migration IDs/product version, but does not prove every manual schema edit matches the model.

`Up` applies forward operations; `Down` attempts to reverse. Dropped data cannot be recovered just because a `Down` method recreates a column. A property rename may scaffold as drop/add, losing values; use an explicit rename or a data-preserving transformation when that is the intent.

### Review generated DDL and operational behavior

Inspect nullability/defaults, FK/index creation, data movement, table rebuilds, lock duration, transaction suppression, provider restrictions, and generated SQL. An operation can compile yet fail or block on production volume/data. Test on a realistic copy and record query/lock/rollback procedures.

### Current deployment paths

- **Reviewed SQL script**: good when a DBA or gated pipeline must inspect/tune SQL. A SQL script executed externally does not run EF `UseSeeding` delegates. Idempotent scripts check migration history, but support is provider-specific (SQLite does not support EF-generated idempotent scripts).
- **Migration bundle**: CI-generated executable, runnable later without SDK/tools/source. It uses EF migration locking and runs the synchronous `UseSeeding` delegate.
- **EF CLI/PMC commands**: convenient in development/testing; execute app code to construct the context and use the chosen connection. Review is not inserted automatically before application.
- **Runtime `Database.Migrate`/`MigrateAsync`**: possible; EF9+ migration lock coordinates EF migrators, but schema deployment remains coupled to app startup, requires DDL privileges, and may delay/impact availability. Prefer a controlled deployment step when review, least privilege, rollout coordination, or high availability matters.
- **EF11 `dotnet ef database update --add`**: scaffolds a migration and applies it in one command, saving generated files. Use appropriately for development/Aspire-style workflows and still review/version control the migration.

Use a deployment-only credential with schema privileges; runtime app credentials should generally have only runtime data permissions. Set `DOTNET_ENVIRONMENT`/`ASPNETCORE_ENVIRONMENT` deliberately when generating/running artifacts because design-time context construction can use environment-specific provider/connection settings.

### Migration locking is a boundary, not rollout design

EF Core 9+ uses database migration locking to serialize EF migration/seeding execution. It mitigates concurrent EF migrator operations. It does not serialize arbitrary external DDL, prove the application code is compatible with old/new schemas, prevent long locks, or make it wise for every replica to own deployment credentials. Use one controlled migration identity/step in production.

### Seeding choices

`HasData` is model-managed data: keys and values are part of snapshots/migration operations. It suits stable fixed data, not mutable users/orders or arbitrary startup logic. `UseSeeding`/`UseAsyncSeeding` (EF9+) are custom initialization callbacks invoked by EnsureCreated/Migrate/tooling/bundles under the migration lock, including when no migrations changed. Implement both because EF tools and bundles use the synchronous callback. Make seed logic idempotent and use a unique constraint to protect invariants; SQL scripts executed externally do not call the delegates.

Manual migration customization can use `MigrationBuilder.Sql`/operations; large data backfills often need batches, checkpoints, rate limits, telemetry, and resumability. Schema DDL plus a huge data transformation can create long transactions/locks; separate phases where required.

### Expand and contract for rolling deployments

During rolling deploy, old and new app instances may use the database simultaneously. First expand with backward-compatible nullable/additive schema, then deploy code compatible with both old/new schema, backfill data, add stronger constraints/indexes, deploy code that relies on new schema, and remove old fields/paths only after old code is gone. “Rollback application binary” is not the same as reverse database migration; preserving forward compatibility is often safer.

### Multiple contexts, history, and squashing

Keep migrations aligned with their context/provider and migration assembly. If multiple contexts share a database, define separate migration ownership/history configuration to avoid collisions and wrong-context application. Squashing/baselining rewrites history and is a manual coordinated process: back up, verify every environment's state, produce a replacement baseline, and test both existing and empty databases. Do not delete an applied migration; add a corrective migration.

## Mechanisms and relationships

`dotnet ef migrations add`/`Add-Migration` scaffold; `dotnet ef database update`/`Update-Database` apply; `dotnet ef migrations script` produces SQL; `--idempotent` checks the history table where provider supports it; `dotnet ef migrations bundle` packages execution; `IMigrator` and `GenerateScript` provide programmatic migration operations. `dotnet ef migrations has-pending-model-changes` and `Database.HasPendingModelChanges()` detect model changes not captured by a migration; this differs from listing pending migrations in a database.

## Worked examples

```powershell
# Build a reviewed artifact for a known environment
$env:DOTNET_ENVIRONMENT = 'Production'
dotnet ef migrations script --idempotent --output artifacts/migrations.sql

# Automated deployment artifact; execution uses a dedicated secret/identity
dotnet ef migrations bundle --output artifacts/efbundle.exe
```

Set a real target/startup project and provider connection via secure pipeline configuration. Inspect the script/bundle target and migration range before execution; never put credentials in checked-in migration files or command logs.

## Misconceptions and edge cases

- The snapshot is not the database schema; manual edits/drift can exist.
- A generated `Down` does not restore dropped/rewritten user data.
- An idempotent script is not harmless, universally supported, or safe against wrong provider/schema.
- EF9+ migration lock does not solve application/schema compatibility or DDL performance.
- `UseAsyncSeeding` alone is insufficient for CLI/bundle workflows; sync seeding is invoked there.
- A SQL script does not execute seeding delegates.
- Seed data with unstable/generated keys can produce repeated migration churn.
- `GetPendingMigrations` checks database history; `HasPendingModelChanges` checks model versus snapshot.
- Adding a non-null column to a huge existing table can fail or block even if migration compiles.

## Knowledge checks with answers

1. **What does EF compare to scaffold a migration?** Current model against the last model snapshot, not direct live schema inspection.
2. **What is the production difference between bundle and SQL script?** Bundle runs EF migration code/seeding; SQL is reviewable/editable and externally executed without `UseSeeding` callbacks.
3. **What does migration locking protect?** EF migration/seeding operations from concurrent EF execution, not arbitrary external DDL or rollout compatibility.
4. **Why configure both seed callbacks?** CLI tools and bundles invoke synchronous `UseSeeding` even if the app's normal path is async.
5. **What is safer than rolling back a destructive schema change?** Often deploy compatible code/schema forward with a corrective migration, depending on data and system state.
