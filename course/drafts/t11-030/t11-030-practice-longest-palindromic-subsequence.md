<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# sequence and string dynamic programming — Problem: Longest Palindromic Subsequence

# Goals
- Master interval dynamic programming for sequence and string problems.
- Learn how to solve the "Longest Palindromic Subsequence" problem independently by designing state definitions, recurrence relations, and base cases.
- Practice implementing production-grade, self-contained C# code featuring explicit runtime verification checks that throw an `InvalidOperationException` upon failure.

# Problem statement
Given a string `s`, return the length of the longest palindromic subsequence in `s`. A subsequence is a sequence that can be derived from another sequence by deleting some or no elements without changing the order of the remaining elements. A palindrome is a string that reads the same backward as forward.

# Input constraints
- `1 <= s.length <= 1000`
- `s` consists of lowercase English letters

# Examples with expected output
- Input: `s = "bbbab"`
  Expected Output: `4` (Explanation: One longest palindromic subsequence is `"bbbb"`)
- Input: `s = "cbbd"`
  Expected Output: `2` (Explanation: One longest palindromic subsequence is `"bb"`)

# Clarifying assumptions
- The length of string `s` is between 1 and 1000 inclusive, making an $O(n^2)$ time and space interval dynamic programming approach optimal and well within typical time limits.
- The output represents the integer length of the longest valid palindromic subsequence.
- Indices follow standard zero-based C# string indexing.

# Progressive hints
1. **Hint 1: Recognize Interval Structure.** Unlike simple prefix DP where you process indices from left to right, palindromic properties depend heavily on both endpoints of a substring range `[i, j]`. This makes interval dynamic programming the ideal pattern.
2. **Hint 2: Define the State.** Let `dp[i, j]` represent the length of the longest palindromic subsequence within the substring ranging from index `i` to index `j` inclusive.
3. **Hint 3: Formulate Transitions.** Think about the characters at the boundaries `s[i]` and `s[j]`. If they match, they can both contribute to the palindrome, so `dp[i, j] = dp[i + 1, j - 1] + 2`. If they do not match, the longest palindromic subsequence must exclude either `s[i]` or `s[j]`, giving the transition `dp[i, j] = Math.Max(dp[i + 1, j], dp[i, j - 1])`.
4. **Hint 4: Base Cases and Order of Evaluation.** Every single character is a palindrome of length 1 (`dp[i, i] = 1`). When evaluating larger intervals, you must compute smaller substring lengths before larger ones. Iterate over interval lengths from `2` up to `n`, or iterate `i` backward from `n - 1` down to `0` and `j` forward from `i + 1` to `n - 1`.

# Complete C# solution
```csharp dsa-solution
using System;

namespace SequenceDpLesson
{
    public static class Program
    {
        public static int LongestPalindromeSubseq(string s)
        {
            if (string.IsNullOrEmpty(s))
            {
                return 0;
            }

            int n = s.Length;
            int[,] dp = new int[n, n];

            // Every single character is a palindrome of length 1
            for (int i = 0; i < n; i++)
            {
                dp[i, i] = 1;
            }

            // Build the table by interval length from 2 up to n
            for (int len = 2; len <= n; len++)
            {
                for (int i = 0; i <= n - len; i++)
                {
                    int j = i + len - 1;
                    if (s[i] == s[j])
                    {
                        if (len == 2)
                        {
                            dp[i, j] = 2;
                        }
                        else
                        {
                            dp[i, j] = dp[i + 1, j - 1] + 2;
                        }
                    }
                    else
                    {
                        dp[i, j] = Math.Max(dp[i + 1, j], dp[i, j - 1]);
                    }
                }
            }

            return dp[0, n - 1];
        }

        public static void Main(string[] args)
        {
            // Example 1 verification
            string input1 = "bbbab";
            int expected1 = 4;
            int result1 = LongestPalindromeSubseq(input1);
            if (result1 != expected1)
            {
                throw new InvalidOperationException($"Test failed for input '{input1}'. Expected: {expected1}, Got: {result1}");
            }

            // Example 2 verification
            string input2 = "cbbd";
            int expected2 = 2;
            int result2 = LongestPalindromeSubseq(input2);
            if (result2 != expected2)
            {
                throw new InvalidOperationException($"Test failed for input '{input2}'. Expected: {expected2}, Got: {result2}");
            }

            // Edge Case: Single character
            string input3 = "a";
            int expected3 = 1;
            int result3 = LongestPalindromeSubseq(input3);
            if (result3 != expected3)
            {
                throw new InvalidOperationException($"Test failed for input '{input3}'. Expected: {expected3}, Got: {result3}");
            }

            // Edge Case: No matching characters (all distinct)
            string input4 = "abcd";
            int expected4 = 1;
            int result4 = LongestPalindromeSubseq(input4);
            if (result4 != expected4)
            {
                throw new InvalidOperationException($"Test failed for input '{input4}'. Expected: {expected4}, Got: {result4}");
            }

            Console.WriteLine("All test assertions passed successfully.");
        }
    }
}
```

