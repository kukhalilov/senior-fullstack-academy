# hash maps and frequency tables — Problem: Subarray Sum Equals K

## Goals
- Count contiguous ranges using prefix-sum differences.
- Store prefix multiplicities rather than only whether a sum has appeared.
- Explain why a sliding window is invalid when values may be negative.

## Problem statement
Given an integer array and integer `k`, return the number of nonempty contiguous subarrays whose sum equals `k`.

## Input constraints
- `1 <= nums.Length <= 20,000`.
- `-1,000 <= nums[i] <= 1,000`.
- `-10,000,000 <= k <= 10,000,000`.

## Examples with expected output
- `[1,1,1]`, `k=2` -> `2`.
- `[1,2,3]`, `k=3` -> `2`.
- `[1,-1,0]`, `k=0` -> `3`.

## Clarifying assumptions
- A subarray is contiguous and nonempty.
- Count different start/end positions separately, even when they produce the same sum.
- Negative numbers and zero are allowed.

## Progressive hints
1. Let `prefix[j]` be the sum of values before index j.
2. A subarray from i through j-1 sums to k exactly when `prefix[j] - prefix[i] == k`.
3. At each new prefix sum p, add the number of earlier prefixes equal to `p-k`.
4. Seed prefix sum zero with count one to represent a subarray beginning at index zero.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int SubarraySum(int[] nums, int k)
    {
        var prefixCount = new Dictionary<long, int> { [0] = 1 };
        long prefix = 0;
        int answer = 0;
        foreach (int value in nums)
        {
            prefix += value;
            long needed = prefix - k;
            answer += prefixCount.GetValueOrDefault(needed);
            prefixCount[prefix] = prefixCount.GetValueOrDefault(prefix) + 1;
        }
        return answer;
    }

    static void Check(int expected, int[] nums, int k)
    {
        int actual = SubarraySum(nums, k);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(2, new[] { 1, 1, 1 }, 2);
        Check(2, new[] { 1, 2, 3 }, 3);
        Check(3, new[] { 1, -1, 0 }, 0);
        Check(6, new[] { 0, 0, 0 }, 0);
        Check(1, new[] { 5 }, 5);
        Check(0, new[] { -2, -1, 2 }, 4);
        Console.WriteLine("Subarray Sum Equals K checks passed.");
    }
}
```

## Correctness argument
Before adding the current prefix `prefix`, the map counts each prefix sum occurring before the current endpoint. Every earlier prefix equal to `prefix-k` defines one start position whose contiguous range ending here sums to k. Adding that frequency counts all such ranges. The initial count for prefix zero includes ranges beginning at index zero. Updating the map only after counting prevents pairing the current prefix with itself, which would represent an empty range. Processing every endpoint counts each nonempty matching subarray exactly once.

## Step-by-step dry run
For `[1,1,1]`, k=2: prefix 1 needs -1 (0 matches); prefix 2 needs 0 (one match, the first two values); prefix 3 needs 1 (one prior prefix, the last two values). Total 2.

## Time complexity
Expected O(n) dictionary operations.

## Space complexity
O(n) distinct prefix sums in the worst case.

## Alternatives and tradeoffs
- Enumerate every start and extend the end in O(n²) time and O(1) extra space; simple baseline and oracle for small arrays.
- Sliding window works under stronger conditions such as all nonnegative values, but negative values destroy monotonicity as the right edge advances.
- Prefix-sum frequency maps count all starts that have the required difference.

## Common mistakes and gotchas
- Storing only whether a prefix appeared; multiple equal prefixes represent multiple valid starts.
- Omitting the initial zero-prefix count.
- Updating the current prefix frequency before querying, accidentally counting an empty range when k=0.
- Using a sliding window despite negative numbers.
- Assuming the answer cannot exceed int without checking n; at n=20,000, there are at most 200,010,000 nonempty subarrays, which fits signed 32-bit int.

## Edge-case tests
- All zeros with k=0.
- Negative values and repeated prefix sums.
- A matching subarray starts at index zero.
- No match.
- A single element equal to k.

## Reflection questions
1. Why must the prefix map store counts?
2. What does the initial `0 -> 1` entry represent?
3. Which property of nonnegative values makes a sliding window possible in a related problem?

## Source
- [Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/)
