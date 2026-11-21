# sweep-line events and active intervals — Problem: Car Pooling

## Goals
- Represent pickups and drop-offs as signed passenger-count events.
- Process multiple events at one location without a false transient overload.
- Use the small coordinate bound for a direct difference array.

## Problem statement
Each trip is `[passengers, from, to]`. The car travels only east, boards at `from`, and drops off at `to`. Return whether passenger count ever exceeds capacity. Drop-offs happen before pickups at the same location.

## Input constraints
- `1 <= trips.Length <= 1,000`; each trip has three integers.
- `1 <= passengers <= 100`.
- `0 <= from < to <= 1,000`.
- `1 <= capacity <= 100,000`.

## Examples with expected output
- `[[2,1,5],[3,3,7]]`, capacity 4 -> `false`.
- `[[2,1,5],[3,3,7]]`, capacity 5 -> `true`.
- `[[2,1,5],[3,5,7]]`, capacity 3 -> `true`.

## Clarifying assumptions
- A trip occupies the half-open route segment `[from,to)`.
- At a shared location, passengers exit before other passengers board.
- Only capacity feasibility is required; passenger identities and seat assignments are not.

## Progressive hints
1. Passenger count changes only at pickup and drop-off locations.
2. Add passengers at `from`; subtract them at `to`.
3. Sum all changes at one coordinate before checking occupancy on the next segment.
4. The coordinate range 0..1000 makes a difference array simple; sorting event coordinates is more general.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static bool CarPooling(int[][] trips, int capacity)
    {
        int[] change = new int[1001];
        foreach (int[] trip in trips)
        {
            change[trip[1]] += trip[0];
            change[trip[2]] -= trip[0];
        }

        int passengers = 0;
        for (int location = 0; location < change.Length; location++)
        {
            passengers += change[location];
            if (passengers > capacity) return false;
        }
        return true;
    }

    static void Check(bool expected, int[][] trips, int capacity)
    {
        bool actual = CarPooling(trips, capacity);
        if (actual != expected) throw new InvalidOperationException("Car Pooling check failed.");
    }

    static void Main()
    {
        Check(false, new[] { new[] { 2, 1, 5 }, new[] { 3, 3, 7 } }, 4);
        Check(true, new[] { new[] { 2, 1, 5 }, new[] { 3, 3, 7 } }, 5);
        Check(true, new[] { new[] { 2, 1, 5 }, new[] { 3, 5, 7 } }, 3);
        Check(false, new[] { new[] { 3, 0, 2 }, new[] { 2, 2, 4 } }, 2);
        Check(true, new[] { new[] { 1, 0, 1000 } }, 1);
        Console.WriteLine("Car Pooling checks passed.");
    }
}
```

## Correctness argument
Each trip contributes +p at pickup and -p at drop-off, so the prefix sum after processing all changes at location x equals the number of passengers on the segment immediately east of x. Since passengers leave before new passengers enter at x, the aggregate delta produces the correct occupancy after both changes; no intermediate event order can create a false peak. The car is feasible exactly when every such occupancy is at most capacity.

## Step-by-step dry run
For trips `[2,1,5]` and `[3,5,7]`, changes are +2 at 1, -2 and +3 at 5, and -3 at 7. Occupancy rises to 2, falls/raises net to 3 at 5, then returns to zero. Capacity 3 is sufficient.

## Time complexity
O(T+R), where T is trip count and R=1001 is the fixed location range.

## Space complexity
O(R) for the difference array.

## Alternatives and tradeoffs
- Sort 2T events and group equal locations: O(T log T), independent of maximum coordinate.
- Use a map of coordinate deltas when coordinates are very sparse and unbounded.
- A raw coordinate array is appropriate here because the official bound is only 1000.

## Common mistakes and gotchas

- Processing starts before ends at the same location and checking a temporary over-capacity count.
- Subtracting passengers at `to-1`; the route ends at the half-open boundary `to`.
- Allocating the array too short to include endpoint 1000.
- Checking only trip endpoints in input order rather than sweeping coordinates.
- Returning false when occupancy equals capacity; the condition is “exceeds.”

## Edge-case tests

- Occupancy exactly equals capacity.
- One trip ending at the next trip's pickup location.
- Multiple pickups and drop-offs at one coordinate.
- Trip begins at zero or ends at maximum location 1000.
- Immediate failure when capacity is exceeded.

## Reflection questions

1. Why can same-coordinate changes be combined into one delta?
2. What does the prefix sum represent after coordinate x?
3. When would a sorted event list be preferable to the fixed array?

## Source
- [Car Pooling](https://leetcode.com/problems/car-pooling/)
