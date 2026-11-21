# prefix sums, difference arrays, and static range queries — Problem: Range Sum Query - Immutable

## Goals

- Precompute exclusive prefix sums for repeated static queries.
- Translate inclusive query endpoints into prefix boundaries exactly once.
- Explain why later source mutation would make the table stale.

## Problem statement

Implement a NumArray class initialized with an integer array. Each `SumRange(left,right)` call returns the sum of elements from left through right, inclusive. The source array does not change between queries.

## Input constraints

- 1 <= nums.Length <= 10,000.
- -100,000 <= nums[i] <= 100,000.
- 0 <= left <= right < nums.Length.
- Up to 10,000 range queries may be made.

## Examples with expected output

1. nums = [-2,0,3,-5,2,-1], query (0,2) -> 1.
2. The same nums, query (2,5) -> -1.
3. The same nums, query (0,5) -> -3.
4. nums = [7], query (0,0) -> 7.

## Clarifying assumptions

- Query endpoints are valid zero-based inclusive indices, as guaranteed by the constraints.
- The implementation copies values into a prefix table during construction; later edits to the caller's array do not alter the NumArray's snapshot.
- The required return type is int for this problem; internal sums are long and conversion is checked.
- The class supports multiple queries and does not modify the input array.

## Progressive hints

1. If every query scans its range, repeated overlapping queries repeat work.
2. Build `prefix[i+1] = prefix[i] + nums[i]` once.
3. Inclusive `[left,right]` becomes half-open `[left,right+1)`.
4. Subtract the prefix before left from the prefix through right.

## Complete C# solution

```csharp dsa-solution
using System;

public sealed class NumArray
{
    private readonly long[] prefix;

    public NumArray(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        prefix = new long[nums.Length + 1];
        for (int i = 0; i < nums.Length; i++)
            prefix[i + 1] = prefix[i] + nums[i];
    }

    public int SumRange(int left, int right)
    {
        if (left < 0 || right < left || right + 1 >= prefix.Length)
            throw new ArgumentOutOfRangeException(nameof(left));
        return checked((int)(prefix[right + 1] - prefix[left]));
    }
}

public static class Program
{
    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        var query = new NumArray(new[] { -2, 0, 3, -5, 2, -1 });
        AssertEqual(query.SumRange(0, 2), 1, "Example 1");
        AssertEqual(query.SumRange(2, 5), -1, "Example 2");
        AssertEqual(query.SumRange(0, 5), -3, "Example 3");
        AssertEqual(new NumArray(new[] { 7 }).SumRange(0, 0), 7, "Single element");
        Console.WriteLine("All Range Sum Query - Immutable checks passed.");
    }
}
```

## Correctness argument

After construction, `prefix[i]` equals the sum of source elements with indices less than i. This follows by induction: prefix zero is the empty sum, and each next entry adds exactly nums[i-1]. Therefore the inclusive range `[left,right]` equals the sum of elements before boundary `right+1` minus the sum before boundary `left`; all earlier elements cancel. The method returns that difference for every valid query.

## Step-by-step dry run

For nums `[-2,0,3,-5,2,-1]`, prefix becomes `[0,-2,-2,1,-4,-2,-3]`. Query `[2,5]` uses `prefix[6]-prefix[2] = -3-(-2) = -1`.

## Time complexity

Construction O(n); each query O(1).

## Space complexity

O(n) for the prefix table.

## Alternatives and tradeoffs

- A direct range scan uses O(1) extra space and O(range length) per query. It can be preferable for one or very few queries.
- A Fenwick or segment tree supports changing values with logarithmic update/query costs; immutable prefixes are simpler and faster when the input remains static.
- An inclusive prefix table is also possible but needs a special case for left zero; exclusive boundaries avoid it.

## Common mistakes and gotchas

- Returning `prefix[right]-prefix[left]`, which omits the right element for inclusive queries.
- Allocating only n prefix entries and accessing boundary n for a full-array query.
- Recomputing a prefix table per query, losing the preprocessing benefit.
- Mutating nums and assuming the already-built table follows those changes.
- Using `int` for a generalized larger input without proving the total fits.

## Edge-case tests

- A single-element range at index zero.
- A query spanning the entire array.
- Negative values and a negative range sum.
- A range containing zeros.
- Invalid endpoints should be rejected by the robust implementation.

## Reflection questions

1. Why does the prefix array have one extra slot?
2. How does the inclusive right endpoint become an exclusive boundary?
3. What becomes stale if the underlying input changes after construction?
4. When is a direct scan simpler than preprocessing?

Source: [LeetCode: Range Sum Query - Immutable](https://leetcode.com/problems/range-sum-query-immutable/).
