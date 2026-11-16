# integration testing databases webapplicationfactory and contracts — Interview questions and reasoning

# Core questions

1. What does an integration test prove that a unit test with test doubles does not?
2. What does `WebApplicationFactory<TEntryPoint>` create, and what does its normal `TestServer` boundary leave out?
3. How would you test an ASP.NET Core endpoint that writes to a database?
4. Why is EF Core InMemory not equivalent to the production database?
5. Compare database-per-test, transaction rollback and reset-after-test strategies.
6. When would you use an HTTP handler stub versus a loopback HTTP server?
7. Explain consumer-driven contract testing and provider verification.
8. What does a contract broker contribute?
9. How do you make container-backed integration tests reliable in CI?
10. What information should be captured when an integration test fails?
11. When is it appropriate to retry a flaky integration test?
12. How would you cover a reverse proxy or TLS behavior that an in-process test cannot exercise?

# Concise interview answers

1. An integration test exercises real collaboration across a selected boundary—such as framework wiring, database behavior or HTTP serialization—where unit-test doubles cannot establish that the real components agree.
2. It bootstraps the ASP.NET Core app and usually provides an in-process `TestServer` and client. This covers the app pipeline but not real sockets, TLS, DNS, reverse proxies or deployment configuration.
3. Use an ASP.NET Core factory/client for the app pipeline and an isolated instance of the production database engine for provider-dependent behavior. Seed minimal data, assert observable HTTP and persistence outcomes, and clean up deterministically.
4. EF Core InMemory is non-relational, does not support transactions or raw SQL, and can differ in query behavior. SQLite is relational but still differs from a production provider. Test provider-specific behavior against that provider.
5. Database-per-test gives strong isolation but costs more setup. Rollback is fast only if all relevant work joins the same transaction. Shared database plus reset is efficient but requires complete reset and safe parallel execution.
6. Use a handler stub for fast, deterministic client-logic branches. Use a loopback server when the actual HTTP request/response exchange matters. Neither is the real external service.
7. The consumer records interactions it relies on against a simulated provider; provider verification checks that the provider implementation satisfies those interactions.
8. A broker shares versioned contracts and verification results, helping teams assess compatibility of particular consumer/provider builds.
9. Pin appropriate images, isolate data, wait for application-level readiness, bound timeouts, collect failure logs, and ensure resources are disposed even when setup fails.
10. Capture test identity, failed phase, relevant request/response details, readiness result, and dependency logs with correlation context; redact secrets and personal data.
11. Only with a defined reason, bounded attempts, first-attempt diagnostics, and an operation safe to repeat. Retries should not hide a race, shared-state bug or infrastructure defect.
12. Launch a real process and exercise the relevant network path, proxy and TLS configuration in a suitable test environment. An in-process server cannot prove these boundaries.

# Deep follow-up answers

## “How do you choose the test boundary?”

Start from the risk and expected evidence. If the risk is app routing or serialization, an in-process host is sufficient. If it is SQL translation, constraints or provider-specific transactions, use the actual engine. If it is outbound request construction, a handler stub may suffice; if HTTP behavior matters, use a loopback server. If the risk is TLS or a reverse proxy, run a process through that path. State what the chosen setup does not cover. Avoid claiming broad end-to-end confidence from a narrow test.

## “Would you ever use a database fake?”

Yes, for narrow behavior where the fake’s limitations are acceptable, or when controlling database failures is otherwise impractical. I would not use EF Core InMemory to validate relational query behavior, transactions, raw SQL, or provider-specific features. I would keep at least a focused suite against the production engine. SQLite can be a useful relational substitute for some cases, with explicit awareness that SQL dialect, collation and provider functions differ.

## “How do you prevent cross-test contamination?”

Give each test ownership of isolated resources or unique data. If a database is shared, reset all affected state and serialize access where required. Trace connection and transaction lifetimes instead of assuming rollback. Treat background work and external systems as separate side effects. Ensure teardown is safe after partial initialization and does not delete resources it did not create.

## “What does a consumer contract not tell you?”

It does not cover unrecorded interactions, every business rule, network/deployment health or the full workflow. Contract confidence depends on representative consumer expectations, provider state setup, version traceability and provider-side verification. Schema validation can complement contracts but may not describe semantic meaning.

## “How do you keep container tests useful in CI?”

