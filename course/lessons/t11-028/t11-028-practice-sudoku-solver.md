# constraint search, pruning, and puzzle backtracking — Problem: Sudoku Solver

## Goals
- Enforce row, column, and 3 by 3 box uniqueness with compact occupancy masks.
- Use minimum remaining values (fewest candidates) to expose contradictions early.
- Restore board and masks after failed guesses while retaining the solved board on success.

## Problem statement

Fill the empty cells of a 9 by 9 Sudoku board in place. Each digit 1 through 9 must appear exactly once in every row, every column, and each 3 by 3 subgrid. The input puzzle has exactly one solution.

## Input constraints

- Exactly 9 rows, each with 9 cells.
- Each cell is a digit character or `'.'` for empty.
- The puzzle has exactly one solution.

## Examples with expected output

The official board beginning `53..7....`, `6..195...`, `.98....6.` and ending `... .8.. .7.. 9` is solved in place to:

```text
534678912
672195348
198342567
859761423
426853791
713924856
961537284
287419635
345286179
```

## Clarifying assumptions

The standard problem expects mutation of the given board rather than returning a second board. Its input is guaranteed to have one solution; the implementation reports an exception if this precondition is violated. Initial givens are legal under the problem statement. Digits map to bits `1<<digit`, leaving bit zero unused.

## Progressive hints

1. Track digits already present in each row, column, and box.
2. For each empty cell, legal digits are `fullMask & ~(rowMask | columnMask | boxMask)`.
3. Among the remaining empty cells, choose one with the fewest candidates; place a bit, recurse, and undo on failure.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Numerics;

static class Program
{
    static void SolveSudoku(char[][] board)
    {
        const int full = (1 << 10) - 2;
        var rows = new int[9];
        var columns = new int[9];
        var boxes = new int[9];
        var empty = new List<(int Row, int Column)>();

        for (int r = 0; r < 9; r++)
            for (int c = 0; c < 9; c++)
            {
                char ch = board[r][c];
                if (ch == '.') { empty.Add((r, c)); continue; }
                int bit = 1 << (ch - '0');
                int box = (r / 3) * 3 + c / 3;
                rows[r] |= bit; columns[c] |= bit; boxes[box] |= bit;
            }

        bool Search(int depth)
        {
            if (depth == empty.Count) return true;
            int best = depth, bestCount = 10;
            for (int i = depth; i < empty.Count; i++)
            {
                var (r, c) = empty[i];
                int box = (r / 3) * 3 + c / 3;
                int candidates = full & ~(rows[r] | columns[c] | boxes[box]);
                int count = BitOperations.PopCount((uint)candidates);
                if (count < bestCount) { best = i; bestCount = count; }
                if (count == 0) return false;
                if (count == 1) break;
            }

            (empty[depth], empty[best]) = (empty[best], empty[depth]);
            var (row, column) = empty[depth];
            int boxIndex = (row / 3) * 3 + column / 3;
            int choices = full & ~(rows[row] | columns[column] | boxes[boxIndex]);
            while (choices != 0)
            {
                int bit = choices & -choices;
                choices ^= bit;
                int digit = BitOperations.TrailingZeroCount((uint)bit);
                board[row][column] = (char)('0' + digit);
                rows[row] |= bit; columns[column] |= bit; boxes[boxIndex] |= bit;

                if (Search(depth + 1)) return true;

                rows[row] ^= bit; columns[column] ^= bit; boxes[boxIndex] ^= bit;
                board[row][column] = '.';
            }
            (empty[depth], empty[best]) = (empty[best], empty[depth]);
            return false;
        }

        if (!Search(0)) throw new InvalidOperationException("No solution exists for the supplied board.");
    }

    static char[][] Board(params string[] rows)
    {
        var board = new char[rows.Length][];
        for (int i = 0; i < rows.Length; i++) board[i] = rows[i].ToCharArray();
        return board;
    }
    static void CheckSolved(char[][] board, string[] expected)
    {
        for (int r = 0; r < 9; r++)
            if (new string(board[r]) != expected[r])
                throw new InvalidOperationException($"Row {r}: expected {expected[r]}, got {new string(board[r])}.");
    }
    static void Main()
    {
        var board = Board("53..7....","6..195...",".98....6.","8...6...3","4..8.3..1","7...2...6",".6....28.","...419..5","....8..79");
        SolveSudoku(board);
        CheckSolved(board, new[] { "534678912","672195348","198342567","859761423","426853791","713924856","961537284","287419635","345286179" });

        var almostDone = Board("534678912","672195348","198342567","859761423","426853791","713924856","961537284","287419635","34528617.");
        SolveSudoku(almostDone);
        CheckSolved(almostDone, new[] { "534678912","672195348","198342567","859761423","426853791","713924856","961537284","287419635","345286179" });
        Console.WriteLine("Sudoku Solver checks passed.");
    }
}
```

## Correctness argument

At every search depth, row, column, and box masks contain exactly the digits assigned in those units by current givens and choices. Therefore the candidate mask contains exactly digits that violate none of the three Sudoku constraints. The MRV scan selects one currently empty cell with minimum domain; it only changes order, not which legal digit assignments are tried. Each candidate bit is set in all three masks and placed in the board before recursion, then all three updates and the board cell are restored if that branch fails. A successful leaf has assigned every empty cell while preserving all constraints, so it is a valid completed board. Since every legal candidate for the selected variable is tried and every failed branch is fully undone, the search finds a solution whenever one exists.

## Step-by-step dry run

At each call, scan remaining empty positions and compute candidates. If one cell has only bit 4, MRV swaps it into the current depth. Set its row/column/box bit, write `'4'`, then recurse. If deeper search fails, XOR that exact bit back out and restore `'.'`. If a branch succeeds, return immediately and keep all placed digits in the board, as required by the in-place API.

## Time complexity

If E cells are empty, a loose upper bound is `O(E*9^E)`: at most nine branches per assigned cell and up to E remaining cells scanned to select the MRV variable at a node. MRV and mask checks greatly reduce practical search for typical puzzles but do not change the worst-case exponential classification.

## Space complexity

`O(E)` auxiliary positions and recursion depth for E empty cells, plus constant-size row/column/box masks. The provided board is mutated in place.

## Edge-case tests

- The official puzzle is asserted row by row against its unique solution.
- A board with one empty cell is asserted.
- A valid fully filled solved board would have zero empty variables and return unchanged.
- The unique-solution guarantee means multiple-solution enumeration is unnecessary.

## Reflection questions

1. Why does MRV help more than always filling the next row-major empty cell?
2. Which state must be undone after a failed digit guess?
3. Why can the code leave mutations in place on a successful return?

Source: [LeetCode: Sudoku Solver](https://leetcode.com/problems/sudoku-solver/).
