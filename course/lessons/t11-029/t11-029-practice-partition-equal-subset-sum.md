# knapsack, subset-sum, and resource-allocation DP — Problem: Partition Equal Subset Sum

## Goals
- Reduce an equal two-way partition to one exact subset-sum target.
- Use a Boolean 0/1 capacity DP with descending updates.
- Prove the complement argument and distinguish parity from reachability.

## Problem statement

Given a positive-integer array `nums`, return whether it can be partitioned into two subsets with equal sums. Every input index must belong to exactly one subset.

## Input constraints
- `1 <= nums.Length <= 200`.
- `1 <= nums[i] <= 100`.

## Examples with expected output
- `[1,5,11,5] -> true` (`[11]` and `[1,5,5]`).
- `[1,2,3,5] -> false`.
- `[1,1] -> true`.

## Clarifying assumptions

Array occurrences are distinct choices even if their values match. The total is at most 20,000, so a Boolean array indexed through half the total is feasible. An even total is necessary but not sufficient; an exact subset must still be reachable.

## Progressive hints
1. Let S be the total. If S is odd, two equal integer sums are impossible.
2. Otherwise, one side must sum to S/2; its complement automatically does too.
3. Use descending subset-sum updates so each array element contributes at most once.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static bool CanPartition(int[] nums)
    {
        long total = 0;
        foreach (int value in nums) total += value;
        if ((total & 1) != 0) return false;
        int target = checked((int)(total / 2));

        var reachable = new bool[target + 1];
        reachable[0] = true;
        foreach (int value in nums)
            for (int sum = target; sum >= value; sum--)
                reachable[sum] |= reachable[sum - value];
        return reachable[target];
    }

    static void Check(bool expected, int[] nums)
    {
        bool actual = CanPartition(nums);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(true, new[] { 1, 5, 11, 5 });
        Check(false, new[] { 1, 2, 3, 5 });
        Check(true, new[] { 1, 1 });
        Check(false, new[] { 1, 2, 5 });
        Check(true, new[] { 2, 2, 3, 3 });
        Console.WriteLine("Partition Equal Subset Sum checks passed.");
    }
}
```

## Correctness argument

After processing the first i values, `reachable[s]` is true exactly when some subset of those i indexed values sums to s. Initially only the empty subset reaches zero. For each value, the descending update combines the previous state `s-value` with that value once, while retaining the skip state; descending order prevents reusing the current value. By induction, after all items `reachable[S/2]` answers whether one half exists. If it exists, the remaining elements sum to the other half; if an equal partition exists, either side witnesses that target. Odd totals are correctly rejected because an integer sum cannot split equally.

## Step-by-step dry run

For `[1,5,11,5]`, total is 22 and target is 11. Start with only sum 0 reachable. After processing 1 and the first 5, sums 1, 5, and 6 are reachable. Processing 11 marks 11 directly; the final 5 is not needed. The complement `[1,5,5]` also sums to 11.

## Time complexity

`O(nW)`, where `W=S/2` and n is item count.

## Space complexity

`O(W)` Boolean states.

## Edge-case tests
- Both official examples are asserted.
- Two equal values partition successfully.
- An even total with no half-sum subset is rejected.
- A second subset of equal-valued items remains valid because indices are separate.

## Reflection questions
1. Why is checking even total alone insufficient?
2. Why does descending sum order prevent reusing a value?
3. What changes if numbers may be negative?

Source: [LeetCode: Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/).
