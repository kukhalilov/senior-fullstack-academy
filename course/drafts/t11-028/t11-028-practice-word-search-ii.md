# constraint search, pruning, and puzzle backtracking — Problem: Word Search II

## Goals
- Share search work across many words with a prefix trie.
- Stop a board path as soon as its prefix is absent from the dictionary.
- Emit each found word once, prune exhausted trie branches, and restore board state.

## Problem statement

Given an `m x n` board of lowercase letters and a list of unique words, return every word that can be traced by horizontally or vertically adjacent cells without using a cell more than once in one word. Output order is arbitrary.

## Input constraints
- `1 <= m,n <= 12`.
- Board cells are lowercase English letters.
- `1 <= words.Length <= 30000`.
- `1 <= words[i].Length <= 10`; all dictionary words are unique.

## Examples with expected output
- Board `oaan/etae/ihkr/iflv`, words `[oath,pea,eat,rain]` -> `[eat,oath]`.
- Board `ab/cd`, words `[abcb]` -> `[]` because a path cannot reuse `b`.

## Clarifying assumptions

Only four-directional adjacency counts. A trie node represents a prefix; a missing child means no dictionary word can continue along the current path. Removing a terminal marker after finding a word prevents duplicate output from another board path. A trie branch can be removed when it has no remaining terminal word or descendants. The input word list is unique, but many distinct paths may spell the same word.

## Progressive hints
1. A separate DFS for each word repeats shared-prefix work.
2. Insert all words into a trie and advance one trie edge for each board character.
3. Mark and restore board cells; clear found terminals and remove exhausted trie branches.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

static class Program
{
    sealed class TrieNode
    {
        public Dictionary<char, TrieNode> Children { get; } = new();
        public string? Word { get; set; }
    }

    static IList<string> FindWords(char[][] board, string[] words)
    {
        var root = new TrieNode();
        foreach (string word in words)
        {
            TrieNode node = root;
            foreach (char ch in word)
            {
                if (!node.Children.TryGetValue(ch, out TrieNode? next))
                    node.Children[ch] = next = new TrieNode();
                node = next;
            }
            node.Word = word;
        }

        int rows = board.Length, columns = board[0].Length;
        int[] dr = { -1, 1, 0, 0 };
        int[] dc = { 0, 0, -1, 1 };
        var found = new List<string>();

        void Search(int r, int c, TrieNode parent)
        {
            char letter = board[r][c];
            if (!parent.Children.TryGetValue(letter, out TrieNode? node)) return;
            if (node.Word is not null)
            {
                found.Add(node.Word);
                node.Word = null;
            }

            board[r][c] = '\0';
            for (int d = 0; d < 4; d++)
            {
                int nr = r + dr[d], nc = c + dc[d];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < columns && board[nr][nc] != '\0')
                    Search(nr, nc, node);
            }
            board[r][c] = letter;

            if (node.Word is null && node.Children.Count == 0)
                parent.Children.Remove(letter);
        }

        for (int r = 0; r < rows; r++)
            for (int c = 0; c < columns; c++)
                Search(r, c, root);
        return found;
    }

    static char[][] Board(params string[] rows)
    {
        var board = new char[rows.Length][];
        for (int i = 0; i < rows.Length; i++) board[i] = rows[i].ToCharArray();
        return board;
    }
    static void Check(string[] expected, IList<string> actual)
    {
        string e = string.Join(",", expected.OrderBy(x => x, StringComparer.Ordinal));
        string a = string.Join(",", actual.OrderBy(x => x, StringComparer.Ordinal));
        if (e != a) throw new InvalidOperationException($"Expected [{e}], got [{a}].");
    }
    static void CheckBoard(char[][] board, string[] expected)
    {
        for (int i = 0; i < board.Length; i++)
            if (new string(board[i]) != expected[i]) throw new InvalidOperationException("Board was not restored.");
    }
    static void Main()
    {
        var board = Board("oaan", "etae", "ihkr", "iflv");
        Check(new[] { "eat", "oath" }, FindWords(board, new[] { "oath", "pea", "eat", "rain" }));
        CheckBoard(board, new[] { "oaan", "etae", "ihkr", "iflv" });
        var noMatchBoard = Board("ab", "cd");
        Check(Array.Empty<string>(), FindWords(noMatchBoard, new[] { "abcb" }));
        CheckBoard(noMatchBoard, new[] { "ab", "cd" });
        Check(new[] { "a", "ab", "abc" }, FindWords(Board("abc"), new[] { "a", "ab", "abc", "abcd" }));
        Check(Array.Empty<string>(), FindWords(Board("a"), Array.Empty<string>()));
        Console.WriteLine("Word Search II checks passed.");
    }
}
```

## Correctness argument

Trie construction creates one root-to-terminal path for every dictionary word. During DFS, the current trie node is the prefix spelled by the current board path. A missing child proves no dictionary word has that extended prefix, so stopping cannot miss an answer. A terminal word is emitted once and cleared, preventing another path from returning it again. Marking a board cell prevents reuse on this path; restoring it after exploring neighbors allows other paths to use it. Removing a trie node only when it has neither an unreported word nor child prefixes cannot remove any still-unreported word. Therefore every reported word corresponds to a valid path, and every word with a valid path is reached and reported.

## Step-by-step dry run

Insert `oath` and `eat`. Starting at board `o`, trie edges `a`, `t`, `h` are followed along adjacent cells. The terminal stores `oath`, so it is added and the terminal is cleared. If it has no unreported descendants, its branch can be removed. Starting elsewhere, the trie prunes any first character absent from its root. The path for `eat` is found similarly. Failed prefixes stop before exploring the rest of the board path.

## Time complexity

Trie construction takes `O(S)`, where S is total dictionary characters. Board search is exponential in maximum word length L in the worst case: a loose bound is `O(M*4^L)` for M board cells; no-reuse gives at most `O(M*4*3^(L-2))` paths for L>1, with trie-prefix pruning often much stronger. Output and dictionary insertion costs are additional.

## Space complexity

`O(S)` trie nodes plus `O(L)` recursion depth and output storage. The board is temporarily mutated and restored.

## Edge-case tests
- Both official examples are asserted.
- A single-row trie chain tests multiple word terminals sharing prefixes.
- A word longer than any possible no-reuse board path is not found.
- The board is asserted unchanged after search.
- Empty `words` returns an empty result; the official constraints normally provide at least one word.

## Reflection questions
1. Why is trie-prefix pruning more effective than checking only complete candidate words?
2. Why clear a terminal after reporting the word?
3. When is it safe to remove a trie child node during board DFS?

Source: [LeetCode: Word Search II](https://leetcode.com/problems/word-search-ii/).
