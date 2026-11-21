# test design flaky tests coverage limits and maintainability — Core concepts and how they fit together

# Learning objectives

After this lesson, you should be able to interpret coverage without overclaiming, use mutation testing to investigate assertion strength, state useful properties and generate edge cases, diagnose flaky tests systematically, choose when snapshots help, and design a risk-based layered test suite.

# Prerequisites

You should understand unit and integration tests, assertions, conditional branches, test fixtures, and basic C#/.NET testing. A property is a general rule that should hold for a set of generated values. A mutant is a deliberately altered version of code used to see whether tests detect the change. A flaky test produces inconsistent outcomes without a relevant code change.

# Core concepts

## Coverage is execution evidence

Line or statement coverage reports which code locations were executed during a test run. Method coverage reports which methods ran. Branch coverage reports which control-flow alternatives ran; condition coverage focuses on individual boolean subexpressions. These measures can uncover code that no test reaches.

But a test can execute a line and make no meaningful assertion. A branch can run with the wrong result and still count as covered. Coverage therefore answers “what code ran?” rather than “would the tests detect a defect?” Exclusions and generated code also affect the denominator, so a dashboard number only makes sense when collection scope and filtering are understood.

Treat a coverage threshold as a guardrail against an accidental collapse in measurement, not a certificate. A team may raise the threshold gradually or set different expectations for high-risk code, but each target is a policy choice, not a theorem about correctness.

## Mutation testing probes test sensitivity

Mutation testing makes small, plausible changes—such as reversing a comparison, changing a boundary, or removing a return value—and runs tests against each changed version. A mutant is killed when tests fail because of that change. It survives when tests do not distinguish the altered behavior. A tool may also report no coverage or execution errors.

Survivors are investigation leads. A missing assertion is one explanation; an equivalent mutant (same observable behavior in the relevant context), unreachable code, or a weak mutation operator may be another. Do not add tests mechanically until the behavior affected by a mutant is understood. Mutation runs can be expensive, so apply them to risk-heavy modules or changed code rather than assuming every commit needs a full suite.

## Property-based and example-based tests complement each other

An example test records a known input and expected outcome. It is excellent for a specific requirement and makes failures easy to explain. A property-based test states an invariant over a domain and lets a generator produce many inputs. When a failure occurs, a shrinker searches for a smaller counterexample that still violates the property.

Good properties are meaningful and correctly scoped. “Sorting twice returns the same list as sorting once” is an idempotence-like relation; it does not prove the sort is ordered unless that property is also asserted. Generators should produce valid values often enough to exercise relevant behavior, while separate generators can target invalid or boundary cases. Keep explicit examples for known business decisions, exact regressions, and edge cases that deserve names.

