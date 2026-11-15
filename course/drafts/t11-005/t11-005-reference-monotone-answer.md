# binary search, bounds, rotated arrays, and monotone answers — Reference: Binary search over a monotone answer space

## Scope and version

This lesson covers the eight supplied answer-search terms. The search domain is discrete integer values; continuous-domain approximation is excluded.

## How this group fits the mental model

Instead of searching an input array, test whether a candidate answer is feasible. If the Boolean result changes at most once, binary search locates that transition. The feasibility proof and bounds matter as much as the loop.

## Supplied names explained

- `Monotone feasibility predicate` — A Boolean test whose answers have one ordered transition, such as false for capacities below the minimum and true thereafter. Prove this implication from the problem: if x is feasible, every larger capacity is feasible.
- `First true boundary` — The smallest candidate where a false→true predicate becomes true. Maintain a false-side lower boundary and true-side upper boundary, or use a half-open lower-bound template; verify that the true bound exists.
- `Last true boundary` — The greatest candidate where a true→false predicate remains true. Use an upper midpoint when retaining mid in the lower range, or transform carefully into a first-false search.
- `Minimum feasible answer` — Search for the first true capacity, rate, or threshold. The lower bound may be impossible, while the upper bound must be feasible; handle an impossible instance explicitly.
- `Maximum feasible answer` — Search for the last true value when larger candidates eventually fail. Establish a feasible lower bound and an upper bound that is impossible or a sentinel beyond the search domain.
- `Feasibility check` — Computes whether a proposed answer can satisfy constraints, often with a greedy pass. Its correctness needs an independent argument, and its cost multiplies the number of binary-search iterations.
- `Proven answer bounds` — Bounds derived from input, not guessed constants. For shipping capacity, lower bound is the heaviest item and upper bound is the sum of all weights; the latter can ship everything in one day.
- `Answer-space overflow` — Candidate midpoint, bound arithmetic, and feasibility totals can exceed their type. Use long or safe arithmetic and stop a feasibility check once it is already impossible.

## Cross-item comparison

`Monotone feasibility predicate` supplies the structure; `First true boundary` and `Last true boundary` choose which transition to locate. `Minimum feasible answer` and `Maximum feasible answer` name common objectives. A `Feasibility check` evaluates a candidate, while `Proven answer bounds` enclose the transition. `Answer-space overflow` is a numeric correctness risk throughout.

## Examples

For shipping weights `[1,2,3,1,1]` in four days, capacity 3 is feasible; any larger capacity is also feasible. Capacity 2 is infeasible. Searching between a proven impossible lower bound and feasible upper bound locates the first feasible capacity. Each check greedily packs in order, starting a new day only when the next weight would exceed capacity.

## Common mistakes

- Binary searching a candidate range without proving a monotone predicate.
- Using an upper bound that may still be infeasible.
- Omitting a no-solution case.
- Reporting O(log range) while the feasibility scan costs O(n).
- Allowing sum or midpoint arithmetic to overflow.
- Using an unproved greedy feasibility checker.

## Knowledge checks with answers

1. **What makes answer-space binary search valid?** A monotone feasibility predicate.
2. **What direction does minimum-feasible search locate?** The first true candidate.
3. **How do you bound shipping capacity?** At least the maximum item; at most the total weight for positive D.
4. **What is full complexity if each check scans n items?** O(n log range).

Source: [USACO Guide: Binary Search](https://usaco.guide/silver/binary-search).
