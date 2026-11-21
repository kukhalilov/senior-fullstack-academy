# integration testing databases webapplicationfactory and contracts — Exercises and worked solutions

# Goals

By completing this practice, you will be able to choose an evidence-producing test boundary for an ASP.NET Core endpoint, isolate database state, distinguish database fidelity from speed, and design a repeatable external HTTP dependency test. Work through the exercises before reading each solution.

# Worked example

An application exposes an order-creation endpoint. It validates quantity, persists an order, and sends a request to a pricing service. Your team wants confidence that invalid quantities are rejected, valid orders persist using the production database, the outbound request is formed correctly, and a pricing outage is handled safely.

First separate claims by boundary:

| Claim | Test setup | Evidence / limitation |
| --- | --- | --- |
| ASP.NET Core routing and validation produce the expected HTTP response | Factory-created client and in-process `TestServer` | Exercises application pipeline; does not prove sockets/TLS/proxy |
| The production database accepts the query and transaction behavior | Isolated production database engine, optionally containerized | Tests real provider behavior; still not production scale/topology |
| The outbound client maps a 503 correctly | `HttpMessageHandler` stub | Deterministic client logic; no server or socket behavior |
| The outbound request has the expected HTTP method/path/headers/body | Loopback HTTP server such as WireMock.Net | Exercises ordinary local HTTP; not the actual pricing service |
| Consumer and pricing provider agree on selected interactions | Consumer contract plus provider verification | Covers recorded interactions only |

Now design isolation. Give each test a unique order/customer identifier or create a database per run and reset it between cases. If testing transaction rollback, establish that all relevant database operations share the transaction. Give the service fixture ownership of the host, database/container, and client; make cleanup safe after partial setup. Wait for database readiness before applying schema or sending requests. Capture relevant request/response and container diagnostics on failure, redacting credentials and personal data.

This design uses separate tests for distinct claims. It does not try to make one slow full-stack test prove every possible behavior.

# Exercises

## Exercise 1: Pick the boundary

For each question, select the smallest credible test setup and state one thing it cannot prove:

1. Does endpoint validation return the documented 400 response?
2. Does a SQL Server-specific date query translate correctly?
3. Does an HTTP client map a 429 into a retryable result?
4. Does an application work behind the production reverse proxy with TLS termination?
5. Does a provider remain compatible with all recorded consumer interactions?

## Exercise 2: Repair database isolation

Five tests share one SQL Server test database. They each insert an order with fixed key `100`, run in parallel, and rely on a transaction created by the test while the endpoint creates its own database context. Failures appear only in CI. Propose two valid fixes, identify which gives stronger isolation, and explain why the current rollback assumption is unsafe.

## Exercise 3: Diagnose an “in-memory” false confidence

A test uses EF Core InMemory and passes for a LINQ query. In production, the same query fails due to provider-specific translation and returns different results under the database’s collation. Explain why the test passed and propose a layered replacement strategy.

## Exercise 4: Make readiness meaningful

A CI job starts a database container and immediately runs tests. Occasionally the first migration fails with a connection error. The team adds a two-second sleep. Explain why this is fragile and define a better readiness condition and failure diagnostics.

## Exercise 5: Contract vs schema

An OpenAPI validation passes for an API response containing a numeric `price`. A consumer interprets the value as cents, while the provider returns major currency units. Explain what the schema established, what it missed, and how a contract or semantic assertion can address the gap.

## Exercise 6: Flaky test decision

A test sometimes fails once and passes on retry. The test has a shared database fixture, runs in parallel with other tests, and calls a remote sandbox. Identify at least four possible causes and give a diagnosis order before introducing retries.

# Progressive hints

1. Ask which actual component behavior is in the claim; the endpoint pipeline, SQL provider, HTTP client code, proxy, or provider interaction.
2. Separate unique rows/database/schema from a shared outer transaction. Trace the endpoint’s own connections and transaction participation.
3. A fake provider is not a SQL translator for the production engine. Keep fast tests, but move database semantics to the real provider.
4. A sleep measures elapsed time, not readiness. Probe the operation required by the test and preserve evidence if it never becomes ready.
5. Structural type and semantic meaning are different contracts.
6. Check state sharing and data races, external service instability, readiness, clock, resource limits, and timeouts.

