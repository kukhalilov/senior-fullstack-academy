# greedy choices, invariants, and correctness proofs — Reference: Local choices, invariants, and solution structure

## Scope and version

This lesson explains the ten supplied terms for the greedy decision model. The principles are general; no programming-language or library version applies.

## How this group fits the mental model

The algorithm commits to a sequence of local decisions. The proof explains why these choices remain compatible with a globally optimal solution. State and invariants connect the implementation to the proof.

## Supplied names explained

- Greedy choice — A locally selected option, defined by a specific rule such as smallest feasible requirement or earliest finish. Local preference alone does not imply global optimality.
- Irrevocable decision — A committed choice the algorithm does not later undo. Correctness requires showing that commitment is safe.
- Feasible partial solution — A prefix of decisions that has not violated constraints and, for the proof at hand, can be extended to a valid complete solution. Some search states are feasible but have no optimal extension, so feasibility is weaker than optimality.
- Greedy invariant — A statement maintained after each decision, describing a property such as feasibility, a frontier, or dominance over competing prefixes.
- Optimal substructure — After a valid choice, the remaining task can be formulated as a smaller optimization problem whose optimum combines with the choice. It does not alone prove a greedy choice is safe; dynamic programming also uses optimal substructure.
- Greedy-choice property — At least one optimal solution can be made to contain the greedy choice at the current step. This is commonly established by an exchange argument or related theorem.
- Decision ordering — The order in which the algorithm considers or commits choices, often exposed by sorting or a priority queue. Different objectives over the same objects can require different orderings.
- Exchange argument — Transform an optimal solution that disagrees with the greedy choice into one that agrees, without violating feasibility or worsening its objective.
- Staying-ahead proof — Compare greedy and competing prefixes after each step using a measure; prove the greedy prefix is never worse under that measure, then connect it to the final objective.
- Cut property concept — In cut-based graph proofs, a minimum-weight eligible edge crossing a cut is safe for some minimum spanning tree under the relevant assumptions. This is a theorem tied to graph structure, not a universal instruction to pick the cheapest available object.

## Cross-item comparison

An invariant is maintained by code; a proof method justifies what that invariant implies. Optimal substructure describes how optimal values decompose; greedy-choice property justifies which first decision can be fixed. Both properties are often used together, but neither should be inferred from a handful of examples.

## Examples

In Assign Cookies, the greedy rule pairs the least demanding remaining child with the smallest cookie large enough. If an optimal assignment gave that child a larger cookie, exchanging in the smaller fitting cookie preserves the child's satisfaction and frees a cookie at least as large for the displaced assignment. The exchange proves the decision can be committed.

For Jump Game, the invariant can state that every index at or before farthest is reachable after scanning the current prefix. When an index lies beyond farthest, the scan cannot proceed and the last index is unreachable. The invariant is a correctness claim only after proving its initialization and preservation.

## Common mistakes

- Calling a rule “greedy” as if that were a proof.
- Confusing optimal substructure with the greedy-choice property.
- Proving only that each prefix is feasible, not that the result is optimal.
- Choosing a staying-ahead metric that does not imply the objective.
- Invoking a cut property outside its graph assumptions.

## Knowledge checks with answers

1. **What makes an irrevocable decision safe?** A proof that some optimum agrees with it and the remaining decisions can still achieve the required optimum.
2. **Can dynamic programming have optimal substructure without a greedy rule?** Yes; DP compares alternative subproblem choices.
3. **What should a greedy invariant do?** State a precise property preserved at every decision and linked to correctness.
4. **What does a cut property establish?** Under its conditions, a cheapest eligible edge crossing a cut can belong to an optimum spanning tree.

Sources: [USACO Guide: Greedy](https://usaco.guide/bronze/intro-greedy), [USACO Guide: Greedy Sorting](https://usaco.guide/silver/greedy-sorting), [Competitive Programmer's Handbook](https://usaco.guide/PAPS.pdf).
