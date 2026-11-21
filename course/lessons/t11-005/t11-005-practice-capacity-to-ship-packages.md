# binary search, bounds, rotated arrays, and monotone answers — Problem: Capacity To Ship Packages Within D Days

## Goals

- Search for the minimum ship capacity that can meet an ordered shipping deadline.
- Build a greedy feasibility check that preserves package order.
- Derive a lower bound and feasible upper bound from the input.

## Problem statement

Packages on a conveyor belt must ship in the given order. Each day, load a contiguous next sequence of packages without exceeding the ship's weight capacity. Return the least capacity that ships all packages within days.

## Input constraints

- 1 <= days <= weights.Length <= 50,000.
- 1 <= weights[i] <= 500.
- Package order must be preserved; a package cannot be split.

## Examples with expected output

1. weights = [1,2,3,4,5,6,7,8,9,10], days = 5 -> 15.
2. weights = [3,2,2,4,1,4], days = 3 -> 6.
3. weights = [1,2,3,1,1], days = 4 -> 3.
4. weights = [5,1,2], days = 3 -> 5.

## Clarifying assumptions

- A day can carry one or more consecutive packages; packages stay in the input order.
- Lower capacity is at least the heaviest package, since no package can be split.
- Sum of all weights is a feasible upper bound because all packages can be shipped in one day, and days >= 1.
- Use long for capacity and running-load arithmetic even though the given maximum sum fits in int.

## Progressive hints

1. For a candidate capacity, simulate loading packages greedily in order.
2. When the next package would exceed capacity, start a new day with that package.
3. If capacity C works, any larger capacity works too; search for the first feasible capacity.
4. Set bounds to max package and total weight, then use lower-bound binary search.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    private static bool CanShip(int[] weights, int days, long capacity)
    {
        int usedDays = 1;
        long load = 0;
        foreach (int weight in weights)
        {
            if (load + weight > capacity)
            {
                usedDays++;
                load = weight;
                if (usedDays > days) return false;
            }
            else
            {
                load += weight;
            }
        }
        return true;
    }

    public static int ShipWithinDays(int[] weights, int days)
    {
        if (weights is null) throw new ArgumentNullException(nameof(weights));
        if (weights.Length == 0) throw new ArgumentException("At least one package is required.", nameof(weights));

        long left = 0;
        long right = 0;
        foreach (int weight in weights)
        {
            if (weight <= 0) throw new ArgumentException("Weights must be positive.", nameof(weights));
            left = Math.Max(left, weight);
            right += weight;
        }
        if (days < 1 || days > weights.Length)
            throw new ArgumentOutOfRangeException(nameof(days));

        while (left < right)
        {
            long mid = left + (right - left) / 2;
            if (CanShip(weights, days, mid)) right = mid;
            else left = mid + 1;
        }
        return checked((int)left);
    }

    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(ShipWithinDays(new[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 }, 5), 15, "Example 1");
        AssertEqual(ShipWithinDays(new[] { 3, 2, 2, 4, 1, 4 }, 3), 6, "Example 2");
        AssertEqual(ShipWithinDays(new[] { 1, 2, 3, 1, 1 }, 4), 3, "Example 3");
        AssertEqual(ShipWithinDays(new[] { 5, 1, 2 }, 3), 5, "One package per day");
        Console.WriteLine("All Capacity To Ship Packages Within D Days checks passed.");
    }
}
```

## Correctness argument

For a fixed capacity, greedily take the longest next contiguous prefix that fits each day. This uses the fewest days for that capacity: ending a day earlier cannot make any later package ship sooner because order is fixed and the next day's capacity is unchanged. If the greedy simulation uses at most days, the capacity is feasible. Feasibility is monotone because increasing capacity never makes a previously fitting daily load invalid.

Capacity below the heaviest package is impossible. Total weight is feasible in one day and therefore within any valid days count. Lower-bound binary search over these bounds returns the smallest feasible capacity. The simulation's day count cannot understate required days, and early failure after exceeding the allowed count is safe.

## Step-by-step dry run

For weights `[1,2,3,4,5,6,7,8,9,10]`, days=5, capacity 15 greedily loads `[1,2,3,4,5]`, `[6,7]`, `[8]`, `[9]`, `[10]`, so it is feasible. Capacity 14 needs more than five days. Binary search narrows between max item 10 and total 55 until 15 is the first feasible value.

## Time complexity

O(n log S), where S is total weight; each feasibility check scans packages once.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- Testing every integer capacity in the range can cost O(nS).
- A direct greedy simulation answers one fixed capacity in O(n), but the problem asks for the minimum capacity, so search is needed.
- Dynamic programming is unnecessary because the greedy check is optimal under ordered, contiguous daily loads.

## Common mistakes and gotchas

- Reordering packages to fill capacity better; the problem requires conveyor order.
- Splitting one package across days.
- Choosing lower bound as the average weight without accounting for a heavier indivisible package.
- Failing to count the first day or starting with zero used days.
- Searching beyond total weight without reason or using an infeasible upper bound.
- Reporting O(log S) while each check scans n packages.

## Edge-case tests

- days equals number of packages.
- days equals one.
- A single package is the largest item.
- Many packages exactly fill a capacity.
- The capacity threshold changes day count by one.

## Reflection questions

1. Why is max(weights) a lower bound?
2. Why is sum(weights) feasible?
3. Why does greedily taking the longest fitting prefix minimize days for a fixed capacity?
4. Why is feasibility monotone in capacity?

Source: [LeetCode: Capacity To Ship Packages Within D Days](https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/).
