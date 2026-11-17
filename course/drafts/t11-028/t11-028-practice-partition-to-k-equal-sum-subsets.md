# constraint search, pruning, and puzzle backtracking — Problem: Partition to K Equal Sum Subsets

## Goals
- Reject impossible totals and oversized values before searching.
- Assign every positive array item to one of k equal-capacity buckets.
- Prune equivalent bucket choices safely because bucket labels are interchangeable.

## Problem statement

Return whether `nums` can be divided into k nonempty subsets whose sums are equal. Every array element must be used exactly once.

## Input constraints
- `1 <= k <= nums.Length <= 16`.
- `1 <= nums[i] <= 10^4`.
- Each distinct value occurs between 1 and 4 times.

## Examples with expected output
- `nums=[4,3,2,3,5,2,1], k=4 -> true`; each subset can sum to 5.
- `nums=[1,2,3,4], k=3 -> false` because the total is not divisible by 3.
- `nums=[2,2,2,2], k=2 -> true`.

## Clarifying assumptions

All values are positive and each input occurrence is a distinct item even when values repeat. Equal target sums and positive values imply every bucket is nonempty. A symmetry optimization may skip trying the same next value in buckets with equal current loads because those buckets have identical future constraints.

The implementation sorts `nums` in place; clone it first if the caller needs the original order preserved.

## Progressive hints
1. Compute `target = total/k`; reject if the total is not divisible or any item exceeds target.
2. Sort items descending and recursively place each into a bucket with enough remaining capacity.
3. Skip bucket loads already tried at this recursion depth; permuting bucket labels does not create a new assignment feasibility state.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static bool CanPartitionKSubsets(int[] nums, int k)
    {
        long total = 0;
        foreach (int value in nums) total += value;
        if (total % k != 0) return false;
        long target = total / k;
        Array.Sort(nums);
        Array.Reverse(nums);
        if (nums[0] > target) return false;

        var loads = new long[k];
        bool Search(int index)
        {
            if (index == nums.Length) return true;
            var triedLoads = new HashSet<long>();
            for (int bucket = 0; bucket < k; bucket++)
            {
                if (!triedLoads.Add(loads[bucket])) continue;
                if (loads[bucket] + nums[index] > target) continue;
                loads[bucket] += nums[index];
                if (Search(index + 1)) return true;
                loads[bucket] -= nums[index];
            }
            return false;
        }

        return Search(0);
    }

    static void Check(bool expected, int[] nums, int k)
    {
        bool actual = CanPartitionKSubsets((int[])nums.Clone(), k);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(true, new[] { 4, 3, 2, 3, 5, 2, 1 }, 4);
        Check(false, new[] { 1, 2, 3, 4 }, 3);
        Check(true, new[] { 2, 2, 2, 2 }, 2);
        Check(false, new[] { 5, 5, 5, 5, 6 }, 4);
        Check(true, new[] { 1 }, 1);
        Console.WriteLine("Partition to K Equal Sum Subsets checks passed.");
    }
}
```

## Correctness argument

The divisibility and maximum-item checks reject only instances that cannot fit equal target sums. Thereafter the recursion assigns each array occurrence exactly once, in descending order, and never lets a bucket exceed target. When all items are assigned, the total sum is `k*target`; because no bucket exceeds target, every bucket must equal target, so the assignment is valid. Every feasible partition has some bucket for the next item, and the search considers each distinct current bucket load. Skipping another bucket with a load already tried is safe because swapping those bucket labels maps any completion of one choice to a completion of the other. Thus the search is sound and complete.

## Step-by-step dry run

For `[4,3,2,3,5,2,1]`, total is 20, k is 4, and target is 5. Descending order begins 5, 4, 3, 3, 2, 2, 1. The 5 fills one bucket; 4 pairs with 1; the two 3s pair with the two 2s. All four loads reach 5. When several empty buckets have the same load, only one needs to be tried for the next value.

## Time complexity

Worst case is `O(k^n)` assignments for n items and k labeled buckets; sorting costs `O(n log n)`. Symmetry pruning often reduces the search substantially but does not eliminate the exponential worst case.

## Space complexity

`O(nk)` in the worst case for recursion frames and their per-depth duplicate-load sets, plus `O(k)` bucket loads, excluding the cloned test input.

## Edge-case tests
- Both official examples are asserted.
- Repeated equal items verify identical-load pruning.
- An oversized item and indivisible total are rejected.
- `k=1` with one item succeeds; positive values ensure nonempty buckets when target is reached.

## Reflection questions
1. Why is the all-items-assigned base case enough to infer every bucket sum equals target?
2. Why is trying one of several equal-load buckets sufficient?
3. Would skipping equal-load buckets remain valid if buckets had different identities or restrictions?

Source: [LeetCode: Partition to K Equal Sum Subsets](https://leetcode.com/problems/partition-to-k-equal-sum-subsets/).
