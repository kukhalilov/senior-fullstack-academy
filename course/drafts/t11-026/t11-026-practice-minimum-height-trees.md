# directed acyclic graphs and topological ordering — Problem: Minimum Height Trees

## Goals
- Find tree centers by repeatedly removing all current leaves.
- Handle the one- and two-center cases.
- Recognize why this undirected-tree frontier resembles, but is not, topological sorting.

## Problem statement
An undirected tree has vertices 0 through n-1. Choosing a vertex as root defines a height equal to the number of edges on the longest downward path to a leaf. Return every root label that minimizes this height.

## Input constraints
- 1 <= n <= 20,000.
- edges.Length == n - 1.
- Endpoints are distinct valid labels, edges are unique, and the graph is guaranteed to be a tree.

## Examples with expected output
- n=4, edges=[[1,0],[1,2],[1,3]] -> [1].
- n=6, edges=[[3,0],[3,1],[3,2],[3,4],[5,4]] -> [3,4].
- n=1, edges=[] -> [0].

## Clarifying assumptions
- Edges are undirected; store both directions in adjacency.
- A tree has one center when its diameter has even edge length and two centers when odd.
- Any order of the returned center labels is accepted.

## Progressive hints
1. A leaf cannot be the center of a tree with more than two vertices.
2. Remove all current leaves at once, then the next layer of vertices becomes leaves.
3. Continue until at most two vertices remain.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static IList<int> FindMinHeightTrees(int n, int[][] edges)
    {
        if (n == 1) return new List<int> { 0 };

        var neighbors = new List<int>[n];
        for (int i = 0; i < n; i++) neighbors[i] = new List<int>();
        var degree = new int[n];
        foreach (int[] edge in edges)
        {
            int a = edge[0], b = edge[1];
            neighbors[a].Add(b);
            neighbors[b].Add(a);
            degree[a]++;
            degree[b]++;
        }

        var leaves = new Queue<int>();
        for (int node = 0; node < n; node++)
            if (degree[node] == 1) leaves.Enqueue(node);

        int remaining = n;
        while (remaining > 2)
        {
            int layerSize = leaves.Count;
            remaining -= layerSize;
            for (int i = 0; i < layerSize; i++)
            {
                int leaf = leaves.Dequeue();
                foreach (int neighbor in neighbors[leaf])
                {
                    if (--degree[neighbor] == 1) leaves.Enqueue(neighbor);
                }
            }
        }

        var centers = new List<int>();
        while (leaves.Count > 0) centers.Add(leaves.Dequeue());
        centers.Sort();
        return centers;
    }

    static void Check(int[] expected, int n, int[][] edges)
    {
        int[] actual = new List<int>(FindMinHeightTrees(n, edges)).ToArray();
        Array.Sort(expected);
        if (!expected.AsSpan().SequenceEqual(actual))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 1 }, 4, new[] { new[] { 1, 0 }, new[] { 1, 2 }, new[] { 1, 3 } });
        Check(new[] { 3, 4 }, 6, new[] { new[] { 3, 0 }, new[] { 3, 1 }, new[] { 3, 2 }, new[] { 3, 4 }, new[] { 5, 4 } });
        Check(new[] { 0 }, 1, Array.Empty<int[]>());
        Check(new[] { 0, 1 }, 2, new[] { new[] { 0, 1 } });
        Check(new[] { 2 }, 5, new[] { new[] { 0, 1 }, new[] { 1, 2 }, new[] { 2, 3 }, new[] { 3, 4 } });
        Console.WriteLine("Minimum Height Trees checks passed.");
    }
}
```

## Correctness argument
A tree's minimum-height roots are the middle vertex or middle pair of any diameter. Repeated leaf trimming removes the outer layer from both ends of a diameter while retaining its midpoint(s); any extra leaves on shorter branches are also outside the center. Thus each round preserves the center(s), and trimming until one or two vertices remain returns exactly those roots. A root away from the diameter midpoint is farther from at least one diameter endpoint, so its maximum distance is larger.

## Step-by-step dry run
For the path 0-1-2-3-4, leaves 0 and 4 are removed first. Then 1 and 3 are leaves and are removed. Vertex 2 remains as the single center and therefore the minimum-height root.

## Time complexity
O(V+E), with O(V) edge count in a tree.

## Space complexity
O(V+E) for adjacency lists, degrees, and the leaf queue.

## Alternatives and tradeoffs
- Find a diameter with two tree traversals; its middle vertex or pair are the centers. This uses parent/distance state and relies on the tree property.
- Repeatedly run BFS from every candidate root is O(V²) and is unnecessary.
- Leaf trimming is a frontier elimination pattern, but the graph is undirected and its degree rule is not Kahn's directed indegree rule.

## Common mistakes and gotchas

- Returning all leaves of the original tree instead of trimming layers.
- Removing one leaf at a time and letting newly exposed leaves join the same layer.
- Forgetting the n=1 case, where the only node has degree zero and is not initially queued as a degree-one leaf.
- Assuming a tree has only one center; a diameter can have two middle vertices.
- Treating this as a directed topological order problem.

## Edge-case tests

- One node and a two-node tree.
- A long path with one center and one with two.
- A star with one center.
- A balanced tree with centers in separate branches.

## Reflection questions

1. Why can a current leaf be removed without losing a possible center?
2. How many centers can a tree have, and what determines that count?
3. Which invariant distinguishes tree leaf peeling from Kahn's algorithm?

## Source
- [Minimum Height Trees](https://leetcode.com/problems/minimum-height-trees/)
