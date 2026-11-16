# sequence and string dynamic programming — Problem: Maximum Length of Repeated Subarray

Source: [Maximum Length of Repeated Subarray](https://leetcode.com/problems/maximum-length-of-repeated-subarray/).

## Goals

Model the contiguous match that ends at a pair of positions, reset on mismatch, and use rolling rows safely.

## Problem statement

Given integer arrays `nums1` and `nums2`, return the maximum length of a contiguous subarray that appears in both arrays.

## Input constraints

- `1 <= nums1.length, nums2.length <= 1000`.
- `0 <= nums1[i], nums2[i] <= 100`.

## Examples with expected output

- `[1,2,3,2,1]`, `[3,2,1,4,7]` → `3`.
- `[0,0,0,0,0]`, `[0,0,0,0,0]` → `5`.

## Clarifying assumptions

The common subarray must be contiguous in both arrays. Return its length only. The implementation supports empty generalized arrays and returns zero.

## Progressive hints

1. Let `dp[j]` describe a common suffix ending at the current element of the first array and position `j-1` of the second.
2. On equality, extend the previous row’s diagonal.
3. On mismatch, the suffix ending here has length zero; clear that cell.
4. Track a global maximum because the best match may end before either array ends.

## Complete C# solution

```csharp dsa-solution
using System;

static int FindLength(int[] first, int[] second)
{
    if (second.Length > first.Length) return FindLength(second, first);
    int[] previous = new int[second.Length + 1];
    int[] current = new int[second.Length + 1];
    int best = 0;
    foreach (int a in first)
    {
        Array.Clear(current);
        for (int j = 1; j <= second.Length; j++)
        {
            if (a == second[j - 1])
            {
                current[j] = previous[j - 1] + 1;
                best = Math.Max(best, current[j]);
            }
        }
        (previous, current) = (current, previous);
    }
    return best;
}

static void Check(int expected, int actual)
{
    if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
}

Check(3, FindLength(new[] { 1, 2, 3, 2, 1 }, new[] { 3, 2, 1, 4, 7 }));
Check(5, FindLength(new[] { 0, 0, 0, 0, 0 }, new[] { 0, 0, 0, 0, 0 }));
Check(0, FindLength(new[] { 1, 2, 3 }, new[] { 4, 5, 6 }));
Check(0, FindLength(Array.Empty<int>(), new[] { 1, 2 }));
Check(2, FindLength(new[] { 1, 2, 8, 9 }, new[] { 0, 1, 2, 7 }));
Check(1, FindLength(new[] { 1, 2, 1 }, new[] { 1 }));
```

## Correctness argument

After each first-array element is processed, `previous[j]` is the length of the longest common contiguous suffix ending at that processed position and at `second[j-1]`. If the values match, appending them extends exactly the diagonal suffix from the prior row; otherwise the suffix ending at this pair is empty, represented by zero. Clearing the current row prevents stale diagonal values from surviving a mismatch. Every common subarray has a final pair of equal elements and is represented by one such state. Taking the maximum across all states therefore returns the longest common subarray.

## Step-by-step dry run

For `[1,2,3]` and `[2,3]`, process `1`: no matches. Process `2`: the cell for second-array value `2` becomes 1. Process `3`: the next cell extends the previous diagonal to 2. The global maximum is 2, for `[2,3]`.

## Time complexity

`O(nm)` comparisons for arrays of lengths `n` and `m`.

## Space complexity

`O(min(n,m))` for two rows; the shorter array is used as the column dimension.

## Edge-case tests

Assertions cover both supplied examples, no overlap, an empty generalized array, a match beginning after unmatched prefixes, and repeated values.

## Reflection questions

- What bug appears if `current` is not cleared each iteration?
- Why is the answer a global maximum instead of `previous[^1]`?
- How does this recurrence differ from LCS?
