# sweep-line events and active intervals — Problem: The Skyline Problem

## Goals
- Convert building edges into grouped x-coordinate events.
- Maintain the multiset of active heights, including duplicates.
- Emit only points where the visible maximum changes.

## Problem statement
Given grounded rectangular buildings `[left,right,height]`, return the skyline as key points `[x,height]` in increasing x order. Do not emit consecutive horizontal segments with the same height; include the final transition to height zero.

## Input constraints
- `1 <= buildings.Length <= 10,000`.
- `0 <= left < right <= 2^31-1`.
- `1 <= height <= 2^31-1`.
- Buildings are sorted by left coordinate in nondecreasing order.

## Examples with expected output
- `[[2,9,10],[3,7,15],[5,12,12],[15,20,10],[19,24,8]] -> [[2,10],[3,15],[7,12],[12,0],[15,10],[20,8],[24,0]]`.
- `[[0,2,3],[2,5,3]] -> [[0,3],[5,0]]`.
- `[[1,3,4]] -> [[1,4],[3,0]]`.

## Clarifying assumptions
- Building x-intervals are half-open `[left,right)`.
- At any x after applying all edges at x, visible height is the maximum active building height or 0.
- Equal-height touching buildings make one continuous skyline segment.

## Progressive hints
1. A key point is needed only when the maximum active height changes.
2. Add a building at its left edge and remove it at its right edge; group all events with equal x.
3. Maintain active counts by height and a max-priority queue with lazy removal.
4. After all changes at x, discard heap tops whose height has no active building; compare the remaining maximum with the previous skyline height.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    private readonly record struct Event(int X, int Height, bool IsStart);

    static IList<IList<int>> GetSkyline(int[][] buildings)
    {
        var events = new List<Event>(buildings.Length * 2);
        foreach (int[] building in buildings)
        {
            events.Add(new Event(building[0], building[2], true));
            events.Add(new Event(building[1], building[2], false));
        }
        events.Sort((a, b) => a.X.CompareTo(b.X));

        var activeCount = new Dictionary<int, int>();
        var maxHeap = new PriorityQueue<int, int>(Comparer<int>.Create((a, b) => b.CompareTo(a)));
        var skyline = new List<IList<int>>();
        int previousHeight = 0;

        for (int i = 0; i < events.Count;)
        {
            int x = events[i].X;
            int end = i;
            while (end < events.Count && events[end].X == x) end++;

            for (int j = i; j < end; j++)
            {
                Event e = events[j];
                if (!e.IsStart)
                {
                    int remaining = activeCount[e.Height] - 1;
                    if (remaining == 0) activeCount.Remove(e.Height);
                    else activeCount[e.Height] = remaining;
                }
            }
            for (int j = i; j < end; j++)
            {
                Event e = events[j];
                if (e.IsStart)
                {
                    activeCount[e.Height] = activeCount.GetValueOrDefault(e.Height) + 1;
                    maxHeap.Enqueue(e.Height, e.Height);
                }
            }

            while (maxHeap.Count > 0 && activeCount.GetValueOrDefault(maxHeap.Peek()) == 0)
                maxHeap.Dequeue();
            int currentHeight = maxHeap.Count == 0 ? 0 : maxHeap.Peek();
            if (currentHeight != previousHeight)
            {
                skyline.Add(new List<int> { x, currentHeight });
                previousHeight = currentHeight;
            }
            i = end;
        }
        return skyline;
    }

    static string Normalize(IEnumerable<IList<int>> points) =>
        string.Join("|", points.Select(p => string.Join(',', p)));

    static void Check(string expected, int[][] buildings)
    {
        string actual = Normalize(GetSkyline(buildings));
        if (!StringComparer.Ordinal.Equals(expected, actual))
            throw new InvalidOperationException($"Expected '{expected}', got '{actual}'.");
    }

    static void Main()
    {
        Check("2,10|3,15|7,12|12,0|15,10|20,8|24,0", new[] { new[] { 2, 9, 10 }, new[] { 3, 7, 15 }, new[] { 5, 12, 12 }, new[] { 15, 20, 10 }, new[] { 19, 24, 8 } });
        Check("0,3|5,0", new[] { new[] { 0, 2, 3 }, new[] { 2, 5, 3 } });
        Check("1,4|3,0", new[] { new[] { 1, 3, 4 } });
        Check("0,5|2,0", new[] { new[] { 0, 2, 5 }, new[] { 0, 2, 5 } });
        Check("0,2|1,4|2,2|3,0", new[] { new[] { 0, 3, 2 }, new[] { 1, 2, 4 } });
        Console.WriteLine("Skyline checks passed.");
    }
}
```

## Correctness argument
At coordinate x, all buildings ending there are removed and all buildings starting there are added before measuring height, matching half-open intervals on the segment immediately to the right. `activeCount` records the number of active buildings at each height. Every start adds one heap entry; ended entries are removed lazily when they reach the top and their active count is zero. Therefore, after cleanup, the heap top is the greatest height with at least one active building, or zero if none remain. A point is emitted exactly when this maximum differs from the previous segment's height. Grouping equal-x events avoids transient points, and the final right edge returns the height to zero.

## Step-by-step dry run
For `[0,2,3]` and `[2,5,3]`, x=0 adds height 3 and emits `[0,3]`. At x=2, the first building ends and the second starts; active count at height 3 remains one, so no point is emitted. At x=5 the last count becomes zero, the heap is cleaned, and `[5,0]` is emitted.

## Time complexity
O(n log n): sort 2n events, with each building inserted once into the heap and each heap entry removed at most once.

## Space complexity
O(n) for events, active counts, heap entries, and output.

## Alternatives and tradeoffs
- A multiset that supports max and deletion can remove ended heights eagerly, but .NET has no built-in multiset collection.
- A segment tree over compressed y-coordinates is appropriate for union coverage length, a different query from maximum skyline height.
- Scanning every active building at each event is O(n²) in the worst case.

## Common mistakes and gotchas

- Processing one event at a time at equal x and emitting a temporary height change.
- Using a set of heights and losing multiplicity when same-height buildings overlap.
- Removing a height from the active set when only one of several same-height buildings ends.
- Leaving stale heap tops without checking active counts.
- Emitting redundant key points with unchanged height or forgetting the final height-zero point.

## Edge-case tests

- Same-height buildings that touch.
- Identical overlapping buildings (multiplicity).
- Nested buildings where a lower one remains after a taller one ends.
- Disjoint buildings and ground gaps.
- Right edge at the maximum allowed coordinate.

## Reflection questions

1. Why does the active height structure need multiplicities?
2. Why are events grouped by x before emitting a key point?
3. How does lazy deletion keep heap operations logarithmic in total?

## Source
- [The Skyline Problem](https://leetcode.com/problems/the-skyline-problem/)
