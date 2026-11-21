<!-- MANUALLY AUTHORED: checked against frozen problem statement, examples, constraints, and source. -->

# arrays and dynamic arrays for algorithmic problem solving — Problem: Maximum Subarray

# Goals

- Translate “subarray” into a contiguous, non-empty range; distinguish it from a subsequence.
- Derive Kadane’s recurrence from the choice to extend or restart a range.
- Handle all-negative arrays and avoid accidentally choosing an empty subarray.
- Compare the linear scan with prefix-sum and divide-and-conquer alternatives.

# Problem statement

Given an integer array nums, find the non-empty contiguous subarray with the largest sum and return that sum. The answer is a value, not the endpoints.

# Input constraints

- 1 <= nums.Length <= 100,000
- -10,000 <= nums[i] <= 10,000
- The selected range must contain at least one element.
- The maximum possible sum magnitude is at most 10^9, so it fits in a signed 32-bit integer. The solution uses long internally to make accumulation intent explicit.

# Examples with expected output

1. nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4] → 6. The winning range is [4, -1, 2, 1].
2. nums = [1] → 1. A one-element range is valid.
3. nums = [5, 4, -1, 7, 8] → 23. The whole array wins.
4. nums = [-8, -3, -6] → -3. The best non-empty range is the single largest element; zero is not allowed.

# Clarifying assumptions

- A subarray is contiguous: for indices left <= right, it is nums[left..right].
- The range cannot be empty, even if every element is negative.
- Only the sum is requested. If endpoints were required, store the start index whenever the running range restarts and save both endpoints whenever the best sum improves.
- “Subsequence” would allow gaps and is a different problem.

# Progressive hints

1. For a range ending at index i, either extend the best range ending at i - 1, or discard it and begin at i.
2. Let endingHere mean the best sum of a non-empty subarray whose last element is nums[i]. Compare nums[i] with endingHere + nums[i].
3. Track the maximum value of endingHere over every index. Initialize both values from nums[0], not zero, so all-negative input works.
4. You need only the previous ending sum, not an array of all dynamic-programming states.

# Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static long MaxSubArray(int[] nums)
    {
        if (nums is null) throw new ArgumentNullException(nameof(nums));
        if (nums.Length == 0) throw new ArgumentException("At least one value is required.", nameof(nums));

        long endingHere = nums[0];
        long best = nums[0];

        for (int i = 1; i < nums.Length; i++)
        {
            endingHere = Math.Max(nums[i], endingHere + nums[i]);
            best = Math.Max(best, endingHere);
        }

        return best;
    }

    public static void Main()
    {
        if (MaxSubArray(new[] { -2, 1, -3, 4, -1, 2, 1, -5, 4 }) != 6)
            throw new InvalidOperationException("Example 1 failed.");
        if (MaxSubArray(new[] { 1 }) != 1)
            throw new InvalidOperationException("Single-element case failed.");
        if (MaxSubArray(new[] { 5, 4, -1, 7, 8 }) != 23)
            throw new InvalidOperationException("Example 3 failed.");
        if (MaxSubArray(new[] { -8, -3, -6 }) != -3)
            throw new InvalidOperationException("All-negative case failed.");
        if (MaxSubArray(new[] { 0, 0 }) != 0)
            throw new InvalidOperationException("Zero case failed.");

        Console.WriteLine("All Maximum Subarray checks passed.");
    }
}
```

# Correctness argument

For every index i, every non-empty subarray ending at i has one of two forms: it is the one-element range [i..i], or it extends a non-empty subarray ending at i - 1. The best sum ending at i is therefore max(nums[i], endingHere + nums[i]). Induction over the scan shows endingHere equals the best sum for a range ending at the current index. Taking the maximum of these values over all indices considers every possible right endpoint, so best is the maximum sum among all non-empty subarrays.

# Step-by-step dry run

For [-2, 1, -3, 4, -1, 2, 1, -5, 4]:

| value | best ending here | best overall |
|---:|---:|---:|
| -2 | -2 | -2 |
| 1 | 1 | 1 |
| -3 | -2 | 1 |
| 4 | 4 | 4 |
| -1 | 3 | 4 |
| 2 | 5 | 5 |
| 1 | 6 | 6 |
| -5 | 1 | 6 |
| 4 | 5 | 6 |

The maximum is 6, ending at the 1 after 2; the corresponding start is the 4.

# Time complexity

O(n): each input element is processed once, with constant work per element.

# Space complexity

O(1) auxiliary space: only two running sums are stored. The input is not modified.

# Alternatives and tradeoffs

- Enumerate all ranges and sum each from scratch: O(n^3), useful only as a tiny-input oracle.
- Enumerate ranges while maintaining their sum: O(n^2) time and O(1) extra space. It is simpler to derive and can serve as a test oracle.
- Prefix sums: define prefix[0] = 0. For each right boundary, the best range ending there is prefix[right] minus the smallest prefix before it. This is O(n) time and can return endpoints naturally, but needs careful exclusion of the current prefix from the “before” minimum.
- Divide and conquer: split the array; the optimum is entirely left, entirely right, or crosses the midpoint. The crossing candidate is the best suffix of the left half plus best prefix of the right half. Recurrence T(n) = 2T(n/2) + O(n) gives O(n log n) time and O(log n) recursion stack. It illustrates the merge pattern and can be extended to parallel reductions.
- Segment tree: useful when many range maximum-subarray queries or point updates follow. Each node stores total sum, best prefix, best suffix, and best subarray sum; merging adjacent nodes combines these summaries. Building costs O(n) and each update/query costs O(log n), with O(n) storage. It is unnecessary for one static query.
- Kadane’s algorithm is the simplest optimal solution for a single static query.

# Common mistakes and gotchas

- Initializing best to zero allows the empty subarray and returns the wrong answer on all-negative input.
- Resetting the running sum only when it is negative is a valid alternative formulation, but the recurrence is less error-prone: compare “start here” with “extend.”
- Do not sum an empty range. The constraint guarantees at least one value, and initialization from the first element preserves non-emptiness.
- Do not confuse contiguous subarrays with subsequences that may skip elements.
- If the task changes to return indices, preserve the start of the current candidate and update saved endpoints only when the global best improves.
- Confirm the numeric bounds before using int; this problem’s official bounds fit, but related variants may not.

# Edge-case tests

- One element, positive or negative.
- Every element negative: result is the least-negative element.
- All zeroes: result is zero.
- A best range starts at index zero or ends at the last index.
- A negative middle element is worth including when the following gain outweighs it.

# Reflection questions

1. Why does the recurrence preserve a non-empty subarray?
2. Which state is unnecessary if only the sum is returned?
3. How would you modify the scan to return [left, right]?
4. Why does a segment tree help with repeated updates but add overhead for one query?

Sources: [LeetCode: Maximum Subarray](https://leetcode.com/problems/maximum-subarray/description/).
