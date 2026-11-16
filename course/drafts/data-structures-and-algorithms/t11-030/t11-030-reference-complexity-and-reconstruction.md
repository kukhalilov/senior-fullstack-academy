# sequence and string dynamic programming — Reference: Rolling arrays, reconstruction, and validation

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf), [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/), and [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/).

## Scope and version

This lesson compares complexity and reconstruction strategies for the supplied sequence/string patterns. It covers general algorithmic techniques; exact problem constraints remain those in their linked statements.

## How this group fits the mental model

After a correct recurrence exists, ask how many states it visits, how much each state costs, what memory the output requires, and whether enough information remains to reconstruct an answer. A faster or smaller representation is useful only if its invariant still supports the required answer.

## Supplied names explained

- `O(nm) two-sequence DP` — A table with `n+1` and `m+1` prefix dimensions has `(n+1)(m+1)` states. Constant work per state is `O(nm)` time and full table memory.
- `Rolling two-row optimization` — Keep only previous and current rows when each state depends only on those rows. Memory becomes `O(m)` (or `O(min(n,m))` after swapping inputs where symmetry permits); clear/overwrite each current row correctly.
- `LIS O(n log n) tails method` — Binary-search the smallest tail not less than each value for strictly increasing LIS. It improves time over quadratic DP but stores a compressed frontier rather than a per-index optimum.
- `Reconstruct one optimal alignment` — Follow stored predecessor decisions from the terminal state to the base, collect matches or edits in reverse order, then reverse the output. Equal-cost choices can produce multiple optimal answers.
- `Backtrack choice table` — Store predecessor direction/choice alongside a score, or infer a valid predecessor from neighboring scores. Explicit choices can simplify reconstruction but use additional memory.
- `Prefix-index conversion` — In a prefix-length state `i`, the consumed characters are indices `0` through `i-1`; the last consumed character is at `i-1`. Convert only at collection/slicing boundaries to avoid off-by-one errors.
- `Substring versus subsequence counterexample` — In `"abcde"` and `"ace"`, common subsequence `"ace"` has length 3 while the longest common contiguous substring has length 1. This exposes an invalid skip transition in substring logic.
- `Brute-force comparison for short strings` — Generate small strings over a tiny alphabet and compare optimized DP answers with enumerated subsequences, substrings, partitions, or edit scripts. This catches boundary/transition bugs in ways a few hand-picked samples may not.

## Cross-item comparison

| Representation | Space | Optimal value | Reconstructs output |
|---|---:|---|---|
| Full pair table | `O(nm)` | Yes | Usually via backtracking |
| Rolling rows | `O(min(n,m))` | Yes | Not by itself |
| LIS tails only | `O(n)` | Length | Not by itself |
| Score + predecessor indices | `O(n)` for LIS | Yes | Yes, reverse predecessor chain |
| Score + choice table | `O(nm)` | Yes | Yes, with stored decisions |

Hirschberg’s LCS method can reconstruct an LCS in linear auxiliary space by dividing the problem and combining forward/backward rows, at the cost of additional implementation complexity. It is an advanced alternative, not a reason to discard full-table reconstruction when constraints are small.

## Examples

For LCS where only length is needed, store the shorter string along columns and two rows, reducing auxiliary space to `O(min(n,m))`. For an actual aligned sequence, the two rows are insufficient to identify all predecessor choices; keep a table, store decisions, or use a divide-and-conquer reconstruction method.

For LIS tails, track `tailIndex[length]` and a predecessor index per input position. When an element replaces a tail, record the previous-length tail index as its predecessor. At the end follow predecessors from the last tail index and reverse. Strict-LIS replacement uses lower bound; duplicates do not increase length.

## Common mistakes

- Claiming rolling rows preserve an arbitrary path without storing/recomputing choices.
- Forgetting to overwrite the full current row, allowing stale values from a prior iteration.
- Swapping inputs for shorter-column memory when transition asymmetry or output direction was not adjusted.
- Computing quadratic state count as `n*m` when dimensions include `+1` boundaries (asymptotically same, but exact allocation matters).
- Using binary search for the wrong monotonicity/bound.
- Comparing only random test outputs without preserving a reproducible seed or shrinking a failing counterexample.
- Failing to include empty, repeated-character, all-mismatch, and boundary-length cases.

## Knowledge checks with answers

1. **When is two-row DP valid?** When each new row depends only on the previous and current rows and only the final optimum value is needed, or reconstruction is handled separately.
2. **What is the time complexity of a constant-transition pair-prefix DP?** `O(nm)`.
3. **What does LIS tails preserve?** The minimum achievable tail value for each subsequence length, enough to determine the length but not necessarily the sequence.
4. **What is prefix-length `i`’s last consumed index?** `i-1`, provided `i>0`.
5. **Why compare against brute force only on short cases?** Exhaustive enumeration grows rapidly, but tiny cases can cover many transitions and reveal counterexamples inexpensively.
