# interval representations, merging, and scheduling — Problem: Non-overlapping Intervals

## Goals

- Maximize the number of mutually compatible intervals using earliest-finish greedy.
- Convert maximum retained count into the minimum removals.
- Treat touching closed intervals as non-overlapping, as specified.

## Problem statement

Return the minimum number of intervals to remove so that the remaining intervals do not overlap. Intervals that touch at one point are compatible.

## Input constraints

- 1 <= intervals.Length <= 100,000.
- Each interval has two endpoints and `start < end`.
- -50,000 <= start,end <= 50,000.
- `[a,b]` and `[b,c]` are explicitly non-overlapping for this task.

## Examples with expected output

1. `[[1,2],[2,3],[3,4],[1,3]]` -> 1.
2. `[[1,2],[1,2],[1,2]]` -> 2.
3. `[[1,2],[2,3]]` -> 0.
4. `[[1,100],[11,22],[1,11],[2,12]]` -> 2.

## Clarifying assumptions

- Removal costs are equal; maximizing the retained count minimizes removals.
- Touching is compatible, so accept when `start >= lastEnd`.
- Inputs are not mutated.

## Progressive hints

1. Prefer the interval that blocks the fewest future choices.
2. Sort by end time.
3. Keep an interval if it starts at or after the previous kept end.
4. Return total count minus kept count.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int EraseOverlapIntervals(int[][] intervals)
    {
        if (intervals is null) throw new ArgumentNullException(nameof(intervals));
        foreach (int[] item in intervals)
            if (item is null || item.Length != 2 || item[0] >= item[1])
                throw new ArgumentException("Every interval must have start < end.", nameof(intervals));
        if (intervals.Length == 0) return 0;

        int[][] sorted = (int[][])intervals.Clone();
        Array.Sort(sorted, (a, b) =>
        {
            int byEnd = a[1].CompareTo(b[1]);
            return byEnd != 0 ? byEnd : a[0].CompareTo(b[0]);
        });

        int kept = 0;
        int lastEnd = 0;
        foreach (int[] interval in sorted)
        {
            if (kept == 0 || interval[0] >= lastEnd)
            {
                kept++;
                lastEnd = interval[1];
            }
        }
        return intervals.Length - kept;
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(EraseOverlapIntervals(new[] { new[] { 1, 2 }, new[] { 2, 3 }, new[] { 3, 4 }, new[] { 1, 3 } }), 1, "Example 1");
        Equal(EraseOverlapIntervals(new[] { new[] { 1, 2 }, new[] { 1, 2 }, new[] { 1, 2 } }), 2, "duplicates");
        Equal(EraseOverlapIntervals(new[] { new[] { 1, 2 }, new[] { 2, 3 } }), 0, "touching");
        Equal(EraseOverlapIntervals(new[] { new[] { 1, 100 }, new[] { 11, 22 }, new[] { 1, 11 }, new[] { 2, 12 } }), 2, "nested choices");
        Console.WriteLine("All Non-overlapping Intervals checks passed.");
    }
}
```

## Correctness argument

Let G be a compatible interval with earliest finish, and O be the first interval in an optimal schedule. Since `finish(G) <= finish(O)`, replacing O by G preserves compatibility with every later interval, so there exists an optimal schedule beginning with G. Repeating this argument on the remaining intervals proves that the greedy scan retains a maximum-size compatible subset. Every removed interval is excluded from that subset; with equal removal costs, the minimum number removed is `n - kept`.

## Step-by-step dry run

Sort `[1,2],[2,3],[3,4],[1,3]` by finish. Keep `[1,2]`, then `[2,3]` because equality is allowed, then `[3,4]`. Skip `[1,3]` because it starts before the last kept end 4. Keep 3 of 4, so remove 1.

## Time complexity

O(n log n) for sorting and O(n) for the greedy scan.

## Space complexity

O(n) for the shallow cloned sort array.

## Alternatives and tradeoffs

- If input is already sorted by end, the scan is O(n).
- A dynamic-programming solution is not needed for equal weights; weighted intervals require a different recurrence.
- Tie ordering among equal finish endpoints does not change the count under the given compatibility rule.

## Common mistakes and gotchas

- Sorting by start and greedily keeping the first interval.
- Using `start > lastEnd` and incorrectly removing touching ranges.
- Returning kept count instead of removals.
- Using this rule when each interval has a different profit or removal cost.
- Initializing `lastEnd` to zero and special-casing no first interval; negative endpoints in other variants make explicit initialization important.

## Edge-case tests

- All intervals compatible by touching.
- Identical intervals.
- Nested intervals with an early finish.
- One interval.
- Negative endpoints (supported by this implementation).

## Reflection questions

1. Why does earliest finish leave maximal room for future intervals?
2. Why can touching intervals be accepted here?
3. Why is removal count the complement of maximum kept count?
4. What changes if intervals have weights?

Source: [LeetCode: Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/).
