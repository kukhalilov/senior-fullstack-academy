# greedy choices, invariants, and correctness proofs — Problem: Gas Station

## Goals
- Find a start index for one clockwise circuit, or report that none exists.
- Use total net fuel to test global feasibility.
- Discard a whole failed candidate segment with a prefix-sum argument.

## Problem statement
There are n stations on a circle. At station i, collect gas[i] units, then use cost[i] units to reach station (i+1) modulo n. Start with an empty tank at one station. Return a valid starting index if a full circuit is possible, otherwise return -1. The task guarantees the answer is unique when one exists.

## Input constraints

- gas and cost have equal length n, with 1 <= n <= 100,000.
- 0 <= gas[i], cost[i] <= 10,000.
- The input is generated so the answer is unique if feasible.

## Examples with expected output

- gas=[1,2,3,4,5], cost=[3,4,5,1,2] -> 3.
- gas=[2,3,4], cost=[3,4,3] -> -1.
- gas=[5], cost=[4] -> 0.

## Clarifying assumptions

- Fuel is collected before paying the cost to travel to the next station.
- The tank has no capacity limit.
- Starting fuel is zero; the route wraps from the final station to station zero.

## Progressive hints

1. Let net[i] = gas[i] - cost[i].
2. If the sum of all net values is negative, no start can work.
3. If a candidate start has a negative running sum at i, every start between that candidate and i is impossible too.
4. Start the next candidate at i+1 and reset the local tank.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static int CanCompleteCircuit(int[] gas, int[] cost)
    {
        if (gas.Length != cost.Length) throw new ArgumentException("Arrays must have equal length.");
        long total = 0;
        long tank = 0;
        int candidate = 0;

        for (int i = 0; i < gas.Length; i++)
        {
            long net = (long)gas[i] - cost[i];
            total += net;
            tank += net;
            if (tank < 0)
            {
                candidate = i + 1;
                tank = 0;
            }
        }

        return total >= 0 && candidate < gas.Length ? candidate : -1;
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(3, CanCompleteCircuit(new[] { 1, 2, 3, 4, 5 }, new[] { 3, 4, 5, 1, 2 }));
        Check(-1, CanCompleteCircuit(new[] { 2, 3, 4 }, new[] { 3, 4, 3 }));
        Check(0, CanCompleteCircuit(new[] { 5 }, new[] { 4 }));
        Check(0, CanCompleteCircuit(new[] { 2, 2 }, new[] { 1, 3 }));
        Check(-1, CanCompleteCircuit(Array.Empty<int>(), Array.Empty<int>()));
        Console.WriteLine("Gas Station checks passed.");
    }
}
```

## Correctness argument

If total net fuel is negative, a complete circuit would consume more fuel than all stations supply, so no start works. Otherwise, scan a candidate segment from candidate through i. The running tank is its prefix sum. If it becomes negative at i, starting at candidate fails. Any later start j in [candidate,i] also fails by i: its net sum through i equals the failed total from candidate through i minus the prefix from candidate through j-1; that earlier prefix is nonnegative because the candidate had not failed earlier, so the later start's sum is still negative. Thus all these starts can be discarded. Reset at i+1. If total is nonnegative, the remaining suffix start candidate can traverse the suffix and, after wrapping, the discarded prefix; the segment-prefix inequalities and total balance keep the tank nonnegative. The unique-answer guarantee makes this candidate the required answer.

## Step-by-step dry run

For gas [1,2,3,4,5] and cost [3,4,5,1,2], net values are [-2,-2,-2,3,3]. Candidate 0 fails at index 0, so candidate becomes 1. It fails again at index 1, then at index 2, giving candidate 3. From there the running balances are 3 then 6; total net is nonnegative, so index 3 completes the circuit.

## Time complexity

O(n) time, one pass.

## Space complexity

O(1) auxiliary space; long accumulators avoid overflow if constraints are later widened.

## Alternatives and tradeoffs

- Prefix sums plus a minimum-prefix rotation can find a valid start, with O(n) time and O(n) extra space.
- Brute-force simulation from every station costs O(n²) and is useful only as a tiny-input oracle.
- A two-pointer circular-window solution is another linear technique but uses a different invariant.

## Common mistakes and gotchas

- Checking only the local segment and forgetting the necessary global total.
- Resetting candidate to i rather than i+1 after failure.
- Keeping a negative tank across a candidate reset.
- Using the proof without the circular wraparound and nonnegative-total argument.
- Returning a candidate equal to n when every route fails.

## Edge-case tests

- One station with enough gas and one without enough.
- Total gas equals total cost.
- Total gas is smaller than total cost.
- A failed early segment followed by a feasible candidate that wraps.
- Empty defensive input returns -1.

## Reflection questions

1. Why does a negative total rule out every rotation?
2. Why does one failed start eliminate every index in its segment?
3. Where is the uniqueness guarantee used?

## Source

- [Gas Station](https://leetcode.com/problems/gas-station/)
