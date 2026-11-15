# solve, explain, test, and analyze algorithm problems — Reference: Dry runs, edge cases, and executable checks

## Scope and version

This lesson explains the ten supplied implementation and testing terms for algorithm practice.

## How this group fits the mental model

Code should implement the proved state transition. A dry run checks that transition manually; executable tests probe cases the example may miss and preserve discovered failures.

## Supplied names explained

- Trace state after each iteration — Write down the relevant variables before and after each update to verify they match the invariant.
- Boundary cases — Inputs at legal extremes, such as length zero or one when permitted, minimum/maximum values, or an answer at the first/last position.
- Adversarial case — An input designed to stress the algorithm's assumptions or worst-case behavior, such as reverse order, a long duplicate run, or a late failure.
- Single-element case — A minimal nonempty input that exposes initialization and off-by-one behavior.
- All-equal case — An input where every value repeats, useful for detecting duplicate handling and quadratic behavior.
- Sorted and reverse-sorted cases — Opposing input orders that expose hidden order assumptions or worst-case behavior in an implementation.
- Differential test against brute force — Generate small inputs and compare the optimized result with a simpler exact implementation using the same contract.
- Property-based invariant — Check a general property over many cases, such as output being sorted, sum preservation, or every reported pair satisfying its target.
- Regression test — A fixed test retained after a bug is found so later changes cannot silently reintroduce it.
- Assertion that throws on failure — An executable check that terminates with a nonzero failure when an expected property is false; logging alone can let broken code appear successful.

## Cross-item comparison

A worked trace examines one execution in detail. Boundary and adversarial cases target failure modes. Differential and property-based tests examine many cases. Regression tests preserve known failures. They all support debugging but do not replace a proof.

## Examples

For a maximum-subarray implementation, test one element, all-negative values, all zeros, and a best subarray at either boundary. A brute-force oracle checks every nonempty range for small arrays. Random arrays of length up to eight can compare Kadane's result with that oracle; use a fixed seed so failures reproduce.

For duplicate detection, property checks can assert that the optimized method returns true exactly when the number of distinct values is less than the array length. Also assert the implementation leaves the input unchanged if mutation is disallowed.

## Common mistakes

- Testing only the sample input.
- Comparing against a second implementation that repeats the same bug or incorrect assumptions.
- Generating only random cases and missing named edge conditions.
- Making tests nondeterministic without recording a seed.
- Printing “failed” while returning a successful process exit code.
- Confusing passing tests with proof of correctness.

## Knowledge checks with answers

1. **What is a regression test?** A fixed check for a previously discovered failure.
2. **What does differential testing compare?** Results from two implementations on identical small inputs.
3. **Why include all-equal input?** It stresses duplicate handling and can reveal unnecessary repeated work.
4. **What should a failed assertion do?** Make the check fail unmistakably, typically with an exception or test failure.

Sources: [Testing in .NET](https://learn.microsoft.com/en-us/dotnet/core/testing/), [USACO Guide: Time Complexity](https://usaco.guide/bronze/time-comp).
