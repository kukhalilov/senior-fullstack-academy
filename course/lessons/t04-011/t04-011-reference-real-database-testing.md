# testing EF Core providers database isolation and pitfalls — Reference: Production-provider tests, isolation, and repeatability

## Scope and version

Sources: Microsoft's [testing overview](https://learn.microsoft.com/en-us/ef/core/testing/), [testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy), and [production database testing](https://learn.microsoft.com/en-us/ef/core/testing/testing-with-the-database). The guidance applies to EF Core 11.0.0 and current testing practices. Test framework APIs vary; this lesson focuses on database fidelity and isolation.

## How this group fits the mental model

A production-provider test is the evidence for claims about SQL translation, constraints, collation, transactions, and persistence. Its reliability depends on deterministic provisioning and isolation, not merely constructing a new context.

## Supplied names explained

- `Test against production database system` — run important persistence tests against the same database engine/provider used in production, often with a disposable local/container instance. This verifies behavior a different fake cannot guarantee.
- `Database integration test` — test that crosses the data-access boundary and exercises EF/provider/database behavior along with the calling code. Keep assertions focused on observable contracts and isolate its data.
- `Database fixture` — shared test-run resource that provisions, seeds, and exposes database configuration/context factories. Share expensive startup deliberately while avoiding shared mutable per-test state.
- `Test database lifecycle` — create/provision, readiness-check, migrate/create schema, seed, reset/isolate, and dispose the database. Make cleanup resilient to failures and ensure tests never target production credentials/data.
- `Test isolation` — arrange that tests cannot see or alter each other's state. A new context alone is not isolation; choose transaction, schema/database, or key namespace strategy appropriate to all connections and side effects.
- `Transaction rollback test strategy` — begin a transaction, execute the test behavior through the same participating connection/transaction, then roll it back. It is quick for compatible operations but cannot undo work committed independently on another connection or external side effect.
- `Respawn database reset pattern` — use the Respawn library to delete/reset data while preserving schema between tests. Configure tables/sequences and concurrency carefully; it is a library pattern, not an EF Core API, and it does not replace isolation between parallel workers.
- `Unique database per test worker` — provision a distinct database/schema for each parallel worker/process, so writes do not collide. It costs setup/storage and still requires deterministic reset within a worker.
- `Database container fixture` — fixture that starts a containerized DB engine, waits for health/readiness, provides a connection string, and tears the instance down. Pin images and ensure local/CI engine versions and startup health checks are controlled.
- `Testcontainers` — .NET library ecosystem for managing containerized dependencies in tests. It can automate lifecycle but needs Docker/runtime availability, correct image configuration, readiness, and cleanup; it does not itself guarantee data isolation.
- `Migration application test` — apply the application's migration chain to an empty database and verify schema/data assumptions. `EnsureCreated` is not a substitute because it skips migrations.
- `Provider-specific LINQ translation test` — execute representative LINQ against the production provider and assert behavior/results, thereby verifying translation supported by that provider/version.
- `Collation behavior test` — seed values whose case/accent/order distinctions matter and assert the result using the production database collation. A different engine can produce different matches/order.
- `Transaction behavior test` — verify commit/rollback/isolation behavior on the target database/provider, including multiple commands and connection boundaries relevant to the application.
- `Concurrency conflict test` — use competing contexts or operations to update the same row and assert the expected optimistic conflict or token predicate on the actual provider/database.
- `Connection string from test configuration` — load a test-only secret/configuration value from environment or CI secret storage; fail closed if it could point to production. Never commit credentials.
- `Test data builder` — helper that creates explicit valid entities/data for a scenario while keeping important values visible. Avoid hidden randomized data that makes failures nonrepeatable.
- `Deterministic seed data` — fixed minimal rows with known keys/relationships/boundary values that make assertions reproducible. Avoid relying on insertion order or generated IDs unless under test.
- `Parallel test database isolation` — ensure each worker's mutable rows/schema/database is separate, or safely serialize writes. A single shared fixture database can race even when every test uses a fresh context.

## Cross-item comparison

`Transaction rollback test strategy` is cheap when all tested work uses the same transaction; `Database reset pattern` can clean data committed across separate operations but may be slower and needs parallel separation. A shared `Database fixture` saves startup time; a `Unique database per test worker` protects against cross-worker writes. `Migration application test` applies the deployment migration path; `EnsureCreated` only makes a schema from the model and cannot validate that path.

## Examples

For parallel CI, start one pinned container per job, create a database/schema per test worker, apply migrations once per isolated database, seed deterministic data, and give each test a fresh context. If provisioning per test is too expensive, use one database per worker and a reset mechanism between tests; do not run concurrent destructive resets against shared state. Keep a separate test that exercises migration from an empty database.

## Common mistakes

- Calling a local SQL Server container “production” while it uses a different provider or incompatible engine version; state precisely what it matches.
- Using the same connection string for integration and production environments.
- Sharing mutable seed rows across parallel tests and assuming new contexts isolate them.
- Wrapping one context in a transaction while application code opens a second connection.
- Using schema creation as a proxy for testing the migration chain.
- Treating Testcontainers readiness as proof that migrations/data setup completed.

## Knowledge checks with answers

1. **What does a new context isolate?** EF's tracker/state, not the underlying shared database rows.
2. **When does transaction rollback fail as cleanup?** When operations commit outside its transaction or create effects in other resources/connections.
3. **Why test migrations separately?** The deployed migration path can fail even when current-model schema creation succeeds.
4. **How should parallel workers be isolated?** Separate database/schema or rigorously separate data namespaces, with no shared destructive reset race.
