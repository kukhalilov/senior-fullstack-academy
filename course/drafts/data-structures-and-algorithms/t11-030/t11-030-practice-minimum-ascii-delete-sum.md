# sequence and string dynamic programming — Problem: Minimum ASCII Delete Sum for Two Strings

## Goals

Use prefix-pair DP to minimize a weighted deletion cost, initialize empty prefixes correctly, and interpret the problem's ASCII cost within its lowercase-English constraints.

## Problem statement

Given `s1` and `s2`, return the lowest sum of deleted character values needed to make the strings equal. Only deletions are allowed. [Official problem statement](https://leetcode.com/problems/minimum-ascii-delete-sum-for-two-strings/)

## Input constraints

- `1 <= s1.Length, s2.Length <= 1000`.
- Both strings contain lowercase English letters only.
- The requested deletion sum fits in a 32-bit signed integer under these constraints.

## Examples with expected output

1. `s1 = "sea"`, `s2 = "eat"` → `231`: delete `s` (115) and `t` (116).
2. `s1 = "delete"`, `s2 = "leet"` → `403`.
3. `s1 = "a"`, `s2 = "a"` → `0`.

## Clarifying assumptions

The statement's ASCII sum is the numeric ASCII value of each deleted character; lowercase English input makes this well-defined. The result is the minimum total across both strings. Insertions and replacements are not allowed, although equal retained characters align the strings.

## Progressive hints

1. Let a cell describe the least cost for two prefixes. What does row zero mean?
2. If the final characters match, keeping them can cost nothing. If they differ, one of them must be deleted next.
3. The two choices are deleting `s1[i-1]` or deleting `s2[j-1]`; add that character's value to the corresponding smaller state.

## Complete C# solution

The two-row form retains only the previous prefix-pair row and the current row. When characters match, the diagonal cost is sufficient: retaining the matching final character cannot worsen the optimum, and any solution deleting a matched pair could retain it instead and remove the same earlier prefix characters. When they differ, the final equal strings cannot retain both final characters as a matching pair, so one must be deleted.

```csharp dsa-solution
using System;

static int MinimumDeleteSum(string s1, string s2)
{
    int[] previous = new int[s2.Length + 1];
    for (int j = 1; j <= s2.Length; j++)
        previous[j] = previous[j - 1] + s2[j - 1];

    for (int i = 1; i <= s1.Length; i++)
    {
        int[] current = new int[s2.Length + 1];
        current[0] = previous[0] + s1[i - 1];
        for (int j = 1; j <= s2.Length; j++)
        {
            if (s1[i - 1] == s2[j - 1])
                current[j] = previous[j - 1];
            else
                current[j] = Math.Min(previous[j] + s1[i - 1], current[j - 1] + s2[j - 1]);
        }
        previous = current;
    }
    return previous[s2.Length];
}

static void Check(int actual, int expected, string label)
{
    if (actual != expected)
        throw new InvalidOperationException($"Failed {label}: expected {expected}, got {actual}");
}

Check(MinimumDeleteSum("sea", "eat"), 231, "official example 1");
Check(MinimumDeleteSum("delete", "leet"), 403, "official example 2");
Check(MinimumDeleteSum("a", "a"), 0, "identical strings");
Check(MinimumDeleteSum("a", "b"), 195, "delete either different letter");
Check(MinimumDeleteSum("abc", ""), 294, "empty second prefix");
Console.WriteLine("All minimum ASCII delete sum checks passed.");
```

## Correctness argument

Let `dp[i,j]` be the minimum deletion sum that makes the first `i` characters of `s1` and first `j` characters of `s2` equal. If one prefix is empty, every character in the other must be deleted, giving cumulative character values. If the final characters match, an optimal solution can retain this common character: removing it from both prefixes leaves the same feasible earlier equal strings and cannot increase cost. Thus the value is the diagonal state. If they differ, the equal result cannot retain both as corresponding final characters; at least one must be deleted. Deleting the first-side final character costs its value plus `dp[i-1,j]`; deleting the second costs its value plus `dp[i,j-1]`. Taking the lesser covers every optimum. Induction over prefix lengths proves the recurrence, and the rolling arrays compute exactly those rows.

## Step-by-step dry run

For `"sea"` and `"eat"`, the optimal retained common subsequence is `"ea"`. Delete `s` from the first string at cost 115 and `t` from the second at cost 116, total 231. The DP compares these possible deletions and other alignments; the terminal cell is 231.

## Time complexity

`O(nm)` for the two prefix dimensions, with constant work per cell.

## Space complexity

`O(m)` for two rows of length `m+1`, where `m = s2.Length`.

## Edge-case tests

Assertions cover both official examples, identical strings, one-character mismatch, and an empty prefix in the recurrence. The empty-string assertion exercises an internal boundary state; official input strings themselves are nonempty.

## Reflection questions

1. Why can equal final characters be retained without increasing the optimum?
2. Why would a unit cost of one fail for this problem?
3. What additional data would be needed to reconstruct the characters kept or deleted after rolling rows?
