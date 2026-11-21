# bitwise operations, masks, and subset enumeration — Problem: Reverse Bits

# Goals

- Reverse a fixed 32-bit word, not just the significant prefix.
- Extract one low bit and append it to the accumulated result on every iteration.
- Use an unsigned working value so right shifts fill with zero.
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

The online judge supplies a nonnegative signed 32-bit integer but asks to reverse all 32 positions. The unchecked `int` return preserves the resulting bit pattern even if the reversed sign bit is set.

# Progressive hints

1. How many iterations are required even when leading input bits are zero?
2. After one step, where should the next extracted low bit go in the result?
3. Why should the working representation be unsigned?
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
1. State an invariant relating consumed input bits and populated output bits.
2. What does reversing a word do to its leading zeroes?
3. Why is a loop over only significant bits incorrect for fixed-width reversal?

**Answers:** 1. Before iteration t, the result contains the reversal of the t input bits already consumed. 2. Leading zeroes move to trailing positions; all 32 positions must be processed. 3. It would skip the zero bits that must be appended after the significant input bits.

# Sources

- [Assigned problem](https://leetcode.com/problems/reverse-bits/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators); [.NET `BitOperations`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
