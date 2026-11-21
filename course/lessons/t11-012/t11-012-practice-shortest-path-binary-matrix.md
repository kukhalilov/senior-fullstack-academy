# weighted shortest paths and distance relaxation — Problem: Shortest Path in Binary Matrix

## Goals

- Recognize equal-cost moves and use BFS for shortest path length.
- Generate all eight neighboring cells with bounds checks.
- Count path length in visited cells, including both endpoints.

## Problem statement

In an n-by-n binary matrix, find the shortest path from top-left to bottom-right through zero cells. Movement may use any of eight neighboring cells, including diagonals. Return the number of visited cells or -1 if no clear path exists.

## Input constraints

- 1 <= n <= 100.
- The matrix is n-by-n and each value is 0 or 1.
- Only zero-valued cells may be used.
- Length counts cells, not edges.

## Examples with expected output

1. [[0,1],[1,0]] -> 2.
2. [[0,0,0],[1,1,0],[1,1,0]] -> 4.
3. [[1,0,0],[1,1,0],[1,1,0]] -> -1.
4. [[0]] -> 1.

## Clarifying assumptions

- Eight-direction movement includes diagonals.
- The starting cell is included in path length.
- A blocked start or destination makes the path impossible.

## Progressive hints

1. Each move has unit cost, so BFS finds a shortest path.
2. Start distance is one because the path counts cells.
3. Mark a cell when enqueuing it.
4. Generate row and column offsets from -1 through 1, excluding (0,0).

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int ShortestPathBinaryMatrix(int[][] grid)
    {
        if (grid is null) throw new ArgumentNullException(nameof(grid));
        int n = grid.Length;
        if (n == 0) return -1;
        for (int r = 0; r < n; r++)
            if (grid[r] is null || grid[r].Length != n)
                throw new ArgumentException("Grid must be square.", nameof(grid));
        if (grid[0][0] != 0 || grid[n - 1][n - 1] != 0) return -1;

        var distance = new int[n, n];
        for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++)
            distance[r, c] = -1;
        var queue = new Queue<(int Row, int Column)>();
        distance[0, 0] = 1;
        queue.Enqueue((0, 0));

        while (queue.Count > 0)
        {
            (int row, int column) = queue.Dequeue();
            if (row == n - 1 && column == n - 1) return distance[row, column];
            for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++)
            {
                if (dr == 0 && dc == 0) continue;
                int nr = row + dr, nc = column + dc;
                if (nr < 0 || nr >= n || nc < 0 || nc >= n || grid[nr][nc] != 0 || distance[nr, nc] != -1) continue;
                distance[nr, nc] = distance[row, column] + 1;
                queue.Enqueue((nr, nc));
            }
        }
        return -1;
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
        Equal(ShortestPathBinaryMatrix(Grid(new[] { 0, 1 }, new[] { 1, 0 })), 2, "Example 1 diagonal");
        Equal(ShortestPathBinaryMatrix(Grid(new[] { 0, 0, 0 }, new[] { 1, 1, 0 }, new[] { 1, 1, 0 })), 4, "Example 2");
        Equal(ShortestPathBinaryMatrix(Grid(new[] { 1, 0, 0 }, new[] { 1, 1, 0 }, new[] { 1, 1, 0 })), -1, "blocked start");
        Equal(ShortestPathBinaryMatrix(Grid(new[] { 0 })), 1, "single cell");
        Equal(ShortestPathBinaryMatrix(Grid(new[] { 0, 1 }, new[] { 1, 1 })), -1, "blocked destination");
        Console.WriteLine("All Binary Matrix Shortest Path checks passed.");
    }
}
```

## Correctness argument

The grid induces an unweighted graph whose vertices are clear cells and whose edges connect the eight permitted neighboring positions. BFS processes cells in nondecreasing edge distance from the start. Distances are initialized to one at the start and increase by one per edge, so they equal the number of cells along a path. Marking at enqueue makes the first assigned distance shortest and prevents repeat entries. The destination's first dequeue is therefore minimum; exhausting the queue proves it is unreachable.

## Step-by-step dry run

In [[0,1],[1,0]], the two diagonal cells are adjacent under eight-direction movement. Start has length 1; enqueue destination with length 2 and return 2.

## Time complexity

O(n²), each cell is enqueued at most once and checks eight neighbors.

## Space complexity

O(n²) distance matrix and queue.

## Alternatives and tradeoffs

- If only four-direction movement were allowed, the first example would be unreachable; directions are part of the graph definition.
- A separate visited matrix could replace the distance initialization but would require storing distance another way.

## Common mistakes and gotchas

- Using only four directions.
- Counting edges and returning one less than requested.
- Enqueuing blocked cells.
- Marking visited on dequeue.
- Forgetting start or destination blocked checks.

## Edge-case tests

- Blocked start and destination.
- Single-cell open or blocked grid.
- Diagonal-only connection.
- No path despite an open destination.
- Multiple shortest paths.

## Reflection questions

1. Why is BFS appropriate here?
2. Why initialize path length to one?
3. What defines neighbor adjacency?
4. How would four-direction connectivity change results?

Source: [LeetCode: Shortest Path in Binary Matrix](https://leetcode.com/problems/shortest-path-in-binary-matrix/).
