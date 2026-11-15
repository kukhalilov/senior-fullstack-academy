# graph models, representations, and traversal — Problem: Max Area of Island

## Goals

- Aggregate the size of each connected component.
- Reuse iterative grid flood fill while marking cells once.
- Return zero when no land exists.

## Problem statement

Given a binary grid, return the largest area among islands connected horizontally or vertically. Area is the number of land cells.

## Input constraints

- 1 <= rows, columns <= 50.
- Each value is 0 or 1.
- Connectivity is four-directional; boundaries are water.

## Examples with expected output

1. In the supplied multi-region grid, the largest four-connected component has area 6.
2. An all-zero row -> 0.
3. [[1,1],[1,0]] -> 3.

## Clarifying assumptions

- The method mutates visited land cells from 1 to 0.
- Component area counts cells, not perimeter or diagonal contact.
- The grid is rectangular.

## Progressive hints

1. Start a flood fill from every unseen land cell.
2. Count every popped cell in that component.
3. Track the maximum component count.
4. Mark neighbors before pushing.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public static class Program
{
    public static int MaxAreaOfIsland(int[][] grid)
    {
        if (grid is null) throw new ArgumentNullException(nameof(grid));
        if (grid.Length == 0) return 0;
        if (grid[0] is null) throw new ArgumentException("Grid must be rectangular.", nameof(grid));
        int rows = grid.Length, columns = grid[0].Length;
        for (int r = 0; r < rows; r++)
            if (grid[r] is null || grid[r].Length != columns)
                throw new ArgumentException("Grid must be rectangular.", nameof(grid));

        int best = 0;
        int[] dr = { -1, 1, 0, 0 }, dc = { 0, 0, -1, 1 };
        var stack = new Stack<(int Row, int Column)>();
        for (int r = 0; r < rows; r++)
        for (int c = 0; c < columns; c++)
        {
            if (grid[r][c] != 1) continue;
            grid[r][c] = 0;
            stack.Push((r, c));
            int area = 0;
            while (stack.Count > 0)
            {
                (int row, int column) = stack.Pop();
                area++;
                for (int d = 0; d < 4; d++)
                {
                    int nr = row + dr[d], nc = column + dc[d];
                    if (nr < 0 || nr >= rows || nc < 0 || nc >= columns || grid[nr][nc] != 1) continue;
                    grid[nr][nc] = 0;
                    stack.Push((nr, nc));
                }
            }
            best = Math.Max(best, area);
        }
        return best;
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
        Equal(MaxAreaOfIsland(Grid(new[] { 0, 0, 1, 0, 0 }, new[] { 0, 1, 1, 0, 0 }, new[] { 0, 1, 0, 0, 1 }, new[] { 0, 0, 0, 1, 1 })), 4, "components");
        Equal(MaxAreaOfIsland(Grid(new[] { 0, 0, 0, 0 })), 0, "all water");
        Equal(MaxAreaOfIsland(Grid(new[] { 1, 1 }, new[] { 1, 0 })), 3, "connected corner");
        Equal(MaxAreaOfIsland(Grid(new[] { 1, 0 }, new[] { 0, 1 })), 1, "diagonal only");
        Console.WriteLine("All Max Area of Island checks passed.");
    }
}
```

## Correctness argument

Every land cell encountered by the outer scan starts one flood fill because previously discovered land has been changed to water. The stack visits every cell connected to that seed through four-directional land edges and counts each once because cells are marked before pushing. The resulting area is exactly that component's size. Taking the maximum over all components returns the largest island, or zero if none exist.

## Step-by-step dry run

For [[1,1],[1,0]], start at the upper-left, mark it, and push. Its right and lower neighbors are both land and are marked/pushed. Pop all three cells; area is 3. No other land remains.

## Time complexity

O(rows*columns); every cell is scanned and each land cell is pushed once.

## Space complexity

O(rows*columns) worst-case stack.

## Alternatives and tradeoffs

- Recursive DFS is shorter but can use recursion proportional to component size.
- A visited matrix avoids mutating input but adds O(rows*columns) storage.
- BFS is equally correct; only frontier order differs.

## Common mistakes and gotchas

- Counting diagonal neighbors.
- Updating the maximum for each cell rather than each completed component.
- Marking on pop, so cells can enter the stack multiple times.
- Returning -1 for no land instead of 0.

## Edge-case tests

- All water.
- All land.
- Several differently sized components.
- Diagonal-only contact.
- One row or column.

## Reflection questions

1. Why count within each flood fill?
2. What prevents duplicate cell visits?
3. How is area different from perimeter?
4. What is the correct result for no island?

Source: [LeetCode: Max Area of Island](https://leetcode.com/problems/max-area-of-island/).
