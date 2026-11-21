# integration testing databases webapplicationfactory and contracts — Reference: Test execution reliability, environment control, and actionable failures

# Scope and version

This reference covers the supplied fixture, readiness, configuration, diagnostics and CI reliability items. Test-framework lifecycle APIs vary; this lesson names only the provided xUnit-oriented items and describes the responsibilities they represent. The ASP.NET Core integration-test guide demonstrates class fixtures; Testcontainers documents configurable readiness checks. [Integration-testing guide](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0) [Testcontainers wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)

# How this group fits the mental model

A reliable integration test is a small operational system: it creates or acquires resources, waits until they are usable, runs a bounded assertion, emits useful evidence on failure, and releases what it owns. Most flakes come from shared mutable state, a readiness race, hidden environmental assumptions, timing, or incomplete cleanup—not from randomness in the assertion itself.

# Supplied names explained

- `Integration test collection` — A group of related integration tests that can share setup or execution rules. Sharing reduces cost, but mutable shared state must be reset or tests serialized; a collection label alone does not guarantee isolation.
- `IClassFixture<WebApplicationFactory<TEntryPoint>>` — An xUnit fixture pattern that shares a `WebApplicationFactory<TEntryPoint>` instance across tests in one test class. It can avoid repeated host startup. Do not put per-test mutable state into the shared factory without resetting it.
- `IAsyncLifetime` — An xUnit lifecycle interface for asynchronous test or fixture initialization and cleanup. Use it for asynchronous resource setup/disposal and ensure partial setup failures still release resources already acquired.
- `Test fixture disposal` — Releasing hosts, clients, database connections, containers and temporary files that the fixture owns. Cleanup should be deterministic, safe after partial initialization, and run even when an assertion fails.
- `Test parallelization limit` — A bound on how many integration tests can execute concurrently. Limit parallelism when they share a scarce server, database, port or mutable resource; do not use serialization as a substitute for isolated data when the suite can be safely isolated.
- `External dependency readiness probe` — A check that a dependency is ready for the operation under test, such as a database accepting a query or an HTTP endpoint returning an expected health response. A process being alive is weaker than the needed behavior being available.
- `Container health check` — A readiness/liveness signal reported by a container image/runtime. It is useful when correctly defined, but may not express application-specific readiness such as schema initialization or seeded state.
- `Startup timeout` — A finite bound for host, database or container startup. Choose it to detect hangs while leaving realistic CI headroom; include the failed readiness condition in the error output.
- `HTTP request timeout` — A finite bound for an individual request or test operation. Timeouts keep a hung dependency from consuming an entire CI job. Make the timeout long enough for the tested operation and distinguish it from a test-run cancellation limit.
- `Request and response logging` — Capturing selected HTTP details to diagnose an integration failure. Redact authorization values, cookies, credentials, personal data and sensitive bodies; log only what is useful to reproduce the failure.
- `Test output capture` — Attaching per-test diagnostic messages to the test result. Include correlation IDs and selected setup decisions, but avoid verbose output on success that obscures the failure signal.
- `Failed container log capture` — Preserving relevant logs from a test-owned container when setup or assertions fail. Capture before removing the container, bound the output, and apply artifact access/retention controls.
- `Environment variable override` — Providing a test-specific environment value that controls startup/configuration. Restore or isolate process-wide environment changes because they can leak between parallel tests.
- `Configuration override` — Replacing or adding settings for the test host. Keep overrides explicit and narrow so accidental test-only behavior does not make production composition appear covered.
- `Clock and timezone control` — Making time-zone and current-time assumptions deterministic for a test. Prefer an injected clock seam or fixed input where the application supports it; avoid sleeps and machine-local timezone dependence.
- `Network dependency isolation` — Preventing tests from contacting unintended external systems or interfering with each other. Route outbound calls through controlled boundaries, allocate unique local ports where relevant, and make unexpected outbound access fail visibly.
- `Retrying an integration test` — Repeating a failed test under a defined policy. A retry can mask nondeterminism or a real intermittent fault; if used to assess transient recovery, capture first-attempt evidence and keep attempts bounded.
- `Flaky integration test` — A test whose result changes without a relevant code change, commonly due to races, uncontrolled state, timing, environment, network or resource pressure. Record the failure context and fix the cause instead of normalizing reruns.
- `CI service container` — A database or other dependency started for the continuous integration job. Pin a suitable image, configure credentials safely, wait for actual readiness, and make the service reachable from the test job’s network.
- `Test artifact retention` — The period and access scope for logs, reports, dumps or other outputs from a test run. Retain enough to diagnose failure while minimizing sensitive-data exposure and storage waste.