# Correctness argument
The interval dynamic programming solution correctly computes the longest palindromic subsequence by breaking the problem down into optimal substructures over substring intervals `[i, j]`. 
1. **Base Cases:** For intervals of length 1 (`i == j`), a single character is trivially a palindrome of length 1, satisfying `dp[i, i] = 1`.
2. **Inductive Step:** For any interval `[i, j]`, if `s[i] == s[j]`, these two matching endpoints can be added to any valid palindromic subsequence found strictly inside the interval (`dp[i + 1, j - 1]`). If `s[i] != s[j]`, the optimal palindrome for `[i, j]` cannot include both endpoints simultaneously, so it must be the maximum of omitting either the left endpoint (`dp[i + 1, j]`) or the right endpoint (`dp[i, j - 1]`).
3. **Evaluation Order:** By iterating over all possible lengths from 2 to `n`, we guarantee that sub-problems of smaller intervals are fully computed and stored before they are queried by larger intervals.

# Step-by-step dry run
Let's trace `s = "cbbd"` step by step:
1. **Initialization (`len = 1`):**
   - `dp[0, 0] = 1` ('c')
   - `dp[1, 1] = 1` ('b')
   - `dp[2, 2] = 1` ('b')
   - `dp[3, 3] = 1` ('d')

2. **Interval Length 2 (`len = 2`):**
   - `i = 0, j = 1` (`"cb"`): `s[0] != s[1]` ('c' vs 'b'). `dp[0, 1] = Math.Max(dp[1, 1], dp[0, 0]) = Math.Max(1, 1) = 1`.
   - `i = 1, j = 2` (`"bb"`): `s[1] == s[2]` ('b' vs 'b'). `dp[1, 2] = 2`.
   - `i = 2, j = 3` (`"bd"`): `s[2] != s[3]` ('b' vs 'd'). `dp[2, 3] = Math.Max(dp[3, 3], dp[2, 2]) = Math.Max(1, 1) = 1`.

3. **Interval Length 3 (`len = 3`):**
   - `i = 0, j = 2` (`"cbb"`): `s[0] != s[2]` ('c' vs 'b'). `dp[0, 2] = Math.Max(dp[1, 2], dp[0, 1]) = Math.Max(2, 1) = 2`.
   - `i = 1, j = 3` (`"bbd"`): `s[1] != s[3]` ('b' vs 'd'). `dp[1, 3] = Math.Max(dp[2, 3], dp[1, 2]) = Math.Max(1, 2) = 2`.

4. **Interval Length 4 (`len = 4`):**
   - `i = 0, j = 3` (`"cbbd"`): `s[0] != s[3]` ('c' vs 'd'). `dp[0, 3] = Math.Max(dp[1, 3], dp[0, 2]) = Math.Max(2, 2) = 2`.

Final Answer: `dp[0, 3] = 2`, which matches the expected output.

# Time complexity
The algorithm uses two nested loops: an outer loop running for lengths from 2 to `n` ($O(n)$ iterations) and an inner loop running for valid start indices `i` ($O(n)$ iterations). Inside the loop, constant-time lookups and comparisons are performed. Thus, the total time complexity is $O(n^2)$, which is extremely efficient for `n = 1000`.

# Space complexity
A 2D array `dp` of size `n x n` is allocated to store the subproblem results for every interval `[i, j]`. Therefore, the total space complexity is $O(n^2)$.

# Edge-case tests
- **Single Character (`s = "a"`):** Returns `1` correctly without out-of-bounds errors.
- **All Distinct Characters (`s = "abcd"`):** Returns `1` since no characters match to form a longer palindrome.
- **All Identical Characters (`s = "aaaa"`):** Returns `4` because the entire string is a palindrome.
- **Maximum Length Boundaries:** Handled efficiently within constraints ($n = 1000$).

# Reflection questions
1. How does interval dynamic programming differ from standard prefix-based dynamic programming in terms of state definition and dependency order?
2. Can space complexity for the Longest Palindromic Subsequence problem be optimized further from $O(n^2)$ to $O(n)$ using rolling arrays or vectors? Why or why not?
3. What signals or problem constraints would make you choose an interval DP approach over a simple sliding window or greedy algorithm?

Sources: [Topic reference](https://usaco.guide/gold/intro-dp); [Assigned problem](https://leetcode.com/problems/longest-palindromic-subsequence/)
