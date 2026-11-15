# binary search, bounds, rotated arrays, and monotone answers — Problem: Search a 2D Matrix

## Goals

- Search a row-major matrix as a virtual sorted one-dimensional array.
- Convert a flattened position into row and column without copying.
- Verify the ordering precondition is stronger than “each row is sorted.”

## Problem statement

Given an m by n matrix whose rows are sorted and whose first value in each row is greater than the last value of the previous row, return whether target occurs in the matrix. Use O(log(mn)) time.

## Input constraints

- 1 <= m,n <= 100.
- -10,000 <= matrix[r][c] <= 10,000.
- Each row is sorted ascending.
- For each row after the first, its first value is greater than the previous row's last value.

## Examples with expected output

1. matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3 -> true.
2. The same matrix, target = 13 -> false.
3. matrix = [[1]], target = 1 -> true.
4. matrix = [[1,3]], target = 3 -> true.

## Clarifying assumptions

- The matrix is nonempty and rectangular as guaranteed by constraints; the code rejects ragged arrays.
- Row-major flattening is globally sorted because the next row begins after the preceding row ends.
- Return Boolean membership, not an index.
- No flattened copy is allocated.

## Progressive hints

1. If the values are globally ordered row by row, there are m*n sorted positions.
2. Binary-search a flat index from 0 to m*n-1.
3. For flat index x, row is x/n and column is x%n.
4. Use a half-open search interval and a safe product for total cells.

## Complete C# solution

```csharp dsa-solution
using System;

public static class Program
{
    public static bool SearchMatrix(int[][] matrix, int target)
    {
        if (matrix is null) throw new ArgumentNullException(nameof(matrix));
        if (matrix.Length == 0) return false;
        if (matrix[0] is null || matrix[0].Length == 0) return false;

        int rows = matrix.Length;
        int columns = matrix[0].Length;
        foreach (int[]? row in matrix)
            if (row is null || row.Length != columns)
                throw new ArgumentException("Matrix must be rectangular.", nameof(matrix));

        long total = (long)rows * columns;
        long left = 0;
        long right = total;
        while (left < right)
        {
            long mid = left + (right - left) / 2;
            int value = matrix[(int)(mid / columns)][(int)(mid % columns)];
            if (value < target) left = mid + 1;
            else right = mid;
        }

        return left < total && matrix[(int)(left / columns)][(int)(left % columns)] == target;
    }

    private static void AssertEqual(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        int[][] matrix =
        {
            new[] { 1, 3, 5, 7 },
            new[] { 10, 11, 16, 20 },
            new[] { 23, 30, 34, 60 }
        };
        AssertEqual(SearchMatrix(matrix, 3), true, "Example 1");
        AssertEqual(SearchMatrix(matrix, 13), false, "Example 2");
        AssertEqual(SearchMatrix(new[] { new[] { 1 } }, 1), true, "Single cell");
        AssertEqual(SearchMatrix(new[] { new[] { 1, 3 } }, 3), true, "Single row");
        AssertEqual(SearchMatrix(new[] { new[] { 1 }, new[] { 3 } }, 2), false, "Single column");
        Console.WriteLine("All Search a 2D Matrix checks passed.");
    }
}
```

## Correctness argument

The matrix conditions ensure that reading cells row by row produces one globally increasing sequence. Every flat index x maps bijectively to row `x/columns` and column `x%columns`, so the virtual sequence value is exactly the matrix cell in row-major order. Lower-bound binary search maintains that positions before left are below target and the candidate boundary is at or after left. At termination, left is the first flat position whose value is at least target, or total. Target occurs exactly when this boundary is less than total and its value equals target.

## Step-by-step dry run

For the sample matrix and target 13, total is 12. Flat midpoint 6 maps to row 1, column 2, value 16; retain the lower half. A later midpoint maps to value 10, which is below 13; advance left. The final lower-bound position maps to 16, not 13, so return false.

## Time complexity

O(log(mn)) value checks.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- Search each row separately costs O(m log n), useful when rows are individually sorted but not globally separated.
- Binary-search a selected row then its values; this is less direct than flat search under the stronger global-order guarantee.
- A linear row-major scan is O(mn), straightforward for small matrices.

## Common mistakes and gotchas

- Assuming row sorting alone means the flattened matrix is sorted.
- Using `row = mid / columns` with the wrong column count or swapping row and column.
- Allocating a flattened array unnecessarily.
- Dividing by zero columns when defensive code receives an empty matrix.
- Multiplying rows and columns in int before widening.
- Returning true based only on insertion boundary without checking equality.

## Edge-case tests

- One cell.
- One row or one column.
- Target below the minimum, above the maximum, or in a gap between rows.
- Target at row transition boundaries.
- Ragged input rejected defensively.

## Reflection questions

1. What property makes row-major values globally sorted?
2. How do flat index and matrix coordinates relate?
3. Why is this a lower-bound search followed by equality?
4. When would searching each row separately be more appropriate?

Source: [LeetCode: Search a 2D Matrix](https://leetcode.com/problems/search-a-2d-matrix/).
