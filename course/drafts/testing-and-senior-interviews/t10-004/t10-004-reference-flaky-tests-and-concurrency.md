# test design flaky tests coverage limits and maintainability — Reference: Nondeterminism, parallel execution, timeout, retry, and quarantine decisions

# Scope and version

This lesson explains the supplied reliability terms and the named MSTest controls. MSTest 4.4 with Microsoft.Testing.Platform reports individual retry attempts and summarizes retried/flaky tests. `TestContext.CancellationToken` is available from MSTest 3.11; cooperative cancellation only works when test code observes the token. Sources checked 2026-11-17. [MSTest execution controls](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests-controlling-execution) [TestContext](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests-testcontext)

# How this group fits the mental model

A test result is valuable only when it is repeatable enough to trust. Nondeterminism enters through time, shared state, parallel execution, networks, resources, random generation, or execution order. Timeouts bound a wait; cancellation asks work to stop; retries rerun work. These controls must not be confused: a test that continues mutating state after its timeout can create failures in later tests.

# Supplied names explained

- `Flaky test` — A test that sometimes passes and sometimes fails without a relevant code change. It weakens confidence and often has a hidden state, timing, ordering, resource or external-dependency assumption.
- `Nondeterministic test` — A test whose inputs or outcome are not fully determined by its declared setup. Randomized testing can be valuable if the seed and environment are recorded; hidden randomness undermines reproduction.
- `Race condition in test` — A timing-dependent conflict where concurrent actions or observations occur in an unsafe order. The race may be in production code, the test harness, a shared resource, or a fixture lifecycle.
- `Shared test state` — Mutable state reused across cases, including static variables, database records, environment variables, browser accounts or mock setup. Give it one owner and reset/isolate it deliberately.
- `Time-dependent test` — A test affected by current time, elapsed time, clock precision or scheduling. Prefer an injected controllable clock or fixed time input; avoid waiting for a real calendar moment.
- `Timezone-dependent test` — A test whose outcome depends on machine timezone, daylight-saving transitions or local/UTC conversion. Specify the intended zone/offset and include transition boundaries where they matter.
- `Network-dependent test` — A test that relies on a real remote endpoint, DNS, credentials, quota, latency or service availability. Control the dependency for routine tests and retain separate contract/sandbox/environment checks for external behavior.
- `Resource contention` — Competing tests or processes consuming CPU, memory, ports, files, database connections or rate limits. A timeout may expose contention, but increasing it does not necessarily fix the underlying shared-resource problem.
- `Parallel test run` — Running independent tests simultaneously to reduce elapsed time. Parallelism is safe only when state and resources are isolated or deliberately coordinated.
- `Test timeout` — A maximum duration after which a test is reported as timed out. A timeout is a diagnostic bound, not proof that underlying work has stopped; cancellation and cleanup behavior must be considered.
- `Cooperative cancellation` — A cancellation design where asynchronous or long-running test work regularly observes a cancellation token and stops safely. In MSTest, cooperative timeout cancellation requires the test to check/pass the token; otherwise timed-out work can continue.
- `Retry attempt` — One additional execution after a failed/timed-out run. Preserve first-attempt result and diagnostic context; later passes do not erase evidence of intermittency.
- `Retry policy for tests` — A rule defining what failures may be retried, how many attempts occur, delay/backoff, and how results are reported. Keep it narrow, bounded, and safe for operations with side effects; avoid blanket retries as a build-stabilization strategy.
- `Flaky-test quarantine` — Temporarily excluding a known flaky test from blocking the primary signal while tracking its owner, issue, evidence and return date. Quarantine should remain visible and time-limited; otherwise it becomes permanent loss of coverage.
- `Flaky-test rate` — The proportion of test executions or tests showing inconsistent outcomes over a stated observation window. Define the denominator, rerun policy and time period; a low rate from few reruns has weak evidence.
- `Failure reproduction` — Re-running a failure with captured inputs, seed, order, environment, resource allocation and relevant logs. The goal is to understand the cause, not just to obtain one passing run.
- `Seeded randomized test` — A randomized test whose pseudo-random seed is recorded so the generated sequence can be replayed. It controls random choices only; it does not control wall time, network behavior or concurrency unless those are separately made deterministic.
- `Repeated test run` — Running the same test/suite multiple times to expose intermittent failures. Repetition estimates instability but does not by itself identify the root cause.
- `Order randomization` — Varying test execution order to reveal hidden dependencies on prior state or cleanup. Capture the order/seed so an observed failure can be reproduced.
- `Test isolation boundary` — The resources and state that a test owns or shares, including process, browser context, database/schema/rows, file system and remote services. State the boundary explicitly before enabling parallelism.
- `Test collection serialization` — Running tests in a group sequentially when they share an unsafe resource. It can prevent collisions, but should be paired with ownership/reset and considered against the alternative of per-test isolation.
- `TestContext.CancellationToken` — MSTest’s token signaled when a test times out or the run is aborted, available starting with MSTest 3.11. Pass it to supported async work and observe it regularly so operations can stop and cleanup can proceed.
- `MSTest [Retry]` — MSTest’s retry attribute for repeating a failed or timed-out test method, with configured attempts and optional delay/backoff. In MSTest 4.4 with MTP, retry attempts are reported and flaky/retried tests are identified; use this evidence to diagnose, not to hide.
- `MSTest [OSCondition]` — An MSTest condition attribute that runs a test only on specified operating-system conditions. Prefer it over an in-test OS branch when a test genuinely applies only to particular platforms, and keep the skipped-platform coverage visible.

