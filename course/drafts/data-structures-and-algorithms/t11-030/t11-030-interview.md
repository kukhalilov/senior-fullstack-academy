# sequence and string dynamic programming — Interview questions and reasoning

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf), [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/), [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/), [Word Break](https://leetcode.com/problems/word-break/), and [Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/).

## Core questions

1. How do you define a DP state so another engineer can verify its meaning?
2. Distinguish substring, subsequence, prefix, and interval.
3. Derive LCS recurrence and its base cases.
4. Why does common-substring DP reset on mismatch?
5. Compare LIS endpoint DP with the tails optimization.
6. Why is the LIS tails array not always a real subsequence?
7. How does edit distance model insertion, deletion, and replacement?
8. Why is the empty prefix reachable in Word Break?
9. How do interval states solve palindromic subsequence length?
10. When are rolling rows safe, and what do they lose?
11. How can you reconstruct one optimal alignment?
12. Explain regex `x*` versus wildcard `*`.
13. How would you validate a recurrence beyond the listed examples?
14. What risks arise from a large “infinity” sentinel in a minimum-cost DP?

## Concise interview answers

1. State the exact subproblem, index convention, value meaning, valid range, base cases, and how the requested answer is extracted.
2. A substring is contiguous; a subsequence preserves order with gaps allowed; a prefix is the initial segment; an interval is a bounded range, often inclusive or explicitly half-open.
3. For prefix lengths `i,j`, equal final characters extend the diagonal by one; otherwise take the max of skipping either final character. Empty-prefix row and column are zero.
4. The state represents a contiguous matching suffix; a mismatch breaks that suffix, so its length becomes zero.
5. Endpoint DP uses `O(n²)` time and records a best sequence ending at each index. Tails uses `O(n log n)` time and keeps the smallest tail for each length.
6. Each tail is a minimum achievable endpoint for some subsequence of its length; different entries may come from incompatible index histories. Track predecessors to reconstruct an actual sequence.
7. A pair-of-prefix state takes the minimum among insertion, deletion, and match/replace predecessors, with empty-prefix costs initialized to insertion/deletion counts.
8. It is the valid starting boundary before the first word, allowing a word beginning at index zero to extend reachability.
9. For inclusive `[l,r]`, matching endpoints add two to the inner interval; otherwise choose the better result after dropping either endpoint. Singletons have length one.
10. Rolling rows are safe when transitions need only the previous/current row and only the optimum value is needed. They discard old scores and usually traceback choices.
11. Store a predecessor choice per state or walk backward through neighbors that preserve the optimal score; collect matches/actions in reverse and then reverse them.
12. Regex `x*` repeats the preceding token `x` zero or more times. Glob `*` commonly matches any sequence; they have different grammars and DP transitions.
13. State the invariant, test boundary cases, and compare against brute force on exhaustive short inputs over a small alphabet.
14. Adding to a maximum sentinel can overflow and create an invalid low cost; guard unreachable states or use a safe wider representation.

## Deep follow-up answers

### How do you derive a recurrence instead of memorizing one?

First define the set of partial solutions represented by the state. Then inspect an optimal solution’s final decision: its last chosen element, match, word, operation, or partition boundary. Enumerate the legal predecessor states that cover every possible final decision, combine them using the objective operator (max, min, sum, or Boolean logic), and prove both directions: every transition constructs a valid solution, and every optimum appears in a transition. Finally identify a topological evaluation order for those dependencies.

### Why does the word “prefix” reduce off-by-one errors?

Prefix length `i` means characters `[0,i)` have been consumed. The empty prefix is 0, and the full input is length `n`. A transition that ends at `i` can use the last character at `i-1`, while substrings use a half-open range `[j,i)`. This separates state coordinates from array indices.

### What is required to safely compress a DP table?

List exactly which prior states each transition reads and which outputs are required. Then prove an iteration order where every needed value is still present. For a two-string recurrence, rolling rows retain the previous row and partially built current row. If reconstruction is requested, either keep choices, use a divide-and-conquer reconstruction such as Hirschberg for LCS, or recompute selected subproblems. An optimization must preserve the required output, not only a score.

### How do you distinguish a flawed recurrence from an indexing bug?

Test the invariant on tiny inputs where all solutions can be enumerated. Include empty/single-character generalized cases, duplicates, all matches, no matches, and a case where the best answer ends before the final index. Print or inspect each small state and compare it with brute force. If the state meaning is correct but code disagrees, inspect index conversion and iteration order; if the transition itself omits a valid final choice, revise the recurrence proof.

## Scenario questions

1. An LCS implementation returns the right length but its reconstruction skips a matching character. How do you debug the traceback?
2. A common-substring solution returns 4 for strings whose matching characters have a gap. What recurrence error is likely?
3. LIS code appends every duplicate and overestimates strictly increasing length. Which binary-search boundary is wrong?
4. A Word Break solution rejects every string. Which base state should be checked first?
5. A rolling-row solution passes all length tests but cannot produce the sequence. Why is this expected, and what are two fixes?
6. A minimum-cost DP returns a negative result for an impossible state. How can sentinel arithmetic cause this?
7. A regex DP accepts a prefix but should reject the whole string. Which final-state contract should be verified?
8. A team uses wildcard matching transitions for regex. Give a counterexample showing the semantic mismatch.

## Tradeoffs and alternatives

- **Full table vs rolling rows:** easier traceback and debugging versus lower memory with less history.
- **Quadratic LIS vs tails:** simpler transparent recurrence versus faster compressed invariant; choose based on constraints and output requirements.
- **Center expansion vs palindrome table:** constant extra memory and simple counting/longest substring versus reusable range answers.
- **Hash-set Word Break vs trie:** simple expected dictionary lookup with substring cost versus prefix traversal that can reduce repeated allocation and comparisons.
- **Top-down memoization vs bottom-up tabulation:** demand-driven states and natural recurrence expression versus explicit evaluation order and often lower call overhead/stack risk.
- **DP vs greedy:** DP represents alternatives when local choices can block a global optimum; prove a greedy exchange argument before replacing it.

## Common weak answers

- “Use DP because the problem looks similar” without naming the state invariant.
- Writing a recurrence before defining whether indices are prefix lengths or elements.
- Confusing contiguous substrings with subsequences.
- Returning the final endpoint state when the optimum can end earlier.
- Claiming rolling arrays reconstruct a path automatically.
- Describing LIS tails as the selected subsequence.
- Ignoring empty-prefix bases or impossible states.
- Giving complexity based on input length while omitting both dimensions of pair-state DP.
- Saying regex `*` and glob `*` mean the same thing.
- Increasing memory/time limits rather than proving correctness and analyzing constraints.

## Self-check rubric

Score each answer 0–2: **0** states a memorized formula only; **1** defines the state and main transition; **2** also proves transition coverage, handles boundaries, gives complexity, and explains reconstruction/tradeoffs when relevant. For a coding problem, you should be able to explain the invariant before showing code and demonstrate a tiny dry run without relying on the implementation’s variable names.
