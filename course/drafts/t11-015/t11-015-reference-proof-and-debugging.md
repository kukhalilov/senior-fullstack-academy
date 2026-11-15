# dynamic programming states, recurrences, and tabulation — Reference: Correctness arguments and failure cases

## Scope and version

This lesson explains the ten supplied DP proof, boundary, testing, and failure-case terms.

## How this group fits the mental model

A correct implementation must compute the mathematically intended state values. Prove base cases and transitions, then validate boundaries and numeric behavior with traces and independent small-instance checks.

## Supplied names explained

- Induction over state order — Prove a state is correct assuming its already-computed dependencies are correct, following the evaluation order or a well-founded recursion measure.
- Base-case proof — Show the directly assigned values match the exact interpretation of the corresponding smallest subproblems.
- Transition completeness — Every valid solution represented by a state is accounted for by at least one allowed transition.
- Transition soundness — Every transition constructs only a valid candidate for that state's problem.
- Boundary initialization — Assign values at edges where normal predecessors are absent; grid top rows, first columns, empty prefixes, and zero targets require explicit handling.
- Small-state hand trace — Compute a small table by hand to check indexing, recurrence, and base values.
- Brute-force differential check — Compare DP results with a simple exhaustive solver for small inputs where all possibilities can be enumerated.
- Wrongly merged states — A state key omits information that changes future possibilities, causing distinct subproblems to reuse one answer.
- Overflow and sentinel arithmetic — Intermediate sums or counts may exceed type bounds; unreachable sentinels can overflow when incremented. Derive numeric bounds and guard operations.
- Recurrence versus greedy choice — A recurrence preserves and compares alternatives; greedy discards alternatives and requires a safe-choice proof. Replacing a DP with greedy needs a separate correctness argument.

## Cross-item comparison

Transition completeness prevents missing solutions; soundness prevents inventing invalid ones. Both are needed. Testing can expose mistakes in either proof obligation but cannot establish them for all inputs.

## Examples

For Unique Paths, base initialization sets the first row and column to one because there is exactly one path along either boundary. Interior cells sum above and left. If those boundaries remain zero-initialized, the recurrence silently returns wrong counts.

For Coin Change, an unreachable sentinel such as amount+1 is larger than any optimal number of coins for a reachable target, but it must be checked before adding one. The state answer is -1 only after all transitions leave the sentinel unchanged.

For Decode Ways, input "06" has no valid first token. Setting dp[0]=1 does not make a leading zero decodable; the one- and two-digit transition guards determine that dp[1] and final answer are zero.

## Common mistakes

- Proving the recurrence informally but not defining each state.
- Failing to handle first row/column or empty-prefix base values.
- Using an unguarded sentinel addition.
- Testing only examples that share the same boundary shape.
- Merging states whose previous-choice or parity information changes legal transitions.
- Converting a min recurrence into “take the largest immediate value” without proof.

## Knowledge checks with answers

1. **What does transition completeness establish?** No valid candidate solution is omitted.
2. **What does soundness establish?** Every considered transition is allowed by the problem.
3. **Why test tiny instances against brute force?** It can reveal indexing or state-merging bugs independently of the optimized recurrence.
4. **What is a wrong state merge?** Reusing one cached value for histories with different future subproblems.

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
