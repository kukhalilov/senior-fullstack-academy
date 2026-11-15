# comparison sorting algorithms and selection — Problem: Kth Largest Element in an Array

## Goals

- Find one order statistic without fully sorting.
- Translate kth largest into a zero-based ascending target index.
- Use randomized three-way partitioning to handle duplicates efficiently.

## Problem statement

Return the kth largest value in sorted order. Duplicates count as separate positions.

## Input constraints

- 1 <= k <= nums.Length <= 100,000.
- -10,000 <= nums[i] <= 10,000.
- Values need not be distinct.

## Examples with expected output

1. [3,2,1,5,6,4], k=2 -> 5.
2. [3,2,3,1,2,4,5,5,6], k=4 -> 4.
3. [2,2,2], k=2 -> 2.

## Clarifying assumptions

- Mutate a copy, not the caller's array.
- Target index in ascending order is n-k.
- Random.Shared supplies pivot positions; expected-time analysis assumes randomized pivots.

## Progressive hints

1. Sorting ascending would put the answer at index n-k.
2. Partition values smaller/equal/larger around a pivot.
3. If target is left or right, continue only there.
4. If target lies in the equal region, return the pivot value.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int FindKthLargest(int[] nums, int k)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (k < 1 || k > nums.Length) throw new ArgumentOutOfRangeException(nameof(k));
        int[] values = (int[])nums.Clone();
        int target = values.Length - k;
        int left = 0, right = values.Length - 1;

        while (left <= right)
        {
            int pivot = values[Random.Shared.Next(left, right + 1)];
            int less = left, current = left, greater = right;
            while (current <= greater)
            {
                if (values[current] < pivot)
                {
                    (values[less], values[current]) = (values[current], values[less]);
                    less++; current++;
                }
                else if (values[current] > pivot)
                {
                    (values[current], values[greater]) = (values[greater], values[current]);
                    greater--;
                }
                else current++;
            }

            if (target < less) right = less - 1;
            else if (target > greater) left = greater + 1;
            else return pivot;
        }
        throw new InvalidOperationException("A valid target must lie in a partition.");
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(FindKthLargest(new[] { 3, 2, 1, 5, 6, 4 }, 2), 5, "Example 1");
        Equal(FindKthLargest(new[] { 3, 2, 3, 1, 2, 4, 5, 5, 6 }, 4), 4, "Example 2");
        Equal(FindKthLargest(new[] { 2, 2, 2 }, 2), 2, "all equal");
        Equal(FindKthLargest(new[] { -1, -5, 0 }, 3), -5, "negative values");
        Equal(FindKthLargest(new[] { int.MinValue, int.MaxValue, 0 }, 1), int.MaxValue, "extremes");
        Console.WriteLine("All Kth Largest checks passed.");
    }
}
```

## Correctness argument

For each iteration, three-way partition establishes values before less are below pivot, values from less through greater equal pivot, and values after greater exceed pivot. In ascending order, all indices before less contain smaller values, and all indices after greater contain larger values. If target is outside the equal band, only its corresponding side can contain the target rank; narrowing to that side preserves the answer. If target is inside the band, every position in that band has pivot value, so returning pivot is correct. Since a nonempty pivot band is discarded each iteration, the range shrinks until the target is found.

## Step-by-step dry run

For [3,2,1,5,6,4], k=2 means target index 4. With pivot 3, partition yields less [1,2], equal [3], greater [5,6,4]. Target 4 lies in the greater side; partition there until index 4 lies in an equal band containing 5, so return 5.

## Time complexity

Expected O(n) with randomized pivots; worst-case O(n²) if pivots repeatedly produce highly unbalanced partitions.

## Space complexity

O(n) for the cloned input; partition itself uses O(1) auxiliary storage and is iterative.

## Alternatives and tradeoffs

- Full sorting guarantees O(n log n) and is preferable when many ranks or sorted output are needed.
- A min-heap of size k uses O(n log k) time and O(k) space; it suits streaming input or small k.
- Deterministic median-of-medians can provide worst-case O(n), with more implementation complexity.

## Common mistakes and gotchas

- Using target k-1 instead of n-k.
- Treating the kth largest as kth distinct.
- Recurse into both sides and accidentally sort the full array.
- Advancing the scan pointer after swapping with greater; the incoming item is unclassified.
- Claiming worst-case linear time for randomized quickselect.

## Edge-case tests

- k=1 and k=n.
- All equal values.
- Many duplicates around the target.
- Negative-only values.
- Int32 extremes to expose overflow assumptions.

## Reflection questions

1. Why is ascending target index n-k?
2. What does the equal band let us conclude immediately?
3. Why is randomized complexity expected, not guaranteed?
4. When might a heap be a better choice?

Source: [LeetCode: Kth Largest Element in an Array](https://leetcode.com/problems/kth-largest-element-in-an-array/).
