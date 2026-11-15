<!-- MANUALLY AUTHORED: checked against frozen problem statement, examples, constraints, and source. -->

# two-pointer and sliding-window techniques — Problem: Remove Duplicates from Sorted Array

# Goals

- Turn a sorted array’s adjacent-run property into an in-place compaction algorithm.
- Distinguish the logical result length from the physical array length.
- Maintain a prefix of unique values without overwriting unread input.
- Generalize the write-pointer invariant to stable filtering problems.

# Problem statement

Given an integer array nums sorted in non-decreasing order, remove duplicates in place so each distinct value appears once, keeping the relative order. Return k, the number of unique values. The first k elements must contain the unique values in sorted order; elements after index k - 1 are ignored. Do not allocate another array.

# Input constraints

- 1 <= nums.Length <= 30,000
- -100 <= nums[i] <= 100
- nums is sorted in non-decreasing order.
- The array’s allocated length is not changed; only its meaningful prefix is returned as k.

# Examples with expected output

1. nums = [1, 1, 2] → k = 2, meaningful prefix [1, 2]
2. nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4] → k = 5, meaningful prefix [0, 1, 2, 3, 4]
3. nums = [7] → k = 1, meaningful prefix [7]

# Clarifying assumptions

- The input is sorted; equal values therefore appear next to one another.
- The first k positions are the result. The array is not resized and values after that prefix have no required contents.
- The method mutates the caller’s array and returns the logical length.
- The non-empty length constraint means at least one unique value exists.

# Progressive hints

1. In a sorted array, once a value has been seen, any duplicate of it is adjacent until the next distinct value.
2. Keep a write index for the end of the unique prefix. Compare each later value with the last value written.
3. When the current value differs, write it at the next free prefix position and advance the write index.
4. Do not advance the write index for a duplicate. The read index still moves through every element.

# Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int RemoveDuplicates(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (nums.Length == 0) throw new ArgumentException("At least one value is required.", nameof(nums));

        int write = 1;
        for (int read = 1; read < nums.Length; read++)
        {
            if (nums[read] == nums[write - 1])
                continue;

            nums[write] = nums[read];
            write++;
        }

        return write;
    }

    private static void AssertResult(int[] nums, int expectedLength, int[] expectedPrefix, string label)
    {
        int actualLength = RemoveDuplicates(nums);
        if (actualLength != expectedLength)
            throw new InvalidOperationException(label + ": wrong logical length.");
        for (int i = 0; i < actualLength; i++)
            if (nums[i] != expectedPrefix[i])
                throw new InvalidOperationException(label + ": wrong value at index " + i);
    }

    public static void Main()
    {
        AssertResult(new[] { 1, 1, 2 }, 2, new[] { 1, 2 }, "Example 1");
        AssertResult(new[] { 0, 0, 1, 1, 1, 2, 2, 3, 3, 4 }, 5, new[] { 0, 1, 2, 3, 4 }, "Example 2");
        AssertResult(new[] { 7 }, 1, new[] { 7 }, "Single element");
        AssertResult(new[] { -2, -2, -2 }, 1, new[] { -2 }, "All equal");
        AssertResult(new[] { -3, -1, 0 }, 3, new[] { -3, -1, 0 }, "No duplicates");
        Console.WriteLine("All Remove Duplicates checks passed.");
    }
}
```

# Correctness argument

Before each read index, the prefix nums[0..write) contains exactly the distinct values among the already-processed input, in their original sorted order. It is non-empty because the array has at least one element and nums[0] begins the prefix. If nums[read] equals nums[write - 1], sorted order guarantees it is a duplicate of the most recently written distinct value, so skipping it preserves the invariant. Otherwise it is a new, strictly larger value and belongs next in the unique sequence; writing it at nums[write] and incrementing write extends the correct prefix by one. At the end, write is the number of distinct values and the prefix contains all of them.

# Step-by-step dry run

For [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]:

1. Start with write = 1 and prefix [0].
2. Read the second 0: equal to nums[write - 1], so skip.
3. Read 1: new value; write it at index 1, then write = 2.
4. Skip the next two 1 values.
5. Read 2: write at index 2, then write = 3; skip the duplicate 2.
6. Read 3: write at index 3, then write = 4; skip the duplicate 3.
7. Read 4: write at index 4, then write = 5.
8. Return k = 5; only [0, 1, 2, 3, 4] is meaningful.

# Time complexity

O(n): read visits each element once, and each unique value is written once.

# Space complexity

O(1) auxiliary space: the input array is reused and only two indices are stored.

# Alternatives and tradeoffs

- A hash set can find unique values in an unsorted sequence, but uses O(n) extra memory and is unnecessary for sorted input.
- Copying unique values into a new list is simpler in some application code, but violates the in-place requirement.
- The same read/write pattern supports “keep at most m copies” in a sorted array: compare the current value with the value m positions behind the write position, after handling short prefixes.
- If the input were not sorted, comparing only with the last written value would not identify all duplicates; sorting changes order and costs O(n log n).

# Common mistakes and gotchas

- Return the logical length, not the original array length.
- Do not clear the ignored tail; the judge checks only the first k positions.
- Compare the read value to the last unique value, not to the immediately preceding input value, which may itself be a duplicate.
- Start read at index 1 because index 0 seeds the unique prefix.
- The input is guaranteed non-empty. A reusable library method should choose and document behavior for an empty input rather than accidentally indexing nums[0].
- Do not increment write for a duplicate, or gaps will appear in the meaningful prefix.

# Edge-case tests

- One value.
- Every value equal.
- No duplicates.
- Negative values and transitions between values.
- Long runs of the same value.

# Reflection questions

1. Why does sorted order make equality with the last written value sufficient?
2. Why can the write index never move ahead of the read index?
3. Why is the array length unchanged even though duplicates are “removed”?
4. How would you generalize the method to keep at most two copies?

Sources: [LeetCode: Remove Duplicates from Sorted Array](https://leetcode.com/problems/remove-duplicates-from-sorted-array/).
