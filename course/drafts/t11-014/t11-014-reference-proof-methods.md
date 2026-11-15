# greedy choices, invariants, and correctness proofs — Reference: Proof techniques and counterexamples

## Scope and version

This lesson explains the ten supplied proof, testing, and tie-case terms. They are general algorithm-design methods, not versioned APIs.

## How this group fits the mental model

A greedy rule begins as a conjecture. A proof method can establish it; counterexamples can disprove it. Testing supports the investigation but does not replace a universal proof.

## Supplied names explained

- Exchange argument — Modify an optimal solution so that it uses the greedy choice while preserving feasibility and objective value.
- Swap with an optimal solution — A common exchange step: replace a conflicting choice or reorder two decisions. The swap must be shown not to break constraints.
- Induction over decisions — Prove the first decision is safe, then assume the greedy prefix is compatible with an optimum and prove the next decision preserves that fact.
- Invariant preservation — Show initialization, preservation after each action, and a termination condition that implies the goal. If optimality is required, the invariant must establish an objective bound too.
- Staying-ahead comparison — Compare greedy and competitor prefixes with the same amount of progress, using an order or metric that implies the final result.
- Proof by contradiction — Assume the greedy result is not optimal and derive a contradiction from the rule, constraints, and objective. The contradiction must address all possible counterexamples.
- Smallest counterexample search — Examine minimal inputs where a decision can block a later choice: tiny capacities, duplicate values, ties, empty options, or exact boundaries. Finding one disproves the rule; not finding one proves nothing.
- Brute-force oracle on tiny inputs — Enumerate all feasible solutions for small instances and compare exact objective values with the greedy algorithm. It is a practical check of candidate rules.
- Randomized differential testing — Generate many small inputs and compare greedy output against a trusted exhaustive or DP oracle. Use fixed seeds for reproducibility and retain each failing case.
- Proof obligations for tie cases — Specify deterministic tie behavior and prove all tied choices are equally safe or show the algorithm's selected tie-break is required. Equal keys may affect feasibility even when objective values match.

## Cross-item comparison

Exchange and staying-ahead are proof strategies. Tiny brute force and randomized differential testing are falsification tools. Induction often formalizes repeated exchanges or invariant preservation. They complement one another but provide different levels of assurance.

## Examples

The arbitrary coin rule “take the largest coin not exceeding the remainder” fails for denominations [1,3,4] and amount 6: it returns 4+1+1, while 3+3 uses fewer coins. This smallest-style counterexample invalidates the general rule. To support a new rule, compare many small inputs with a brute-force minimum-coin oracle, then prove it for the stated coin assumptions.

For earliest-finish interval selection, ties in finish time can be resolved by any stable convention if the exchange proof depends only on finishing no later. If a secondary constraint depends on interval identity or weight, that tie claim needs a new proof.

## Common mistakes

- Treating a large randomized test suite as proof.
- Failing to compare against an oracle that is itself correct.
- Assuming a swap preserves feasibility without checking affected constraints.
- Ignoring tie cases because equal local scores appear interchangeable.
- Searching only for counterexamples matching the expected narrative instead of generating adversarial small cases.

## Knowledge checks with answers

1. **What does an exchange proof establish?** There exists an optimum compatible with the greedy choice.
2. **What can a counterexample establish?** It disproves the proposed universal rule.
3. **What can randomized differential testing establish?** It can find disagreements, but passing samples is not a correctness proof.
4. **Why explicitly address ties?** Tied local scores may lead to different future feasible sets.

Sources: [USACO Guide: Greedy](https://usaco.guide/bronze/intro-greedy), [USACO Guide: Greedy Sorting](https://usaco.guide/silver/greedy-sorting), [Competitive Programmer's Handbook](https://usaco.guide/PAPS.pdf).
