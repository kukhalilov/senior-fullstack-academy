# unit tests assertions fixtures mocks stubs fakes and isolation — Interview questions and reasoning

# Core questions

1. **What makes a unit test useful?**
2. **How do you choose a unit boundary?**
3. **What are Arrange-Act-Assert and Given-When-Then?**
4. **How do you choose positive, negative, and boundary cases?**
5. **When do you use a state assertion versus an interaction assertion?**
6. **What is the difference between a stub, mock, fake, spy, and dummy?**
7. **What is a test seam, and when would you add one?**
8. **How do fixtures affect isolation and parallelism?**
9. **How do you test time-dependent behavior?**
10. **How do you make randomized tests reproducible?**
11. **What does a hermetic test mean?**
12. **When is a strict mock useful, and what are its risks?**
13. **How do test framework and test platform differ in .NET?**
14. **How do xUnit.net v3, MSTest, NUnit, and TUnit compare at a high level?**
15. **What should you do when tests fail only in parallel or in a full-suite run?**

# Concise interview answers

1. It checks a meaningful behavior through an observable contract, runs quickly and deterministically, and produces a diagnostic failure.
2. Choose a small design boundary that can be exercised without starting real external infrastructure. A unit is not necessarily one method or class.
3. They are readable arrangements for context/setup, action, and expected result; neither is a framework requirement.
4. Partition inputs by behavior, then test representative values, especially just below/at/above boundaries and invalid inputs.
5. Prefer state/result assertions. Verify calls when the interaction or absence of a side effect is itself required behavior.
6. Stub supplies answers; mock verifies expectations; fake is a simplified working implementation; spy records calls; dummy fills an unused parameter.
7. A seam lets the test control or observe a volatile/external collaborator. Use dependency injection, a clock abstraction, delegate, adapter, or other boundary where it improves behavior verification.
8. Per-test fixtures maximize isolation; shared immutable fixtures can reduce expensive setup. Shared mutable fixtures risk ordering, races, and parallel coupling.
9. Inject a clock/time provider and set a fixed instant; avoid sleeps and wall-clock races.
10. Use a seeded generator, log the seed and exact input on failure, and replay the failing case as a regression test.
11. The outcome depends on controlled inputs, not network, environment, current time, locale, or other tests.
12. Strict mocks fail on unconfigured calls and can catch dangerous unexpected interactions, but can over-specify implementation and break on harmless refactoring.
13. A framework defines test attributes/assertions and discovery conventions; a platform runs tests and integrates tooling. VSTest and Microsoft.Testing.Platform are platform choices.
14. They offer analogous capabilities but differ in syntax, lifecycle, package/runner integration, and platform support. Select based on team and toolchain needs, not attribute-name similarity alone.
15. Look for leaked shared state, global time/culture, ports/files, non-isolated databases, and incomplete cleanup; fix the collision instead of immediately disabling all parallelism.

# Deep follow-up answers

## How do you decide whether to mock a dependency?

First decide what the behavior under test needs to control or observe. If the collaborator returns data, a stub can supply the condition. If a required side effect must occur once, a mock/spy can verify it. If meaningful stateful interactions matter, a fake may be clearer. If the dependency’s real semantics are the point—database transaction, HTTP serialization, file locking—write an integration test. Avoid mocking every dependency because the test can pass while both the SUT and its mocks share a false assumption.

## What is the main difference between state and interaction testing?

State testing checks externally visible output or resulting state; interaction testing checks communication with collaborators. State tests typically tolerate internal refactoring. Interaction tests are necessary when an effect itself is contractual or safety-critical, such as “do not charge twice,” but should avoid incidental method order/count.

## How do you structure expensive fixtures?

Keep unit tests free of real network/database startup. In integration tests, measure setup cost, isolate mutable data per test, reuse immutable service containers where safe, and define cleanup even after failure. Avoid one shared mutable schema or database with order-dependent rows. Parallelism should be an intentional property, not disabled globally because fixture ownership is unclear.

## How do you investigate a test that passes alone but fails in the suite?

