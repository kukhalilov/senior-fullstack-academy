# sequence and string dynamic programming — Problem: Longest Common Subsequence

## Goals

Define a two-prefix LCS state, derive match/skip transitions, and distinguish the length from a reconstructed subsequence.

## Problem statement

Given `text1` and `text2`, return their longest common subsequence length. A subsequence preserves order but may omit characters. [Official problem statement](https://leetcode.com/problems/longest-common-subsequence/)

## Input constraints

- `1 <= text1.Length, text2.Length <= 1000`.
- Both strings contain lowercase English letters.

## Examples with expected output

1. `"abcde"`, `"ace"` → `3`.
2. `"abc"`, `"abc"` → `3`.
3. `"abc"`, `"def"` → `0`.
4. `"abcde"`, `"ace"` → `3`; `ace` is not contiguous in the first string.

## Clarifying assumptions

Return length only; multiple optimum subsequences may exist. Empty-prefix states are included in the recurrence although judge inputs are nonempty.

## Progressive hints

1. Define `dp[i,j]` for prefixes of lengths `i` and `j`.
2. Equal final characters can extend the diagonal state.
3. Unequal final characters require skipping at least one side; compare both skips.

## Complete C# solution

```csharp dsa-solution
using System;
static int Lcs(string a, string b)
{
    int[,] dp = new int[a.Length + 1, b.Length + 1];
    for (int i = 1; i <= a.Length; i++)
        for (int j = 1; j <= b.Length; j++)
            dp[i, j] = a[i - 1] == b[j - 1] ? dp[i - 1, j - 1] + 1 : Math.Max(dp[i - 1, j], dp[i, j - 1]);
    return dp[a.Length, b.Length];
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(Lcs("abcde", "ace"), 3, "example 1");
Check(Lcs("abc", "abc"), 3, "example 2");
Check(Lcs("abc", "def"), 0, "example 3");
Check(Lcs("a", "a"), 1, "single match");
Check(Lcs("ab", "ba"), 1, "tie");
Console.WriteLine("All LCS checks passed.");
```

## Correctness argument

Let `dp[i,j]` be the LCS length for the first `i` and `j` characters. Empty prefixes yield zero. If final characters match, they can extend an optimum of both preceding prefixes by one. If they differ, a common subsequence cannot match them to each other, so it omits at least one; the two skip states cover every optimum. Induction over prefix lengths proves each cell, including the full-input answer.

## Step-by-step dry run

For `"abcde"` and `"ace"`, matching pairs `a`, `c`, and `e` extend diagonal values. Characters `b` and `d` are skipped. The final value is 3.

## Time complexity

`O(nm)` for all prefix pairs.

## Space complexity

`O(nm)` integers. Two rows suffice for length only; reconstruction needs stored choices or recomputation.

## Edge-case tests

Assertions cover all official examples, a single match, and a tie between equally long subsequences.

## Reflection questions

1. How would you reconstruct one LCS by backtracking?
2. Which transition changes for a common substring?
3. Why are the table dimensions one larger than the string lengths?
