# testing EF Core providers database isolation and pitfalls — Interview questions and reasoning

Sources: Microsoft's [EF Core testing overview](https://learn.microsoft.com/en-us/ef/core/testing/), [choosing a strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy), [production database testing](https://learn.microsoft.com/en-us/ef/core/testing/testing-with-the-database), and [testing without the production database](https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database).

## Core questions

1. How do you test an EF Core query reliably?
2. When is a production database test necessary?
3. Compare production-provider tests, SQLite in-memory, and EF InMemory.
4. Why is mocking `DbSet` problematic?
5. How do you isolate integration tests that run in parallel?
6. Why does SQLite in-memory require an open connection?
7. Does `EnsureCreated` test migrations?
8. When is a repository abstraction useful for unit tests?
9. What does transaction rollback isolate, and what can escape it?
10. How do you test provider-specific collation or functions?

## Concise interview answers

1. Run important query behavior against the actual production provider/database and assert meaningful results; use fakes only for clearly bounded application logic.
2. For translation, SQL dialect, collation, constraints, transactions, concurrency, migrations, provider functions, and other engine semantics.
3. Production provider gives highest fidelity but needs lifecycle/isolation. SQLite is relational but differs in dialect/collation/functions. EF InMemory is nonrelational and cannot verify relational SQL/transactions.
4. Its query usually runs as LINQ over an in-memory collection rather than EF provider translation; null, collation, SQL, and transaction semantics differ.
5. Separate database/schema per worker or strictly namespace all test data. Rollback can isolate same-transaction operations; a fresh context alone is not enough.
6. The database is bound to that low-level connection and is deleted when it closes; keep it open for fixture lifetime.
7. No. EnsureCreated builds schema from the current model; it does not apply or verify the migration chain.
8. When it represents stable, behavior-focused operations that allow application orchestration to be stubbed; it adds code and maintenance and need not be added solely to hide EF by default.
9. Only operations participating in the same transaction/connection are rolled back. Other connections, independent commits, and external effects can escape.
10. Seed targeted values and execute the query/function on the production engine/provider, with test configuration matching production semantics.

## Deep follow-up answers

### “Real database tests are too slow”

Measure the actual suite. Local/containerized databases and modest deterministic data can be fast enough for routine CI. Use a shared expensive fixture with isolated per-test data, or a database/schema per worker. Keep pure logic tests fast and reserve provider tests for persistence contracts. Fakes may speed a test but do not answer a database-specific question.

### “SQLite is relational, so it should be enough”

It is useful but remains a different database/provider. Collation, SQL syntax, types, functions, transaction details, and supported translations may differ. Retain targeted tests against production provider for behaviors that depend on those semantics.

### How do you safely parallelize a database test suite?

Provision a DB engine per CI job, then isolate workers with distinct databases/schemas or complete data namespaces. Apply migrations and seed each boundary deterministically. Do not run destructive reset operations concurrently against shared tables. Clean up after failure and ensure connection strings cannot target production.

### What is the purpose and cost of a repository for testing?

A behavior-focused repository lets application services/controllers be tested with stubs and keeps queries behind a contract. But each repository operation and implementation needs maintenance, and broad generic repositories may duplicate EF while hiding useful composition. Use it when it represents a real boundary; otherwise directly test EF behavior with the production provider and unit-test pure logic separately.

## Scenario questions

1. **A LINQ test passes in InMemory but fails in SQL Server.** The fake never translated SQL; add a production-provider regression test and retain the fake only for a narrower claim.
2. **Two CI workers occasionally delete each other's test rows.** Their tests share database state; isolate databases/schemas or every row with worker-specific keys and scope all queries.
3. **The rollback test leaves an audit event.** Check whether it used the same connection/transaction. If external, use an outbox or compensating behavior; DB rollback cannot undo it.
4. **A migration test passes with EnsureCreated.** It has not tested migrations; apply the chain from empty and supported previous schema states.

## Tradeoffs and alternatives

Use unit tests for pure business rules and application decisions. Use repository stubs for app code intentionally depending on a repository contract. Use SQLite for quick relational feedback where its limitations are acceptable. Use the real engine for provider semantics. Pair fast feedback with a focused production-provider suite, then add cloud-managed-engine validation when local engine differences matter.

## Common weak answers

- “We mock DbSet, so we tested EF.”
- “SQLite is the same because both are relational.”
- “New DbContext means isolated test.”
- “We call EnsureCreated, so migrations work.”
- “Rollback cleans up everything,” even when writes use another connection or an external service.
- “All tests should use the database,” without considering pure logic or difficult external failures.

## Self-check rubric

| Skill | A strong answer demonstrates |
|---|---|
| Fidelity | Identifies which claims require the production provider. |
| Isolation | Gives a concrete boundary for parallel workers and cleanup. |
| Test doubles | Explains their semantics and evidence limits accurately. |
| Migration coverage | Distinguishes schema creation from applying migrations. |
| Architecture | Uses repositories only for meaningful behavior boundaries. |
