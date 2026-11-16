# sequence and string dynamic programming — Problem: Minimum ASCII Delete Sum for Two Strings

# Goals

- Model a minimum-cost transformation using a state over two prefixes.
- Derive boundary costs and the match/delete transitions.
- Implement and validate the recurrence in C# without confusing character values with deletion counts.

# Problem statement

Given two strings, delete characters from either string so the remaining strings are equal. Return the minimum possible sum of the ASCII values of all deleted characters. Deletion is the only allowed operation; characters cannot be inserted, replaced, or reordered.

# Input constraints

- `1 <= s1.Length, s2.Length <= 1000`
- Both strings contain lowercase English letters.
- The result fits a signed 32-bit integer.

# Examples with expected output

- `s1 = "sea"`, `s2 = "eat"` → `231`; delete `s` (115) and `t` (116), leaving `ea`.
- `s1 = "delete"`, `s2 = "leet"` → `403`.

# Clarifying assumptions

- The strings must become identical in order after deletions; no reordering is allowed.
- A common subsequence can be retained, but the optimum need not be the longest common subsequence by character count. A high-value character may be more expensive to delete than several low-value characters.
- The frozen input alphabet is lowercase English, so each C# `char` value is its ASCII code.
- The implementation uses a 2D table for clarity; rolling rows are possible because only the previous row and current row’s left neighbor are needed.

# Progressive hints

1. Let `dp[i,j]` be the minimum cost for prefixes of lengths `i` and `j`.
2. If one prefix is empty, every character in the other must be deleted. Initialize these row and column sums.
3. Equal final characters can be kept together; otherwise one of the two final characters must be deleted.
4. The result is the cost for the full pair of prefixes.

# Complete C# solution

```csharp dsa-solution
using System;

public static class MinimumAsciiDeleteSumSolution
{
    public static int MinimumDeleteSum(string s1, string s2)
    {
        int m = s1.Length;
        int n = s2.Length;
        var dp = new int[m + 1, n + 1];

        for (int i = 1; i <= m; i++)
        {
            dp[i, 0] = dp[i - 1, 0] + s1[i - 1];
        }

        for (int j = 1; j <= n; j++)
        {
            dp[0, j] = dp[0, j - 1] + s2[j - 1];
        }

        for (int i = 1; i <= m; i++)
        {
            for (int j = 1; j <= n; j++)
            {
                if (s1[i - 1] == s2[j - 1])
                {
                    dp[i, j] = dp[i - 1, j - 1];
                }
                else
                {
                    int deleteFromS1 = dp[i - 1, j] + s1[i - 1];
                    int deleteFromS2 = dp[i, j - 1] + s2[j - 1];
                    dp[i, j] = Math.Min(deleteFromS1, deleteFromS2);
                }
            }
        }

        return dp[m, n];
    }

    public static void Main()
    {
        if (MinimumDeleteSum("sea", "eat") != 231 ||
            MinimumDeleteSum("delete", "leet") != 403 ||
            MinimumDeleteSum("a", "a") != 0 ||
            MinimumDeleteSum("a", "b") != (int)'a' + (int)'b' ||
            MinimumDeleteSum("a", "") != (int)'a')
        {
            throw new InvalidOperationException("A minimum delete-sum check failed.");
        }
    }
}
```

# Correctness argument

For each pair `(i,j)`, `dp[i,j]` is the minimum deletion cost that makes the prefixes `s1[0..i)` and `s2[0..j)` equal.

- **Base:** If `j=0`, all `i` characters from `s1` must be deleted, so `dp[i,0]` is their sum. Symmetrically, `dp[0,j]` is the sum of the first `j` characters of `s2`.
- **Equal endings:** If `s1[i-1] == s2[j-1]`, retaining these equal characters is never worse than deleting one of them: deletion adds a positive ASCII cost and does not help match the other prefix. The optimum is `dp[i-1,j-1]`.
- **Different endings:** The two final characters cannot both remain as the final matched character. At least one must be deleted. Deleting `s1[i-1]` leaves `(i-1,j)`; deleting `s2[j-1]` leaves `(i,j-1)`. Taking the lower total cost covers both possible final deletions.

Every optimal solution ends in one of these cases, so the recurrence and bases compute the minimum cost.

# Step-by-step dry run

For `s1 = "sea"`, `s2 = "eat"`, the first column accumulates `s=115`, `e=101`, `a=97`; the first row accumulates `e=101`, `a=97`, `t=116`.

| Prefix of `s1` \ Prefix of `s2` | empty | `e` | `ea` | `eat` |
| --- | ---: | ---: | ---: | ---: |
| empty | 0 | 101 | 198 | 314 |
| `s` | 115 | 216 | 313 | 429 |
| `se` | 216 | 115 | 212 | 328 |
| `sea` | 313 | 212 | 115 | 231 |

At the final cell, equal `a` is retained from the diagonal; the remaining cost is 231, corresponding to deleting `s` and `t`.

# Time complexity

`O(m × n)`, where `m` and `n` are the string lengths. Each of the `(m+1)(n+1)` cells is assigned in constant time.

# Space complexity

`O(m × n)` for the table. A rolling-row implementation can reduce auxiliary space to `O(min(m,n))`; if reconstruction of which characters to delete is required, retain decisions or recompute predecessor choices.

# Edge-case tests

- Identical strings produce zero.
- Disjoint one-character strings require deleting both, so cost is their ASCII-value sum.
- One empty string requires deleting every character from the other (outside the supplied nonempty constraints but supported by the method).
- Repeated characters with different alignment choices.
- Different lengths where a low-cost deletion on one side beats deleting a more valuable character on the other.
- Maximum-length inputs; the stated 32-bit result bound prevents overflow for valid inputs.

# Reflection questions

1. Why is maximizing common-subsequence length not always equivalent to minimizing ASCII deletion cost?
2. Why does a mismatch branch take a minimum of two states rather than always deleting from one fixed string?
3. Why does the base row/column contain sums rather than zeros?
4. Which characters does the dry-run result delete, and how can the table demonstrate that minimum?

**Answers:** (1) Characters have unequal deletion costs, so a shorter retained subsequence may be cheaper. (2) Either final character could be removed in an optimum. (3) An empty opposite prefix means every character in the nonempty prefix must be removed. (4) It deletes `s` and `t`, costing 115+116=231; all table paths represent the valid choices, and the recurrence selects the minimum.

# Sources

- [Assigned problem: Minimum ASCII Delete Sum for Two Strings](https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/)
- [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp)