# Cross-item comparison

**Fixture sharing vs isolation:** A class fixture shares expensive immutable host setup. Per-test data should remain isolated even when the host is shared. Collections may serialize shared resources, but this trades throughput for safety and can hide missing isolation.

**Liveness vs readiness:** A process/container can be running while its database is still initializing or the app is still loading schema. A health check or readiness probe should test the capability the test requires. Testcontainers’ default “container is running” condition is insufficient for many images; its wait strategies can check ports, logs, HTTP responses or health state. [Testcontainers wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)

**Timeout vs retry:** A timeout bounds one wait/request. A retry repeats an operation. Retrying without understanding whether the operation is safe to repeat can duplicate side effects and hide a bug. No within-group comparison applies to a single item.

# Examples

### Container-backed database fixture

At suite setup, start a database container, wait for a database-level readiness condition, apply schema, then create an isolated database or test-owned data. If startup fails, include the wait condition and container logs. After the suite, remove the resources in fixture disposal. If tests share the database, give each test unique data or reset it before the next case; shared fixtures are not shared mutable test data.

### A useful failure record

For a failed HTTP integration test, retain the test name, request method/path, non-sensitive correlation identifier, response status, selected response headers, startup/readiness result, and relevant service logs. Redact authorization and cookies. Avoid collecting full memory dumps or database snapshots by default because they can contain application data and secrets.

### Diagnosing a flaky timeout

First determine where time was spent: dependency startup, readiness wait, request execution, or cleanup. Then check whether the timeout is too small for CI, the dependency is actually ready, tests contend for a shared resource, or a remote dependency is uncontrolled. Increasing all timeouts or retrying every failure can make feedback slower while leaving the cause intact.

# Common mistakes

- Sharing a host fixture and assuming tests therefore share no state.
- Setting process-wide environment variables from parallel tests without restoring them.
- Treating container liveness or an open mapped port as application readiness.
- Using unbounded waits that hang a job indefinitely.
- Retrying all failures without recording the first attempt or checking operation idempotency.
- Capturing complete request bodies, container logs or dumps without redaction/access controls.
- Disposing shared resources from each test rather than from their owner fixture.
- Making one shared database safe by serializing everything when per-test isolation would be both simpler and faster.
- Removing a failed container before collecting the logs needed to diagnose startup.

# Knowledge checks with answers

1. **What state is appropriate in a class fixture?** Expensive, reusable setup that is immutable or safely reset; not unowned mutable state shared across tests.
2. **What should a readiness probe check?** That the dependency can perform the operation needed by the test, not merely that its process is running.
3. **Why are blind retries harmful?** They can mask races or defects, add time, and repeat side effects; retain first-attempt evidence and diagnose the cause.
4. **What should happen to a test environment variable override?** It should be isolated to the test host or restored so it cannot leak to other tests.
5. **Why restrict test artifact retention?** Logs, bodies, dumps and database snapshots may include credentials, personal data or other sensitive application state.

# Sources

- [ASP.NET Core integration tests](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests?view=aspnetcore-10.0)
- [Testcontainers wait strategies](https://dotnet.testcontainers.org/api/wait_strategies/)
- [Testcontainers for .NET](https://dotnet.testcontainers.org/)
- [xUnit shared context](https://xunit.net/docs/shared-context)
