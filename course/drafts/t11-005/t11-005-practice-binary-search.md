# binary search, bounds, rotated arrays, and monotone answers — Problem: Binary Search

## Goals

- Search a sorted array with a closed interval and a clear candidate invariant.
- Ensure every comparison strictly reduces the remaining interval.
- Return the specified not-found sentinel without using it as an array index.

## Problem statement

Given an array of distinct integers nums sorted in ascending order and an integer target, return the index of target if it is present; otherwise return -1.

## Input constraints

- 1 <= nums.Length <= 10,000.
- -10,000 <= nums[i] <= 10,000.
- All values in nums are distinct and sorted ascending.
- -10,000 <= target <= 10,000.

## Examples with expected output

1. nums = [-1,0,3,5,9,12], target = 9 -> 4.
2. nums = [-1,0,3,5,9,12], target = 2 -> -1.
3. nums = [5], target = 5 -> 0.
4. nums = [5], target = -1 -> -1.

## Clarifying assumptions

- The input is guaranteed to be sorted ascending and contain no duplicates.
- Any matching index would be correct; distinctness makes it unique.
- Return -1 when absent.
- The method does not mutate nums.

## Progressive hints

1. Let the closed interval `[left,right]` contain every remaining possible position.
2. Check its midpoint. If the value is too small, discard midpoint and everything left; if too large, discard midpoint and everything right.
3. Use `left <= right`; when a value is discarded, remove mid with `mid+1` or `mid-1`.
4. When the interval becomes empty, no matching value remains.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int Search(int[] nums, int target)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));

        int left = 0;
        int right = nums.Length - 1;
        while (left <= right)
        {
            int mid = left + (right - left) / 2;
            if (nums[mid] == target) return mid;
            if (nums[mid] < target) left = mid + 1;
            else right = mid - 1;
        }
        return -1;
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(Search(new[] { -1, 0, 3, 5, 9, 12 }, 9), 4, "Example 1");
        AssertEqual(Search(new[] { -1, 0, 3, 5, 9, 12 }, 2), -1, "Example 2");
        AssertEqual(Search(new[] { 5 }, 5), 0, "Single found");
        AssertEqual(Search(new[] { 5 }, -1), -1, "Single absent");
        AssertEqual(Search(Array.Empty<int>(), 3), -1, "Empty defensive case");
        Console.WriteLine("All Binary Search checks passed.");
    }
}
```

## Correctness argument

At each iteration, if target exists, its index remains in `[left,right]`. This is true initially. If `nums[mid] < target`, ascending order means all indices through mid are too small, so setting left to mid+1 preserves the invariant. If `nums[mid] > target`, all indices from mid onward are too large, so setting right to mid-1 preserves it. Equality returns the target index. Each unsuccessful iteration removes mid and at least one side, strictly reducing the number of candidates. When left exceeds right, the candidate interval is empty; by the invariant, target is absent and -1 is correct.

## Step-by-step dry run

For `[-1,0,3,5,9,12]`, target 9: start `[0,5]`, mid 2 has value 3, so search `[3,5]`. Mid 4 has value 9 and returns index 4.

## Time complexity

O(log n), since the number of candidates is approximately halved per iteration.

## Space complexity

O(1) auxiliary space; the search is iterative.

## Alternatives and tradeoffs

- A linear scan is O(n) and works on unsorted data. For a small array or one search, its simplicity may be preferable.
- Lower bound can also find the target, followed by an equality check; that pattern is useful when extending to insertion position and duplicates.

## Common mistakes and gotchas

- Using `left < right` with a closed exact-search interval, which can skip the final candidate.
- Setting left=mid or right=mid in this closed search, potentially failing to make progress.
- Using `(left+right)/2` where large endpoints can overflow; use the difference-first form.
- Returning mid after the loop even though mid may be stale or out of range.
- Applying binary search when the input is not sorted.

## Edge-case tests

- Target at the first or last index.
- Target absent below or above the values.
- One-element array.
- Empty array as defensive behavior.
- Two-element array with each possible found/absent target.

## Reflection questions

1. What is the candidate invariant?
2. Why are mid+1 and mid-1 used after an unsuccessful comparison?
3. What does an empty closed interval look like?
4. How would the question change if duplicates were allowed and the first one were required?

Source: [LeetCode: Binary Search](https://leetcode.com/problems/binary-search/).
