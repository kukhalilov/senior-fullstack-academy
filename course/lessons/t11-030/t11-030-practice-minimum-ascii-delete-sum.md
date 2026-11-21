# sequence and string dynamic programming — Problem: Minimum ASCII Delete Sum for Two Strings

Source: [Minimum ASCII Delete Sum for Two Strings](https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/).

## Goals

Define a minimum-cost two-prefix state, initialize deletion cost for empty prefixes, and use character weights in transitions.

## Problem statement

Given strings `s1` and `s2`, return the minimum sum of deleted character ASCII values needed to make the strings equal, using deletions only.

## Input constraints

- `1 <= s1.length, s2.length <= 1000`.
- Both strings contain lowercase English letters.
- The result fits a signed 32-bit integer.

## Examples with expected output

- `s1="sea"`, `s2="eat"` → `231`.
- `s1="delete"`, `s2="leet"` → `403`.

## Clarifying assumptions

Characters may only be deleted; insertion and replacement are not allowed. Equal remaining strings preserve order. Under the lowercase-English constraints, each character’s ASCII value equals its usual .NET `char` numeric value.

## Progressive hints

1. Let `dp[i,j]` be the minimum deletion sum for the first `i` and first `j` characters.
2. If the final characters match, keep them and use the diagonal state.
3. Otherwise delete the last character from either string and add its ASCII value.
4. Empty-prefix states delete every character from the other side.

## Complete C# solution

```csharp dsa-solution
using System;

static int MinimumDeleteSum(string first, string second)
{
    int[,] dp = new int[first.Length + 1, second.Length + 1];
    for (int i = 1; i <= first.Length; i++)
        dp[i, 0] = dp[i - 1, 0] + first[i - 1];
    for (int j = 1; j <= second.Length; j++)
        dp[0, j] = dp[0, j - 1] + second[j - 1];

    for (int i = 1; i <= first.Length; i++)
    {
        for (int j = 1; j <= second.Length; j++)
        {
            if (first[i - 1] == second[j - 1])
                dp[i, j] = dp[i - 1, j - 1];
            else
                dp[i, j] = Math.Min(dp[i - 1, j] + first[i - 1], dp[i, j - 1] + second[j - 1]);
        }
    }
    return dp[first.Length, second.Length];
}

static void Check(int expected, int actual)
{
    if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
}

Check(231, MinimumDeleteSum("sea", "eat"));
Check(403, MinimumDeleteSum("delete", "leet"));
Check(0, MinimumDeleteSum("same", "same"));
Check((int)'a' + (int)'b', MinimumDeleteSum("ab", ""));
Check((int)'a' + (int)'b', MinimumDeleteSum("a", "b"));
Check(0, MinimumDeleteSum("", ""));
```

## Correctness argument

For two nonempty prefixes, if their last characters are equal, an optimal common result can keep that character and solve the preceding prefixes; deleting it from one side would only incur cost without improving equality. If the last characters differ, they cannot both remain as the same final character of equal results. Any valid solution must delete at least one of them, so compare deleting the first string’s last character or the second string’s last character and add the corresponding ASCII cost. The base row/column delete all characters on the nonempty side. Induction over prefix pairs shows every state is the minimum valid cost; the final state covers both strings.

## Step-by-step dry run

For `"a"` and `"b"`, the final characters differ. Delete `a` and then `b` costs `97+98`; delete `b` and then `a` has the same cost, so the answer is 195. For `"sea"` and `"eat"`, keeping the shared subsequence `"ea"` costs deleting `s` and `t`, `115+116=231`.

## Time complexity

`O(nm)` time for all prefix pairs.

## Space complexity

`O(nm)` for the table. Rolling rows reduce value-only memory to `O(min(n,m))`.

## Edge-case tests

Assertions cover both official examples, identical strings, empty generalized strings, and strings with no common character.

## Reflection questions

- Why is a replacement transition not present?
- How would you reconstruct the deleted characters?
- How should the cost definition change for arbitrary Unicode text?
