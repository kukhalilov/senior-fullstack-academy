# weighted shortest paths and distance relaxation — Problem: Find the City With the Smallest Number of Neighbors at a Threshold Distance

## Goals

- Compute all-pairs shortest distances with Floyd-Warshall.
- Count other cities within an inclusive threshold.
- Resolve ties by choosing the greatest city index.

## Problem statement

Given a small undirected weighted graph and a distance threshold, return the city with the fewest other cities at shortest-path distance at most the threshold. If tied, return the greatest city number.

## Input constraints

- 2 <= n <= 100.
- Edge endpoints satisfy 0 <= from < to < n; pairs are distinct.
- 1 <= edge weight, threshold <= 10,000.
- Graph may be disconnected.

## Examples with expected output

1. n=4, edges=[[0,1,3],[1,2,1],[1,3,4],[2,3,1]], threshold=4 -> 3.
2. n=5, edges=[[0,1,2],[0,4,8],[1,2,3],[1,4,2],[2,3,1],[3,4,1]], threshold=2 -> 0.
3. n=4, edges=[[0,1,1]], threshold=1 -> 3.

## Clarifying assumptions

- Every edge is bidirectional.
- Count only other cities; do not count a city's zero self-distance.
- Distances equal to the threshold are included.

## Progressive hints

1. The graph is small and the answer needs distances from every city.
2. Initialize diagonal to zero, direct edges to weight, others to infinity.
3. Allow each vertex as an intermediate in turn.
4. Count reachable cities and use the specified greatest-index tie-break.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static int FindTheCity(int n, int[][] edges, int distanceThreshold)
    {
        if (edges is null) throw new ArgumentNullException(nameof(edges));
        if (n <= 0) throw new ArgumentOutOfRangeException(nameof(n));
        const long Infinity = long.MaxValue / 4;
        var distance = new long[n, n];
        for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            distance[i, j] = i == j ? 0 : Infinity;

        foreach (int[] edge in edges)
        {
            if (edge is null || edge.Length != 3 || edge[0] < 0 || edge[0] >= n || edge[1] < 0 || edge[1] >= n || edge[2] < 0)
                throw new ArgumentException("Invalid undirected weighted edge.", nameof(edges));
            distance[edge[0], edge[1]] = Math.Min(distance[edge[0], edge[1]], edge[2]);
            distance[edge[1], edge[0]] = Math.Min(distance[edge[1], edge[0]], edge[2]);
        }

        for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
        {
            if (distance[i, k] == Infinity) continue;
            for (int j = 0; j < n; j++)
            {
                if (distance[k, j] == Infinity) continue;
                long candidate = distance[i, k] + distance[k, j];
                if (candidate < distance[i, j]) distance[i, j] = candidate;
            }
        }

        int answer = -1, minimumReachable = int.MaxValue;
        for (int city = 0; city < n; city++)
        {
            int count = 0;
            for (int other = 0; other < n; other++)
                if (other != city && distance[city, other] <= distanceThreshold) count++;
            if (count <= minimumReachable)
            {
                minimumReachable = count;
                answer = city;
            }
        }
        return answer;
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(FindTheCity(4, new[] { new[] { 0, 1, 3 }, new[] { 1, 2, 1 }, new[] { 1, 3, 4 }, new[] { 2, 3, 1 } }, 4), 3, "Example 1");
        Equal(FindTheCity(5, new[] { new[] { 0, 1, 2 }, new[] { 0, 4, 8 }, new[] { 1, 2, 3 }, new[] { 1, 4, 2 }, new[] { 2, 3, 1 }, new[] { 3, 4, 1 } }, 2), 0, "Example 2");
        Equal(FindTheCity(4, new[] { new[] { 0, 1, 1 } }, 1), 3, "greatest index tie");
        Console.WriteLine("All Find the City checks passed.");
    }
}
```

## Correctness argument

Initially the matrix contains the best direct paths and zero-length self paths. After processing intermediate vertex k, dist[i,j] is the shortest route whose internal vertices are drawn from the processed set. Any shortest path either avoids k or decomposes into i-to-k and k-to-j paths; the recurrence considers both. Inductively, after all vertices are processed, all-pairs shortest distances are known, with infinity retained for disconnected pairs. Counting finite distances within threshold gives each city's required neighbor count. Updating on equality makes the final city win ties.

## Step-by-step dry run

For 0-1 cost 3, 1-2 cost 1, and 2-3 cost 1, processing 1 creates 0->2 cost 4; processing 2 creates 0->3 cost 5. Count each city's other destinations within threshold. If city 0 and city 3 tie at the minimum, the greatest index wins.

## Time complexity

O(n³) time.

## Space complexity

O(n²) for the distance matrix.

## Alternatives and tradeoffs

- Run Dijkstra from every city for sparse graphs: about O(V(E log V)).
- Floyd-Warshall is compact and straightforward at n<=100.
- If only one source is queried, single-source Dijkstra avoids all-pairs work.

## Common mistakes and gotchas

- Counting the city itself at distance zero.
- Replacing min on duplicate direct edges with the last edge value.
- Omitting a direction for an undirected edge.
- Putting k in the wrong loop position.
- Choosing the smallest index on ties.
- Adding infinity values without guards.

## Edge-case tests

- Disconnected graph.
- Direct and indirect competing paths.
- Distance exactly equal to threshold.
- Multiple cities tied on minimum count.
- Duplicate direct edges in a generalized input.

## Reflection questions

1. What does processing k add to the path set?
2. Why are there two guarded legs in the candidate path?
3. Why exclude self from the count?
4. How does updating on equality implement the tie rule?

Source: [LeetCode: Find the City With the Smallest Number of Neighbors at a Threshold Distance](https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/).