Run with randomized order/parallelism and inspect static fields, environment variables, culture, time zone, current directory, shared files/ports/databases, background tasks, and non-awaited async work. Ensure cleanup runs and fixture lifetime matches resource ownership. Capture random seeds and add test output that identifies inputs. Then add a regression case that reproduces the coupling.

## What is the difference between MTP and VSTest?

Both are .NET test execution platforms; frameworks such as MSTest, NUnit, xUnit.net, or TUnit provide the authoring model. MTP supports executable-first and some modern deployment scenarios; VSTest has long-established broad integrations, including mixed-language adapters. Current Microsoft guidance says not to mix MTP- and VSTest-based .NET test projects in one solution/run configuration. TUnit is built on MTP and does not support VSTest. [Microsoft platform overview](https://learn.microsoft.com/en-us/dotnet/core/testing/test-platforms-overview)

# Scenario questions

## Scenario: a test verifies a repository was called three times

Ask whether three calls are part of the contract or merely current implementation. If behavior is correct for one batched call or a cached result, the count assertion is brittle. Assert the returned state; keep the call-count check only if duplicate calls cause a real contract violation or performance/safety issue.

## Scenario: a test fails only after midnight

Replace ambient wall-clock reads with an injected clock and explicit timestamps. Test just before, at, and after the boundary, define timezone and inclusive/exclusive rules, and avoid waiting for real time.

## Scenario: the suite is flaky after enabling parallel execution

Look for shared mutable fixture state, global variables, fixed ports/files, shared data, and tests that do not await background work. Give tests isolated resource names or per-test instances, clean up deterministically, and retain serialization only for unavoidable shared resources.

## Scenario: a mock passes but production fails against the database

The mock validates how the SUT responds to a configured interface result, not provider SQL, transactions, mapping, or isolation. Add an integration test with the real provider or a representative test database for those semantics; keep unit tests for fast policy behavior.

# Tradeoffs and alternatives

Mocks provide precise response and interaction control but are easy to overuse. Fakes exercise richer state behavior with less call-specification brittleness, but their simplified semantics can diverge. Per-test fixtures isolate best but cost setup time; shared immutable fixtures save time safely more often than shared mutable ones. xUnit, MSTest, NUnit, and TUnit can all express common test intent, but runner/platform and lifecycle details should be evaluated separately.

# Common weak answers

- “A unit test tests one method.” It ignores behavior boundaries and collaborator graphs.
- “Mock every dependency.” It can test implementation choreography rather than behavior.
- “One assert per test.” One coherent behavior matters more than a count rule.
- “Just disable parallel tests.” That can hide shared-state defects and increase runtime.
- “Use sleeps for time tests.” They introduce flakiness instead of controlling time.
- “A mock proves the database works.” It does not execute the database provider.
- “`Received()` verifies exactly one call.” In NSubstitute it verifies at least one; use an explicit count for exactly once.
- “MTP and VSTest are frameworks.” They are execution platforms.
- “TUnit runs on VSTest.” TUnit is MTP-based and does not support VSTest.

# Self-check rubric

Score 0 (cannot explain), 1 (partial), or 2 (clear with tradeoffs):

- I define a behavior boundary and observable contract.
- I choose input partitions and boundary cases deliberately.
- I can explain when state versus interaction assertions are justified.
- I choose stubs, mocks, fakes, spies, and dummies by purpose.
- I design fixtures for independent order and parallel execution.
- I control time, randomness, cleanup, and external dependencies.
- I distinguish framework from test platform and know the current TUnit/MTP boundary.
- I can explain when a real integration test is required.

A score below 12 suggests revisiting the concepts and framework references; 12–14 indicates solid design reasoning; 15–16 is strong interview readiness, with package/platform specifics checked against the current project.

# Sources

[Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices) · [Microsoft test platforms](https://learn.microsoft.com/en-us/dotnet/core/testing/test-platforms-overview) · [xUnit v3](https://xunit.net/docs/getting-started/v3/getting-started) · [NUnit attributes](https://docs.nunit.org/articles/nunit/writing-tests/attributes.html) · [TUnit attributes](https://tunit.dev/docs/comparison/attributes/) · [NSubstitute received calls](https://nsubstitute.github.io/help/received-calls/)
