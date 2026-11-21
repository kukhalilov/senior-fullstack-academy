# sequence and string dynamic programming — Big-picture orientation and mental model

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf), [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/), and [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/).

## Problem and purpose

Dynamic programming (DP) solves a problem by defining smaller states, relating them with transitions, and reusing results instead of recomputing the same subproblems. Sequence and string problems often ask for a longest match, minimum edit cost, number of valid segments, or whether a prefix can be constructed.

The main difficulty is modeling: decide exactly what a state means, which earlier states can lead to it, and what the boundary states mean. A recurrence that sounds plausible can solve a different problem if it confuses a contiguous substring with a subsequence that may skip characters.

## Plain-language mental model

Imagine examining two strings one character at a time. At each point, ask what is the best answer for the prefixes already seen. For longest common subsequence, keep one prefix position from each string: equal final characters extend a shared sequence; otherwise skip one side and retain the better result. For word segmentation, mark each prefix as reachable if some dictionary word ends there and begins at an already reachable prefix.

The table is not the algorithm’s meaning; the state definition is. A row/column is just a way to store the answers. Once state and transitions are correct, an evaluation order ensures prerequisites are ready before each state is computed.

## How the parts fit together

1. Choose a state whose value answers a smaller version of the question: a prefix, an ending index, a pair of prefixes, or an interval `[left,right]`.
2. Write a plain-language invariant, such as “`dp[i]` is the length of the longest strictly increasing subsequence ending exactly at index `i`.”
3. Derive transitions by considering the final choice: match or skip a character, extend a previous increasing sequence, delete a character, or split before a dictionary word.
4. Define base states for empty prefixes, single characters, impossible states, and valid zero-length results.
5. Choose an iteration order consistent with dependencies. A prefix-pair table usually grows from smaller prefixes; an interval table usually grows by interval length.
6. Read the requested answer from the correct state or aggregate. A state that ends exactly at `i` often needs a maximum over all `i`.
7. Optimize memory only after validating the full recurrence. Rolling rows preserve a length/cost but can discard information needed to reconstruct a solution.

## Concept map

| Shape of question | Typical state | Key distinction |
|---|---|---|
| Best subsequence ending here | One index or prefix | May skip between chosen elements |
| Best alignment of two sequences | Pair of prefix lengths | Match, skip left, skip right |
| Best common contiguous run | Pair of ending positions | Mismatch resets to zero |
| Best palindrome inside a range | `[left,right]` interval | Endpoints and interval length govern recurrence |
| Can a prefix be formed? | Reachable prefix | Try every valid final word boundary |
| Minimum transformation cost | Pair of prefixes plus cost | Insert/delete/replace costs and empty-prefix bases |

LIS’s `O(n log n)` tails method is an optimization with a different stored invariant: for each length it keeps the smallest possible tail value. It does not store the actual best subsequence for every endpoint. That distinction explains why predecessor data is needed to reconstruct a sequence.

## End-to-end walkthrough

For `text1 = "abcde"` and `text2 = "ace"`, define `dp[i][j]` as the LCS length of the first `i` and first `j` characters. Empty prefixes have answer zero. If the last characters match, add one to the state for both shorter prefixes. Otherwise take the better of skipping the last character from the first or second prefix. The bottom-right state is 3, corresponding to `"ace"`.

Now compare longest common substring. It also compares two strings, but characters must be adjacent. If the last characters match, extend the diagonal; if they differ, the state ending at that pair is zero. Taking the maximum over the table finds the longest contiguous run. Reusing LCS’s skip recurrence would silently change the problem.

## When to use it and tradeoffs

Use DP when the problem has a manageable set of states, each can be computed from previously solved states, and the same subproblems recur. A full two-string table often costs `O(nm)` time and memory. Rolling rows can reduce memory to `O(min(n,m))` when only the optimal value is needed. For a single sequence, quadratic endpoint DP may be clearer; a specialized `O(n log n)` method can improve time when its invariant matches the requirement.

DP is not automatically better than greedy, graph search, or a direct data structure. A large state space can be too slow or memory-heavy. A compressed recurrence may complicate reconstruction. First prove the state and transition; optimize only against real constraints.

## What later lessons cover

The concepts lesson derives common state shapes and boundary rules. Reference lessons explain subsequence/alignment, contiguous and interval recurrences, segmentation/cost, and memory/reconstruction. Practice includes LCS, LIS, repeated subarray, palindrome counting and subsequence, word break, ASCII delete sum, and regular-expression matching. The interview lesson focuses on choosing and defending a state, recurrence, complexity, and reconstruction strategy.
