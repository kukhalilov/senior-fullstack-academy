# sequence and string dynamic programming — Reference: Subsequence and alignment states

## Scope and version

This lesson covers the exact states and transitions listed below for classic sequence DP. The mathematics is language-independent; indexing examples use zero-based arrays and prefix lengths. Problem-specific constraints belong to their practice lessons. Source: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp).

## How this group fits the mental model

Endpoint states answer a question constrained to finish at one item. Prefix-pair states answer a question over two prefixes. Both reduce the original problem to smaller answers, but their state meanings dictate distinct transitions. A reconstruction step is a second pass that follows choices after the optimum value is known.

## Supplied names explained

- **Longest increasing subsequence endpoint state** — `dp[i]` is the longest strictly increasing subsequence that ends at `i`. Requiring the endpoint prevents losing the information needed to test whether a later value can extend this candidate.
- **LIS O(n²) recurrence** — Initialize every endpoint to one. For each `j < i` with `a[j] < a[i]`, consider `dp[j] + 1`; retain the largest. The final answer is `max(dp)`, with empty input handled separately if the surrounding problem permits it.
- **LIS tails array optimization** — Maintain `tails[k]` as the smallest tail value found for a subsequence of length `k+1`. For strict increase, replace the first tail `>= x`, or append if none exists. Its length is the LIS length. Replacements improve future extension potential; they do not assert that `tails` itself is a subsequence.
- **Longest common subsequence two-prefix state** — `dp[i,j]` is the LCS length of prefixes of lengths `i` and `j`. Empty prefixes give zero, enabling uniform loops from one through each input length.
- **Match-character transition** — If the two final prefix characters are equal, pairing them gives `dp[i-1,j-1] + 1`. For LCS, an optimal common subsequence can include this matching pair; the recurrence can be proved by the standard prefix decomposition.
- **Skip-left transition** — `dp[i-1,j]` ignores the final character of the first prefix. It is one candidate when final characters differ.
- **Skip-right transition** — `dp[i,j-1]` ignores the final character of the second prefix. When final characters differ, the optimum is the larger of the two skip candidates.
- **Subsequence reconstruction** — Starting from `(n,m)`, move diagonally and emit a character when equal characters take the match transition; otherwise move to a predecessor that preserves the current optimum. Reverse emitted characters. On ties, either valid optimal predecessor may be chosen.
- **Edit distance prefix-pair state** — `dp[i,j]` is the minimum number of insertions, deletions, and replacements to transform the first `i` characters into the first `j`. Empty-prefix costs are `i` and `j`; equal final characters inherit the diagonal, while unequal ones add one to the minimum delete, insert, or replace predecessor.
- **Insert/delete/replace transitions** — Delete the last source character from `dp[i-1,j]`; insert the last target character from `dp[i,j-1]`; replace source final with target final from `dp[i-1,j-1]`. Each unequal-character operation contributes one. Do not confuse this unit-count cost with ASCII-weighted deletion cost.

## Cross-item comparison

The quadratic LIS recurrence explicitly tracks each ending position and runs in `O(n²)`. The tails optimization runs in `O(n log n)` by summarizing extension potential; it cannot directly return the path without predecessor metadata. LCS and edit distance both use prefix pairs and `O(nm)` cells, but LCS maximizes retained matches whereas edit distance minimizes operations. LCS reconstruction records matched characters; edit reconstruction records operations.

## Examples

For `[3,1,2]`, endpoint LIS values are `[1,1,2]`; the result is 2. The tails method evolves from `[3]` to `[1]` to `[1,2]`, also yielding 2. For prefixes `"ab"` and `"ac"`, their LCS is `"a"` of length 1. An edit alignment can instead replace `b` with `c` at cost 1.

## Common mistakes

- Using `<=` in a strictly increasing LIS recurrence or tails binary search.
- Returning a random LCS string without following predecessor choices.
- Claiming the tails values form the LIS.
- Forgetting empty-prefix costs in edit distance.
- Treating deletion cost by character value as the same problem as a unit-cost edit operation.

## Knowledge checks with answers

1. **Why maximize over all LIS endpoint states?** The optimal sequence has some final index, not necessarily the last input index.
2. **What is the LCS base row?** Zero for every second-prefix length when the first prefix is empty; likewise the base column.
3. **What does an edit transition cost?** One for a selected insertion, deletion, or replacement; a matching final character costs zero.
