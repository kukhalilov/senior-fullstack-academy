# disjoint-set union and connectivity maintenance — Problem: Number of Provinces

## Goals
- Convert the symmetric city matrix into unions of directly connected pairs.
- Count transitive connected components rather than direct edges.
- Explain the DSU invariant after processing part of the matrix.

## Problem statement

There are `n` cities. `isConnected[i][j] == 1` means cities `i` and `j` have a direct connection. A province is a group of directly or indirectly connected cities. Return the number of provinces.

## Input constraints
- `1 <= n <= 200`.
- `isConnected` is an `n x n` matrix of 0s and 1s.
- Diagonal entries are 1 and the matrix is symmetric.

## Examples with expected output
- `[[1,1,0],[1,1,0],[0,0,1]] -> 2`.
- `[[1,0,0],[0,1,0],[0,0,1]] -> 3`.
- A chain `0--1--2` forms one province even when cities 0 and 2 have no direct edge.

## Clarifying assumptions

Because the matrix is symmetric, this is an undirected graph. The diagonal self-entries do not affect connectivity, and inspecting only `j > i` processes each possible undirected edge once. The full matrix is guaranteed well-formed.

## Progressive hints
1. Initialize one DSU set per city, so the initial component count is n.
2. For each upper-triangle entry equal to 1, union its two city indices.
3. Return the DSU's component counter after all pairs are processed.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static int FindCircleNum(int[][] isConnected)
    {
        int n = isConnected.Length;
        var dsu = new Dsu(n);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
                if (isConnected[i][j] == 1) dsu.Union(i, j);
        return dsu.Components;
    }

    sealed class Dsu
    {
        private readonly int[] parent, size;
        public int Components { get; private set; }
        public Dsu(int n)
        {
            parent = new int[n]; size = new int[n]; Components = n;
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
            parent[rb] = ra; size[ra] += size[rb]; Components--; return true;
        }
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(2, FindCircleNum(new[] { new[] { 1,1,0 }, new[] { 1,1,0 }, new[] { 0,0,1 } }));
        Check(3, FindCircleNum(new[] { new[] { 1,0,0 }, new[] { 0,1,0 }, new[] { 0,0,1 } }));
        Check(1, FindCircleNum(new[] { new[] { 1 } }));
        Check(1, FindCircleNum(new[] { new[] { 1,1,0 }, new[] { 1,1,1 }, new[] { 0,1,1 } }));
        Check(2, FindCircleNum(new[] { new[] { 1,1,0,0 }, new[] { 1,1,0,0 }, new[] { 0,0,1,1 }, new[] { 0,0,1,1 } }));
        Console.WriteLine("Number of Provinces checks passed.");
    }
}
```

## Correctness argument

Initially, DSU and the graph of processed matrix entries both have singleton components. When an upper-triangle entry is 1, union merges exactly the graph components joined by that direct connection; when it is 0, neither changes. Thus after each inspected pair the DSU partition equals the connected components of processed edges. At the end it equals the province partition, so the maintained component count is the required answer.

## Step-by-step dry run

For `[[1,1,0],[1,1,0],[0,0,1]]`, the upper triangle visits `(0,1)`, `(0,2)`, `(1,2)`. The first entry is 1 and merges 0 with 1, reducing count from 3 to 2. The other entries are zero, so count stays 2.

## Time complexity

`O(n² α(n))` amortized, including up to `n(n-1)/2` DSU operations and matrix inspection.

## Space complexity

`O(n)` auxiliary DSU space.

## Edge-case tests

- Official connected-pair and identity examples are asserted.
- One city returns one province.
- A transitive chain is one province.
- Two separate pairs return two provinces.

## Reflection questions

1. Why is counting 1s in the matrix incorrect?
2. Why is processing only the upper triangle valid here?
3. When might DFS/BFS be a simpler choice than DSU for this problem?

Source: [LeetCode: Number of Provinces](https://leetcode.com/problems/number-of-provinces/).
