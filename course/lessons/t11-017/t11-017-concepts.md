# solve, explain, test, and analyze algorithm problems — Core concepts and how they fit together

## Learning objectives

- Restate a prompt as a precise input/output contract.
- Ask clarifying questions that affect correctness.
- Derive a baseline and select an approach using constraints.
- Prove an invariant or recurrence.
- Test boundaries and compare optimized code with a small oracle.
- Explain worst-case, expected, amortized, input, and output costs accurately.

## Prerequisites

Know arrays, loops, functions, basic data structures, and asymptotic notation. The process is language-independent; code examples use C# for executable illustrations.

## Core concepts

The contract defines valid inputs, required outputs, side effects, ordering, numeric ranges, and edge behavior. A restatement is useful only if it preserves the exact objective and constraints. Clarifying questions should focus on ambiguities that can change a solution, not on details already fixed by the prompt.

A brute-force baseline exposes the search space and is often easy to trust. Constraints determine whether it can be the final algorithm. A faster method should be selected because its operations fit the workload, not merely because its name is familiar.

Correctness needs a reason covering all inputs: a loop invariant, induction over states, an exchange argument, or a recursive progress proof. Tests then search for implementation defects and false assumptions. Complexity analysis counts dominant operations and stored state; test results do not establish a universal bound or proof.

## Mechanisms and relationships

### From contract to approach

List input sizes, value ranges, duplicates, ordering requirements, mutation rules, and output size. Estimate the slowest plausible algorithm. If pairwise enumeration costs O(n²), compare that against n; if sorting is used, include O(n log n). Include a lower bound from output when every answer must be emitted.

### From baseline to invariant

Write a direct baseline first when it clarifies the logic. Identify what it repeats, then replace repeated work with a data structure or summarized state. State the invariant in a sentence and map each code update to preserving it.

### Tests and evidence

Use a small worked example for state transitions, then add edge cases that target boundaries and adversarial arrangements. For small random inputs, compare the optimized implementation against a trusted brute-force oracle. A regression test preserves every discovered failure. Assertions should fail loudly rather than print a warning and exit successfully.

### Analysis and communication

Worst-case complexity bounds every input of a given size. Expected complexity depends on a probabilistic or hashing model; amortized complexity averages a sequence of operations under a defined aggregate argument. Auxiliary space excludes input and sometimes output; state the convention. Explain dominant operations rather than relying on line count.

## Worked examples

For maximum subarray sum on a nonempty array, the quadratic baseline checks every start/end pair. The optimized state currentEndingHere is the best subarray sum that must end at the current index. It is either the current value alone or the previous currentEndingHere extended by that value. The global best records the maximum across all endpoints. Initializing from the first element handles all-negative inputs.

The invariant is: after processing index i, currentEndingHere equals the maximum sum of a nonempty subarray ending exactly at i, and best equals the maximum sum of any subarray within the processed prefix. This proves both state meaning and the final result.

## Misconceptions and edge cases

- A sample output does not specify behavior for all edge cases.
- “The interviewer expects hashing” is not a correctness argument.
- A brute-force oracle is trustworthy only if it represents the same contract and is independently simple.
- Expected O(n) is not identical to worst-case O(n).
- Amortized O(1) per operation is a sequence guarantee, not necessarily a bound for each individual call.
- Input size alone may not express complexity if values, output size, or multiple dimensions matter.
- Code that passes tests may still have overflow or mutation bugs outside the test data.

## Knowledge checks with answers

1. **Which clarification can change correctness?** Empty-input, duplicate, ordering, mutation, and numeric-range semantics.
2. **Why keep a brute-force baseline?** It clarifies possibilities and can serve as an oracle on small inputs.
3. **What belongs in a loop invariant?** A precise statement true before/after each iteration and strong enough to imply the result at termination.
4. **What is differential testing?** Comparing two implementations on the same generated inputs, typically optimized code against a small exact oracle.
5. **What separates expected and amortized bounds?** Expected bounds rely on a probability model; amortized bounds average a deterministic operation sequence under an aggregate argument.

Sources: [USACO Guide: Time Complexity](https://usaco.guide/bronze/time-comp), [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf), [Testing in .NET](https://learn.microsoft.com/en-us/dotnet/core/testing/).
