# migrations schema evolution seeds and deployment — Exercises and worked solutions

Source basis: Microsoft's [migration management](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing), [applying migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying), and [data seeding](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding), plus [EF Core 11 final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Goals

- Review generated migrations for data, locking, and provider hazards.
- Choose a deployment artifact and least-privilege execution identity.
- Plan migrations that remain compatible during rolling app deployments.
- Select suitable seeding/backfill strategies and prove recovery paths.

## Worked example

A required `NormalizedEmail` column must be added to a large customer table while old and new application replicas run concurrently.

1. Add nullable `NormalizedEmail` and a supporting index strategy appropriate for the provider.
2. Deploy code that writes both old and new values and can read either.
3. Backfill in bounded idempotent batches with metrics/checkpoints.
4. Verify completeness/uniqueness and resolve conflicts.
5. Deploy code that reads the new value and continues writing it.
6. Add required/unique constraints using provider-appropriate, rehearsed DDL.
7. After old versions are gone, remove old field/path in a later migration.

This creates a compatibility window. It is not a one-command atomic migration; every phase needs a clear retry and rollback/forward-recovery plan.

## Exercises

1. A property rename scaffolds `DropColumn` + `AddColumn`. The table contains customer data. Correct the migration and describe the verification.
2. A migration adds a non-null column to a billion-row table with a default. List risks and design a safer rollout.
3. A deployment script is described as “idempotent, so safe to run anywhere.” Correct this statement.
4. Two app replicas both run `Database.MigrateAsync` at startup on EF Core 11. What race protection exists and what risks remain?
5. Production runtime identity has `ALTER TABLE` permissions because it calls Migrate at startup. Redesign the deployment identity model.
6. `UseAsyncSeeding` is configured but a CI migration bundle does not seed. Diagnose and fix.
7. Explain when a SQL migration script will and will not invoke seed callbacks.
8. Two DbContexts use separate migrations but share one database. Propose a safe history/assembly ownership design.
9. A rollback would drop a new column containing user-entered values. Should the deployment run `Down`? Design alternatives.
10. A data transformation updates 40 million rows in one migration transaction. Identify operational issues and redesign.
11. A developer deleted an applied migration from Git to “clean history.” What corrective steps are safer?
12. In EF Core 11, what does `dotnet ef database update --add` do and what production caveat remains?
13. A model has changed but `GetPendingMigrationsAsync()` returns none. Explain how to detect the missing migration.
14. A migration depends on SQL Server online index syntax and is run against SQLite in tests. What test boundary is wrong?

## Progressive hints

1. Use a rename operation and inspect data-preserving generated SQL.
2. Backfill/constraints/locks may affect every row. Expand first and measure provider-specific DDL.
3. Idempotent means skip already applied migration IDs, not safe or compatible.
4. EF9+ uses a database migration lock, but startup DDL/privileges/compatibility remain.
5. Put schema privilege in one deployment pipeline identity; keep application identity for runtime data access.
6. Tools and bundles execute the sync callback.
7. SQL is external DDL; it does not execute EF delegates.
8. Use distinct assemblies/history ownership or separate databases; prevent one context from applying the other's migrations.
9. Preserve data and move forward with corrective schema, restore, or controlled copy; don't assume Down restores values.
10. Batch with resumability/checkpoints and possibly separate job; account for logs, locks, transaction duration.
11. Keep applied migration history and add a corrective migration; coordinate if it is still unpublished/unapplied.
12. It scaffolds and applies in one command, saving generated files; production still requires review/compatibility/recovery planning.
13. `HasPendingModelChanges` compares current model to snapshot; pending migrations compares history IDs to database.
14. Unit tests with provider-neutral fake do not verify provider DDL; add target-provider integration/migration test.

## Complete solutions

1. Change the migration operation to `RenameColumn` if only the name changes and the provider supports it. Inspect generated SQL, apply it to a copy with realistic values, verify row counts/value preservation, and test `Down` limits.

