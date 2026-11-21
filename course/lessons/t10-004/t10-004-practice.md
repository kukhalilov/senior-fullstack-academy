# test design flaky tests coverage limits and maintainability — Exercises and worked solutions

# Goals

Practice evaluating coverage and mutation evidence, writing meaningful properties, diagnosing nondeterminism, choosing snapshot boundaries, and building a layered test plan from risk rather than a diagram’s ratio.

# Worked example

A tax calculator has 88% line coverage. A recent defect charged a tax rate at the wrong threshold. The team runs Stryker.NET and sees a surviving mutant where `<` changes to `<=` at that boundary. A property-based test already generates many random subtotals, but the threshold is rarely generated exactly. The suite also has a snapshot of the entire invoice object.

Investigation:

1. Identify the behavioral boundary: the threshold comparison changes whether a particular tax rate applies.
2. Add a focused example at the exact boundary and immediately on either side. This communicates the requirement more clearly than relying on random chance.
3. Adjust the generator to include or bias toward the threshold if a general property covers neighboring values. Preserve a recorded seed when a generated case finds a failure.
4. Review the mutation. If it is behaviorally relevant, the focused assertion should kill it. If constraints make the two forms equivalent in this application, document why.
5. Replace or supplement the broad invoice snapshot with focused assertions for tax rate, subtotal, tax amount, and total. Keep a snapshot only if the complete serialized invoice is itself a reviewed contract.
6. Keep the coverage report as an execution map, not a pass/fail claim about correctness.

# Exercises

## Exercise 1: Interpret the dashboard

A module has 100% line coverage, 70% branch coverage, and a 92% mutation score. The report excludes generated code and a tax calculator’s boundary tests do not assert totals. Explain what each metric establishes, identify at least two investigations, and say why no one percentage proves the module correct.

## Exercise 2: Improve a property

A team writes the property “sorting a list returns a list.” Propose at least three stronger properties for a deterministic sort. Include preconditions/domain handling and identify two explicit examples you would retain.

## Exercise 3: Investigate a surviving mutant

A mutant changes a range check at its inclusive maximum and survives. Give an investigation sequence that distinguishes a missing test from an equivalent or unreachable mutant. What focused cases would you add if the boundary matters?

## Exercise 4: Diagnose a flaky test

A test passes alone but fails in a full parallel suite. It uses the current date, a shared database ID, and a one-second sleep before reading a background result. Propose a root-cause investigation and changes. Explain what a retry tells you and what it does not.

## Exercise 5: Handle a timeout safely

An MSTest test times out while a request continues mutating shared state. Explain why increasing the timeout may be insufficient and how `TestContext.CancellationToken` and cooperative cancellation should be used. Name the minimum version boundary supplied by the source snapshot.

## Exercise 6: Keep or replace a snapshot?

A 900-line snapshot covers an API response. A one-field change creates a huge diff, and reviewers often approve it without reading. Suggest a better assertion/snapshot split and a baseline update process.

## Exercise 7: Choose the portfolio

A team has thousands of unit tests, a few fragile end-to-end tests, no database-provider tests, and one CI suite taking 45 minutes. Checkout and account security are critical. Propose a risk-based layer plan and identify where you would measure feedback latency.

# Progressive hints

1. Separate execution, path choice, and ability to detect a changed behavior. Check exclusions and assertions.
2. A sort should have order, permutation/multiplicity preservation, and idempotence properties, subject to the sort’s declared ordering semantics.
3. Run or inspect the mutant against exact boundary cases; check reachability and application constraints.
4. Replace wall-clock dependence, fixed IDs, and fixed sleep with controlled inputs, unique data, and condition-based waiting.
5. A timeout may stop observing a task without stopping it. Cancellation is cooperative and must be passed/observed.
6. Assert high-value fields explicitly; retain a smaller snapshot for stable structured content if it adds review value.
7. Keep fast broad unit cases, add production-engine integration coverage, contracts for independently deployed boundaries, and a few stable browser journeys for the critical paths.

# Complete solutions

## Exercise 1 solution

Line coverage says every measured line executed; 70% branch coverage says some measured alternatives were not exercised; 92% mutation score says most score-counted mutations were detected under the tool’s mutation set and configuration. None proves that the tests assert important results. Investigate uncovered branches in risk-sensitive logic and the surviving mutants, especially the tax threshold. Inspect exclusions and ensure the report includes all intended assemblies. Add exact boundary assertions for subtotal/rate/total; do not chase the remaining percentage without identifying a behavior gap.

