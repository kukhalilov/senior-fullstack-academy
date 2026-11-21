# disjoint-set union and connectivity maintenance — Problem: Redundant Connection

## Goals
- Map the input's one-based vertex labels into an initialized DSU universe.
- Detect the edge whose endpoints are already connected when it is processed.
- Explain why input order and the tree-plus-one-edge guarantee identify the answer.

## Problem statement

A graph started as a tree with `n` nodes labeled `1..n`, then one edge between two distinct vertices was added. `edges` contains the resulting connected graph's `n` unique undirected edges. Return an edge whose removal makes the graph a tree. If multiple answers are possible, return the one that occurs last in the input.

## Input constraints
- `n == edges.Length`, `3 <= n <= 1000`.
- Every edge has two labels with `1 <= a < b <= n`.
- There are no repeated edges, and the graph is connected.

## Examples with expected output
- `[[1,2],[1,3],[2,3]] -> [2,3]`.
- `[[1,2],[2,3],[3,4],[1,4],[1,5]] -> [1,4]`.

## Clarifying assumptions

The intended input sequence consists of the original tree edges plus one added edge. While scanning in order, the extra edge joins vertices already connected by the tree path. The general phrasing about multiple removable edges should not be misread as asking for any edge in an arbitrary graph with several cycles; the input guarantee gives the DSU characterization.

## Progressive hints
1. Initialize all labels as singleton components. Since labels are 1-based, allocate `n+1` slots.
2. Process edges in input order and union their endpoints.
3. The edge whose union returns false is redundant; preserve and return the original pair.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static int[] FindRedundantConnection(int[][] edges)
    {
        var dsu = new Dsu(edges.Length + 1);
        foreach (int[] edge in edges)
            if (!dsu.Union(edge[0], edge[1])) return edge;
        throw new InvalidOperationException("The input guarantee requires a redundant edge.");
    }

    sealed class Dsu
    {
        private readonly int[] parent, size;
        public Dsu(int n)
        {
            parent = new int[n]; size = new int[n];
            for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
        }
        private int Find(int x)
        {
            while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
            return x;
        }
        public bool Union(int a, int b)
        {
            int ra = Find(a), rb = Find(b);
            if (ra == rb) return false;
            if (size[ra] < size[rb]) (ra, rb) = (rb, ra);
            parent[rb] = ra; size[ra] += size[rb];
            return true;
        }
    }

    static void Check(int[] expected, int[] actual)
    {
        if (expected.Length != actual.Length || expected[0] != actual[0] || expected[1] != actual[1])
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 2, 3 }, FindRedundantConnection(new[] { new[] { 1, 2 }, new[] { 1, 3 }, new[] { 2, 3 } }));
        Check(new[] { 1, 4 }, FindRedundantConnection(new[] { new[] { 1, 2 }, new[] { 2, 3 }, new[] { 3, 4 }, new[] { 1, 4 }, new[] { 1, 5 } }));
        Check(new[] { 1, 4 }, FindRedundantConnection(new[] { new[] { 1, 2 }, new[] { 2, 3 }, new[] { 3, 4 }, new[] { 1, 4 } }));
        Console.WriteLine("Redundant Connection checks passed.");
    }
}
```

## Correctness argument

Before each edge is processed, DSU components equal the connected components formed by earlier edges. Initially this holds for singleton vertices; each successful union merges exactly the two components joined by that edge. A failed union means an earlier path already connected the endpoints, so adding this edge closes a cycle. Under the tree-plus-one-edge guarantee, precisely the extra edge fails, and removing it restores the original tree. The scan therefore returns the required edge.

## Step-by-step dry run

For `[[1,2],[1,3],[2,3]]`, the first edge merges `{1}` and `{2}`. The second merges `{1,2}` and `{3}`. For `[2,3]`, both finds return the same root, so `Union` is false and the original pair is returned.

## Time complexity

`O(n α(n))` amortized for n edge unions; `α` is inverse Ackermann.

## Space complexity

`O(n)` for parent and size arrays. The returned edge is part of the input.

## Edge-case tests

- Both official examples are asserted in `Main`.
- A path plus a closing edge is asserted.
- The stated guarantee means the throw branch is unreachable; it exposes invalid generalized input rather than returning a fabricated edge.
- A self-loop is excluded by constraints; generalized cycle detection would identify it as immediately redundant.

## Reflection questions

1. Why compare roots instead of the immediate parent array entries?
2. If the input were an arbitrary graph with several cycles and the requirement were “last removable edge,” how would you formulate a reverse-deletion or spanning-tree solution instead?
3. Why is the DSU sized `edges.Length + 1`?

Source: [LeetCode: Redundant Connection](https://leetcode.com/problems/redundant-connection/).
