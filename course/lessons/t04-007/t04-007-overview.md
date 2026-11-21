# migrations schema evolution seeds and deployment — Big-picture orientation and mental model

This lesson follows Microsoft's [migrations overview](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/), [applying migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/applying), [managing migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/managing), and [data seeding guidance](https://learn.microsoft.com/en-us/ef/core/modeling/data-seeding). EF Core 11.0.0 shipped on 2026-11-10; its final status is in the [release notes](https://github.com/dotnet/core/blob/main/release-notes/11.0/11.0.0/efcore.md).

## Problem and purpose

An application's model changes over time, while a production database already contains schema and data. Migrations record intended schema transitions, keep an ordered history, and help databases move forward without recreating everything. They do not automatically make each transition safe, online, reversible, or compatible with all running app versions.

## Plain-language mental model

The current EF model is the desired mapping. The model snapshot is EF's saved previous mapping. Scaffolding compares the two and proposes an ordered migration with `Up` operations and a reverse `Down` path. Applying a migration records it in the database history table. Production deployment is a separate operational step: generate, inspect, test, and execute an artifact with a deployment identity.

## How the parts fit together

1. Change the model and scaffold a migration.
2. Review operations for destructive guesses (especially rename versus drop/add), data transformations, locking, provider support, and transaction boundaries.
3. Test upgrade and any supported rollback against a production-like copy.
4. Generate a script or bundle and set the correct environment/connection string.
5. Apply through a controlled deployment step, while application versions remain compatible with the transitional schema.
6. Monitor and only later remove compatibility structures after old app instances are gone.

EF Core 9+ has migration locking that coordinates EF migration execution and seeding. This reduces simultaneous EF migration races, but it does not remove startup DDL delays, elevated database permissions, compatibility hazards, provider locks, or the value of a dedicated deployment identity. EF Core 11 adds `dotnet ef database update --add`, which scaffolds and immediately applies a migration; it still saves source files for review/source control and is not a substitute for a deliberate production rollout.

## Concept map

```text
Current model ─compare snapshot→ generated migration operations
                                      ├─ Up: forward change
                                      └─ Down: attempted reverse
                                              ↓ review/test
                              SQL script or migration bundle
                                              ↓ deployment identity
                     schema + data transition + migration history

app rollout: expand → compatible code → backfill → contract later
```

## End-to-end walkthrough

Suppose a required `DisplayName` column is added to a large customer table. A naive add-not-null migration may fail on existing rows or lock the table while applying a default. Use an expand-and-contract rollout: add nullable column, deploy code that writes both/reads fallback, backfill in controlled batches, verify coverage, deploy code that requires the value, add constraint/default in a suitable online operation, and remove old path in a later release. The exact DDL, locks, and online options depend on the database engine.

## When to use it and tradeoffs

Use migrations for versioned schema evolution and model-managed fixed lookup data. Use reviewed SQL when DBAs must inspect/tune the artifact; use migration bundles for automated deployment without SDK/source at execution. `UseSeeding`/`UseAsyncSeeding` handle idempotent runtime initialization logic under EF's migration locking; implement both because tools and bundles call the synchronous delegate. Use `HasData` for stable key-known data whose changes should travel with migrations. Large operational backfills usually need controlled application/job logic or custom migration steps rather than one unbounded data update.

## What later lessons cover

The references cover migration files and model snapshots, deployment mechanisms and environment safety, then seeding/backfills/schema compatibility. Practice and interview lessons focus on failure modes, rollback, and zero-downtime sequencing.
