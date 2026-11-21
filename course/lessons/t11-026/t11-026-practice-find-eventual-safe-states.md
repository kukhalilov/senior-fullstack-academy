# directed acyclic graphs and topological ordering — Problem: Find Eventual Safe States

## Goals
- Identify safe vertices as those whose every outgoing path reaches a terminal vertex.
- Reverse edges and peel vertices whose remaining outgoing degree reaches zero.
- Return safe labels in ascending order.

## Problem statement
The directed graph has vertices 0 through n-1 and adjacency list graph[i]. A terminal vertex has no outgoing edges. Return all vertices from which every possible path eventually reaches a terminal vertex, sorted ascending.

## Input constraints
- n == graph.Length and 1 <= n <= 10^4.
- 0 <= graph[i].Length <= n; each neighbor is in [0,n-1].
- Each adjacency list is strictly increasing; self-loops are allowed.
- The number of edges is between 1 and 4 * 10^4.

## Examples with expected output
- [[1,2],[2,3],[5],[0],[5],[],[]] -> [2,4,5,6].
- [[1,2,3,4],[1,2],[3,4],[0,4],[]] -> [4].
- [[0]] -> [] (a self-loop can continue forever).

## Clarifying assumptions
- A path that can stay in a reachable directed cycle forever is not guaranteed to reach a terminal node, so its starting vertices are unsafe.
- The reverse graph stores predecessors: if u -> v exists, store u among reverse[v].
- Output order must be ascending, even though the frontier's processing order need not be.

## Progressive hints
1. Terminal vertices are safe and have outdegree zero.
2. A vertex becomes safe when all its outgoing neighbors are known safe.
3. Reverse every edge and decrement predecessor remaining-outdegree as safe vertices are removed.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static IList<int> EventualSafeNodes(int[][] graph)
    {
        int n = graph.Length;
        var reverse = new List<int>[n];
        for (int i = 0; i < n; i++) reverse[i] = new List<int>();
        var remainingOutdegree = new int[n];

        for (int from = 0; from < n; from++)
        {
            remainingOutdegree[from] = graph[from].Length;
            foreach (int to in graph[from]) reverse[to].Add(from);
        }

        var ready = new Queue<int>();
        for (int node = 0; node < n; node++)
            if (remainingOutdegree[node] == 0) ready.Enqueue(node);

        var safe = new bool[n];
        while (ready.Count > 0)
        {
            int current = ready.Dequeue();
            safe[current] = true;
            foreach (int predecessor in reverse[current])
                if (--remainingOutdegree[predecessor] == 0) ready.Enqueue(predecessor);
        }

        var result = new List<int>();
        for (int node = 0; node < n; node++)
            if (safe[node]) result.Add(node);
        return result;
    }

    static void Check(int[] expected, int[][] graph)
    {
        int[] actual = new List<int>(EventualSafeNodes(graph)).ToArray();
        if (!expected.AsSpan().SequenceEqual(actual))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 2, 4, 5, 6 }, new[] { new[] { 1, 2 }, new[] { 2, 3 }, new[] { 5 }, new[] { 0 }, new[] { 5 }, Array.Empty<int>(), Array.Empty<int>() });
        Check(new[] { 4 }, new[] { new[] { 1, 2, 3, 4 }, new[] { 1, 2 }, new[] { 3, 4 }, new[] { 0, 4 }, Array.Empty<int>() });
        Check(Array.Empty<int>(), new[] { new[] { 0 } });
        Check(new[] { 0, 1 }, new[] { new[] { 1 }, Array.Empty<int>() });
        Console.WriteLine("Eventual Safe States checks passed.");
    }
}
```

## Correctness argument
A terminal vertex has no outgoing edge and therefore every path from it ends immediately. When a vertex's remaining outdegree becomes zero, every original outgoing neighbor has already been proven safe, so every path from this vertex proceeds to a safe vertex and ultimately terminates. Inductively, every removed vertex is safe. Conversely, any vertex with a path into a directed cycle can never have all outgoing dependencies eliminated; cycle vertices retain an outgoing edge within the unresolved set, and their predecessors cannot be removed either. Scanning labels in numeric order returns the safe set sorted.

## Step-by-step dry run
For 0 -> 1 and 1 terminal, initialize remaining outdegrees [1,0]. Remove 1; reverse[1] contains 0, so decrement its count to zero and enqueue 0. Both are marked safe and the final label scan returns [0,1].

## Time complexity
O(V+E): each vertex enters the queue at most once and each reversed edge is processed once.

## Space complexity
O(V+E) for the reverse adjacency, degree array, queue, and safe flags.

## Alternatives and tradeoffs
- DFS with three states classifies a vertex according to whether it reaches a cycle, then memoizes completed results.
- Reversing edges makes the “all outgoing neighbors are safe” condition an indegree-style elimination process.
- A simple recursive DFS can overflow on long paths; queue elimination is iterative.

## Common mistakes and gotchas

- Counting original indegree instead of remaining outdegree.
- Marking a node safe when only one outgoing neighbor is safe.
- Failing to include isolated terminal vertices.
- Returning queue order when the prompt requires sorted labels.
- Treating an edge into a cycle as safe merely because the vertex also has a path to a terminal; the condition is every possible path.

## Edge-case tests

- Self-loop and multi-node cycle.
- Cycle with a tail entering it.
- Terminal-only vertices and isolated vertices.
- A node with multiple outgoing neighbors, only some of which are safe.

## Reflection questions

1. What does remainingOutdegree count during elimination?
2. Why are all successors required to be safe before a predecessor is safe?
3. Why does a numeric final scan enforce sorted output?

## Source
- [Find Eventual Safe States](https://leetcode.com/problems/find-eventual-safe-states/)
