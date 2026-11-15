# comparison sorting algorithms and selection — Problem: Sort an Array

## Goals

- Implement a comparison sort without using a built-in sort.
- Use bottom-up merge sort for deterministic O(n log n) time.
- Preserve duplicates and handle negative values.

## Problem statement

Return the input integers in ascending order without calling a library sort; the required time is O(n log n) with the smallest practical space.

## Input constraints

- 1 <= nums.Length <= 50,000.
- -50,000 <= nums[i] <= 50,000.
- Duplicate values are allowed.

## Examples with expected output

1. [5,2,3,1] -> [1,2,3,5].
2. [5,1,1,2,0,0] -> [0,0,1,1,2,5].
3. [-2,3,-2,0] -> [-2,-2,0,3].

## Clarifying assumptions

- The method returns a new sorted array and leaves the input unchanged.
- Bottom-up merge sort uses O(n) auxiliary storage; it is stable.
- Width doubling is bounded to avoid integer overflow in a generalized implementation.

## Progressive hints

1. Merge sort always has predictable O(n log n) comparisons.
2. Begin with sorted runs of width one.
3. Merge adjacent pairs into a separate buffer, then swap source and destination.
4. Double width until one run spans the array.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int[] SortArray(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        int n = nums.Length;
        int[] source = (int[])nums.Clone();
        int[] destination = new int[n];

        for (int width = 1; width < n;)
        {
            for (int left = 0; left < n; left += width <= n - left ? width * 2 : n)
            {
                int mid = Math.Min(left + width, n);
                int right = Math.Min(left + 2 * width, n);
                int i = left, j = mid, write = left;
                while (i < mid && j < right)
                    destination[write++] = source[i] <= source[j] ? source[i++] : source[j++];
                while (i < mid) destination[write++] = source[i++];
                while (j < right) destination[write++] = source[j++];
            }
            (source, destination) = (destination, source);
            if (width > n / 2) break;
            width *= 2;
        }
        return source;
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

Before each width pass, source consists of sorted runs of length at most width. Each adjacent pair of runs is merged into destination by repeatedly selecting the smaller next element; the remaining tail is copied once one run empties. Thus destination contains sorted runs of length at most 2*width and preserves every input occurrence. Swapping buffers establishes the invariant for the next pass. Width eventually reaches n, leaving the whole array sorted. Choosing from source's left run on equality preserves stability.

## Step-by-step dry run

For [5,2,3,1], width 1 merges [5] with [2] and [3] with [1] to get [2,5,1,3]. Width 2 merges [2,5] with [1,3], producing [1,2,3,5].

## Time complexity

O(n log n), with one linear merge pass per doubling of run width.

## Space complexity

O(n) auxiliary buffer, plus O(n) returned storage. The returned array is the final source buffer.

## Alternatives and tradeoffs

- Top-down merge sort expresses recursion directly but uses O(log n) call stack in addition to the merge buffer.
- Heap sort can achieve O(n log n) worst-case with O(1) auxiliary storage but is unstable and less intuitive.
- Quicksort is often fast but has quadratic worst case unless mitigated; it may still be adversarially vulnerable.

## Common mistakes and gotchas

- Overwriting a source run before its values have been read.
- Forgetting to copy one run's remainder.
- Losing duplicates by using a set-like representation.
- Claiming O(1) extra memory for merge sort.
- Letting loop width arithmetic overflow in general-purpose code.

## Edge-case tests

- Duplicates and negative values.
- Already sorted and reverse sorted input.
- Odd length causing an unmatched final run.
- Singleton and empty generalization.

## Reflection questions

1. What is the sorted-run invariant before a pass?
2. Why does choosing left on equality preserve stability?
3. Why does bottom-up merge sort avoid recursive stack?
4. Which guarantee does merge sort provide that quicksort does not?

Source: [LeetCode: Sort an Array](https://leetcode.com/problems/sort-an-array/).
