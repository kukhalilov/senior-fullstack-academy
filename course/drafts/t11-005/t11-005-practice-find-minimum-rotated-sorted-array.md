# binary search, bounds, rotated arrays, and monotone answers — Problem: Find Minimum in Rotated Sorted Array

## Goals

- Find the minimum in a rotated strictly increasing array by locating the rotation boundary.
- Keep mid as a candidate when it may itself be the minimum.
- Explain why distinct values preserve logarithmic elimination.

## Problem statement

An ascending array of unique integers has been rotated between one and n times, possibly resulting in its original order. Return the minimum value in O(log n) time.

## Input constraints

- 1 <= nums.Length <= 5,000.
- -5,000 <= nums[i] <= 5,000.
- All values are unique.
- nums is ascending before rotation and is rotated between one and n times.

## Examples with expected output

1. nums = [3,4,5,1,2] -> 1.
2. nums = [4,5,6,7,0,1,2] -> 0.
3. nums = [11,13,15,17] -> 11; a full-cycle rotation can appear unrotated.
4. nums = [2,1] -> 1.

## Clarifying assumptions

- Duplicate values do not occur; the duplicate variant can degrade to linear time.
- The array is nonempty.
- Return the minimum value, not its index.
- The algorithm does not modify nums.

## Progressive hints

1. Compare the midpoint with the rightmost value to determine which side contains the rotation drop.
2. If mid is greater than right, the minimum lies strictly after mid.
3. Otherwise the minimum is at mid or to its left; retain mid by moving right to mid.
4. Continue with a half-open candidate interval until one index remains.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int FindMin(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (nums.Length == 0) throw new ArgumentException("Array must be nonempty.", nameof(nums));

        int left = 0;
        int right = nums.Length - 1;
        while (left < right)
        {
            int mid = left + (right - left) / 2;
            if (nums[mid] > nums[right]) left = mid + 1;
            else right = mid;
        }
        return nums[left];
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(FindMin(new[] { 3, 4, 5, 1, 2 }), 1, "Example 1");
        AssertEqual(FindMin(new[] { 4, 5, 6, 7, 0, 1, 2 }), 0, "Example 2");
        AssertEqual(FindMin(new[] { 11, 13, 15, 17 }), 11, "Example 3");
        AssertEqual(FindMin(new[] { 2, 1 }), 1, "Two values");
        AssertEqual(FindMin(new[] { 1 }), 1, "Single value");
        Console.WriteLine("All Find Minimum in Rotated Sorted Array checks passed.");
    }
}
```

## Correctness argument

Maintain that the minimum's index remains within `[left,right]`. If `nums[mid] > nums[right]`, the interval from mid through right crosses the rotation drop, so the minimum is strictly to the right of mid; set left=mid+1. Otherwise, values from mid through right are in increasing order, so the minimum is at mid or to its left; set right=mid, retaining mid. The interval shrinks on every iteration. When left equals right, the sole remaining candidate is the minimum.

Distinctness makes the comparison decisive. With duplicates, `nums[mid] == nums[right]` can leave both halves ambiguous; reducing right one step can be safe but may require O(n) total time.

## Step-by-step dry run

For `[4,5,6,7,0,1,2]`: mid=3 has 7 > right value 2, so left=4. Mid=5 has 1 <= 2, so right=5. Mid=4 has 0 <= 1, so right=4. The remaining index 4 holds 0.

## Time complexity

O(log n), because each comparison discards about half the interval.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- Linear scan finds the minimum in O(n) and works for any array; it is simpler when the input is tiny or not guaranteed rotated-sorted.
- Find the pivot index with a different predicate and return its value; the same boundary reasoning applies.
- For arrays with duplicates, the comparison's equality case may force a one-step reduction and O(n) worst-case time.

## Common mistakes and gotchas

- Using `right=mid-1`; the midpoint may be the minimum and would be discarded.
- Comparing mid to left while using a rule that assumes distinct ordered values without proving it.
- Ending with `left<=right` and reading a discarded candidate.
- Assuming a visibly rotated array; a full-cycle rotation can restore sorted appearance.
- Claiming O(log n) for duplicate inputs without treating equality ambiguity.

## Edge-case tests

- One element.
- Two elements in either rotation order.
- No visible rotation.
- Minimum at the first or final index.
- Values include negatives.

## Reflection questions

1. Why does `nums[mid] > nums[right]` place the minimum after mid?
2. Why is mid retained in the other branch?
3. What invariant is preserved by the loop?
4. Why can duplicates weaken the worst-case runtime?

Source: [LeetCode: Find Minimum in Rotated Sorted Array](https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/).
