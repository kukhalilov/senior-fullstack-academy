# bitwise operations, masks, and subset enumeration — Problem: Number of 1 Bits

# Goals

- Recognize the bit pattern invariant behind Number of 1 Bits.
- Implement the algorithm in C# with an explicit 32-bit interpretation.
- Prove correctness and account for fixed-width and boundary cases.

# Problem statement

Return the Hamming weight, the number of set bits, of a positive integer.

# Input constraints

- 1 <= n <= 2^31 - 1

# Examples with expected output

- `n=11` → `3`
- `n=128` → `1`
- `n=2147483645` → `30`

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

public static class HammingWeightSolution
{
    public static int HammingWeight(int n)
    {
        uint bits = unchecked((uint)n);
        int count = 0;

        while (bits != 0)
        {
            bits &= bits - 1;
            count++;
        }

        return count;
    }

    public static void Main()
    {
        if (HammingWeight(11) != 3 ||
            HammingWeight(128) != 1 ||
            HammingWeight(2147483645) != 30 ||
            HammingWeight(-1) != 32)
        {
            throw new InvalidOperationException("Hamming Weight check failed.");
        }
    }
}
```

# Correctness argument

For every nonzero unsigned bit pattern, `bits & (bits-1)` clears exactly its least significant 1 and preserves all other 1-bits. The loop ends at zero, so it increments once per set bit. Casting int to uint preserves the same 32-bit pattern; the negative test demonstrates the full-pattern interpretation outside the supplied positive-input constraints.

# Step-by-step dry run

For 11 (`1011₂`): clear low 1 → `1010`, count 1; clear low 1 → `1000`, count 2; clear low 1 → `0000`, count 3.

# Time complexity

O(k), where k is the number of set bits; worst case O(32) for a uint.

# Space complexity

O(1) auxiliary space.

# Edge-case tests

One set bit; alternating bits; maximum positive int; zero if supporting it; -1 as the all-ones 32-bit pattern. The official input constraints are positive.

# Reflection questions

1. Which exact assumption makes the central bit identity valid?
2. Does a negative `int` mean a negative mathematical value here, or a 32-bit pattern?
3. Which constraints ensure the mask/shift or enumeration count fits?
4. Can a shorter code path preserve the same invariant more clearly?

**Answers:** The problem-specific proof names the required multiplicity/range assumption. Interpret negatives according to the stated problem and the code’s uint conversion. Validate every index and width boundary before shifting. Prefer the form whose invariant is easiest to verify.

# Sources

- [Assigned problem](https://leetcode.com/problems/number-of-1-bits/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
