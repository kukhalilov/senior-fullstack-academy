# sweep-line events and active intervals — Problem: My Calendar III

## Goals
- Maintain endpoint deltas for half-open bookings.
- Recompute peak overlap after each online insertion.
- Explain why equal-coordinate deltas are combined before measuring active state.

## Problem statement
Implement `Book(start,end)`. After adding each half-open event `[start,end)`, return the largest number of events that overlap at any time among all bookings so far.

## Input constraints
- `0 <= start < end <= 1,000,000,000`.
- At most 400 calls to `Book`.

## Examples with expected output
- Book `[10,20)`, `[50,60)`, `[10,40)`, `[5,15)`, `[5,10)`, `[25,55)` -> `1,1,2,3,3,3`.
- Book `[1,3)`, `[3,5)` -> `1,1`.

## Clarifying assumptions
- Endpoints are half-open; touching events do not overlap.
- Bookings are all accepted; there is no rejection behavior.
- Return the maximum concurrency after each call, not the number of current events.

## Progressive hints
1. Add +1 at start and -1 at end.
2. Sort coordinates and prefix-sum deltas to compute overlap on each following segment.
3. The constraints allow rescanning at most 800 event coordinates after every booking.
4. Combine deltas at equal coordinates; this avoids counting an ending and starting event as simultaneous.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class MyCalendarThree
{
    private readonly SortedDictionary<int, int> delta = new();

    public int Book(int start, int end)
    {
        delta[start] = delta.GetValueOrDefault(start) + 1;
        delta[end] = delta.GetValueOrDefault(end) - 1;

        int active = 0, maximum = 0;
        foreach (int change in delta.Values)
        {
            active += change;
            maximum = Math.Max(maximum, active);
        }
        return maximum;
    }
}

static class Program
{
    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        var calendar = new MyCalendarThree();
        Check(1, calendar.Book(10, 20));
        Check(1, calendar.Book(50, 60));
        Check(2, calendar.Book(10, 40));
        Check(3, calendar.Book(5, 15));
        Check(3, calendar.Book(5, 10));
        Check(3, calendar.Book(25, 55));

        var adjacent = new MyCalendarThree();
        Check(1, adjacent.Book(1, 3));
        Check(1, adjacent.Book(3, 5));
        Console.WriteLine("My Calendar III checks passed.");
    }
}
```

## Correctness argument
Each half-open booking adds one active event at its start and removes one at its end. For each sorted coordinate x, the cumulative delta after x equals the number of bookings active on the segment immediately to the right of x. Thus the maximum prefix sum over coordinates is the maximum simultaneous booking count. Equal starts and ends are aggregated in one delta, so an interval ending at x does not overlap one starting at x. Recomputing this prefix maximum after every booking returns the required historical maximum.

## Step-by-step dry run
Book `[1,3)` and `[3,5)`: deltas are +1 at 1, net 0 at 3, and -1 at 5. Prefix counts are 1, 1, 0; the maximum remains 1.

## Time complexity
For q bookings, at most 2q distinct event coordinates exist. Each call updates a sorted map in O(log q) and scans O(q) deltas; over m calls, O(m²) total scan work, acceptable for m<=400.

## Space complexity
O(q) event coordinates after q bookings.

## Alternatives and tradeoffs
- A dynamic segment tree over `[0,10^9]` can support range-add and global-maximum queries in O(log C) per booking, where C is coordinate range, but requires careful sparse-node invariants.
- A compressed segment tree is not directly available online unless all future coordinates are known.
- The sorted-delta scan is simpler and fits the small call limit.

## Common mistakes and gotchas

- Returning the current active count rather than the maximum ever observed.
- Processing same-coordinate starts before ends as separate measured states.
- Treating the interval as closed and counting adjacent events together.
- Forgetting to retain an endpoint whose net delta becomes zero; keeping it is harmless but can grow the map to at most 2q keys.

## Edge-case tests

- Adjacent events.
- Nested bookings.
- Several starts and ends at one coordinate.
- No overlap and full overlap.
- Repeated endpoints whose deltas cancel.

## Reflection questions

1. What does the prefix sum mean after an endpoint coordinate?
2. Why is it safe to combine same-coordinate events?
3. What data structure improves repeated rescans for far more calls?

## Source
- [My Calendar III](https://leetcode.com/problems/my-calendar-iii/)