2. A direct required-column/default change can rewrite or lock a huge table, consume transaction log, block requests, and fail due to provider rules. Expand with nullable/additive column, deploy compatible writes, backfill in batches, validate, create index/constraint with online/provider-specific strategy, switch reads, then contract later. Rehearse on realistic data and set timeouts/monitoring.

3. Idempotent scripts inspect `__EFMigrationsHistory` and apply missing migration operations. They can still drop data, block, fail on drift, be unsupported by a provider, or be incompatible with current app versions. They must be reviewed, tested, and run against the correct provider/schema.

4. EF Core 9+ migration locking serializes EF migrators/seeding operations and mitigates two EF runners applying concurrently. It does not remove startup delays/DDL locks, external DDL races, app compatibility issues, or the need for separate schema credentials. Prefer a deployment stage with one identity before/alongside application rollout.

5. Configure a dedicated migration bundle/script job with a schema-change identity. App runtime uses a least-privilege identity limited to required data operations. Store credentials in deployment secret management and rotate/audit them.

6. Implement both `UseSeeding` and `UseAsyncSeeding`; EF tooling/bundles use the synchronous callback. Keep the logic idempotent and guarded by database constraints. Test bundle execution against the target provider.

7. `dotnet ef database update`, `Migrate`, and migration bundles run the appropriate synchronous/async callback under EF's migration locking. A generated SQL script executed by an external tool does not invoke callbacks; represent data changes as migration SQL/operations or run a separate initialization job.

8. Assign explicit migration ownership: separate assemblies and history tables (or separate databases) per context/provider, explicit target/startup configuration, and deployment steps that execute each context's migrations intentionally. Validate that one context cannot claim or roll back another's migration IDs.

9. Do not assume `Down` is a safe operational rollback. Options include roll application code back while keeping additive schema, run a forward corrective migration, restore a backup/PITR copy if warranted, or archive/copy values before any destructive operation. The choice depends on write activity and data-loss acceptance; test it in a rehearsal.

10. A single huge update risks long blocking/transaction log growth, memory/timeout pressure, failed all-or-nothing work, and delayed app traffic. Prefer an idempotent batched job with checkpoints, progress metrics, throttling, retries, and validation; keep schema migration small and compatibility-safe. If it must run as migration code, use provider-appropriate batching and transaction strategy and rehearse failure recovery.

11. If the migration is already applied in shared/test/prod environments, restore it to source control and add a new corrective migration. If it is unpublished and unapplied everywhere, remove later migrations in reverse sequence and scaffold correctly. Never silently rewrite shared history.

12. EF11 can scaffold a migration with Roslyn and apply it in the same `dotnet ef database update --add` call, saving generated files for source control/recompilation. Production use still requires reviewing source/SQL, verifying environment/connection, assessing locks/data effects, and coordinating app compatibility.

13. `GetPendingMigrationsAsync` compares migration IDs with database history. Use `dotnet ef migrations has-pending-model-changes` or `Database.HasPendingModelChanges()` to compare model against snapshot; add a migration and test it.

14. DDL and transaction behavior are provider-specific. Run migration generation/application tests against the actual provider/database version (often a disposable container/database), not only EF InMemory/SQLite if production is SQL Server/PostgreSQL.

## Tests and edge cases

- Generate SQL for every supported provider and inspect rename/default/FK/index operations.
- Apply migrations from empty, previous-production, and partially restored states.
- Test both forward and rollback/forward-recovery paths on realistic data.
- Verify migration history table/context ownership and idempotent script provider support.
- Simulate multiple EF migrators and verify EF9+ locking behavior; separately test deployment with external DDL assumptions.
- Execute bundles in a clean deployment environment without SDK/source and confirm secure connection handling.
- Test sync seeding through CLI/bundle and async seeding through application migration.
- Exercise backfill interruption/restart and constraint failures.
- Test expand-contract while old/new app versions operate concurrently.
- Measure locks, transaction log, table rewrite, and index build impact for large data volumes.

## Reflection questions

- What data could this migration destroy, transform, or block?
- Which app versions must coexist while it runs?
- Which identity executes DDL, and what permissions remain in the app runtime?
- Can this operation be resumed safely after partial failure?
- What exact evidence shows that the database and model/snapshot/history agree?
