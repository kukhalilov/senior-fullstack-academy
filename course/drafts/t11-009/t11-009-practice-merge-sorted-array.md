# comparison sorting algorithms and selection — Problem: Merge Sorted Array

## Goals

- Merge two sorted prefixes in linear time.
- Fill the destination backward to protect unread values.
- Preserve duplicates and handle either prefix being empty.

## Problem statement

nums1 has m sorted valid values followed by n spare slots. nums2 has n sorted values. Merge all values into nums1 in nondecreasing order.

## Input constraints

- nums1.Length == m+n; nums2.Length == n.
- 0 <= m,n <= 200 and 1 <= m+n <= 200.
- Values fit Int32 and may repeat.

## Examples with expected output

1. nums1=[1,2,3,0,0,0], m=3, nums2=[2,5,6] -> [1,2,2,3,5,6].
2. nums1=[1], m=1, nums2=[], n=0 -> [1].
3. nums1=[0], m=0, nums2=[1], n=1 -> [1].
4. nums1=[2,2,0], m=2, nums2=[2], n=1 -> [2,2,2].

## Clarifying assumptions

- Only nums1[0..m) contains meaningful initial values; spare slots are ignored regardless of their contents.
- Mutate nums1 and return the same array.
- When equal, choosing nums2 for the last slot is valid; stability across the two sources is not required by the integer output.

## Progressive hints

1. Forward merging would overwrite nums1's unread prefix.
2. Compare the largest remaining values and write to the last free index.
3. Continue while nums2 still has values.
4. Any remaining nums1 prefix is already correctly placed.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int[] Merge(int[] nums1, int m, int[] nums2, int n)
    {
        if (nums1 is null) throw new ArgumentNullException(nameof(nums1));
        if (nums2 is null) throw new ArgumentNullException(nameof(nums2));
        if (m < 0 || n < 0 || nums1.Length != m + n || nums2.Length != n)
            throw new ArgumentException("Lengths and valid-prefix counts are inconsistent.");

        int i = m - 1, j = n - 1, write = m + n - 1;
        while (j >= 0)
        {
            if (i >= 0 && nums1[i] > nums2[j]) nums1[write--] = nums1[i--];
            else nums1[write--] = nums2[j--];
        }
        return nums1;
    }

    private static void Equal(int[] actual, int[] expected, string label)
    {
        if (actual.Length != expected.Length) throw new InvalidOperationException(label + " length");
        for (int i = 0; i < actual.Length; i++)
            if (actual[i] != expected[i]) throw new InvalidOperationException(label + " index " + i);
    }

    public static void Main()
    {
        Equal(Merge(new[] { 1, 2, 3, 0, 0, 0 }, 3, new[] { 2, 5, 6 }, 3), new[] { 1, 2, 2, 3, 5, 6 }, "Example 1");
        Equal(Merge(new[] { 1 }, 1, Array.Empty<int>(), 0), new[] { 1 }, "empty second");
        Equal(Merge(new[] { 0 }, 0, new[] { 1 }, 1), new[] { 1 }, "empty first");
        Equal(Merge(new[] { 2, 2, 0 }, 2, new[] { 2 }, 1), new[] { 2, 2, 2 }, "duplicates");
        Console.WriteLine("All Merge Sorted Array checks passed.");
    }
}
```

## Correctness argument

Before each iteration, indices below i are unread valid nums1 values, indices below j are unread nums2 values, and positions after write contain the largest values in final sorted order. The larger of nums1[i] and nums2[j] must occupy write, so placing it there cannot overwrite an unread value that belongs later. Decrement the corresponding pointer and write index. When nums2 is exhausted, every remaining nums1 value is already in its correct prefix location. If nums1 is exhausted first, the loop copies all remaining nums2 values.

## Step-by-step dry run

For [1,2,3,0,0,0] and [2,5,6], compare 3 and 6; put 6 at index 5. Compare 3 and 5; put 5 at 4. Compare 3 and 2; put 3 at 3. Then place 2s at indices 2 and 1; index 0 remains 1.

## Time complexity

O(m+n); each valid value is considered once.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- If a separate destination buffer is allowed, forward merging is straightforward but costs O(m+n) extra space.
- Sorting the concatenated values is O((m+n)log(m+n)) and ignores the sorted-input advantage.
- This backward technique applies whenever a destination array has free capacity at the end.

## Common mistakes and gotchas

- Starting at index zero and overwriting unread nums1 elements.
- Copying remaining nums1 values unnecessarily; they are already in place.
- Failing to copy remaining nums2 values.
- Comparing against nums1's spare zeros as if they were valid values.
- Mishandling m=0 or n=0.

## Edge-case tests

- One valid prefix empty.
- Duplicates across arrays.
- All nums1 values smaller than nums2.
- All nums1 values larger than nums2.
- Unused spare slots containing values other than zero in a defensive variant.

## Reflection questions

1. Why is writing from the end safe?
2. Why does the loop condition depend on j rather than i?
3. What invariant describes the filled suffix?
4. What tradeoff does a forward merge make?

Source: [LeetCode: Merge Sorted Array](https://leetcode.com/problems/merge-sorted-array/).