## Exercise 2 solution

Useful properties include:

1. Output is ordered according to the declared comparator.
2. Output contains exactly the same elements with the same multiplicities as input (permutation preservation).
3. Sorting an already sorted output yields an equivalent output (idempotence).
4. Sorting an empty list and a single-element list preserves them.

The domain must define null handling, comparer semantics, and whether stability is required. Retain explicit examples for a known duplicate-value case and a prior bug at the ordering boundary. Property tests should generate empty, singleton, duplicate, sorted, reverse-sorted, and mixed collections rather than relying on random distribution to produce every named scenario.

## Exercise 3 solution

First inspect the mutation to understand the changed observable decision. Confirm that tests execute the path and that no filter/exclusion removes it. Add or run exact cases at maximum minus one, exactly maximum, and maximum plus one if those values are valid. Check expected outcomes against the requirement. If all valid values produce the same observable behavior for the two comparison forms, or the upper boundary cannot occur, document equivalence/unreachability and review whether the code can be simplified. Do not add a test solely to raise the score.

## Exercise 4 solution

Replace the current-date assumption with fixed/injected time or explicit zone; create unique database identifiers per test; replace the one-second sleep with a wait on a readiness/result condition. Inspect suite ordering and cleanup, capture the worker/data key and failing phase, then replay with randomized order if available. A retry can show intermittency and preserve another attempt’s evidence; it cannot tell whether the cause is shared data, timing, or a product defect, and it does not make the first failure safe to ignore.

## Exercise 5 solution

A framework timeout may stop waiting while the underlying task continues, allowing the request to mutate state during later tests. Use `TestContext.CancellationToken`, available starting with MSTest 3.11, pass it into supported asynchronous work, and ensure the code observes cancellation and cleans up. Keep the test’s resources isolated in case a dependency does not cooperate. MSTest’s cooperative timeout cancellation requires the test code to check the token; merely reading the property does not stop the work. [MSTest TestContext](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests-testcontext)

## Exercise 6 solution

Replace the giant snapshot as the sole assertion with explicit checks for required response status, tax amount, total, currency and essential fields. If stable serialization itself is contractual, keep a smaller focused file snapshot for that representation and normalize only irrelevant generated fields. Put baseline diffs through code review; require reviewers to understand each intentional change and reject unexplained bulk updates.

## Exercise 7 solution

Keep the fast unit suite for numerous business-rule cases. Add database-provider integration tests for persistence, constraints and transaction behavior. Add contract tests for payment/account service boundaries. Retain a small, isolated browser suite for checkout and critical security journeys, with unique data and stable API setup. Add smoke checks after deployment for essential availability. Measure local focused-run time, full local suite time, CI queue/wall time, and time to actionable failure separately. Use traces and ownership to reduce end-to-end diagnosis cost; do not replace provider evidence with mocks just to shorten the suite.

# Tests and edge cases

Before accepting a metric or test-plan change, check:

- Does the coverage report include the intended code and clearly state exclusions?
- Do tests assert outputs and error behavior, not just call the code?
- Are surviving mutants investigated for relevance/equivalence?
- Do properties state valid domains and meaningful invariants?
- Can generated failures replay from the recorded seed/configuration?
- Are exact boundaries represented explicitly as examples or deliberate generated cases?
- Are time, timezone, network, resources, data and order controlled?
- Does timeout cancellation stop work and permit safe cleanup?
- Are retries bounded and first-attempt diagnostics retained?
- Are snapshots focused and baselines reviewed?
- Does the test layer match the risk and expected evidence?

# Reflection questions

1. Which metric in your team is most likely to be mistaken for proof of correctness?
2. Where could a generated input find a defect that named examples miss?
3. Which flaky test failure has enough seed/order/environment data for replay?
4. Does your suite contain a snapshot that is too large to review meaningfully?
5. How long does a developer wait for a focused and a full test result?

# Sources

- [MTP coverage](https://learn.microsoft.com/en-us/dotnet/core/testing/microsoft-testing-platform-code-coverage)
- [Stryker mutation score FAQ](https://stryker-mutator.io/docs/General/faq/)
- [FsCheck test data](https://fscheck.github.io/FsCheck/TestData.html)
- [MSTest execution controls](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-mstest-writing-tests-controlling-execution)
- [Microsoft testing best practices](https://learn.microsoft.com/en-us/dotnet/core/testing/unit-testing-best-practices)
