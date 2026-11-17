# timed mock interviews and spaced problem rehearsal — Problem: Median of Two Sorted Arrays

## Goals
- Compare a linear merge baseline with a logarithmic partition.
- Derive the partition conditions from sorted order.
- Handle empty partitions and even-sized totals safely.

## Problem statement
Given two individually sorted integer arrays whose combined length is nonzero, return the median of the combined sorted multiset without merging it. The required time is O(log(m+n)).

## Input constraints
- Each array length is 0 through 1,000; combined length is 1 through 2,000.
- Values lie between -1,000,000 and 1,000,000.
- Both arrays are sorted in nondecreasing order.

## Examples with expected output
- `[1,3]`, `[2]` -> `2.0`.
- `[1,2]`, `[3,4]` -> `2.5`.
- `[]`, `[5]` -> `5.0`.

## Clarifying assumptions
- Duplicate values are permitted and count with multiplicity.
- Either array may be empty, but not both.
- Output is a double; average the two middle values for an even total.

## Progressive hints
1. A merge algorithm only needs to produce the first half of the merged order and is O(m+n).
2. Binary search a partition in the shorter array; the other partition is determined by the desired left-half size.
3. A valid partition has both left-side values no greater than both right-side values.
4. Use sentinel extremes for missing partition elements, and average even medians through `long` to avoid addition overflow.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static double FindMedianSortedArrays(int[] a, int[] b)
    {
        if (a.Length > b.Length) return FindMedianSortedArrays(b, a);
        if (a.Length + b.Length == 0) throw new ArgumentException("At least one value is required.");

        int m = a.Length, n = b.Length;
        int low = 0, high = m;
        int leftCount = (m + n + 1) / 2;
        while (low <= high)
        {
            int cutA = low + (high - low) / 2;
            int cutB = leftCount - cutA;
            int leftA = cutA == 0 ? int.MinValue : a[cutA - 1];
            int rightA = cutA == m ? int.MaxValue : a[cutA];
            int leftB = cutB == 0 ? int.MinValue : b[cutB - 1];
            int rightB = cutB == n ? int.MaxValue : b[cutB];

            if (leftA <= rightB && leftB <= rightA)
            {
                int leftMax = Math.Max(leftA, leftB);
                if (((m + n) & 1) == 1) return leftMax;
                int rightMin = Math.Min(rightA, rightB);
                return ((long)leftMax + rightMin) / 2.0;
            }
            if (leftA > rightB) high = cutA - 1;
            else low = cutA + 1;
        }
        throw new ArgumentException("Inputs must be sorted.");
    }

    static void Check(double expected, int[] a, int[] b)
    {
        double actual = FindMedianSortedArrays(a, b);
        if (Math.Abs(expected - actual) > 1e-9)
            throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(2.0, new[] { 1, 3 }, new[] { 2 });
        Check(2.5, new[] { 1, 2 }, new[] { 3, 4 });
        Check(5.0, Array.Empty<int>(), new[] { 5 });
        // Defensive robustness check outside the official value constraints.
        Check(-1.0, new[] { -2, 0 }, new[] { int.MinValue, int.MaxValue });
        Check(1.0, new[] { 1, 1 }, new[] { 1, 1 });
        Check(1.5, new[] { 1 }, new[] { 2 });
        Console.WriteLine("Median of Two Sorted Arrays checks passed.");
    }
}
```

## Correctness argument
The left partition contains `ceil((m+n)/2)` elements. Since both arrays are sorted, it is globally correct exactly when `leftA <= rightB` and `leftB <= rightA`. Binary search moves the partition in A left if its left boundary is too large for B's right boundary; otherwise it moves right. Searching the shorter array bounds the search and keeps the complementary partition feasible. At a valid partition, the median is the maximum left value for an odd total, or the average of the maximum left and minimum right values for an even total.

## Step-by-step dry run
For `[1,3]` and `[2]`, swap so A is `[2]`. Total 3 gives left count 2. Choose `cutA=1`, hence `cutB=1`: left values are 2 and 1; right values are sentinel and 3. Both cross-boundary inequalities hold, so the maximum left value, 2, is the median.

## Time complexity
O(log(min(m,n)+1)) partition checks, which is O(log(m+n)) for a nonempty total.

## Space complexity
O(1) auxiliary space.

## Alternatives and tradeoffs
- Merge until reaching the middle in O(m+n) time and O(1) extra space; simpler, but violates the required logarithmic time.
- Full merge is O(m+n) time and space and is useful as a small-input oracle.
- The partition method is faster but has delicate boundary arithmetic; test empty arrays, all values on one side, and sentinel-adjacent cases.

## Common mistakes and gotchas
- Binary searching the longer array, which can create infeasible cuts.
- Using `m+n` rather than `(m+n+1)/2` for the left count and mishandling odd totals.
- Checking only one cross-boundary inequality.
- Averaging two `int` values before converting, which can overflow.
- Confusing `int.MaxValue` as a real value with its role as a comparison sentinel; equality remains valid.

## Edge-case tests
- One input empty.
- Odd and even total lengths.
- All values equal.
- One array entirely below the other.
- Integer extremes in the even median as a defensive robustness check outside the official input-value constraints.

## Reflection questions
1. Why does searching the shorter array keep the other cut within bounds?
2. What invariant does each binary-search direction preserve?
3. How would you use a merge implementation to test random small inputs?

## Source
- [Median of Two Sorted Arrays](https://leetcode.com/problems/median-of-two-sorted-arrays/)
