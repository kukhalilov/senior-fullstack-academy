# sequence and string dynamic programming — Problem: Longest Palindromic Subsequence

## Goals

Define an interval recurrence for palindromic subsequences, handle length-two inner intervals, and distinguish subsequence from substring.

## Problem statement

Given `s`, return the length of its longest palindromic subsequence. A subsequence may omit characters while preserving order. [Official problem statement](https://leetcode.com/problems/longest-palindromic-subsequence/)

## Input constraints

- `1 <= s.Length <= 1000`.
- `s` contains lowercase English letters.

## Examples with expected output

1. `"bbbab"` → `4`.
2. `"cbbd"` → `2`.
3. `"a"` → `1`.
4. `"abca"` → `3` (`"aca"` is not contiguous).

## Clarifying assumptions

Return length only. `[left,right]` uses inclusive endpoints. An empty inner interval contributes zero; a single-character interval has value one.

## Progressive hints

1. Compare the two endpoint characters of each interval.
2. Equal endpoints can surround an inner palindrome; unequal endpoints require dropping one side.
3. Fill by increasing interval length or in a nested order that ensures the inner values exist.

## Complete C# solution

```csharp dsa-solution
using System;
static int Lps(string s)
{
    int n = s.Length;
    int[,] dp = new int[n, n];
    for (int left = n - 1; left >= 0; left--)
    {
        dp[left, left] = 1;
        for (int right = left + 1; right < n; right++)
            dp[left, right] = s[left] == s[right]
                ? 2 + (right == left + 1 ? 0 : dp[left + 1, right - 1])
                : Math.Max(dp[left + 1, right], dp[left, right - 1]);
    }
    return dp[0, n - 1];
}
static void Check(int x, int y, string label)
{
    if (x != y) throw new InvalidOperationException($"{label}: expected {y}, got {x}");
}
Check(Lps("bbbab"), 4, "example 1");
Check(Lps("cbbd"), 2, "example 2");
Check(Lps("a"), 1, "singleton");
Check(Lps("abca"), 3, "noncontiguous palindrome");
Check(Lps("abc"), 1, "distinct characters");
Console.WriteLine("All LPS checks passed.");
```

## Correctness argument

A singleton interval has optimum one. For equal endpoints, including both around an optimal inner palindrome gives `2 + inner`; any palindrome using both has such an inner palindrome. For unequal endpoints, a palindrome cannot use both as matching outer characters, so it must omit at least one; taking the maximum of the two shorter intervals covers all options. Induction on interval length proves the recurrence. The loops compute shorter dependencies before longer states, ending with the full interval.

## Step-by-step dry run

For `"cbbd"`, the inner `"bb"` has value two; the outer `c` and `d` differ, so discard one endpoint and retain the better interval with value two. For equal endpoints on a length-two interval, the empty inner value is explicitly zero.

## Time complexity

`O(n²)`.

## Space complexity

`O(n²)` integers; one million cells at length 1000.

## Edge-case tests

Tests cover official examples, one character, a noncontiguous palindrome, all-distinct characters, and equal endpoints around an empty inner interval.

## Reflection questions

1. Why must the length-two equal-endpoint case avoid reading an invalid cell?
2. What changes if a palindrome must be contiguous?
3. How would you backtrack to construct one optimum?