Use a pinned engine version aligned to production where practical; configure readiness to test the capability needed, not just container liveness; isolate data; use bounded startup and request timeouts; and preserve relevant logs before cleanup. Keep the routine test suite independent of a public remote sandbox. Make CI service dependencies and credentials explicit without exposing secrets in output.

# Scenario questions

## Scenario: “The tests pass on SQLite and production fails on SQL Server.”

Explain that SQLite has different query translation, collation and SQL functions. Add tests against SQL Server for the failing behavior, keep SQLite only where its narrower evidence is useful, and ensure the test target uses representative server settings. Do not label SQLite results as provider-equivalent.

## Scenario: “Tests pass locally but fail only in parallel CI.”

Look for fixed IDs, shared mutable database rows, environment-variable leakage, fixture lifetime assumptions, resource contention and missing readiness. Add test/run identifiers to diagnostics. Confirm whether tests create isolated database/schema/data. Temporarily limiting parallelism can help diagnose a race, but the lasting fix should make resource ownership and isolation intentional.

## Scenario: “A partner API changes and multiple teams deploy independently.”

Use consumer contracts to make relied-upon interactions explicit, provider verification to check those contracts against provider builds, and versioned broker results to assess candidate compatibility. Add schema and semantic assertions for meanings contracts need to protect. Maintain selected sandbox or deployed tests for behaviors outside the contract boundary.

## Scenario: “A team adds retries until integration tests are green.”

Ask for first-attempt failure evidence and the repeat-safety of each operation. Determine whether retries hide state races, readiness defects or real intermittent failures. Prefer explicit readiness and isolated state. Keep bounded retries only for a deliberately tested transient-recovery behavior or a narrowly understood infrastructure condition.

# Tradeoffs and alternatives

| Approach | Strong evidence for | Main limitation |
| --- | --- | --- |
| In-process host + client | ASP.NET Core application pipeline | No real socket/TLS/proxy/deployment path |
| Production database engine | Provider semantics and SQL behavior tested | More startup/runtime cost; still not production topology/scale |
| SQLite in-memory | Relational behavior for portable cases | Not equivalent to production provider |
| EF Core InMemory | Narrow application cases accepting its fake semantics | Non-relational; no transaction/raw SQL/provider translation evidence |
| Handler stub | Deterministic outbound client branches | No HTTP server or transport behavior |
| Loopback HTTP server | Client/server HTTP exchange | Not actual remote provider/deployment |
| Consumer/provider contract | Selected independently deployed interactions | Only recorded contract; not whole system |
| Deployed environment test | Selected network/proxy/TLS/configuration path | Costly and sensitive to environment; still limited to exercised scenarios |

# Common weak answers

- “Integration tests test everything together.” They have a chosen boundary; name it.
- “TestServer is the same as production hosting.” It does not use a real network socket.
- “InMemory is just a faster database.” EF Core InMemory is non-relational and has important semantic differences.
- “Rollback guarantees cleanup.” Only enlisted work rolls back.
- “A Pact test proves the provider works.” Consumer-side tests commonly use a simulated provider; provider verification is a distinct step.
- “The container started, so the database is ready.” Readiness must reflect the operation the test needs.
- “Retries fixed the flake.” Retries may hide non-determinism or side effects; diagnose the first failure.
- “We log everything for debugging.” Artifacts can contain credentials and personal data; log selected, protected evidence.

# Self-check rubric

Score each item from 0 to 2: 0 = missing/incorrect, 1 = partly explained, 2 = clear and bounded.

- Names the behavior and test boundary before choosing tools.
- Distinguishes in-process application pipeline from real network/deployment behavior.
- Separates provider fidelity from database isolation.
- Explains EF Core InMemory and SQLite limitations accurately.
- Describes transaction participation, parallel safety and cleanup ownership.
- Separates consumer contract generation from provider verification.
- Chooses handler stubs and loopback servers for appropriate evidence.
- Defines readiness and bounded timeouts for CI dependencies.
- Collects actionable diagnostics while protecting sensitive data.
- Describes retries as a bounded, evidence-backed tool rather than a flake cure.

**Interpretation:** 17–20 means the design is interview-ready; 12–16 means revisit the database and boundary tradeoffs; below 12 means practice explaining which evidence each setup actually provides.

# Sources

- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)
- [EF Core testing strategy](https://learn.microsoft.com/en-us/ef/core/testing/choosing-a-testing-strategy)
- [Pact FAQ](https://docs.pact.io/faq)
- [PactNet](https://github.com/pact-foundation/pact-net)
- [Testcontainers wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)