Randomness is repeatable when the seed and configuration are recorded. A seed replay makes a discovered failure reproducible. If a property mutates generated state, shrinking may rerun it; rebuild/reset the state for each evaluation so a previous run cannot influence the next. [FsCheck test data](https://fscheck.github.io/FsCheck/TestData.html) [FsCheck quick start](https://fscheck.github.io/FsCheck/QuickStart.html)

## Flakiness undermines test signal

Common causes include shared mutable data, parallel resource collisions, race conditions, wall-clock assumptions, time-zone differences, fixed waits, external network behavior, resource contention, and nondeterministic ordering. A retry can show that the failure was intermittent and may preserve useful evidence. It does not identify or fix the cause; it may also hide a real intermittent product failure.

Diagnose by recording the first failing attempt and the execution context, then repeat under controlled conditions. Ask which shared state or environmental dependency changed, whether the test can run alone, whether parallelism matters, and whether a seed or order can be replayed. Quarantine may protect the main signal temporarily, but must have an owner, reason, and removal plan so it does not become a permanent blind spot.

## Snapshots and assertions

A snapshot test stores a representation and compares future output against it. It is useful when the output as a whole is the contract—such as a generated document or serialized response—and a reviewer can understand the diff. An approval test is a workflow for reviewing and accepting a changed output; a golden master similarly preserves known output for comparison.

Large snapshots can be opaque. A file with hundreds of incidental fields may change for formatting or ordering without a meaningful behavior change. Use focused assertions for critical semantics, normalize only irrelevant nondeterminism, and scrutinize every approved baseline change. Avoid over-mocking: tests that replace every collaborator may verify a mock choreography rather than the system behavior.

## A layered portfolio is a risk decision

Unit, integration, component, contract, smoke, acceptance, exploratory and end-to-end tests each provide different fidelity and localization. The test pyramid usually suggests many fast tests, fewer broad integration tests, and a smaller set of critical end-to-end flows. The test trophy is another metaphor that emphasizes integration. Neither is a required ratio.

Choose the layer that can prove the behavior with reasonable speed and diagnosis. Critical journeys need realistic coverage; complex business rules need many fast cases; provider semantics need the real provider; contracts protect independent service boundaries. Review whether the suite’s feedback latency, maintenance cost and signal-to-noise ratio support delivery rather than slowing it.

# Mechanisms and relationships

When reviewing a weak test signal:

1. Start from a behavior or risk, not a target percentage.
2. Check whether any test executes the relevant path and condition.
3. Ask whether an assertion would fail for a plausible wrong result.
4. Use a mutation to probe that assertion when the added cost is justified.
5. Broaden input exploration with a property only when a valid invariant can be stated.
6. Preserve named examples for requirements and counterexamples discovered by generation.
7. Check repeatability, isolation and cleanup before trusting a failure or pass.
8. Select the most informative test layer and keep snapshots focused and reviewable.

# Worked examples

### Coverage without an assertion

A test calls a tax calculation method and records 100% line coverage but discards the returned amount. All lines ran, yet a mutation that changes the rate might survive. Add an assertion for the expected amount and a boundary case. Then use a mutation run to see whether the test suite catches a plausible rate/boundary change.

### A useful invariant

For a collection normalization function, one property could state that normalizing an already normalized result does not change it. A separate property could assert all output items meet the normalization rule. An example test still records a specific known bug fix. The generator should include empty, small, repeated, and boundary-length inputs; a shrinker should reduce a failure to a minimal list/string when possible.

### A flake with a stable first failure

A parallel test occasionally sees a record created by another test. Log the test ID, data key and worker; then run with randomized order and a recorded seed. If unique keys make the failure disappear, the cause was shared data. A retry could have hidden the collision but would not make the database ownership correct.

# Misconceptions and edge cases

- **“100% coverage means correct.”** It means the selected measured elements executed, not that outputs were asserted or every defect modeled.
- **“A surviving mutant always means a missing test.”** It may be equivalent, unreachable, or unrepresentative; investigate first.
- **“Property-based testing replaces examples.”** It explores a broad rule; named examples document exact requirements and regressions.
- **“A fixed seed makes all tests deterministic.”** External state, time, concurrency and environment can remain nondeterministic.
- **“Retries make flakes harmless.”** They can hide both test defects and real intermittent failures.
- **“Snapshots are objective.”** The baseline encodes a reviewed expectation; automatic approval can bless a regression.
- **“Pyramid means a universal percentage.”** It is a planning heuristic, not a measurable law.
- **“More mocks make tests more isolated.”** Over-mocking can remove the integration behavior the test claims to cover.

# Knowledge checks with answers

1. **What does line coverage establish?** That measured lines executed; it does not establish that assertions detect wrong results.
2. **What is a mutant survivor?** A source alteration that the current test run did not detect; it requires investigation.
3. **Why shrink a property-based failure?** A smaller counterexample is easier to understand and can expose the essential condition.
4. **What does a retry tell you?** It may show intermittency and provide evidence, but it does not explain the cause.
5. **When is a snapshot a good contract?** When the serialized/rendered output itself matters and its diff is small and understandable to reviewers.

# Sources

- [Microsoft coverage tooling](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-code-coverage)
- [MTP coverage](https://learn.microsoft.com/en-us/dotnet/core/testing/microsoft-testing-platform-code-coverage)
- [Stryker.NET FAQ](https://stryker-mutator.io/docs/General/faq/)
- [Equivalent mutants](https://stryker-mutator.io/docs/mutation-testing-elements/equivalent-mutants/)
- [FsCheck test data](https://fscheck.github.io/FsCheck/TestData.html)
- [Microsoft testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)
