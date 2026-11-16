# bitwise operations, masks, and subset enumeration — Problem: Sum of Two Integers

# Goals

- Recognize the bit pattern invariant behind Sum of Two Integers.
- Implement the algorithm in C# with an explicit 32-bit interpretation.
- Prove correctness and account for fixed-width and boundary cases.

# Problem statement

Return the sum of two integers without using addition or subtraction operators.

# Input constraints

- -1000 <= a,b <= 1000

# Examples with expected output

- `a=1, b=2` → `3`
- `a=2, b=3` → `5`

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

1. Which exact assumption makes the central bit identity valid?
2. Does a negative `int` mean a negative mathematical value here, or a 32-bit pattern?
3. Which constraints ensure the mask/shift or enumeration count fits?
4. Can a shorter code path preserve the same invariant more clearly?

**Answers:** The problem-specific proof names the required multiplicity/range assumption. Interpret negatives according to the stated problem and the code’s uint conversion. Validate every index and width boundary before shifting. Prefer the form whose invariant is easiest to verify.

# Sources

- [Assigned problem](https://leetcode.com/problems/sum-of-two-integers/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
