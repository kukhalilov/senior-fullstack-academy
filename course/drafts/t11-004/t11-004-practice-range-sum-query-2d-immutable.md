# prefix sums, difference arrays, and static range queries — Problem: Range Sum Query 2D - Immutable

## Goals

- Build a padded two-dimensional prefix table.
- Answer inclusive rectangular queries with four-corner inclusion-exclusion.
- Handle boundary-touching rectangles with one uniform formula.

## Problem statement

Implement a NumMatrix class initialized with a nonempty rectangular integer matrix. Each `SumRegion(row1,col1,row2,col2)` call returns the sum of the cells in the inclusive rectangle from its upper-left cell through its lower-right cell. Queries are static and the matrix is not updated.

## Input constraints

- 1 <= rows, columns <= 200.
- -10,000 <= matrix[row][column] <= 10,000.
- 0 <= row1 <= row2 < rows.
- 0 <= col1 <= col2 < columns.
- Up to 10,000 region queries may be made.

## Examples with expected output

For matrix `[[3,0,1,4,2],[5,6,3,2,1],[1,2,0,1,5],[4,1,0,1,7],[1,0,3,0,5]]`:

1. SumRegion(2,1,4,3) -> 8.
2. SumRegion(1,1,2,2) -> 11.
3. SumRegion(1,2,2,4) -> 12.
4. For matrix `[[-5]]`, SumRegion(0,0,0,0) -> -5.

## Clarifying assumptions

- Coordinates are zero-based and both query corners are inclusive.
- Matrix rows are rectangular and non-null under the input constraints; the constructor still rejects ragged rows.
- The prefix table copies cumulative values, so it represents the matrix snapshot at construction time.
- Use long for intermediate rectangle totals; the required method returns int under these bounds.

## Progressive hints

1. Make a table one row and one column larger than the matrix.
2. A prefix cell combines the current value, the prefix above, the prefix to the left, then subtracts the overlap.
3. An inclusive query ending at row2,col2 uses prefix boundary row2+1,col2+1.
4. Subtract top and left extra regions, then add back their shared overlap.

## Complete C# solution

```csharp dsa-solution
using System;

public sealed class NumMatrix
{
    private readonly long[,] prefix;
    private readonly int rows;
    private readonly int columns;

    public NumMatrix(int[][] matrix)
    {
        if (matrix is null) throw new ArgumentNullException(nameof(matrix));
        if (matrix.Length == 0 || matrix[0] is null || matrix[0].Length == 0)
            throw new ArgumentException("Matrix must be nonempty.", nameof(matrix));

        rows = matrix.Length;
        columns = matrix[0].Length;
        prefix = new long[rows + 1, columns + 1];
        for (int r = 0; r < rows; r++)
        {
            if (matrix[r] is null || matrix[r].Length != columns)
                throw new ArgumentException("Matrix must be rectangular.", nameof(matrix));
            for (int c = 0; c < columns; c++)
            {
                prefix[r + 1, c + 1] = matrix[r][c]
                    + prefix[r, c + 1]
                    + prefix[r + 1, c]
                    - prefix[r, c];
            }
        }
    }

    public int SumRegion(int row1, int col1, int row2, int col2)
    {
        if (row1 < 0 || col1 < 0 || row2 < row1 || col2 < col1 || row2 >= rows || col2 >= columns)
            throw new ArgumentOutOfRangeException(nameof(row1));

        long sum = prefix[row2 + 1, col2 + 1]
            - prefix[row1, col2 + 1]
            - prefix[row2 + 1, col1]
            + prefix[row1, col1];
        return checked((int)sum);
    }
}

public static class Program
{
    private static void AssertEqual(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        var matrix = new NumMatrix(new[]
        {
            new[] { 3, 0, 1, 4, 2 },
            new[] { 5, 6, 3, 2, 1 },
            new[] { 1, 2, 0, 1, 5 },
            new[] { 4, 1, 0, 1, 7 },
            new[] { 1, 0, 3, 0, 5 }
        });
        AssertEqual(matrix.SumRegion(2, 1, 4, 3), 8, "Example 1");
        AssertEqual(matrix.SumRegion(1, 1, 2, 2), 11, "Example 2");
        AssertEqual(matrix.SumRegion(1, 2, 2, 4), 12, "Example 3");
        AssertEqual(new NumMatrix(new[] { new[] { -5 } }).SumRegion(0, 0, 0, 0), -5, "Single cell");
        Console.WriteLine("All Range Sum Query 2D - Immutable checks passed.");
    }
}
```

## Correctness argument

By construction, `prefix[r,c]` is the sum of the rectangle with rows `[0,r)` and columns `[0,c)`. The desired rectangle `[row1,row2+1) × [col1,col2+1)` is contained in the origin prefix at its lower-right boundary. Subtracting the prefix above removes cells with rows before row1; subtracting the prefix left removes cells with columns before col1. Their shared top-left region was subtracted twice, so adding `prefix[row1,col1]` restores it once. The result contains exactly the requested cells.

The recurrence for each table entry follows the same inclusion-exclusion argument: combine the rectangle above and rectangle left, subtract their overlapping rectangle, then add the current matrix cell. Zero padding supplies empty boundary rectangles.

## Step-by-step dry run

For the single cell at row 2, column 2 in the sample, the query formula is `P[3,3]-P[2,3]-P[3,2]+P[2,2]`. The four terms are 21, 18, 17, and 14, giving 0, which is the matrix value at that cell.

## Time complexity

Construction O(rows × columns); each query O(1).

## Space complexity

O(rows × columns) for the padded prefix table.

## Alternatives and tradeoffs

- Summing each rectangle directly uses O(rectangle area) per query and O(1) extra space.
- A one-dimensional prefix per row still scans every row segment in the queried rectangle; the full 2D table gives O(1) region queries.
- Dynamic cell updates require updating many prefix entries or using a 2D Fenwick/segment structure; immutable preprocessing is simpler for a static matrix.

## Common mistakes and gotchas

- Missing the plus term that restores the overlap.
- Using row2,col2 directly instead of the exclusive boundary row2+1,col2+1.
- Treating the query's upper-left corner as exclusive when it is inclusive.
- Failing to pad row zero and column zero.
- Adding values into int before widening in a generalized implementation.
- Ignoring ragged rows when using C# jagged-array representation.

## Edge-case tests

- A single-cell matrix and a single-cell query.
- Full-matrix rectangle.
- Rectangles touching each of the four boundaries.
- Negative values and zero-sum regions.
- A one-row or one-column matrix.

## Reflection questions

1. Why does the recurrence subtract the upper-left overlap?
2. Why does the query add it back?
3. What does the padding mean at row or column zero?
4. Why does an update invalidate a static prefix table?

Source: [LeetCode: Range Sum Query 2D - Immutable](https://leetcode.com/problems/range-sum-query-2d-immutable/).
