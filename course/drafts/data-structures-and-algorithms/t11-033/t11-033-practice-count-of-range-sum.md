# Fenwick trees, segment trees, and static range queries — Problem: Count of Range Sum

## Goals

Transform subarray sums into prefix-pair differences and count valid earlier prefixes with coordinate compression plus a Fenwick tree.

## Problem statement

Count nonempty subarrays whose sum lies in the inclusive interval `[lower,upper]`. [Official problem statement](https://leetcode.com/problems/count-of-range-sum/)

## Input constraints

- `1 <= nums.Length <= 100,000`.
- `-2^31 <= nums[i] <= 2^31-1`.
- `-100,000 <= lower <= upper <= 100,000`.
- The answer fits a 32-bit signed integer.

## Examples with expected output

1. `nums=[-2,5,-1]`, `lower=-2`, `upper=2` → `3`.
2. `nums=[0]`, `lower=0`, `upper=0` → `1`.
3. `nums=[1,-1,1]`, `lower=0`, `upper=0` → `2` (`[1,-1]` and `[-1,1]`).

## Clarifying assumptions

For prefix sums `P[0]=0`, subarray `(j..i-1)` has sum `P[i]-P[j]` and must be nonempty, so only previously inserted prefixes are queried before inserting `P[i]`. Use `long` for prefix sums because the array values can be 32-bit and there can be 100,000 of them.

## Progressive hints

1. Rearrange `lower <= P[i]-P[j] <= upper` to a range for `P[j]`.
2. The valid earlier prefixes lie in `[P[i]-upper, P[i]-lower]`.
3. Compress every prefix value, query inclusive rank bounds, then insert the current prefix.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Linq;
static int CountRangeSum(int[] nums, int lower, int upper)
{
    long[] prefix = new long[nums.Length + 1];
    for (int i = 0; i < nums.Length; i++) prefix[i + 1] = prefix[i] + nums[i];
    long[] sorted = prefix.Distinct().OrderBy(x => x).ToArray();
    int[] tree = new int[sorted.Length + 1];
    void Add(int i) { for (; i < tree.Length; i += i & -i) tree[i]++; }
    int Prefix(int i) { int s = 0; for (; i > 0; i -= i & -i) s += tree[i]; return s; }
    int LowerBound(long x) { int l=0,r=sorted.Length; while(l<r){int m=l+(r-l)/2;if(sorted[m]<x)l=m+1;else r=m;} return l; }
    int UpperBound(long x) { int l=0,r=sorted.Length; while(l<r){int m=l+(r-l)/2;if(sorted[m]<=x)l=m+1;else r=m;} return l; }
    long answer = 0;
    Add(LowerBound(prefix[0]) + 1);
    for (int i = 1; i < prefix.Length; i++)
    {
        long minPrevious = prefix[i] - upper, maxPrevious = prefix[i] - lower;
        int firstRank = LowerBound(minPrevious), afterLastRank = UpperBound(maxPrevious);
        answer += Prefix(afterLastRank) - Prefix(firstRank);
        Add(LowerBound(prefix[i]) + 1);
    }
    return (int)answer;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(CountRangeSum(new[] {-2,5,-1}, -2, 2), 3, "example 1");
Check(CountRangeSum(new[] {0}, 0, 0), 1, "example 2");
Check(CountRangeSum(new[] {1,-1,1}, 0, 0), 2, "zero-sum subarrays");
Check(CountRangeSum(new[] {3}, -5, -1), 0, "no qualifying range");
Check(CountRangeSum(new[] {0,0,0}, 0, 0), 6, "duplicate prefix sums");
Console.WriteLine("All Count of Range Sum checks passed.");
```

## Correctness argument

For each right prefix `P[i]`, a previous prefix `P[j]` produces a valid subarray exactly when `P[i]-upper <= P[j] <= P[i]-lower`. Before processing `i`, the Fenwick tree contains each prefix `P[0..i-1]` once, including duplicate values as frequency increments. Coordinate lower/upper bounds identify exactly the ranks in the inclusive interval; subtracting two prefix frequencies counts them. Inserting `P[i]` only after querying enforces `j<i`, so every counted range is nonempty. Every nonempty subarray corresponds to one such ordered prefix pair, proving exact counting.

## Step-by-step dry run

For `[-2,5,-1]`, prefixes are `[0,-2,3,2]`. For final prefix 2, previous prefix 0 lies in `[2-2,2-(-2)]=[0,4]`, contributing subarray sum 2. Processing every prefix this way counts three valid pairs/ranges.

## Time complexity

`O(n log n)` for sorting/compression and two binary searches plus Fenwick operations per prefix.

## Space complexity

`O(n)` for prefix values, compressed ranks, and the Fenwick tree.

## Edge-case tests

Tests cover all official examples, no result, duplicate prefixes (zero sums), and inclusive interval bounds.

## Reflection questions

1. Why must the current prefix be inserted after its query?
2. Why are prefix values stored as `long`?
3. How does a merge-sort counting solution avoid coordinate compression?

## Reflection answers

1. Inserting the current prefix first would allow pairing it with itself, which represents an empty subarray; querying first enforces the required earlier index `j<i`.
2. Up to 100,000 signed 32-bit values can accumulate beyond the 32-bit range, so prefix sums and derived bounds use `long`.
3. A merge-sort method sorts prefix sums by halves and counts, with two moving pointers, how many right-half prefixes form an allowed difference for each left prefix, then merges the halves. It achieves `O(n log n)` without ranking every value in a Fenwick tree.
