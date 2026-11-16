# sequence and string dynamic programming — Problem: Longest Increasing Subsequence

Source: [Longest Increasing Subsequence](https://leetcode.com/problems/longest-increasing-subsequence/).

## Goals

Compare endpoint DP with the `O(n log n)` tails optimization, implement lower bound for strict increase, and handle duplicates.

## Problem statement

Given an integer array `nums`, return the length of its longest strictly increasing subsequence. Chosen elements preserve index order and may skip positions.

## Input constraints

- `1 <= nums.length <= 2500`.
- `-10000 <= nums[i] <= 10000`.
- The problem includes an `O(n log n)` follow-up.

## Examples with expected output

- `[10,9,2,5,3,7,101,18]` → `4`.
- `[0,1,0,3,2,3]` → `4`.
- `[7,7,7,7,7,7,7]` → `1`.

## Clarifying assumptions

“Increasing” means strictly increasing, so equal adjacent values cannot extend a subsequence. Return the length; the chosen sequence is not required.

## Progressive hints

1. Maintain tails in increasing order, one for each achievable subsequence length.
2. For each value, find the first tail greater than or equal to it.
3. Replace that tail, or append if the value exceeds all tails.
4. The number of tails is the answer; the tails array itself is not necessarily an actual LIS.

## Complete C# solution

```csharp dsa-solution
using System;

static int LengthOfLis(int[] nums)
{
    int[] tails = new int[nums.Length];
    int length = 0;
    foreach (int value in nums)
    {
        int left = 0, right = length;
        while (left < right)
        {
            int middle = left + (right - left) / 2;
            if (tails[middle] < value) left = middle + 1;
            else right = middle;
        }
        tails[left] = value;
        if (left == length) length++;
    }
    return length;
}

static int QuadraticReference(int[] nums)
{
    if (nums.Length == 0) return 0;
    int[] dp = new int[nums.Length];
    Array.Fill(dp, 1);
    int best = 1;
    for (int i = 0; i < nums.Length; i++)
    {
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = Math.Max(dp[i], dp[j] + 1);
        best = Math.Max(best, dp[i]);
    }
    return best;
}

static void Check(int expected, int actual)
{
    if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
}

Check(4, LengthOfLis(new[] { 10, 9, 2, 5, 3, 7, 101, 18 }));
Check(4, LengthOfLis(new[] { 0, 1, 0, 3, 2, 3 }));
Check(1, LengthOfLis(new[] { 7, 7, 7, 7, 7, 7, 7 }));
Check(0, LengthOfLis(Array.Empty<int>()));
Check(3, LengthOfLis(new[] { 1, 2, 3 }));
Check(1, LengthOfLis(new[] { 5, 4, 3, 2, 1 }));
Check(LengthOfLis(new[] { 3, 1, 2, 5, 4 }), QuadraticReference(new[] { 3, 1, 2, 5, 4 }));
```

## Correctness argument

After processing each value, `tails[k]` is the smallest possible final value of a strictly increasing subsequence of length `k+1` among processed elements. A smaller tail is at least as useful for future extension as a larger tail of the same length. Binary search finds the first length whose minimum tail is not smaller than the current value, so replacing it preserves that invariant while allowing the value to extend all shorter tails. If no such length exists, the value extends the longest known subsequence. Therefore the number of represented lengths is the LIS length. The `< value` search condition implements strict increase by replacing equal tails rather than extending them.

## Step-by-step dry run

For `[3,1,2,5]`: `3` creates `[3]`; `1` replaces it with `[1]`; `2` appends to make `[1,2]`; `5` appends to make `[1,2,5]`. The length is 3. The temporary values summarize minimal tails; replacing `3` with `1` did not mean the final sequence must preserve every earlier tail choice.

## Time complexity

`O(n log n)`: each of `n` values uses binary search over at most `n` tails.

## Space complexity

`O(n)` for the tails array. Reconstructing an actual LIS requires tracking input indices and predecessor links.

## Edge-case tests

Assertions cover all official examples, empty generalized input, fully increasing/decreasing arrays, all-equal values, and a comparison with the quadratic recurrence on a short case.

## Reflection questions

- How would you adapt the binary-search condition for a nondecreasing subsequence?
- Why does `tails` not automatically equal the answer sequence?
- What predecessor information would allow reconstruction?
