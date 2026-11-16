<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Core concepts and how they fit together

# Learning objectives
- Formulate dynamic programming (DP) states and recurrence relations over sequence prefixes, ending positions, and intervals.
- Distinguish between subsequences (which preserve relative order while allowing elements to be skipped) and substrings (which require contiguous elements).
- Analyze and implement classic sequence algorithms including Longest Increasing Subsequence (LIS), Longest Common Subsequence (LCS), and Edit Distance.
- Apply space optimization techniques such as rolling arrays and tails-array tracking to improve memory efficiency.
- Avoid common pitfalls such as off-by-one prefix indexing, improper base-case initialization, and confusing contiguous constraints with non-contiguous ones.

# Prerequisites
- Basic familiarity with dynamic programming concepts, such as optimal substructure and overlapping subproblems (covered in `t11-015`).
- Understanding of basic array and string indexing in programming languages.
- Comfort with asymptotic time and space complexity notation ($O(n)$, $O(n^2)$, $O(nm)$, etc.).

# Core concepts
Sequence and string dynamic programming solves problems where inputs are ordered elements (such as characters in a string or numbers in an array) by breaking them down into smaller, overlapping prefix or interval subproblems.

## Subsequence vs. Substring
A **subsequence** preserves the relative order of elements from a sequence, but elements do not need to be adjacent. A **substring** (or subarray) requires elements to be strictly contiguous. Because of this distinction, their recurrence relations and boundary conditions differ significantly.

## Longest Increasing Subsequence (LIS)
For an array of numbers, LIS finds the length of the longest subsequence whose elements are strictly increasing. 
- **Endpoint DP ($O(n^2)$):** Defines a state where `dp[i]` represents the length of the LIS ending *exactly* at index `i`. Transitions check all previous indices `j < i` where `arr[j] < arr[i]` and set `dp[i] = max(dp[i], dp[j] + 1)`.
- **Tails Optimization ($O(n \log n)$):** Maintains an auxiliary array where the element at index `k` stores the smallest tail value of all increasing subsequences of length `k+1` found so far. Binary search (`lower_bound`) updates this array efficiently.

