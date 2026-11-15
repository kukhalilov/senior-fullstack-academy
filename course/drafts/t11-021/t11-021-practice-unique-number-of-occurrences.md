# sets and membership algorithms — Problem: Unique Number of Occurrences

## Goals
- Count each distinct input value with a map.
- Use a second set to detect repeated frequencies.
- Distinguish uniqueness of counts from uniqueness of values.

## Problem statement
Return true if every distinct value in `arr` occurs a different number of times; otherwise return false.

## Input constraints
- `1 <= arr.Length <= 1,000`.
- `-1,000 <= arr[i] <= 1,000`.

## Examples with expected output
- `[1,2,2,1,1,3] -> true`.
- `[1,2] -> false`.
- `[-3,0,1,-3,1,1,1,-3,10,0] -> true`.
- `[5,5,6,6] -> false`.

## Clarifying assumptions
- Each distinct value has one positive count.
- The question is whether two different values share a count; duplicate values in the input are expected.
- Input order is irrelevant.

## Progressive hints
1. Count values first; checking raw values cannot reveal count collisions.
2. Insert each frequency into a set.
3. If a frequency is already present, two distinct values share it and the answer is false.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static bool UniqueOccurrences(int[] arr)
    {
        var counts = new Dictionary<int, int>();
        foreach (int value in arr)
            counts[value] = counts.GetValueOrDefault(value) + 1;

        var seenCounts = new HashSet<int>();
        foreach (int count in counts.Values)
            if (!seenCounts.Add(count)) return false;
        return true;
    }

    static void Check(bool expected, int[] arr)
    {
        bool actual = UniqueOccurrences(arr);
        if (actual != expected) throw new InvalidOperationException("Unique occurrence check failed.");
    }

    static void Main()
    {
        Check(true, new[] { 1, 2, 2, 1, 1, 3 });
        Check(false, new[] { 1, 2 });
        Check(true, new[] { -3, 0, 1, -3, 1, 1, 1, -3, 10, 0 });
        Check(false, new[] { 5, 5, 6, 6 });
        Check(true, new[] { 42 });
        Console.WriteLine("Unique Number of Occurrences checks passed.");
    }
}
```

## Correctness argument
The dictionary computes the exact occurrence count for every distinct array value. The set processes those counts. If insertion of a count fails, it has already been assigned to a different value, so the counts are not unique. If all counts are inserted successfully, no two distinct values have the same occurrence count. Thus the returned boolean matches the requirement.

## Step-by-step dry run
For `[1,2,2,1,1,3]`, counts are `{1:3, 2:2, 3:1}`. Insert 3, then 2, then 1 into the frequency set; every insertion is new, so return true.

## Time complexity
Expected O(n) to build and scan the frequency map.

## Space complexity
O(u) for u distinct values and their distinct-count set; both are at most O(n).

## Alternatives and tradeoffs
- Sort the frequency values and check adjacent counts; this adds O(u log u) time.
- A direct-address count array is possible because input values lie in [-1000,1000], but a dictionary makes the distinct-value logic explicit.
- A set of counts is sufficient after frequency counting; retaining a second map is unnecessary.

## Common mistakes and gotchas
- Checking whether input values are unique rather than whether their frequencies are unique.
- Using one set for values and counts together, mixing two domains.
- Returning true on the first repeated input item.
- Forgetting negative values when using direct-address indexing; offset by the minimum if using an array.

## Edge-case tests
- One distinct value has count one.
- Two values each occur once.
- Several distinct positive counts.
- Two values have equal counts.
- Negative and zero values.

## Reflection questions
1. Why is the first pass necessary?
2. What does a failed insertion into `seenCounts` prove?
3. When would a direct-address count array be preferable?

## Source
- [Unique Number of Occurrences](https://leetcode.com/problems/unique-number-of-occurrences/)
