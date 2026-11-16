# bitwise operations, masks, and subset enumeration — Problem: Single Number II

# Goals

- Recognize the bit pattern invariant behind Single Number II.
- Implement the algorithm in C# with an explicit 32-bit interpretation.
- Prove correctness and account for fixed-width and boundary cases.

# Problem statement

Find the one value appearing once when every other value appears exactly three times, in linear time and constant extra space.

# Input constraints

- 1 <= nums.length <= 30000
- -2^31 <= nums[i] <= 2^31-1
- One value occurs once; every other value occurs exactly three times

# Examples with expected output

- `nums=[2,2,3,2]` → `3`
- `nums=[0,1,0,1,0,1,99]` → `99`

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

public static class SingleNumberTwoSolution
{
    public static int SingleNumber(int[] nums)
    {
        uint answer = 0;

        for (int bit = 0; bit < 32; bit++)
        {
            int count = 0;
            uint mask = 1u << bit;

            foreach (int value in nums)
            {
                if ((unchecked((uint)value) & mask) != 0)
                {
                    count++;
                }
            }

            if (count % 3 != 0)
            {
                answer |= mask;
            }
        }

        return unchecked((int)answer);
    }

    public static void Main()
    {
        if (SingleNumber(new[] { 2, 2, 3, 2 }) != 3 ||
            SingleNumber(new[] { 0, 1, 0, 1, 0, 1, 99 }) != 99 ||
            SingleNumber(new[] { -2, 5, 5, 5 }) != -2)
        {
            throw new InvalidOperationException("Single Number II check failed.");
        }
    }
}
```

# Correctness argument

For a fixed bit position, each value appearing three times contributes either zero or three set bits, which is 0 modulo 3. The singleton contributes either zero or one. Therefore the count modulo three reconstructs exactly that value’s 32-bit pattern. Casting through uint preserves the sign bit; the unchecked cast back restores the signed int result.

# Step-by-step dry run

For [2,2,3,2], bit 1 is set in all four values, so count 4 mod 3 = 1 and the answer keeps bit 1. Bit 0 is set only in 3, so count 1 mod 3 = 1 and the answer keeps bit 0. Together these yield 3.

# Time complexity

O(32n), which is O(n) for fixed-width 32-bit integers.

# Space complexity

O(1) auxiliary space (32 counters are a constant).

# Edge-case tests

Official examples; singleton zero; negative singleton including sign bit; repeated negative values; permutations of the input. The exact multiplicity-three guarantee is essential.

# Reflection questions

1. Which exact assumption makes the central bit identity valid?
2. Does a negative `int` mean a negative mathematical value here, or a 32-bit pattern?
3. Which constraints ensure the mask/shift or enumeration count fits?
4. Can a shorter code path preserve the same invariant more clearly?

**Answers:** The problem-specific proof names the required multiplicity/range assumption. Interpret negatives according to the stated problem and the code’s uint conversion. Validate every index and width boundary before shifting. Prefer the form whose invariant is easiest to verify.

# Sources

- [Assigned problem](https://leetcode.com/problems/single-number-ii/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
