# weighted shortest paths and distance relaxation — Problem: Path With Minimum Effort

## Goals

- Apply Dijkstra to a minimax path objective.
- Relax with the maximum edge effort seen so far.
- Return when the destination is removed with its current minimum effort.

## Problem statement

Move orthogonally from the top-left to bottom-right of a height grid. A path's effort is the largest absolute height difference between consecutive cells. Return the path whose effort is minimized.

## Input constraints

- 1 <= rows, columns <= 100.
- 1 <= height <= 1,000,000.
- Moves are up, down, left, or right.

## Examples with expected output

1. [[1,2,2],[3,8,2],[5,3,5]] -> 2.
2. [[1,2,3],[3,8,4],[5,3,5]] -> 1.
3. [[1,2,1,1,1],[1,2,1,2,1],[1,2,1,2,1],[1,2,1,2,1],[1,1,1,2,1]] -> 0.
4. [[7]] -> 0.

## Clarifying assumptions

- Path cost combines edges by maximum, not sum.
- Absolute height difference fits Int32 under constraints.
- Dijkstra applies because extending a path by an edge never decreases its minimax cost.

## Progressive hints

1. Treat each cell as a vertex and its adjacent cell difference as edge effort.
2. A route's cost is the maximum edge weight along it.
3. Candidate effort is max(current effort, next edge difference).
4. Use a min-priority queue and skip stale efforts.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int MinimumEffortPath(int[][] heights)
    {
        if (heights is null) throw new ArgumentNullException(nameof(heights));
        if (heights.Length == 0 || heights[0] is null) throw new ArgumentException("Grid must be nonempty and rectangular.", nameof(heights));
        int rows = heights.Length, columns = heights[0].Length;
        for (int r = 0; r < rows; r++)
            if (heights[r] is null || heights[r].Length != columns)
                throw new ArgumentException("Grid must be rectangular.", nameof(heights));

        int total = rows * columns, target = total - 1;
        var effort = new int[total];
        Array.Fill(effort, int.MaxValue);
        effort[0] = 0;
        var queue = new PriorityQueue<int, int>();
        queue.Enqueue(0, 0);
        int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };

        while (queue.TryDequeue(out int id, out int currentEffort))
        {
            if (currentEffort != effort[id]) continue;
            if (id == target) return currentEffort;
            int row = id / columns, column = id % columns;
            for (int d = 0; d < 4; d++)
            {
                int nr = row + dr[d], nc = column + dc[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
                int nextId = nr * columns + nc;
                int edgeEffort = Math.Abs(heights[row][column] - heights[nr][nc]);
                int candidate = Math.Max(currentEffort, edgeEffort);
                if (candidate >= effort[nextId]) continue;
                effort[nextId] = candidate;
                queue.Enqueue(nextId, candidate);
            }
        }
        throw new InvalidOperationException("Every rectangular grid cell is reachable.");
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(MinimumEffortPath(new[] { new[] { 1, 2, 2 }, new[] { 3, 8, 2 }, new[] { 5, 3, 5 } }), 2, "Example 1");
        Equal(MinimumEffortPath(new[] { new[] { 1, 2, 3 }, new[] { 3, 8, 4 }, new[] { 5, 3, 5 } }), 1, "Example 2");
        Equal(MinimumEffortPath(new[] { new[] { 1, 2, 1, 1, 1 }, new[] { 1, 2, 1, 2, 1 }, new[] { 1, 2, 1, 2, 1 }, new[] { 1, 2, 1, 2, 1 }, new[] { 1, 1, 1, 2, 1 } }), 0, "Example 3");
        Equal(MinimumEffortPath(new[] { new[] { 7 } }), 0, "single cell");
        Console.WriteLine("All Minimum Effort checks passed.");
    }
}
```

## Correctness argument

Define dist[cell] as the smallest possible maximum edge difference on any route from the start. Extending a route with current effort c over an edge of cost w produces max(c,w), so relaxation computes exactly the best route through the current cell. This extension is monotone and nondecreasing, which allows Dijkstra's minimum-extraction argument: once a cell with minimum tentative effort is popped, no later route can improve it. The first valid pop of the destination is therefore optimal.

## Step-by-step dry run

For the first grid, the route 1->3->5->3->5 has edge differences 2,2,2,2; its maximum is 2. A route through height 8 includes an edge difference 6 and cannot improve this value.

## Time complexity

O(V log V) with a binary heap, where V=rows*columns and each cell has at most four neighbors.

## Space complexity

O(V) for best efforts and priority queue.

## Alternatives and tradeoffs

- Binary search an effort threshold and test connectivity with BFS; this is simpler when a known numeric range is small.
- A minimum spanning tree path also yields minimax effort, but building and proving that alternative is outside this unit.
- Dijkstra is a direct fit for the monotone max-combine objective.

## Common mistakes and gotchas

- Summing height differences instead of taking the maximum.
- Returning when destination is first inserted rather than minimum-extracted.
- Using four-direction bounds incorrectly on rectangular grids.
- Applying ordinary additive Dijkstra code without changing the relaxation operator.

## Edge-case tests

- One cell.
- All equal heights, answer zero.
- Narrow corridor with one large jump.
- Rectangular, not just square, grid.
- Several routes where a longer route has lower maximum edge cost.

## Reflection questions

1. What is the path-combination operation here?
2. Why is the candidate the maximum of two efforts?
3. Why does min-extraction still work?
4. What alternative could test a fixed effort threshold?

Source: [LeetCode: Path With Minimum Effort](https://leetcode.com/problems/path-with-minimum-effort/).
