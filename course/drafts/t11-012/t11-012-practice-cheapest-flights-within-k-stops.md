# weighted shortest paths and distance relaxation — Problem: Cheapest Flights Within K Stops

## Goals

- Apply bounded Bellman-Ford relaxation.
- Translate k stops into at most k+1 flight edges.
- Use a snapshot per pass so one round cannot chain several edges.

## Problem statement

Find the cheapest directed route from src to dst using at most k intermediate stops, or return -1 if no such route exists.

## Input constraints

- 2 <= n <= 100.
- 0 <= flights.Length <= n(n-1)/2.
- Prices are 1..10,000; no multiple flights between an ordered city pair.
- 0 <= src,dst,k < n and src != dst.

## Examples with expected output

1. n=4, flights=[[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src=0,dst=3,k=1 -> 700.
2. n=3, flights=[[0,1,100],[1,2,100],[0,2,500]], src=0,dst=2,k=1 -> 200.
3. Same graph, k=0 -> 500.
4. 0->1 cost 10, 1->2 cost 10, k=0, src=0,dst=2 -> -1.

## Clarifying assumptions

- A stop is an intermediate city; k stops permit k+1 edges.
- Edges are directed.
- Prices are nonnegative, but this problem imposes an edge-count bound; layered relaxation makes that bound explicit.

## Progressive hints

1. A route with at most k stops uses at most k+1 flights.
2. Each relaxation pass adds at most one edge.
3. Read from the prior pass and write to a copied distance array.
4. The answer is the best destination cost after at most k+1 passes.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int FindCheapestPrice(int n, int[][] flights, int src, int dst, int k)
    {
        if (flights is null) throw new ArgumentNullException(nameof(flights));
        if (n <= 0 || src < 0 || src >= n || dst < 0 || dst >= n || k < 0)
            throw new ArgumentOutOfRangeException(nameof(n));
        const long Infinity = long.MaxValue / 4;
        var distance = new long[n];
        Array.Fill(distance, Infinity);
        distance[src] = 0;

        for (int edgesAllowed = 1; edgesAllowed <= k + 1; edgesAllowed++)
        {
            long[] next = (long[])distance.Clone();
            bool changed = false;
            foreach (int[] flight in flights)
            {
                if (flight is null || flight.Length != 3 || flight[0] < 0 || flight[0] >= n || flight[1] < 0 || flight[1] >= n || flight[2] < 0)
                    throw new ArgumentException("Invalid flight.", nameof(flights));
                if (distance[flight[0]] == Infinity) continue;
                long candidate = distance[flight[0]] + flight[2];
                if (candidate >= next[flight[1]]) continue;
                next[flight[1]] = candidate;
                changed = true;
            }
            distance = next;
            if (!changed) break;
        }
        return distance[dst] == Infinity ? -1 : checked((int)distance[dst]);
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(FindCheapestPrice(4, new[] { new[] { 0, 1, 100 }, new[] { 1, 2, 100 }, new[] { 2, 0, 100 }, new[] { 1, 3, 600 }, new[] { 2, 3, 200 } }, 0, 3, 1), 700, "Example 1");
        Equal(FindCheapestPrice(3, new[] { new[] { 0, 1, 100 }, new[] { 1, 2, 100 }, new[] { 0, 2, 500 } }, 0, 2, 1), 200, "Example 2");
        Equal(FindCheapestPrice(3, new[] { new[] { 0, 1, 100 }, new[] { 1, 2, 100 }, new[] { 0, 2, 500 } }, 0, 2, 0), 500, "zero stops");
        Equal(FindCheapestPrice(3, new[] { new[] { 0, 1, 10 }, new[] { 1, 2, 10 } }, 0, 2, 0), -1, "one-edge bound");
        Console.WriteLine("All Bounded Flights checks passed.");
    }
}
```

## Correctness argument

Before pass j, distance[v] is the cheapest route to v using at most j-1 edges. The copied next array initially preserves these routes. Each edge candidate extends a prior-pass route by exactly one edge, so after the pass next contains the best routes using at most j edges. Induction proves that after k+1 passes, distance[dst] is optimal among routes with at most k+1 flights, equivalent to at most k stops. Infinity is never extended.

## Step-by-step dry run

With k=1, two passes are allowed. Pass one records 0->1 at 100 and direct 0->3 only if present. Pass two can extend 0->1 through one more flight. An update from city 1 in pass one is not reused within that same pass, so a two-flight route cannot slip into the one-edge layer.

## Time complexity

O((k+1)E); early stopping can reduce work.

## Space complexity

O(V) for two distance arrays.

## Alternatives and tradeoffs

- A priority queue with vertex and edge-count state can solve constrained paths, but the state and pruning proof are more involved.
- Ordinary Dijkstra keyed only by vertex can discard a route with fewer stops that is necessary for a feasible continuation.

## Common mistakes and gotchas

- Using k passes instead of k+1.
- Updating the same distance array in place and allowing multiple flights in one pass.
- Treating stops as edges.
- Omitting the direct-flight option for k=0.
- Adding from unreachable states.

## Edge-case tests

- Zero allowed stops.
- Direct route plus a cheaper route exceeding the stop limit.
- No route within the limit.
- A route exactly at the maximum number of edges.
- Source and destination validation.

## Reflection questions

1. How many edges correspond to k stops?
2. Why clone distances each pass?
3. What is the pass invariant?
4. Why can Dijkstra keyed only by node fail with a stop bound?

Source: [LeetCode: Cheapest Flights Within K Stops](https://leetcode.com/problems/cheapest-flights-within-k-stops/).
