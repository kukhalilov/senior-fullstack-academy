# interval representations, merging, and scheduling — Problem: Insert Interval

## Goals

- Insert a closed interval into a sorted, pairwise-disjoint list.
- Merge every range sharing any point with the inserted interval.
- Preserve input order and avoid unnecessary sorting.

## Problem statement

Given sorted, non-overlapping closed intervals and one new closed interval, insert it so the result remains sorted and non-overlapping, merging intervals that overlap. Touching at an endpoint counts as overlap.

## Input constraints

- 0 <= intervals.Length <= 10,000.
- Each interval has two endpoints, with 0 <= start <= end <= 100,000.
- The list is sorted by start and pairwise non-overlapping.
- `newInterval` has two endpoints in the same range.

## Examples with expected output

1. `[[1,3],[6,9]]`, insert `[2,5]` -> `[[1,5],[6,9]]`.
2. `[[1,2],[3,5],[6,7],[8,10],[12,16]]`, insert `[4,8]` -> `[[1,2],[3,10],[12,16]]`.
3. `[]`, insert `[5,7]` -> `[[5,7]]`.
4. `[[1,2],[5,7]]`, insert `[3,4]` -> `[[1,2],[3,4],[5,7]]`.

## Clarifying assumptions

- Touching closed intervals overlap: an earlier interval is before only when `end < newStart`.
- Inputs are not mutated; each output pair is newly allocated.
- The preexisting intervals are already sorted and disjoint, so only the new interval can create a merge run.

## Progressive hints

1. Emit all intervals completely before the new one.
2. While the next start is at most the new end, absorb it and expand both bounds.
3. Emit the merged new interval once.
4. Append the untouched suffix.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int[][] Insert(int[][] intervals, int[] newInterval)
    {
        if (intervals is null) throw new ArgumentNullException(nameof(intervals));
        if (newInterval is null || newInterval.Length != 2 || newInterval[0] > newInterval[1])
            throw new ArgumentException("newInterval must be a valid pair.", nameof(newInterval));
        foreach (int[] item in intervals)
            if (item is null || item.Length != 2 || item[0] > item[1])
                throw new ArgumentException("Every interval must be a valid pair.", nameof(intervals));

        var result = new List<int[]>();
        int i = 0;
        while (i < intervals.Length && intervals[i][1] < newInterval[0])
            result.Add((int[])intervals[i++].Clone());

        int start = newInterval[0];
        int end = newInterval[1];
        while (i < intervals.Length && intervals[i][0] <= end)
        {
            start = Math.Min(start, intervals[i][0]);
            end = Math.Max(end, intervals[i][1]);
            i++;
        }
        result.Add(new[] { start, end });

        while (i < intervals.Length) result.Add((int[])intervals[i++].Clone());
        return result.ToArray();
    }

    private static void Equal(int[][] actual, int[][] expected, string label)
    {
        if (actual.Length != expected.Length) throw new InvalidOperationException(label + " length failed");
        for (int i = 0; i < actual.Length; i++)
            if (actual[i][0] != expected[i][0] || actual[i][1] != expected[i][1])
                throw new InvalidOperationException(label + " item " + i + " failed");
    }

    public static void Main()
    {
        Equal(Insert(new[] { new[] { 1, 3 }, new[] { 6, 9 } }, new[] { 2, 5 }),
            new[] { new[] { 1, 5 }, new[] { 6, 9 } }, "Example 1");
        Equal(Insert(new[] { new[] { 1, 2 }, new[] { 3, 5 }, new[] { 6, 7 }, new[] { 8, 10 }, new[] { 12, 16 } }, new[] { 4, 8 }),
            new[] { new[] { 1, 2 }, new[] { 3, 10 }, new[] { 12, 16 } }, "Example 2");
        Equal(Insert(Array.Empty<int[]>(), new[] { 5, 7 }), new[] { new[] { 5, 7 } }, "empty list");
        Equal(Insert(new[] { new[] { 1, 2 }, new[] { 5, 7 } }, new[] { 3, 4 }),
            new[] { new[] { 1, 2 }, new[] { 3, 4 }, new[] { 5, 7 } }, "disjoint insertion");
        Equal(Insert(new[] { new[] { 1, 2 } }, new[] { 2, 3 }), new[] { new[] { 1, 3 } }, "touching");
        Console.WriteLine("All Insert Interval checks passed.");
    }
}
```

## Correctness argument

Every interval emitted before the merge loop ends strictly before the inserted start, so it cannot overlap the new range. The merge loop absorbs each interval whose start is no greater than the evolving end; because the list is sorted, no skipped interval can overlap later. Updating start and end to their minimum and maximum preserves the union. After the loop, all remaining intervals begin after the merged end, so they are disjoint and can be appended unchanged. The result remains sorted and covers exactly the original ranges plus the inserted range.

## Step-by-step dry run

For insert `[4,8]` into `[1,2],[3,5],[6,7],[8,10],[12,16]`, first emit `[1,2]`. Absorb `[3,5]` -> `[3,8]`; absorb `[6,7]`; absorb `[8,10]` because touching at 8 overlaps, extending to `[3,10]`. The next `[12,16]` is beyond the end, so append it.

## Time complexity

O(n): each interval is inspected and emitted at most once.

## Space complexity

O(n) for output; input arrays remain unchanged.

## Alternatives and tradeoffs

- A mutable in-place implementation can reduce allocations if mutation is allowed and input/output aliasing is documented.
- Sorting would work for arbitrary input but discards the useful sorted/disjoint precondition and costs O(n log n).
- Half-open interval insertion changes the before/overlap equality tests.

## Common mistakes and gotchas

- Stopping merge based on the original end instead of the expanded end.
- Using `<=` for the before case and thereby failing to merge touching closed intervals.
- Forgetting to append the merged range or the remaining suffix.
- Assuming sorted intervals are necessarily separated by a strict gap; this problem's pairwise non-overlap rule means no shared closed endpoints, but tests should still verify the source contract.

## Edge-case tests

- Empty list.
- New interval before all or after all existing intervals.
- New interval fully contained in one interval.
- New interval bridges several intervals.
- Touching endpoint.

## Reflection questions

1. Why does the merge loop use the expanding end?
2. Why is sorting unnecessary?
3. Which interval invariant makes appending the suffix safe?
4. How would strict half-open semantics change comparisons?

Source: [LeetCode: Insert Interval](https://leetcode.com/problems/insert-interval/).
