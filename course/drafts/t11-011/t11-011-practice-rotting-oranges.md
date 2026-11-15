# graph models, representations, and traversal — Problem: Rotting Oranges

## Goals

- Model simultaneous spread as multi-source BFS.
- Interpret one BFS layer as one minute.
- Detect fresh oranges unreachable from all initial rotten sources.

## Problem statement

Cells are empty (0), fresh (1), or rotten (2). Each minute, fresh oranges adjacent in four directions to any rotten orange become rotten. Return the minimum minutes until no fresh remain, or -1 if impossible.

## Input constraints

- 1 <= rows, columns <= 10.
- Every cell is 0, 1, or 2.
- Only orthogonal adjacency causes spread.

## Examples with expected output

1. [[2,1,1],[1,1,0],[0,1,1]] -> 4.
2. [[2,1,1],[0,1,1],[1,0,1]] -> -1.
3. [[0,2]] -> 0.
4. [[1]] -> -1.

## Clarifying assumptions

- All initially rotten cells are time-zero sources.
- A cell is marked rotten when enqueued, ensuring it is processed once.
- The grid is mutated in place.

## Progressive hints

1. Enqueue every rotten orange before beginning propagation.
2. Count fresh oranges to know when the process is complete.
3. Process a fixed queue-size snapshot per minute.
4. If fresh remain after the frontier empties, some are unreachable.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int OrangesRotting(int[][] grid)
    {
        if (grid is null) throw new ArgumentNullException(nameof(grid));
        if (grid.Length == 0) return 0;
        int rows = grid.Length;
        if (grid[0] is null) throw new ArgumentException("Grid must be rectangular.", nameof(grid));
        int columns = grid[0].Length;
        for (int r = 0; r < rows; r++)
            if (grid[r] is null || grid[r].Length != columns)
                throw new ArgumentException("Grid must be rectangular.", nameof(grid));

        var queue = new Queue<(int Row, int Column)>();
        int fresh = 0;
        for (int r = 0; r < rows; r++)
        for (int c = 0; c < columns; c++)
        {
            if (grid[r][c] == 2) queue.Enqueue((r, c));
            else if (grid[r][c] == 1) fresh++;
        }
        if (fresh == 0) return 0;

        int minutes = 0;
        int[] dr = { -1, 1, 0, 0 };
        int[] dc = { 0, 0, -1, 1 };
        while (queue.Count > 0 && fresh > 0)
        {
            int levelSize = queue.Count;
            for (int i = 0; i < levelSize; i++)
            {
                (int row, int column) = queue.Dequeue();
                for (int d = 0; d < 4; d++)
                {
                    int nr = row + dr[d], nc = column + dc[d];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 2;
                    fresh--;
                    queue.Enqueue((nr, nc));
                }
            }
            minutes++;
        }
        return fresh == 0 ? minutes : -1;
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
        Equal(OrangesRotting(Grid(new[] { 2, 1, 1 }, new[] { 1, 1, 0 }, new[] { 0, 1, 1 })), 4, "Example 1");
        Equal(OrangesRotting(Grid(new[] { 2, 1, 1 }, new[] { 0, 1, 1 }, new[] { 1, 0, 1 })), -1, "Example 2");
        Equal(OrangesRotting(Grid(new[] { 0, 2 })), 0, "no fresh");
        Equal(OrangesRotting(Grid(new[] { 1 })), -1, "unreachable fresh");
        Console.WriteLine("All Rotting Oranges checks passed.");
    }
}
```

## Correctness argument

All initially rotten cells enter the queue at distance zero, which represents minute zero. BFS processes all cells at distance d before cells at distance d+1. Each fresh neighbor is marked rotten and enqueued at first discovery, so its distance is the minimum number of propagation steps from any initial source. A level therefore corresponds to one elapsed minute. If all fresh cells are reached, the last processed layer number is the minimum time; if the queue empties while fresh remains, those cells cannot be reached and the answer is -1.

## Step-by-step dry run

For [[2,1,1],[1,1,0],[0,1,1]], the initial source is (0,0). Minute 1 rots (0,1) and (1,0); minute 2 reaches the adjacent fresh cells; later layers reach the lower-right cells. The farthest fresh cell is reached after four layers.

## Time complexity

O(rows*columns); each cell enters the queue at most once.

## Space complexity

O(rows*columns) for the queue in the worst case.

## Alternatives and tradeoffs

- Repeatedly scanning the whole grid by minute can cost O((rows*columns)^2); multi-source BFS visits each cell once.
- A distance matrix is unnecessary when only the total elapsed time is required; levels encode distance.

## Common mistakes and gotchas

- Starting BFS from only one rotten orange.
- Incrementing time for an initial state with no fresh oranges.
- Counting queue operations individually as minutes instead of processing layers.
- Marking fresh cells after dequeue and allowing duplicate queue entries.
- Allowing diagonal spread.

## Edge-case tests

- No fresh cells initially.
- Fresh cells but no rotten sources.
- Multiple initial sources.
- Isolated fresh region.
- Single-row or single-column propagation.

## Reflection questions

1. Why enqueue every initial source before starting?
2. Why does each BFS layer represent one minute?
3. When should the answer be zero?
4. What does an unprocessed fresh cell prove after the queue empties?

Source: [LeetCode: Rotting Oranges](https://leetcode.com/problems/rotting-oranges/).
