# migrations schema evolution seeds and deployment — Interview questions and reasoning

Source basis: Microsoft [migrations overview](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/), [applying migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying), [managing migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing), [data seeding](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding), and [EF Core 11 final release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Core questions

1. How does EF Core scaffold a migration?
2. What is the difference among a model snapshot, migration history, and live database schema?
3. Why must generated migrations be reviewed?
4. When would you use a SQL script versus a migration bundle?
5. What is an idempotent migration script, and what does it not guarantee?
6. Why is applying migrations at application startup risky?
7. What does EF Core 9+ migration locking protect?
8. Compare `HasData`, `UseSeeding`, and a backfill job.
9. Why configure both `UseSeeding` and `UseAsyncSeeding`?
10. How do you add a required column to a large table without breaking a rolling deployment?
11. Why can a migration `Down` method be unsafe?
12. How do multiple contexts manage migrations in one database?
13. How do you detect model changes with no migration?
14. What does EF Core 11's `dotnet ef database update --add` do?
15. How should database credentials differ between the app and migration job?

## Concise interview answers

1. EF compares the current model with the last model snapshot, creates migration operations and updates source metadata; it does not inspect the live database to infer every change.
2. Snapshot is the code comparison baseline; history records applied migration IDs; live schema is the actual database and can drift from both.
3. Scaffolding can guess drop/add for a rename or create destructive/locking/provider-specific operations. Review SQL, data effects, and rollout.
4. Use SQL when it needs review/edit/DBA handling; use a bundle for automated deployment without SDK/source at execution.
5. It checks migration history and applies missing IDs, but can still destroy data, block, fail on drift, or lack provider support.
6. It couples app readiness to DDL, requires runtime schema privileges, risks long startup/locks, and may be incompatible with old/new app instances.
7. It serializes EF9+ migration/seeding execution across EF runners. It does not protect external DDL or solve deployment compatibility/performance.
8. `HasData` is fixed snapshot-managed migration data; `UseSeeding` is idempotent initialization logic under EF's migration lock; large backfills need batches/checkpoints/monitoring.
9. CLI tools and migration bundles call the synchronous delegate; app async paths use async delegate.
10. Expand with nullable field, deploy dual-compatible code, backfill in batches, validate, enforce constraint, switch reads, and remove old path later.
11. It can drop/overwrite values and cannot reconstruct them; prefer a backup, forward correction, or compatibility-preserving rollback plan.
12. Assign distinct migration ownership/assembly/history table and deployment steps; prevent one context from applying the other's IDs.
13. Use `HasPendingModelChanges`/`dotnet ef migrations has-pending-model-changes`; pending database migrations are a separate history comparison.
14. It scaffolds a named migration with Roslyn, applies it immediately, and saves migration files; review and source control still apply.
15. A separate least-privilege-controlled deploy identity has schema-alter rights; app runtime gets only required data permissions.

## Deep follow-up answers

The model snapshot is not a database inspection. It captures what EF believes the previous model was. Migration history says which migration IDs are marked applied. Manual DDL, partial restores, failed external scripts, or drift can make actual schema differ. Validate the database using provider-specific inspection and deployment checks.

Idempotence is about migration history branching: a script can inspect which migrations are applied and skip recorded ones. It does not make a migration's destructive operation harmless, ensure a desired starting schema, or make provider support universal. SQLite, for example, does not support EF-generated idempotent scripts.

EF9+ migration locking is important: it protects simultaneous EF migrators and seeding callbacks from racing. It should not be misrepresented as “startup migrations are always race-prone.” The remaining reasons to use a dedicated deployment stage are review, runtime least privilege, avoiding app-start DDL delays, compatibility between app versions, controlled high-availability rollout, and coordination with external actors.

Migration deployment and application deployment are separate but coordinated. Expand-contract keeps old and new app versions compatible during a rolling rollout. A migration job should use controlled environment/connection configuration, output and review an artifact, apply with a schema identity, verify result, then allow app rollout/cleanup.

`UseSeeding` and `UseAsyncSeeding` are initialization callbacks, not `HasData` migration diffs. They run under EF migration lock at initialization/migration paths, including no-schema-change migrations. Since command tools/bundles call sync seeding, implement it even in async applications. External SQL scripts do not run either delegate.

## Scenario questions

### Scenario: migration drops a renamed column

**Strong approach:** Stop deployment, inspect scaffolded operations and data-preserving intent, use rename/custom migration operation, inspect provider SQL, rehearse with production-like rows, and verify values. Never rely on the generated `Down` to reconstruct dropped data.

### Scenario: all web replicas run Migrate at startup

**Strong approach:** Acknowledge EF9+ migration lock serializes EF migration execution, then identify remaining coupling: DDL privileges in app identity, readiness delay, long locks, app-version mismatch, and uncontrolled deployment timing. Move schema change to one reviewed bundle/script deployment step where operational control matters.

### Scenario: backfill and constraint for email uniqueness

**Strong approach:** Add nullable canonical column, dual-write, batch backfill, detect/resolve duplicates, verify completeness, build unique index with target-provider online strategy, switch reads, and contract old code later. Define rollback and resumability for each step.

### Scenario: seed code misses bundle

**Strong approach:** Implement synchronous `UseSeeding` as well as `UseAsyncSeeding`; test execution via bundle. If using external SQL, express seed writes as migration operations or a separate initialization process.

## Tradeoffs and alternatives

- Bundle: automated, reproducible EF runner; SQL script: reviewable/modifiable DBA artifact.
- Runtime migration: simple but couples startup and privileges; controlled deployment: separate operational step and explicit gate.
- `HasData`: declarative and migration-diffed; `UseSeeding`: procedural initialization; backfill job: operationally controlled large data work.
- `Down`: convenient for reversible development changes; backup/forward correction: safer for production data-bearing changes.
- One big transaction: atomicity, but may lock/log heavily; batched job: resumability but needs partial-progress/idempotency design.

## Common weak answers

- “The snapshot is the database schema.”
- “Idempotent means safe to run anywhere.”
- “All production migrations should run at app startup because EF locks them.”
- “EF migration locking does not exist until EF11.”
- “UseAsyncSeeding is enough for bundles.”
- “Down always rolls back data.”
- “A default-value migration is automatically online.”
- “`HasData` is runtime startup seeding.”
- “One migration can safely update any number of rows in one transaction.”

## Self-check rubric

A strong answer states the actual schema and data effect, provider/database assumption, deployment identity, old/new code compatibility, lock/round-trip/transaction risk, and verified recovery procedure. It correctly describes EF9+ migration locking while keeping deployment review separate from that safety boundary.
