# timed mock interviews and spaced problem rehearsal — Problem: Spiral Matrix

## Goals
- Define the traversal order without revisiting cells.
- Maintain shrinking boundaries and identify when a final row or column is exhausted.
- Dry-run rectangular and degenerate dimensions.

## Problem statement
Given an `m x n` matrix, return all elements in clockwise spiral order, starting at the top-left corner.

## Input constraints
- `1 <= m,n <= 10`.
- Values are between -100 and 100.

## Examples with expected output
- `[[1,2,3],[4,5,6],[7,8,9]] -> [1,2,3,6,9,8,7,4,5]`.
- `[[1,2,3,4],[5,6,7,8],[9,10,11,12]] -> [1,2,3,4,8,12,11,10,9,5,6,7]`.
- `[[1,2,3]] -> [1,2,3]`; `[[1],[2],[3]] -> [1,2,3]`.

## Clarifying assumptions
- Matrix is nonempty and rectangular.
- Clockwise order starts at `[0][0]`, moving right first.
- Every matrix value is returned exactly once.

## Progressive hints
1. Keep inclusive `top`, `bottom`, `left`, and `right` bounds for the unvisited rectangle.
2. Traverse the top row, right column, bottom row if it remains, then left column if it remains.
3. Shrink the corresponding boundary immediately after traversing that side.
4. Conditions after the top and right traversals prevent duplicate visits in a one-row or one-column remainder.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<int> SpiralOrder(int[][] matrix)
    {
        var result = new List<int>();
        if (matrix.Length == 0) return result;
        int top = 0, bottom = matrix.Length - 1;
        int left = 0, right = matrix[0].Length - 1;

        while (top <= bottom && left <= right)
        {
            for (int col = left; col <= right; col++) result.Add(matrix[top][col]);
            top++;

            for (int row = top; row <= bottom; row++) result.Add(matrix[row][right]);
            right--;

            if (top <= bottom)
            {
                for (int col = right; col >= left; col--) result.Add(matrix[bottom][col]);
                bottom--;
            }

            if (left <= right)
            {
                for (int row = bottom; row >= top; row--) result.Add(matrix[row][left]);
                left++;
            }
        }
        return result;
    }

    static void Check(int[] expected, int[][] matrix)
    {
        int[] actual = SpiralOrder(matrix).ToArray();
        if (!expected.SequenceEqual(actual))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 1,2,3,6,9,8,7,4,5 }, new[] { new[] { 1,2,3 }, new[] { 4,5,6 }, new[] { 7,8,9 } });
        Check(new[] { 1,2,3,4,8,12,11,10,9,5,6,7 }, new[] { new[] { 1,2,3,4 }, new[] { 5,6,7,8 }, new[] { 9,10,11,12 } });
        Check(new[] { 1,2,3 }, new[] { new[] { 1,2,3 } });
        Check(new[] { 1,2,3 }, new[] { new[] { 1 }, new[] { 2 }, new[] { 3 } });
        Check(new[] { 7 }, new[] { new[] { 7 } });
        Console.WriteLine("Spiral Matrix checks passed.");
    }
}
```

## Correctness argument
At each iteration, the inclusive boundaries describe exactly the remaining unvisited rectangle. Traversing the top, right, bottom, and left sides visits its perimeter in clockwise order. Each completed side is removed by advancing its boundary. The bottom traversal occurs only if a row remains after removing the top; the left traversal occurs only if a column remains after removing the right. These guards prevent duplicates in a single-row or single-column remainder. The loop ends when no rectangle remains, so every cell is visited exactly once.

## Step-by-step dry run
For a 2-by-3 matrix, visit top row `[1,2,3]`, then right side `[6]`; shrink top and right. The remaining boundaries still contain the second row, so visit `[5,4]` from right to left. The left-side guard then sees no column left. Output is `[1,2,3,6,5,4]`.

## Time complexity
O(mn), each cell is appended once.

## Space complexity
O(1) auxiliary traversal state; O(mn) output space, which is required for the returned list.

## Alternatives and tradeoffs
- Direction vectors with a visited matrix are easy to visualize but require O(mn) extra space and careful turn logic.
- Boundary shrinking uses constant auxiliary space and directly expresses the remaining rectangle.
- Repeatedly removing rows/columns from a copied matrix is concise in some languages but adds copying and mutation complexity.

## Common mistakes and gotchas
- Traversing bottom or left after a one-row/column remainder was already consumed.
- Using strict inequalities and skipping the center cell.
- Changing direction without updating bounds consistently.
- Claiming O(1) total space while ignoring the required output collection.

## Edge-case tests
- Single cell.
- One row and one column.
- 2-by-3 and 3-by-2 rectangles.
- Odd-sized square with a center.
- Even-sized rectangle with no single center.

## Reflection questions
1. What does each boundary mean immediately before an iteration?
2. Why must the bottom and left traversals be conditional?
3. How would a visited-matrix solution represent direction changes?

## Source
- [Spiral Matrix](https://leetcode.com/problems/spiral-matrix/)
