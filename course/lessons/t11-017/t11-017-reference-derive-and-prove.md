# solve, explain, test, and analyze algorithm problems — Reference: Choose an approach and justify correctness

## Scope and version

This lesson explains the ten supplied approach-selection and proof terms.

## How this group fits the mental model

Move from a precise contract to a candidate algorithm, then establish why its state and choices are sufficient before trusting performance or examples.

## Supplied names explained

- Small worked example — A hand-sized input used to expose state changes and test whether an interpretation matches the contract. It is illustrative, not a proof.
- Brute-force baseline — A direct method that tries all relevant possibilities. It clarifies the search space and can become a small-input correctness oracle.
- Candidate data structures — Structures selected by required operations, such as membership, ordering, minimum extraction, prefix traversal, or indexed access.
- Algorithm pattern selection — Match the task structure to a known family such as two pointers, binary search, graph traversal, greedy, or DP; verify prerequisites rather than matching keywords.
- Input constraints eliminate slow approaches — Estimate growth from bounds. A quadratic scan over a large n may be infeasible; sorting may fit when n is moderate.
- Loop invariant — A precise statement about program state that remains true at a loop boundary and connects processed work to the answer.
- Initialization proof — Show the invariant is true before the first iteration or recursion step.
- Invariant-preservation proof — Show one iteration's update turns a state satisfying the invariant into another state satisfying it.
- Termination proof — Show the loop or recursion makes progress toward a finite bound and explain what the invariant means at termination.
- Recursive base case and progress — Define the smallest subproblem directly and show every recursive call moves closer to it or strictly reduces a well-founded measure.

## Cross-item comparison

The baseline gives a correctness reference and search-space intuition. A pattern suggests an implementation shape but still needs a contract-specific invariant. Constraint estimates reject infeasible methods; proof obligations establish correctness independently of speed.

## Examples

For duplicate detection with a set, the invariant before processing index i is: the set contains exactly the distinct values in the prefix before i, and no duplicate has yet been seen. Initialization holds for the empty prefix. If the next value is already present, a duplicate exists; otherwise adding it preserves the invariant. Reaching the end proves none exists.

For maximum subarray sum, the baseline enumerates every nonempty range. The optimized recurrence compares a range starting at the current element with one extending the best range ending at the previous element. Its invariant defines both the ending-here value and the best value over the processed prefix.

## Common mistakes

- Treating a familiar pattern as proof.
- Writing an invariant too vague to check in code.
- Proving preservation but not initialization or termination.
- Recursing without a decreasing measure.
- Optimizing before a simple baseline clarifies the objective.

## Knowledge checks with answers

1. **What does a baseline reveal?** A straightforward solution space and a reference for small cases.
2. **What are the three loop-invariant proof steps?** Initialization, preservation, and termination interpretation.
3. **How do constraints affect pattern choice?** They rule out approaches whose time or memory growth exceeds practical bounds.
4. **What proves recursive termination?** Each call moves toward a base case by decreasing a well-founded measure.

Sources: [USACO Guide: Time Complexity](https://usaco.guide/bronze/time-comp), [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf).
