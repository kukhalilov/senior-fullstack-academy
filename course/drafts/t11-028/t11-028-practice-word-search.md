# constraint search, pruning, and puzzle backtracking — Problem: Word Search

## Goals
- Search a path whose consecutive cells match consecutive word characters.
- Enforce the no-cell-reuse rule only for the current path.
- Restore every marked cell on both success and failure.

## Problem statement

Given an `m x n` character board and a word, return whether the word can be constructed from sequentially adjacent horizontal or vertical cells. A cell cannot be used more than once in one word path.

## Input constraints
- `1 <= m,n <= 6`.
- `1 <= word.Length <= 15`.
- Board and word contain uppercase or lowercase English letters; matching is character-exact.

## Examples with expected output
- Board `ABCE/SFCS/ADEE`, word `ABCCED` -> `true`.
- Same board, word `SEE` -> `true`.
- Same board, word `ABCB` -> `false` because reaching the last B would reuse the first B cell.

## Clarifying assumptions

Only horizontal and vertical neighbors count; diagonals do not. The same physical board cell may be used by separate start attempts or separate words, but not twice on one path. The implementation temporarily mutates cells to a sentinel and restores them before returning.

## Progressive hints
1. Try every cell matching `word[0]` as a start.
2. Recursively explore four neighbors for the next character while marking the current cell used.
3. Restore the cell after recursive exploration, including when a match has been found.

## Complete C# solution

```csharp dsa-solution
using System;

static class Program
{
    static bool Exist(char[][] board, string word)
    {
        int rows = board.Length, columns = board[0].Length;
        int[] dr = { -1, 1, 0, 0 };
        int[] dc = { 0, 0, -1, 1 };

        bool Search(int r, int c, int index)
        {
            if (r < 0 || r >= rows || c < 0 || c >= columns || board[r][c] != word[index])
                return false;

            char saved = board[r][c];
            board[r][c] = '\0';
            bool found = index == word.Length - 1;
            if (!found)
            {
                for (int direction = 0; direction < 4 && !found; direction++)
                    found = Search(r + dr[direction], c + dc[direction], index + 1);
            }
            board[r][c] = saved;
            return found;
        }

        for (int r = 0; r < rows; r++)
            for (int c = 0; c < columns; c++)
                if (Search(r, c, 0)) return true;
        return false;
    }

    static char[][] Board(params string[] rows)
    {
        var board = new char[rows.Length][];
        for (int i = 0; i < rows.Length; i++) board[i] = rows[i].ToCharArray();
        return board;
    }
    static void Check(bool expected, bool actual)
    {
        if (expected != actual) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }
    static void CheckBoard(char[][] board, string[] expected)
    {
        for (int i = 0; i < board.Length; i++)
            if (new string(board[i]) != expected[i]) throw new InvalidOperationException("Board was not restored.");
    }
    static void Main()
    {
        var board = Board("ABCE", "SFCS", "ADEE");
        Check(true, Exist(board, "ABCCED"));
        CheckBoard(board, new[] { "ABCE", "SFCS", "ADEE" });
        Check(true, Exist(board, "SEE"));
        Check(false, Exist(board, "ABCB"));
        CheckBoard(board, new[] { "ABCE", "SFCS", "ADEE" });
        Check(false, Exist(Board("A"), "AA"));
        Check(true, Exist(Board("A"), "A"));
        Console.WriteLine("Word Search checks passed.");
    }
}
```

## Correctness argument

At `Search(r,c,index)`, the routine succeeds exactly when there is a path starting at `(r,c)` that matches `word[index..]` without reusing a cell already on the recursion path. It rejects out-of-bounds, mismatched, and marked cells. Otherwise it marks the current cell, tries each of its four neighbors for the next character, and restores the saved character before returning. Thus any returned true corresponds to a legal no-reuse path. Conversely, if a valid path exists from a matching start, its next cell is among the four explored neighbors and is not marked earlier on that path, so recursion follows it and succeeds. Trying every cell as a start covers all possible paths.

## Step-by-step dry run

For `ABCCED`, start at the `A` in the lower-left. Move to adjacent `B`, then `C`, then the next `C`, then `E`, then `D`. Each chosen cell is marked while descending, preventing the path from reusing the first `C` or another earlier cell. At the final match, success propagates upward; each call restores its own saved board character before returning true, so the caller's board is unchanged.

## Time complexity

With `M=m*n` cells and word length L, a conservative bound is `O(M*4^L)`. Because a path cannot immediately revisit the previous cell, a tighter bound for `L>1` is `O(M*4*3^(L-2))` candidate paths, with constant work per step.

## Space complexity

`O(L)` recursion depth. The board is mutated in place and restored; the four direction arrays use constant space.

## Edge-case tests
- All three official examples are asserted.
- One cell matches a one-character word.
- A one-cell board cannot form a two-character word because reuse is forbidden.
- The board contents are asserted unchanged after a successful search.

## Reflection questions
1. Why is a global visited set wrong when trying multiple possible paths?
2. Why must a successful path also restore the board before returning?
3. How could character-frequency counts reject some impossible words before DFS?

Source: [LeetCode: Word Search](https://leetcode.com/problems/word-search/).
