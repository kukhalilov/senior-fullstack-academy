# bitwise operations, masks, and subset enumeration — Problem: Single Number

# Goals

- Use XOR to isolate the singleton when every other value appears twice.
- Prove the cancellation independently of input order and signed value.
- State the multiplicity condition that makes this solution valid.
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

Inputs follow the frozen problem guarantee. XOR on C# `int` values preserves and combines their bit patterns directly; this solution does not need a uint conversion.

# Progressive hints

1. What does XOR do when the same value is processed twice?
2. Which multiplicity guarantee lets all non-singleton values cancel?
3. Does the proof depend on values being nonnegative?
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
1. Why is XOR associative and commutative useful when input order is arbitrary?
2. Give a multiplicity pattern where the algorithm is not guaranteed to return the unique value.
3. Why does the negative-value test still work for signed integers?

**Answers:** 1. Associativity and commutativity permit regrouping the fold into equal-value pairs and the singleton, regardless of order. 2. For instance, if another value occurs three times rather than twice, the XOR fold includes that value instead of canceling it. 3. A negative value has one fixed int bit pattern, and XORing that identical pattern twice still yields zero.

# Sources

- [Assigned problem](https://leetcode.com/problems/single-number/)
- [Bitwise reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [C# bitwise and shift operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators); [.NET `BitOperations`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
