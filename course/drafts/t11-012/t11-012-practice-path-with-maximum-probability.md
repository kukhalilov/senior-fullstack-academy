# weighted shortest paths and distance relaxation — Problem: Path with Maximum Probability

## Goals

- Adapt priority-queue search to maximize a product rather than minimize a sum.
- Build an undirected graph with edge success probabilities.
- Return zero when destination is unreachable.

## Problem statement

For each undirected edge, a success probability is given. Return the maximum product of edge probabilities over any path from start to end.

## Input constraints

- 2 <= n <= 10,000; start and end are distinct valid vertices.
- 0 <= edge count <= 20,000; at most one edge per pair.
- Each success probability is in [0,1].
- Accepted numeric error is at most 1e-5.

## Examples with expected output

1. Edges [[0,1],[1,2],[0,2]], probabilities [0.5,0.5,0.2], start=0,end=2 -> 0.25.
2. Same graph with direct probability 0.3 -> 0.3.
3. Only edge 0-1 in a three-node graph, start=0,end=2 -> 0.

## Clarifying assumptions

- Path probabilities multiply along independent edge-success events.
- A zero-probability route has value zero, as does no route under the required return contract.
- The graph is undirected.

## Progressive hints

1. Store the best known probability per vertex.
2. Extending a route multiplies its probability by the next edge's probability.
3. Use a max-priority order; .NET's min-heap can store the negative probability as priority.
4. Skip stale lower-probability entries.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static double MaxProbability(int n, int[][] edges, double[] succProb, int start, int end)
    {
        if (edges is null) throw new ArgumentNullException(nameof(edges));
        if (succProb is null) throw new ArgumentNullException(nameof(succProb));
        if (edges.Length != succProb.Length || n <= 0 || start < 0 || start >= n || end < 0 || end >= n)
            throw new ArgumentException("Graph dimensions or endpoints are invalid.");
        var graph = new List<(int To, double Probability)>[n];
        for (int i = 0; i < n; i++) graph[i] = new List<(int, double)>();
        for (int i = 0; i < edges.Length; i++)
        {
            int[] edge = edges[i];
            if (edge is null || edge.Length != 2 || edge[0] < 0 || edge[0] >= n || edge[1] < 0 || edge[1] >= n || edge[0] == edge[1])
                throw new ArgumentException("Invalid probability edge.", nameof(edges));
            if (succProb[i] < 0 || succProb[i] > 1) throw new ArgumentOutOfRangeException(nameof(succProb));
            graph[edge[0]].Add((edge[1], succProb[i]));
            graph[edge[1]].Add((edge[0], succProb[i]));
        }
        if (start == end) return 1.0;

        var best = new double[n];
        best[start] = 1.0;
        var queue = new PriorityQueue<int, double>();
        queue.Enqueue(start, -1.0);
        while (queue.TryDequeue(out int node, out double negativeProbability))
        {
            double probability = -negativeProbability;
            if (probability < best[node]) continue;
            if (node == end) return probability;
            foreach ((int next, double edgeProbability) in graph[node])
            {
                double candidate = probability * edgeProbability;
                if (candidate <= best[next]) continue;
                best[next] = candidate;
                queue.Enqueue(next, -candidate);
            }
        }
        return 0.0;
    }

    private static void Near(double actual, double expected, string label)
    {
        if (Math.Abs(actual - expected) > 1e-5) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Near(MaxProbability(3, new[] { new[] { 0, 1 }, new[] { 1, 2 }, new[] { 0, 2 } }, new[] { 0.5, 0.5, 0.2 }, 0, 2), 0.25, "Example 1");
        Near(MaxProbability(3, new[] { new[] { 0, 1 }, new[] { 1, 2 }, new[] { 0, 2 } }, new[] { 0.5, 0.5, 0.3 }, 0, 2), 0.3, "Example 2");
        Near(MaxProbability(3, new[] { new[] { 0, 1 } }, new[] { 0.5 }, 0, 2), 0, "unreachable");
        Near(MaxProbability(2, new[] { new[] { 0, 1 }, new[] { 0, 1 } }, new[] { 0.9, 0.8 }, 0, 1), 0.9, "generalized parallel edges");
        Console.WriteLine("All Maximum Probability checks passed.");
    }
}
```

## Correctness argument

For any partial path with probability p, extending by edge probability q in [0,1] yields p*q, which cannot exceed p. Processing the largest current probability first is the max-product analogue of Dijkstra: no later route through a lower-probability unsettled vertex can produce a better probability than the current maximum without first reaching a higher or equal prefix. Relaxing each edge by multiplication records improved products; stale entries are skipped. The first nonstale extraction of end is optimal. If it is never extracted, no path exists and the required result is zero.

## Step-by-step dry run

From 0, reaching 1 has probability 0.5 and direct reaching 2 has 0.2. Pop 1, extend to 2 with 0.5*0.5=0.25, improving 0.2. Pop 2 at 0.25 and return it.

## Time complexity

O((V+E) log V) with a binary heap and adjacency lists.

## Space complexity

O(V+E) for graph, best values, and queue.

## Alternatives and tradeoffs

- Maximizing products can be transformed to minimizing sums of -log(p) for positive probabilities, but zero probabilities need special handling.
- A max-heap would make priority direction explicit; negative priorities reuse a min-heap.
- Repeated relaxation can work but is slower and less direct.

## Common mistakes and gotchas

- Adding probabilities instead of multiplying.
- Using a min-heap with untransformed probability.
- Forgetting an undirected edge requires both directions.
- Returning a direct edge probability without considering alternate paths.
- Applying logarithms to zero without a separate case.

## Edge-case tests

- Direct route versus a more reliable multi-edge route.
- Disconnected destination.
- Probability one and probability zero.
- Multiple successive improvements.
- Start equals end in a generalized API.

## Reflection questions

1. Why is multiplication the path-combine operation?
2. Why does probability never increase when extending a path?
3. How does the negative priority implement a max-heap?
4. What special case is required for the logarithm transformation?

Source: [LeetCode: Path with Maximum Probability](https://leetcode.com/problems/path-with-maximum-probability/).
