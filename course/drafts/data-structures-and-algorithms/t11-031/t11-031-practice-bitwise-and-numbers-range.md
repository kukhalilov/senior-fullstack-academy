# bitwise operations, masks, and subset enumeration — Problem: Bitwise AND of Numbers Range

# Goals

- Recognize the bit pattern invariant behind Bitwise AND of Numbers Range.
- Implement the algorithm in C# with an explicit 32-bit interpretation.
- Prove correctness and account for fixed-width and boundary cases.

# Problem statement

Return the bitwise AND of every integer in the inclusive range [left,right].

# Input constraints

- 0 <= left <= right <= 2^31 - 1

# Examples with expected output

- `left=5, right=7` → `4`
- `left=0, right=0` → `0`
- `left=1, right=2147483647` → `0`

# Clarifying assumptions

Inputs follow the frozen problem guarantee. C# `int` is 32-bit signed; the solutions that manipulate raw patterns cast to `uint` and cast back unchecked when needed. This makes the intended two’s-complement word operation explicit.

# Progressive hints

1. Identify the invariant each bit represents: parity, membership, population, or shared prefix.
2. State exactly how every bit or mask contributes to the answer.
3. Use the fixed 32-bit width and handle the sign bit without losing its bit pattern.
4. Check the stated multiplicity/range guarantee; bit tricks depend on it.

# Complete C# solution

```csharp dsa-solution
using System;

public static class BitwiseAndRangeSolution
{
    public static int RangeBitwiseAnd(int left, int right)
    {
        uint low = (uint)left;
        uint high = (uint)right;
        int shifts = 0;

        while (low != high)
        {
            low >>= 1;
            high >>= 1;
            shifts++;
        }

        return (int)(low << shifts);
    }

    public static void Main()
    {
        if (RangeBitwiseAnd(5, 7) != 4 ||
            RangeBitwiseAnd(0, 0) != 0 ||
            RangeBitwiseAnd(1, int.MaxValue) != 0 ||
            RangeBitwiseAnd(8, 15) != 8)
        {
            throw new InvalidOperationException("Range AND check failed.");
        }
    }
}
```

# Correctness argument

As consecutive integers cross a binary boundary, at least one bit in their differing suffix is zero for some value in the interval; AND therefore clears every position below their common prefix. Bits above the common prefix are identical in all values and survive. Right-shifting both endpoints until equal identifies that prefix; shifting it back restores exactly the surviving bits.

# Step-by-step dry run

For [5,7], binary endpoints are 0101 and 0111. Shift once: 010 and 011; shift again: 01 and 01. The shared prefix 01 shifted left twice is 0100₂ = 4.

# Time complexity

O(w), where w=32 is the word width.

# Space complexity

O(1) auxiliary space.

# Edge-case tests

Single-element range; ranges sharing all but a low suffix; crossing a power-of-two boundary; [0,int.MaxValue]; endpoints equal and maximum.

# Reflection questions

1. Which exact assumption makes the central bit identity valid?
2. Does a negative `int` mean a negative mathematical value here, or a 32-bit pattern?
3. Which constraints ensure the mask/shift or enumeration count fits?
4. Can a shorter code path preserve the same invariant more clearly?

**Answers:** The problem-specific proof names the required multiplicity/range assumption. Interpret negatives according to the stated problem and the code’s uint conversion. Validate every index and width boundary before shifting. Prefer the form whose invariant is easiest to verify.

# Sources

- [Assigned problem](https://leetcode.com/problems/bitwise-and-numbers-range/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
