# knapsack, subset-sum, and resource-allocation DP — Problem: Ones and Zeroes

## Goals
- Model each binary string as an item consuming two independent resources.
- Use a two-dimensional 0/1 knapsack state for zero and one budgets.
- Scan both capacities downward so each string is selected at most once.

## Problem statement

Given binary strings `strs` and budgets m zeroes and n ones, return the largest subset size whose total number of zeroes is at most m and total number of ones is at most n.

## Input constraints
- `1 <= strs.Length <= 600`.
- `1 <= strs[i].Length <= 100`.
- Each string contains only `'0'` and `'1'`.
- `1 <= m,n <= 100`.

## Examples with expected output
- `strs=["10","0001","111001","1","0"], m=5, n=3 -> 4`.
- `strs=["10","0","1"], m=1, n=1 -> 2`.
- `strs=["0","1"], m=1, n=1 -> 2`.

## Clarifying assumptions

Each string is an indexed item and may be selected once or skipped. The constraints are “at most” budgets, so `dp[m,n]` stores the best count using no more than those capacities. Every string has positive length, so it consumes at least one of the two resources.

## Progressive hints
1. Count zeroes z and ones o in each string; its cost is the pair `(z,o)` and its value is 1.
2. Let `dp[zBudget,oBudget]` be the maximum item count within those budgets.
3. For each string, scan both budgets downward and update from `(zBudget-z,oBudget-o)`.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static int FindMaxForm(string[] strs, int m, int n)
    {
        var dp = new int[m + 1, n + 1];
        foreach (string value in strs)
        {
            int zeroes = 0;
            foreach (char ch in value) if (ch == '0') zeroes++;
            int ones = value.Length - zeroes;

            for (int z = m; z >= zeroes; z--)
                for (int o = n; o >= ones; o--)
                    dp[z, o] = Math.Max(dp[z, o], dp[z - zeroes, o - ones] + 1);
        }
        return dp[m, n];
    }

    static void Check(int expected, string[] strs, int m, int n)
    {
        int actual = FindMaxForm(strs, m, n);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(4, new[] { "10", "0001", "111001", "1", "0" }, 5, 3);
        Check(2, new[] { "10", "0", "1" }, 1, 1);
        Check(2, new[] { "0", "1" }, 1, 1);
        Check(1, new[] { "111" }, 1, 3);
        Check(0, new[] { "00" }, 1, 1);
        Console.WriteLine("Ones and Zeroes checks passed.");
    }
}
```

## Correctness argument

After processing some prefix of strings, `dp[z,o]` is the largest number of those strings whose total zeroes and ones are at most z and o. A current string either is skipped (keep the old state) or selected once, adding one to the count from a state with its zero/one costs removed. Descending both capacities ensures the predecessor still belongs to the previous string prefix, so the current string cannot feed its own update and be selected twice. The recurrence considers both choices for each string and stores their maximum, establishing the invariant by induction. The final state uses the full allowed budgets and is the largest feasible subset size.

## Step-by-step dry run

For strings `["0","1"]` and budgets `(1,1)`, the first string updates states with at least one zero budget to count 1. The second string updates states with at least one one budget from the previous item layer; at `(1,1)` the result becomes 2. Both resources are accounted for separately.

## Time complexity

`O(L + N*m*n)`, where L is total input characters and N is string count.

## Space complexity

`O(m*n)` integer states.

## Edge-case tests
- Both official examples are asserted.
- One zero and one one use separate budgets.
- A string exceeding the zero budget is not selected.
- A string consuming only one resource dimension is handled by the same recurrence.

## Reflection questions
1. Why must both capacity loops descend?
2. What would go wrong if strings were processed as unbounded items?
3. Why does `dp[m,n]` represent “at most” rather than “exactly” the budgets?

Source: [LeetCode: Ones and Zeroes](https://leetcode.com/problems/ones-and-zeroes/).
