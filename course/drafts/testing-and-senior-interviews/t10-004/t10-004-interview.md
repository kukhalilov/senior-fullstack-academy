# test design flaky tests coverage limits and maintainability — Interview questions and reasoning

# Core questions

1. What does code coverage measure, and what does it miss?
2. How do branch and condition coverage differ from line coverage?
3. What does mutation testing add?
4. What might a surviving mutant mean?
5. How do you explain an equivalent mutant?
6. When is property-based testing useful, and how does shrinking help?
7. Why keep example-based tests when using generated properties?
8. How would you investigate a test that fails only in parallel CI?
9. What can retries establish, and what should they not be used for?
10. How do timeouts and cooperative cancellation differ?
11. When are snapshots appropriate?
12. Compare the test pyramid and test trophy.
13. How do you choose the right test layer for a risk?
14. What do you measure to assess suite maintainability and feedback?
15. How would you handle a flaky-test quarantine?

# Concise interview answers

1. Coverage measures which selected code executed; it does not establish that assertions checked meaningful outcomes.
2. Branch coverage measures control-flow alternatives; condition coverage measures individual boolean conditions. Both offer more detail than lines but still do not prove result assertions.
3. Mutation testing makes plausible code changes and checks whether tests detect them, probing assertion strength more directly than execution coverage.
4. A survivor can indicate a missing assertion, uncovered code, an equivalent change, unreachable behavior, or an irrelevant mutation. Investigate before adding tests.
5. An equivalent mutant has no observable behavioral difference in the relevant context, so no test can distinguish it under those constraints.
6. It is useful when a general invariant applies across a broad input domain. Shrinking reduces a failing generated input to a smaller counterexample that is easier to understand.
7. Examples document specific requirements, boundaries and known regressions. Properties broaden the search but may not communicate a particular business decision as clearly.
8. Capture the failing test/data/order/worker/environment; examine shared state, fixed identifiers, environment/time dependencies, resource contention and cleanup; then replay with isolation and randomized order.
9. Retries show that outcomes differ across attempts and can preserve diagnostic evidence. They should not hide root causes or convert unreliable behavior into an assumed pass.
10. A timeout bounds how long the runner waits. Cooperative cancellation signals work to stop, but the test must observe and pass the token; otherwise the timed-out work may continue.
11. When the structured/serialized output itself is a contract and the diff is understandable. Use focused assertions for critical semantics and review baseline changes intentionally.
12. The pyramid emphasizes many fast unit tests, fewer integration tests, and few end-to-end tests; the trophy emphasizes integration tests as a valuable layer. Neither mandates a universal ratio.
13. Name the risk, then choose the least expensive layer that faithfully exercises it. Add a more realistic layer when provider, framework, network or user-journey behavior is part of the claim.
14. Measure focused/full feedback latency, flake rate with a clear denominator/window, maintenance effort, diagnostic clarity, runtime, environment cost and escaped defects. No one metric is sufficient.
15. Quarantine only with a reason, owner, tracked issue, continuing visibility and review/removal date; keep a non-blocking run when possible and use evidence to fix the root cause.

# Deep follow-up answers

## “Why not make 100% coverage mandatory?”

A threshold can be a useful regression guardrail, but it can reward trivial tests, distortions from exclusions, or assertions that do not matter. Coverage also has measurement limitations around generated code and instrumentation. I would require a sensible floor for important code, review uncovered high-risk paths, and use behavior assertions and targeted mutation analysis to assess whether tests can detect plausible defects.

## “How do you use a mutation score?”

I treat the score as a diagnostic for the selected code and mutation operators. I inspect survivors, timeouts, no-coverage results, and equivalent mutants, then decide whether a behavior assertion is missing. I use mutation testing selectively because it costs more than ordinary tests. A high score does not prove all important defects were modeled.

## “How do you make property tests reproducible?”

Use generators with explicit domains and meaningful distributions, capture the seed and size/configuration on failure, and avoid mutable state that carries from one evaluation to the next. Replay the failure, inspect the shrunk counterexample, then add a named regression when it captures a durable contract. Seed control does not eliminate network, clock or concurrency nondeterminism.

## “Would you retry an intermittent production bug?”

I would preserve the first failure, investigate whether the operation is idempotent, and distinguish transient infrastructure recovery from a test defect. Retries may be part of a test whose purpose is recovery behavior, or a bounded temporary diagnostic mechanism. I would not let blanket retries hide a real intermittent product failure.

