# disjoint-set union and connectivity maintenance — Problem: Most Stones Removed with Same Row or Column

## Goals
- Translate row/column sharing into connectivity in a bipartite incidence graph.
- Count only row and column IDs that occur in the input.
- Prove the maximum removable count is stones minus occupied components.

## Problem statement

There are stones on distinct integer coordinate points. A stone can be removed when another remaining stone shares its row or column. Return the largest number of stones that can be removed.

## Input constraints
- `1 <= stones.Length <= 1000`.
- `0 <= x_i,y_i <= 10^4`.
- No two stones have the same coordinate pair.

## Examples with expected output
- `[[0,0],[0,1],[1,0],[1,2],[2,1],[2,2]] -> 5`.
- `[[0,0],[0,2],[1,1],[2,0],[2,2]] -> 3`.
- `[[0,0]] -> 0`.

## Clarifying assumptions

Rows and columns are different entity types even if their coordinate integers match. Represent each stone as an edge between a row node and a column node. The components of this bipartite graph correspond to components in a graph whose vertices are stones and whose edges join stones that share a row or column.

## Progressive hints
1. Use separate ID namespaces for rows and columns, e.g. row `x` and column `10001+y`.
2. Union the row node and column node for each stone.
3. Count roots among the touched IDs only; answer `stones.Length - occupiedComponentCount`.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static int RemoveStones(int[][] stones)
    {
        const int offset = 10001;
        var dsu = new Dsu(offset * 2);
        var touched = new HashSet<int>();
        foreach (int[] stone in stones)
        {
            int row = stone[0], column = offset + stone[1];
            touched.Add(row); touched.Add(column);
            dsu.Union(row, column);
        }
        int components = touched.Select(dsu.Find).Distinct().Count();
        return stones.Length - components;
    }

    sealed class Dsu
    {
        private readonly int[] parent, size;
        public Dsu(int n)
        {
            parent = new int[n]; size = new int[n];
            for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
        }
        public int Find(int x)
        {
            while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }
            return x;
        }
        public bool Union(int a, int b)
        {
            int ra = Find(a), rb = Find(b);
            if (ra == rb) return false;
            if (size[ra] < size[rb]) (ra, rb) = (rb, ra);
            parent[rb] = ra; size[ra] += size[rb]; return true;
        }
    }

    static void Check(int expected, int[][] stones)
    {
        int actual = RemoveStones(stones);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(5, new[] { new[] {0,0}, new[] {0,1}, new[] {1,0}, new[] {1,2}, new[] {2,1}, new[] {2,2} });
        Check(3, new[] { new[] {0,0}, new[] {0,2}, new[] {1,1}, new[] {2,0}, new[] {2,2} });
        Check(0, new[] { new[] {0,0} });
        Check(1, new[] { new[] {0,0}, new[] {0,1}, new[] {2,2} });
        Console.WriteLine("Most Stones Removed checks passed.");
    }
}
```

## Correctness argument

Two stones are in one incidence-graph component exactly when a chain of stones links them by shared rows or columns. Equivalently, the graph whose vertices are stones and whose edges connect row/column-sharing pairs has the same components. For a connected component with k stones, choose a spanning tree of that stone graph. While more than one stone remains, remove a leaf of the remaining spanning tree: its parent stone is still present and shares its row or column, so removal is legal. This removes k-1 stones; the last stone has no remaining partner and cannot be removed. Summing over components gives `n - componentCount`. DSU unions each stone's row and column, constructing precisely these components.

## Step-by-step dry run

For `[[0,0],[0,1],[1,0]]`, use row IDs 0 and 1, and column IDs 10001 and 10002. The unions produce one connected component containing all four touched nodes. There are three stones and one occupied component, so two can be removed.

## Time complexity

`O(n α(M))` amortized plus expected set operations, where `M=20002` is the fixed DSU ID universe.

## Space complexity

`O(M+n)` for parent/size arrays and the touched-ID set.

## Edge-case tests

- All three official examples are asserted.
- One stone returns zero.
- Two stones in one component plus an isolated stone yield two occupied components, so one of three stones is removable.
- Coordinate equality between a row and a column does not cause an ID collision because of the offset.

## Reflection questions

1. Why does a connected component with k stones leave exactly one behind?
2. Why should unused row/column IDs not be counted?
3. Could DSU elements instead be stones? What pairwise unions would you need, and how could that affect time?

Source: [LeetCode: Most Stones Removed with Same Row or Column](https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/).
