# bitwise operations, masks, and subset enumeration — Problem: Counting Bits

# Goals

- Recognize the bit pattern invariant behind Counting Bits.
- Implement the algorithm in C# with an explicit 32-bit interpretation.
- Prove correctness and account for fixed-width and boundary cases.

# Problem statement

Return set-bit counts for every integer from zero through n, without a built-in popcount.

# Input constraints

- 0 <= n <= 100000
- Follow-up asks for O(n) time

# Examples with expected output

- `n=2` → `[0,1,1]`
- `n=5` → `[0,1,1,2,1,2]`

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

public static class CountingBitsSolution
{
    public static int[] CountBits(int n)
    {
        var counts = new int[n + 1];

        for (int value = 1; value <= n; value++)
        {
            counts[value] = counts[value & (value - 1)] + 1;
        }

        return counts;
    }

    public static void Main()
    {
        if (string.Join(",", CountBits(2)) != "0,1,1" ||
            string.Join(",", CountBits(5)) != "0,1,1,2,1,2" ||
            string.Join(",", CountBits(0)) != "0")
        {
            throw new InvalidOperationException("Counting Bits check failed.");
        }
    }
}
```

# Correctness argument

The base value 0 has no set bits. For any positive value i, `i & (i-1)` is a smaller nonnegative integer with exactly one fewer set bit. By induction, its stored count is correct, and adding one yields the count for i.

# Step-by-step dry run

For n=5: counts[0]=0; 1→0+1=1; 2→0+1=1; 3→2+1=2; 4→0+1=1; 5→4+1=2.

# Time complexity

O(n), one constant-time recurrence per value.

# Space complexity

O(n) for the required result array.

# Edge-case tests

n=0, n=1, powers of two, one below and above a power of two, and n=100000. The loop intentionally avoids built-in popcount.

# Reflection questions

1. Which exact assumption makes the central bit identity valid?
2. Does a negative `int` mean a negative mathematical value here, or a 32-bit pattern?
3. Which constraints ensure the mask/shift or enumeration count fits?
4. Can a shorter code path preserve the same invariant more clearly?

**Answers:** The problem-specific proof names the required multiplicity/range assumption. Interpret negatives according to the stated problem and the code’s uint conversion. Validate every index and width boundary before shifting. Prefer the form whose invariant is easiest to verify.

# Sources

- [Assigned problem](https://leetcode.com/problems/counting-bits/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
