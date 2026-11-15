# Fenwick trees, segment trees, and static range queries — Problem: Create Sorted Array through Instructions

## Goals

Compute insertion costs from strict less/greater frequency counts with a Fenwick tree and preserve duplicate semantics.

## Problem statement

Process instructions from left to right. The cost to insert `x` is the smaller of the number of prior values strictly less than `x` and strictly greater than `x`. Return total cost modulo `10^9+7`. [Official problem statement](https://leetcode.com/problems/create-sorted-array-through-instructions/)

## Input constraints

- `1 <= instructions.Length <= 100,000`.
- `1 <= instructions[i] <= 100,000`.

## Examples with expected output

1. `[1,5,6,2]` → `1`.
2. `[1,2,3,6,5,4]` → `3`.
3. `[1,3,3,3,2,4,2,1,2]` → `4`.
4. `[5,5,5]` → `0` because equal values are neither strictly less nor strictly greater.

## Clarifying assumptions

Only already-processed values contribute to a cost. Values equal to the inserted value count in neither strict side. The modulus applies to the accumulated answer, not to frequencies.

## Progressive hints

1. Maintain prior frequencies in a Fenwick tree indexed by value.
2. `less = prefix(x-1)` and `lessOrEqual = prefix(x)`.
3. `greater = insertedCount-lessOrEqual`; compute cost, then insert `x`.

## Complete C# solution

```csharp dsa-solution
using System;
static int CreateSortedArray(int[] instructions)
{
    const int mod = 1_000_000_007, maxValue = 100_000;
    int[] tree = new int[maxValue + 1];
    void Add(int value) { for (int i=value; i<tree.Length; i+=i&-i) tree[i]++; }
    int Prefix(int value) { int s=0; for(int i=value;i>0;i-=i&-i)s+=tree[i]; return s; }
    long answer = 0;
    for (int i = 0; i < instructions.Length; i++)
    {
        int x = instructions[i];
        int less = Prefix(x - 1), lessOrEqual = Prefix(x);
        int greater = i - lessOrEqual;
        answer = (answer + Math.Min(less, greater)) % mod;
        Add(x);
    }
    return (int)answer;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(CreateSortedArray(new[] {1,5,6,2}), 1, "example 1");
Check(CreateSortedArray(new[] {1,2,3,6,5,4}), 3, "example 2");
Check(CreateSortedArray(new[] {1,3,3,3,2,4,2,1,2}), 4, "example 3");
Check(CreateSortedArray(new[] {5,5,5}), 0, "equal values are excluded");
Check(CreateSortedArray(new[] {1,100000}), 0, "extreme domain values");
Console.WriteLine("All sorted-instructions checks passed.");
```

## Correctness argument

Before inserting position `i`, the Fenwick tree contains exactly the frequencies of prior values. `Prefix(x-1)` counts those strictly below `x`; `Prefix(x)` counts those at most `x`; subtracting from `i` yields prior values strictly greater than `x`. Thus the minimum is exactly the operation's insertion cost. Adding the current value afterward ensures it affects only later instructions. Summing each cost modulo the required modulus yields the returned answer.

## Step-by-step dry run

For `[1,5,6,2]`, costs are: 1 sees no values → 0; 5 has one smaller and none greater → 0; 6 has two smaller and none greater → 0; 2 has one smaller (1) and two greater (5,6) → 1. Total is 1.

## Time complexity

`O(n log M)`, where `M=100,000` is the maximum instruction value.

## Space complexity

`O(M)` integer frequencies.

## Edge-case tests

Assertions cover all official examples, all-equal duplicate handling, and minimum/maximum supported values.

## Reflection questions

1. Why do equal prior values contribute to neither strict count?
2. Why calculate the cost before inserting the current value?
3. How would coordinate compression help if the value limit were much larger but only a small set of values appeared?
