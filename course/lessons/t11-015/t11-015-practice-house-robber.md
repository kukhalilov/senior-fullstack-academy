# dynamic programming states, recurrences, and tabulation — Problem: House Robber

## Goals
- Maximize the amount selected from a line without taking adjacent houses.
- Derive a take-or-skip recurrence.
- Compress the table to two previous state values.

## Problem statement
Given a nonempty array of nonnegative house values, choose a subset with no adjacent indices and return the maximum sum.

## Input constraints
- 1 <= nums.Length <= 100.
- 0 <= nums[i] <= 400.

## Examples with expected output
- [1,2,3,1] -> 4.
- [2,7,9,3,1] -> 12.
- [2,1,1,2] -> 4.

## Clarifying assumptions
- Houses form a line, not a circle.
- Adjacent means neighboring indices.
- Choosing no houses is allowed; because all values are nonnegative, the optimum is never negative.

## Progressive hints
1. For a prefix ending at i, either rob house i or skip it.
2. Taking i excludes i-1 and adds nums[i] to the optimum through i-2.
3. Skipping i leaves the optimum through i-1.
4. Keep only the two previous optimum values.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int Rob(int[] nums)
    {
        int twoBack = 0;
        int oneBack = 0;
        foreach (int amount in nums)
        {
            int current = Math.Max(oneBack, twoBack + amount);
            twoBack = oneBack;
            oneBack = current;
        }
        return oneBack;
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(4, Rob(new[] { 1, 2, 3, 1 }));
        Check(12, Rob(new[] { 2, 7, 9, 3, 1 }));
        Check(4, Rob(new[] { 2, 1, 1, 2 }));
        Check(0, Rob(new[] { 0 }));
        Check(400, Rob(new[] { 400 }));
        Console.WriteLine("House Robber checks passed.");
    }
}
```

## Correctness argument

Let dp[i] be the maximum sum from indices 0 through i, and use dp[-1]=dp[-2]=0 as empty-prefix bases. Every valid solution for the prefix either skips i, giving at most dp[i-1], or takes i, which forbids i-1 and gives nums[i]+dp[i-2]. Both alternatives are feasible and cover all solutions, so dp[i]=max(dp[i-1], nums[i]+dp[i-2]). The two rolling variables hold exactly dp[i-2] and dp[i-1] before each iteration; updating them computes dp[i] and preserves this invariant.

## Step-by-step dry run

For [2,7,9,3,1], start with twoBack=0 and oneBack=0. Processing 2 yields 2; 7 yields 7; 9 yields max(7,2+9)=11; 3 yields max(11,7+3)=11; 1 yields max(11,11+1)=12.

## Time complexity

O(n), one transition per house.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- A full dp array is easier to inspect and allows reconstruction of which houses were selected, at O(n) extra space.
- A stored decision bit per state can reconstruct a solution with less than a full numeric table.
- For a circular street, solve two linear subproblems excluding either the first or last house; this file's recurrence alone does not handle the wraparound adjacency.

## Common mistakes and gotchas

- Taking house i and adding dp[i-1], which permits adjacent houses.
- Initializing all states to zero and mishandling negative values; this task gives nonnegative values and permits choosing none.
- Applying the linear recurrence to the circular variant.
- Updating rolling values in the wrong order and overwriting dp[i-2] before it is used.

## Edge-case tests

- One house returns its value.
- All zeros returns zero.
- Two houses returns the larger value.
- Equal separated maxima can both be selected.
- A circular variant requires different boundary handling.

## Reflection questions
1. Why do the two final-decision cases cover all valid subsets?
2. What do twoBack and oneBack mean before each loop iteration?
3. How would you reconstruct one optimal set of house indices?

## Source
- [House Robber](https://leetcode.com/problems/house-robber/)
