# bitwise operations, masks, and subset enumeration — Problem: Single Number II

## Goals

Recover one exceptional signed integer by counting each of its 32 bit positions modulo three.

## Problem statement

Every value in `nums` appears three times except one value appearing once. Return the single value in linear time and constant extra space. [Official problem statement](https://leetcode.com/problems/single-number-ii/)

## Input constraints

- `1 <= nums.Length <= 30,000`.
- `-2^31 <= nums[i] <= 2^31-1`.
- Exactly one value appears once; every other value appears exactly three times.

## Examples with expected output

1. `[2,2,3,2]` → `3`.
2. `[0,1,0,1,0,1,99]` → `99`.
3. `[-2,-2,-2,-7]` → `-7`.

## Clarifying assumptions

All 32 bits, including the sign bit, belong to each integer's two's-complement pattern. Count them as `uint` patterns, then reinterpret the reconstructed 32-bit result as signed `int`.

## Progressive hints

1. At any bit position, how many ones do triples contribute modulo three?
2. The singleton's bit is the remaining count modulo three.
3. Reassemble the 32 remainder bits; use an unsigned accumulator for the sign position.

## Complete C# solution

```csharp dsa-solution
using System;
static int SingleNumberII(int[] nums)
{
    uint result = 0;
    for (int bit = 0; bit < 32; bit++)
    {
        int count = 0;
        uint mask = 1u << bit;
        foreach (int value in nums)
            if ((unchecked((uint)value) & mask) != 0) count++;
        if (count % 3 != 0) result |= mask;
    }
    return unchecked((int)result);
}
static void Check(int actual, int expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(SingleNumberII(new[] {2,2,3,2}), 3, "example 1");
Check(SingleNumberII(new[] {0,1,0,1,0,1,99}), 99, "example 2");
Check(SingleNumberII(new[] {-2,-2,-2,-7}), -7, "negative singleton");
Check(SingleNumberII(new[] {int.MinValue,5,5,5}), int.MinValue, "sign bit singleton");
Console.WriteLine("All Single Number II checks passed.");
```

## Correctness argument

Fix any bit position. Each triplicated value contributes either zero or three ones there, both zero modulo three. The singleton contributes zero or one. Therefore the total count modulo three equals exactly that singleton bit. Setting each result bit to its remainder reconstructs all 32 positions, including the sign bit. The final unchecked reinterpretation gives the corresponding signed integer.

## Step-by-step dry run

For `[2,2,3,2]`, bit 1 has four ones, which is one modulo three, so it is set in the result. Bit 0 has one one, also set. All higher positions have zero remainder. The reconstructed value is binary `11`, or 3.

## Time complexity

`O(32n)`, which is `O(n)` for fixed 32-bit integers.

## Space complexity

`O(1)` extra space.

## Edge-case tests

Tests cover both official examples, a negative singleton, and `int.MinValue` as the singleton to verify sign-bit reconstruction.

## Reflection questions

1. What changes if repeated values occur five times instead of three?
2. Why must the scan include bit 31?
3. How could a two-state finite-state bit counter avoid scanning all inputs once per bit?
