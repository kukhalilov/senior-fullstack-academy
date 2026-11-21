# integration testing databases webapplicationfactory and contracts — Reference: Database lifecycle, provider choice, reset, and parallel safety

# Scope and version

This lesson explains the supplied database lifecycle and isolation choices for integration tests using EF Core and disposable services. It focuses on testing behavior, not the complete EF Core, container-library, or database APIs. EF Core’s guidance checked on 2026-11-17 favors testing against the production database system where practical and explains the limitations of substitutes. [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy) [Testing with the database](https://learn.microsoft.com/en-us/ef/core/testing/testing-with-the-database)

# How this group fits the mental model

The database is both a dependency and a source of semantics. It decides how queries translate, how constraints behave, how transactions isolate writes, and how provider-specific functions work. A fast fake can test application decisions, but it cannot certify production database behavior. Isolation is a separate concern: the test must also keep its writes from interfering with other tests or real data.

# Supplied names explained

- `Test database` — A database instance or namespace reserved for tests. It must use safe credentials and contain no production data; make its ownership and cleanup explicit.
- `Database per test` — A new isolated database for each test case. It offers strong state separation but can make migrations and startup expensive. It works best when creation and disposal are automated.
- `Database per test collection` — A database shared among a deliberately serialized group of related tests. This can amortize setup, but requires a known reset strategy and care not to leak mutations between cases.
- `Database per test run` — One isolated database for a whole invocation, with data reset between tests or unique data per test. It reduces provisioning cost but increases the importance of deterministic cleanup and parallel-safety rules.
- `Unique database name` — A collision-resistant name assigned to a test’s database. Include a run/test identifier, respect engine naming limits, and delete only resources the test created. Names alone do not isolate a shared schema if tests still share underlying tables.
- `Transaction rollback isolation` — Wrap work in a transaction that the test rolls back afterward. It is effective only if application operations enlist in that same transaction. Independent connections, background tasks, implicit commits, external queues, and separately opened transactions can escape it.
- `Database reset script` — A repeatable operation that removes or restores test data. It must cover relationships, sequences/identity values, and any tables touched by the scenario. A partial reset can create order-dependent failures.
- `Respawn database reset` — Respawn is a .NET library for resetting database state between tests by deleting data while preserving schema. Configure exclusions and schema behavior carefully; it is not a migration tool and does not make shared parallel writes safe.
- `Disposable database container` — A short-lived database engine instance that can be started for a test run and discarded afterward. It improves reproducibility and provider fidelity, at the cost of container startup and runtime availability.
- `Testcontainers for .NET` — A .NET library for creating and controlling disposable containers in tests. Pin the image/version when reproducibility matters and configure a readiness condition appropriate to the database rather than assuming process startup equals readiness.
- `Testcontainers.MsSql` — The Testcontainers module intended to run SQL Server for .NET tests. Use it when SQL Server semantics matter, and follow its image acceptance, licensing, and runtime requirements.
- `Testcontainers.PostgreSql` — The Testcontainers module for running PostgreSQL in tests. Use a pinned server image aligned to the supported production major version if the application depends on PostgreSQL behavior.
- `Testcontainers.MySql` — The Testcontainers module for running MySQL in tests. Keep the image and server configuration aligned with production semantics, including relevant SQL mode and collation.
- `Production database engine in tests` — The same engine/provider class used in production, typically isolated in a disposable instance. This is the strongest practical way to exercise provider-specific SQL, collation, constraints and transaction behavior, but not a proof of production topology or data scale.
- `EF Core InMemory provider` — EF Core’s non-relational in-memory provider. It does not support transactions or raw SQL and may differ from production query behavior; Microsoft discourages it as a general database fake. It should not be presented as a lightweight relational database.
- `SQLite in-memory provider` — SQLite configured to keep data in memory for the test. It is relational and can be useful when a real production engine is unavailable, but query translation, collations, SQL functions and provider features can still differ.
- `SQLite shared in-memory connection` — The open SQLite connection that keeps a named in-memory database alive and shareable by contexts. Closing the connection deletes the database; keep it open for the full test lifetime if contexts must share the same state.
- `Test data builder` — A helper that creates valid test entities with meaningful defaults and allows a test to override relevant values. Keep it deterministic and avoid a giant builder whose hidden defaults obscure the case.
- `Deterministic seed data` — Known records with stable values created for a test. Use unique keys where tests can run concurrently, and seed only the minimum needed so failures have a clear cause.
- `Parallel database test isolation` — The guarantees that let database tests run concurrently without cross-test interference. Unique databases/rows, isolated schemas or serialized access can provide it; a framework’s parallel execution setting alone cannot.
- `Database cleanup` — Teardown that removes the database or test-owned data even when setup or assertions fail. Use ownership checks, `finally`/fixture disposal, and bounded cleanup timeouts; never target a configured production database.
- `Migration smoke test` — A test that starts from a clean database and applies the migration chain to verify the schema can be constructed. It complements application behavior tests; it does not validate production data migration performance or every historical upgrade path unless those paths are included.

# Cross-item comparison

**Provider fidelity:** A production engine instance is the strongest match for engine-specific behavior. SQLite is a useful relational test substitute but remains a different engine. EF Core InMemory is non-relational and has the most important semantic gaps. For EF Core database testing, Microsoft recommends real-provider tests for database behavior and warns against relying on InMemory or mocked query sets as equivalent substitutes. [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)

**Isolation:** Database per test is easiest to reason about but may be slower. A run-level database with reset can be faster, but depends on complete reset and concurrency discipline. Transaction rollback is efficient only when all test work shares the transaction. A test collection shares setup but makes state ownership more subtle. No within-group comparison applies to a single item.

# Examples

### Choosing an engine for a query test

If an order query uses SQL Server-specific date functions or depends on SQL Server collation, use SQL Server in the test. SQLite cannot verify these behaviors. EF Core InMemory cannot validate relational translation, transaction or raw-SQL behavior. Keep fast unit tests for application branching, but retain a smaller provider-backed suite for the database contract.

### Keeping an SQLite database alive

An in-memory SQLite database is created when its low-level connection opens and deleted when that connection closes. A fixture can own one open connection, create schema and seed data, then give contexts access to that same connection. If each context opens a new independent in-memory connection, it sees a different empty database. [EF Core testing without the production database](https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database)

### Deciding whether rollback works

Suppose the endpoint opens a second connection through a separately created context. Rolling back the test’s outer transaction may not undo the endpoint write. Before choosing transaction rollback, trace connection and transaction ownership through the actual code. If the system uses independent connections or background work, unique per-test data plus reset or a database per test may be clearer.

# Common mistakes

- Treating a database name as isolation while tests still write to shared tables.
- Using EF Core InMemory for transactions or raw SQL and assuming that passing proves production behavior.
- Using SQLite and silently inferring production SQL behavior from it.
- Closing the SQLite in-memory connection between contexts, thereby destroying the database.
- Assuming rollback covers independent connections or external side effects.
- Starting tests as soon as a container process runs without waiting for database readiness or migrations.
- Seeding shared fixed identifiers while tests run in parallel.
- Resetting rows but forgetting sequences, schemas, background jobs, or other persistent state.
- Running migration startup against a database that might contain user data.
- Capturing raw database configuration or dumps in CI artifacts without considering secrets and personal data.

# Knowledge checks with answers

1. **Which setup can validate a provider-specific EF Core query?** A test against that production provider/engine, because SQLite and InMemory do not implement its provider-specific translations.
2. **What is the key requirement for rollback isolation?** All relevant writes must enlist in the same transaction that the test rolls back.
3. **Why keep SQLite’s connection open?** An in-memory database is tied to the connection lifetime; closing the last connection deletes it.
4. **Does a unique database name guarantee safe parallel tests?** It does only if the tests actually use isolated databases and cleanup ownership is safe. A unique name alone does not isolate a shared database/schema.
5. **What does a migration smoke test prove?** The selected migration chain can create a schema in a clean database. It does not automatically prove production upgrade duration or all data migrations.

# Sources

- [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)
- [Testing EF Core without the production database](https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database)
- [Testing against the production database](https://learn.microsoft.com/en-us/ef/core/testing/testing-with-the-database)
- [Testcontainers for .NET](https://dotnet.testcontainers.org/)
- [Testcontainers wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)
- [Respawn](https://github.com/jbogard/Respawn)
