# sequence and string dynamic programming — Interview questions and reasoning

# Core questions

1. How do you decide whether a sequence DP state should use a prefix, endpoint, or interval?
2. What is the difference between a subsequence and a substring, and how does it alter a recurrence?
3. Explain the two-prefix recurrence for Longest Common Subsequence.
4. How does the O(n log n) LIS tails method work, and what information does it not preserve?
5. How do you initialize edit-style and segmentation DP for empty prefixes?
6. Why can minimum ASCII Delete Sum differ from maximizing common-subsequence length?
7. Derive the `*` transition in the problem’s regular-expression matching DP.
8. When is rolling-row compression safe, and what does it make harder?

# Concise interview answers

1. Choose a state that captures exactly the information future transitions need: consumed prefixes for alignment/segmentation, ending positions for subsequences, or interval boundaries for palindromic structure.
2. A subsequence may skip positions but preserves order; a substring is contiguous. On mismatch, LCS can retain a best prior subsequence by skipping either side, while a common-substring state must reset/extend only from the diagonal.
3. For equal final characters, extend the diagonal by one. Otherwise take the maximum of skipping the final character from the left or right prefix. Empty-prefix states are zero.
4. Maintain the smallest tail value found for each increasing subsequence length. Replacing a tail with a smaller one leaves more room for future extension. The tails array is not generally the actual LIS; parent links or stored decisions are needed to reconstruct a witness.
5. Define precisely what a zero-length prefix means. For edit cost, the boundary accumulates deleting all characters; for Word Break, the empty prefix is reachable; for regex matching, an empty input can skip atom-star pairs.
6. Deletion has character-specific cost. The common subsequence with the most characters is not necessarily the one whose complementary characters have the smallest ASCII sum.
7. The zero-occurrence branch skips both atom and star (`dp[i,j-2]`). The one-or-more branch requires the atom to match the current character, consumes that character, and retains the star (`dp[i-1,j]`).
8. Keep only rows/columns that future transitions read. Compression saves memory but can remove history needed for reconstructing the chosen sequence or decisions; update direction must preserve dependencies.

# Deep follow-up answers

State definition and transition proof should precede code. For each recurrence, identify what the state asserts, prove each transition is sound, show every optimal solution falls into one transition case, and prove base states represent empty input correctly. Complexity should count both states and transition work; a table with `O(nm)` cells can still take more than `O(nm)` if each transition scans a long candidate string or dictionary.

For Word Break, reachable prefix boundaries form a DAG: an edge from `i` to `j` exists when `s[i..j)` is a dictionary word, and the question is reachability of `n` from 0. For weighted deletion, each alignment path pays the values of removed characters. For regex matching, `*` is not a standalone transition: it couples to its preceding atom and gives a zero-count edge plus a repeated-consumption edge. These different state interpretations explain why copying one recurrence across neighboring problems fails.

# Scenario questions

1. **A common substring solution returns a long match after a mismatch.** Check whether the recurrence improperly carries the maximum from a neighboring prefix; a contiguous match must extend only from a matching diagonal predecessor.
2. **An LIS tails array returns length 4 but cannot show which four values were chosen.** Explain that tails stores optimal minimum ending values by length, not all predecessor relationships; add parent/index tracking for reconstruction.
3. **A Word Break solution greedily chooses the longest prefix word and fails.** Replace greed with reachability over all viable boundaries; local longest choice need not participate in a full segmentation.
4. **Regex code returns true when only a prefix matched.** Confirm that the state and result require the full input and full pattern, not an unanchored search.
5. **A rolling-row solution gives wrong regex results after in-place updates.** Check whether values from the previous row were overwritten before the star/literal recurrence consumed them.

# Tradeoffs and alternatives

Use a full table first when it makes the state and proof visible. Compress to rolling rows after listing every dependency and deciding whether reconstruction is needed. LCS and edit-distance tables can reconstruct a witness by backtracking; if only a value is needed, two rows may suffice. LIS quadratic endpoint DP is simpler and can be preferable for small `n`; tails improves asymptotic time but requires extra logic to produce an actual sequence. Word Break can use a trie or a hash set with length bounds; choose based on dictionary size, maximum word length, and allocation costs. Regex DP is predictable `O(nm)` under the supplied tiny limits; memoized recursion is an alternative with the same state graph but different stack/runtime behavior.

# Common weak answers

- “A subsequence is just a substring with a different name.”
- “The LIS tails array is the LIS.”
- “A greedy word choice is optimal because it consumes more characters.”
- “The empty-prefix row is always all zeros.”
- “Regex star means any number of any characters.”
- “O(nm) space can always be dropped without affecting reconstruction or correctness.”
- “If the result passes examples, the state definition must be correct.”

# Self-check rubric

Score 0–2 for each: defines a precise state; derives boundary conditions; distinguishes contiguous and skippable sequences; covers every optimal transition; proves soundness and completeness; counts transition costs honestly; handles reconstruction/space compression; and tests adversarial cases. A strong answer explains what each table cell means in plain language before presenting code.

# Sources

- [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp)
- [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/)
- [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/)
- [Maximum Length of Repeated Subarray](https://leetcode.com/problems/maximum-length-of-repeated-subarray/)
- [Word Break](https://leetcode.com/problems/word-break/)
- [Minimum ASCII Delete Sum for Two Strings](https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/)
- [Regular Expression Matching](https://leetcode.com/problems/regular-expression-matching/)
