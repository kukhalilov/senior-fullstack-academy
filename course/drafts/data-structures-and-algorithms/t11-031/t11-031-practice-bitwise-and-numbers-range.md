# bitwise operations, masks, and subset enumeration — Problem: Bitwise AND of Numbers Range

# Goals

- Find the common leading bit prefix of the inclusive endpoints.
- Remove differing suffix positions by shifting both endpoints together.
- Restore the shared prefix to its original bit positions.
# Problem statement

Return the bitwise AND of every integer in the inclusive range [left,right].

# Input constraints

- 0 <= left <= right <= 2^31 - 1

# Examples with expected output

- `left=5, right=7` → `4`
- `left=0, right=0` → `0`
- `left=1, right=2147483647` → `0`

# Clarifying assumptions

The endpoints are nonnegative and fit in signed 32-bit `int`. Casting to `uint` makes the right shifts logical; the shared-prefix result remains in the valid nonnegative range.

# Progressive hints

1. Which bit positions can remain 1 in every number from left through right?
2. What happens to the endpoints’ common prefix as they are shifted right together?
3. Why does the inclusive range crossing a power of two clear lower bits?
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
1. Prove every differing suffix position is zeroed by some value in the interval.
2. How many iterations can the endpoint-shifting loop perform?
3. Why is the unsigned working type compatible with the nonnegative constraints?

**Answers:** 1. Consider the highest bit where left and right differ. Every lower bit takes both 0 and 1 somewhere in the inclusive range, so AND clears the whole suffix. 2. At most 32 iterations, because each shift removes one bit from both endpoints. 3. The endpoints are nonnegative and fit in int; uint right shift fills with zero and preserves the same endpoint bit patterns.

# Sources

- [Assigned problem](https://leetcode.com/problems/bitwise-and-numbers-range/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators); [.NET `BitOperations`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
