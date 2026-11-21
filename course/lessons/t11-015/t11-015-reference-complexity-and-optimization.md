# dynamic programming states, recurrences, and tabulation — Reference: State complexity, memory, and reconstruction

## Scope and version

This lesson explains the ten supplied state-count, runtime, memory, and reconstruction terms.

## How this group fits the mental model

After defining a recurrence, count how many states are evaluated, how much work each transition performs, what storage is retained, and whether an actual solution must be recovered.

## Supplied names explained

- Number of states — Count all distinct state tuples that can be evaluated. A dense table may allocate a Cartesian product of dimension sizes even if only a subset is reachable.
- Work per state — The work to evaluate one state, including loops over choices, data-structure operations, and arithmetic on stored values.
- Transition count — Total candidate predecessor/choice edges examined across states. For irregular recurrences, count transitions directly rather than assuming a uniform constant.
- Time = states times transition work — If each of S states examines at most T transitions with O(1) transition work, runtime is O(S·T). More generally sum the cost across all evaluated transitions and add initialization.
- Memory by stored dimensions — A full table typically uses the product of state-dimension sizes. Also count input copies, caches, recursion stack, predecessor choices, and output when relevant.
- Rolling-array optimization — Retain only dependency layers still needed, such as the previous row of a grid recurrence. It is safe only after identifying exactly which earlier layers each state reads.
- In-place state reuse — Update one array rather than retaining old and new layers separately. Correctness depends on preserving old values until their final read.
- Loop direction dependency — Iterate indices in the direction required by the recurrence. For a 0/1 choice recurrence, descending capacity prevents reuse of the current item; for an unbounded recurrence, ascending capacity may intentionally allow repeated use. These specific knapsack families are covered separately.
- Choice reconstruction — Recover which choices form an optimum by storing a decision per state or by recomputing which transition attained the value.
- Predecessor reconstruction — Store a predecessor state for each chosen state, then walk backward from the final state and reverse the path if needed.

## Cross-item comparison

Rolling arrays reduce value storage but usually erase older choices. Storing predecessors simplifies reconstruction but adds memory. Recomputing decisions can save memory when the recurrence and inputs remain available, at the cost of extra time.

## Examples

Unique Paths on an m by n grid has mn states, each with at most two predecessors, so time is O(mn). A one-row implementation stores n counts and updates left to right: the old cell value is the path count from above, while the already-updated previous column is the count from the left.

Minimum Path Sum can use one row for the same reason: each cell needs only the value from above and the new value from the left. If reconstructing a path, the final sum alone is insufficient; retain predecessor directions or recompute choices by comparing the table values.

Coin Change with amount A and k denominations has A+1 states and up to k transitions each, yielding O(Ak) time and O(A) space. This estimate assumes constant-time integer operations and a bounded amount as given.

## Common mistakes

- Saying “there are n states” while each state scans n choices, omitting a factor.
- Counting only reachable states when allocating a dense table for all combinations of dimensions.
- Rolling away a value that a later state still needs.
- Changing ascending/descending loop direction without re-deriving whether current choices may be reused.
- Claiming O(1) memory when predecessor or output storage is retained.

## Knowledge checks with answers

1. **What is the standard DP runtime estimate?** Number of evaluated states times transition work per state, with nonuniform costs summed as needed.
2. **What proves a rolling array is safe?** Every discarded layer has no future dependency.
3. **Why can loop direction change semantics?** It determines whether an update reads the old-layer value or a value just written in the current layer.
4. **What is the memory tradeoff for path reconstruction?** Store decisions/predecessors or recompute them later.

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
