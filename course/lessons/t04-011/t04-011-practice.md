# testing EF Core providers database isolation and pitfalls — Exercises and worked solutions

Sources: Microsoft's [EF Core testing overview](https://learn.microsoft.com/en-us/ef/core/testing/), [testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy), [production database tests](https://learn.microsoft.com/en-us/ef/core/testing/testing-with-the-database), and [tests without the production database](https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database).

## Goals

Design tests whose database fidelity matches their claims, isolate parallel writes, and use test doubles at meaningful boundaries.

## Worked example

An ASP.NET Core application uses SQL Server with case-insensitive collation, migrations, optimistic concurrency, and one provider-specific date function. Unit tests stub an application repository to test controller decisions. Integration tests run against a disposable SQL Server container, apply migrations, seed known values, and test the query/collation/function/concurrency behavior. Each CI worker gets its own database. SQLite in-memory can provide quick relational tests but does not replace the SQL Server suite; its connection remains open during each test. The EF InMemory provider is not used to claim relational behavior.

## Exercises

1. A mocked `DbSet` query passes but production SQL throws a translation exception. Explain why and redesign coverage.
2. Two integration tests update the same seeded row in parallel and intermittently fail. Propose two isolation strategies.
3. A test uses SQLite in-memory, but each new `DbContext` sees an empty database. Diagnose the lifetime issue.
4. A team uses `EnsureCreated` in CI and never applies migrations. What production risk is untested?
5. A transaction rollback test passes, but an audit row remains after failure. Find the likely boundary problem.
6. Decide whether to use production-provider tests, SQLite, InMemory, or repository stubs for: provider function translation; controller error mapping; a purely computational price rule; and a transaction consistency guarantee.

## Progressive hints

1. LINQ over a fake queryable is CLR execution, not database translation.
2. A new context does not separate shared database state. Isolate the database/schema or test data namespace.
3. SQLite's in-memory store belongs to the low-level connection. EF may open/close per operation.
4. Creating the current schema is different from migrating from prior releases.
5. The audit operation may use another connection, commit independently, or target an external system.
6. Match the test setup to the behavior it asserts.

## Complete solutions

1. Keep a production-provider integration test for the repository query and assert its real result. If controller/application code needs database-free tests, expose a behavior-oriented repository interface and stub its result. A DbSet fake can still test simple in-memory helper logic, but label the limited claim.
2. Give each parallel worker a separate database/schema, or use unique data namespaces with all reads/writes scoped to them. A transaction rollback can isolate operations on the same transaction/connection but may not cover independently committed connections. Avoid serializing the entire test suite unless the shared resource makes isolation otherwise impossible.
3. Open one `SqliteConnection` with `Filename=:memory:` before context creation and keep it open until the test fixture is disposed. Contexts must use that same connection. Closing it deletes the database.
4. `EnsureCreated` does not run the migration chain. A migration can be missing, ordered incorrectly, or fail on a clean prior schema while EnsureCreated succeeds. Add a test that applies migrations to an empty disposable database.
5. The audit write likely escaped the transaction: another connection was opened, the operation committed independently, or the side effect was external. Share the same connection and transaction for DB writes; use an outbox/compensation design for external side effects.
6. Provider function translation and transaction guarantees require the production provider/database. Controller error mapping can use a repository stub. A pure price calculation should be a unit test with no EF provider. A SQLite test can provide additional relational feedback but cannot establish production-specific transaction behavior.

## Tests and edge cases

- Test case/accent differences using the deployed collation, not only the CLR comparer.
- Run migration application from a genuinely empty database and from a supported upgrade schema.
- Confirm parallel worker isolation under the test runner's actual parallel settings.
- Verify rollback and reset when a test throws before cleanup, and ensure external side effects are not mistaken for transaction effects.
- Keep test credentials separate and fail closed if a production connection string is supplied.
- A local engine version may differ from the hosted service; keep a smaller pre-deployment verification against the managed engine when that difference matters.

## Reflection questions

1. What exact claim does each test tier establish?
2. Which production behaviors are not modeled by your fake?
3. What is the isolation boundary for each parallel worker?
4. Do your CI tests exercise the same migrations and provider functions that production uses?
5. Is a repository abstraction describing domain operations or only mirroring DbSet methods?
