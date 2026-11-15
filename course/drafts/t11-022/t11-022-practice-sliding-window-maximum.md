# monotonic stacks and monotonic queues — Problem: Sliding Window Maximum

## Goals
- Maintain a decreasing deque of candidate indices.
- Expire indices before reading the maximum for the current window.
- Explain why each candidate is inserted and removed at most once.

## Problem statement
Given an array and a window size k that moves one position right at a time, return the maximum value in every complete window.

## Input constraints
- `1 <= nums.Length <= 100,000`.
- `-10,000 <= nums[i] <= 10,000`.
- `1 <= k <= nums.Length`.

## Examples with expected output
- `[1,3,-1,-3,5,3,6,7]`, k=3 -> `[3,3,5,5,6,7]`.
- `[1]`, k=1 -> `[1]`.
- `[2,2,2]`, k=2 -> `[2,2]`.

## Clarifying assumptions
- Windows are contiguous, fixed length k, and emitted left to right.
- Each output is a value; ties do not require a particular index.
- A window is emitted only once it contains k values.

## Progressive hints
1. Recompute each window maximum directly for O(nk) time.
2. Store indices so the oldest candidate can expire at the front.
3. Keep values decreasing from front to back; remove smaller or equal values at the back when a new value arrives.
4. The front is the maximum after removing indices left of the current window.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static int[] MaxSlidingWindow(int[] nums, int k)
    {
        int[] result = new int[nums.Length - k + 1];
        int[] deque = new int[nums.Length];
        int head = 0, tail = 0, output = 0;

        for (int i = 0; i < nums.Length; i++)
        {
            int firstValid = i - k + 1;
            while (head < tail && deque[head] < firstValid) head++;
            while (head < tail && nums[deque[tail - 1]] <= nums[i]) tail--;
            deque[tail++] = i;

            if (i >= k - 1) result[output++] = nums[deque[head]];
        }
        return result;
    }

    static void Check(int[] expected, int[] nums, int k)
    {
        int[] actual = MaxSlidingWindow(nums, k);
        if (!expected.SequenceEqual(actual))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 3, 3, 5, 5, 6, 7 }, new[] { 1, 3, -1, -3, 5, 3, 6, 7 }, 3);
        Check(new[] { 1 }, new[] { 1 }, 1);
        Check(new[] { 2, 2 }, new[] { 2, 2, 2 }, 2);
        Check(new[] { 9 }, new[] { 9, 1, 2 }, 3);
        Check(new[] { -1, -1, -2, -1 }, new[] { -4, -1, -2, -3, -1 }, 2);
        Console.WriteLine("Sliding Window Maximum checks passed.");
    }
}
```

## Correctness argument
At each index i, the deque contains indices in the current or potentially future window and their values decrease from front to back. Expiring indices smaller than `i-k+1` removes exactly those outside the current window. If a newer value is at least as large as a candidate at the back, that older candidate can never be a future maximum: the newer one is no smaller and expires later. Thus removing dominated back entries preserves every possible window maximum. The front is therefore the greatest value among the current window's surviving candidates and equals its maximum.

## Step-by-step dry run
For `[1,3,-1]`, k=3: index 0 enters; index 1 removes 0 because 3 dominates 1; index 2 enters behind 3. The deque values are `[3,-1]`, so the first window maximum is 3.

## Time complexity
O(n): each index is appended once and removed at most once from either end.

## Space complexity
O(n) for the array-backed deque and O(n-k+1) for output.

## Alternatives and tradeoffs
- Scan every window in O(nk) time and O(1) auxiliary space; simple and useful for small k/oracle testing.
- A heap provides O(n log n) operations and needs lazy removal of expired entries.
- A balanced ordered multiset supports add/remove/extremum in O(log k).
- A block prefix/suffix maximum method achieves O(n) but uses different preprocessing and boundary logic.

## Common mistakes and gotchas

- Reading the front before expiring its index.
- Removing equal values from the back inconsistently; using `<=` keeps the newest equal maximum, which expires later.
- Emitting before the first complete window.
- Storing only values, making it impossible to identify expiration.
- Resetting array-backed tail without moving the head; this implementation uses monotonically increasing indices and capacity n.

## Edge-case tests
- k=1 and k=n.
- Strictly increasing and decreasing arrays.
- Repeated maxima.
- All-negative values.
- Maximum at the left edge expiring as the window moves.

## Reflection questions
1. Why can a newer equal value replace an older one?
2. What does the deque order guarantee about the front?
3. Why can each index be charged only one insertion and one removal?

## Source
- [Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/)
