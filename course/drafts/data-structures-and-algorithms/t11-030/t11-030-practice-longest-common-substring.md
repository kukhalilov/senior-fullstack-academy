# sequence and string dynamic programming — Problem: Maximum Length of Repeated Subarray

## Goals

Model contiguous matching suffixes, reset on mismatch, and track the maximum over every endpoint pair.

## Problem statement

Given integer arrays `nums1` and `nums2`, return the maximum length of a contiguous subarray appearing in both. [Official problem statement](https://leetcode.com/problems/maximum-length-of-repeated-subarray/)

## Input constraints

- `1 <= nums1.Length, nums2.Length <= 1000`.
- `0 <= nums1[i], nums2[i] <= 100`.

## Examples with expected output

1. `[1,2,3,2,1]`, `[3,2,1,4,7]` → `3` (`[3,2,1]`).
2. `[0,0,0,0,0]`, `[0,0,0,0,0]` → `5`.
3. `[1,2,3]`, `[4,5,6]` → `0`.
4. `[1,2,1]`, `[1,1]` → `1`.

## Clarifying assumptions

Subarrays are contiguous. The best matching run can end before either array ends, so return a global maximum rather than the bottom-right cell.

## Progressive hints

1. Let `dp[i,j]` be a common run ending at the two current positions.
2. Equality extends only the previous diagonal; mismatch resets to zero.
3. Keep the largest value seen anywhere.

## Complete C# solution

```csharp dsa-solution
using System;
static int FindLength(int[] a, int[] b)
{
    int[] previous = new int[b.Length + 1];
    int best = 0;
    for (int i = 1; i <= a.Length; i++)
    {
        int[] current = new int[b.Length + 1];
        for (int j = 1; j <= b.Length; j++)
            if (a[i - 1] == b[j - 1]) { current[j] = previous[j - 1] + 1; best = Math.Max(best, current[j]); }
        previous = current;
    }
    return best;
}
static void Check(int x, int y, string label)
{
    if (x != y) throw new InvalidOperationException($"{label}: expected {y}, got {x}");
}
Check(FindLength(new[] {1,2,3,2,1}, new[] {3,2,1,4,7}), 3, "example 1");
Check(FindLength(new[] {0,0,0,0,0}, new[] {0,0,0,0,0}), 5, "example 2");
Check(FindLength(new[] {1,2,3}, new[] {4,5,6}), 0, "no match");
Check(FindLength(new[] {1,2,1}, new[] {1,1}), 1, "noncontiguous values do not join");
Check(FindLength(new[] {2}, new[] {2}), 1, "single match");
Console.WriteLine("All repeated-subarray checks passed.");
```

## Correctness argument

Let `dp[i,j]` be the length of a common contiguous suffix ending at positions `i-1` and `j-1`. If values differ, no nonempty matching suffix ends at both, so the state is zero. If equal, append that pair to the common suffix ending at the preceding positions, giving `dp[i-1,j-1]+1`. Every common subarray has a pair of final positions; therefore the maximum over all cells is the answer. New rows initialized to zero implement mismatch reset.

## Step-by-step dry run

In example 1, the diagonal values for `3`, `2`, `1` grow to 1, 2, 3. A later mismatch resets the current run but not `best`, which remains 3.

## Time complexity

`O(nm)`.

## Space complexity

`O(m)` integers for two rows.

## Edge-case tests

Checks include both official examples, no shared values, equal values separated by a gap, and a singleton match.

## Reflection questions

1. Why is there no skip transition?
2. Why can the maximum be earlier than the last cell?
3. How would allowing skips change the problem to LCS?