## “How do you balance test speed and realism?”

Use fast tests for broad business-rule input coverage, integration tests where framework/provider collaboration matters, contracts for independent services, and a small set of end-to-end journeys for critical user outcomes. Track feedback time and failure localization. If a test double does not preserve the behavior under risk, speed is not a sufficient reason to use it.

# Scenario questions

## Scenario: “The team reports 99% coverage and escaped a serious bug.”

Ask whether the relevant line/branch was executed, what assertions checked, whether the test used the real boundary, and whether a realistic mutation would have survived. Add a focused regression that asserts the expected behavior and inspect high-risk paths, rather than simply raising the threshold.

## Scenario: “A property-based test finds one failure in CI.”

Capture the seed, generator size, test configuration, environment and input. Replay and inspect the shrunk counterexample. Determine whether the property or generator is correct; if it is a real behavior defect, fix it and preserve the minimized case as an example regression.

## Scenario: “The team quarantined 40 flaky tests.”

Treat the count as an urgent loss of signal. Categorize failures by shared cause, assign owners and tracked issues, expose quarantine in reports, and set a removal deadline. Restore the highest-risk tests first and add isolation/readiness improvements. Avoid treating quarantine as permanent cleanup.

## Scenario: “The CI suite is 45 minutes, so we delete integration tests.”

Measure which test stages are slow and why. Parallelize independent tests, isolate shared data, reduce repeated setup, and split fast feedback from fuller validation. Retain tests that prove production-provider or contract behavior; reduce redundant E2E cases before removing unique evidence.

# Tradeoffs and alternatives

| Signal/technique | Useful for | Main limitation |
| --- | --- | --- |
| Line/branch coverage | Finding unexecuted code/paths | Does not show assertion strength |
| Mutation testing | Probing detection of selected source changes | Slow; equivalent/unreachable mutants need judgment |
| Property-based tests | Broad invariant exploration and edge discovery | Depends on correct property and generator domain |
| Example-based tests | Named requirements and regressions | Can miss unanticipated input combinations |
| Retry/repeated run | Estimating/interrogating intermittent behavior | Does not explain the cause |
| Snapshot | Stable structured-output contracts | Large diffs can obscure semantics |
| Pyramid/trophy | Discussing layer balance | No universal test ratio |
| Quarantine | Temporary containment of a noisy test | Removes blocking signal until the test is repaired |

# Common weak answers

- “100% coverage means the tests are complete.” It only describes selected execution.
- “Every mutant survivor needs a new test.” Some are equivalent or irrelevant.
- “Property-based testing replaces manual cases.” Properties complement named requirements and regressions.
- “Retrying fixes flakes.” It may hide the problem or real intermittent behavior.
- “A seed makes the whole environment reproducible.” It controls pseudo-random generation, not other external state.
- “We follow a 70/20/10 pyramid.” Ratios are heuristics, not universal laws.
- “We snapshot the whole output so we do not need assertions.” Reviewers may miss important changes in opaque output.
- “Just increase the timeout.” First establish whether timed-out work cancels and whether the test waits on the right condition.
- “Quarantine removes CI noise.” It also removes test signal and needs active ownership.

# Self-check rubric

Score each item from 0 to 2: 0 = missing/incorrect, 1 = partly explained, 2 = clear and bounded.

- Distinguishes execution coverage from defect detection.
- Explains branch/condition evidence and its limits.
- Interprets mutation survivors, timeouts and equivalent mutants carefully.
- States useful properties and domain assumptions.
- Explains shrinking and seed replay.
- Diagnoses flakiness through state, time, concurrency, network and environment.
- Differentiates timeout, cancellation and retry.
- Makes snapshot use reviewable and limited to a real contract.
- Selects test layers from risk and environment fidelity.
- Measures feedback, maintenance and signal quality without relying on one score.

**Interpretation:** 17–20 means the strategy is interview-ready; 12–16 means revisit evidence and nondeterminism; below 12 means practice explaining what each test signal can and cannot establish.

# Sources

- [Microsoft coverage guidance](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-code-coverage)
- [Stryker.NET FAQ](https://stryker-mutator.io/docs/General/faq/)
- [FsCheck quick start](https://fscheck.github.io/FsCheck/QuickStart.html)
- [MSTest execution controls](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests-controlling-execution)
- [Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)
