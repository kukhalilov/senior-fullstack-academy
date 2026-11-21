# migrations schema evolution seeds and deployment — Reference: Applying, scripting, bundling, idempotence, and environment safety

## Scope and version

Based on Microsoft's [applying migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying), [managing migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing), [seeding](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding), EF11 [What's New](https://learn.microsoft.com/en-us/ef/core/what-is-new/ef-core-11.0/whatsnew), and the [final EF11 release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md). SQL and transaction semantics are provider-specific.

## How this group fits the mental model

Applying is a deployment event: choose which database, migration range, identity, environment, and review gate receives the schema changes. EF records applied migration IDs; it does not replace the surrounding release/rollback/compatibility plan.

## Supplied names explained

- **dotnet ef database update** — CLI applies migrations to the configured database up to a target migration (latest by default), or down to an earlier target; verify connection/environment and data-loss path.
- **Update-Database** — PMC equivalent for applying through EF tooling.
- **Database.Migrate** — Applies pending migrations synchronously at runtime; use only when startup migration tradeoffs and DDL permissions are acceptable.
- **Database.MigrateAsync** — Asynchronous runtime migration application; does not remove startup/privilege/compatibility tradeoffs.
- **IMigrator** — EF service for migration operations programmatically; treat migration execution as controlled deployment work.
- **IMigrator.GenerateScript** — Programmatic SQL generation between migration states; review/secure the resulting artifact.
- **dotnet ef migrations script** — Generates SQL for a migration range that can be reviewed, archived, tuned, and executed by a separate deployment tool/DBA.
- **Idempotent migration script** — Uses migration history checks to apply migrations not yet recorded. It is provider-specific and does not make destructive DDL harmless; EF-generated idempotent scripts are unsupported by SQLite.
- **From migration** — Starting boundary for script generation; normally last migration already applied (or `0` for an empty database).
- **To migration** — Target migration to reach; using an earlier target generates a reverse script with possible data loss.
- **Migration bundle** — CI-generated executable that applies migrations without SDK, EF tools, or source at execution time; supports EF migration lock and synchronous seeding.
- **dotnet ef migrations bundle** — Builds a bundle artifact. Set design-time environment/provider intentionally and pass deployment credentials securely at execution.
- **Migration history table** — EF relational table recording migration ID and product version; default name is `__EFMigrationsHistory`, configurable for context/provider.
- **__EFMigrationsHistory** — Default relational history table; it records applied migrations, not a complete schema diff or checksum of manually altered objects.
- **Generate script for review** — Production practice: create bounded SQL, inspect destructive/locking/data operations, test against representative database, and retain executed artifact/approval record.
- **Production migration deployment** — Controlled workflow with one migration identity, schema-change review, compatibility sequencing, backup/recovery plan, observability, and post-deploy verification.
- **Migration lock boundary** — EF Core 9+ serializes EF migration execution and seeding through a database lock. It does not lock out arbitrary external DDL or make app-start migrations operationally harmless.
- **Migration transaction behavior** — EF/provider generally wraps compatible operations in transactions; some DDL requires transaction suppression or provider-specific execution. Know what can partially apply and how to recover.
- **Startup migration hazard** — Runtime migration can delay/fail app readiness, require elevated runtime credentials, coordinate with app rollout, and execute long/blocking DDL. EF9+ locking mitigates EF-to-EF races but does not address these deployment risks.
- **Multiple application instances migration race** — EF9+ migration locking coordinates multiple EF migrators; still prefer one deployment step/identity and plan around non-EF actors, lock duration, app compatibility, and startup waiting.
- **Migration connection string** — Target database credentials/environment configuration used by tools/bundle/runtime; use secret storage, explicit target environment, and separate schema deployment identity.
- **Rollback via Down migration risk** — Targeting an older migration executes reverse operations and can drop data or violate compatibility. Prefer tested forward correction/restore when data cannot be reconstructed.
- **Backup before destructive schema change** — Ensure a recoverable, tested backup/PITR point before irreversible migrations; a backup does not replace migration review or rehearsal.
- **dotnet ef database update --add (EF Core 11)** — EF11 CLI option scaffolds the named migration, compiles it with Roslyn, immediately applies it, and saves files. It is useful for integrated workflows; inspect/version-control its output and do not treat it as a bypass of production controls.

## Cross-item comparison

SQL script permits review and manual tuning but does not invoke `UseSeeding`; bundle applies EF migration logic and sync seeding without SDK/source at runtime. CLI is excellent for local development but executes directly. Runtime migration uses the same migration lock (EF9+) but couples schema work to app lifecycle. Idempotence checks migration history; it does not prove the target schema is healthy. Migration lock prevents simultaneous EF migration runners; deployment coordination handles code/schema compatibility and external operations.

## Examples

```bash
dotnet ef migrations script InitialSchema AddOrders --output artifacts/orders.sql
dotnet ef migrations script --idempotent --output artifacts/all-migrations.sql
dotnet ef migrations bundle --output artifacts/efbundle
```

Set `DOTNET_ENVIRONMENT` or `ASPNETCORE_ENVIRONMENT` deliberately. The tools execute application code to construct the context and may select environment-specific provider/options. Pass secrets securely (not in checked-in scripts/logs), use a deployment principal, and test against the exact provider version.

## Common mistakes

- Using app runtime credentials with schema administrator privileges.
- Applying unreviewed migration SQL directly to production.
- Assuming idempotent means safe, provider-neutral, or reversible.
- Running migrations simultaneously from every app replica without a deployment design.
- Ignoring the EF9+ migration lock and incorrectly claiming migration races remain completely uncoordinated.
- Assuming lock protects external DDL or app-version compatibility.
- Executing scripts with the wrong environment/connection.
- Trusting `Down` to undo lost data.
- Forgetting SQL script execution skips runtime seed delegates.

## Knowledge checks with answers

1. **Recommended automated deployment artifact?** A migration bundle; use SQL when review/edit/DBA approval is required.
2. **What does migration locking do?** Serializes EF9+ migration/seeding execution, not every external database operation.
3. **Which credential should run production DDL?** A separate controlled deployment identity; app runtime should be least-privilege.
4. **What does an idempotent script not guarantee?** Safety, rollback, or cross-provider support.
5. **What is new in EF11's `database update --add`?** Scaffold and apply a migration in one command while saving source files.
