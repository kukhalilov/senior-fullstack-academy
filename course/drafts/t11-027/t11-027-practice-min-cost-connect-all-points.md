# disjoint-set union and connectivity maintenance — Problem: Min Cost to Connect All Points

## Goals
- Recognize that the required network is a minimum spanning tree of the complete graph.
- Use Kruskal's increasing-edge order and DSU's successful unions.
- Analyze the quadratic edge count and understand when materializing it stops scaling.

## Problem statement

The cost to connect points i and j is their Manhattan distance, `|x_i-x_j| + |y_i-y_j|`. Return the minimum total cost to connect all points so that exactly one simple path exists between every pair (a minimum spanning tree).

## Input constraints
- `1 <= points.Length <= 1000`.
- Each coordinate is between `-10^6` and `10^6`, inclusive.
- All coordinate pairs are distinct.

## Examples with expected output
- `[[0,0],[2,2],[3,10],[5,2],[7,0]] -> 20`.
- `[[3,12],[-2,5],[-4,1]] -> 18`.
- `[[1,1]] -> 0`.

## Clarifying assumptions

There is an edge between every pair, so the graph is connected. The maximum individual Manhattan distance is 4,000,000. The result fits the problem's integer return type under the stated point limit; the implementation nevertheless accumulates in `long`. The complete edge list has `n(n-1)/2` entries, up to 499,500.

## Progressive hints
1. Compute one candidate edge for each pair of points.
2. Sort edges by weight. A light edge joining separate components is safe for an MST by Kruskal's cut argument.
3. Add its weight only if union succeeds; stop after `n-1` accepted edges.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

static class Program
{
    static int MinCostConnectPoints(int[][] points)
    {
        int n = points.Length;
        var edges = new List<(int Weight, int A, int B)>(n * (n - 1) / 2);
        for (int i = 0; i < n; i++)
            for (int j = i + 1; j < n; j++)
            {
                int weight = Math.Abs(points[i][0] - points[j][0]) + Math.Abs(points[i][1] - points[j][1]);
                edges.Add((weight, i, j));
            }

        edges.Sort((x, y) => x.Weight.CompareTo(y.Weight));
        var dsu = new Dsu(n);
        long total = 0;
        int accepted = 0;
        foreach (var edge in edges)
        {
            if (!dsu.Union(edge.A, edge.B)) continue;
            total += edge.Weight;
            if (++accepted == n - 1) break;
        }
        return checked((int)total);
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
            parent[rb] = ra; size[ra] += size[rb]; return true;
        }
    }

    static void Check(int expected, int[][] points)
    {
        int actual = MinCostConnectPoints(points);
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void Main()
    {
        Check(20, new[] { new[] {0,0}, new[] {2,2}, new[] {3,10}, new[] {5,2}, new[] {7,0} });
        Check(18, new[] { new[] {3,12}, new[] {-2,5}, new[] {-4,1} });
        Check(0, new[] { new[] {1,1} });
        Check(4, new[] { new[] {0,0}, new[] {0,2}, new[] {2,0} });
        Console.WriteLine("Min Cost to Connect All Points checks passed.");
    }
}
```

## Correctness argument

Initially every point is a separate component. Processing edges in nondecreasing weight, a successful union adds an edge between two different components, so it cannot create a cycle; a failed union would create one and is skipped. Kruskal's cut property ensures each chosen lightest edge joining distinct components is safe for some minimum spanning tree. Since the complete graph is connected, the process reaches one component after `n-1` accepted edges. Those edges form a minimum spanning tree, and their sum is the minimum network cost.

## Step-by-step dry run

For three points `(0,0)`, `(0,2)`, `(2,0)`, the pair weights are 2, 2, and 4. The first two edges each join distinct components and are accepted, giving total 4 and one component. The last edge is not needed. The MST cost is 4.

## Time complexity

There are `E=n(n-1)/2` edges. Sorting costs `O(E log E)` and DSU processing costs `O(E α(n))` amortized; overall `O(n² log n)`.

## Space complexity

`O(n²)` for the explicit edge list, plus `O(n)` for DSU.

## Edge-case tests

- Both official examples are asserted.
- A single point returns zero and accepts no edges.
- A 3-point right angle verifies Manhattan weights and stopping at `n-1` accepted edges.
- Use `CompareTo` instead of subtracting weights in the sort comparator.

## Reflection questions

1. What does DSU contribute, and what does sorting contribute?
2. Why must exactly `n-1` edges be accepted for a tree on n points?
3. Why does storing all complete-graph edges become the scalability bottleneck before DSU does?

Source: [LeetCode: Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points/).
