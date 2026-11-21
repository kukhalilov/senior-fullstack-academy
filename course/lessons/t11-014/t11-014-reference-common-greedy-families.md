# greedy choices, invariants, and correctness proofs — Reference: Common decision families and data-structure support

## Scope and version

This lesson explains the eight supplied decision-family names. It gives proof intuition and boundaries, not a complete catalog of scheduling or graph algorithms.

## How this group fits the mental model

Many greedy implementations sort candidates or use a priority queue to expose a choice. The data structure implements the order; the objective and exchange argument determine whether that choice is correct.

## Supplied names explained

- Earliest-finish interval selection — For selecting the maximum number of pairwise compatible, unweighted intervals on one timeline, repeatedly choose a compatible interval with minimum finish time. It leaves the largest possible remaining time window. This is interval scheduling; detailed overlap variants belong to the interval topic.
- Sort by deadline — In the single-machine setting where all jobs are available at time zero and the objective is to minimize maximum lateness, scheduling by nondecreasing due date is optimal. This does not solve every deadline problem: release times, weights, precedence, or a different objective change the problem.
- Sort by endpoint — Ordering intervals by end coordinate supports earliest-finish selection and some sweep decisions. “Endpoint” must be defined (start or finish) and linked to the proof; sorting by the other endpoint can fail for the same objective.
- Choose locally cheapest available item — Select the lowest-cost choice among those currently feasible. This is valid only if exchange or a problem-specific theorem shows this cannot block a better completion. Cheapest-first is not a general-purpose optimization method.
- Min-heap scheduling choice — A min-heap supports repeated access to the smallest key in O(log n) per removal. In some deadline-selection methods, sort by deadline, add durations, and if the total exceeds the current deadline remove the longest-duration job. A max-heap is used for that removal; the heap's direction must match the item to discard. A min-heap also appears in other scheduling rules for next completion time. The invariant and objective determine which one is appropriate.
- Maximum overlap resource selection — When intervals that overlap cannot share a resource, the minimum number of resources equals the maximum simultaneous overlap for interval graphs. Processing intervals with a heap of active finish times can track reuse. The precise endpoint convention (whether touching intervals overlap) must match the problem. Full sweep-line and overlap treatment is in the dedicated interval topic.
- Greedy partition or coloring — Assign each item to a group/resource as it arrives under a rule that keeps groups feasible. Greedy coloring of arbitrary graphs is order-dependent and may use more colors than optimal; interval partitioning has stronger structure and can achieve the overlap lower bound. Do not transfer the interval proof to arbitrary conflict graphs.
- Canonical coin-system caveat — A greedy denomination rule may be optimal for a particular currency system but fail for arbitrary denominations. For {1,3,4}, amount 6, taking the largest coin yields three coins (4+1+1), while 3+3 uses two. Exactness depends on the denomination system and objective.

## Cross-item comparison

Sorting determines static consideration order. A heap handles choices whose priority changes as the active set changes. Both can make decisions efficient, but neither proves a decision safe. The proof can depend on the data family: intervals have ordered endpoints, while arbitrary graph conflicts have no such guarantee.

## Examples

For unit-weight, always-available jobs on one machine with deadlines, choose jobs in deadline order to reason about feasibility. In a different problem that selects a maximum number of arbitrary-duration jobs before deadlines, sort by deadline, tentatively take each job, and if elapsed time exceeds the current deadline remove the selected job with greatest duration. The max-heap is not optional detail: removing the longest item recovers the most time while retaining the most jobs. Assumptions such as a common start time and independent jobs are essential.

For interval selection, choosing earliest start is not equivalent to choosing earliest finish: a long interval starting first can block several short compatible intervals. The correct ordering is determined by the exchange proof for the stated objective.

## Common mistakes

- Assuming a locally cheapest choice is always safe.
- Using deadline ordering without specifying release times, processing model, and objective.
- Using the wrong heap direction for the item that must be evicted.
- Assuming greedy graph coloring is optimal for arbitrary graphs.
- Treating touching interval endpoints inconsistently.
- Claiming coin greedy is universal because it works for familiar currency.

## Knowledge checks with answers

1. **What proves earliest-finish selection for unweighted interval scheduling?** An exchange replaces the first interval of an optimum with one that finishes no later.
2. **Does sorting by deadline solve all scheduling objectives?** No; the theorem is scoped to particular machine, availability, and objective assumptions.
3. **Why might a scheduling algorithm use a max-heap after sorting deadlines?** To evict the longest job when a time constraint is exceeded.
4. **Does interval partitioning's coloring result apply to arbitrary graphs?** No; arbitrary greedy coloring can use more colors than optimal.

Sources: [USACO Guide: Greedy](https://usaco.guide/bronze/intro-greedy), [USACO Guide: Greedy Sorting](https://usaco.guide/silver/greedy-sorting), [Competitive Programmer's Handbook](https://usaco.guide/PAPS.pdf).
