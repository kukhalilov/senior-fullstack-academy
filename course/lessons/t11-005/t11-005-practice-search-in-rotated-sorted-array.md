# binary search, bounds, rotated arrays, and monotone answers — Problem: Search in Rotated Sorted Array

## Goals

- Identify which side of a midpoint is sorted in a rotated array of distinct values.
- Use that side's value interval to discard the other half.
- Preserve O(log n) time without first finding the rotation pivot.

## Problem statement

An ascending array of distinct integers may have been left-rotated at an unknown index. Given the rotated array nums and target, return its index if present, otherwise -1. The algorithm must run in O(log n).

## Input constraints

- 1 <= nums.Length <= 5,000.
- -10,000 <= nums[i], target <= 10,000.
- All array values are distinct.
- nums is ascending before a possible rotation.

## Examples with expected output

1. nums = [4,5,6,7,0,1,2], target = 0 -> 4.
2. nums = [4,5,6,7,0,1,2], target = 3 -> -1.
3. nums = [1], target = 0 -> -1.
4. nums = [3,1], target = 1 -> 1.

## Clarifying assumptions

- Values are distinct; duplicate-aware rotated search is a different variant.
- Return a zero-based index or -1.
- The array can be unrotated; the same elimination logic works.
- The array is not modified.

## Progressive hints

1. At each step, compare the endpoints of the left half to determine whether it is sorted.
2. If left through mid is sorted, check whether target lies in `[nums[left],nums[mid])`.
3. Otherwise the right half must be sorted; check whether target lies in `(nums[mid],nums[right]]`.
4. Discard mid after an unsuccessful comparison because values are distinct and mid is not the target.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int Search(int[] nums, int target)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        int left = 0, right = nums.Length - 1;

        while (left <= right)
        {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;

            if (nums[left] <= nums[mid])
            {
                if (nums[left] <= target && target < nums[mid]) right = mid - 1;
                else left = mid + 1;
            }
            else
            {
                if (nums[mid] < target && target <= nums[right]) left = mid + 1;
                else right = mid - 1;
            }
        }
        return -1;
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(Search(new[] { 4, 5, 6, 7, 0, 1, 2 }, 0), 4, "Example 1");
        AssertEqual(Search(new[] { 4, 5, 6, 7, 0, 1, 2 }, 3), -1, "Example 2");
        AssertEqual(Search(new[] { 1 }, 0), -1, "Example 3");
        AssertEqual(Search(new[] { 3, 1 }, 1), 1, "Two values");
        AssertEqual(Search(new[] { 1, 2, 3, 4 }, 4), 3, "Unrotated");
        Console.WriteLine("All Search in Rotated Sorted Array checks passed.");
    }
}
```

## Correctness argument

At each iteration target, if present, remains in `[left,right]`. With distinct values, if `nums[left] <= nums[mid]`, the left half is sorted. If target lies between nums[left] inclusive and nums[mid] exclusive, retain that half; otherwise target cannot be there, so discard it. If the left half is not sorted, the right half must be sorted; retain it exactly when target lies above nums[mid] and at most nums[right]. Equality at mid is checked first. Each unsuccessful iteration discards mid and at least one side while preserving any possible target, so the interval shrinks. If it becomes empty, target is absent.

## Step-by-step dry run

For `[4,5,6,7,0,1,2]`, target 0: mid=3, value 7; left half `[4,5,6,7]` is sorted, but 0 is outside it, so move left to 4. Mid=5, value 1; left half `[0,1]` is sorted and contains 0, so move right to 4. Mid=4 returns the target.

## Time complexity

O(log n), because every iteration discards at least half of the candidate interval.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- Find the minimum/pivot first, then binary-search one sorted portion. This is also O(log n) but uses two phases and additional boundary reasoning.
- A linear scan works in O(n) without relying on rotation structure, useful for very small inputs.
- With duplicates, `nums[left] == nums[mid] == nums[right]` may reveal no sorted half; safely shrinking can take O(n) in the worst case, so the distinct-value guarantee is important to the O(log n) claim.

## Common mistakes and gotchas

- Applying the formula for a globally sorted array directly to rotated data.
- Using inclusive comparisons on both sides so target can belong to neither or both halves.
- Forgetting to check equality at mid before choosing a half.
- Claiming logarithmic behavior with duplicates without addressing ambiguous equal endpoints.
- Setting `right=mid` or `left=mid` in a closed interval and failing to make progress.

## Edge-case tests

- One-element array.
- Two-element rotated array.
- Target at the rotation boundary.
- Target absent in the gap between the two sorted runs.
- Unrotated array.
- Target at either endpoint.

## Reflection questions

1. How do you know at least one half is sorted?
2. Why does distinctness help identify the sorted side?
3. Which target inequalities define membership in each half?
4. What complexity change may occur when duplicates obscure the sorted side?

Source: [LeetCode: Search in Rotated Sorted Array](https://leetcode.com/problems/search-in-rotated-sorted-array/).
