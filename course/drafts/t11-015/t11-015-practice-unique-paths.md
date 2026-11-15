# dynamic programming states, recurrences, and tabulation — Problem: Unique Paths

## Goals
- Count paths through a rectangular grid when movement is only right or down.
- Derive a two-dimensional predecessor recurrence.
- Compress a grid table into one row.

## Problem statement
A robot starts at the top-left cell of an m by n grid and must reach the bottom-right cell. It may move only one cell right or one cell down. Return the number of distinct paths.

## Input constraints
- 1 <= m,n <= 100.
- Test data guarantees the answer is at most 2,000,000,000.

## Examples with expected output
- m=3,n=7 -> 28.
- m=3,n=2 -> 3.
- m=1,n=5 -> 1.

## Clarifying assumptions
- Grid cells are all traversable; there are no obstacles.
- Paths are distinguished by their sequence of moves.
- The numeric guarantee applies to the final result.

## Progressive hints
1. Let dp[r,c] count paths ending at cell (r,c).
2. An interior path arrives from above or from the left.
3. Every cell in the first row or first column has exactly one path.
4. In a one-row update, the old dp[c] is from above and the new dp[c-1] is from the left.

## Complete C# solution
```csharp dsa-solution
using System;

static class Program
{
    static int UniquePaths(int m, int n)
    {
        if (m <= 0 || n <= 0) return 0;
        var dp = new int[n];
        Array.Fill(dp, 1);

        for (int row = 1; row < m; row++)
            for (int col = 1; col < n; col++)
                dp[col] += dp[col - 1];

        return dp[n - 1];
    }

    static void Check(int expected, int actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(28, UniquePaths(3, 7));
        Check(3, UniquePaths(3, 2));
        Check(1, UniquePaths(1, 5));
        Check(1, UniquePaths(5, 1));
        Check(0, UniquePaths(0, 4));
        Console.WriteLine("Unique Paths checks passed.");
    }
}
```

## Correctness argument

Let dp[r,c] count paths from (0,0) to (r,c). On the first row, only right moves are possible, so each cell has one path; on the first column, only down moves are possible, also giving one path. For an interior cell, every path has a unique final move from above or left, and these classes are disjoint, so dp[r,c]=dp[r-1,c]+dp[r,c-1]. The one-dimensional array begins with the first-row values. During each later row, dp[col] still stores the count from above, and dp[col-1] has already been updated for the current row, so it stores the count from the left. Their sum is the required state.

## Step-by-step dry run

For a 3 by 3 grid, start row values [1,1,1]. The next row updates left to right into [1,2,3]. The final row becomes [1,3,6], so there are six paths.

## Time complexity

O(mn) additions.

## Space complexity

O(n) for the rolling row.

## Alternatives and tradeoffs

- A full two-dimensional table uses O(mn) memory and is easier to visualize or use for path reconstruction.
- A combinatorial binomial coefficient formula uses the fact that a path contains m-1 down moves and n-1 right moves, but requires careful overflow-safe arithmetic.
- If obstacles are introduced, boundary initialization and transitions must account for blocked cells.

## Common mistakes and gotchas

- Leaving boundary cells at zero instead of one.
- Updating the one-dimensional row right to left, which reads stale left values.
- Adding diagonal transitions not allowed by the movement rules.
- Using Int32 when operating outside the supplied answer bound.

## Edge-case tests

- One row or one column has one path.
- The smallest 1 by 1 grid has one path.
- A small square grid verifies the additive recurrence.
- Defensive nonpositive dimensions return zero.

## Reflection questions
1. Why do the two predecessor path sets not overlap?
2. What does dp[col] represent before and after each row update?
3. How would blocked cells change initialization?

## Source
- [Unique Paths](https://leetcode.com/problems/unique-paths/)
