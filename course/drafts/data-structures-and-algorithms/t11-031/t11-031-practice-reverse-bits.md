# bitwise operations, masks, and subset enumeration — Problem: Reverse Bits

## Goals

Reverse exactly 32 bit positions and preserve the intended unsigned bit pattern through C# shifts.

## Problem statement

Reverse the bits of a 32-bit input value and return the resulting 32-bit pattern. [Official problem statement](https://leetcode.com/problems/reverse-bits/)

## Input constraints

- `0 <= n <= 2^31 - 2`.
- `n` is even.
- The algorithm processes the fixed 32-bit representation, including leading zero bits.

## Examples with expected output

1. `43261596` → `964176192`.
2. `2147483644` → `1073741822`.
3. `0` → `0`.

## Clarifying assumptions

The C# implementation uses `uint` to represent all 32 output bits. Convert to signed `int` only when adapting to an interface that requires the signed interpretation; the bit pattern remains the same.

## Progressive hints

1. Repeat exactly 32 times, not until the source becomes zero.
2. Extract the source low bit, shift the result left, append the bit.
3. Shift the source right logically so high bits do not sign-extend.

## Complete C# solution

```csharp dsa-solution
using System;
static uint ReverseBits(uint n)
{
    uint result = 0;
    for (int i = 0; i < 32; i++)
    {
        result = (result << 1) | (n & 1u);
        n >>= 1;
    }
    return result;
}
static void Check(uint actual, uint expected, string label)
{
    if (actual != expected) throw new InvalidOperationException($"{label}: expected {expected}, got {actual}");
}
Check(ReverseBits(43261596u), 964176192u, "example 1");
Check(ReverseBits(2147483644u), 1073741822u, "example 2");
Check(ReverseBits(0u), 0u, "zero");
Check(ReverseBits(1u), 2147483648u, "lowest input bit reaches sign position");
Check(ReverseBits(uint.MaxValue), uint.MaxValue, "all bits set");
Console.WriteLine("All Reverse Bits checks passed.");
```

## Correctness argument

After `k` iterations, the result contains the first `k` source bits in reverse order in its low `k` positions: shifting the partial result left opens the next low position, and OR appends the source's current low bit. Logical right shift exposes the next source bit and fills with zero. After exactly 32 iterations, every input position has been consumed and placed at its mirrored position. Leading zeros must be processed, which is why a fixed count is necessary.

## Step-by-step dry run

For a four-bit illustration `1101`, extract bits in order `1,0,1,1`; append them to an initially zero result, yielding `1`, `10`, `101`, `1011`. For the actual 32-bit problem, the same process continues through all positions, including leading zeros.

## Time complexity

`O(32) = O(1)` for a fixed-width value.

## Space complexity

`O(1)`.

## Edge-case tests

Checks cover both official examples, zero, one low bit, and all bits set. The `1u` test verifies correct movement into the top position.

## Reflection questions

1. What would go wrong if the loop stopped when `n` became zero?
2. Why use `uint` instead of arithmetic `int >>`?
3. How could a lookup table accelerate repeated reversals, and what would it cost?
