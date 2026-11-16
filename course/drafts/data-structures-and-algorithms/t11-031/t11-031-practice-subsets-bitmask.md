# bitwise operations, masks, and subset enumeration — Problem: Subsets

# Goals

- Recognize the bit pattern invariant behind Subsets.
- Implement the algorithm in C# with an explicit 32-bit interpretation.
- Prove correctness and account for fixed-width and boundary cases.

# Problem statement

Return all subsets of unique input values, including the empty subset, in any order.

# Input constraints

- 1 <= nums.length <= 10
- -10 <= nums[i] <= 10
- All values are unique

# Examples with expected output

- `nums=[1,2,3]` → `all eight subsets`
- `nums=[0]` → `[], [0]`

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
using System.Collections.Generic;

public static class SubsetsBitmaskSolution
{
    public static IList<IList<int>> Subsets(int[] nums)
    {
        int subsetCount = 1 << nums.Length;
        var result = new List<IList<int>>(subsetCount);

        for (int mask = 0; mask < subsetCount; mask++)
        {
            var subset = new List<int>();

            for (int index = 0; index < nums.Length; index++)
            {
                if ((mask & (1 << index)) != 0)
                {
                    subset.Add(nums[index]);
                }
            }

            result.Add(subset);
        }

        return result;
    }

    public static void Main()
    {
        IList<IList<int>> result = Subsets(new[] { 1, 2, 3 });
        if (result.Count != 8 || result[0].Count != 0 ||
            Subsets(new[] { 0 }).Count != 2 || Subsets(new[] { 0 })[0].Count != 0)
        {
            throw new InvalidOperationException("Subsets check failed.");
        }
    }
}
```

# Correctness argument

Every subset uniquely determines one bit per input position: 1 means included and 0 means excluded. The range `[0,2^n)` contains every n-bit pattern exactly once, and the inner loop includes exactly the positions marked 1. Therefore each possible subset is emitted once, including mask zero for the empty subset.

# Step-by-step dry run

For nums=[1,2,3]: mask 000 emits []; 001 emits [1]; 010 emits [2]; 011 emits [1,2]; continuing through 111 emits [1,2,3]. Eight masks produce all 2^3 subsets.

# Time complexity

O(n·2^n): there are 2^n masks and each scans n positions. Constructing output itself is exponential.

# Space complexity

O(n·2^n) for all emitted element references in the worst case, plus per-subset list overhead. Auxiliary working space excluding output is O(n).

# Edge-case tests

n=1; n=10 maximum constraint gives 1024 subsets; empty subset included; zero is treated as a value, not as an empty marker; unique values assumed by the prompt.

# Reflection questions

1. Which exact assumption makes the central bit identity valid?
2. Does a negative `int` mean a negative mathematical value here, or a 32-bit pattern?
3. Which constraints ensure the mask/shift or enumeration count fits?
4. Can a shorter code path preserve the same invariant more clearly?

**Answers:** The problem-specific proof names the required multiplicity/range assumption. Interpret negatives according to the stated problem and the code’s uint conversion. Validate every index and width boundary before shifting. Prefer the form whose invariant is easiest to verify.

# Sources

- [Assigned problem](https://leetcode.com/problems/subsets/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
