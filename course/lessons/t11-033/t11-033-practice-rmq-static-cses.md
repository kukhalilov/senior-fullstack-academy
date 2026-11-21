# Fenwick trees, segment trees, and static range queries — Problem: Static Range Minimum Queries

## Goals

Build a sparse table for immutable range minima and answer each inclusive query in constant time using idempotence.

## Problem statement

Given an array and queries `[a,b]`, return the minimum value in each inclusive range. This lesson uses the [CSES Static Range Minimum Queries problem](https://cses.fi/problemset/task/1647/).

## Input constraints

- `1 <= n,q <= 200,000`.
- `1 <= x[i] <= 10^9`.
- `1 <= a <= b <= n` (CSES statement uses one-based positions).

## Examples with expected output

For values `[3,2,4,5,1,1,5,3]` and queries `[2,4]`, `[5,6]`, `[1,8]`, `[3,3]`, the outputs are `2`, `1`, `1`, `4`.

## Clarifying assumptions

The code interface uses zero-based inclusive endpoints; the CSES parser would subtract one from each one-based input endpoint. The array is static. The operation is minimum, which is idempotent, allowing the query blocks to overlap.

## Progressive hints

1. Precompute interval minima for lengths that are powers of two.
2. For query length `L`, choose `k=floor(log2 L)`.
3. Combine the block starting at `left` and the block ending at `right`; they cover the range and overlap harmlessly for minimum.

## Complete C# solution

```csharp dsa-solution
using System;
static int[][] BuildSparseTable(int[] values, out int[] logs)
{
    int n = values.Length, levels = 1;
    while ((1 << levels) <= n) levels++;
    int[][] table = new int[levels][];
    table[0] = (int[])values.Clone();
    for (int k = 1; k < levels; k++)
    {
        int len = 1 << k, half = len >> 1;
        table[k] = new int[n - len + 1];
        for (int i = 0; i + len <= n; i++) table[k][i] = Math.Min(table[k-1][i], table[k-1][i+half]);
    }
    logs = new int[n + 1];
    for (int i = 2; i <= n; i++) logs[i] = logs[i >> 1] + 1;
    return table;
}
static int Query(int[][] table, int[] logs, int left, int right)
{
    int k = logs[right - left + 1], len = 1 << k;
    return Math.Min(table[k][left], table[k][right - len + 1]);
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
int[] values = {3,2,4,5,1,1,5,3};
int[][] st = BuildSparseTable(values, out int[] logs);
Check(Query(st,logs,1,3), 2, "CSES query [2,4]");
Check(Query(st,logs,4,5), 1, "CSES query [5,6]");
Check(Query(st,logs,0,7), 1, "full range");
Check(Query(st,logs,2,2), 4, "single element");
int[][] second = BuildSparseTable(new[] {-4,7}, out int[] logs2);
Check(Query(second,logs2,0,1), -4, "negative value");
Console.WriteLine("All static RMQ checks passed.");
```

## Correctness argument

At level `k`, each table cell is the minimum over a length `2^k` interval, by induction from single-element level zero and combining adjacent half intervals. For a query of length `L`, the two selected blocks each have length `2^floor(log2 L)`. Together they cover the whole query; they may overlap. The minimum of the union is unchanged by duplicated elements because `min(x,x)=x`. Therefore the minimum of the two stored block minima is the exact range minimum.

## Step-by-step dry run

For zero-based query `[1,3]` over `[3,2,4,5,...]`, length is 3 and `k=1`, so block length is 2. Use `[1,2]` with minimum 2 and `[2,3]` with minimum 4; their overlap at index 2 is harmless, and the combined minimum is 2.

## Time complexity

Preprocessing is `O(n log n)` time; each query is `O(1)`.

## Space complexity

`O(n log n)` integers.

## Edge-case tests

Checks use all four official CSES sample queries, a singleton range, a full range, and a negative value case.

## Reflection questions

1. Why can the query blocks overlap for minimum?
2. Why would the same query formula be wrong for sums?
3. What data structure would support point updates after preprocessing?

## Reflection answers

1. Minimum is idempotent: repeating an element already included in the queried range cannot change the minimum.
2. Sum is not idempotent; overlapping blocks count their shared elements twice.
3. A segment tree supports point updates with logarithmic update and query time; a Fenwick tree works for sums but not arbitrary minimum replacement queries.
