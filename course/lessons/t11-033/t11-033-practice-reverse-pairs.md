# Fenwick trees, segment trees, and static range queries — Problem: Reverse Pairs

## Goals

Count qualifying later values with a Fenwick frequency tree, coordinate compression, and a widened comparison that cannot overflow.

## Problem statement

Count pairs `(i,j)` such that `i<j` and `nums[i] > 2*nums[j]`. [Official problem statement](https://leetcode.com/problems/reverse-pairs/)

## Input constraints

- `1 <= nums.Length <= 50,000`.
- `-2^31 <= nums[i] <= 2^31-1`.

## Examples with expected output

1. `[1,3,2,3,1]` → `2`.
2. `[2,4,3,5,1]` → `3`.
3. `[5,4,3,2,1]` → `4`.
4. `[int.MaxValue,int.MinValue]` → `1`.

## Clarifying assumptions

The inequality is strict. Values can be negative, so multiply the later value by two in `long`; comparing after overflowing `int` multiplication would be incorrect.

## Progressive hints

1. Scan from right to left; the data structure then stores candidate `nums[j]` values.
2. For each current `x`, count stored values satisfying `2*y < x`.
3. Coordinate-compress original values and binary-search the first value whose doubled value is at least `x`.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Linq;
static int ReversePairs(int[] nums)
{
    int[] sorted = nums.Distinct().OrderBy(x => x).ToArray();
    int[] tree = new int[sorted.Length + 1];
    void Add(int i) { for (; i < tree.Length; i += i & -i) tree[i]++; }
    int Prefix(int i) { int s=0; for(;i>0;i-=i&-i)s+=tree[i]; return s; }
    int LowerTwiceBound(long x)
    {
        int l=0,r=sorted.Length;
        while(l<r){int m=l+(r-l)/2;if(2L*sorted[m]<x)l=m+1;else r=m;}
        return l;
    }
    int answer = 0;
    for (int i = nums.Length - 1; i >= 0; i--)
    {
        int count = LowerTwiceBound(nums[i]);
        answer += Prefix(count);
        int rank = Array.BinarySearch(sorted, nums[i]) + 1;
        Add(rank);
    }
    return answer;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(ReversePairs(new[] {1,3,2,3,1}), 2, "example 1");
Check(ReversePairs(new[] {2,4,3,5,1}), 3, "example 2");
Check(ReversePairs(new[] {5,4,3,2,1}), 4, "descending");
Check(ReversePairs(new[] {int.MaxValue,int.MinValue}), 1, "widened multiplication");
Check(ReversePairs(new[] {2,1}), 0, "strict inequality boundary");
Console.WriteLine("All Reverse Pairs checks passed.");
```

## Correctness argument

Before processing index `i`, the Fenwick tree contains exactly values at positions `j>i`. The binary search returns the number of compressed distinct values `v` for which `2L*v < nums[i]`. The Fenwick prefix query counts their occurrences, including duplicates. Thus the increment equals exactly the valid pairs beginning at `i`. Afterward, inserting `nums[i]` makes it available as a later value for indices to its left. Summing over all `i` counts every valid pair once. Widening before doubling preserves the mathematical inequality across the full input range.

## Step-by-step dry run

For `[1,3,2,3,1]`, scan from the final 1, inserting it. The 3 at index 3 sees one later 1 satisfying `3>2*1`; the 3 at index 1 also sees one later 1, but not 2 or 3. Those two pairs produce the official total 2.

## Time complexity

`O(n log n)` for sorting/compression and one binary search/Fenwick operation per element.

## Space complexity

`O(n)`.

## Edge-case tests

Assertions cover official examples, descending order, a strict-boundary pair, and signed integer extremes where widening is essential.

## Reflection questions

1. Why is a wider type required for `2*nums[j]`?
2. Why does reverse scanning make a frequency tree useful?
3. How does merge-sort counting achieve the same asymptotic complexity?

## Reflection answers

1. Doubling a 32-bit value can exceed the signed 32-bit range and overflow can reverse comparisons; widen before multiplication.
2. Reverse scanning ensures the frequency tree contains exactly values at later indexes, which are the only eligible `j` for the current `i`.
3. Merge sort counts cross-half pairs with two pointers while sorting each half, so the total work is `O(n log n)` without coordinate compression.
