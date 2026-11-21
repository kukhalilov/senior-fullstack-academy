# integration testing databases webapplicationfactory and contracts — Core concepts and how they fit together

# Learning objectives

After this lesson, you should be able to choose an integration-test boundary that proves the behavior you care about, explain what the ASP.NET Core in-process host does and does not exercise, select a defensible database isolation strategy, distinguish consumer contracts from provider verification, and make failures reproducible and diagnosable.

# Prerequisites

You should understand HTTP requests and responses, dependency injection, a basic ASP.NET Core application, database connections and transactions, and the purpose of unit tests. A test fixture is shared setup managed by the test framework. A test double is a replacement for a dependency, such as a stub or fake; using one changes which real behavior the test can observe.

# Core concepts

## Boundary is a test design decision

“Integration test” does not identify one fixed scope. It can mean a few components in one process, an application plus a database, or an application communicating with another process. Name the boundary in the test’s purpose. “Exercises routing, filters, dependency injection and response serialization” is useful. “Tests the app” is too vague.

The ideal boundary contains the real components whose collaboration is the source of risk, while keeping unrelated dependencies controlled. A payment-provider outage test might use a controlled HTTP server; it should not charge a real card. A database translation test should use the relevant database engine, not a replacement whose query semantics differ. No single environment proves everything.

## ASP.NET Core host and HTTP path

`WebApplicationFactory<TEntryPoint>` bootstraps an application for test use and commonly supplies an in-process `TestServer` and `HttpClient`. This exercises the application host pipeline: middleware, routing, endpoint execution, filters, dependency injection, model binding and serialization as configured by the app. The factory can alter configuration and registrations for a test.

However, an in-process server does not use the full external network path. It cannot establish that a real socket accepts connections, TLS certificates and negotiation work, a reverse proxy forwards headers correctly, DNS resolves, or deployment configuration is right. For those, run an appropriate process and network test. Do not silently call an in-process test “end-to-end” when the missing boundary matters.

Test configuration must also be deliberate. The integration-test guidance uses `Development` as a default test environment when none is set, but application behavior may branch on environment. Set the intended environment and override only the settings needed for deterministic tests. Replacing a production registration can be appropriate, but replacing too many registrations means the test is validating a test-only composition.

## Database behavior and fidelity

Database testing has two separate questions:

1. **Fidelity:** Does the test use the same database engine/provider whose behavior matters?
2. **Isolation:** Can one test’s changes affect another test or a developer’s data?

The highest-fidelity practical integration test uses the production database engine, often in a disposable database or container. This can expose provider-specific SQL, collation, constraints, transaction behavior, generated values, and raw SQL. It still does not prove production permissions, data volume, topology, or every possible query.

SQLite is relational and useful for many tests, but it is not SQL Server, PostgreSQL, or MySQL. Query translation, case sensitivity, SQL dialect, functions, and provider features can differ. EF Core’s InMemory provider is non-relational: it does not support transactions or raw SQL and can differ in query behavior. Microsoft discourages it as a general substitute for a production database. If a test double is required, choose it for the narrower behavior it can reliably model and retain tests against the actual provider for database-dependent code. [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)

## Isolation mechanisms and their failure modes

- **One database per test** gives strong isolation but increases creation and migration cost. Use unique names and always clean up.
- **One database per test collection** reduces setup cost but requires careful state reset and prevention of parallel access to shared rows.
- **One database per test run with reset** can be efficient. Reset must cover all relevant tables, sequences, queues, and side effects, and tests must not overlap unsafely.
- **Transaction rollback** is fast when all work participates in the same transaction. It does not isolate independent connections, background tasks, external side effects, or code that commits on a separate transaction.
- **Disposable database container** provides a clean engine instance and avoids dependence on a preinstalled local service. It costs startup time and requires a compatible container runtime in CI.

An in-memory SQLite database disappears when its connection closes. To share it across multiple contexts, keep the low-level connection open for the test lifetime. A migration smoke test should create a clean database and apply migrations; it checks a separate failure mode from tests that start with a prebuilt schema.

## Consumer and provider contracts

A consumer contract records interactions a consumer relies on: request shape and relevant response or failure behavior. A provider verification runs those expectations against the provider implementation. In Pact, the consumer test typically uses a simulated provider, and the provider later verifies the generated contract. A broker can store contracts and verification results so deployment decisions can account for known consumer/provider compatibility.

