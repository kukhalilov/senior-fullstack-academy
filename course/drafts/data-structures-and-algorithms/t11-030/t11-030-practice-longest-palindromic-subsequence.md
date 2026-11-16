# sequence and string dynamic programming — Problem: Longest Palindromic Subsequence

Source: [Longest Palindromic Subsequence](https://leetcode.com/problems/longest-palindromic-subsequence/).

## Goals

Use an inclusive interval state, evaluate by increasing interval length, and distinguish a subsequence palindrome from a contiguous substring.

## Problem statement

Given a string `s`, return the length of its longest palindromic subsequence. A subsequence preserves order but may omit characters.

## Input constraints

- `1 <= s.length <= 1000`.
- `s` consists of lowercase English letters.

## Examples with expected output

- `"bbbab"` → `4` (`"bbbb"`).
- `"cbbd"` → `2` (`"bb"`).

## Clarifying assumptions

Return the length only; an actual palindrome is not required. The implementation also handles an empty string as a generalized case.

## Progressive hints

1. Let `dp[left,right]` be the best length within the inclusive interval.
2. A single character is a palindrome of length one.
3. Equal endpoints can both be included around the best inner palindrome.
4. If endpoints differ, an optimum discards the left endpoint or the right endpoint.

## Complete C# solution

```csharp dsa-solution
using System;

static int LongestPalindromeSubsequence(string s)
{
    int n = s.Length;
    if (n == 0) return 0;
    int[,] dp = new int[n, n];
    for (int left = n - 1; left >= 0; left--)
    {
        dp[left, left] = 1;
        for (int right = left + 1; right < n; right++)
        {
            if (s[left] == s[right])
                dp[left, right] = 2 + (right == left + 1 ? 0 : dp[left + 1, right - 1]);
            else
                dp[left, right] = Math.Max(dp[left + 1, right], dp[left, right - 1]);
        }
    }
    return dp[0, n - 1];
}

static void Check(int expected, int actual)
{
    if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
}

Check(4, LongestPalindromeSubsequence("bbbab"));
Check(2, LongestPalindromeSubsequence("cbbd"));
Check(0, LongestPalindromeSubsequence(""));
Check(1, LongestPalindromeSubsequence("a"));
Check(3, LongestPalindromeSubsequence("abcda"));
Check(4, LongestPalindromeSubsequence("aaaa"));
```

## Correctness argument

For a one-character interval, that character is a palindrome of length one. For a longer interval with equal endpoints, there is an optimal palindrome containing both: surrounding an optimal palindrome from the interior adds two; for adjacent endpoints the interior is empty and contributes zero. With unequal endpoints, no palindrome can use both as its matching outer pair, so every optimum omits at least one endpoint and is contained in one of the two smaller intervals. Taking the maximum covers both choices. The loop order computes wider intervals only after their needed subintervals, so induction on interval length proves every state and the returned full interval are optimal.

## Step-by-step dry run

For `"cbbd"`, single-character intervals have value 1. The interval `"bb"` has equal endpoints and value 2. Intervals `"cbb"` and `"bbd"` have values 2 by discarding one endpoint. The complete `"cbbd"` interval also has value 2. The palindrome is a subsequence even though it is not required to be a contiguous range in all cases.

## Time complexity

`O(n²)`, with one constant-work computation for each interval.

## Space complexity

`O(n²)` for the interval table.

## Edge-case tests

Assertions cover official examples, empty generalized input, singleton, equal endpoints with a nonempty interior, and repeated characters.

## Reflection questions

- How does the recurrence change when the task asks for a palindromic substring?
- Why is the empty interior value zero for two adjacent equal endpoints?
- How could one reconstruct a palindrome from this table?
