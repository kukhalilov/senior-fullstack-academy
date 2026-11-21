# test design flaky tests coverage limits and maintainability — Big-picture orientation and mental model

# Problem and purpose

A test suite is useful when it gives trustworthy evidence that important behavior still works after change. A large test count, high line-coverage number, or green build can create confidence without detecting realistic defects. At the same time, slow or flaky tests disrupt feedback and encourage developers to ignore failures. Senior test strategy balances defect detection, fast diagnosis, reliability, and maintenance cost.

This topic joins several ideas that are often discussed separately: what coverage measures, how mutation testing probes assertion strength, how property-based testing explores input spaces, how to diagnose nondeterminism, when snapshots help, and how to choose a layered test portfolio. They all ask the same question: what evidence should we trust, and what does it leave unproven?

# Plain-language mental model

Think of a test suite as a set of carefully designed alarms. Line coverage tells you which rooms the alarm system entered. Branch coverage tells you which doors it passed through. Mutation testing changes a few locks and checks whether the alarm notices. Property-based testing explores many possible events instead of checking only a handful you selected. A flaky alarm sometimes rings when nothing changed or fails to ring reliably. Snapshots preserve a reference image or output, but an opaque reference can make a real change hard to notice.

None of these is a single score for software quality. They are different instruments, each with its own blind spots. Combine evidence around user and business risks, then keep each test understandable enough that failures are actionable.

# How the parts fit together

```text
product risk and behavior
  ├─ known examples/boundaries ──> explicit example tests
  ├─ broad invariant/input space ─> property-based tests + shrinking
  ├─ code execution signal ───────> line/branch/method coverage
  ├─ assertion strength ──────────> mutation testing
  ├─ repeatability ───────────────> isolation, determinism, diagnosis
  ├─ complex serialized contract ─> focused snapshot/approval review
  └─ overall confidence ─────────> risk-based layer portfolio

failure signal
  └─ reproduce → localize → understand defect or test gap → focused fix
       └─ rerun relevant suite and record evidence, not merely retries
```

Coverage shows execution; mutation testing asks whether assertions distinguish behavior; property testing finds counterexamples to invariants; flakiness diagnosis protects trust in all the signals. Test-pyramid and trophy diagrams can help communicate a portfolio, but the right mix depends on system boundaries, speed, fidelity, and risk.

# Concept map

| Signal/tool | It can tell you | It cannot tell you by itself |
| --- | --- | --- |
| Line/statement/method coverage | Which measured code executed | Whether results were asserted meaningfully |
| Branch/condition coverage | Which measured alternatives evaluated | Whether the test would catch a wrong result |
| Mutation score | Whether selected source changes caused tests to fail | Whether all meaningful defects were modeled; whether survivors are equivalent |
| Property-based testing | Whether generated inputs violate a stated invariant | Whether the invariant fully describes product requirements |
| Retry/repeated run | Whether failure can recur or is intermittent | Why the test is nondeterministic or whether behavior is correct |
| Snapshot comparison | Whether serialized output differs from a baseline | Whether a difference is wrong or semantically important |
| Test pyramid/trophy | A conversation aid for suite layering | A mandatory numeric test ratio |

# End-to-end walkthrough

Suppose a discount calculator has many combinations of subtotal, customer status, coupon, and shipping region. A senior engineer might:

1. Write decision-table and boundary examples for named business rules.
2. State a general invariant, such as “a discount never makes the payable total negative,” and use a property-based generator to exercise a wide range of valid and invalid inputs.
3. Inspect line/branch coverage to find unexecuted logic, but avoid treating a target percentage as proof.
4. Run mutation testing on the high-risk calculation. If changing a comparison or removing a clamp leaves tests green, investigate whether the assertion is missing or the mutant is behaviorally equivalent.
5. If one case fails intermittently, reproduce with its random seed, remove shared state or timing dependence, and only use retries as evidence while fixing the root cause.
6. Keep a snapshot only if a stable serialization is itself an important contract and reviewers can understand the diff; otherwise use focused semantic assertions.
7. Select component/unit, integration, and a few end-to-end tests based on risk and diagnostic value, then watch feedback time and maintenance burden.

# When to use it and tradeoffs

Use coverage to locate gaps in execution, not to rank teams. Use mutation testing selectively where a missed regression would be costly; it can be computationally expensive and produces equivalent or irrelevant mutants. Use property-based testing for invariants, parsers, algorithms, and boundary-heavy behavior; retain named examples because they document specific requirements.

Treat flakiness as a defect in either the test or its environment. Repeated runs and retries help measure or reproduce it, but should not normalize unreliable results. Snapshots help with structured outputs that are cumbersome to assert field by field, but focused assertions are easier to review for critical behavior. Choose test layers based on what they can prove and how quickly they localize a failure.

# What later lessons cover

The concepts lesson gives a practical quality/evidence model. The coverage reference explains line, branch, collector, reporting and mutation terms. The property-based reference covers generators, invariants, shrinking and complementary example strategies. The flakiness reference covers randomness, concurrency, cancellation, retry and quarantine. The snapshots reference explains contracts and maintainability tradeoffs. The strategy reference compares suite layers and risk-based portfolio decisions. Practice and interview lessons apply the techniques.

# Sources

- [Microsoft .NET coverage tooling](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-code-coverage)
- [Stryker.NET mutation testing](https://stryker-mutator.io/docs/stryker-net/)
- [FsCheck quick start](https://fscheck.github.io/FsCheck/QuickStart.html)
- [Microsoft unit-testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)
