# bitwise operations, masks, and subset enumeration — Problem: Reverse Bits

# Goals

- Recognize the bit pattern invariant behind Reverse Bits.
- Implement the algorithm in C# with an explicit 32-bit interpretation.
- Prove correctness and account for fixed-width and boundary cases.

# Problem statement

Reverse all 32 bit positions of the input value.

# Input constraints

- 0 <= n <= 2^31 - 2
- n is even
- Operate on exactly 32 bits

# Examples with expected output

- `n=43261596` → `964176192`
- `n=2147483644` → `1073741822`

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

public static class ReverseBitsSolution
{
    public static int ReverseBits(int n)
    {
        uint remaining = unchecked((uint)n);
        uint reversed = 0;

        for (int bit = 0; bit < 32; bit++)
        {
            reversed = (reversed << 1) | (remaining & 1u);
            remaining >>= 1;
        }

        return unchecked((int)reversed);
    }

    public static void Main()
    {
        if (ReverseBits(43261596) != 964176192 ||
            ReverseBits(2147483644) != 1073741822 ||
            ReverseBits(0) != 0 ||
            ReverseBits(unchecked((int)0x80000000u)) != 1)
        {
            throw new InvalidOperationException("Reverse Bits check failed.");
        }
    }
}
```

# Correctness argument

Before iteration t, `reversed` contains the reverse of the t low input bits in its t low positions, and `remaining` has shifted right t times. Appending the next low bit maintains this invariant. After 32 iterations every original bit has been consumed and occupies its mirrored position. The final unchecked cast preserves the 32-bit pattern in the required int return type.

# Step-by-step dry run

For a small illustration, process low bits `1,0,1`: output evolves `0→1→2→5` (binary `1→10→101`). The real algorithm continues with zeroes for all remaining positions until exactly 32 bits have been processed.

# Time complexity

O(32), hence O(1) for a fixed 32-bit input.

# Space complexity

O(1) auxiliary space.

# Edge-case tests

Official examples; zero; input with only bit 31 set (outside official nonnegative constraints) to verify unsigned handling; a pattern with leading zeroes to confirm they become trailing zeroes.

# Reflection questions

1. Which exact assumption makes the central bit identity valid?
2. Does a negative `int` mean a negative mathematical value here, or a 32-bit pattern?
3. Which constraints ensure the mask/shift or enumeration count fits?
4. Can a shorter code path preserve the same invariant more clearly?

**Answers:** The problem-specific proof names the required multiplicity/range assumption. Interpret negatives according to the stated problem and the code’s uint conversion. Validate every index and width boundary before shifting. Prefer the form whose invariant is easiest to verify.

# Sources

- [Assigned problem](https://leetcode.com/problems/reverse-bits/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
