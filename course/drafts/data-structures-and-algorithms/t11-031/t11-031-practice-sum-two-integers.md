# bitwise operations, masks, and subset enumeration — Problem: Sum of Two Integers

# Goals

- Separate the no-carry sum bits from the carry bits.
- Shift each generated carry to the next more significant position and repeat.
- Explain the chosen fixed-width overflow behavior separately from the official input bounds.
# Problem statement

Return the sum of two integers without using addition or subtraction operators.

# Input constraints

- -1000 <= a,b <= 1000

# Examples with expected output

- `a=1, b=2` → `3`
- `a=2, b=3` → `5`

# Clarifying assumptions

The official bounds keep the mathematical result in range. The extra boundary test deliberately exercises a separate unchecked 32-bit wraparound behavior using `uint` intermediates.

# Progressive hints

1. What result does XOR produce before accounting for carries?
2. At which positions are carries generated?
3. Why must the carry shift be treated as a fixed-width operation?
# Complete C# solution

```csharp dsa-solution
using System;

public static class SumTwoIntegersSolution
{
    public static int GetSum(int a, int b)
    {
        uint x = unchecked((uint)a);
        uint y = unchecked((uint)b);

        while (y != 0)
        {
            uint carry = (x & y) << 1;
            x ^= y;
            y = carry;
        }

        return unchecked((int)x);
    }

    public static void Main()
    {
        if (GetSum(1, 2) != 3 || GetSum(2, 3) != 5 ||
            GetSum(-4, 1) != -3 ||
            GetSum(int.MaxValue, 1) != int.MinValue)
        {
            throw new InvalidOperationException("Sum Two Integers check failed.");
        }
    }
}
```

# Correctness argument

At each bit, XOR gives the addition result assuming no carry-in. A carry is generated exactly where both current bits are 1, represented by `x & y`, and affects the next more significant bit, represented by shifting left. Thus each loop replaces the pair by an equivalent partial sum and pending carry. Carry propagation terminates within the fixed 32-bit word; the final uint-to-int unchecked cast gives the two’s-complement 32-bit result. Official input bounds avoid mathematical overflow; the extra boundary test demonstrates modulo-2^32 behavior.

# Step-by-step dry run

For 1+2: x=`0001`, y=`0010`; carry=`0000`, xor=`0011`; y=0, return 3. For 3+1: carry=`0010`, xor=`0010`; next carry=`0100`, xor=`0000`; next carry=`0000`, xor=`0110`, return 4.

# Time complexity

O(32) worst case for a fixed-width word; each round propagates at least one carry toward higher positions.

# Space complexity

O(1) auxiliary space.

# Edge-case tests

Both official examples; positive plus negative; zero operand; a carry across several adjacent ones; int.MaxValue+1 outside official bounds to confirm explicitly chosen unchecked wraparound.

# Reflection questions
1. Show why XOR plus shifted AND carry preserves the sum modulo 2^32.
2. What condition ends the iteration?
3. How does the problem’s input range differ from the additional overflow test?

**Answers:** 1. XOR computes each sum bit when carry-in is zero; shifted AND records carry bits. Repeating preserves the sum modulo 2^32. 2. The loop ends when the carry word is zero. 3. Official operands are between -1000 and 1000; the int.MaxValue plus one test is an extra unchecked-wrap test outside that contract.

# Sources

- [Assigned problem](https://leetcode.com/problems/sum-of-two-integers/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators); [.NET `BitOperations`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
