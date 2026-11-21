# constraint search, pruning, and puzzle backtracking — Problem: N-Queens

## Goals
- Assign one queen per row and enforce column and diagonal uniqueness.
- Use bit masks to compute legal columns without scanning every conflict pair.
- Enumerate every distinct board, not just the first feasible placement.

## Problem statement

Return all distinct ways to place n queens on an n by n chessboard so that no two queens attack one another. Represent each board as n strings of `Q` and `.`. Answers may be returned in any order.

## Input constraints

- `1 <= n <= 9`.

## Examples with expected output

- `n=4` returns two boards: `[".Q..","...Q","Q...","..Q."]` and `["..Q.","Q...","...Q",".Q.."]`.
- `n=1` returns `[["Q"]]`.
- `n=2` and `n=3` return no solutions.

## Clarifying assumptions

Exactly one queen is placed in each row, so row conflicts are excluded by construction. A column can contain at most one queen. Two diagonal families are identified by `row-column` and `row+column`; the bit-mask implementation tracks which columns are attacked on the next row. Distinct complete boards are all required.

## Progressive hints

1. Recursively choose the queen's column for the next row.
2. Track occupied columns and both diagonal attack sets.
3. Compute all currently legal columns as `fullMask & ~(columns | diagLeft | diagRight)` and explore every set bit.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    static IList<IList<string>> SolveNQueens(int n)
    {
        int full = (1 << n) - 1;
        var columnsByRow = new int[n];
        var result = new List<IList<string>>();

        void Search(int row, int columns, int diagLeft, int diagRight)
        {
            if (row == n)
            {
                var board = new List<string>(n);
                for (int r = 0; r < n; r++)
                {
                    char[] line = Enumerable.Repeat('.', n).ToArray();
                    line[columnsByRow[r]] = 'Q';
                    board.Add(new string(line));
                }
                result.Add(board);
                return;
            }

            int available = full & ~(columns | diagLeft | diagRight);
            while (available != 0)
            {
                int bit = available & -available;
                available ^= bit;
                columnsByRow[row] = System.Numerics.BitOperations.TrailingZeroCount((uint)bit);
                Search(row + 1, columns | bit, ((diagLeft | bit) << 1) & full, (diagRight | bit) >> 1);
            }
        }

        Search(0, 0, 0, 0);
        return result;
    }

    static string Normalize(IList<IList<string>> boards) => string.Join("|", boards
        .Select(board => string.Join("/", board)).OrderBy(x => x, StringComparer.Ordinal));
    static void Check(string[] expected, IList<IList<string>> actual)
    {
        string e = string.Join("|", expected.OrderBy(x => x, StringComparer.Ordinal));
        string a = Normalize(actual);
        if (e != a) throw new InvalidOperationException($"Expected {e}; got {a}.");
    }

    static void Main()
    {
        Check(new[] { "..Q./Q.../...Q/.Q..", ".Q../...Q/Q.../..Q." }, SolveNQueens(4));
        Check(new[] { "Q" }, SolveNQueens(1));
        Check(Array.Empty<string>(), SolveNQueens(2));
        Check(Array.Empty<string>(), SolveNQueens(3));
        Console.WriteLine("N-Queens checks passed.");
    }
}
```

## Correctness argument

At row r, `columns` marks columns already occupied. `diagLeft` and `diagRight` mark columns attacked in this row by queens in earlier rows; shifting them for the next recursive row advances diagonal attacks by one column, and `full` removes bits outside the board. Thus `available` contains exactly the legal columns for row r. The algorithm recurses on every available bit, so it explores every nonattacking placement under the one-queen-per-row representation. At depth n, all rows have one queen and the masks ensure no shared column or diagonal, so every emitted board is valid. Since every legal next column is explored, no valid board is omitted.

## Step-by-step dry run

For n=4, `full=1111₂`. Choose column 1 (bit `0010₂`) on row 0. On row 1, that queen attacks columns 0 and 2; column 1 is occupied, leaving only column 3. If subsequent rows lead to a dead end, recursion returns to row 0, clears the prior branch by value-passing the masks, and tries column 2. This ultimately finds both distinct boards. The board path is stored in `columnsByRow` and overwritten at each attempted row.

## Time complexity

The search is exponential/factorial in n in the worst case; a loose bound is `O(n!)` partial placements, plus `O(n²)` work to materialize each output board. The returned output itself can be large.

## Space complexity

`O(n)` search depth and row choices, excluding returned boards; output storage is proportional to the number of solutions times `n²` characters.

## Edge-case tests

- Official n=4 and n=1 outputs are asserted independent of board order.
- n=2 and n=3 have no solution.
- Every candidate column is explored; the implementation does not incorrectly treat symmetry as permission to omit reflected solutions.

## Reflection questions

1. Why does choosing one queen per row enforce row uniqueness automatically?
2. What does each diagonal-mask shift represent when moving down one row?
3. If only one solution were requested, where could the search stop early?

Source: [LeetCode: N-Queens](https://leetcode.com/problems/n-queens/).
