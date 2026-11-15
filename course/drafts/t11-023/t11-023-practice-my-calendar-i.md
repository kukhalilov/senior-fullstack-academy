# sweep-line events and active intervals — Problem: My Calendar I

## Goals
- Check an online booking against neighboring intervals in start order.
- Apply half-open overlap conditions correctly.
- Preserve state when a booking is rejected.

## Problem statement
Implement a calendar whose `Book(start,end)` method returns true and stores `[start,end)` only if it does not overlap any existing event. Otherwise return false and leave the calendar unchanged.

## Input constraints
- `0 <= start < end <= 1,000,000,000`.
- At most 1,000 booking calls.

## Examples with expected output
- `Book(10,20), Book(15,25), Book(20,30) -> true, false, true`.
- `Book(5,10), Book(0,5) -> true, true`.
- `Book(5,10), Book(5,8) -> true, false`.

## Clarifying assumptions
- Events are half-open; sharing an endpoint is not a nonempty intersection.
- A rejected booking must not alter previously accepted events.
- At most 1,000 calls makes a sorted list with O(n) insertion acceptable.

## Progressive hints
1. Two intervals overlap iff `newStart < oldEnd && oldStart < newEnd`.
2. If accepted intervals are sorted by start, only predecessor and successor can first overlap a new interval.
3. Binary-search the insertion position, check those neighbors, then insert only if safe.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class MyCalendar
{
    private readonly List<(int Start, int End)> bookings = new();

    public bool Book(int start, int end)
    {
        int low = 0, high = bookings.Count;
        while (low < high)
        {
            int middle = low + (high - low) / 2;
            if (bookings[middle].Start < start) low = middle + 1;
            else high = middle;
        }

        if (low > 0 && bookings[low - 1].End > start) return false;
        if (low < bookings.Count && end > bookings[low].Start) return false;
        bookings.Insert(low, (start, end));
        return true;
    }
}

static class Program
{
    static void Check(bool expected, bool actual)
    {
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        var calendar = new MyCalendar();
        Check(true, calendar.Book(10, 20));
        Check(false, calendar.Book(15, 25));
        Check(true, calendar.Book(20, 30));

        var adjacent = new MyCalendar();
        Check(true, adjacent.Book(5, 10));
        Check(true, adjacent.Book(0, 5));
        Check(false, adjacent.Book(5, 8));
        Check(true, adjacent.Book(10, 15));
        Console.WriteLine("My Calendar I checks passed.");
    }
}
```

## Correctness argument
Accepted intervals remain sorted and pairwise nonoverlapping. The lower-bound search finds the first existing start not less than the new start. Any earlier interval starts before the new one; among them, only the immediate predecessor can extend farthest to the right because the accepted intervals do not overlap. It conflicts exactly when its end is greater than the new start. The successor is the earliest later interval; it conflicts exactly when the new end is greater than its start. If neither condition holds, no other interval can overlap, so inserting at the lower-bound position preserves sorted order and nonoverlap. Rejection returns before mutation.

## Step-by-step dry run
After accepting `[10,20)`, try `[20,30)`. The insertion point is after the existing event; predecessor end 20 is not greater than start 20, so it is accepted. The shared endpoint is excluded by the first interval.

## Time complexity
O(log n) search plus O(n) list shifting for insertion; at most 1,000 calls.

## Space complexity
O(n) for accepted intervals.

## Alternatives and tradeoffs
- A balanced ordered map could provide O(log n) predecessor/successor and insertion, but standard .NET `SortedDictionary` does not expose efficient lower-bound operations directly.
- A sweep over every existing interval is O(n) per booking and simpler, also acceptable for this call bound.
- A segment tree is unnecessary for pairwise nonoverlap insertion.

## Common mistakes and gotchas

- Using `>=` in half-open overlap tests so adjacent intervals are rejected.
- Checking only one neighbor.
- Inserting before checking both conflicts, corrupting state on rejection.
- Assuming sorted intervals imply no need to test the predecessor.
- Mutating a rejected booking into the calendar.

## Edge-case tests

- Adjacent intervals on either side.
- Same start or same end conflict.
- New interval contains an existing interval.
- New interval is contained by an existing interval.
- Rejected insertion followed by a valid booking verifies state integrity.

## Reflection questions

1. Why are predecessor and successor sufficient?
2. How does half-open semantics change the comparison operators?
3. What data structure could improve insertion for a much larger number of calls?

## Source
- [My Calendar I](https://leetcode.com/problems/my-calendar-i/)
