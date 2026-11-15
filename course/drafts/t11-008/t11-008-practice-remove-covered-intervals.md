# interval representations, merging, and scheduling — Problem: Remove Covered Intervals

## Goals

- Count intervals not contained by another interval.
- Sort by start ascending and end descending on ties.
- Track the farthest right endpoint seen so far.

## Problem statement

Intervals represent half-open ranges `[l,r)`. Interval `[a,b)` is covered by `[c,d)` exactly when `c <= a` and `b <= d`. Remove all covered intervals and return the number remaining.

## Input constraints

- 1 <= intervals.Length <= 1000.
- Each interval has exactly two endpoints.
- 0 <= start < end <= 100,000.
- All input intervals are unique.

## Examples with expected output

1. `[[1,4],[3,6],[2,8]]` -> 2.
2. `[[1,4],[2,3]]` -> 1.
3. `[[1,5],[1,3],[1,2]]` -> 1.
4. `[[1,3],[2,4]]` -> 2.

## Clarifying assumptions

- Coverage is inclusive of the end comparison in the stated rule: `currentEnd <= priorEnd`.
- The task asks for the count, not the surviving intervals.
- Unique inputs eliminate identical duplicate pairs, but strict containment and equal starts are possible.

## Progressive hints

1. Sort starts ascending so any possible covering interval appears before the interval it covers.
2. For equal starts, place the widest interval first by sorting ends descending.
3. Keep the largest end seen; an interval ending no farther right is covered.
4. Count only strict increases in the farthest end.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int RemoveCoveredIntervals(int[][] intervals)
    {
        if (intervals is null) throw new ArgumentNullException(nameof(intervals));
        if (intervals.Length == 0) return 0;
        foreach (int[] item in intervals)
            if (item is null || item.Length != 2 || item[0] >= item[1])
                throw new ArgumentException("Every interval must have start < end.", nameof(intervals));

        int[][] sorted = (int[][])intervals.Clone();
        Array.Sort(sorted, (a, b) =>
        {
            int byStart = a[0].CompareTo(b[0]);
            return byStart != 0 ? byStart : b[1].CompareTo(a[1]);
        });

        int kept = 0;
        int farthestEnd = int.MinValue;
        foreach (int[] interval in sorted)
        {
            if (interval[1] > farthestEnd)
            {
                kept++;
                farthestEnd = interval[1];
            }
        }
        return kept;
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(RemoveCoveredIntervals(new[] { new[] { 1, 4 }, new[] { 3, 6 }, new[] { 2, 8 } }), 2, "Example 1");
        Equal(RemoveCoveredIntervals(new[] { new[] { 1, 4 }, new[] { 2, 3 } }), 1, "Example 2");
        Equal(RemoveCoveredIntervals(new[] { new[] { 1, 5 }, new[] { 1, 3 }, new[] { 1, 2 } }), 1, "equal starts");
        Equal(RemoveCoveredIntervals(new[] { new[] { 1, 3 }, new[] { 2, 4 } }), 2, "partial overlap is not coverage");
        Console.WriteLine("All Remove Covered Intervals checks passed.");
    }
}
```

## Correctness argument

After sorting, every earlier interval starts no later than the current one. Among equal starts, the longest interval comes first. The invariant is that `farthestEnd` is the maximum end among prior intervals and `kept` counts exactly those records that establish a strictly increasing farthest end. If the current end is at most this maximum, some prior interval starts no later and ends no earlier, so it covers the current one. Otherwise no prior interval can cover it, because all prior starts are no greater but their ends are smaller; count it and update the maximum. Thus the count is exactly the number of uncovered intervals.

## Step-by-step dry run

For `[1,4],[3,6],[2,8]`, sorted order is `[1,4],[2,8],[3,6]`. Count `[1,4]` and set farthest to 4. Count `[2,8]` and update to 8. Skip `[3,6]` since 6 <= 8 and `[2,8]` covers it. Answer 2.

## Time complexity

O(n log n) for sorting plus O(n) scan.

## Space complexity

O(n) for the cloned sort array.

## Alternatives and tradeoffs

- If sorting in place is permitted, the clone is unnecessary.
- For equal starts, ascending end order is incorrect for the simple running-maximum scan unless the algorithm explicitly handles later containing intervals.
- The half-open notation does not change the source's explicit containment inequalities.

## Common mistakes and gotchas

- Sorting equal starts by end ascending and counting a narrow interval before its cover.
- Treating any overlap as coverage; containment requires both endpoint inequalities.
- Counting intervals whose end equals `farthestEnd` as uncovered.
- Returning total minus kept even though this problem asks how many remain.
- Assuming stable sort replaces the explicit tie-break.

## Edge-case tests

- All intervals nested with the same start.
- Partial overlap without containment.
- A later interval extending the farthest end.
- Strict containment with a later start.
- Single interval.

## Reflection questions

1. Why sort equal starts by descending end?
2. What does the running farthest end prove about coverage?
3. Why is partial overlap insufficient for removal?
4. Why count strictly increasing ends?

Source: [LeetCode: Remove Covered Intervals](https://leetcode.com/problems/remove-covered-intervals/).
