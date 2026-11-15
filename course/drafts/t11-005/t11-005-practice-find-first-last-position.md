# binary search, bounds, rotated arrays, and monotone answers — Problem: Find First and Last Position of Element in Sorted Array

## Goals

- Use lower and upper bounds to locate a duplicate value's full range.
- Return a not-found sentinel safely, including for an empty array.
- Meet O(log n) without scanning across duplicates.

## Problem statement

Given a non-decreasing integer array nums and target, return the starting and ending indices of target. If target does not occur, return `[-1,-1]`. The algorithm must run in O(log n).

## Input constraints

- 0 <= nums.Length <= 100,000.
- -1,000,000,000 <= nums[i], target <= 1,000,000,000.
- nums is sorted in non-decreasing order and may contain duplicates.

## Examples with expected output

1. nums = [5,7,7,8,8,10], target = 8 -> [3,4].
2. nums = [5,7,7,8,8,10], target = 6 -> [-1,-1].
3. nums = [], target = 0 -> [-1,-1].
4. nums = [2,2,2], target = 2 -> [0,2].

## Clarifying assumptions

- Return zero-based inclusive endpoints.
- The left endpoint is the first equal value; the right endpoint is the last equal value.
- Empty input is valid.
- A bound result equal to n is a sentinel boundary and must not be indexed.

## Progressive hints

1. First find the first index with value >= target.
2. If that position is n or its value differs, return `[-1,-1]`.
3. Otherwise find the first index with value > target; the last occurrence is one position before it.
4. Keep each search logarithmic. Do not scan from the first match across repeated values.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    private static int LowerBound(int[] nums, int target)
    {
        int left = 0, right = nums.Length;
        while (left < right)
        {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) left = mid + 1;
            else right = mid;
        }
        return left;
    }

    private static int UpperBound(int[] nums, int target)
    {
        int left = 0, right = nums.Length;
        while (left < right)
        {
            int mid = left + (right - left) / 2;
            if (nums[mid] <= target) left = mid + 1;
            else right = mid;
        }
        return left;
    }

    public static int[] SearchRange(int[] nums, int target)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        int first = LowerBound(nums, target);
        if (first == nums.Length || nums[first] != target) return new[] { -1, -1 };
        int afterLast = UpperBound(nums, target);
        return new[] { first, afterLast - 1 };
    }

    private static void AssertRange(int[] actual, int first, int last, string label)
    {
        if (actual.Length != 2 || actual[0] != first || actual[1] != last)
            throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertRange(SearchRange(new[] { 5, 7, 7, 8, 8, 10 }, 8), 3, 4, "Example 1");
        AssertRange(SearchRange(new[] { 5, 7, 7, 8, 8, 10 }, 6), -1, -1, "Example 2");
        AssertRange(SearchRange(Array.Empty<int>(), 0), -1, -1, "Example 3");
        AssertRange(SearchRange(new[] { 2, 2, 2 }, 2), 0, 2, "All equal");
        Console.WriteLine("All Find First and Last Position checks passed.");
    }
}
```

## Correctness argument

LowerBound returns the first position whose value is at least target. If it is n or not equal to target, no occurrence exists. Otherwise it is exactly the first occurrence. UpperBound returns the first position whose value is greater than target; every position from first through one before that boundary equals target because the array is sorted. Thus `[first,afterLast-1]` is the complete range. Each bound preserves its false/true partition invariant and halves the candidate interval, so each takes O(log n); no linear duplicate scan is used.

## Step-by-step dry run

For `[5,7,7,8,8,10]`, target 8: lower bound returns 3. Since nums[3] is 8, continue. Upper bound returns 5, the first value greater than 8. Return `[3,4]`.

## Time complexity

O(log n) for two binary searches.

## Space complexity

O(1) auxiliary space, excluding the fixed two-element result.

## Alternatives and tradeoffs

- One modified binary search can find one boundary and continue, but two explicit bound helpers make the duplicate contract easier to inspect.
- Finding any match then scanning outward is O(n) in an all-equal array and violates the logarithmic requirement.

## Common mistakes and gotchas

- Using exact search and returning the first matching midpoint, which may be an interior duplicate.
- Forgetting to check first==n before indexing.
- Returning upper bound itself as the last occurrence; it is one past the final match.
- Using `<=` in lower bound or `<` in upper bound, which changes the boundary.
- Scanning neighbors after binary search and claiming O(log n).

## Edge-case tests

- Empty input.
- Target absent between values or outside both ends.
- One matching value.
- Duplicates spanning the whole input.
- Duplicates at an array boundary.

## Reflection questions

1. Which predicate does lower bound locate?
2. Why does upper bound minus one give the last equal element?
3. Why is the first bound's equality check necessary?
4. How can these two bounds compute the total number of target occurrences?

Source: [LeetCode: Find First and Last Position of Element in Sorted Array](https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/).
