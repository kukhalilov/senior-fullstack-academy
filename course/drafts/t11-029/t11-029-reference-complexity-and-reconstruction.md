# knapsack, subset-sum, and resource-allocation DP — Reference: Pseudo-polynomial cost and selected-item recovery

## Scope and version

This reference covers cost models, capacity limits, recovering a chosen set, tie behavior, and a lower-memory alternative for small item counts.

## How this group fits the mental model

The capacity axis is valuable only when it is small enough to enumerate. If the answer requires actual chosen indices rather than only a score, additional provenance must be retained. Complexity and reconstruction choices follow from what the caller needs returned.

## Supplied names explained

- **`O(nW) time bound`:** process n items across W capacity states; transition work is constant per state for ordinary one-dimensional knapsack.
- **`O(W) compressed space`:** store one value per capacity when a correct update order preserves 0/1 or unbounded semantics.
- **`Pseudo-polynomial complexity`:** runtime is polynomial in numeric W but may be exponential in the number of bits used to encode W.
- **`Capacity-range feasibility`:** before allocating, check that W and array length fit memory and indexing limits.
- **`Reconstruct selected item indices`:** retain a table or predecessor decisions sufficient to recover which item choices formed the optimum.
- **`Tie between optimal subsets`:** multiple different index sets can have equal value; choose any unless a tie rule is stated.
- **`Overflow-safe total capacity`:** accumulate totals and target arithmetic in a type large enough for the maximum input sum; validate before converting to array length.
- **`Compare with meet-in-the-middle`:** split n items into halves, enumerate half sums, and combine them; useful when n is small but W is huge.

## Cross-item comparison

Capacity DP scales with W and compresses memory to O(W). Meet-in-the-middle scales roughly with `2^(n/2)` states per half and avoids allocating by W. A one-dimensional DP recovers an objective value cheaply but loses item-prefix provenance; a two-dimensional table or stored predecessor information uses more memory to recover choices. If several optimal subsets tie, the recurrence may select one according to iteration order unless it explicitly applies a tie-break.

## Examples

With n=30 items and W near 10^9, an O(nW) array is infeasible even though n is small. Splitting into two groups of 15 yields at most 32768 subset sums per half, which can be sorted and combined for a suitable objective. Conversely, with n=200 and W=10000, an O(nW) DP may be practical while meet-in-the-middle would enumerate an enormous number of subsets.

To recover a chosen subset, preserve `dp[i,w]` or a predecessor record identifying whether item i was taken from state `(i-1,w-weight[i])`. If equal values produce ties, the code must define whether either is acceptable or enforce a required rule.

## Common mistakes

- Calling O(nW) polynomial in input bit length.
- Allocating `W+1` without guarding overflow or memory feasibility.
- Using an `int` total when the sum of inputs may exceed its range.
- Claiming selected indices can be recovered from only the final compressed value array.
- Comparing meet-in-the-middle on an input where n is large and W is already small.

## Knowledge checks with answers

1. **Why pseudo-polynomial?** W's numeric value may be exponential in its encoded bit length.
2. **When can meet-in-the-middle help?** Small n and an impractically large capacity range.
3. **What extra information recovers chosen indices?** Per-item decisions/predecessors or a reference table retaining item layers.

Sources: [USACO Guide: Intro to DP](https://usaco.guide/gold/intro-dp), [USACO Guide: Knapsack Applications](https://usaco.guide/PAPS.pdf), [USACO Guide: Book Shop](https://usaco.guide/problems/cses-1158-book-shop/solution).
