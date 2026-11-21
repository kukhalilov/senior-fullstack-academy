# comparison sorting algorithms and selection — Problem: Sort an Array

## Goals

- Implement a comparison sort without using a built-in sort.
- Use in-place heap sort for deterministic O(n log n) time and O(1) auxiliary space.
- Preserve duplicates and handle negative values.

## Problem statement

Sort the input integers in ascending order without calling a library sort. The required time is O(n log n); among standard comparison sorts, in-place heap sort meets this bound with O(1) auxiliary space.

## Input constraints

- 1 <= nums.Length <= 50,000.
- -50,000 <= nums[i] <= 50,000.
- Duplicate values are allowed.

## Examples with expected output

1. [5,2,3,1] -> [1,2,3,5].
2. [5,1,1,2,0,0] -> [0,0,1,1,2,5].
3. [-2,3,-2,0] -> [-2,-2,0,3].

## Clarifying assumptions

- The method sorts `nums` in place and returns the same array reference, as permitted by the problem.
- Heap sort is not stable, but stability is not required for integer values in this task.
- Bottom-up merge sort is a valid O(n log n) alternative when O(n) auxiliary storage is acceptable.

## Progressive hints

1. Build a max-heap so the largest value is at the root.
2. Swap the root with the last element in the active heap.
3. Shrink the active heap and sift its new root down.
4. Repeat until the remaining prefix has one element.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int[] SortArray(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        int n = nums.Length;

        // Bottom-up heap construction is O(n).
        for (int root = n / 2 - 1; root >= 0; root--)
            SiftDown(nums, root, n);

        // Move each maximum to its final position, then restore the heap prefix.
        for (int end = n - 1; end > 0; end--)
        {
            (nums[0], nums[end]) = (nums[end], nums[0]);
            SiftDown(nums, 0, end);
        }
        return nums;
    }

    // The active heap occupies nums[0..size).
    private static void SiftDown(int[] nums, int root, int size)
    {
        while (root < size / 2) // Only internal nodes have children.
        {
            int child = 2 * root + 1;
            if (child + 1 < size && nums[child + 1] > nums[child]) child++;
            if (nums[root] >= nums[child]) return;
            (nums[root], nums[child]) = (nums[child], nums[root]);
            root = child;
        }
    }

    private static void Equal(int[] actual, int[] expected, string label)
    {
        if (actual.Length != expected.Length) throw new InvalidOperationException(label + " length");
        for (int i = 0; i < actual.Length; i++)
            if (actual[i] != expected[i]) throw new InvalidOperationException(label + " index " + i);
    }

    public static void Main()
    {
        Equal(SortArray(new[] { 5, 2, 3, 1 }), new[] { 1, 2, 3, 5 }, "Example 1");
        Equal(SortArray(new[] { 5, 1, 1, 2, 0, 0 }), new[] { 0, 0, 1, 1, 2, 5 }, "duplicates");
        Equal(SortArray(new[] { -2, 3, -2, 0 }), new[] { -2, -2, 0, 3 }, "negative values");
        Equal(SortArray(new[] { 7 }), new[] { 7 }, "singleton");
        Equal(SortArray(Array.Empty<int>()), Array.Empty<int>(), "empty generalization");
        Console.WriteLine("All Sort an Array checks passed.");
    }
}
```

## Correctness argument

After bottom-up construction, every parent is at least as large as its children, so the root contains the maximum of the active prefix. Each extraction swaps that maximum into the next final suffix position and reduces the active heap by one. SiftDown restores the max-heap property within the prefix. The sorted suffix contains the largest values in order, and the prefix contains all remaining values; induction proves the final array is ascending. Every element occurrence is retained, and the algorithm mutates only the input array.

## Step-by-step dry run

For [5,2,3,1], heap construction places 5 at the root. Swap it to the last slot, restore a heap over the first three values, and repeat. Each extracted maximum extends the sorted suffix on the right until the array is [1,2,3,5].

## Time complexity

O(n log n): heap construction is O(n), followed by n-1 extractions with O(log n) sift-down each.

## Space complexity

O(1) auxiliary space; the input array is sorted in place.

## Alternatives and tradeoffs

- Merge sort is stable and predictably O(n log n), but its usual array implementation uses O(n) auxiliary storage.
- Quicksort often has good practical locality and expected O(n log n) behavior with randomized pivots, but its worst case remains O(n²).
- Heap sort is a strong fit when this task's O(1) auxiliary-space constraint matters more than stability or cache locality.

## Common mistakes and gotchas

- Sifting a node that has no children or reading a child outside the active heap.
- Advancing the root after swapping with the larger child before the displaced value is restored.
- Losing duplicates by using a set-like representation.
- Assuming heap sort is stable; its swaps can reorder equal records.

## Edge-case tests

- Duplicates and negative values.
- Already sorted and reverse sorted input.
- Two-element ascending and descending inputs.
- All-equal values and repeated maxima/minima.
- Singleton and empty generalization.

## Reflection questions

1. What invariant must hold in the active max-heap?
2. Why does placing each maximum at the right produce ascending order?
3. Why is bottom-up heap construction O(n), not O(n log n)?
4. What space and stability tradeoff distinguishes heap sort from merge sort?

Source: [LeetCode: Sort an Array](https://leetcode.com/problems/sort-an-array/).
