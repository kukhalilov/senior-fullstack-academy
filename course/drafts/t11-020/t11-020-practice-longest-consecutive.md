# hash maps and frequency tables — Problem: Longest Consecutive Sequence

## Goals
- Find consecutive values without requiring adjacent array positions.
- Start scans only at the smallest value of each run.
- Explain expected linear complexity despite set lookups inside a loop.

## Problem statement
Given an unsorted integer array, return the length of its longest sequence of consecutive values. The sequence values need not be adjacent in the input. The algorithm must run in O(n) time.

## Input constraints
- `0 <= nums.Length <= 100,000`.
- `-1,000,000,000 <= nums[i] <= 1,000,000,000`.

## Examples with expected output
- `[100,4,200,1,3,2] -> 4`.
- `[0,3,7,2,5,8,4,6,0,1] -> 9`.
- `[1,0,1,2] -> 3`.
- `[] -> 0` as a defensive extension; official input allows it.

## Clarifying assumptions
- Duplicates do not extend a sequence and are ignored by the set representation.
- Consecutiveness is numeric difference one, not adjacency in the original array.
- The input is not modified.

## Progressive hints
1. A set gives average constant-time membership.
2. Scanning forward from every value repeats work for values inside the same run.
3. Only start a forward scan when the predecessor is absent.
4. The stated value bound prevents `value - 1` and increments beyond the range from overflowing `int`.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int LongestConsecutive(int[] nums)
    {
        var values = new HashSet<int>(nums);
        int longest = 0;
        foreach (int value in values)
        {
            if (values.Contains(value - 1)) continue;
            int length = 1;
            int next = value + 1;
            while (values.Contains(next))
            {
                length++;
                next++;
            }
            longest = Math.Max(longest, length);
        }
        return longest;
    }

    static void Check(int expected, int[] nums)
    {
        int actual = LongestConsecutive(nums);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(4, new[] { 100, 4, 200, 1, 3, 2 });
        Check(9, new[] { 0, 3, 7, 2, 5, 8, 4, 6, 0, 1 });
        Check(3, new[] { 1, 0, 1, 2 });
        Check(0, Array.Empty<int>());
        Check(1, new[] { -1_000_000_000, 1_000_000_000 });
        Console.WriteLine("Longest Consecutive Sequence checks passed.");
    }
}
```

## Correctness argument
The set contains exactly the distinct input values. If `value-1` is present, `value` is not the start of its consecutive run and need not initiate a scan. Otherwise it is the run's smallest value. The loop advances through every consecutive member until the first missing value, measuring that run exactly once from its start. Every maximal run has one such start, so taking the maximum measured length yields the answer.

## Step-by-step dry run
For `{100,4,200,1,3,2}`, only 1 begins the run `{1,2,3,4}` because 2, 3, and 4 each have a predecessor. The scan from 1 measures length 4; 100 and 200 each form length-one runs. The maximum is 4.

## Time complexity
Expected O(n): set construction is expected linear, and each distinct value is traversed forward only as part of its run's single start scan. Hash membership has expected, not worst-case, constant cost.

## Space complexity
O(n) for the set of distinct values.

## Alternatives and tradeoffs
- Sort a copy and count adjacent differences in O(n log n) time; simpler and deterministic but fails the required linear-time bound.
- Direct scanning from every element can be O(n²) on a long consecutive run.
- The start-detection set method avoids sorting and repeated traversal.

## Common mistakes and gotchas
- Starting a scan from every element, reprocessing each run many times.
- Treating duplicate values as breaking a run.
- Confusing consecutive values with adjacent input positions.
- Claiming strict worst-case O(n) for general hash sets.
- Ignoring integer-boundary overflow if adapting beyond the stated ±1e9 value bounds.

## Edge-case tests
- Empty input.
- Duplicate values inside a run.
- Multiple separated runs.
- Values near both permitted extremes.

## Reflection questions
1. Why does predecessor absence identify one start per run?
2. What is the amortized accounting argument for forward scans?
3. What changes if the hash set is replaced with a sorted array?

## Source
- [Longest Consecutive Sequence](https://leetcode.com/problems/longest-consecutive-sequence/)
