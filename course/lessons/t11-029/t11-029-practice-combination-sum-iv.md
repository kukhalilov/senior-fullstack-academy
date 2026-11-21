# knapsack, subset-sum, and resource-allocation DP — Problem: Combination Sum IV

## Goals
- Count ordered sequences whose values sum to a target.
- Use target-outer loop order so the final chosen number decomposes each sequence once.
- Explain why this recurrence differs from unordered coin combinations.

## Problem statement

Given distinct positive integers `nums` and a target, return the number of ordered sequences (values may be reused) whose sum is target. Different orders count as different combinations. The answer fits a signed 32-bit integer.

## Input constraints
- `1 <= nums.Length <= 200`.
- `1 <= nums[i] <= 1000`; values are distinct.
- `1 <= target <= 1000`.

## Examples with expected output
- `nums=[1,2,3], target=4 -> 7`.
- `nums=[9], target=3 -> 0`.
- `nums=[1,2], target=3 -> 3` (`1+1+1`, `1+2`, `2+1`).

## Clarifying assumptions

All values are positive, so every sequence has finite length and transitions go from smaller sums to larger sums. Repetition is unlimited. Unlike Coin Change II, order matters. The problem's follow-up about negative values changes the termination/counting model: repeated negative/positive cycles can create infinitely many sequences unless additional limits are imposed.

## Progressive hints
1. Let `dp[s]` count sequences totaling s; the empty sequence gives `dp[0]=1`.
2. Consider the final value of a sequence totaling s: it can be any `num` not exceeding s.
3. Iterate sums outward and try every number inside; this counts different prefixes/orderings separately.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Numerics;

static class Program
{
    static int CombinationSum4(int[] nums, int target)
    {
        var dp = new BigInteger[target + 1];
        dp[0] = BigInteger.One;
        for (int sum = 1; sum <= target; sum++)
            foreach (int value in nums)
                if (value <= sum)
                    dp[sum] += dp[sum - value];
        return checked((int)dp[target]);
    }

    static void Check(int expected, int[] nums, int target)
    {
        int actual = CombinationSum4(nums, target);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(7, new[] { 1, 2, 3 }, 4);
        Check(0, new[] { 9 }, 3);
        Check(3, new[] { 1, 2 }, 3);
        Check(1, new[] { 2 }, 2);
        Check(0, new[] { 2, 4 }, 3);
        Check(0, new[] { 2, 4 }, 999);
        Console.WriteLine("Combination Sum IV checks passed.");
    }
}
```

## Correctness argument

`dp[0]=1` represents the empty sequence. For any positive sum s, every valid ordered sequence has exactly one final value v from `nums` with `v<=s`; removing it leaves a valid ordered sequence summing to `s-v`. Conversely, appending v to any sequence counted by `dp[s-v]` creates one valid sequence summing to s. Different final values or different prefixes produce distinct ordered sequences, so summing those counts counts each sequence exactly once. Since all values are positive, every predecessor sum is smaller and already computed.

## Step-by-step dry run

For nums `[1,2,3]` and target 4: `dp[0]=1`; `dp[1]=1`; `dp[2]=2` (`1+1`, `2`); `dp[3]=4` (`1+1+1`, `1+2`, `2+1`, `3`); and `dp[4]=7` by appending 1, 2, or 3 to the sequences for sums 3, 2, and 1.

## Time complexity

`O(N*T)` DP transitions for N numbers and target T; arbitrary-precision addition also depends on the bit length of intermediate counts.

## Space complexity

`O(T)` arbitrary-precision count entries. BigInteger prevents intermediate overflow for unreachable sums even though the requested target answer is guaranteed to fit `int`.

## Edge-case tests
- Both official examples are asserted.
- Permutations are counted separately.
- An unreachable target returns zero.
- A single exact-value number yields one sequence.
- Checked addition makes an unexpected overflow visible; valid test answers fit 32-bit as guaranteed.

## Reflection questions
1. Why is target the outer loop here but coin types are outer in Coin Change II?
2. What does `dp[s-value]` represent when appending the final value?
3. Why can negative values make the count infinite without an additional restriction?

Source: [LeetCode: Combination Sum IV](https://leetcode.com/problems/combination-sum-iv/).
