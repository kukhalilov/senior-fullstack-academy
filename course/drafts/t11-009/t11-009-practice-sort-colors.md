# comparison sorting algorithms and selection — Problem: Sort Colors

## Goals

- Sort three categories in place in one pass.
- Maintain regions for values below, equal to, and above the pivot category.
- Avoid advancing the scan after swapping an unclassified value from the right.

## Problem statement

Sort an array containing only 0, 1, and 2 in ascending order in place without using a library sort. Use the Dutch National Flag partition.

## Input constraints

- 1 <= nums.Length <= 300.
- Each value is exactly 0, 1, or 2.
- The follow-up requests one pass and constant extra space.

## Examples with expected output

1. [2,0,2,1,1,0] -> [0,0,1,1,2,2].
2. [2,0,1] -> [0,1,2].
3. [0,0,0] -> [0,0,0].

## Clarifying assumptions

- Mutate and return the same array reference.
- Empty input is supported defensively even though constraints require at least one value.
- Three indices divide the classified prefix and suffix around an unclassified scan region.

## Progressive hints

1. Keep 0s to the left and 2s to the right.
2. Values between those boundaries are 1s.
3. When the scan sees 2, swap it with the right boundary but re-examine the incoming value.
4. When the scan sees 0, swap left and advance both left and scan.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int[] SortColors(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        int low = 0, current = 0, high = nums.Length - 1;
        while (current <= high)
        {
            if (nums[current] == 0)
            {
                (nums[low], nums[current]) = (nums[current], nums[low]);
                low++;
                current++;
            }
            else if (nums[current] == 1)
            {
                current++;
            }
            else if (nums[current] == 2)
            {
                (nums[current], nums[high]) = (nums[high], nums[current]);
                high--;
            }
            else
            {
                throw new ArgumentException("Values must be 0, 1, or 2.", nameof(nums));
            }
        }
        return nums;
    }

    private static void Equal(int[] actual, int[] expected, string label)
    {
        if (actual.Length != expected.Length) throw new InvalidOperationException(label + " length");
        for (int i = 0; i < actual.Length; i++)
            if (actual[i] != expected[i]) throw new InvalidOperationException(label + " index " + i);
    }

    public static void Main()
    {
        Equal(SortColors(new[] { 2, 0, 2, 1, 1, 0 }), new[] { 0, 0, 1, 1, 2, 2 }, "Example 1");
        Equal(SortColors(new[] { 2, 0, 1 }), new[] { 0, 1, 2 }, "Example 2");
        Equal(SortColors(new[] { 0, 0, 0 }), new[] { 0, 0, 0 }, "all zero");
        Equal(SortColors(Array.Empty<int>()), Array.Empty<int>(), "empty");
        Console.WriteLine("All Sort Colors checks passed.");
    }
}
```

## Correctness argument

At each loop start, indices before low contain only 0; indices from low to current-1 contain only 1; indices after high contain only 2; and current through high are unclassified. Swapping a 0 into low extends the 0 region and the known-1 region, so both low and current advance. A 1 extends only the known-1 region. Swapping a 2 with high extends the 2 region, but the value swapped into current is unclassified, so current stays. The unclassified region shrinks every iteration; termination leaves all values in category order.

## Step-by-step dry run

For [2,0,2,1,1,0], current starts on 2, so swap with rightmost 0 and recheck. Move that 0 to the low side. Continue until the scan reaches the right boundary; the invariant guarantees all remaining values are already categorized.

## Time complexity

O(n); each iteration classifies one item or removes one from the unclassified region.

## Space complexity

O(1) auxiliary space; swaps happen in the input array.

## Alternatives and tradeoffs

- Counting frequencies then rewriting uses two linear passes and O(1) counters; it is simpler but not one pass.
- A stable sort is unnecessary because values are categories with no associated identity.
- For more categories, counting sort may be a better fit if the value range is bounded.

## Common mistakes and gotchas

- Incrementing current after swapping with high; the incoming value has not been inspected.
- Advancing low without advancing current when swapping a zero.
- Letting high move below zero and indexing after the loop.
- Assuming any integer is a valid category.

## Edge-case tests

- All zeroes, all ones, all twos.
- Reverse category order.
- Alternating values.
- Smallest legal length.
- Invalid category in defensive generalization.

## Reflection questions

1. What does each classified region contain?
2. Why does the 2 branch not advance current?
3. Why is the algorithm in place?
4. How does counting-sort variation differ in passes?

Source: [LeetCode: Sort Colors](https://leetcode.com/problems/sort-colors/).
