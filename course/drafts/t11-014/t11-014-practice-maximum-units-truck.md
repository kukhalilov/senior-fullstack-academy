# greedy choices, invariants, and correctness proofs — Problem: Maximum Units on a Truck

## Goals
- Maximize total units when the truck has a box-count capacity.
- Sort box types by units per box and take the most valuable available boxes first.
- Distinguish this divisible-by-individual-boxes setting from 0/1 knapsack.

## Problem statement
Each box type is described by [numberOfBoxes, unitsPerBox]. Load at most truckSize boxes, choosing any number from each type, and return the maximum total units.

## Input constraints

- 1 <= boxTypes.Length <= 1,000.
- Each numberOfBoxes and unitsPerBox is between 1 and 1,000.
- 1 <= truckSize <= 1,000,000.

## Examples with expected output

- boxTypes=[[1,3],[2,2],[3,1]], truckSize=4 -> 8.
- boxTypes=[[5,10],[2,5],[4,7],[3,9]], truckSize=10 -> 91.
- boxTypes=[[2,4]], truckSize=1 -> 4.

## Clarifying assumptions

- Boxes from one type are interchangeable and can be selected individually.
- The capacity counts boxes, not weight.
- The result fits in Int32 under the supplied constraints (at most 1,000,000 boxes times 1,000 units).
- The input rows are not mutated.

## Progressive hints

1. Each box consumes one identical unit of capacity.
2. Compare types by units obtained per box.
3. Take as many boxes as possible from the highest-value type before moving lower.
4. Stop when capacity is filled.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Linq;

static class Program
{
    static int MaximumUnits(int[][] boxTypes, int truckSize)
    {
        int[][] ordered = boxTypes.Select(row => (int[])row.Clone()).ToArray();
        Array.Sort(ordered, (a, b) => b[1].CompareTo(a[1]));

        int remaining = truckSize;
        int units = 0;
        foreach (int[] type in ordered)
        {
            int take = Math.Min(remaining, type[0]);
            units += take * type[1];
            remaining -= take;
            if (remaining == 0) break;
        }
        return units;
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(8, MaximumUnits(new[] { new[] { 1, 3 }, new[] { 2, 2 }, new[] { 3, 1 } }, 4));
        Check(91, MaximumUnits(new[] { new[] { 5, 10 }, new[] { 2, 5 }, new[] { 4, 7 }, new[] { 3, 9 } }, 10));
        Check(4, MaximumUnits(new[] { new[] { 2, 4 } }, 1));
        Check(0, MaximumUnits(new[] { new[] { 1, 9 } }, 0));
        Console.WriteLine("Maximum Units checks passed.");
    }
}
```

## Correctness argument

Sort box types by units per box descending. Consider any feasible loading that uses a lower-value box while a higher-value box remains available and capacity is not full. Replacing the lower-value box with the higher-value box keeps the number of loaded boxes unchanged and does not reduce total units. Repeating these exchanges yields a loading that takes the maximum available quantity from each type in sorted order until capacity is full. The algorithm constructs exactly that loading, so it is optimal. Ties have equal objective contribution and either order is safe.

## Step-by-step dry run

For [[1,3],[2,2],[3,1]] and capacity 4, sort by units: 3, then 2, then 1. Take the one 3-unit box, then both 2-unit boxes; one slot remains, so take one 1-unit box. Total is 3+4+1=8.

## Time complexity

O(t log t) for t box types, then O(t) scan.

## Space complexity

O(t) for cloned rows and sorting.

## Alternatives and tradeoffs

- A max-heap selects the next highest-value type in O(log t) per extraction; sorting is simpler when all types are known upfront.
- A counting array can replace comparison sorting when units per box lie in a small bounded range.
- General 0/1 knapsack does not permit this simple density/value greedy rule because items may consume different capacities and are indivisible.

## Common mistakes and gotchas

- Sorting by number of boxes instead of units per box.
- Taking an entire type when only part fits in the remaining capacity.
- Applying ratio-based fractional-knapsack reasoning to a different problem where indivisible items consume unequal capacities.
- Mutating caller rows during sorting when input preservation matters.
- Using a comparator based on subtraction, which can overflow for unconstrained integers; CompareTo avoids that risk.

## Edge-case tests

- Capacity smaller than the first type's available count.
- Capacity larger than all available boxes.
- Several types tied on units per box.
- Maximum values produce a total within the stated Int32 bound.
- Defensive zero capacity returns zero.

## Reflection questions

1. Which property makes the exchange argument especially simple here?
2. Why does the same proof not apply to 0/1 knapsack?
3. Would a tie-break by box count affect the optimum?

## Source

- [Maximum Units on a Truck](https://leetcode.com/problems/maximum-units-on-a-truck/)
