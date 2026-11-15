# weighted shortest paths and distance relaxation — Problem: Network Delay Time

## Goals

- Use Dijkstra on a directed graph with nonnegative travel times.
- Skip stale priority-queue entries.
- Return the time when every node has received the signal, or -1 if unreachable.

## Problem statement

Given directed edges (u,v,w) and source k, return the minimum time for the signal to reach all n nodes. If any node is unreachable, return -1.

## Input constraints

- 1 <= k <= n <= 100.
- 1 <= times.Length <= 6000; ordered endpoint pairs are unique.
- 1 <= u,v <= n, u != v.
- 0 <= w <= 100.

## Examples with expected output

1. [[2,1,1],[2,3,1],[3,4,1]], n=4, k=2 -> 2.
2. [[1,2,1]], n=2, k=1 -> 1.
3. [[1,2,1]], n=2, k=2 -> -1.

## Clarifying assumptions

- Edges are directed; no reverse edge is inferred.
- Zero travel time is permitted.
- The result is the maximum shortest distance among nodes, not the sum.

## Progressive hints

1. Build an adjacency list indexed by one-based node labels.
2. Initialize source distance to zero and others to infinity.
3. Relax outgoing edges from the minimum tentative distance.
4. Skip stale queue entries and check every node at the end.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int NetworkDelayTime(int[][] times, int n, int k)
    {
        if (times is null) throw new ArgumentNullException(nameof(times));
        if (n <= 0 || k < 1 || k > n) throw new ArgumentOutOfRangeException(nameof(n));
        var graph = new List<(int To, int Weight)>[n + 1];
        for (int i = 0; i <= n; i++) graph[i] = new List<(int, int)>();
        foreach (int[] edge in times)
        {
            if (edge is null || edge.Length != 3 || edge[0] < 1 || edge[0] > n || edge[1] < 1 || edge[1] > n || edge[2] < 0)
                throw new ArgumentException("Invalid directed travel-time edge.", nameof(times));
            graph[edge[0]].Add((edge[1], edge[2]));
        }

        const long Infinity = long.MaxValue / 4;
        var distance = new long[n + 1];
        Array.Fill(distance, Infinity);
        distance[k] = 0;
        var queue = new PriorityQueue<(int Node, long Distance), long>();
        queue.Enqueue((k, 0), 0);
        while (queue.TryDequeue(out var entry, out _))
        {
            int node = entry.Node;
            long currentDistance = entry.Distance;
            if (currentDistance != distance[node]) continue;
            foreach ((int next, int weight) in graph[node])
            {
                long candidate = currentDistance + weight;
                if (candidate >= distance[next]) continue;
                distance[next] = candidate;
                queue.Enqueue((next, candidate), candidate);
            }
        }

        long maximum = 0;
        for (int node = 1; node <= n; node++)
        {
            if (distance[node] == Infinity) return -1;
            maximum = Math.Max(maximum, distance[node]);
        }
        return checked((int)maximum);
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(NetworkDelayTime(new[] { new[] { 2, 1, 1 }, new[] { 2, 3, 1 }, new[] { 3, 4, 1 } }, 4, 2), 2, "Example 1");
        Equal(NetworkDelayTime(new[] { new[] { 1, 2, 1 } }, 2, 1), 1, "Example 2");
        Equal(NetworkDelayTime(new[] { new[] { 1, 2, 1 } }, 2, 2), -1, "unreachable");
        Equal(NetworkDelayTime(new[] { new[] { 1, 2, 0 }, new[] { 2, 3, 4 }, new[] { 1, 3, 9 } }, 3, 1), 4, "zero weight");
        Console.WriteLine("All Network Delay checks passed.");
    }
}
```

## Correctness argument

All edge weights are nonnegative, so the minimum tentative-distance vertex removed from the priority queue has its final shortest distance. Each outgoing edge is relaxed from a finalized shortest prefix; every improvement is enqueued. Stale entries are ignored because a lower route has superseded them. Consequently, after the queue empties, each reachable node's distance is shortest. The signal reaches all nodes at the maximum of these distances; if any remains infinite, return -1.

## Step-by-step dry run

From node 2, relax 1 and 3 to distance 1. Pop 3 and relax 4 to distance 2. Pop 1 and 4; no better route appears. The largest finite distance is 2.

## Time complexity

O((V+E) log V) with adjacency lists and a binary heap, allowing lazy duplicate entries.

## Space complexity

O(V+E) for graph, distances, and queue entries.

## Alternatives and tradeoffs

- For the small n limit, an O(V²+E) array-based Dijkstra is also practical.
- Bellman-Ford is unnecessary because weights are nonnegative.
- Floyd-Warshall would compute every source and use O(V²) memory.

## Common mistakes and gotchas

- Treating directed times as bidirectional.
- Returning only the source's farthest direct edge rather than shortest distances.
- Forgetting the maximum across all nodes.
- Finalizing on first insertion into the queue.
- Adding to infinity without a guard.

## Edge-case tests

- Source reaches itself with zero delay.
- Unreachable node.
- Zero-weight edge.
- Multiple routes where a later-discovered path is cheaper.
- Directed edge with no reverse counterpart.

## Reflection questions

1. Why can Dijkstra finalize a popped minimum?
2. What is a stale entry?
3. Why is the final delay a maximum?
4. Why does direction matter in graph construction?

Source: [LeetCode: Network Delay Time](https://leetcode.com/problems/network-delay-time/).
