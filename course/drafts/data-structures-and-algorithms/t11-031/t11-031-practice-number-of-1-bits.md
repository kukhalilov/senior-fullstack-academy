# bitwise operations, masks, and subset enumeration — Problem: Number of 1 Bits

# Goals

- Count the set bits of the input word, including its leading zero positions conceptually.
- Compare a fixed-width scan with clearing one low set bit per iteration.
- Preserve the 32-bit pattern when working with signed C# values.
# Problem statement

Return the Hamming weight, the number of set bits, of a positive integer.

# Input constraints

- 1 <= n <= 2^31 - 1

# Examples with expected output

- `n=11` → `3`
- `n=128` → `1`
- `n=2147483645` → `30`

# Clarifying assumptions

The platform input is a positive signed 32-bit integer. The solution converts to `uint` so the same loop also has a clear full-32-bit-pattern interpretation for defensive tests such as -1.

# Progressive hints

1. Does the task count the numeric magnitude or the set bits of the given word?
2. Compare scanning all 32 positions with repeatedly clearing the lowest set bit.
3. Which unsigned conversion preserves a negative int’s raw 32-bit pattern?
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
1. How many iterations can the clearing loop perform for a 32-bit word?
2. Why can arithmetic right-shifting a negative signed value fail to terminate?
3. When would a built-in population-count API be preferable?

**Answers:** 1. At most 32 iterations, with exactly one iteration for each set bit. 2. Arithmetic right shift keeps inserting ones for negative values, so it may never reach zero. 3. When built-ins are allowed, BitOperations.PopCount directly expresses the operation; compare real workloads before assuming a speedup.

# Sources

- [Assigned problem](https://leetcode.com/problems/number-of-1-bits/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators); [.NET `BitOperations`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
