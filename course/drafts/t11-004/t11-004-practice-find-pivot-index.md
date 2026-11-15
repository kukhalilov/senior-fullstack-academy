# prefix sums, difference arrays, and static range queries — Problem: Find Pivot Index

## Goals

- Compare left and right totals in one pass without building two prefix arrays.
- Return the leftmost valid index, including edge pivots with an empty side.
- Maintain a clear invariant for the running left total.

## Problem statement

Given an integer array nums, return its leftmost pivot index: an index where the sum of all values strictly to its left equals the sum of all values strictly to its right. If none exists, return -1. At either edge, the missing side has sum zero.

## Input constraints

- 1 <= nums.Length <= 10,000.
- -1,000 <= nums[i] <= 1,000.
- There may be more than one pivot; return the smallest index.

## Examples with expected output

1. nums = [1,7,3,6,5,6] -> 3.
2. nums = [1,2,3] -> -1.
3. nums = [2,1,-1] -> 0.
4. nums = [0,0,0] -> 0, the leftmost pivot.

## Clarifying assumptions

- The pivot element itself is excluded from both side sums.
- Negative values are allowed.
- Empty side sums equal zero.
- Return the leftmost pivot rather than any pivot.

## Progressive hints

1. Compute the total sum once.
2. At index i, if left sum is L, the right sum is `total - L - nums[i]`.
3. Test equality before adding nums[i] to L.
4. Scan from index zero and return immediately on the first match.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int PivotIndex(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));

        long total = 0;
        foreach (int value in nums) total += value;

        long left = 0;
        for (int i = 0; i < nums.Length; i++)
        {
            long right = total - left - nums[i];
            if (left == right) return i;
            left += nums[i];
        }
        return -1;
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(PivotIndex(new[] { 1, 7, 3, 6, 5, 6 }), 3, "Example 1");
        AssertEqual(PivotIndex(new[] { 1, 2, 3 }), -1, "Example 2");
        AssertEqual(PivotIndex(new[] { 2, 1, -1 }), 0, "Example 3");
        AssertEqual(PivotIndex(new[] { 0, 0, 0 }), 0, "Leftmost of multiple pivots");
        AssertEqual(PivotIndex(new[] { 1 }), 0, "Single element");
        Console.WriteLine("All Find Pivot Index checks passed.");
    }
}
```

## Correctness argument

`total` equals the sum of all values. Before checking index i, `left` equals the sum of all values at indices less than i. Therefore `total - left - nums[i]` equals the sum strictly to the right. The comparison returns i exactly when the pivot condition holds. Scanning in ascending order and returning at the first match ensures the leftmost pivot. If the scan ends, no index satisfies the condition and -1 is correct.

## Step-by-step dry run

For `[1,7,3,6,5,6]`, total is 28. At i=0, left 0 and right 27; after checking, add 1. At i=1, left 1 and right 20; add 7. At i=2, left 8 and right 17; add 3. At i=3, left 11 and right `28-11-6=11`; return 3.

## Time complexity

O(n): one pass for total and one for candidate indices.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- Build left and right prefix arrays and compare each position. This makes the values inspectable but uses O(n) extra space and two preprocessing scans.
- A direct recomputation of both sides at every index is O(n²); it is simple for a tiny input but repeats work.

## Common mistakes and gotchas

- Including nums[i] in either side sum.
- Updating left before checking the current index.
- Returning the last pivot instead of the required leftmost one.
- Rejecting edge pivots even though an empty side sums to zero.
- Using `int` for totals without considering larger generalized constraints.

## Edge-case tests

- Pivot at the first index.
- Pivot at the final index.
- Multiple pivots; ensure leftmost wins.
- Negative values.
- No pivot and single-element input.

## Reflection questions

1. Why can the right sum be derived without scanning the right side?
2. Why is the pivot value excluded from both totals?
3. Why must the left accumulator update after the equality check?
4. What change would be needed to return every pivot index?

Source: [LeetCode: Find Pivot Index](https://leetcode.com/problems/find-pivot-index/).
