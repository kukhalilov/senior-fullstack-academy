# sequence and string dynamic programming — Core concepts and how they fit together

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf), [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/), and [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/).

## Learning objectives

Define prefix, endpoint, pair-of-prefix, interval, and reachability states; derive recurrences from final choices; distinguish substring from subsequence; initialize empty inputs and impossible states correctly; analyze time and memory; and determine when rolling arrays or predecessor choices preserve enough information.

## Prerequisites

Know arrays, strings, loops, asymptotic complexity, and basic recurrence reasoning. A subsequence retains relative order but can omit elements. A substring is a contiguous range. A prefix contains the first zero or more elements of a sequence.

## Core concepts

### State is a precise contract

Before writing code, say what every `dp` entry means, including its indices and whether the index denotes a count or an element position. For example, `dp[i]` may mean “best increasing subsequence ending exactly at element `i`,” while `dp[i]` may instead mean “whether the prefix of length `i` can be segmented.” Same notation, different contract; transitions and result extraction must follow the chosen meaning.

For two strings, prefix lengths `i` and `j` range from zero through their lengths. This avoids special negative indices. `dp[0][j] = dp[i][0] = 0` naturally represents an empty side for LCS. For edit costs, empty prefixes have nonzero costs because converting a nonempty string to empty requires deletions.

### Transitions follow the final decision

Ask what the final element/character of an optimal solution does. For LCS, equal terminal characters can be matched; otherwise an optimal alignment skips at least one terminal character. For LIS ending at `i`, choose a prior `j < i` with `nums[j] < nums[i]`, or start a sequence of length one. For Word Break at prefix length `i`, choose a dictionary word whose suffix ends at `i` and whose starting prefix is reachable.

The recurrence must represent all legal choices without adding illegal ones. Use max for longest objectives, min for costs, sum for counts, and Boolean OR/AND for existence/constraints. These operators express the objective; they do not repair a wrong state.

### State shape follows adjacency rules

Subsequence transitions can jump across skipped elements. A contiguous substring cannot skip: a mismatch breaks a matching run, so its ending-state resets. Palindromic substring enumeration expands around centers or uses a boolean interval table. Longest palindromic subsequence can discard one endpoint because skipped characters are allowed; its interval recurrence is different.

An interval state `[left,right]` shrinks to smaller intervals. Empty/single-character intervals often form the bases. A loop by increasing interval length ensures the needed shorter intervals have already been computed.

### Evaluation order and answer extraction

The dependency graph of states determines loop order. For a prefix-pair table, compute shorter prefixes before longer ones. For a left-to-right reachable-prefix array, transitions should move from a known earlier prefix to a later boundary. For LIS endpoint DP, every `j < i` is already available when `i` is evaluated.

Do not assume the answer is the last state. LIS endpoint states answer “ending here,” so the final answer is the maximum across endpoints. Palindromic substring states may need a count or maximum across all centers/ranges. Prefix states often do use `dp[n]`, because that state explicitly covers the full input.

### Complexity and memory

A pair-of-prefix recurrence usually visits `O(nm)` states. Each constant-choice transition gives `O(nm)` time and full-table memory. If row `i` depends only on row `i-1` and the current row, two rolling rows preserve the value in `O(min(n,m))` memory. But traceback to output an actual alignment needs choices or another reconstruction strategy. An optimization must retain exactly the data required by the output contract.

LIS’s tails method has `O(n log n)` time using binary search. `tails[k]` is the smallest tail value known for an increasing subsequence of length `k+1`; tails are not necessarily a subsequence themselves. Strictly increasing uses a lower-bound search for the first tail greater than or equal to the current value. Nondecreasing would use a different bound.

## Mechanisms and relationships

For LCS, let `dp[i][j]` be the best subsequence length over prefixes of lengths `i,j`. If terminal characters match, `dp[i][j] = dp[i-1][j-1] + 1`; otherwise it is `max(dp[i-1][j], dp[i][j-1])`. Reconstruction walks backward: on a match append the character and move diagonally; otherwise move to a predecessor with the same score. Reverse the collected sequence at the end. Ties can yield different but equally optimal answers.

For edit distance, each last operation has a predecessor: insert aligns the current source prefix with a shorter target prefix, delete shortens the source, and replace/match shortens both. The empty-prefix bases cost the number of inserted/deleted characters. Be explicit about whether an operation consumes a character from source, target, or both; reversing indices is a common bug.

For interval palindrome DP, define the meaning carefully. A boolean `palindrome[l,r]` is true when endpoints match and the inner range is a palindrome (with short-range bases). A length objective such as longest palindromic subsequence takes the inner answer plus two when endpoints match, otherwise the maximum after discarding either endpoint. These are related interval patterns, not interchangeable recurrences.

## Worked examples

**LIS endpoint DP:** For `[3,1,2,5]`, initialize each endpoint to 1. At index 2 (value 2), only previous value 1 is smaller, so its state is 2. At index 3 (value 5), the best prior state has length 2, producing 3. The answer is the largest endpoint state, 3 (`[1,2,5]`).

**Common substring:** For prefixes ending in a mismatch, the common contiguous run ending at those positions is zero, even if earlier prefixes shared characters. For `[1,2,3]` and `[9,2,3]`, matching 2 and 3 extends a run of length 2; it cannot skip mismatching positions as LCS can.

**Word Break:** Let `reachable[i]` mean the prefix of length `i` can be segmented. Set `reachable[0]=true`. For each reachable `j`, if `s[j..i)` is a dictionary word, mark `reachable[i]`. The empty prefix is a necessary true base; otherwise no first word can ever be accepted.

## Misconceptions and edge cases

- A “subsequence” need not be contiguous; a “substring” must be contiguous.
- LCS and longest common substring have different mismatch transitions.
- `tails` in LIS is not the exact sequence selected by the algorithm.
- Strict vs nondecreasing order changes comparisons and binary-search bound.
- An impossible prefix must not be confused with a valid zero-cost/zero-length state.
- Prefix length `i` covers indices `[0,i)`; element index `i` is the next character, not the last one in that prefix.
- Empty strings can be valid inputs for general algorithms even if a platform problem constrains length to at least one; state the actual input contract.
- Rolling rows can compute the optimum value while losing the path or subsequence itself.
- Greedy matching equal characters is not always enough to solve LCS globally; the recurrence compares both skip choices.
- A regular-expression `*` applies to the preceding token and allows zero repetitions; it is not a standalone wildcard token.

## Knowledge checks with answers

1. **What should a DP state explanation contain?** Its indexed subproblem, exact meaning, domain/base states, and how it contributes to the requested output.
2. **Why does common-substring DP reset on mismatch?** The matching run must be contiguous; any mismatch breaks the suffix run ending at those positions.
3. **Why is LIS answer not necessarily `dp[n-1]`?** An increasing subsequence can end before the final array element; aggregate the endpoint states.
4. **What information do rolling rows discard?** Older table entries and usually the predecessor path needed to reconstruct an optimal alignment.
5. **How is strict LIS encoded in tails?** Replace the first tail greater than or equal to the new value; for nondecreasing variants the bound changes.
6. **Why is `reachable[0]` true in Word Break?** It represents a valid segmentation of the empty prefix and enables a dictionary word to start at index zero.
