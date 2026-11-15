# sequence and string dynamic programming — Big-picture orientation and mental model

## Problem and purpose

Dynamic programming (DP) is useful when a problem asks for an optimum, a count, or whether a construction is possible, and many candidate solutions share smaller subproblems. Sequence and string DP makes those smaller problems precise by describing prefixes, ending positions, or intervals.

The state-and-transition approach is summarized in the [USACO Guide DP introduction](https://usaco.guide/gold/intro-dp).

Typical questions include: how long can two strings agree in order, what is the longest increasing subsequence, can a string be split into dictionary words, and what is the minimum cost to make two strings equal by deletions? The goal is not to memorize a table shape. It is to decide what a table cell promises and which smaller promises are enough to derive it.

## Plain-language mental model

Imagine reading two strings from left to right. At each pair of positions, ask a small question such as “what is the best answer using these prefixes?” Once that answer is known, a later answer can reuse it. A DP state is a carefully worded question; a transition is a reason one or more smaller answers determine the current one.

For a single sequence, a state might describe the best increasing subsequence that must end at position `i`. For two sequences, it might describe prefixes of lengths `i` and `j`. For a contiguous range, it might describe characters from `left` through `right`. These meanings are different, so their recurrences are different too.

## How the parts fit together

First identify whether order alone matters or whether contiguity is required. A subsequence can skip positions while preserving order; a substring cannot skip. Then choose a state whose value directly answers a smaller version of the question. Write the boundary values for empty prefixes or one-character ranges. Derive transitions from the final character or endpoints. Finally choose a safe evaluation order, prove that every dependency is already available, and decide whether previous values can be discarded.

This yields a reusable workflow: model the state, establish base cases, derive transitions, evaluate in dependency order, read the requested cell or aggregate, then check complexity and reconstruction needs.

## Concept map

| Question shape | Typical state | Representative pattern |
|---|---|---|
| Best subsequence ending at one item | endpoint index | LIS quadratic recurrence |
| Best result for two prefixes | `(i, j)` prefix lengths | LCS, edit cost, regular-expression matching |
| Whether a prefix can be built | prefix length / boundary | Word Break |
| Best result on a contiguous range | `[left, right]` | palindromic subsequence |
| Count or optimum over many local matches | state plus global aggregate | palindromic substrings, repeated subarray |

These are families, not interchangeable templates. The state definition determines the meaning of every base case and transition.

## End-to-end walkthrough

For `LCS("abcde", "ace")`, let `dp[i,j]` be the longest common subsequence length among the first `i` and first `j` characters. Empty prefixes have answer zero. Matching final characters extend the diagonal result by one; otherwise an optimum must skip the final character from one side, so take the better of the upper and left cells. Filling the table gives 3 (`ace`). The two strings are not required to match contiguously.

Compare `Maximum Length of Repeated Subarray`: here a match must be contiguous. A matching pair extends only the previous diagonal run; a mismatch resets that cell to zero. The answer is the largest cell, not the bottom-right cell. This single modeling change—from “best subsequence in prefixes” to “matching run ending here”—changes the recurrence and the answer extraction.

## When to use it and tradeoffs

Use a prefix-pair table when two prefixes interact, an endpoint table when the ending item is part of the state, an interval table when the endpoints govern a range, and a reachable-prefix table for segmentation. These choices often produce polynomial time from an exponential search because equivalent smaller questions are solved once.

Tables are easy to reason about and reconstruct from but may consume quadratic memory. Rolling rows can reduce memory when only adjacent rows are needed; they usually discard the history required to reconstruct an answer unless extra decisions are stored. Faster variants such as LIS tails improve asymptotic time but summarize a different property than the full DP states, so they require a separate correctness argument.

## What later lessons cover

The concepts lesson derives state and boundary choices. Reference lessons compare subsequence and alignment states, substring and interval recurrences, segmentation and transformation costs, then space compression and reconstruction. Practice lessons develop LCS, LIS, repeated subarray, palindrome counting and optimization, Word Break, minimum ASCII deletion cost, and the restricted regular-expression matcher. Each practice specifies its own constraints and proof.
