# graph models, representations, and traversal — Problem: Number of Islands

## Goals

- Model a grid as an implicit undirected graph.
- Count connected land components with iterative flood fill.
- Mark cells when adding them to the frontier.

## Problem statement

Given a grid of '1' land and '0' water, count islands connected horizontally or vertically. The grid boundary is surrounded by water.

## Input constraints

- 1 <= rows, columns <= 300.
- Every cell is '0' or '1'.
- Only four orthogonal directions connect land.

## Examples with expected output

1. [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]] -> 1.
2. [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]] -> 3.
3. A grid of only water -> 0.

## Clarifying assumptions

- The method mutates visited land from '1' to '0'.
- A new island is counted when a row-major scan finds unvisited land.
- The implementation uses an explicit stack to avoid recursive depth up to 90,000 cells.

## Progressive hints

1. Every connected component of land is one island.
2. Count each unseen land cell, then flood-fill its component.
3. Mark a neighbor before pushing it to prevent duplicate pushes.
4. Generate only up, down, left, and right neighbors.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int NumIslands(char[][] grid)
    {
        if (grid is null) throw new ArgumentNullException(nameof(grid));
        if (grid.Length == 0) return 0;
        if (grid[0] is null) throw new ArgumentException("Grid must be rectangular.", nameof(grid));
        int rows = grid.Length, columns = grid[0].Length;
        for (int r = 0; r < rows; r++)
            if (grid[r] is null || grid[r].Length != columns)
                throw new ArgumentException("Grid must be rectangular.", nameof(grid));

        int islands = 0;
        int[] dr = { -1, 1, 0, 0 };
        int[] dc = { 0, 0, -1, 1 };
        var stack = new Stack<(int Row, int Column)>();
        for (int r = 0; r < rows; r++)
        for (int c = 0; c < columns; c++)
        {
            if (grid[r][c] != '1') continue;
            islands++;
            grid[r][c] = '0';
            stack.Push((r, c));
            while (stack.Count > 0)
            {
                (int row, int column) = stack.Pop();
                for (int direction = 0; direction < 4; direction++)
                {
                    int nr = row + dr[direction], nc = column + dc[direction];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || grid[nr][nc] != '1') continue;
                    grid[nr][nc] = '0';
                    stack.Push((nr, nc));
                }
            }
        }
        return islands;
    }

    private static char[][] Grid(params string[] rows)
    {
        var result = new char[rows.Length][];
        for (int i = 0; i < rows.Length; i++) result[i] = rows[i].ToCharArray();
        return result;
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(NumIslands(Grid("11110", "11010", "11000", "00000")), 1, "Example 1");
        Equal(NumIslands(Grid("11000", "11000", "00100", "00011")), 3, "Example 2");
        Equal(NumIslands(Grid("000")), 0, "all water");
        Equal(NumIslands(Grid("1")), 1, "one land cell");
        Console.WriteLine("All Number of Islands checks passed.");
    }
}
```

## Correctness argument

When the scan reaches a land cell, it has not been reached by an earlier flood fill because every discovered land cell is changed to water when enqueued. Therefore this cell is the first encountered representative of one component and increments the count exactly once. The stack explores every orthogonally adjacent land cell, marking each before enqueueing; by induction it reaches exactly the component. Once drained, no cell in that component remains unmarked. Thus each island contributes one increment and no island is counted twice.

## Step-by-step dry run

For [1,1,0; 1,0,0; 0,0,1], the scan sees the top-left land and increments once; flood fill marks its two connected cells. Later it reaches the bottom-right land, which is a different component, increments again, and marks it. The answer is 2.

## Time complexity

O(rows*columns); each cell is examined a constant number of times.

## Space complexity

O(rows*columns) worst-case explicit stack.

## Alternatives and tradeoffs

- Recursive DFS has the same asymptotic bound but may overflow the call stack on a large filled grid.
- BFS uses a queue instead of stack but finds no needed shortest path here.
- A separate visited matrix preserves the input grid at an additional O(rows*columns) space cost.

## Common mistakes and gotchas

- Counting diagonal adjacency.
- Marking only when popping, allowing the same cell to be pushed repeatedly.
- Failing to mutate/mark visited cells.
- Reusing one visited state across unrelated grids.
- Assuming rows and columns are interchangeable in boundary checks.

## Edge-case tests

- All water and all land.
- One cell.
- One row or one column.
- Diagonal-only land cells.
- Large component reaching every boundary.

## Reflection questions

1. Why does each component increment the answer exactly once?
2. Why mark at push time?
3. What changes if diagonal adjacency is allowed?
4. When would a visited matrix be preferable to mutating the grid?

Source: [LeetCode: Number of Islands](https://leetcode.com/problems/number-of-islands/).
