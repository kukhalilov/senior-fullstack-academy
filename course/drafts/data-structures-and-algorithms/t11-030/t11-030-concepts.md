# sequence and string dynamic programming — Core concepts and how they fit together

## Learning objectives

By the end, you should be able to define a sequence-DP state in one sentence, derive its base cases and transitions, distinguish subsequences from substrings, select an evaluation order, explain when row compression is safe, and estimate time and memory from the state dimensions.

## Prerequisites

You should be comfortable with arrays and strings, indices, loops, recurrence relations, and basic asymptotic analysis. A prefix length is a count, while a string index is zero-based: prefix length `i` contains positions `0` through `i-1`.

For a general treatment of state definition and recurrence design, see the [USACO Guide DP introduction](https://usaco.guide/gold/intro-dp).

## Core concepts

**State meaning comes first.** “`dp[i]`” is incomplete. “`dp[i]` is the length of the longest strictly increasing subsequence that ends exactly at index `i`” is precise. Because it must end at `i`, every earlier compatible endpoint `j` can extend it only when `a[j] < a[i]`. The global LIS is the maximum over all endpoint states.

For two strings, prefix-length states avoid negative indices: `dp[i,j]` can describe prefixes of lengths `i` and `j`, and row zero or column zero naturally represents an empty prefix. For ranges, `[left,right]` names inclusive endpoints; short ranges require explicit base cases so expressions such as the inner interval of a two-character range do not access invalid cells.

**Subsequence and substring are distinct.** A subsequence preserves relative order and may omit positions. A substring is contiguous. In `abcde`, `ace` is a subsequence but not a substring. LCS may skip; longest common substring must restart a matching run at each mismatch.

## Mechanisms and relationships

Derive each transition by considering the last choice. For LCS, equal final characters can be paired; unequal final characters mean at least one final character is unused, so compare the two skip choices. For edit-like costs, the last operation may delete from the first string, delete from the second, or match equal characters. For Word Break, the last word starts at some earlier reachable boundary and ends at the current boundary.

The recurrence also implies a dependency graph. Prefix states usually depend on smaller prefix lengths; interval states often depend on shorter intervals; endpoint LIS states depend on earlier indices. Evaluate in an order that visits dependencies first. If a cell depends only on the preceding row, a rolling row can suffice for the value. If the transition needs the previous diagonal and the same row, update direction matters. If reconstruction is required, keep a table or record predecessor decisions.

LIS illustrates a useful distinction: the quadratic endpoint DP stores the best length for each required endpoint. The `O(n log n)` tails method instead stores, for each length, the smallest possible ending value among examined subsequences of that length. For strictly increasing subsequences, binary search finds the first tail greater than or equal to the new value. The tails array is a summary, not necessarily an actual subsequence.

## Worked examples

For `s="ab"`, `t="ba"`, an LCS has length 1: either `a` or `b`. A substring shared by both has length 1 as well, but for `s="abcde"`, `t="ace"`, LCS length is 3 while the longest common substring is only 1. That counterexample shows why a contiguous-match state cannot use the LCS skip recurrence.

For `Word Break("cars", ["car", "s"])`, mark boundary zero reachable. The word `car` makes boundary three reachable; then `s` makes boundary four reachable. A match from an unreachable boundary would not form a valid segmentation.

## Misconceptions and edge cases

- A DP table is not defined by its dimensions; state meaning defines it.
- Equal characters do not imply a global greedy match is safe. Other state choices may yield a better result.
- LIS is strictly increasing in the assigned problem; equality cannot extend it.
- A substring mismatch resets a contiguous run; it does not inherit an optimum from a neighboring cell.
- Empty-prefix initialization matters for transformations and pattern matching.
- Rolling storage preserves values only if iteration order respects the old values still needed.
- Reconstructing one optimal answer differs from computing its length. Tie choices may produce different valid answers.
- “ASCII sum” is unambiguous in the assigned lowercase-English constraints; for general Unicode text, a problem must define the cost unit explicitly.

## Knowledge checks with answers

1. **Can a subsequence skip characters?** Yes, while preserving order; a substring must be contiguous.
2. **Why is the LIS endpoint answer the maximum table entry?** The optimal increasing subsequence can end at any index, and each state requires ending exactly there.
3. **What does the tails array store?** The minimum achievable ending value for each subsequence length, not necessarily the elements of one final LIS.
4. **When may a two-dimensional DP be compressed?** When its transition needs only retained rows/cells and the update order preserves the previous values; reconstruction may still require extra storage.
