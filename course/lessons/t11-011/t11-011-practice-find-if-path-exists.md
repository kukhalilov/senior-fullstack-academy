# graph models, representations, and traversal — Problem: Find if Path Exists in Graph

## Goals

- Build an undirected adjacency list from an edge list.
- Test source-to-destination reachability with iterative DFS.
- Handle large sparse graphs without an adjacency matrix.

## Problem statement

Given n vertices labeled 0 through n-1 and bidirectional edges, return whether a valid path connects source to destination.

## Input constraints

- 1 <= n <= 200,000.
- 0 <= edges.Length <= 200,000.
- No self-edges or duplicate undirected edges.
- Source and destination are valid vertex labels.

## Examples with expected output

1. n=3, edges=[[0,1],[1,2],[2,0]], source=0, destination=2 -> true.
2. n=6, edges=[[0,1],[0,2],[3,5],[5,4],[4,3]], source=0, destination=5 -> false.
3. n=1, no edges, source=0, destination=0 -> true.

## Clarifying assumptions

- Edges are undirected and are added to both endpoint lists.
- The search stops once destination is found.
- A vertex is marked when pushed so it is pushed at most once.

## Progressive hints

1. Reachability is a graph traversal question.
2. Adjacency lists fit sparse graphs in O(V+E) space.
3. Start from source and track discovered vertices.
4. Return false only after the frontier empties without finding destination.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static bool ValidPath(int n, int[][] edges, int source, int destination)
    {
        if (edges is null) throw new ArgumentNullException(nameof(edges));
        if (n < 0 || source < 0 || source >= n || destination < 0 || destination >= n)
            throw new ArgumentOutOfRangeException(nameof(n));
        var adjacency = new List<int>[n];
        for (int i = 0; i < n; i++) adjacency[i] = new List<int>();
        foreach (int[] edge in edges)
        {
            if (edge is null || edge.Length != 2 || edge[0] < 0 || edge[0] >= n || edge[1] < 0 || edge[1] >= n || edge[0] == edge[1])
                throw new ArgumentException("Invalid undirected edge.", nameof(edges));
            adjacency[edge[0]].Add(edge[1]);
            adjacency[edge[1]].Add(edge[0]);
        }
        if (source == destination) return true;

        var visited = new bool[n];
        var stack = new Stack<int>();
        visited[source] = true;
        stack.Push(source);
        while (stack.Count > 0)
        {
            int node = stack.Pop();
            foreach (int neighbor in adjacency[node])
            {
                if (neighbor == destination) return true;
                if (visited[neighbor]) continue;
                visited[neighbor] = true;
                stack.Push(neighbor);
            }
        }
        return false;
    }

    private static void Equal(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(ValidPath(3, new[] { new[] { 0, 1 }, new[] { 1, 2 }, new[] { 2, 0 } }, 0, 2), true, "cycle");
        Equal(ValidPath(6, new[] { new[] { 0, 1 }, new[] { 0, 2 }, new[] { 3, 5 }, new[] { 5, 4 }, new[] { 4, 3 } }, 0, 5), false, "disconnected");
        Equal(ValidPath(1, Array.Empty<int[]>(), 0, 0), true, "same vertex");
        Equal(ValidPath(4, new[] { new[] { 0, 1 }, new[] { 1, 2 } }, 0, 2), true, "chain");
        Console.WriteLine("All Find Path checks passed.");
    }
}
```

## Correctness argument

The adjacency list represents every undirected edge in both directions. The stack begins with source, and the visited invariant ensures each reachable vertex is pushed at most once. Every popped vertex's neighbors are examined; finding destination proves a path by the traversal parent chain. If the stack empties without finding it, every source-reachable vertex has been explored, so no path exists.

## Step-by-step dry run

For edges 0-1 and 1-2, start with stack [0]. Pop 0, discover and push 1. Pop 1, discover 2 and return true. In a disconnected component, search exhausts the source side and returns false.

## Time complexity

O(V+E) to build and traverse the adjacency lists.

## Space complexity

O(V+E) for adjacency, O(V) visited and stack.

## Alternatives and tradeoffs

- BFS also answers reachability and additionally gives shortest edge-count paths.
- An adjacency matrix costs O(V²), unsuitable for these sparse-size constraints.
- Disjoint-set union answers undirected connectivity after preprocessing but is covered separately and does not produce a path.

## Common mistakes and gotchas

- Adding only one direction for an undirected edge.
- Using a matrix for up to 200,000 vertices.
- Forgetting source equals destination.
- Marking only on pop and creating duplicate stack work.
- Using this traversal for shortest weighted paths.

## Edge-case tests

- Same source and destination.
- Empty edge list with different vertices.
- Direct edge and multi-edge path.
- Disconnected components.
- Large sparse chain.

## Reflection questions

1. What does an adjacency list save for a sparse graph?
2. Why add each edge twice?
3. What proves false when traversal ends?
4. How would BFS add a shortest-path distance?

Source: [LeetCode: Find if Path Exists in Graph](https://leetcode.com/problems/find-if-path-exists-in-graph/).
