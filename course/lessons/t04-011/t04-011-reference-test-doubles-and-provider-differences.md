# testing EF Core providers database isolation and pitfalls — Reference: SQLite, EF InMemory, DbContext mocks, and repository boundaries

## Scope and version

Sources: Microsoft's [EF Core testing overview](https://learn.microsoft.com/en-us/ef/core/testing/), [strategy comparison](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy), and [testing without the production database](https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database). The central limits apply in EF Core 11.0.0; exact differences depend on the production provider and database configuration.

## How this group fits the mental model

Each alternative simulates a different boundary. A relational SQLite database is closer than an object store but is still another provider. EF InMemory and mocked queryables do not run production SQL translation. A repository stub avoids EF entirely in a test, but only for code designed to depend on that meaningful interface.

## Supplied names explained

- `SQLite in-memory provider` — EF SQLite provider using an in-memory SQLite database. It supplies relational behavior, but SQLite SQL, collation, type support, functions, and transaction details may differ from production.
- `SQLite open-connection lifetime` — SQLite in-memory database exists for the lifetime of its low-level connection. Keep one connection open for the fixture/test while contexts use it; closing it destroys the database.
- `SQLite database per test` — use a distinct SQLite in-memory connection (or isolated file) for each test to prevent state sharing. Ensure the connection stays alive for the complete test and is disposed afterward.
- `EF Core InMemory provider` — nonrelational EF store intended primarily for EF's own testing, sometimes used for constrained application tests. Microsoft's guidance strongly discourages using it as a general database fake.
- `InMemory provider transaction limitation` — it does not implement relational transaction semantics; warnings may be emitted/ignored, but this does not test commit/rollback behavior.
- `InMemory provider raw SQL limitation` — it does not execute relational SQL or verify raw SQL translation/execution.
- `SQLite provider translation difference` — SQLite translates supported LINQ to SQLite dialect and may lack production-provider operators, types, or SQL features. Passing proves SQLite behavior only.
- `Provider collation difference` — case/accent/sort equality rules differ by database and configuration. Queries that pass with SQLite can fail or return different rows under production collation.
- `Provider-specific EF.Functions limitation` — provider methods such as SQL Server-specific date functions cannot be meaningfully executed by SQLite or InMemory; test them with the production provider.
- `Mock DbContext` — substitute for a context in unit tests. Its behavior is custom/in-memory and does not verify EF's real query translation, change tracking, or database behavior.
- `Mock DbSet` — mocked set often implements `IQueryable` over an in-memory collection. Application LINQ then runs as CLR enumeration, not as provider-translated SQL; async query support and EF semantics are difficult to reproduce.
- `DbSet IQueryable fake` — fake query provider exposing a LINQ queryable over in-memory objects. It may differ in nulls, collation, translation, query evaluation, and transactions; do not treat it as SQL verification.
- `Repository abstraction` — application-facing interface with behavior-specific methods that wraps EF queries/writes. If its methods return materialized or async-enumerable results, callers can be stubbed without EF query execution; adding it carries design and maintenance cost.
- `Stub repository result` — test-controlled return value from a repository method for exercising application branching/orchestration. It says nothing about the production repository's SQL correctness.
- `Test double` — umbrella term for mock, stub, fake, or other substitute. State which behavior it simulates and what claim it cannot establish.
- `Fake database provider` — alternate provider or in-memory store used in place of production. It has its own semantics; a fake that accepts a query does not prove production accepts it.
- `Production-provider test versus fake-provider test` — the former validates actual provider translation and DB semantics; the latter is faster or more isolated for limited scenarios but has a fidelity boundary. Use both only when each answers a distinct question.
- `Fake provider query divergence` — difference between in-memory/alternate-provider execution and production SQL behavior, including collation, null semantics, supported functions, joins, type mappings, and transaction guarantees.
- `Testing non-query orchestration with DbContext mock` — can test simple application branches that call context methods, but mocking EF APIs directly is brittle. Prefer a meaningful repository seam for database-free tests or test persistence on the real provider.

## Cross-item comparison

`SQLite in-memory` is a real relational engine with known provider differences; `EF Core InMemory provider` has no relational query/transaction semantics. `Mock DbSet query` executes LINQ in memory; `Stub repository result` isolates application code behind an explicit contract. `Production-provider test versus fake-provider test` depends on whether the assertion concerns actual database behavior or just application response logic. `Test transaction rollback` and `Database reset fixture` are cleanup strategies for real DB tests rather than test doubles.

## Examples

Use a repository stub to test that a controller maps “no customer” to a not-found result. Use a production-provider integration test to verify the actual customer search query respects the production collation and tenant filter. A SQLite test can provide quick relational feedback, but retain the engine-specific test for the production contract. If using SQLite in-memory, open the connection before creating contexts and dispose it after assertions.

## Common mistakes

- Claiming an InMemory test validates transactions or SQL.
- Using `Ignore(InMemoryEventId.TransactionIgnoredWarning)` and treating the test as transactional.
- Assuming SQLite's relational nature makes it interchangeable with SQL Server or PostgreSQL.
- Mocking `DbSet` and concluding the LINQ expression translates.
- Creating an abstraction only for tests without considering maintenance and whether it represents a useful application boundary.
- Omitting production-provider tests because a fake suite passes.

## Knowledge checks with answers

1. **What does an EF InMemory query execute?** EF's nonrelational in-memory provider behavior, not production SQL.
2. **Why does SQLite's connection lifetime matter?** The in-memory database is tied to that connection and vanishes when it closes.
3. **What does a mocked DbSet query prove?** At most the in-memory behavior of its fake query provider; not EF translation.
4. **How can repository stubs be reliable?** Put queries behind behavior-focused methods and return materialized/async data rather than leaking `IQueryable` into application code.
