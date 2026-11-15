# sequence and string dynamic programming — Problem: Longest Increasing Subsequence

## Goals

Solve strict LIS with endpoint DP, understand the `O(n log n)` tails summary, and avoid claiming its tails array is the actual subsequence.

## Problem statement

Given an integer array `nums`, return the length of its longest strictly increasing subsequence. [Official problem statement](https://leetcode.com/problems/longest-increasing-subsequence/)

## Input constraints

- `1 <= nums.Length <= 2500`.
- `-10^4 <= nums[i] <= 10^4`.
- Strict increase is required; the problem includes an `O(n log n)` follow-up.

## Examples with expected output

1. `[10,9,2,5,3,7,101,18]` → `4`.
2. `[0,1,0,3,2,3]` → `4`.
3. `[7,7,7,7,7,7,7]` → `1`.
4. `[1,3,2,4]` → `3`.

## Clarifying assumptions

The answer is a length, not a required sequence. Equal values cannot extend a strictly increasing subsequence.

## Progressive hints

1. Define a best length that must end at each index.
2. Extend from earlier `j` only when `nums[j] < nums[i]`.
3. For faster time, maintain the smallest ending value per length and replace the first tail `>= x`.

## Complete C# solution

The tails invariant is: for each length, keep its smallest achievable ending value among processed elements. A smaller tail is at least as easy to extend. Replacements need not form one actual subsequence.

```csharp dsa-solution
using System;
static int Lis(int[] nums)
{
    int[] tails = new int[nums.Length];
    int length = 0;
    foreach (int x in nums)
    {
        int lo = 0, hi = length;
        while (lo < hi)
        {
            int mid = lo + (hi - lo) / 2;
            if (tails[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = x;
        if (lo == length) length++;
    }
    return length;
}
static int LisQuadratic(int[] a)
{
    int[] dp = new int[a.Length];
    int best = 1;
    for (int i = 0; i < a.Length; i++)
    {
        dp[i] = 1;
        for (int j = 0; j < i; j++) if (a[j] < a[i]) dp[i] = Math.Max(dp[i], dp[j] + 1);
        best = Math.Max(best, dp[i]);
    }
    return best;
}
static void Check(int x, int y, string label)
{
    if (x != y) throw new InvalidOperationException($"{label}: expected {y}, got {x}");
}
int[][] cases = { new[] {10,9,2,5,3,7,101,18}, new[] {0,1,0,3,2,3}, new[] {7,7,7,7,7,7,7}, new[] {1,3,2,4}, new[] {-2}, new[] {1,2,3,4} };
int[] expected = {4,4,1,3,1,4};
for (int i = 0; i < cases.Length; i++) { Check(Lis(cases[i]), expected[i], "tails " + i); Check(LisQuadratic(cases[i]), expected[i], "quadratic " + i); }
Console.WriteLine("All LIS checks passed.");
```

## Correctness argument

In endpoint DP, a subsequence ending at `i` either contains only `nums[i]` or extends a compatible earlier endpoint; maximizing gives the best state, and maximizing endpoints gives the answer. For tails, after each prefix, `tails[k]` is the smallest possible tail for length `k+1`. A value `x` replaces the first tail `>=x`, improving that length, or extends all lengths if larger than every tail. Thus the length grows exactly when a longer increasing subsequence becomes possible. Lower bound prevents equal values from extending.

## Step-by-step dry run

For `[1,3,2,4]`, tails evolve `[1]`, `[1,3]`, `[1,2]`, `[1,2,4]`. Replacing 3 with 2 preserves length two and improves its ending value, allowing later extension.

## Time complexity

Tails: `O(n log n)`. Endpoint DP: `O(n²)`.

## Space complexity

Each method uses `O(n)` integers.

## Edge-case tests

All official examples plus a singleton and fully increasing values are checked against both methods; duplicates confirm strictness.

## Reflection questions

1. Why does strict LIS use lower bound rather than upper bound?
2. What predecessor data would reconstruct an actual LIS?
3. What changes for a non-decreasing subsequence?