# Complete solutions

## Exercise 1 solution

1. Use an ASP.NET Core factory/client with the in-process host. It cannot prove TLS, proxy behavior or real socket handling.
2. Use an isolated SQL Server database/instance, for example a disposable SQL Server container if the CI runtime supports it. SQLite and EF Core InMemory do not prove SQL Server translation.
3. A handler stub is usually enough to exercise the client’s mapping branch. It cannot prove a real server accepts the request or that the network path works.
4. Use a real process and environment containing the relevant Kestrel/network/proxy/TLS path, or a deployment test close enough to it. An in-process `TestServer` cannot exercise those boundaries.
5. Generate consumer contracts and verify the provider implementation against the relevant versions. That cannot prove unmodeled business workflows or deployment configuration.

## Exercise 2 solution

One fix is to give each test a unique key and ensure every query/assertion is scoped to that test-owned row, while confirming the endpoint’s separate context participates in the same intended transaction if rollback is the cleanup mechanism. A stronger isolation fix is a separate database per test (or per non-parallel collection) with deterministic teardown. The current design collides on key `100`, and a test-owned transaction may not include the endpoint’s separately created connection/context. Either make transaction ownership explicit across the application boundary or avoid relying on rollback and isolate the actual database state.

## Exercise 3 solution

EF Core InMemory evaluates behavior using a non-relational provider with different query and comparison semantics; it does not exercise production SQL translation or collation. Retain unit tests for application decisions and use SQL Server-backed integration tests for the query and database behavior. SQLite in-memory can be a faster relational substitute for some generic flows, but it still cannot establish SQL Server-specific translation or collation. EF Core’s own testing guidance documents these limitations and discourages InMemory as a general fake. [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)

## Exercise 4 solution

A fixed sleep is fragile because machine load, image startup, database recovery, and CI resource contention vary. Configure a bounded readiness probe that performs a database-level operation needed by the suite, and only then apply migrations. On timeout, include elapsed time, the failed readiness condition, container exit/status details, and relevant logs. A port check alone can still pass before the database is ready to accept useful work. [Testcontainers wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)

## Exercise 5 solution

The OpenAPI check established that `price` has a numeric shape, not whether it represents cents or major units. Add a semantic assertion in the consumer-side integration/contract test, document the unit in the schema where possible, and verify provider behavior against that interaction. Version the contract so deployment compatibility is evaluated for the intended builds.

## Exercise 6 solution

Possible causes include: duplicate/shared database keys; a reset racing with another test; the endpoint using a connection outside the test transaction; sandbox throttling or downtime; a missing readiness check; a timeout too short under CI load; environment variables leaking between parallel tests; and time-sensitive assertions. First record which phase failed, remove the uncontrolled remote sandbox by using a controlled HTTP boundary for routine tests, make data unique, inspect fixture ownership and connection/transaction boundaries, and add explicit readiness and bounded timeouts. A retry is only justified after the failure mode is understood and the operation is safe to repeat; retain first-attempt evidence.

# Tests and edge cases

Use this checklist while reviewing the design:

- Each test claim names a boundary and a behavior it can actually observe.
- Database-provider-specific assertions run against the provider that matters.
- Test data is unique or the shared database is reset under a safe execution policy.
- Transaction rollback is used only when every relevant write joins that transaction.
- SQLite in-memory users keep the shared connection open for the test lifetime.
- Container startup waits for useful readiness, not just process start or an open mapped port.
- Timeouts are finite and diagnostics explain which phase failed.
- Remote calls are controlled in routine tests; contract/sandbox checks are separate.
- Cleanup runs after setup failure and after assertion failure.
- Logs and artifacts redact secrets and personal data.

# Reflection questions

1. Which integration boundary in your current project has the largest gap between test and production?
2. Which data resources are shared between tests, and who owns their cleanup?
3. What would a failing test log need to show for you to diagnose it without rerunning locally?
4. Which contract behavior is currently assumed but not encoded by an assertion or schema?
5. Where would a production-engine test provide more value than adding more fake-provider cases?

# Sources

- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)
- [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)
- [Pact FAQ](https://docs.pact.io/faq)
- [Testcontainers wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)
