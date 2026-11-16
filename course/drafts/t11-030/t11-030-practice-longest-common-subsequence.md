<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Problem: Longest Common Subsequence

# Goals
- Understand the mental model of sequence and string dynamic programming using two-prefix states.
- Learn how to solve the classic Longest Common Subsequence problem independently using a tabular recurrence.
- Master the implementation details in C# while handling edge cases and validating results rigorously.

# Problem statement
Return the length of the longest common subsequence of two strings; a subsequence preserves order and may omit characters.

# Input constraints
- `1 <= text1.length, text2.length <= 1000`
- Both strings contain lowercase English letters

# Examples with expected output
- `text1="abcde", text2="ace"` -> Output: `3`
- `text1="abc", text2="abc"` -> Output: `3`
- `text1="abc", text2="def"` -> Output: `0`

# Clarifying assumptions
- A subsequence preserves relative order but does not need to be contiguous.
- If no common subsequence exists (other than the empty string), the length is `0`.
- Characters are case-sensitive, though the constraints specify lowercase English letters.

# Progressive hints
1. **State Definition**: Think about how to define a subproblem using prefixes of `text1` and `text2`. Let `dp[i, j]` represent the length of the longest common subsequence considering the first `i` characters of `text1` and the first `j` characters of `text2`.
2. **Transitions**: Compare the current characters `text1[i - 1]` and `text2[j - 1]`. If they match, you can extend a previous solution. If they do not match, what choices do you have regarding skipping characters from either string?
3. **Base Cases**: What is the longest common subsequence if either string has length `0`?

# Complete C# solution
```csharp dsa-solution
using System;

namespace SequenceDpLesson
{
    public class Program
    {
        public static int LongestCommonSubsequence(string text1, string text2)
        {
            if (string.IsNullOrEmpty(text1) || string.IsNullOrEmpty(text2))
            {
                return 0;
            }

            int m = text1.Length;
            int n = text2.Length;
            int[,] dp = new int[m + 1, n + 1];

            for (int i = 1; i <= m; i++)
            {
                for (int j = 1; j <= n; j++)
                {
                    if (text1[i - 1] == text2[j - 1])
                    {
                        dp[i, j] = dp[i - 1, j - 1] + 1;
                    }
                    else
                    {
                        dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);
                    }
                }
            }

            return dp[m, n];
        }

        public static void Main(string[] args)
        {
            // Example 1
            string t1_1 = "abcde";
            string t2_1 = "ace";
            int res1 = LongestCommonSubsequence(t1_1, t2_1);
            if (res1 != 3)
            {
                throw new InvalidOperationException($"Example 1 failed. Expected: 3, Got: {res1}");
            }

            // Example 2
            string t1_2 = "abc";
            string t2_2 = "abc";
            int res2 = LongestCommonSubsequence(t1_2, t2_2);
            if (res2 != 3)
            {
                throw new InvalidOperationException($"Example 2 failed. Expected: 3, Got: {res2}");
            }

            // Example 3
            string t1_3 = "abc";
            string t2_3 = "def";
            int res3 = LongestCommonSubsequence(t1_3, t2_3);
            if (res3 != 0)
            {
                throw new InvalidOperationException($"Example 3 failed. Expected: 0, Got: {res3}");
            }

            // Edge Case: Single character match
            if (LongestCommonSubsequence("a", "a") != 1)
            {
                throw new InvalidOperationException("Edge case 'a' vs 'a' failed.");
            }

            // Edge Case: Single character mismatch
            if (LongestCommonSubsequence("a", "b") != 0)
            {
                throw new InvalidOperationException("Edge case 'a' vs 'b' failed.");
            }

            Console.WriteLine("All tests passed successfully!");
        }
    }
}
```

# Correctness argument
The dynamic programming formulation correctly evaluates all prefix combinations. 
- When `text1[i - 1] == text2[j - 1]`, the optimal subsequence must include this matching character, so we add `1` to the optimal solution of the shorter prefixes `dp[i - 1, j - 1]`.
- When the characters do not match, the optimal common subsequence cannot use both characters at the end simultaneously. Therefore, the answer is the maximum of omitting the current character from `text1` (`dp[i - 1, j]`) or from `text2` (`dp[i, j - 1]`).
- Base cases with zero-length prefixes correctly initialize to `0`.

# Step-by-step dry run
Consider `text1 = "ac"`, `text2 = "abc"`:
- Dimensions: `m = 2`, `n = 3`. Table size `3 x 4`.
- Row `0` and Column `0` initialized to `0`.
- `i = 1` (`'a'`):
  - `j = 1` (`'a'`): characters match -> `dp[1, 1] = dp[0, 0] + 1 = 1`.
  - `j = 2` (`'b'`): mismatch -> `dp[1, 2] = Math.Max(dp[0, 2], dp[1, 1]) = Math.Max(0, 1) = 1`.
  - `j = 3` (`'c'`): mismatch -> `dp[1, 3] = Math.Max(dp[0, 3], dp[1, 2]) = Math.Max(0, 1) = 1`.
- `i = 2` (`'c'`):
  - `j = 1` (`'a'`): mismatch -> `dp[2, 1] = Math.Max(dp[1, 1], dp[2, 0]) = Math.Max(1, 0) = 1`.
  - `j = 2` (`'b'`): mismatch -> `dp[2, 2] = Math.Max(dp[1, 2], dp[2, 1]) = Math.Max(1, 1) = 1`.
  - `j = 3` (`'c'`): characters match -> `dp[2, 3] = dp[1, 2] + 1 = 1 + 1 = 2`.
- Final result at `dp[2, 3]` is `2` (subsequence `"ac"`).

# Time complexity
- Time complexity is $O(m \times n)$, where $m$ is the length of `text1` and $n$ is the length of `text2`, because we fill a 2D table of size $(m + 1) \times (n + 1)$ with constant-time transitions.

# Space complexity
- Space complexity is $O(m \times n)$ to store the 2D DP table. This can be optimized to $O(\min(m, n))$ using rolling-row optimization if only the length is required.

# Edge-case tests
- Identical strings (`"abc"` vs `"abc"`).
- Completely disjoint strings (`"abc"` vs `"def"`).
- Single character strings matching and mismatching.
- Strings of maximum length limits (tested via logical scaling up to 1000).

# Reflection questions
1. How does changing the problem from a *subsequence* to a *substring* alter the transition rules when characters mismatch?
2. Why does the rolling-row space optimization work for computing the length, but complicate full sequence reconstruction?

Sources: [Topic reference](https://usaco.guide/gold/intro-dp); [Assigned problem](https://leetcode.com/problems/longest-common-subsequence/)
