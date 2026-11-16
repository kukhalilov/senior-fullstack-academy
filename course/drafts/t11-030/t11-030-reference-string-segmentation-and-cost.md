<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Reference: Segmentation and string transformation

*Automatically generated draft.*

# Scope and version
This lesson covers the "Segmentation and string transformation" group of dynamic programming (DP) techniques. These concepts are timeless and apply to canonical string-based DP problems. This content is based on the USACO Guide and Competitive Programmer's Handbook (checked 2026-11-16).

# How this group fits the mental model
In sequence DP, we solve complex problems by breaking them into smaller, overlapping subproblems. This specific group focuses on two patterns:
1. **Segmentation:** Determining if a string can be partitioned into valid units (like dictionary words or palindromes).
2. **Transformation:** Calculating the minimum cost or validity of transforming one string into another (like edit distance or pattern matching).

These states represent the "progress" made through a string, where each state depends on whether previous prefixes were successfully segmented or transformed.

# Supplied names explained

* `Word break prefix reachability`: A boolean state representing whether the prefix of a string ending at index `i` can be segmented into valid words from a dictionary.
* `Dictionary word boundary transition`: The logic used to update the reachability state; if `dp[j]` is true and the substring from `j` to `i` is in the dictionary, then `dp[i]` becomes true.
* `Minimum palindrome cuts`: A DP state representing the fewest number of cuts needed to partition a string such that every resulting segment is a palindrome.
* `Regular-expression matching state`: A 2D DP state `dp[i][j]` indicating if the prefix of a string `s[0...i-1]` matches the prefix of a pattern `p[0...j-1]`, accounting for special characters like `*` or `.`.
* `Wildcard matching state`: A specialized 2D DP state similar to regex matching, but restricted to simpler wildcards like `?` (any single character) and `*` (any sequence of characters).
* `Edit operation cost`: The numerical value assigned to an insertion, deletion, or substitution when calculating the minimum distance between two strings.
* `Impossible-prefix state`: A sentinel value (often infinity or a specific boolean flag) used to indicate that a specific prefix cannot be formed or matched under given constraints.
* `Empty-string initialization`: The base case for DP tables where the state for an empty string (length 0) is set to a known value (e.g., `true` for reachability or `0` for cost) to allow transitions to build upon it.

# Cross-item comparison

* **Segmentation vs. Transformation:** `Word break prefix reachability` and `Minimum palindrome cuts` are segmentation problems where we partition a single string. `Regular-expression matching state`, `Wildcard matching state`, and `Edit operation cost` are transformation problems where we compare two strings or a string against a pattern.
* **State Values:** `Word break prefix reachability` and `Regular-expression matching state` typically store boolean values (possible/impossible), whereas `Minimum palindrome cuts` and `Edit operation cost` store integer values (the minimum count or cost).
* **Initialization:** `Empty-string initialization` is a prerequisite for all these states, as every DP table must define the starting point (the empty prefix) before calculating transitions.

# Examples

**Example: Word Break**
To determine if "leetcode" can be segmented using `["leet", "code"]`:
1. `Empty-string initialization`: `dp[0] = true`.
2. `Dictionary word boundary transition`: Check if `dp[0]` is true and "leet" is in the dictionary. Since it is, `dp[4] = true`.
3. Continue: Check if `dp[4]` is true and "code" is in the dictionary. Since it is, `dp[8] = true`.
4. Result: `dp[8]` is true, so the string is segmentable.

# Common mistakes

* **Off-by-one errors:** Forgetting that a string of length `n` has `n+1` possible prefix states (from 0 to `n`).
* **Ignoring the empty case:** Failing to set the `Empty-string initialization` correctly, which causes the entire DP recurrence to fail because no transitions can start.
* **Confusing substring vs. subsequence:** Attempting to use a contiguous segmentation approach (like word break) on a problem that actually allows skipping characters (subsequence).

# Knowledge checks with answers

1. **Question:** Why is `Empty-string initialization` critical in `Word break prefix reachability`?
   **Answer:** It acts as the base case. Without it, there is no "starting point" to verify the first word in the string.

2. **Question:** What is the difference between `Regular-expression matching state` and `Wildcard matching state`?
   **Answer:** Regular expression matching typically handles complex patterns (like `*` meaning zero or more of the *preceding* element), while wildcard matching usually handles simpler patterns (like `*` meaning any sequence of characters).

3. **Question:** If `Minimum palindrome cuts` returns an `Impossible-prefix state`, what does that imply?
   **Answer:** It implies that the string cannot be partitioned into palindromes under the current rules (though for standard palindrome partitioning, this is usually impossible unless the string is empty).

Sources: [Topic reference](https://usaco.guide/gold/intro-dp)
