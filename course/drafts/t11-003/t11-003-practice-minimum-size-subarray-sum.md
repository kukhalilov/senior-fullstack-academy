# two-pointer and sliding-window techniques — Problem: Minimum Size Subarray Sum

## Goals

- Use an expanding and contracting window to find a shortest qualifying contiguous range.
- Explain exactly why positive input makes the greedy boundary movement safe.
- Detect why negative values invalidate this solution's proof.

## Problem statement

Given a positive integer target and an array of positive integers nums, return the minimal length of a nonempty contiguous subarray whose sum is greater than or equal to target. Return 0 when no such subarray exists.

## Input constraints

- 1 <= target <= 1,000,000,000.
- 1 <= nums.Length <= 100,000.
- 1 <= nums[i] <= 10,000.
- The array contains positive integers; this assumption is essential to the window proof.

## Examples with expected output

1. target = 7, nums = [2,3,1,2,4,3] -> 2, from [4,3].
2. target = 4, nums = [1,4,4] -> 1, from [4].
3. target = 11, nums = [1,1,1,1,1,1,1,1] -> 0.
4. target = 5, nums = [5] -> 1.

## Clarifying assumptions

- A subarray is contiguous and nonempty.
- Return only its length; ties do not require returning a particular range.
- For robustness, the implementation rejects null, nonpositive target, and nonpositive elements; the stated valid input already excludes these cases.
- A 64-bit running sum avoids overflow in generalizations, even though these specific bounds keep the total below Int32.MaxValue.

## Progressive hints

1. Extend the right boundary and maintain the sum of the current contiguous range.
2. Once the sum reaches target, every longer range ending at that right boundary is no better than the current valid one. Record its length.
3. Remove the leftmost value and check whether the shorter range remains valid; repeat until invalid.
4. Every index enters once and leaves at most once. Ask what input property guarantees shrinking cannot unexpectedly increase the sum.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int MinSubArrayLen(int target, int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (target <= 0) throw new ArgumentOutOfRangeException(nameof(target));
        if (nums.Length == 0) return 0;
        foreach (int value in nums)
            if (value <= 0) throw new ArgumentException("Every value must be positive.", nameof(nums));

        long sum = 0;
        int left = 0;
        int best = int.MaxValue;
        for (int right = 0; right < nums.Length; right++)
        {
            sum += nums[right];
            while (sum >= target)
            {
                best = Math.Min(best, right - left + 1);
                sum -= nums[left];
                left++;
            }
        }
        return best == int.MaxValue ? 0 : best;
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(MinSubArrayLen(7, new[] { 2, 3, 1, 2, 4, 3 }), 2, "Example 1");
        AssertEqual(MinSubArrayLen(4, new[] { 1, 4, 4 }), 1, "Example 2");
        AssertEqual(MinSubArrayLen(11, new[] { 1, 1, 1, 1, 1, 1, 1, 1 }), 0, "No qualifying range");
        AssertEqual(MinSubArrayLen(5, new[] { 5 }), 1, "Single element meets target");
        AssertEqual(MinSubArrayLen(6, new[] { 1, 2, 3 }), 3, "Whole array is shortest");
        Console.WriteLine("All Minimum Size Subarray Sum checks passed.");
    }
}
```

## Correctness argument

After processing each right endpoint, sum equals the values in the current window `[left,right]`. The loop shrinks only while that window is valid and records each valid length before removing its leftmost value. Any shorter valid window ending at the same right endpoint would appear later in this shrink loop, so the smallest such length is recorded.

Because every value is positive, adding values on the right cannot reduce the sum. Removing the leftmost value cannot increase it. Thus, once removing a value makes the window invalid, further removals cannot make that same ending window valid again. The left boundary never needs to move backward. Every right index is visited once and every left index is removed at most once; all valid windows are considered at their shortest point for each right boundary. Therefore the minimum recorded length is globally minimal. If no valid window was recorded, no qualifying subarray exists and returning 0 is correct.

## Step-by-step dry run

For target 7 and nums `[2,3,1,2,4,3]`:

| right | added | current sum | shrink actions | best |
|---:|---:|---:|---|---:|
| 0 | 2 | 2 | none | unset |
| 1 | 3 | 5 | none | unset |
| 2 | 1 | 6 | none | unset |
| 3 | 2 | 8 | record length 4; remove 2, sum 6 | 4 |
| 4 | 4 | 10 | record 4; remove 3, sum 7; record 3; remove 1, sum 6 | 3 |
| 5 | 3 | 9 | record 3; remove 2, sum 7; record 2; remove 4, sum 3 | 2 |

The best length is 2, from `[4,3]`.

## Time complexity

O(n). The right pointer advances n times; the left pointer advances at most n times. Although there is a nested while loop, its total iterations across the whole scan are at most n.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- Prefix sums are strictly increasing because every element is positive. Binary search for the earliest prefix meeting the target gives O(n log n) time and O(n) storage; it is a useful alternative when practicing monotone search but is slower and uses more memory here.
- For signed values, prefix sums are no longer monotone. A monotonic deque can solve the related shortest subarray with sum at least target problem in O(n), but it is a different invariant and should not be substituted without studying its proof.
- A brute-force enumeration checks O(n²) ranges, and recomputing each range sum can add another factor of n. It is useful only for tiny inputs or as a reference oracle.

## Common mistakes and gotchas

- Shrinking only once: several left values may need removal before the window becomes invalid.
- Recording after removing: this can skip the shortest valid window.
- Using `left <= right` logic that creates an empty range, then computing its length as if nonempty.
- Assuming every minimum-sum threshold problem accepts this window. Negative values break the monotonicity proof.
- Returning `int.MaxValue` when no range qualifies instead of the specified 0.
- Recomputing the sum of the whole window after every boundary move, which can make the algorithm quadratic.

## Edge-case tests

- A single value equal to target returns 1.
- No range reaches target returns 0.
- The entire array is required.
- Several nested valid windows end at one right boundary; record all while shrinking.
- Large target and long input; use a sum type that cannot overflow under supported extensions.

## Reflection questions

1. Which exact monotonicity fact justifies advancing left permanently?
2. Why must the algorithm record before removing the left endpoint?
3. Construct a signed array where shrinking a valid window can decrease its sum.
4. Why is the nested loop still linear overall?

Sources: [LeetCode: Minimum Size Subarray Sum](https://leetcode.com/problems/minimum-size-subarray-sum/), [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window).
