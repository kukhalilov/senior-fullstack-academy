# solve, explain, test, and analyze algorithm problems — Reference: Restate the contract and clarify constraints

## Scope and version

This lesson explains the ten supplied contract and clarification terms for algorithm problems.

## How this group fits the mental model

An algorithm is correct only relative to a contract. Before selecting a pattern, identify what inputs are allowed, what output is required, and which behaviors the task leaves open.

## Supplied names explained

- Input and output contract — The complete definition of accepted input, required result, side effects, and behavior for every valid case.
- Restate in own words — Describe the same contract without copying a phrase mechanically; preserve objective, constraints, and return format.
- Clarifying ambiguity — Ask about only unspecified behavior that could change correctness, such as empty input or allowed mutation.
- Empty-input behavior — Determine whether zero elements are allowed and what result represents the empty case. Do not confuse defensive behavior with the stated domain.
- Duplicate-value behavior — Clarify whether duplicates are possible and whether repeated equal values count as distinct positions, results, or keys.
- Ordering requirements — Distinguish whether input order must be preserved, result ordering matters, or any valid order is accepted.
- Mutation permission — Determine whether modifying arrays, lists, or boards is allowed; if not, copy or restore state.
- Numeric range and overflow — Bound values and intermediate expressions, not only final outputs. Choose a type and sentinel strategy that safely covers them.
- Input-size constraints — Use every relevant dimension (n, m, value range, number of queries) to estimate whether quadratic, logarithmic, or output-sensitive work fits.
- Output-size lower bound — If the required output contains R items or L total symbols, returning it costs at least Ω(R) or Ω(L), regardless of search efficiency.

## Cross-item comparison

Input constraints restrict the domain; output requirements determine what must be produced. Mutation is a side-effect constraint. Numeric range is a correctness constraint because overflow can change results even when the asymptotic algorithm is appropriate.

## Examples

For duplicate detection, an empty input commonly returns false because it contains no duplicate, but confirm the problem permits emptiness. If input order must be preserved, sorting in place is unsuitable even if it makes duplicate detection easy. A set-based method avoids reordering but uses extra memory.

For returning all subsets, an O(2^n) search may still require Θ(n·2^n) element writes because each subset is materialized. The output-size lower bound can dominate the decision cost.

## Common mistakes

- Guessing edge behavior that was already explicitly specified.
- Asking questions unrelated to the algorithm's correctness.
- Ignoring mutation because the returned answer is correct.
- Looking only at n when a second dimension or value range controls storage.
- Claiming an algorithm is too slow without accounting for the required output.

## Knowledge checks with answers

1. **When should you ask about duplicates?** When presence or multiplicity changes the result or algorithm.
2. **What numeric values should be bounded?** Inputs and intermediate arithmetic, including sentinels and products.
3. **Why can output impose a runtime lower bound?** Every returned element or character must be produced.
4. **What does restating the task help prevent?** Solving a related but different problem.

Sources: [USACO Guide: Time Complexity](https://usaco.guide/bronze/time-comp), [Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf).
