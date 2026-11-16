# sequence and string dynamic programming — Problem: Longest Common Subsequence

Source: [Longest Common Subsequence](https://leetcode.com/problems/longest-common-subsequence/).

## Goals

Model two prefixes, implement match/skip transitions, explain `O(nm)` time, and validate the zero-prefix boundaries.

## Problem statement

Given strings `text1` and `text2`, return the length of their longest common subsequence. A subsequence preserves character order but may omit characters; it need not be contiguous.

## Input constraints

- `1 <= text1.length, text2.length <= 1000`.
- Both strings contain lowercase English letters.

## Examples with expected output

- `text1="abcde", text2="ace"` → `3` (`"ace"`).
- `text1="abc", text2="abc"` → `3`.
- `text1="abc", text2="def"` → `0`.

## Clarifying assumptions

Return only the length, not an actual subsequence. The implementation can safely generalize to an empty string, which is useful for testing the base row and column. Character comparison is exact and case-sensitive.

## Progressive hints

1. Define `dp[i,j]` using prefix lengths, not last-character indices.
2. If the last characters match, extend the diagonal predecessor by one.
3. Otherwise skip the final character from either input and keep the larger result.
4. Initialize the row or column where one prefix is empty to zero.

## Complete C# solution

```csharp dsa-solution
using System;

static int Lcs(string first, string second)
{
    int[,] dp = new int[first.Length + 1, second.Length + 1];
    for (int i = 1; i <= first.Length; i++)
    {
        for (int j = 1; j <= second.Length; j++)
        {
            if (first[i - 1] == second[j - 1])
                dp[i, j] = dp[i - 1, j - 1] + 1;
            else
                dp[i, j] = Math.Max(dp[i - 1, j], dp[i, j - 1]);
        }
    }
    return dp[first.Length, second.Length];
}

static void Check(int expected, int actual)
{
    if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
}

Check(3, Lcs("abcde", "ace"));
Check(3, Lcs("abc", "abc"));
Check(0, Lcs("abc", "def"));
Check(0, Lcs("", "abc"));
Check(1, Lcs("a", "ba"));
Check(2, Lcs("aaaa", "aa"));
```

## Correctness argument

For each pair of prefixes, any common subsequence either matches their final characters or omits at least one of them. If the final characters match, an optimal solution can include that shared character after an optimal subsequence of the shorter prefixes. If they differ, a solution cannot match both as the same final aligned character, so an optimum is represented by skipping the final character from one side or the other. The recurrence takes the best of those exhaustive choices. Empty-prefix states correctly have length zero. By induction over increasing prefix lengths, each cell is optimal; the final cell covers both complete strings.

## Step-by-step dry run

For `"abc"` and `"ac"`, the empty row/column are zero. At `(1,1)`, `a=a`, so the value is 1. At `(2,2)`, `b!=c`; the best skip predecessor keeps value 1. At `(3,2)`, `c=c`, so the diagonal value becomes 2. The answer is 2 (`"ac"`).

## Time complexity

`O(nm)`: the algorithm fills one cell for each pair of nonempty prefixes.

## Space complexity

`O(nm)` for the full table. If only the length is needed, two rows reduce auxiliary storage to `O(min(n,m))`; reconstruction needs additional information or a divide-and-conquer approach.

## Edge-case tests

The program asserts all supplied examples, an empty generalized input, one-character overlap where the match is not at both first positions, and repeated characters. All assertions throw if a result is wrong.

## Reflection questions

- Why must the answer use both skip directions on mismatch?
- How would you recover one actual subsequence?
- Which recurrence change would be needed for longest common substring?
