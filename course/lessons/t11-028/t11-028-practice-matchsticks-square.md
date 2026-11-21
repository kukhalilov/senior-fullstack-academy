# constraint search, pruning, and puzzle backtracking — Problem: Matchsticks to Square

## Goals
- Reduce square construction to four equal-capacity subset assignment.
- Use descending item order and skip equivalent side loads.
- Keep total and side arithmetic safe for the stated matchstick sizes.

## Problem statement

Given matchstick lengths, use every stick exactly once without breaking any stick to form a square. Return whether it is possible.

## Input constraints
- `1 <= matchsticks.Length <= 15`.
- `1 <= matchsticks[i] <= 10^8`.

## Examples with expected output
- `[1,1,2,2,2] -> true`.
- `[3,3,3,3,4] -> false`.
- `[1,1,1,1] -> true`.

## Clarifying assumptions

All sticks have positive lengths, and every stick must be assigned to exactly one side. Each side has target `sum/4`. Sides are interchangeable: their labels have no bearing on whether the remaining sticks can complete them. Sums are stored in `long` even though the maximum aggregate under the limit is within `int` range.

The implementation sorts `matchsticks` in place; clone it first if the caller needs the original order preserved.

## Progressive hints
1. Reject if total length is not divisible by four or the longest stick exceeds one side.
2. Sort descending and place each stick into a side without exceeding the target.
3. At one recursion depth, do not try another side whose current load equals a load already tested.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static bool Makesquare(int[] matchsticks)
    {
        long total = 0;
        foreach (int stick in matchsticks) total += stick;
        if (total % 4 != 0) return false;
        long target = total / 4;
        Array.Sort(matchsticks);
        Array.Reverse(matchsticks);
        if (matchsticks[0] > target) return false;

        var sides = new long[4];
        bool Search(int index)
        {
            if (index == matchsticks.Length) return true;
            var triedLoads = new HashSet<long>();
            for (int side = 0; side < 4; side++)
            {
                if (!triedLoads.Add(sides[side])) continue;
                if (sides[side] + matchsticks[index] > target) continue;
                sides[side] += matchsticks[index];
                if (Search(index + 1)) return true;
                sides[side] -= matchsticks[index];
            }
            return false;
        }
        return Search(0);
    }

    static void Check(bool expected, int[] sticks)
    {
        bool actual = Makesquare((int[])sticks.Clone());
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(true, new[] { 1, 1, 2, 2, 2 });
        Check(false, new[] { 3, 3, 3, 3, 4 });
        Check(true, new[] { 1, 1, 1, 1 });
        Check(false, new[] { 1, 1, 1 });
        Check(true, new[] { 100000000, 100000000, 100000000, 100000000 });
        Console.WriteLine("Matchsticks to Square checks passed.");
    }
}
```

## Correctness argument

If total length is not divisible by four or one stick is longer than a side, no square can use all sticks. Otherwise the recursion assigns each stick once and rejects any placement that exceeds the target side length. At the leaf all sticks are assigned, and their total is four times target; since each side is at most target, all four sides must equal target. Every valid square induces a bucket assignment considered by the search. Sides with equal current loads are interchangeable, so exploring only one such side cannot remove the only feasible completion. The algorithm therefore returns true exactly when a square assignment exists.

## Step-by-step dry run

For `[2,2,2,1,1]`, total is 8 and target 2. Sort to `[2,2,2,1,1]`. Place each 2 on a separate side; the two 1s then fill the fourth side. For `[3,3,3,3,4]`, total is 16 and target 4, but the longest stick is 4 and leaves no room for three positive sticks; after placing it, the remaining side capacities cannot be filled by 3s, so the search fails.

## Time complexity

Worst case is `O(4^n)` assignments for n matchsticks, plus `O(n log n)` sorting. Equal-side pruning reduces practical search but leaves exponential worst-case behavior.

## Space complexity

`O(n+4)` recursion and side loads, plus per-depth duplicate-load sets.

## Edge-case tests
- Both official examples are asserted.
- Four equal sticks form a square.
- Three sticks cannot form four positive-length sides.
- Four maximum-length sticks verify `long` arithmetic.

## Reflection questions
1. Why is it sufficient to track each side's current length rather than its member list?
2. Why may equal current side lengths be treated as symmetric?
3. How does descending order help expose capacity failure earlier?

Source: [LeetCode: Matchsticks to Square](https://leetcode.com/problems/matchsticks-to-square/).
