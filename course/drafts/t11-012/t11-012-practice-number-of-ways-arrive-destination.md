# weighted shortest paths and distance relaxation — Problem: Number of Ways to Arrive at Destination

## Goals

- Combine Dijkstra distances with shortest-path counts.
- Reset path counts on a strict distance improvement and add on ties.
- Use positive weights to justify processing order.

## Problem statement

In a connected undirected road network with positive travel times, return the number of distinct shortest-time paths from intersection 0 to n-1 modulo 1,000,000,007.

## Input constraints

- 1 <= n <= 200.
- n-1 <= roads.Length <= n(n-1)/2.
- 1 <= time <= 1,000,000,000.
- Roads are undirected, unique per pair, and the graph is connected.

## Examples with expected output

1. n=7 and the supplied road list -> 4 shortest routes.
2. n=2, roads=[[1,0,10]] -> 1.
3. n=3, roads=[[0,1,1],[1,2,1],[0,2,2]] -> 2.

## Clarifying assumptions

- All road times are strictly positive.
- Distinct paths are distinguished by their sequences of road choices.
- Long distances are needed because path sums may exceed Int32.

## Progressive hints

1. Run Dijkstra from intersection 0.
2. Track ways[v] alongside dist[v].
3. A shorter candidate replaces distance and ways; an equal candidate adds ways.
4. Positive edge weights ensure every shortest predecessor has smaller distance and is processed first.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    private const long Mod = 1_000_000_007;
    private const long Infinity = long.MaxValue / 4;

    public static int CountPaths(int n, int[][] roads)
    {
        if (roads is null) throw new ArgumentNullException(nameof(roads));
        if (n <= 0) throw new ArgumentOutOfRangeException(nameof(n));
        var graph = new List<(int To, int Time)>[n];
        for (int i = 0; i < n; i++) graph[i] = new List<(int, int)>();
        foreach (int[] road in roads)
        {
            if (road is null || road.Length != 3 || road[0] < 0 || road[0] >= n || road[1] < 0 || road[1] >= n || road[0] == road[1] || road[2] <= 0)
                throw new ArgumentException("Invalid positive-time road.", nameof(roads));
            graph[road[0]].Add((road[1], road[2]));
            graph[road[1]].Add((road[0], road[2]));
        }

        var distance = new long[n];
        Array.Fill(distance, Infinity);
        var ways = new long[n];
        distance[0] = 0;
        ways[0] = 1;
        var queue = new PriorityQueue<(int Node, long Distance), long>();
        queue.Enqueue((0, 0), 0);
        while (queue.TryDequeue(out var entry, out _))
        {
            int node = entry.Node;
            long currentDistance = entry.Distance;
            if (currentDistance != distance[node]) continue;
            foreach ((int next, int time) in graph[node])
            {
                long candidate = currentDistance + time;
                if (candidate < distance[next])
                {
                    distance[next] = candidate;
                    ways[next] = ways[node];
                    queue.Enqueue((next, candidate), candidate);
                }
                else if (candidate == distance[next])
                {
                    ways[next] = (ways[next] + ways[node]) % Mod;
                }
            }
        }
        return (int)ways[n - 1];
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(CountPaths(7, new[] {
            new[] { 0, 6, 7 }, new[] { 0, 1, 2 }, new[] { 1, 2, 3 }, new[] { 1, 3, 3 }, new[] { 6, 3, 3 },
            new[] { 3, 5, 1 }, new[] { 6, 5, 1 }, new[] { 2, 5, 1 }, new[] { 0, 4, 5 }, new[] { 4, 6, 2 }
        }), 4, "Example 1");
        Equal(CountPaths(2, new[] { new[] { 1, 0, 10 } }), 1, "Example 2");
        Equal(CountPaths(3, new[] { new[] { 0, 1, 1 }, new[] { 1, 2, 1 }, new[] { 0, 2, 2 } }), 2, "equal shortest routes");
        Console.WriteLine("All Shortest Path Count checks passed.");
    }
}
```

## Correctness argument

Dijkstra processes vertices in nondecreasing shortest distance. Because every road time is positive, any predecessor on a shortest route to v has strictly smaller distance than v and is processed before v. When a relaxation improves dist[v], all currently known shortest routes to v must pass through the new predecessor, so ways[v] is replaced by ways[u]. When the candidate ties dist[v], the routes extended from u are additional and distinct, so add ways[u]. Modulo arithmetic preserves the requested residue. Induction over finalized distance order yields the correct count.

## Step-by-step dry run

For edges 0-1=1, 1-2=1, and 0-2=2, processing 0 sets dist[1]=1 and dist[2]=2 with one direct route. Processing 1 finds another route to 2 at cost 2, so ways[2] becomes 2. Positive weights ensure node 1 is processed before node 2 is finalized.

## Time complexity

O((V+E) log V) with a binary heap and adjacency lists.

## Space complexity

O(V+E) for graph, distances, ways, and queue.

## Alternatives and tradeoffs

- With positive weights and a known shortest-path DAG, count paths by dynamic programming in distance order.
- Floyd-Warshall would compute all pairs but is unnecessary for one source and can complicate equal-path counts.
- Zero-weight cycles require a separate definition of what counts as a path and cannot use this simple ordering argument.

## Common mistakes and gotchas

- Adding ways on a strict improvement instead of replacing.
- Replacing ways on an equal-cost route.
- Using int for long path sums.
- Forgetting modulo.
- Applying this proof to zero-weight roads, where equal-distance predecessors may be processed later or cycles may exist.

## Edge-case tests

- One shortest route.
- Multiple equal shortest routes.
- A longer alternative that must not count.
- Large accumulated road times.
- Positive time constraint.

## Reflection questions

1. Why does strict improvement replace the count?
2. Why does equality add another contribution?
3. Why are positive weights important to the proof?
4. What must be reconsidered with zero-weight cycles?

Source: [LeetCode: Number of Ways to Arrive at Destination](https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/).
