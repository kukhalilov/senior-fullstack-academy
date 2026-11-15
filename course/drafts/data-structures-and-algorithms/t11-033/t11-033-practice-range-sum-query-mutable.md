# Fenwick trees, segment trees, and static range queries — Problem: Range Sum Query - Mutable

## Goals

Implement point replacement and inclusive range-sum queries with a Fenwick tree, keeping zero-based public indexes separate from one-based internal indexes.

## Problem statement

Design a data structure initialized from an integer array that supports point replacement and returns sums on inclusive `[left,right]` ranges. [Official problem statement](https://leetcode.com/problems/range-sum-query-mutable/)

## Input constraints

- `1 <= nums.Length <= 30,000`.
- `-100 <= nums[i], val <= 100`.
- `0 <= index < nums.Length`.
- `0 <= left <= right < nums.Length`.
- At most 30,000 update and query calls.

## Examples with expected output

1. Initialize `[1,3,5]`; `sumRange(0,2)` → `9`; update index 1 to 2; `sumRange(0,2)` → `8`.
2. Initialize `[4]`; `sumRange(0,0)` → `4`; update index 0 to -1; query → `-1`.

## Clarifying assumptions

`update(index,val)` replaces the old value; it is not an increment operation. The public sum range is inclusive. A Fenwick update therefore receives the delta `val-oldValue`.

## Progressive hints

1. Store a one-based Fenwick tree and preserve current array values.
2. A point replacement changes all containing partial sums by the same delta.
3. Answer `[l,r]` as prefix length `r+1` minus prefix length `l`.

## Complete C# solution

```csharp dsa-solution
using System;
class Program
{
sealed class NumArray
{
    private readonly int[] values;
    private readonly int[] tree;
    public NumArray(int[] nums)
    {
        values = (int[])nums.Clone();
        tree = new int[nums.Length + 1];
        for (int i = 0; i < nums.Length; i++) Add(i, nums[i]);
    }
    private void Add(int index, int delta)
    {
        for (int i = index + 1; i < tree.Length; i += i & -i) tree[i] += delta;
    }
    private int Prefix(int count)
    {
        int sum = 0;
        for (int i = count; i > 0; i -= i & -i) sum += tree[i];
        return sum;
    }
    public void Update(int index, int val)
    {
        int delta = val - values[index];
        values[index] = val;
        Add(index, delta);
    }
    public int SumRange(int left, int right) => Prefix(right + 1) - Prefix(left);
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
static void Main()
    {
        var a = new NumArray(new[] {1,3,5});
Check(a.SumRange(0,2), 9, "example initial range");
a.Update(1,2);
Check(a.SumRange(0,2), 8, "example updated range");
Check(a.SumRange(1,1), 2, "single index");
var b = new NumArray(new[] {4});
Check(b.SumRange(0,0), 4, "singleton initial");
b.Update(0,-1);
Check(b.SumRange(0,0), -1, "singleton replacement");
Console.WriteLine("All mutable range-sum checks passed.");
    }
}

```

## Correctness argument

Each Fenwick cell stores the sum of a fixed block ending at its one-based index. `Add` visits exactly the containing blocks and adds the replacement delta, so every affected prefix sum changes by that delta and other prefixes do not. `Prefix(count)` decomposes the first `count` values into disjoint Fenwick blocks, so it returns their sum. Subtracting the first `left` values from the first `right+1` values leaves exactly the inclusive requested range.

## Step-by-step dry run

For `[1,3,5]`, `sumRange(0,2)=prefix(3)-prefix(0)=9`. Replacing 3 by 2 applies delta `-1` at index 1. The total prefix becomes 8, and a single-index query `[1,1]` is `prefix(2)-prefix(1)=2`.

## Time complexity

Initialization by repeated updates is `O(n log n)`; each update and query is `O(log n)`.

## Space complexity

`O(n)` for the values and Fenwick tree.

## Edge-case tests

Assertions cover the official example, a single-element range, a one-element array, negative replacement, and repeated stateful operations.

## Reflection questions

1. Why store the current values as well as the tree?
2. What indexing bug causes a Fenwick update loop to stop progressing?
3. Why does this prefix-difference approach work for sums but not minima?
