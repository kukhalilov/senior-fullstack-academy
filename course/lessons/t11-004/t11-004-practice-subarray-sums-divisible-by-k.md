# prefix sums, difference arrays, and static range queries — Problem: Subarray Sums Divisible by K

## Goals

- Turn divisibility of a subarray sum into equality of prefix remainders.
- Normalize negative remainders correctly in C#.
- Count every nonempty range, including those beginning at index zero.

## Problem statement

Given an integer array nums and a positive integer k, return the number of nonempty contiguous subarrays whose sum is divisible by k.

## Input constraints

- 1 <= nums.Length <= 30,000.
- -10,000 <= nums[i] <= 10,000.
- 2 <= k <= 10,000.
- Values may be negative.

## Examples with expected output

1. nums = [4,5,0,-2,-3,1], k = 5 -> 7.
2. nums = [5], k = 9 -> 0.
3. nums = [2,-2,2], k = 2 -> 6.
4. nums = [-1,2,9], k = 2 -> 2.

## Clarifying assumptions

- A subarray is nonempty and contiguous; repeated values at different index ranges count separately.
- k is positive. This is necessary for the stated normalization and follows from the constraints.
- C# remainder can be negative when the running sum is negative; normalize it to the range `[0,k)` before indexing.
- Count in long and check the final conversion; the stated maximum fits Int32, while the wider intermediate makes the bound explicit.

## Progressive hints

1. A subarray sum is the difference of two prefix sums.
2. That difference is divisible by k exactly when the two prefixes have the same remainder modulo k.
3. Count previous occurrences of the current normalized remainder. Seed remainder zero once for the empty prefix.
4. Do not normalize with `Math.Abs(remainder)`; negative and positive remainders are not mapped that way into a valid equivalence class.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int SubarraysDivByK(int[] nums, int k)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (k <= 0) throw new ArgumentOutOfRangeException(nameof(k));

        var frequency = new long[k];
        frequency[0] = 1;
        long prefix = 0;
        long count = 0;

        foreach (int value in nums)
        {
            prefix += value;
            int remainder = (int)(prefix % k);
            if (remainder < 0) remainder += k;

            count += frequency[remainder];
            frequency[remainder]++;
        }
        return checked((int)count);
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(SubarraysDivByK(new[] { 4, 5, 0, -2, -3, 1 }, 5), 7, "Example 1");
        AssertEqual(SubarraysDivByK(new[] { 5 }, 9), 0, "Example 2");
        AssertEqual(SubarraysDivByK(new[] { 2, -2, 2 }, 2), 6, "All sums divisible");
        AssertEqual(SubarraysDivByK(new[] { -1, 2, 9 }, 2), 2, "Negative prefix remainder");
        Console.WriteLine("All Subarray Sums Divisible by K checks passed.");
    }
}
```

## Correctness argument

Let P[j] and P[i] be prefix sums at two boundaries with i < j. The subarray between them has sum `P[j]-P[i]`. It is divisible by positive k exactly when `P[j]` and `P[i]` have equal remainders modulo k. At each current boundary, the frequency table contains all earlier boundaries grouped by their normalized remainder. Adding the matching frequency counts every divisible subarray ending here. Seeding remainder zero represents boundary zero and includes ranges starting at the first element. Inserting the current remainder after counting ensures only earlier boundaries are used, so no empty range is included. Every nonempty range has one ending boundary and is counted exactly once.

For negative sums, C# may produce a remainder in `(-k,0)`. Adding k once moves it into `[0,k)` because the remainder's magnitude is strictly less than k; this preserves its equivalence class modulo k.

## Step-by-step dry run

For nums `[4,5,0,-2,-3,1]`, k=5, begin with remainder 0 seen once. The normalized remainders after each element are `4,4,4,2,4,0`. Their prior frequencies contribute `0+1+2+0+3+1=7` ranges. The negative running total after `-2` is normalized before indexing.

## Time complexity

O(n), with direct frequency-array updates.

## Space complexity

O(k) for the remainder frequencies.

## Alternatives and tradeoffs

- A dictionary can store only remainders observed, useful if k is huge and n is small; expected time remains O(n), with O(min(n,k)) keys.
- Brute force enumerates O(n²) ranges and is useful for tiny-input cross-checking.
- The same-remainder relation is more robust than a sum-threshold sliding window because it handles negative values directly.

## Common mistakes and gotchas

- Using a negative C# remainder directly as an array index.
- Applying absolute value to a remainder; it does not implement modulo normalization.
- Forgetting to seed remainder zero, missing ranges from index zero.
- Counting only whether a remainder appeared rather than how many prior boundaries had it.
- Inserting current remainder before adding its frequency, which can count an empty range.
- Using k as an array size without checking that k is positive and within practical bounds.

## Edge-case tests

- Negative prefix values.
- k greater than any individual value.
- Every element is divisible by k, yielding n(n+1)/2 ranges.
- No prefix remainder repeats.
- A range beginning at index zero.

## Reflection questions

1. Why does equal remainder imply a divisible prefix difference?
2. Why is one addition of k sufficient after a negative remainder?
3. What does the initial `frequency[0]=1` represent?
4. Why do frequencies count ranges rather than distinct remainder values?

Source: [LeetCode: Subarray Sums Divisible by K](https://leetcode.com/problems/subarray-sums-divisible-by-k/).
