# weighted shortest paths and distance relaxation — Problem: Minimum Obstacle Removal to Reach Corner

## Goals

- Use 0-1 BFS for edge costs restricted to zero and one.
- Put zero-cost improvements at the deque front and one-cost at the back.
- Return the minimum obstacle removals on a four-directional route.

## Problem statement

In a grid, 0 is empty and 1 is an obstacle that can be removed. Move orthogonally from top-left to bottom-right and minimize the number of removed obstacles.

## Input constraints

- 1 <= rows, columns <= 100,000; 2 <= rows*columns <= 100,000.
- Each cell is 0 or 1.
- Start and destination cells are guaranteed 0.

## Examples with expected output

1. [[0,1,1],[1,1,0],[1,1,0]] -> 2.
2. [[0,1,0,0,0],[0,1,0,1,0],[0,0,0,1,0]] -> 0.
3. [[0,1],[0,0]] -> 0.

## Clarifying assumptions

- Entering a cell costs its value; the starting cell costs zero by constraint.
- The movement graph is four-directional.
- The method does not mutate the grid.

## Progressive hints

1. Model each cell as a vertex with entering cost 0 or 1.
2. Maintain best removal counts.
3. Relax and place zero-cost updates at the front, one-cost at the back.
4. Skip deque entries whose stored distance is stale.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int MinimumObstacles(int[][] grid)
    {
        if (grid is null) throw new ArgumentNullException(nameof(grid));
        if (grid.Length == 0 || grid[0] is null) throw new ArgumentException("Grid must be nonempty and rectangular.", nameof(grid));
        int rows = grid.Length, columns = grid[0].Length;
        for (int r = 0; r < rows; r++)
            if (grid[r] is null || grid[r].Length != columns)
                throw new ArgumentException("Grid must be rectangular.", nameof(grid));

        int total = rows * columns, target = total - 1;
        var distance = new int[total];
        Array.Fill(distance, int.MaxValue);
        distance[0] = 0;
        var deque = new LinkedList<(int Id, int Cost)>();
        deque.AddFirst((0, 0));
        int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };

        while (deque.Count > 0)
        {
            (int id, int cost) = deque.First!.Value;
            deque.RemoveFirst();
            if (cost != distance[id]) continue;
            int row = id / columns, column = id % columns;
            for (int d = 0; d < 4; d++)
            {
                int nr = row + dr[d], nc = column + dc[d];
                if (nr < 0 || nr >= rows || nc < 0 || nc >= columns) continue;
                int next = nr * columns + nc;
                int candidate = cost + grid[nr][nc];
                if (candidate >= distance[next]) continue;
                distance[next] = candidate;
                if (grid[nr][nc] == 0) deque.AddFirst((next, candidate));
                else deque.AddLast((next, candidate));
            }
        }
        return distance[target];
    }

    private static int[][] Grid(params int[][] rows)
    {
        var copy = new int[rows.Length][];
        for (int i = 0; i < rows.Length; i++) copy[i] = (int[])rows[i].Clone();
        return copy;
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(MinimumObstacles(Grid(new[] { 0, 1, 1 }, new[] { 1, 1, 0 }, new[] { 1, 1, 0 })), 2, "Example 1");
        Equal(MinimumObstacles(Grid(new[] { 0, 1, 0, 0, 0 }, new[] { 0, 1, 0, 1, 0 }, new[] { 0, 0, 0, 1, 0 })), 0, "Example 2");
        Equal(MinimumObstacles(Grid(new[] { 0, 1 }, new[] { 0, 0 })), 0, "zero-cost route");
        Console.WriteLine("All Minimum Obstacle Removal checks passed.");
    }
}
```

## Correctness argument

Each grid move has cost equal to the entered cell, either zero or one. The deque ordering processes tentative distances in nondecreasing order: a zero-cost improvement does not increase distance and is placed at the front; a one-cost improvement increases it by one and goes to the back. Relaxation updates a cell only when a cheaper route is found, and stale entries are skipped. This is Dijkstra's label-setting order specialized to binary weights, so the final destination distance is the minimum obstacle cost.

## Step-by-step dry run

From the top-left in Example 1, zero-cost neighboring cells enter the front before paths that remove an obstacle. The search explores free corridors first; the best destination route removes two cells. Alternative routes with additional obstacles cannot lower its distance.

## Time complexity

O(V+E) for 0-1 BFS; a grid has V=rows*columns and E=O(V).

## Space complexity

O(V) distances and deque entries.

## Alternatives and tradeoffs

- Dijkstra with a binary heap also works in O(E log V), but ignores the special binary weight structure.
- A plain FIFO queue is invalid because a cost-one route may be discovered before a later zero-cost route.

## Common mistakes and gotchas

- Putting cost-one updates at the front.
- Marking each cell permanently visited at first discovery.
- Charging for the starting cell despite the source guarantee.
- Allowing diagonal moves.
- Ignoring stale deque entries.

## Edge-case tests

- Direct zero-cost corridor.
- Every alternative route crosses obstacles.
- Many zero-cost paths and equal-cost paths.
- One dimension equals one.
- Maximum total cell count.

## Reflection questions

1. Why is a deque sufficient for weights zero and one?
2. What changes when an edge cost is two?
3. Why can a visited-on-first-discovery flag fail?
4. How does the entering-cell convention define edge cost?

Source: [LeetCode: Minimum Obstacle Removal to Reach Corner](https://leetcode.com/problems/minimum-obstacle-removal-to-reach-corner/).
