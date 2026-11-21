# prefix sums, difference arrays, and static range queries — Problem: Corporate Flight Bookings

## Goals

- Translate one-based inclusive booking ranges into zero-based difference boundaries.
- Apply many interval increments in constant time each, then reconstruct once.
- Handle a cancellation marker just after the final flight safely.

## Problem statement

There are n flights labeled 1 through n. Each booking is `[first,last,seats]` and reserves `seats` seats on every flight from first through last, inclusive. Return an array answer where answer[i] is the total seats reserved on flight i+1.

## Input constraints

- 1 <= n <= 20,000.
- 1 <= bookings.Length <= 20,000.
- Each booking has exactly three integers.
- 1 <= first <= last <= n.
- 1 <= seats <= 10,000.

## Examples with expected output

1. bookings = [[1,2,10],[2,3,20],[2,5,25]], n = 5 -> [10,55,45,25,25].
2. bookings = [[1,2,10],[2,2,15]], n = 2 -> [10,25].
3. bookings = [[3,3,7]], n = 4 -> [0,0,7,0].

## Clarifying assumptions

- Input flight labels are one-based inclusive; output array indices are zero-based.
- Updates are all known before final answers are requested, so offline processing is permitted.
- The returned array contains n entries; it is a separate result.
- Long markers and running totals avoid overflow in generalized constraints; the stated totals fit int, and conversion is checked.

## Progressive hints

1. A direct update writes seats to every flight in each booking; many overlapping ranges repeat work.
2. Convert `[first,last]` into zero-based half-open boundaries `[first-1,last)`.
3. Add seats at the first boundary and subtract seats at the exclusive end boundary.
4. Prefix-sum the markers once to reconstruct each flight's total.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int[] CorpFlightBookings(int[][] bookings, int n)
    {
        if (bookings is null) throw new ArgumentNullException(nameof(bookings));
        if (n < 0) throw new ArgumentOutOfRangeException(nameof(n));

        var difference = new long[n + 1];
        foreach (int[] booking in bookings)
        {
            if (booking is null || booking.Length != 3)
                throw new ArgumentException("Each booking must have three values.", nameof(bookings));
            int first = booking[0];
            int last = booking[1];
            int seats = booking[2];
            if (first < 1 || last < first || last > n || seats < 0)
                throw new ArgumentException("Booking range or seat count is invalid.", nameof(bookings));

            difference[first - 1] += seats;
            difference[last] -= seats;
        }

        var answer = new int[n];
        long current = 0;
        for (int i = 0; i < n; i++)
        {
            current += difference[i];
            answer[i] = checked((int)current);
        }
        return answer;
    }

    private static void AssertSequence(int[] actual, int[] expected, string label)
    {
        if (actual.Length != expected.Length) throw new InvalidOperationException(label + " length failed.");
        for (int i = 0; i < expected.Length; i++)
            if (actual[i] != expected[i]) throw new InvalidOperationException(label + " value failed.");
    }

    public static void Main()
    {
        AssertSequence(CorpFlightBookings(new[]
        {
            new[] { 1, 2, 10 }, new[] { 2, 3, 20 }, new[] { 2, 5, 25 }
        }, 5), new[] { 10, 55, 45, 25, 25 }, "Example 1");
        AssertSequence(CorpFlightBookings(new[]
        {
            new[] { 1, 2, 10 }, new[] { 2, 2, 15 }
        }, 2), new[] { 10, 25 }, "Example 2");
        AssertSequence(CorpFlightBookings(new[] { new[] { 3, 3, 7 } }, 4), new[] { 0, 0, 7, 0 }, "Single-flight range");
        Console.WriteLine("All Corporate Flight Bookings checks passed.");
    }
}
```

## Correctness argument

For a booking covering one-based flights first through last inclusive, the corresponding zero-based positions are `[first-1,last)`. Adding seats at `difference[first-1]` makes the running total include them starting at the first covered flight. Subtracting at `difference[last]` cancels them at the first uncovered boundary, so they do not affect later flights. Superposition allows independent booking markers to add together. During the final prefix scan, the running total at index i is exactly the sum of all bookings whose start boundary has passed and whose cancellation boundary has not; therefore it equals the seats booked for flight i+1.

The difference array has n+1 slots, so a booking ending at flight n safely records its cancellation at boundary n, after the last returned element.

## Step-by-step dry run

For n=5 and booking `[2,5,25]`, convert to `[1,5)`: mark +25 at index 1 and -25 at index 5. Prefix reconstruction adds 25 to flights 2, 3, 4, and 5; the sentinel cancellation is outside output. Other bookings contribute independently to the same running totals.

## Time complexity

O(b+n), where b is the number of bookings and n is the number of flights.

## Space complexity

O(n) for the difference array and result.

## Alternatives and tradeoffs

- Directly increment every covered flight costs O(sum of booking lengths), up to O(bn). It is easy to understand and useful as a small-input oracle.
- A Fenwick or segment tree supports online range updates and queries, but is unnecessary when all updates are known and only the final array is needed.
- A 1-based difference array is also possible; the chosen conversion to half-open zero-based boundaries keeps end cancellation at index last.

## Common mistakes and gotchas

- Subtracting at `last-1`; that cancels before the inclusive last flight.
- Forgetting to convert one-based flight labels to zero-based indices.
- Allocating only n markers and indexing n when a booking reaches the final flight.
- Prefixing only the bookings rather than the accumulated marker changes.
- Applying each booking directly to all flights and claiming O(b+n).
- Using the final cancellation slot as an output flight; it is a boundary, not a flight.

## Edge-case tests

- Booking covers one flight.
- Booking covers the first through last flight.
- Multiple bookings overlap fully or partially.
- Flights with no bookings remain zero.
- Cancellation occurs at the sentinel boundary n.

## Reflection questions

1. Why is the cancellation index `last` after conversion?
2. What does the running prefix represent at output index i?
3. Why can all booking effects be combined by addition?
4. When would a difference array stop being the right structure?

Source: [LeetCode: Corporate Flight Bookings](https://leetcode.com/problems/corporate-flight-bookings/).
