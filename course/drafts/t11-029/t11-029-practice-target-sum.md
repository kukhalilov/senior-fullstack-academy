# knapsack, subset-sum, and resource-allocation DP — Problem: Target Sum

## Goals
- Convert plus/minus choices into a count of 0/1 subsets.
- Apply range and parity feasibility checks before allocating the DP array.
- Account for zero values as distinct sign choices that multiply the count.

## Problem statement

Place `+` or `-` before each number in `nums`, then add the signed values. Return the number of sign assignments whose sum equals `target`.

## Input constraints
- `1 <= nums.Length <= 20`.
- `0 <= nums[i] <= 1000` and total sum is at most 1000.
- `-1000 <= target <= 1000`.

## Examples with expected output
- `[1,1,1,1,1], target=3 -> 5`.
- `[1], target=1 -> 1`.
- `[0,0,1], target=1 -> 4`.
- `[1,2,3], target=0 -> 2`.

## Clarifying assumptions

Each index receives one sign, so equal-valued entries remain distinct decisions. Zero may be signed either way, producing two distinct expressions with the same numeric value. Let S be total and N be the sum assigned a minus sign. Then `S-2N=target`, so `N=(S-target)/2`. The target must be in `[-S,S]` and the numerator must be nonnegative and even.

## Progressive hints
1. Let P be the plus-sum and N the minus-sum; write equations for their difference and total.
2. Solve `P+N=S` and `P-N=target` for N.
3. Count 0/1 subsets summing to `(S-target)/2`; process a zero once so it doubles every count.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static int FindTargetSumWays(int[] nums, int target)
    {
        int total = 0;
        foreach (int value in nums) total += value;
        if (target < -total || target > total) return 0;
        int numerator = total - target;
        if ((numerator & 1) != 0) return 0;
        int subsetTarget = numerator / 2;

        var ways = new int[subsetTarget + 1];
        ways[0] = 1;
        foreach (int value in nums)
            for (int sum = subsetTarget; sum >= value; sum--)
                ways[sum] += ways[sum - value];
        return ways[subsetTarget];
    }

    static void Check(int expected, int[] nums, int target)
    {
        int actual = FindTargetSumWays(nums, target);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(5, new[] { 1, 1, 1, 1, 1 }, 3);
        Check(1, new[] { 1 }, 1);
        Check(4, new[] { 0, 0, 1 }, 1);
        Check(2, new[] { 1, 2, 3 }, 0);
        Check(0, new[] { 1, 2 }, 5);
        Check(0, new[] { 1, 2 }, 0);
        Check(4, new[] { 0, 0 }, 0);
        Console.WriteLine("Target Sum checks passed.");
    }
}
```

## Correctness argument

Every sign assignment partitions indices into a minus subset N and the remaining plus subset P. Since `P+N=S` and `P-N=target`, it corresponds one-to-one with a minus-index subset of sum `(S-target)/2`. The range and parity checks reject exactly cases where this target is impossible as an integer in `[0,S]`. The descending count DP counts every indexed subset exactly once. For a zero, including or excluding that zero reaches the same sum from two distinct index choices, so the update doubles the count as required. Thus the returned count equals the number of sign expressions.

## Step-by-step dry run

For five ones and target 3, S=5 and the minus-subset target is `(5-3)/2=1`. Any one of the five indices can be assigned minus while the other four are plus, yielding five expressions. For `[0,0,1]` and target 1, the target subset sum is zero; each zero may independently receive either sign, producing four assignments.

## Time complexity

`O(nT)`, where T is `(S-target)/2` after feasibility checks; bounded by `O(nS)`.

## Space complexity

`O(T)` counts. The maximum number of assignments is `2^20`, which fits `int` under the constraints.

## Edge-case tests
- The official examples are asserted.
- Target outside `[-S,S]` returns zero.
- A range-valid but wrong-parity target returns zero.
- Zeros multiply counts by two each.
- All-zero arrays have `2^n` ways to make target zero.

## Reflection questions
1. Derive the subset target if you instead choose the plus subset.
2. Why does a zero update the same `ways[sum]` entry once rather than loop indefinitely?
3. Why must you check parity before integer division?

Source: [LeetCode: Target Sum](https://leetcode.com/problems/target-sum/).
