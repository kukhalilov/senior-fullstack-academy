# binary search, bounds, rotated arrays, and monotone answers — Problem: Search Insert Position

## Goals

- Implement lower bound as the first index whose value is not less than target.
- Return an insertion boundary even when the target is absent.
- Use a half-open interval with a sentinel boundary at n.

## Problem statement

Given a sorted array of distinct integers nums and a target, return its index if present. If absent, return the index where it should be inserted to keep nums sorted.

## Input constraints

- 1 <= nums.Length <= 10,000.
- -10,000 <= nums[i] <= 10,000.
- nums is sorted in ascending order with distinct values.
- -10,000 <= target <= 10,000.

## Examples with expected output

1. nums = [1,3,5,6], target = 5 -> 2.
2. nums = [1,3,5,6], target = 2 -> 1.
3. nums = [1,3,5,6], target = 7 -> 4.
4. nums = [1,3,5,6], target = 0 -> 0.

## Clarifying assumptions

- Return the lower-bound position: first index with value >= target.
- If every value is smaller, return nums.Length; this is a valid insertion position but not a valid element index.
- Distinctness is guaranteed, but the lower-bound method also works with duplicates if insertion before equals is acceptable.
- The input is not modified.

## Progressive hints

1. Think of a predicate: `nums[i] >= target` is false before the insertion point and true from it onward.
2. Search the half-open boundary interval `[0,n)` while preserving false indices before left and possible true indices at or after right.
3. If nums[mid] is below target, set left=mid+1; otherwise set right=mid.
4. When left equals right, that boundary is the insertion position, including n.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int SearchInsert(int[] nums, int target)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));

        int left = 0;
        int right = nums.Length;
        while (left < right)
        {
            int mid = left + (right - left) / 2;
            if (nums[mid] < target) left = mid + 1;
            else right = mid;
        }
        return left;
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(SearchInsert(new[] { 1, 3, 5, 6 }, 5), 2, "Example 1");
        AssertEqual(SearchInsert(new[] { 1, 3, 5, 6 }, 2), 1, "Example 2");
        AssertEqual(SearchInsert(new[] { 1, 3, 5, 6 }, 7), 4, "Example 3");
        AssertEqual(SearchInsert(new[] { 1, 3, 5, 6 }, 0), 0, "Example 4");
        AssertEqual(SearchInsert(new[] { 4 }, 4), 0, "Single found");
        Console.WriteLine("All Search Insert Position checks passed.");
    }
}
```

## Correctness argument

Maintain a half-open boundary search `[left,right]` over possible insertion positions, initially `[0,n]`, with elements before left known to be below target and positions at or beyond right known to be at least target. When `nums[mid] < target`, mid belongs before the insertion point, so left becomes mid+1. Otherwise mid may itself be the first value at least target, so right becomes mid. The interval width strictly decreases. At termination left=right is the first true boundary, or n when every array value is smaller. This is exactly the insertion position.

## Step-by-step dry run

For `[1,3,5,6]`, target 2: start `[0,4)`, mid 2 has 5, keep the left half by setting right=2. Mid 1 has 3, set right=1. Mid 0 has 1, set left=1. The boundary is 1; inserting 2 there preserves order.

## Time complexity

O(log n).

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- Linear scan finds the first value >= target in O(n), useful for very small or unsorted arrays only if sortedness is not needed for correctness.
- The same lower-bound routine generalizes to duplicates and returns the first occurrence/insertion-before-equals boundary.
- Upper bound changes the predicate to first value > target, inserting after existing equals.

## Common mistakes and gotchas

- Initializing right to n-1, which loses the valid insertion boundary after the last element.
- Accessing nums[mid] when mid can equal n; the half-open loop guarantees mid < right <= n and therefore mid < n while the loop runs.
- Setting right=mid-1, which is the wrong convention for a lower-bound interval that retains mid as a possible answer.
- Treating return n as a found array index.
- Using equality as the only stopping condition; absent targets still have a valid insertion point.

## Edge-case tests

- Target equals first or last element.
- Target smaller than all values gives zero.
- Target larger than all values gives n.
- Target falls in a gap.
- A single-element array.

## Reflection questions

1. Which Boolean predicate changes at the insertion boundary?
2. Why is n a valid answer even though it is not an array index?
3. Why can the right side retain mid in this template?
4. How would upper bound differ?

Source: [LeetCode: Search Insert Position](https://leetcode.com/problems/search-insert-position/).
