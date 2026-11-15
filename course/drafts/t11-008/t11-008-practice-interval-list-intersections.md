# interval representations, merging, and scheduling — Problem: Interval List Intersections

## Goals

- Intersect two sorted, pairwise-disjoint lists of closed intervals.
- Use two pointers and advance the interval that ends first.
- Preserve singleton intersections at shared endpoints.

## Problem statement

Given two lists of closed intervals, each internally pairwise-disjoint and sorted, return their intersection as a list of closed intervals.

## Input constraints

- 0 <= each list length <= 1000; combined length is at least 1.
- Each interval satisfies 0 <= start < end <= 10^9.
- Each list is sorted and strictly disjoint: prior end < next start.
- Closed intervals include both endpoints.

## Examples with expected output

1. `[[0,2],[5,10],[13,23],[24,25]]` and `[[1,5],[8,12],[15,24],[25,26]]` -> `[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]`.
2. `[[1,3],[5,9]]` and `[]` -> `[]`.
3. `[[1,4]]` and `[[4,8]]` -> `[[4,4]]`.

## Clarifying assumptions

- Intersection of `[a,b]` and `[c,d]` is nonempty when `max(a,c) <= min(b,d)`.
- An intersection containing one point is included.
- Input interval arrays are not mutated.

## Progressive hints

1. Consider one interval from each list.
2. Their overlap begins at the greater start and ends at the lesser end.
3. Emit it if the computed start is at most the computed end.
4. Advance whichever interval ends first; it cannot intersect any later interval from the other list.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int[][] IntervalIntersection(int[][] firstList, int[][] secondList)
    {
        if (firstList is null) throw new ArgumentNullException(nameof(firstList));
        if (secondList is null) throw new ArgumentNullException(nameof(secondList));
        Validate(firstList, nameof(firstList));
        Validate(secondList, nameof(secondList));

        var result = new List<int[]>();
        int i = 0, j = 0;
        while (i < firstList.Length && j < secondList.Length)
        {
            int start = Math.Max(firstList[i][0], secondList[j][0]);
            int end = Math.Min(firstList[i][1], secondList[j][1]);
            if (start <= end) result.Add(new[] { start, end });

            if (firstList[i][1] < secondList[j][1]) i++;
            else if (secondList[j][1] < firstList[i][1]) j++;
            else { i++; j++; }
        }
        return result.ToArray();
    }

    private static void Validate(int[][] list, string name)
    {
        for (int i = 0; i < list.Length; i++)
        {
            int[] interval = list[i];
            if (interval is null || interval.Length != 2 || interval[0] >= interval[1])
                throw new ArgumentException("Intervals must have start < end.", name);
            if (i > 0 && list[i - 1][1] >= interval[0])
                throw new ArgumentException("Intervals must be sorted and strictly disjoint.", name);
        }
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
        Equal(IntervalIntersection(
            new[] { new[] { 0, 2 }, new[] { 5, 10 }, new[] { 13, 23 }, new[] { 24, 25 } },
            new[] { new[] { 1, 5 }, new[] { 8, 12 }, new[] { 15, 24 }, new[] { 25, 26 } }),
            new[] { new[] { 1, 2 }, new[] { 5, 5 }, new[] { 8, 10 }, new[] { 15, 23 }, new[] { 24, 24 }, new[] { 25, 25 } }, "Example 1");
        Equal(IntervalIntersection(new[] { new[] { 1, 3 }, new[] { 5, 9 } }, Array.Empty<int[]>()), Array.Empty<int[]>(), "empty list");
        Equal(IntervalIntersection(new[] { new[] { 1, 4 } }, new[] { new[] { 4, 8 } }), new[] { new[] { 4, 4 } }, "singleton overlap");
        Console.WriteLine("All Interval List Intersections checks passed.");
    }
}
```

## Correctness argument

For current intervals A and B, their intersection is exactly `[max(A.start,B.start), min(A.end,B.end)]` when the computed start is no greater than the computed end. If A ends first, A cannot intersect any later interval in B's list because those intervals start after the current B and A's end is already before B's end; advance A. Symmetrically advance B when it ends first. If ends are equal, neither can intersect later entries of the other list, so advance both. This exhausts every possible pair without skipping an intersection.

## Step-by-step dry run

Compare `[0,2]` and `[1,5]`: emit `[1,2]`; advance the first list because 2 is earlier. Then `[5,10]` against `[1,5]` yields singleton `[5,5]`; advance second because it ends first. The next pair `[5,10]` and `[8,12]` emits `[8,10]`.

## Time complexity

O(m+n); each pointer advances at least once per loop, and no interval is revisited.

## Space complexity

O(k) output for k intersections; O(1) auxiliary scan state.

## Alternatives and tradeoffs

- Binary searching candidate overlaps can help when one list is much smaller and the other is very large, but this problem's sizes favor the simple linear scan.
- The method generalizes to half-open intervals by changing the nonempty test to strict `<` and respecting each endpoint's inclusion.

## Common mistakes and gotchas

- Using strict `<` for closed intersections and losing singleton results.
- Advancing the interval with the later end and skipping future possible intersections.
- Forgetting empty-list cases.
- Assuming the two lists are mutually sorted together; only each list has its own order.

## Edge-case tests

- Either list empty.
- Shared endpoint only.
- One interval containing another.
- Disjoint lists.
- Equal ends requiring both pointers to advance.

## Reflection questions

1. Why are the max start and min end the only candidate intersection?
2. Why advance the smaller end?
3. Why is `[x,x]` a valid intersection here?
4. How would the test change for half-open ranges?

Source: [LeetCode: Interval List Intersections](https://leetcode.com/problems/interval-list-intersections/).