# Cross-item comparison

**Timeout vs cancellation:** A timeout marks that a duration limit was exceeded. Cooperative cancellation communicates a request to stop; the work must observe it. Without cancellation, background work may continue and corrupt later tests.

**Retry vs reproduction:** A retry seeks another outcome; reproduction captures conditions to explain the failure. Retry attempts are useful evidence only when their details are retained. A reproducible failure leads to a fix; a passing retry alone does not.

**Serialization vs isolation:** Serializing a collection prevents simultaneous access inside that group but not necessarily access from another process or test suite. Per-test data/resources offer stronger independence and parallelism when practical. No within-group comparison applies to a single item.

# Examples

### A timed-out test that keeps running

An MSTest method starts asynchronous work, times out, and continues using a shared database while the next test begins. Use the MSTest cancellation token in the async operations and check it at safe points; ensure cleanup runs in `finally`/fixture teardown. If a dependency ignores cancellation, isolate its resource so lingering work cannot mutate another test’s state.

### Randomized failure in CI

Store the random seed, test name, order, framework/runner version, operating system, and relevant environment. Replay the same seed and order locally or in a controlled CI run. If the case is caused by generated data, retain the minimized example as a regression and keep randomized coverage.

### Temporary quarantine

If a high-value test is intermittently blocked by an external service, quarantine it only with an owner, tracked issue, known first-failure evidence, and review date. Continue running it in a non-blocking job if possible. Do not remove its signal from dashboards; otherwise the flake disappears from view without being fixed.

# Common mistakes

- Treating a retry pass as evidence that the first failure was irrelevant.
- Applying retries to non-idempotent tests that create duplicate data or external effects.
- Raising every timeout instead of diagnosing readiness, contention or hangs.
- Assuming timed-out work has stopped when the framework merely stopped waiting.
- Capturing a random seed but not the generator size, order or environment.
- Running parallel tests against fixed IDs or shared files and relying on luck.
- Serializing an entire suite indefinitely instead of isolating the small shared resource.
- Quarantining tests without owners or expiry dates.
- Skipping platform-specific tests without reporting which platform behavior remains untested.
- Computing flaky rate without stating the denominator or observation window.

# Knowledge checks with answers

1. **Does a timeout guarantee the work ended?** No. Use cooperative cancellation and safe cleanup; otherwise work can continue in the background.
2. **What does a retry that passes establish?** Only that a later attempt passed under its conditions; it does not explain the earlier failure.
3. **What must be captured for a randomized failure?** The seed and relevant generator settings plus order, environment and external conditions needed to replay it.
4. **When is collection serialization useful?** When a test group shares a resource that cannot safely be isolated; it is a coordination choice, not general test independence.
5. **What should every quarantine entry include?** An owner, reason/evidence, tracked fix, continued visibility and a review/removal date.

# Sources

- [MSTest execution controls](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests-controlling-execution)
- [MSTest TestContext](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests-testcontext)
- [MSTest tests and OS conditions](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests)
- [FsCheck seed replay](https://fscheck.github.io/FsCheck/TipsAndTricks.html)
