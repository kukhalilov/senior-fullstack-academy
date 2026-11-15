# dynamic programming states, recurrences, and tabulation — Problem: Delete and Earn

## Goals
- Convert repeated values into total points per value.
- Recognize that choosing value x conflicts with x-1 and x+1.
- Apply a take-or-skip recurrence over the bounded value range.

## Problem statement
Choose a value from nums any number of times. Each selected occurrence earns its value; selecting x deletes every occurrence of x-1 and x+1. Return the maximum points obtainable.

## Input constraints
- 1 <= nums.Length <= 20,000.
- 1 <= nums[i] <= 10,000.

## Examples with expected output
- [3,4,2] -> 6.
- [2,2,3,3,3,4] -> 9.
- [1,1,1] -> 3.

## Clarifying assumptions
- Selecting a value x earns x for each occurrence of x that is selected; all duplicates of x are mutually compatible.
- Once a value is chosen, adjacent numeric values are unavailable.
- The input array is not modified.

## Progressive hints
1. If value x is chosen, take all its copies: they add points without creating an x-versus-x conflict.
2. Replace each value by points[x]=x*frequency[x].
3. The resulting value line has a conflict only between neighboring indices.
4. Use the House Robber take-or-skip recurrence over the value range.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int DeleteAndEarn(int[] nums)
    {
        if (nums.Length == 0) return 0;
        int maxValue = 0;
        foreach (int value in nums)
            maxValue = Math.Max(maxValue, value);

        var frequency = new int[maxValue + 1];
        foreach (int value in nums)
            frequency[value]++;

        long twoBack = 0;
        long oneBack = 0;
        for (int value = 1; value <= maxValue; value++)
        {
            long points = (long)value * frequency[value];
            long current = Math.Max(oneBack, twoBack + points);
            twoBack = oneBack;
            oneBack = current;
        }
        return checked((int)oneBack);
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(6, DeleteAndEarn(new[] { 3, 4, 2 }));
        Check(9, DeleteAndEarn(new[] { 2, 2, 3, 3, 3, 4 }));
        Check(3, DeleteAndEarn(new[] { 1, 1, 1 }));
        Check(10, DeleteAndEarn(new[] { 5, 5 }));
        Check(0, DeleteAndEarn(Array.Empty<int>()));
        Console.WriteLine("Delete and Earn checks passed.");
    }
}
```

## Correctness argument

For each value x, selecting any copy makes all copies of x-1 and x+1 unavailable, while selecting additional copies of x does not introduce a new conflict. Therefore an optimum either takes all x copies, earning points[x], or takes none. The remaining conflicts are exactly between adjacent value indices. Let dp[x] be the maximum points using values up to x. If x is skipped, the value is dp[x-1]; if taken, x-1 is forbidden and the value is points[x]+dp[x-2]. These choices cover all optima, so dp[x]=max(dp[x-1],points[x]+dp[x-2]). Rolling the previous two states computes the result.

## Step-by-step dry run

For [2,2,3,3,3,4], points[2]=4, points[3]=9, points[4]=4. At value 2, best=4. At value 3, choose between 4 and 9, so best=9. At value 4, choose between 9 and 4+4=8, so the result remains 9.

## Time complexity

O(n+U), where n is input length and U is the maximum input value (at most 10,000).

## Space complexity

O(U) for the frequency array; DP itself uses O(1) rolling values.

## Alternatives and tradeoffs

- A sorted frequency dictionary can process only distinct values and avoid allocating up to U when values are sparse; gaps larger than one reset adjacency dependence.
- A full points and DP table is easier to trace and reconstruct but uses O(U) additional arrays.
- This transformation does not mean every value-based problem is House Robber; the conflict relation must be exactly between neighbors.

## Common mistakes and gotchas

- Counting each duplicate x as a separate decision and accidentally selecting x-1 between copies of x.
- Earning only one x instead of x times its frequency.
- Treating a gap as an adjacency conflict; values 2 and 4 can both be selected.
- Multiplying int value by frequency without considering intermediate type bounds.
- Applying the transformation when choosing x conflicts with a different neighborhood than x±1.

## Edge-case tests

- All copies have the same value.
- Two adjacent values compete.
- Values separated by a gap can both be taken.
- The smallest value is 1.
- The maximum value reaches the array boundary.

## Reflection questions
1. Why can an optimum take all copies of one value or none?
2. How does frequency aggregation transform the conflict graph?
3. How would the recurrence change if choosing x conflicted with x-2 as well?

## Source
- [Delete and Earn](https://leetcode.com/problems/delete-and-earn/)
