# prefix sums, difference arrays, and static range queries — Problem: Subarray Sum Equals K

## Goals

- Count contiguous ranges using the difference between two prefix sums.
- Use a frequency map because one prefix value can occur many times.
- Explain why negative numbers rule out a standard expanding/shrinking sum window.

## Problem statement

Given an integer array nums and an integer k, return the number of nonempty contiguous subarrays whose sum equals k.

## Input constraints

- 1 <= nums.Length <= 20,000.
- -1,000 <= nums[i] <= 1,000.
- -10,000,000 <= k <= 10,000,000.
- Values can be negative, zero, or positive.

## Examples with expected output

1. nums = [1,1,1], k = 2 -> 2.
2. nums = [1,2,3], k = 3 -> 2.
3. nums = [1,-1,0], k = 0 -> 3.
4. nums = [0,0,0], k = 0 -> 6.

## Clarifying assumptions

- Each subarray is nonempty and contiguous; different index ranges count separately even when their values are equal.
- The array may contain negative values, so the common positive-only minimal-sum window does not apply.
- The answer is returned as Int32 under the stated n limit; the implementation counts in Int64 and checks the final conversion.
- Prefix values are stored at boundaries: the prefix before the first element is zero.

## Progressive hints

1. Let S be the sum through the current element. What earlier prefix Q makes the intervening range sum k?
2. Rearrange `S - Q = k` to get `Q = S - k`.
3. Count how often that needed prefix has appeared before this position.
4. Seed prefix zero once, query the map before inserting the current prefix, then increase its frequency.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int SubarraySum(int[] nums, int k)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));

        var frequency = new Dictionary<long, long> { [0] = 1 };
        long prefix = 0;
        long count = 0;

        foreach (int value in nums)
        {
            prefix += value;
            long needed = prefix - k;
            if (frequency.TryGetValue(needed, out long priorCount))
                count += priorCount;

            frequency.TryGetValue(prefix, out long currentCount);
            frequency[prefix] = currentCount + 1;
        }

        return checked((int)count);
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(SubarraySum(new[] { 1, 1, 1 }, 2), 2, "Example 1");
        AssertEqual(SubarraySum(new[] { 1, 2, 3 }, 3), 2, "Example 2");
        AssertEqual(SubarraySum(new[] { 1, -1, 0 }, 0), 3, "Signed values");
        AssertEqual(SubarraySum(new[] { 0, 0, 0 }, 0), 6, "Repeated zero prefixes");
        AssertEqual(SubarraySum(new[] { -1, -1, 1 }, -2), 1, "Negative target");
        AssertEqual(SubarraySum(new[] { 5 }, 4), 0, "No matching range");
        Console.WriteLine("All Subarray Sum Equals K checks passed.");
    }
}
```

## Correctness argument

Before processing an element at index r, the map contains the frequency of every prefix at boundaries before r, including the empty prefix at boundary zero. After adding the current value, let S be the prefix through r. A prior boundary l creates the nonempty subarray `[l,r]` with sum k exactly when `S - prefix[l] = k`, equivalently `prefix[l] = S-k`. The lookup therefore adds one count for each valid starting boundary. Frequencies are necessary because several earlier boundaries can share the required prefix and each represents a distinct subarray.

After querying, the current prefix is inserted for future endpoints. Querying first prevents the current boundary from pairing with itself and creating an empty subarray when k is zero. Inductively, every valid subarray is counted once at its right endpoint, and no invalid or empty range is counted. The final total is the required number.

## Step-by-step dry run

For nums = `[1,-1,0]`, k = 0, start with prefix 0 seen once:

| value | prefix | needed prefix | prior frequency | count so far |
|---:|---:|---:|---:|---:|
| 1 | 1 | 1 | 0 | 0 |
| -1 | 0 | 0 | 1 | 1 |
| 0 | 0 | 0 | 2 | 3 |

The three counted ranges are `[1,-1]`, `[0]` at the final position, and the whole `[1,-1,0]` range.

## Time complexity

O(n) expected time with hash-map operations, for n array elements.

## Space complexity

O(n) for distinct prefix sums in the worst case.

## Alternatives and tradeoffs

- A nested loop with a running sum takes O(n²) time and O(1) extra space. It is useful as a small-input oracle; it is too slow for the full upper bound.
- A sliding window can solve related exact-sum counting problems for nonnegative values with a different proof, but signed values break its monotonicity. Do not silently assume positivity here.
- The same prefix-frequency pattern generalizes to XOR by looking up `currentXor XOR target`; it is a different aggregate identity.

## Common mistakes and gotchas

- Storing whether a prefix was seen rather than its frequency; repeated prefixes yield multiple valid starts.
- Forgetting frequency `[0] = 1` before scanning, which misses ranges starting at index zero.
- Inserting the current prefix before querying, which may count an empty range for k=0.
- Using a sliding window with negative values and moving boundaries based on sum comparisons.
- Counting only one prefix match when several prior boundaries share it.
- Returning the number of matching prefix values rather than the total number of matching ranges.
- Using an insufficiently wide sum or count in generalized constraints.

## Edge-case tests

- All zeroes with k=0; there are n(n+1)/2 ranges.
- Repeated prefix sums caused by positive and negative cancellation.
- A match beginning at index zero.
- A negative k.
- No matching range.
- Several candidate starting boundaries for one endpoint.

## Reflection questions

1. Why is the needed previous prefix `current-k`?
2. Why does the map store counts rather than a single index?
3. What changes if the current prefix is inserted before querying?
4. Which exact assumption does a positive-only sliding window need that this input does not provide?

Source: [LeetCode: Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/).
