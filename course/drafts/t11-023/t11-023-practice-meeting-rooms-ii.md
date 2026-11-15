# sweep-line events and active intervals — Problem: Meeting Rooms II

## Goals
- Find peak simultaneous overlap for half-open meeting intervals.
- Use a min-heap to release rooms before a new start.
- Prove the peak overlap is both necessary and sufficient.

## Problem statement
Given meeting intervals `[start,end)`, return the minimum number of conference rooms needed so every meeting can be scheduled without overlap.

## Input constraints
- `1 <= intervals.Length <= 10,000`.
- `0 <= start < end <= 1,000,000`.
- Touching meetings may share a room because the intervals are half-open.

## Examples with expected output
- `[[0,30],[5,10],[15,20]] -> 2`.
- `[[7,10],[2,4]] -> 1`.
- `[[1,3],[3,5]] -> 1`.

## Clarifying assumptions
- Intervals are half-open: a meeting ending at t does not occupy a room for a meeting starting at t.
- Return only the minimum room count; no room assignment is requested.
- Input order is arbitrary and is not modified by this implementation.

## Progressive hints
1. At least as many rooms as the maximum number of concurrent meetings are necessary.
2. Sort by start time and store end times of meetings currently using rooms.
3. Before a new start s, pop all end times `<=s`.
4. Add the new end and track the largest heap size. Releasing only one ended meeting is insufficient if several have ended during a gap.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static int MinMeetingRooms(int[][] intervals)
    {
        var sorted = intervals.OrderBy(x => x[0]).ToArray();
        var activeEnds = new PriorityQueue<int, int>();
        int peak = 0;
        foreach (int[] interval in sorted)
        {
            int start = interval[0], end = interval[1];
            while (activeEnds.Count > 0 && activeEnds.Peek() <= start)
                activeEnds.Dequeue();
            activeEnds.Enqueue(end, end);
            peak = Math.Max(peak, activeEnds.Count);
        }
        return peak;
    }

    static void Check(int expected, int[][] intervals)
    {
        int actual = MinMeetingRooms(intervals);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(2, new[] { new[] { 0, 30 }, new[] { 5, 10 }, new[] { 15, 20 } });
        Check(1, new[] { new[] { 7, 10 }, new[] { 2, 4 } });
        Check(1, new[] { new[] { 1, 3 }, new[] { 3, 5 } });
        Check(3, new[] { new[] { 1, 5 }, new[] { 1, 5 }, new[] { 1, 5 } });
        Check(1, new[] { new[] { 0, 1 }, new[] { 10, 11 }, new[] { 20, 21 } });
        Console.WriteLine("Meeting Rooms II checks passed.");
    }
}
```

## Correctness argument
The heap contains exactly the end times of meetings active after allocating the current meeting. Removing all ends `<=start` releases every reusable room under half-open semantics. Every remaining heap item represents one meeting overlapping the new start, so a new room is needed and the new end is inserted. The heap size is therefore the number of rooms used by this allocation process; its maximum is the maximum concurrency. Any schedule needs at least that many rooms at a peak-overlap time, while the heap process successfully assigns one room per concurrent meeting and reuses rooms after they end. Thus the peak is the minimum sufficient count.

## Step-by-step dry run
For `[[0,30],[5,10],[15,20]]`, insert end 30 (size 1). At 5, 30 remains; insert 10 (size 2). At 15, pop 10 because `10<=15`, retain 30, then insert 20 (size 2). Peak is 2.

## Time complexity
O(n log n): sorting costs O(n log n), and each heap insertion/removal costs O(log n).

## Space complexity
O(n) for the sorted copy and active end-time heap.

## Alternatives and tradeoffs
- Sort start and end arrays separately; advance the end pointer before a start when `end<=start`, tracking active count. This needs O(n) arrays and directly computes concurrency.
- Create +1/-1 events and group coordinates; O(n log n) after sorting and explicit tie semantics.
- A raw-coordinate difference array is inappropriate if the coordinate range is large or sparse.

## Common mistakes and gotchas

- Popping only one expired meeting; several may have ended before the next start.
- Using `< start`, which incorrectly treats touching half-open meetings as overlapping.
- Treating intervals as closed when the problem's scheduling semantics are half-open.
- Claiming a heap assignment is necessary when only peak count is needed; separate sorted arrays also solve it.
- Modifying the input during sorting when callers may rely on it.

## Edge-case tests

- All meetings overlap.
- No meetings overlap.
- End equals the next start.
- Several rooms become free during a long gap.
- Identical meeting intervals.

## Reflection questions

1. Why is peak overlap a lower bound on rooms?
2. What construction shows peak overlap is sufficient?
3. Why must all expired heap entries be removed?

## Source
- [Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii/)
- [LeetCode Wiki statement and constraints](https://leetcode.doocs.org/en/lc/253/)
