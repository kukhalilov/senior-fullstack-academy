# sequence and string dynamic programming — Reference: Subsequence and alignment states

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf), [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/), and [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/).

## Scope and version

These are general sequence-DP recurrences, not APIs tied to a runtime. Problem statements linked here were checked November 16, 2026. This group defines the fixed inventory of endpoint, prefix-pair, and alignment concepts; it does not claim every possible DP state can be listed for every problem.

## How this group fits the mental model

Subsequence algorithms preserve order but allow gaps. A state may end at one element, cover a prefix, or align two prefixes. Its wording determines whether a transition can skip one sequence, match both, or extend an earlier endpoint. Use prefix lengths for two sequences so zero cleanly means an empty prefix.

## Supplied names explained

- `Longest increasing subsequence endpoint state` — Define `dp[i]` as the longest strictly increasing subsequence ending exactly at index `i`. This local state is not yet the answer for the whole array.
- `LIS O(n²) recurrence` — Initialize each endpoint to 1, then for every `j<i` with `a[j]<a[i]`, set `dp[i]=max(dp[i],dp[j]+1)`. The answer is `max(dp)`, with `O(n²)` time and `O(n)` memory.
- `LIS tails array optimization` — Maintain the smallest possible tail value for each subsequence length and binary-search the first tail `>= x` for strict LIS. It yields length in `O(n log n)`; tails do not themselves necessarily form an actual subsequence.
- `Longest common subsequence two-prefix state` — Let `dp[i][j]` be LCS length for prefixes of lengths `i,j`. The answer is `dp[n][m]`; empty-prefix row/column are zero.
- `Match-character transition` — When the final characters of the two prefixes match, an LCS may append that shared character to `dp[i-1][j-1]`, giving `+1`. This is the match case of the standard recurrence.
- `Skip-left transition` — `dp[i-1][j]` represents ignoring the last character from the first sequence. It is a candidate when the terminal characters differ; matching characters can still be handled by the diagonal transition.
- `Skip-right transition` — `dp[i][j-1]` represents ignoring the last character from the second sequence. On mismatch, LCS takes the maximum of this and skip-left.
- `Subsequence reconstruction` — Walk backward from the final prefix pair: collect matching characters on a diagonal match, otherwise move to a predecessor preserving the current score. Reverse collected characters. Tie choices may produce different valid optimal answers.
- `Edit distance prefix-pair state` — `dp[i][j]` is minimum edits to transform the first `i` source characters into the first `j` target characters. Empty-prefix boundaries cost `i` deletions and `j` insertions.
- `Insert/delete/replace transitions` — The final operation considers insertion from `dp[i][j-1]+1`, deletion from `dp[i-1][j]+1`, and match/replace from `dp[i-1][j-1]` plus zero/one according to character equality. Take the minimum; verify source/target direction in implementation.

## Cross-item comparison

| Method | State keeps | Complexity | Reconstructs by default? |
|---|---|---:|---|
| LIS endpoint DP | Best length for each exact ending position | `O(n²)` time, `O(n)` space | No; store predecessors |
| LIS tails | Minimum tail for each achievable length | `O(n log n)` time, `O(n)` space | No; track tail indices/predecessors |
| LCS full table | Best score for every pair of prefixes | `O(nm)` time and space | Yes, by backtracking |
| LCS rolling rows | Scores for adjacent prefix rows | `O(nm)` time, `O(min(n,m))` space | Not without extra strategy/data |

The LCS “skip” transitions are legal because a subsequence may omit a character. They are not valid for a longest common substring state, where mismatch resets a contiguous suffix run.

## Examples

For `[10,9,2,5,3,7,101,18]`, LIS tails evolve in sorted minimal-end values; the resulting length is 4, although the tails array’s intermediate values are not a claim that each update chose a single consistent subsequence. For LCS of `"abcde"` and `"ace"`, matching `a`, `c`, and `e` yields length 3. For edit distance, transforming `"horse"` into `"ros"` uses a prefix-pair minimum over insert/delete/replace choices; transposing source and target preserves the usual unit-cost distance, but not necessarily if operation costs are asymmetric.

## Common mistakes

- Returning the last LIS endpoint state instead of the maximum over all endpoints.
- Using `<=` when strict increase requires `<`, or using the wrong binary-search bound in tails.
- Claiming the tails array is the actual increasing subsequence.
- Forgetting LCS zero-prefix row/column or using character indices where prefix lengths are expected.
- Taking both skip transitions unconditionally on a matching character without a proof; the standard recurrence uses the diagonal match case.
- Reconstructing by arbitrary predecessor movement that changes the score or omits a chosen match.
- Reversing insert and delete meaning when defining edit distance direction.
- Applying LCS skip recurrence to substring matching.

## Knowledge checks with answers

1. **What does LIS endpoint state mean?** The best strictly increasing subsequence whose final element is exactly at that index.
2. **Why are tails minimal?** A smaller tail leaves at least as many future values able to extend a sequence of that length.
3. **Can the tails values always be returned as an LIS?** No. Store predecessor and index information if an actual sequence is required.
4. **What does an empty-prefix edit-distance base mean?** Deleting all source characters costs `i`; inserting all target characters costs `j`.
5. **Why are two skip choices needed in LCS?** An optimal alignment on mismatch may omit the last character from either side.
