# bitwise operations, masks, and subset enumeration — Problem: Single Number

# Goals

- Recognize the bit pattern invariant behind Single Number.
- Implement the algorithm in C# with an explicit 32-bit interpretation.
- Prove correctness and account for fixed-width and boundary cases.

# Problem statement

Find the value that occurs once when every other value occurs twice, using linear time and constant extra space.

# Input constraints

- 1 <= nums.length <= 30000
- -30000 <= nums[i] <= 30000
- Every value occurs twice except one singleton

# Examples with expected output

- `nums=[2,2,1]` → `1`
- `nums=[4,1,2,1,2]` → `4`
- `nums=[1]` → `1`

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

public static class SingleNumberSolution
{
    public static int SingleNumber(int[] nums)
    {
        int answer = 0;
        foreach (int value in nums)
        {
            answer ^= value;
        }

        return answer;
    }

    public static void Main()
    {
        if (SingleNumber(new[] { 2, 2, 1 }) != 1 ||
            SingleNumber(new[] { 4, 1, 2, 1, 2 }) != 4 ||
            SingleNumber(new[] { 1 }) != 1 ||
            SingleNumber(new[] { -7, 5, 5 }) != -7)
        {
            throw new InvalidOperationException("Single Number check failed.");
        }
    }
}
```

# Correctness argument

XOR is associative/commutative, x XOR x is zero, and x XOR zero is x. Reordering the fold into pairs plus the singleton leaves exactly the singleton. The result depends on every other value occurring an even number of times; the problem’s pair guarantee is sufficient.

# Step-by-step dry run

For [4,1,2,1,2], start at 0: 0^4=4, 4^1=5, 5^2=7, 7^1=6, 6^2=4. Each 1 and 2 pair cancels.

# Time complexity

O(n), one XOR per value.

# Space complexity

O(1) auxiliary space.

# Edge-case tests

Use one element; singleton at either end; negative singleton; duplicate pairs in different orders. A triple-occurrence variant is not covered by this proof.

# Reflection questions

1. Which exact assumption makes the central bit identity valid?
2. Does a negative `int` mean a negative mathematical value here, or a 32-bit pattern?
3. Which constraints ensure the mask/shift or enumeration count fits?
4. Can a shorter code path preserve the same invariant more clearly?

**Answers:** The problem-specific proof names the required multiplicity/range assumption. Interpret negatives according to the stated problem and the code’s uint conversion. Validate every index and width boundary before shifting. Prefer the form whose invariant is easiest to verify.

# Sources

- [Assigned problem](https://leetcode.com/problems/single-number/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
