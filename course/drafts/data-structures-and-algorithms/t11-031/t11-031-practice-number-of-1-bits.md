# bitwise operations, masks, and subset enumeration — Problem: Number of 1 Bits

## Goals

Count set bits using the lowest-bit-clearing identity and distinguish a numeric value from its bit representation.

## Problem statement

Return the number of one bits (Hamming weight) in the binary representation of a positive integer. [Official problem statement](https://leetcode.com/problems/number-of-1-bits/)

## Input constraints

- `1 <= n <= 2^31 - 1`.

## Examples with expected output

1. `11` (`1011`) → `3`.
2. `128` (`10000000`) → `1`.
3. `2147483645` → `30`.

## Clarifying assumptions

The supplied judge constraint is positive signed `int`, so this solution handles those values. For a general 32-bit pattern that may be negative, use a `uint` parameter or scan exactly 32 bit positions.

## Progressive hints

1. `x-1` changes the lowest one bit and all bits below it.
2. What remains after ANDing `x` with `x-1`?
3. Count one per iteration until the value becomes zero.

## Complete C# solution

```csharp dsa-solution
using System;
static int HammingWeight(int n)
{
    int count = 0;
    while (n != 0) { n &= n - 1; count++; }
    return count;
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(HammingWeight(11), 3, "example 1");
Check(HammingWeight(128), 1, "example 2");
Check(HammingWeight(2147483645), 30, "example 3");
Check(HammingWeight(1), 1, "lowest bit only");
Check(HammingWeight(int.MaxValue), 31, "maximum positive int");
Console.WriteLine("All Hamming weight checks passed.");
```

## Correctness argument

For positive `n`, the expression `n & (n-1)` clears exactly its least significant set bit and leaves every other one bit unchanged. Thus each loop iteration reduces the population count by exactly one. The loop ends at zero, where the count is zero; therefore the number of iterations equals the original number of set bits.

## Step-by-step dry run

For 11 (`1011`): clear the lowest one to get `1010`, then `1000`, then `0000`. Three iterations mean three set bits.

## Time complexity

`O(k)`, where `k` is the number of set bits; at most 31 for positive `int` under these constraints.

## Space complexity

`O(1)`.

## Edge-case tests

Tests include all official examples, a single set bit, and all 31 bits of `int.MaxValue`. Zero is outside the official constraints and would correctly return zero.

## Reflection questions

1. Why does the loop run once per set bit instead of once per bit position?
2. How would you count all 32 bits of a negative `int` pattern?
3. What identity recognizes a positive power of two?
