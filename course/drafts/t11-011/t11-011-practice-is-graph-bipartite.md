# graph models, representations, and traversal — Problem: Is Graph Bipartite?

## Goals

- Two-color every component of an undirected graph.
- Detect a conflict when an edge connects equal colors.
- Handle disconnected graphs, not just the component of vertex zero.

## Problem statement

Return whether an undirected graph can be partitioned into two independent sets such that every edge crosses between the sets.

## Input constraints

- 1 <= n <= 100.
- Adjacency lists contain distinct valid neighbors and no self-edges.
- The graph is undirected and may be disconnected.

## Examples with expected output

1. [[1,2,3],[0,2],[0,1,3],[0,2]] -> false.
2. [[1,3],[0,2],[1,3],[0,2]] -> true.
3. [[],[]] -> true.

## Clarifying assumptions

- Use colors 0 and 1; -1 means undiscovered.
- Start BFS in every uncolored component.
- An empty graph generalization is bipartite.

## Progressive hints

1. Assign one color to a start vertex.
2. Every neighbor must have the opposite color.
3. If it is uncolored, assign and enqueue it; if same-colored, fail.
4. Repeat for disconnected components.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static bool IsBipartite(int[][] graph)
    {
        if (graph is null) throw new ArgumentNullException(nameof(graph));
        int n = graph.Length;
        var color = new int[n];
        Array.Fill(color, -1);
        var queue = new Queue<int>();

        for (int start = 0; start < n; start++)
        {
            if (color[start] != -1) continue;
            color[start] = 0;
            queue.Enqueue(start);
            while (queue.Count > 0)
            {
                int node = queue.Dequeue();
                foreach (int neighbor in graph[node])
                {
                    if (neighbor < 0 || neighbor >= n) throw new ArgumentException("Neighbor index is invalid.", nameof(graph));
                    if (color[neighbor] == -1)
                    {
                        color[neighbor] = 1 - color[node];
                        queue.Enqueue(neighbor);
                    }
                    else if (color[neighbor] == color[node])
                    {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    private static void Equal(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(IsBipartite(new[] { new[] { 1, 2, 3 }, new[] { 0, 2 }, new[] { 0, 1, 3 }, new[] { 0, 2 } }), false, "Example 1");
        Equal(IsBipartite(new[] { new[] { 1, 3 }, new[] { 0, 2 }, new[] { 1, 3 }, new[] { 0, 2 } }), true, "Example 2");
        Equal(IsBipartite(new[] { Array.Empty<int>(), Array.Empty<int>() }), true, "isolated components");
        Equal(IsBipartite(new[] { new[] { 1 }, new[] { 0 }, new[] { 3 }, new[] { 2 } }), true, "disconnected edges");
        Console.WriteLine("All Bipartite Graph checks passed.");
    }
}
```

## Correctness argument

Within each component, the start receives color 0. For every processed edge, an uncolored neighbor receives the opposite color; therefore all examined edges join opposite colors unless a contradiction is found. If an edge joins equal colors, no valid two-coloring respecting all previously enforced constraints exists, so returning false is correct. When BFS finishes without conflict, every vertex in that component is colored and every edge crosses colors. Repeating over all components proves the whole graph is bipartite.

## Step-by-step dry run

For a square cycle, color 0 as 0, neighbors 1 and 3 as 1, then vertex 2 as 0 from either neighbor. All edges cross colors. Adding the diagonal edge 0-2 creates an equal-color conflict, so return false.

## Time complexity

O(V+E) with adjacency lists.

## Space complexity

O(V) for colors and queue.

## Alternatives and tradeoffs

- DFS coloring uses the same invariant with recursion or an explicit stack.
- Odd-cycle reconstruction can store parent/depth and produce a witness, but is unnecessary for a boolean result.
- A self-loop immediately fails; source constraints exclude it.

## Common mistakes and gotchas

- Coloring only the component containing vertex zero.
- Returning true when a visited neighbor has the same color.
- Treating a disconnected graph as automatically false.
- Using only BFS levels without checking cross edges.
- Assuming the graph's adjacency is directed; the source guarantees symmetry.

## Edge-case tests

- Isolated vertices.
- A single edge.
- Even and odd cycles.
- Disconnected mixture of bipartite and non-bipartite components.
- Self-loop in a defensive generalization.

## Reflection questions

1. Why does an odd cycle prevent two-coloring?
2. Why must every component receive a starting color?
3. What does same-color adjacency prove?
4. How could parent pointers produce an odd-cycle witness?

Source: [LeetCode: Is Graph Bipartite?](https://leetcode.com/problems/is-graph-bipartite/).
