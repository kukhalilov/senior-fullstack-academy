# testing EF Core providers database isolation and pitfalls — Big-picture orientation and mental model

This lesson follows Microsoft's [EF Core testing overview](https://learn.microsoft.com/en-us/ef/core/testing/), [strategy comparison](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy), [production-database testing guide](https://learn.microsoft.com/en-us/ef/core/testing/testing-with-the-database), and [testing without the production database](https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database). The strategy applies to current EF Core 11.0.0; provider differences remain important across versions.

## Problem and purpose

Persistence tests should prove the behavior that matters: query translation, constraints, transactions, collation, concurrency, migrations, and application decisions. A test can pass against a fake database while production fails because the fake executes different semantics. Reliable coverage uses the production database engine for persistence behavior and uses fakes for behavior that can be tested without pretending a different provider is equivalent.

## Plain-language mental model

Each test setup is a model of some part of reality. A production-provider test models the database closely but must control lifecycle, data, and parallelism. SQLite is a real relational engine but a different one. EF InMemory is a nonrelational store, not a miniature SQL Server. Mocking a DbSet usually means LINQ executes in memory instead of being translated. A repository stub tests application orchestration at a boundary, not EF or SQL behavior.

## How the parts fit together

Unit tests check pure rules and application orchestration quickly. Production-provider integration tests verify the persistence contract. Container fixtures can provision a database for repeatable local/CI runs. Isolate tests using rollback where appropriate, per-test schemas/databases, or deterministic reset mechanisms; parallel workers need separate isolation boundaries. Test doubles remain useful for failures difficult to induce or for code that already depends on a meaningful repository interface.

## Concept map

```text
what behavior is under test?
├─ pure/application decision → unit test or stub meaningful repository
├─ SQL/provider/migration/transaction behavior → production provider
├─ relational behavior, fast partial feedback → SQLite with known differences
└─ simple constrained logic only → EF InMemory, with explicit limitations

real DB confidence requires: lifecycle + repeatable data + isolation + cleanup
```

## End-to-end walkthrough

For a query filtering names under the production database's collation, create a disposable test database with the production engine/provider, apply migrations, seed a small deterministic set, run the endpoint/query, and assert the returned rows and important command behavior. Give each parallel worker its own database/schema or unique key namespace. Reset between tests with a proven mechanism and clean up reliably. Keep a separate unit test for authorization decisions using a repository stub if that boundary already exists. A SQLite test can provide fast relational feedback but cannot prove production collation, provider functions, or SQL dialect behavior.

## When to use it and tradeoffs

Use production-provider tests for provider translation, constraints, SQL, collation, transaction, concurrency, and migrations. Use SQLite in-memory when relational behavior is useful and the known differences are acceptable; keep the connection open for the full database lifetime. EF InMemory may suit constrained tests that do not depend on relational behavior, but is discouraged for general persistence tests. Mock a repository for application orchestration when a meaningful abstraction exists; introducing one has implementation and maintenance cost.

## What later lessons cover

The concepts lesson organizes test fidelity and isolation. Reference lessons explain production-provider fixtures and test doubles. Practice designs a parallel CI test suite. Interview questions cover fake-provider divergence, database lifecycle, and choosing a test boundary.
