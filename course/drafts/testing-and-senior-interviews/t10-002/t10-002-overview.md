# integration testing databases webapplicationfactory and contracts — Big-picture orientation and mental model

# Problem and purpose

An integration test checks whether important parts of an application cooperate across a boundary. A request may travel through routing, middleware, validation, application services, persistence, and response serialization. Unit tests can isolate each part, but they cannot establish that the wiring and real infrastructure agree.

Integration tests answer questions such as: does this endpoint return the documented status and body when the production database contains a particular record? Does a transaction preserve its invariant? Does the HTTP client send the request shape a remote service expects? They are especially valuable at boundaries where configuration, provider behavior, serialization, or resource lifetime can invalidate otherwise correct components.

The goal is not to turn every test into a deployed-system test. Choose the smallest environment that exercises the behavior in question, then add a smaller number of tests at more realistic boundaries for risks that the smaller environment cannot expose.

# Plain-language mental model

Think of an application as a chain of stations that transform a request into a response. A unit test checks one station with stand-ins for its neighbors. An integration test connects several real stations and checks the handoff. A full end-to-end test includes more of the running system, often including a real process, network, database, identity provider, or deployment environment.

The test boundary is the important choice. `WebApplicationFactory<TEntryPoint>` usually boots the ASP.NET Core app with an in-process `TestServer`. The app pipeline is real, but the operating-system network path is not. A production database container gives much stronger evidence about SQL, constraints, collation, and transactions than a fake provider. A consumer contract test captures the HTTP interactions a consumer relies on, while provider verification checks those interactions against the provider implementation. Each setup proves some things and leaves others untested.

# How the parts fit together

```text
test intent
  ├─ application pipeline? ──> WebApplicationFactory + TestServer + HttpClient
  ├─ database semantics? ────> isolated instance of the production DB engine
  ├─ external HTTP client? ──> handler stub or loopback HTTP server
  └─ deployed boundary? ─────> real Kestrel/process/network/deployment environment

test fixture
  ├─ chooses configuration and dependency replacements
  ├─ creates isolated database/service state
  ├─ waits for dependencies to be ready
  ├─ performs observable requests and assertions
  └─ captures useful, appropriately protected diagnostics and cleans up
```

`WebApplicationFactory<TEntryPoint>` is a host fixture, not a guarantee that every production boundary is present. A database strategy has separate decisions for engine fidelity, per-test isolation, startup cost, concurrency, and cleanup. Contracts answer a different question from endpoint integration tests: “does this participant honor the agreed interaction?” rather than “does the whole business workflow work in production?”

# Concept map

| Risk | Test boundary | Evidence produced | What remains unproven |
| --- | --- | --- | --- |
| Middleware, routing, dependency injection, serialization | In-process ASP.NET Core host | App pipeline handles representative HTTP requests | Real sockets, TLS, DNS, proxy and deployment behavior |
| Query translation, collation, constraints, transactions | Production database engine, commonly disposable | Application and provider work together for tested cases | Untested production data volume, permissions, topology, and load |
| Consumer request/response assumptions | Consumer contract | Consumer’s declared interactions are explicit | Provider implementation is compatible until verified |
| Provider compatibility | Provider contract verification | Provider satisfies selected consumer contracts | Entire system workflow, deployment order, and unmodeled failures |
| External HTTP client behavior | Handler stub or loopback server | Client construction and selected protocol behavior | Actual partner service behavior |
| Deployed network path | Real process and network environment | Selected host, socket, TLS, proxy, and environment behavior | Any untested production condition |

The test suite is a portfolio of evidence. Fast, narrow tests should handle most input combinations. Integration tests should concentrate on cross-component contracts and infrastructure-dependent semantics. A few higher-level tests should cover critical deployment boundaries. Repeating one expensive setup for every business rule usually produces slow feedback without proportionally increasing confidence.

# End-to-end walkthrough

Suppose `POST /orders` accepts a customer and item list, writes an order, and returns its identifier. First define the behavior to prove: invalid quantities are rejected, valid requests create an order, and the response contains the persisted identifier.

1. Start the app through `WebApplicationFactory<TEntryPoint>`, with explicit test configuration and the real application registration pipeline.
2. Give the test an isolated database using the production engine when query, constraints, or transaction semantics matter. Seed only the records needed for the case.
3. Create an `HttpClient`, send a request, and assert the status code and response data. Read the database through a separate context when that confirms persistence rather than merely echoing response construction.
4. Ensure the fixture does not share mutable data with parallel tests. Dispose the client, host, connection, and database resources even when an assertion fails.
5. If this test runs in CI, wait for the database’s actual readiness, then preserve bounded logs on failure while avoiding secrets in artifacts.
6. Add a real Kestrel/network test only if the risk includes sockets, TLS, reverse proxy, or deployment configuration; the in-process test cannot prove those properties.

The example is a test design, not a claim that code was executed. Microsoft’s integration-testing docs describe `WebApplicationFactory` creating `TestServer`; EF Core’s database-testing guidance explains why provider behavior must be tested against the database that matters. [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0) [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)

# When to use it and tradeoffs

Use in-process host tests for application-pipeline behavior when the app’s registrations and middleware should be exercised quickly. Use the production database engine for behaviors that depend on its SQL translation, transaction semantics, collation, constraints, or provider-specific features. A disposable container is often a practical way to obtain a clean database, provided the CI environment can run containers and the test waits for readiness.

Use a handler stub when the test only needs deterministic responses from an outbound client. Use a loopback server when client behavior depends on HTTP parsing, headers, routing, or a realistic request/response exchange. Use consumer/provider contracts for separately deployed services with a stable interaction boundary. Use real-process tests when host and network behavior are in scope.

Each increase in realism costs setup time, runtime, and failure diagnosis. Each replacement risks missing behavior. State the specific risk the test covers, choose the smallest credible setup, and keep a test against the real production database or deployed boundary where that behavior cannot be faithfully represented by a double.

# What later lessons cover

The concepts lesson builds a decision process for boundaries and isolation. The host/client reference covers the supplied ASP.NET Core hosting and HTTP names. The database reference explains lifecycle, provider fidelity, and parallel safety. The contracts reference distinguishes consumer/provider verification from external HTTP stubs. The reliability reference covers readiness, deterministic configuration, cleanup, and useful diagnostics. Practice walks through designing tests for an order endpoint; interview preparation develops concise explanations and tradeoffs.

# Sources

- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)
- [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)
- [Pact FAQ](https://docs.pact.io/faq)
- [Testcontainers wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)
