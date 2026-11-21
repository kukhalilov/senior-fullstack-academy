# interval representations, merging, and scheduling — Problem: Merge Intervals

## Goals

- Sort arbitrary closed intervals and merge overlapping ranges.
- Preserve coverage while emitting sorted, pairwise-disjoint output.
- Handle touching endpoints as overlap for this problem.

## Problem statement

Given intervals `[start,end]`, merge all overlapping closed intervals and return nonoverlapping intervals covering the same points.

## Input constraints

- 1 <= intervals.Length <= 10,000.
- Each interval has exactly two endpoints.
- 0 <= start <= end <= 10,000.
- Closed intervals sharing an endpoint overlap.

## Examples with expected output

1. `[[1,3],[2,6],[8,10],[15,18]]` -> `[[1,6],[8,10],[15,18]]`.
2. `[[1,4],[4,5]]` -> `[[1,5]]`.
3. `[[4,7],[1,4]]` -> `[[1,7]]`.
4. `[[1,4],[1,2],[2,2]]` -> `[[1,4]]`.

## Clarifying assumptions

- Inputs are not assumed sorted; the method does not mutate caller arrays.
- Each interval is closed, so `nextStart <= currentEnd` means overlap.
- A zero-length closed interval is a point and may merge with an interval containing that point.

## Progressive hints

1. Sorting by start makes the next possible overlap easy to identify.
2. Keep one current output interval.
3. If next start is no greater than current end, extend by the larger end.
4. Otherwise emit current and begin a new component.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int[][] Merge(int[][] intervals)
    {
        if (intervals is null) throw new ArgumentNullException(nameof(intervals));
        if (intervals.Length == 0) return Array.Empty<int[]>();
        foreach (int[] item in intervals)
        {
            if (item is null || item.Length != 2 || item[0] > item[1])
                throw new ArgumentException("Every interval must be a valid closed pair.", nameof(intervals));
        }

        int[][] sorted = (int[][])intervals.Clone();
        Array.Sort(sorted, (a, b) =>
        {
            int byStart = a[0].CompareTo(b[0]);
            return byStart != 0 ? byStart : a[1].CompareTo(b[1]);
        });

        var result = new List<int[]>();
        int start = sorted[0][0];
        int end = sorted[0][1];
        for (int i = 1; i < sorted.Length; i++)
        {
            int nextStart = sorted[i][0];
            int nextEnd = sorted[i][1];
            if (nextStart <= end)
            {
                end = Math.Max(end, nextEnd);
            }
            else
            {
                result.Add(new[] { start, end });
                start = nextStart;
                end = nextEnd;
            }
        }
        result.Add(new[] { start, end });
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
        Equal(Merge(new[] { new[] { 1, 3 }, new[] { 2, 6 }, new[] { 8, 10 }, new[] { 15, 18 } }),
            new[] { new[] { 1, 6 }, new[] { 8, 10 }, new[] { 15, 18 } }, "Example 1");
        Equal(Merge(new[] { new[] { 1, 4 }, new[] { 4, 5 } }), new[] { new[] { 1, 5 } }, "touching");
        Equal(Merge(new[] { new[] { 4, 7 }, new[] { 1, 4 } }), new[] { new[] { 1, 7 } }, "reverse order");
        Equal(Merge(new[] { new[] { 1, 4 }, new[] { 1, 2 }, new[] { 2, 2 } }), new[] { new[] { 1, 4 } }, "nested and point");
        Console.WriteLine("All Merge Intervals checks passed.");
    }
}
```

## Correctness argument

Sorting by start ensures no future interval begins before the current one. The current pair is the union of the processed intervals in its connected overlap component. If the next start is at most the current end, closed intervals intersect or touch; replacing the end by the maximum preserves exactly their union. If it starts later, no subsequent interval can bridge the gap from the sorted suffix, so the current component is complete and can be emitted. Inductively, emitted ranges cover all processed points and are pairwise disjoint.

## Step-by-step dry run

Sort `[1,3],[2,6],[8,10],[15,18]`. Begin `[1,3]`; `[2,6]` overlaps and extends it to `[1,6]`. `[8,10]` is separated, so emit `[1,6]`. `[15,18]` is separated from `[8,10]`; emit both at the appropriate transitions.

## Time complexity

O(n log n) for sorting plus O(n) scan.

## Space complexity

O(n) output and O(n) shallow array for sorted references; sorting stack is implementation-dependent.

## Alternatives and tradeoffs

- If input is already sorted, skip sorting for O(n) time.
- In-place sorting can avoid the shallow clone if mutating caller input is allowed.
- Half-open intervals would need a strict overlap comparison when touching ranges should remain separate.

## Common mistakes and gotchas

- Using `<` and splitting touching closed intervals.
- Setting `end = nextEnd`, which can shrink a nested interval's coverage.
- Failing to emit the final active range after the loop.
- Sorting with endpoint subtraction, which can overflow for full Int32 coordinates.
- Treating `[x,x]` as empty; this closed interval contains one point.

## Edge-case tests

- One interval.
- Unsorted intervals.
- Nested, duplicate, and touching intervals.
- Disjoint ranges.
- Closed point intervals.

## Reflection questions

1. Why does start sorting make it safe to emit when a gap appears?
2. Why is maximum end required?
3. How would the predicate change for half-open intervals?
4. What additional precondition permits linear time?

Source: [LeetCode: Merge Intervals](https://leetcode.com/problems/merge-intervals/).
