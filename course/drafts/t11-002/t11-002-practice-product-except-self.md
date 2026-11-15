<!-- MANUALLY AUTHORED: checked against frozen problem statement, examples, constraints, and source. -->

# arrays and dynamic arrays for algorithmic problem solving — Problem: Product of Array Except Self

# Goals

- Express “all elements except index i” as a left product times a right product.
- Build prefix products and fold suffix products into the required output.
- Respect the no-division rule, including when the input contains one or more zeroes.
- Explain why the output array is excluded from the auxiliary-space measure in this problem.

# Problem statement

Given an integer array nums, return an array answer where answer[i] is the product of every element of nums except nums[i]. The algorithm must run in O(n) time and must not use division.

# Input constraints

- 2 <= nums.Length <= 100,000
- -30 <= nums[i] <= 30
- Every prefix or suffix product of the input fits in a signed 32-bit integer.
- Every returned product fits in a signed 32-bit integer.
- The returned array has the same length as the input. The output array does not count as auxiliary space for the official constant-extra-space follow-up.

# Examples with expected output

1. nums = [1, 2, 3, 4] → [24, 12, 8, 6]
2. nums = [-1, 1, 0, -3, 3] → [0, 0, 9, 0, 0]
3. nums = [2, 0] → [0, 2]
4. nums = [0, 0, 5] → [0, 0, 0]

# Clarifying assumptions

- “Except self” excludes exactly the element at the current index, not all equal-valued elements.
- Input may contain zero, negative values, or repeated values.
- Division, including “total product divided by nums[i],” is forbidden. That division approach also fails around zero.
- The method returns a new array and does not mutate nums.

# Progressive hints

1. For index i, split the other elements into those strictly to its left and those strictly to its right.
2. answer[i] = product(nums[0..i)) * product(nums(i..n)). Treat an empty side as product 1, the multiplicative identity.
3. First store the left product in each output slot. Then scan right-to-left while maintaining one running suffix product and multiply it into each slot.
4. Update the suffix after using it at the current index. This prevents accidentally including nums[i] in its own answer.

# Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int[] ProductExceptSelf(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (nums.Length < 2) throw new ArgumentException("At least two values are required.", nameof(nums));

        var answer = new int[nums.Length];

        int prefix = 1;
        for (int i = 0; i < nums.Length; i++)
        {
            answer[i] = prefix;
            prefix *= nums[i];
        }

        int suffix = 1;
        for (int i = nums.Length - 1; i >= 0; i--)
        {
            answer[i] *= suffix;
            suffix *= nums[i];
        }

        return answer;
    }

    private static void AssertEqual(int[] actual, int[] expected, string label)
    {
        if (actual.Length != expected.Length)
            throw new InvalidOperationException(label + ": length mismatch.");
        for (int i = 0; i < actual.Length; i++)
            if (actual[i] != expected[i])
                throw new InvalidOperationException(label + ": mismatch at index " + i);
    }

    public static void Main()
    {
        AssertEqual(ProductExceptSelf(new[] { 1, 2, 3, 4 }), new[] { 24, 12, 8, 6 }, "Example 1");
        AssertEqual(ProductExceptSelf(new[] { -1, 1, 0, -3, 3 }), new[] { 0, 0, 9, 0, 0 }, "Example 2");
        AssertEqual(ProductExceptSelf(new[] { 2, 0 }), new[] { 0, 2 }, "Single zero");
        AssertEqual(ProductExceptSelf(new[] { 0, 0, 5 }), new[] { 0, 0, 0 }, "Two zeroes");
        AssertEqual(ProductExceptSelf(new[] { -2, 3 }), new[] { 3, -2 }, "Two values");
        Console.WriteLine("All Product Except Self checks passed.");
    }
}
```

# Correctness argument

After the forward pass, answer[i] equals the product of all input values at indices smaller than i: before writing slot i, prefix contains exactly that product. The value 1 correctly represents the empty prefix at index zero.

At the start of the reverse iteration for index i, suffix equals the product of all values at indices greater than i. Multiplying it into answer[i] combines the disjoint left and right parts, which are exactly all positions other than i. Then multiplying by nums[i] prepares the suffix for index i - 1. Thus every output slot has the required product. No division or special zero branch is needed.

# Step-by-step dry run

For [1, 2, 3, 4]:

1. Forward pass stores left products: [1, 1, 2, 6]. Afterward, prefix = 24.
2. Reverse at index 3: multiply by suffix 1, result [1, 1, 2, 6]; update suffix to 4.
3. Index 2: multiply by 4, result [1, 1, 8, 6]; update suffix to 12.
4. Index 1: multiply by 12, result [1, 12, 8, 6]; update suffix to 24.
5. Index 0: multiply by 24, result [24, 12, 8, 6].

# Time complexity

O(n): two linear passes.

# Space complexity

O(1) auxiliary space beyond the returned array: prefix and suffix are the only extra scalar state. The output array itself is required and is explicitly excluded by the problem’s follow-up convention.

# Alternatives and tradeoffs

- Separate prefix and suffix arrays are easy to inspect and still O(n) time, but require O(n) auxiliary storage in addition to the answer.
- Division by the total product is prohibited and requires delicate zero counting; it is not an acceptable shortcut here.
- The output-array method avoids extra prefix/suffix arrays while keeping the two-pass proof simple.

# Common mistakes and gotchas

- Use 1, not 0, for the initial prefix/suffix. The product of an empty side is the identity 1.
- Multiply the current output by the suffix before adding nums[i] to that suffix.
- Do not use division. The zero-containing example specifically demonstrates why zero handling matters.
- Products fit because the constraints guarantee each required prefix/suffix and answer product is signed 32-bit. If solving a variant without that guarantee, use a wider type and check its bounds.
- An answer may be zero for many indices. With multiple zeroes, every result is zero; with exactly one zero, only the zero’s own position can receive the product of all non-zero elements.

# Edge-case tests

- Exactly two input elements: each answer is the other value.
- One zero and no other zero: only that zero’s output position can be nonzero.
- Two or more zeroes: every answer is zero.
- Negative values: sign follows the product of all values outside the current index.
- The input is left unchanged.

# Reflection questions

1. Why does the empty prefix or suffix have product one?
2. Why can the reverse pass use a scalar rather than a suffix array?
3. What changes if answer itself counts as auxiliary space?
4. Which constraint makes int multiplication safe for the specified problem?

Sources: [LeetCode: Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/).