## Longest Common Subsequence (LCS)
LCS finds the longest subsequence common to two sequences (let's say of lengths $n$ and $m$). 
- The state uses two prefix indices, `dp[i][j]`, representing the LCS length for the first $i$ characters of string $A$ and the first $j$ characters of string $B$.
- If characters match ($A[i-1] == B[j-1]$), the value transitions from `dp[i-1][j-1] + 1`. If they do not match, the recurrence takes the maximum of skipping a character from either string: `max(dp[i-1][j], dp[i][j-1])`.

## String Edit Distance
Edit distance computes the minimum number of operations (insertions, deletions, and replacements) required to transform one string into another. The state tracks prefix pairs `dp[i][j]` representing the cost to transform $A[0 \dots i-1]$ into $B[0 \dots j-1]$.

## Palindromic Substrings and Subsequences
- **Palindromic Substring:** Requires contiguity. Can be solved efficiently by interval expansion ("expand around center") or a 2D boolean DP table indicating whether range `[left, right]` forms a palindrome.
- **Palindromic Subsequence:** Allows skipped characters. Uses interval DP states `dp[left][right]`, where transitions check if endpoints match and adjust based on inner intervals.

# Mechanisms and relationships

The following map illustrates how sequence DP subproblems and structural decisions fit together:

```
[ Input Sequences / Strings ]
       │
       ├─► Non-Contiguous? ──► Subsequence / Alignment
       │                         ├─► 1D State (e.g., LIS: ends at i)
       │                         └─► 2D Prefix State (e.g., LCS, Edit Distance)
       │
       └─► Contiguous? ──────► Substring / Segment / Interval
                                 ├─► 2D Range State [left, right] (Palindromes)
                                 └─► Prefix Reachability (Word Break)
```

## How Transitions Work
1. **Match-character transition:** Occurs when current elements align; extends the optimal value from a prior diagonal state.
2. **Skip-left / Skip-right transitions:** Account for dropping an unmatched element from one of the sequences, taking the maximum or minimum over alternative previous states.
3. **Initialization:** Base cases typically handle empty-prefix conditions (converting an empty string requires $i$ insertions or deletions).

# Worked examples

## Example 1: Longest Increasing Subsequence ($O(n^2)$ Endpoint DP)
Consider finding the length of the LIS for the array `[3, 1, 4, 1, 5, 9]`.

1. **State:** Let `dp[i]` be the length of the LIS ending at index `i`. Initialize all `dp[i] = 1` because any single element is an increasing subsequence of length 1.
2. **Transitions:** For each `i` from 1 to $n-1$, check all `j` from 0 to $i-1$. If `arr[j] < arr[i]`, then `dp[i] = max(dp[i], dp[j] + 1)`.
3. **Execution Walkthrough:**
   - `arr = [3, 1, 4, 1, 5, 9]`
   - `i = 0 (3)`: `dp[0] = 1`
   - `i = 1 (1)`: No preceding element is smaller. `dp[1] = 1`
   - `i = 2 (4)`: Preceded by `3` ($3 < 4$). `dp[2] = max(1, dp[0] + 1) = 2` (subsequence: `[3, 4]`)
   - `i = 3 (1)`: No preceding element is smaller. `dp[3] = 1`
   - `i = 4 (5)`: Preceded by `3`, `1`, `4`. Max comes from `4` ($4 < 5$). `dp[4] = dp[2] + 1 = 3` (`[3, 4, 5]`)
   - `i = 5 (9)`: Preceded by `5`. `dp[5] = dp[4] + 1 = 4` (`[3, 4, 5, 9]`)
4. **Result:** The maximum value in `dp` is `4`.

## Example 2: Longest Common Subsequence (Snippet)
The following snippet demonstrates the core 2D prefix state filling for LCS between two strings `s1` and `s2`.

```cpp
#include <vector>
#include <string>
#include <algorithm>

int longestCommonSubsequence(std::string s1, std::string s2) {
    int n = s1.length();
    int m = s2.length();
    // dp[i][j] stores the LCS of s1[0..i-1] and s2[0..j-1]
    std::vector<std::vector<int>> dp(n + 1, std::vector<int>(m + 1, 0));

    for (int i = 1; i <= n; ++i) {
        for (int j = 1; j <= m; ++j) {
            if (s1[i - 1] == s2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    return dp[n][m];
}
```
*Context:* This is a self-contained function snippet requiring standard library headers `<vector>`, `<string>`, and `<algorithm>`. Expected output for inputs `"abcde"` and `"ace"` is `3`.

# Misconceptions and edge cases
- **Confusing Substring with Subsequence:** Treating a contiguous substring problem with non-contiguous subsequence transitions will yield incorrect, overly permissive results. Always verify whether elements must be adjacent.
- **Off-by-One Prefix Indexing:** When using 1-based indexing for prefix DP tables (to easily handle empty strings at index 0), remember to map string characters using `s[i - 1]`.
- **Omitting Base Cases:** Forgetting to initialize empty-prefix states (e.g., `dp[0][j] = j` for edit distance) leads to out-of-bounds errors or incorrect base costs.
- **Space Complexity Oversights:** Storing a full $O(nm)$ 2D table is unnecessary if only the previous row is needed for rolling-row optimizations, though reconstruction requirements may force you to keep the full table.

# Knowledge checks with answers
1. **Question:** What is the primary structural difference between a subsequence and a substring in sequence dynamic programming?
   - **Answer:** A subsequence preserves relative order but permits skipping elements, whereas a substring requires all elements to be strictly contiguous.

2. **Question:** In the $O(n^2)$ LIS endpoint dynamic programming approach, what does `dp[i]` represent?
   - **Answer:** `dp[i]` represents the length of the longest increasing subsequence that ends *strictly* at index `i`.

3. **Question:** Why do two-string prefix dynamic programming algorithms (like LCS and Edit Distance) typically allocate table dimensions of $(n+1) \times (m+1)$ instead of $n \times m$?
   - **Answer:** The extra row and column are used to represent empty-prefix base cases (length 0 for either string), simplifying boundary conditions and recurrences.

4. **Question:** When is space compression via rolling arrays risky or impossible for reconstruction problems?
   - **Answer:** Space compression discards older rows or states to save memory. If you need to reconstruct the final optimal sequence by backtracking through decision history, discarding past states makes full path reconstruction impossible unless alternate checkpointing or recomputation strategies are used.

*Source references checked via official curriculum guidelines and competitive programming problem references (`https://usaco.guide/gold/intro-dp`, `https://usaco.guide/CPH.pdf`).*

*(Draft automatically generated)*

Sources: [Topic reference](https://usaco.guide/gold/intro-dp)