Contracts are intentionally narrower than broad end-to-end tests. They help independent services evolve without requiring every change to run every service together. A contract only proves what it describes; it cannot prove unmodeled workflows, infrastructure behavior, or every semantic interpretation. Backward compatibility requires consumers and providers to agree on meaning as well as shape. Use deployment compatibility checks alongside consumer and provider verification where deployments are independent. [Pact FAQ](https://docs.pact.io/faq) [PactNet](https://github.com/pact-foundation/pact-net)

## Outbound HTTP dependencies

An `HttpMessageHandler` stub controls responses at the client’s handler boundary. This is fast and makes status/error cases easy to force, but it does not run a server or exercise sockets, HTTP framing, server routing, or actual network behavior. A loopback server such as WireMock.Net listens locally and lets a real HTTP client make requests; it can verify method, path, headers and body matching at a more realistic boundary. Neither setup proves the external partner behaves as expected. For that, use a provider sandbox or contract verification where available.

# Mechanisms and relationships

Use this decision sequence when adding a test:

1. Write the observable behavior and the specific risk (wiring, query translation, protocol handling, deployment).
2. Identify the smallest boundary that includes the real component responsible for that risk.
3. Identify what the chosen test cannot exercise. Add another test only if that gap matters.
4. Choose lifecycle and isolation before parallelizing: per-test resource, per-collection resource plus reset, or a transactional design with proven participation.
5. Make readiness explicit. “Container is running” or “port is mapped” is weaker than “the dependency accepts the operation this test needs.”
6. Bound timeouts, avoid blind retries, retain relevant failure diagnostics, and remove resources in `finally`/fixture disposal paths.
7. Run the same test command and dependency strategy in developer and CI environments, or document the intentional difference.

The layers complement one another: unit tests explore many input combinations cheaply; in-process host tests check the app pipeline; production-provider tests check database semantics; contract tests protect service interactions; and selected real-process tests check networking and deployment boundaries. If a test fails, report which boundary failed so diagnosis begins with evidence rather than speculation.

# Worked examples

### Example: transaction behavior

An endpoint creates an order and reserves inventory in one transaction. A test that uses EF Core InMemory cannot prove rollback semantics because that provider does not support transactions. A SQLite test might validate some relational flow but cannot establish the production provider’s behavior. Use a clean instance of the production database engine for the claim “a failure rolls back both writes.” If external messaging is involved, a database transaction alone cannot roll back the message; test the outbox or use a separate controlled boundary.

### Example: HTTP client error handling

To test that a client maps a 429 response to a retryable result, a handler stub may be sufficient: it returns a deterministic response and the test checks the client’s outcome. To check that the client actually sends the required method, route and headers over HTTP, use a loopback server. To establish that a remote provider honors a contract, run provider verification or a sanctioned sandbox test.

### Example: parallel tests

Two tests using the same customer row can race even if they use separate `DbContext` instances. Give each test unique identifiers and rows, or serialize access to the shared resource. A class-level fixture does not itself make mutable shared state safe. Cleanup must finish even after failure, and test names should make resource ownership discoverable.

# Misconceptions and edge cases

- **“TestServer is a real server.”** It models the ASP.NET Core application pipeline in process; it does not traverse a real socket or deployment path.
- **“In-memory means fast and realistic.”** EF Core InMemory is neither a relational engine nor a reliable stand-in for provider-specific behavior; Microsoft notes it can even be slower than SQLite in-memory in some scenarios.
- **“A rollback makes any database test isolated.”** Only work enlisted in the same transaction rolls back. Independent connections and external effects require another strategy.
- **“A healthy container is ready for my assertion.”** Readiness must match the dependency. A listening port can precede schema creation or service readiness. Testcontainers supports wait conditions, but choose an application-level condition when appropriate. [Wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)
- **“A contract test proves the whole integration.”** It proves selected interactions represented by the contract, not hidden behavior or deployment health.
- **“Retrying flaky tests makes the suite reliable.”** Retries can hide nondeterminism and produce false confidence. Find the shared state, readiness race, clock dependence, or infrastructure defect; use bounded retry only when explicitly testing transient recovery.
- **“More logging is always better.”** Request bodies, connection strings, dumps, and database snapshots can expose secrets or personal data. Keep artifacts useful, access-controlled, and short-lived.

# Knowledge checks with answers

1. **Does a passing `WebApplicationFactory<TEntryPoint>` test prove TLS works?** No. Its usual in-process `TestServer` path does not test TLS negotiation or a real socket; use a real-process/network test for that claim.
2. **Which provider should test SQL Server-specific query behavior?** A SQL Server instance, ideally isolated and disposable. SQLite and EF Core InMemory cannot establish SQL Server semantics.
3. **When is transaction rollback a poor isolation choice?** When the application opens independent connections, commits outside the test transaction, starts background work, or produces external side effects that are not enlisted.
4. **What does provider contract verification establish?** That the provider implementation satisfies the interactions encoded in the checked consumer contract; it does not prove the full distributed workflow.
5. **What should a readiness check represent?** The dependency is ready to serve the operations the test needs, not merely that a container process started or a port mapping exists.

# Sources

- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)
- [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)
- [Testing without the production database](https://learn.microsoft.com/en-us/ef/core/testing/testing-without-the-database)
- [Pact FAQ](https://docs.pact.io/faq)
- [Testcontainers wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)
