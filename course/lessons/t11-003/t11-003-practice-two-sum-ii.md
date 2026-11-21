<!-- MANUALLY AUTHORED: checked against frozen problem statement, examples, constraints, and source. -->

# two-pointer and sliding-window techniques — Problem: Two Sum II - Input Array Is Sorted

# Goals

- Use sorted order to eliminate a whole range of pair candidates at a time.
- Maintain the invariant that a valid pair remains between the two pointers.
- Return the required 1-based indices in increasing order.
- Compare the two-pointer solution with binary-search-per-index and hash-map approaches.

# Problem statement

Given a 1-indexed integer array numbers sorted in non-decreasing order, find two distinct elements whose sum is target. Return their 1-based indices as a length-two array [index1, index2], with index1 < index2. Exactly one solution exists. Use constant extra space.

# Input constraints

- 2 <= numbers.Length <= 30,000
- -1000 <= numbers[i] <= 1000
- numbers is sorted in non-decreasing order.
- -1000 <= target <= 1000
- Exactly one valid answer exists.
- The same element cannot be used twice.

# Examples with expected output

1. numbers = [2, 7, 11, 15], target = 9 → [1, 2]
2. numbers = [2, 3, 4], target = 6 → [1, 3]
3. numbers = [-1, 0], target = -1 → [1, 2]
4. numbers = [1, 1], target = 2 → [1, 2]. Equal values at distinct indices are valid.

# Clarifying assumptions

- The input indices in the required answer are 1-based; C# arrays use 0-based indices, so add one when returning.
- The input may contain duplicate values. The two chosen positions still must be different.
- Non-decreasing order allows equal adjacent values.
- The constraints keep the sum within int range, although using long for the intermediate sum is a safe general habit.
- The input must remain unchanged and auxiliary storage must be O(1).

# Progressive hints

1. Start with the smallest and largest remaining values. This pair spans the largest possible sum among the remaining candidates.
2. If their sum is too small, can any pair using the current smallest value work? The other value would be no larger than the current largest.
3. If the sum is too large, can any pair using the current largest value work? The other value would be no smaller than the current smallest.
4. Move only the endpoint whose value is proven impossible, and stop when the exact sum is found.

# Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int[] TwoSum(int[] numbers, int target)
    {
        if (numbers is null) throw new ArgumentNullException(nameof(numbers));
        if (numbers.Length < 2) throw new ArgumentException("At least two values are required.", nameof(numbers));

        int left = 0;
        int right = numbers.Length - 1;
        while (left < right)
        {
            long sum = (long)numbers[left] + numbers[right];
            if (sum == target)
                return new[] { left + 1, right + 1 };

            if (sum < target)
                left++;
            else
                right--;
        }

        throw new InvalidOperationException("The input must contain exactly one solution.");
    }

    private static void AssertPair(int[] actual, int first, int second, string label)
    {
        if (actual.Length != 2 || actual[0] != first || actual[1] != second)
            throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertPair(TwoSum(new[] { 2, 7, 11, 15 }, 9), 1, 2, "Example 1");
        AssertPair(TwoSum(new[] { 2, 3, 4 }, 6), 1, 3, "Example 2");
        AssertPair(TwoSum(new[] { -1, 0 }, -1), 1, 2, "Example 3");
        AssertPair(TwoSum(new[] { 1, 1 }, 2), 1, 2, "Duplicate values at distinct indices");
        Console.WriteLine("All Two Sum II checks passed.");
    }
}
```

# Correctness argument

At each step, the target pair, if not yet found, lies within [left, right]. Let sum = numbers[left] + numbers[right].

- If sum < target, then for any index j <= right, numbers[left] + numbers[j] <= sum < target because the array is sorted. Therefore left cannot be part of the answer and incrementing left is safe.
- If sum > target, then for any index i >= left, numbers[i] + numbers[right] >= sum > target. Therefore right cannot be part of the answer and decrementing right is safe.
- If sum equals target, the current distinct indices form the required pair. Since left < right and the array is sorted, left + 1 < right + 1.

Each unsuccessful step strictly shrinks the candidate interval while preserving the solution. The interval cannot become empty before the unique solution is found.

# Step-by-step dry run

For numbers = [2, 7, 11, 15], target = 9:

| left (value) | right (value) | sum | decision |
|---|---|---:|---|
| 0 (2) | 3 (15) | 17 | Too large; 15 cannot be used, decrement right |
| 0 (2) | 2 (11) | 13 | Too large; 11 cannot be used, decrement right |
| 0 (2) | 1 (7) | 9 | Found; return 1-based indices [1, 2] |

# Time complexity

O(n): each pointer moves inward at most n - 1 times in total.

# Space complexity

O(1) auxiliary space, excluding the fixed two-element returned array.

# Alternatives and tradeoffs

- Binary search for the complement of each element takes O(n log n) time and O(1) extra space. It is useful when the pair-search proof is not obvious, but repeats logarithmic searches.
- A hash map can find a pair in expected O(n) time, but uses O(n) extra memory and does not exploit the sorted input.
- Sorting an unsorted copy then applying two pointers costs O(n log n) time and extra storage for the copy; sorting the input would violate the requirement to preserve it.
- The opposing-pointer rule depends on non-decreasing order. Applying it to an unsorted array can discard the only valid pair.

# Common mistakes and gotchas

- Returning zero-based C# indices instead of the requested one-based indices.
- Moving both pointers after a non-matching sum; only one endpoint is proven impossible.
- Using left <= right can reuse one element. Require left < right.
- When sum is too small, decrementing right goes the wrong way; larger values are needed.
- When sum is too large, incrementing left goes the wrong way; smaller values are needed.
- Equal values are allowed, but their indices must be distinct.
- The method throws only for inputs outside the stated guarantee; the official input always has exactly one solution.

# Edge-case tests

- Two-element input, including negative numbers.
- Pair uses first and last positions.
- Duplicate values at distinct indices.
- Sum is too small at the left endpoint before advancing.
- Sum is too large at the right endpoint before retreating.

# Reflection questions

1. Which monotonicity fact justifies moving left when the sum is too small?
2. Why does the algorithm use the sorted property more directly than a hash map?
3. Why is left < right necessary even though exactly one solution is guaranteed?
4. How do the returned positions differ from the indices used internally in C#?

Sources: [LeetCode: Two Sum II - Input Array Is Sorted](https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/).
