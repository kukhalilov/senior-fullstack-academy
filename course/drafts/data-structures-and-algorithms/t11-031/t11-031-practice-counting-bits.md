# bitwise operations, masks, and subset enumeration — Problem: Counting Bits

# Goals

- Derive the recurrence from the number with its lowest set bit removed.
- Initialize the count for zero and fill answers in dependency order.
- Return exactly one count for each integer in the inclusive range [0,n].
# Problem statement

Return set-bit counts for every integer from zero through n, without a built-in popcount.

# Input constraints

- 0 <= n <= 100000
- Follow-up asks for O(n) time

# Examples with expected output

- `n=2` → `[0,1,1]`
- `n=5` → `[0,1,1,2,1,2]`

# Clarifying assumptions

The input is an integer from zero through 100000. Each count fits an `int`, and the output array has one slot for each inclusive value.

# Progressive hints

1. Relate an integer to the value obtained by clearing its lowest set bit.
2. What is the base count for zero?
3. How many output entries are required for input n?
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
1. Prove the recurrence from the one-fewer-set-bit identity.
2. Why is the total work O(n), not O(n log n)?
3. Which allocation size is required when n is zero?

**Answers:** 1. Clearing the lowest set bit removes exactly one 1, so the smaller value count plus one is the current count. 2. There are n iterations after initializing the base; each recurrence step does constant work. 3. Allocate n+1 entries so index zero through index n are represented, including when n is zero.

# Sources

- [Assigned problem](https://leetcode.com/problems/counting-bits/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators); [.NET `BitOperations`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
