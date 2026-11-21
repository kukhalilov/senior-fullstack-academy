# greedy choices, invariants, and correctness proofs — Core concepts and how they fit together

## Learning objectives

- Distinguish a greedy hypothesis from a proved exact greedy algorithm.
- Define feasibility and an invariant for a partial solution.
- Apply exchange and staying-ahead proof structures.
- Use counterexamples and tiny exhaustive oracles to challenge a rule.
- Include sorting, heaps, and output requirements in complexity.

## Prerequisites

Know asymptotic analysis, sorting, elementary induction, and the distinction between a feasible solution and an optimal solution. Greedy reasoning is about proving a choice order; it is not a specific data structure or programming language feature.

## Core concepts

A greedy choice is a locally selected option that an algorithm commits to without reconsidering it. “Locally best” has no universal meaning: it must be defined in terms of the problem's objective and current feasible choices. A feasible partial solution is one that can still be extended, or at least has not yet violated the constraints. A greedy invariant states what the committed prefix guarantees.

The greedy-choice property says an optimal complete solution exists that begins with the proposed greedy choice, or otherwise agrees with that choice at the relevant step. Optimal substructure says the remainder after a valid choice is itself an appropriately structured optimization problem. These ideas often support a proof, but merely observing them in examples does not establish correctness.

## Mechanisms and relationships

### Exchange argument

Take an optimal solution that may disagree with the greedy choice. Replace or rearrange part of it so that it agrees with the greedy choice, and prove feasibility and objective value are preserved or improved. Then the transformed solution is still optimal and contains the greedy choice. Apply induction to the remaining subproblem.

### Staying-ahead proof

Compare greedy and arbitrary competing partial solutions after the same number of decisions. Choose a measure (such as finish time, reachable frontier, or remaining capacity) and prove greedy is never behind. The measure must be strong enough to imply the final objective; an unrelated locally favorable number is not sufficient.

### Invariant and induction

State the invariant before coding. Prove it initially, show each greedy decision preserves it, and show that when the algorithm terminates the invariant implies the required result. For optimization, also prove optimality, not only feasibility. Feasibility invariants alone do not show maximality or minimality.

### Counterexamples and tiny oracles

Try the smallest inputs that force choices to conflict, including ties, repeated values, endpoints, zero values, and capacity boundaries. A brute-force oracle enumerates all feasible solutions for tiny inputs and compares objective values. Randomized differential testing can find counterexamples but cannot prove the greedy rule correct; a proof is still required.

## Worked examples

For Assign Cookies, matching the least greedy child to the smallest cookie that fits admits an exchange argument: if another solution gives that child a larger cookie, swap in the smaller fitting cookie and free the larger one for later. For arbitrary coin denominations {1,3,4} and target 6, repeatedly taking the largest coin gives 4+1+1, while 3+3 is better by coin count. This is a concrete counterexample to the general “largest coin first” claim.

In Jump Game, a prefix of reachable indices can be summarized by its farthest reachable endpoint. This is a sufficient state for the yes/no question; it is not a generic license to choose the largest jump at each step. The proof shows every index up to the maintained frontier is reachable, and each newly reached index can extend the frontier.

## Misconceptions and edge cases

- “Greedy works because it worked on examples” is evidence only for tested cases.
- A feasible partial solution need not be extendable to an optimal solution.
- Tie-breaking can affect correctness or reproducibility; the proof must cover ties.
- A cut property is a structural statement that some optimum crosses a cut using a cheapest eligible edge; its force comes from the problem's exchange proof, not from a general rule to take cheap items.
- An exact greedy algorithm always returns an optimum under its stated assumptions. An approximation algorithm instead proves a quality ratio or other bound; those are different guarantees.
- Sorting cost and priority-queue operations belong in runtime analysis.

## Knowledge checks with answers

1. **What does the greedy-choice property claim?** At the relevant step, at least one optimal solution agrees with the greedy decision.
2. **Does a feasibility invariant prove optimality?** No; it must connect the completed solution to the objective and optimal value.
3. **What does an exchange argument do?** Transforms an optimum to include the greedy choice without degrading it.
4. **Can randomized differential tests prove correctness?** No; they are useful for falsifying a rule, not establishing a universal theorem.
5. **Why is arbitrary coin change a useful warning?** The locally largest denomination may produce a worse total number of coins.

Sources: [USACO Guide: Greedy](https://usaco.guide/bronze/intro-greedy), [USACO Guide: Greedy Sorting](https://usaco.guide/silver/greedy-sorting), [Competitive Programmer's Handbook](https://usaco.guide/PAPS.pdf).
