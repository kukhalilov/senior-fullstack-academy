# sets and membership algorithms — Problem: Intersection of Two Arrays

## Goals
- Compute unique membership overlap rather than multiset overlap.
- Use sets to ignore duplicates in both inputs and the result.
- Distinguish this task from intersection with multiplicity.

## Problem statement
Given two integer arrays, return their intersection. Each result value must be unique; result order is unrestricted.

## Input constraints
- `1 <= nums1.Length, nums2.Length <= 1,000`.
- `0 <= nums1[i], nums2[i] <= 1,000`.

## Examples with expected output
- `[1,2,2,1]`, `[2,2]` -> `[2]`.
- `[4,9,5]`, `[9,4,9,8,4]` -> `[4,9]` or `[9,4]`.
- `[1]`, `[2]` -> `[]`.

## Clarifying assumptions
- A value is included once even if it occurs many times in either input.
- This is set intersection, not the multiset intersection problem.
- Inputs are not modified.

## Progressive hints
1. Put values from one input in a set.
2. Scan the other input and check membership.
3. Store matches in a second set so duplicates in the scan do not repeat in the result.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static int[] Intersection(int[] nums1, int[] nums2)
    {
        var first = new HashSet<int>(nums1);
        var common = new HashSet<int>();
        foreach (int value in nums2)
            if (first.Contains(value)) common.Add(value);
        return common.Order().ToArray();
    }

    static void Check(int[] expected, int[] a, int[] b)
    {
        int[] actual = Intersection(a, b);
        if (!expected.Order().SequenceEqual(actual))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 2 }, new[] { 1, 2, 2, 1 }, new[] { 2, 2 });
        Check(new[] { 4, 9 }, new[] { 4, 9, 5 }, new[] { 9, 4, 9, 8, 4 });
        Check(Array.Empty<int>(), new[] { 1 }, new[] { 2 });
        Check(new[] { 0 }, new[] { 0, 0 }, new[] { 0 });
        Console.WriteLine("Intersection of Two Arrays checks passed.");
    }
}
```

## Correctness argument
The first set contains exactly the distinct values from `nums1`. Every value in `nums2` that belongs to this set is in both arrays and is added to `common`. Set insertion retains each such value once. No value absent from either input can be added, and every common value is encountered during the scan, so the result is exactly the unique intersection.

## Step-by-step dry run
For `[1,2,2,1]` and `[2,2]`, the first set is `{1,2}`. Both scanned values 2 are members, but adding to `common` twice leaves `{2}`.

## Time complexity
Expected O(m+n) for set construction and membership checks, plus O(r log r) for sorting r result values to make this implementation deterministic. Returning unsorted set contents removes that sorting cost because order is unrestricted.

## Space complexity
O(u1+r), where u1 is the number of distinct values in the first array and r is the intersection size; output storage is included in r.

## Alternatives and tradeoffs
- Iterate over the smaller input after building the other set to reduce membership checks.
- Sort both arrays and use two pointers; O(m log m+n log n) time and can avoid hash assumptions, but sorting copies costs storage if inputs must remain unchanged.
- Use one mutable set and remove matches; compact, but it mutates the temporary membership set and requires care to preserve uniqueness.
- Multiset intersection needs frequency counts and can return repeated values; that is a different contract.

## Common mistakes and gotchas
- Returning duplicate common values.
- Assuming the result keeps input order.
- Treating intersection as multiset overlap.
- Sorting input arrays in place without accounting for mutation.

## Edge-case tests
- Repeated values on both sides.
- No overlap.
- Zero as a valid value.
- One value shared many times but emitted once.

## Reflection questions
1. Why does this task need a set for the result?
2. What change would be needed for multiset intersection?
3. When should the smaller array be scanned?

## Source
- [Intersection of Two Arrays](https://leetcode.com/problems/intersection-of-two-arrays/)
