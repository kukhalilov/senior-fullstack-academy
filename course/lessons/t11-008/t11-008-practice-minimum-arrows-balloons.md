# interval representations, merging, and scheduling — Problem: Minimum Number of Arrows to Burst Balloons

## Goals

- Find the minimum points that intersect every closed interval.
- Sort by right endpoint and maintain the current common intersection.
- Compare full-width signed endpoints without overflow.

## Problem statement

Each balloon spans a closed horizontal interval `[xStart,xEnd]`. An arrow shot vertically at coordinate x bursts it when `xStart <= x <= xEnd`. Return the minimum arrows needed to burst all balloons.

## Input constraints

- 1 <= points.Length <= 100,000.
- Each interval has exactly two endpoints.
- Int32.MinValue <= start < end <= Int32.MaxValue.
- Endpoints are closed: equality at a boundary still bursts the balloon.

## Examples with expected output

1. `[[10,16],[2,8],[1,6],[7,12]]` -> 2.
2. `[[1,2],[3,4],[5,6],[7,8]]` -> 4.
3. `[[1,2],[2,3],[3,4],[4,5]]` -> 2.
4. `[[int.MinValue,0],[0,int.MaxValue]]` -> 1.

## Clarifying assumptions

- A single point can burst all intervals containing that point, including endpoints.
- At least one interval exists per source constraints.
- The implementation does not mutate caller input.

## Progressive hints

1. If you must place an arrow to hit the earliest-ending balloon, place it at that end.
2. Keep the common intersection point for the current arrow group.
3. A new interval whose start is after that point requires another arrow.
4. Sort with `CompareTo`, not endpoint subtraction.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int FindMinArrowShots(int[][] points)
    {
        if (points is null) throw new ArgumentNullException(nameof(points));
        if (points.Length == 0) return 0;
        foreach (int[] item in points)
            if (item is null || item.Length != 2 || item[0] >= item[1])
                throw new ArgumentException("Every balloon must have start < end.", nameof(points));

        int[][] sorted = (int[][])points.Clone();
        Array.Sort(sorted, (a, b) =>
        {
            int byEnd = a[1].CompareTo(b[1]);
            return byEnd != 0 ? byEnd : a[0].CompareTo(b[0]);
        });

        int arrows = 1;
        int arrowPosition = sorted[0][1];
        for (int i = 1; i < sorted.Length; i++)
        {
            if (sorted[i][0] > arrowPosition)
            {
                arrows++;
                arrowPosition = sorted[i][1];
            }
        }
        return arrows;
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(FindMinArrowShots(new[] { new[] { 10, 16 }, new[] { 2, 8 }, new[] { 1, 6 }, new[] { 7, 12 } }), 2, "Example 1");
        Equal(FindMinArrowShots(new[] { new[] { 1, 2 }, new[] { 3, 4 }, new[] { 5, 6 }, new[] { 7, 8 } }), 4, "disjoint");
        Equal(FindMinArrowShots(new[] { new[] { 1, 2 }, new[] { 2, 3 }, new[] { 3, 4 }, new[] { 4, 5 } }), 2, "touching chain");
        Equal(FindMinArrowShots(new[] { new[] { int.MinValue, 0 }, new[] { 0, int.MaxValue } }), 1, "full Int32 range");
        Console.WriteLine("All Minimum Arrows checks passed.");
    }
}
```

## Correctness argument

After sorting by end, choose the first interval's end as the arrow for its group. Any solution must place an arrow inside that first interval, hence no farther right than its end; moving such an arrow to the end cannot hurt any later interval that it also hits. For each subsequent interval, if its start is at most the current arrow position, it contains that point and is already burst. If its start is greater, it cannot be hit by the current arrow; a new arrow is necessary, and placing it at this interval's end is the same exchange-optimal choice for the remaining suffix. This greedy process is optimal.

## Step-by-step dry run

Sort `[[1,6],[2,8],[7,12],[10,16]]` by end. Place the first arrow at 6; `[2,8]` contains 6. `[7,12]` starts after 6, so place arrow 2 at 12. `[10,16]` contains 12. Total: 2.

## Time complexity

O(n log n) sort and O(n) scan.

## Space complexity

O(n) for the shallow copied sort array.

## Alternatives and tradeoffs

- If intervals arrive sorted by end, a single O(n) greedy scan suffices.
- This problem is equivalent to hitting all closed intervals with the minimum number of points.
- For half-open intervals, choosing the end point may be invalid; the endpoint convention would change the algorithm and possibly require choosing a representable point before the end.

## Common mistakes and gotchas

- Sorting by start rather than end.
- Comparing `start >= arrowPosition`; equality is still hit by a closed interval.
- Updating arrow position with `max` for a group; the feasible intersection shrinks, while the initial chosen earliest end already captures the rightmost feasible point.
- Subtracting endpoints in a comparator and overflowing at Int32 extremes.
- Applying the strict `start < end` validation if adapting to variants that allow point intervals.

## Edge-case tests

- Pairwise disjoint ranges.
- Many ranges sharing one point.
- Touching chain, where the first and third may need separate arrows.
- Nested ranges.
- Int32 extreme endpoints.

## Reflection questions

1. Why is the earliest finishing interval's end a safe arrow placement?
2. Why does `start == arrowPosition` remain covered?
3. How would open or half-open endpoints affect feasibility?
4. Why avoid subtraction in the sort comparator?

Source: [LeetCode: Minimum Number of Arrows to Burst Balloons](https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/).
