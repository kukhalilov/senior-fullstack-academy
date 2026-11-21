# two-pointer and sliding-window techniques — Problem: Remove Duplicates from Sorted Array

## Goals

- Use a read pointer to scan sorted values and a write pointer to compact unique values in place.
- State what the valid prefix means at each step.
- Preserve the required relative order without allocating a second array.

## Problem statement

Given an integer array nums sorted in non-decreasing order, remove duplicates in place so that each distinct value appears exactly once and the relative order is retained. Return k, the number of unique values. The first k elements must contain the unique values in sorted order; the remaining positions do not matter. Do not allocate another array for the result.

## Input constraints

- 1 <= nums.Length <= 30,000.
- -100 <= nums[i] <= 100.
- nums is sorted in non-decreasing order.

## Examples with expected output

1. nums = [1,1,2] -> k = 2, prefix = [1,2].
2. nums = [0,0,1,1,1,2,2,3,3,4] -> k = 5, prefix = [0,1,2,3,4].
3. nums = [1] -> k = 1, prefix = [1].
4. nums = [1,2,3] -> k = 3, prefix = [1,2,3].

## Clarifying assumptions

- The input is nonempty and already sorted. The algorithm does not sort it.
- Only the first k values are part of the result; the suffix can contain old or overwritten values.
- The array is intentionally mutated.
- Equal values are duplicates by value; only the first occurrence in sorted order is retained.

## Progressive hints

1. The first value is always the first unique value because the array is nonempty.
2. Use `write` as the index where the next previously unseen value should go.
3. Compare each read value with the last retained value at `write - 1`.
4. When they differ, copy the current value to `write` and advance it. The returned count is the final write position.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int RemoveDuplicates(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (nums.Length == 0) return 0;

        int write = 1;
        for (int read = 1; read < nums.Length; read++)
        {
            if (nums[read] != nums[write - 1])
            {
                nums[write] = nums[read];
                write++;
            }
        }
        return write;
    }

    private static void AssertPrefix(int[] nums, int expectedLength, int[] expectedPrefix, string label)
    {
        int actualLength = RemoveDuplicates(nums);
        if (actualLength != expectedLength) throw new InvalidOperationException(label + " length failed.");
        for (int i = 0; i < expectedLength; i++)
            if (nums[i] != expectedPrefix[i]) throw new InvalidOperationException(label + " prefix failed.");
    }

    public static void Main()
    {
        AssertPrefix(new[] { 1, 1, 2 }, 2, new[] { 1, 2 }, "Example 1");
        AssertPrefix(new[] { 0, 0, 1, 1, 1, 2, 2, 3, 3, 4 }, 5, new[] { 0, 1, 2, 3, 4 }, "Example 2");
        AssertPrefix(new[] { 1 }, 1, new[] { 1 }, "Single value");
        AssertPrefix(new[] { 1, 2, 3 }, 3, new[] { 1, 2, 3 }, "All unique");
        AssertPrefix(new[] { -2, -2, -2 }, 1, new[] { -2 }, "All equal");
        Console.WriteLine("All Remove Duplicates from Sorted Array checks passed.");
    }
}
```

## Correctness argument

At the start of each iteration with current read index r, the prefix `[0,write)` contains exactly the distinct values from the already processed input prefix `[0,r)`, in sorted order. Since the input is sorted, any duplicate of a value already retained appears adjacent to its other copies before any larger value. If `nums[read]` equals the last retained value, it adds no new distinct item and can be skipped. If it differs, sortedness means it is the next larger distinct value; copying it to `nums[write]` extends the correct prefix by one. Since write is at most read, the copy cannot overwrite an unread position. At termination, every distinct input value appears once in the prefix and no other value does; returning write gives exactly its length.

## Step-by-step dry run

For `[0,0,1,1,1,2,2,3,3,4]`, initialize write = 1. The second zero equals the last kept zero, so skip it. At the first one, write it at index 1 and advance write to 2; skip the remaining ones. Do the same for 2, 3, and 4. The meaningful prefix becomes `[0,1,2,3,4]`, and write is 5.

## Time complexity

O(n), one scan of the array.

## Space complexity

O(1) auxiliary space; updates happen in the input array.

## Alternatives and tradeoffs

- A new list with distinct values can be simpler to reason about, but it violates the no-extra-result-array requirement and uses O(n) storage.
- A hash set could detect values without sorted input, but it adds storage and does not use the given adjacent-duplicate property.
- For a variant that allows each value at most c times, compare the current value with the item c positions before write, after handling the small-prefix boundary. The invariant must be adjusted and should be reproved.

## Common mistakes and gotchas

- Comparing with `nums[read - 1]` is also valid here due to sorted adjacency, but comparing with `nums[write - 1]` makes the retained-prefix invariant explicit.
- Incrementing write for duplicates, which leaves duplicates in the output prefix.
- Returning the final index instead of the prefix length.
- Requiring the unused suffix to be cleared even though the contract ignores it.
- Applying this adjacent-duplicate approach to unsorted input.
- Using `write <= read` as a loop bound when write represents output length, not the next unread input index.

## Edge-case tests

- One element.
- All values equal.
- Every value distinct.
- Duplicate runs at the start, middle, and end.
- Negative and positive values in sorted order.

## Reflection questions

1. What does the prefix before write represent?
2. Why can every duplicate be identified by comparing with the last retained value?
3. Why does writing at write not destroy future input?
4. What assumption would fail if the array were unsorted?

Source: [LeetCode: Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/).
