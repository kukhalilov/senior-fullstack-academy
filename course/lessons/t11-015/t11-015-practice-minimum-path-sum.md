# dynamic programming states, recurrences, and tabulation — Problem: Minimum Path Sum

## Goals
- Minimize the sum along a top-left to bottom-right grid path.
- Define each cell's optimum from its upper and left predecessors.
- Update one row in place while retaining the needed old and new values.

## Problem statement
Given a nonempty rectangular grid of nonnegative values, move only right or down from the top-left to bottom-right. Return the minimum sum of the visited cell values, including both endpoints.

## Input constraints
- m == grid.Length and n == grid[r].Length.
- 1 <= m,n <= 200.
- 0 <= grid[r][c] <= 200.

## Examples with expected output
- [[1,3,1],[1,5,1],[4,2,1]] -> 7.
- [[1,2,3],[4,5,6]] -> 12.
- [[0]] -> 0.

## Clarifying assumptions
- The grid is rectangular and nonempty.
- Every cell is traversable.
- The path includes the starting and destination cell values.

## Progressive hints
1. Let dp[r,c] be the least path sum ending at cell (r,c).
2. The last move comes from above or left, except at boundaries.
3. Add the current cell value to the smaller predecessor sum.
4. In a rolling row, preserve the old above value and use the updated left value.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int MinPathSum(int[][] grid)
    {
        if (grid.Length == 0 || grid[0].Length == 0)
            throw new ArgumentException("Grid must be nonempty.", nameof(grid));

        int rows = grid.Length;
        int cols = grid[0].Length;
        var dp = new int[cols];
        Array.Fill(dp, int.MaxValue);
        dp[0] = 0;

        for (int row = 0; row < rows; row++)
        {
            for (int col = 0; col < cols; col++)
            {
                if (col == 0)
                    dp[col] += grid[row][col];
                else
                    dp[col] = Math.Min(dp[col], dp[col - 1]) + grid[row][col];
            }
        }
        return dp[cols - 1];
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(7, MinPathSum(new[] { new[] { 1, 3, 1 }, new[] { 1, 5, 1 }, new[] { 4, 2, 1 } }));
        Check(12, MinPathSum(new[] { new[] { 1, 2, 3 }, new[] { 4, 5, 6 } }));
        Check(0, MinPathSum(new[] { new[] { 0 } }));
        Check(6, MinPathSum(new[] { new[] { 1, 2, 3 } }));
        Check(6, MinPathSum(new[] { new[] { 1 }, new[] { 2 }, new[] { 3 } }));
        Console.WriteLine("Minimum Path Sum checks passed.");
    }
}
```

## Correctness argument

For cell (r,c), a valid path's last move is from above or left, except when it lies on the top row or first column. Therefore the minimum ending sum is the cell value plus the smaller available predecessor sum. The array starts at positive infinity except dp[0]=0. On the first row, each cell chooses the already updated left value; on later rows, dp[c] still contains the previous-row value from above, and dp[c-1] contains the current-row value from the left. At col=0, only the above path exists, so adding the cell value advances that boundary path. Induction over row-major order proves each stored value is the minimum for its cell.

## Step-by-step dry run

For [[1,3,1],[1,5,1],[4,2,1]], after row 0 the rolling values are [1,4,5]. Row 1 becomes [2,7,6]. Row 2 becomes [6,8,7]. The destination minimum is 7.

## Time complexity

O(mn), one transition per cell.

## Space complexity

O(n) for the rolling row.

## Alternatives and tradeoffs

- A full 2D table uses O(mn) memory and makes predecessor inspection and path reconstruction simpler.
- A recursive memoized solution follows the same recurrence but may reach O(m+n) recursion depth.
- To reconstruct a path with the rolling version, store predecessor directions separately or retain the full table.

## Common mistakes and gotchas

- Omitting the starting cell's value.
- Using max instead of min.
- Reading the already-updated left state as if it were from above.
- Initializing unreachable cells to zero, which creates artificial low-cost routes.
- Adding arbitrary infinity sentinels without ensuring no overflow; this initialization only adds a cell to a finite predecessor on reachable boundary/interior states.

## Edge-case tests

- One cell.
- One row and one column.
- Zeros and equal-cost alternative paths.
- A path where choosing the locally smaller cell initially does not by itself decide the remaining route.

## Reflection questions
1. Why is row-major order a valid topological order?
2. Which dp value is old and which is new during an interior update?
3. What extra data is needed to recover the path itself?

## Source
- [Minimum Path Sum](https://leetcode.com/problems/minimum-path-sum/)
