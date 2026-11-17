# bitwise operations, masks, and subset enumeration — Problem: Single Number II

# Goals

- Count set bits independently at all 32 positions.
- Reduce each position’s count modulo three to remove triply occurring values.
- Reassemble the singleton’s complete signed 32-bit pattern.
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

Each input is a signed 32-bit integer. The implementation counts all 32 positions as unsigned patterns and reinterprets the reconstructed word as `int`.

# Progressive hints

1. For one bit position, what does counting set bits modulo three remove?
2. Why must the signed input be viewed as a 32-bit pattern?
3. How is the reconstructed sign bit converted back to int?
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
1. Prove the per-bit count modulo three isolates the singleton’s bit.
2. Why does the approach still work when the singleton is negative?
3. Give its time bound as a function of both input count and word width.

**Answers:** 1. At each position, every triply occurring value contributes zero or three set bits, both zero modulo three; only the singleton remainder remains. 2. The per-bit process reconstructs the singleton word including its sign bit, so negative values work too. 3. O(32n), which is O(n) for a fixed 32-bit word.

# Sources

- [Assigned problem](https://leetcode.com/problems/single-number-ii/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators); [.NET `BitOperations`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
