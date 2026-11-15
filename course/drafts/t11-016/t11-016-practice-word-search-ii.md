# tries, prefix trees, and string dictionaries — Problem: Word Search II

## Goals
- Find dictionary words spelled by adjacent board cells without reusing a cell.
- Combine board DFS with trie-prefix pruning.
- Safely emit each word once and prune exhausted trie branches.

## Problem statement
Given a rectangular lowercase-letter board and a list of unique words, return every word that can be formed by horizontally or vertically adjacent cells. A board cell may be used at most once in a word.

## Input constraints
- 1 <= board rows, columns <= 12.
- Board cells are lowercase English letters.
- 1 <= words.Length <= 30,000.
- Each word length is 1 through 10, contains lowercase English letters, and words are unique.

## Examples with expected output
- Board [[o,a,a,n],[e,t,a,e],[i,h,k,r],[i,f,l,v]], words ["oath","pea","eat","rain"] -> ["eat","oath"] in any order.
- Board [[a,b],[c,d]], words ["abcb"] -> [].
- Board [[a,b]], words ["a","ab"] -> ["a","ab"].

## Clarifying assumptions
- Adjacency is orthogonal only; diagonals do not count.
- The same cell cannot appear twice along a path, even if its letter matches.
- The output order is not specified.
- This implementation temporarily marks board cells and restores them before returning.

## Progressive hints
1. Insert all words into one trie.
2. From each board cell, follow only the trie edge matching that cell.
3. If the edge is absent, no dictionary word has the current path as prefix.
4. Mark a cell while exploring neighbors, restore it afterward, and clear terminal word payloads after reporting them.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Linq;

public sealed class Solution
{
    private sealed class Node
    {
        public Node?[] Children { get; } = new Node?[26];
        public string? Word { get; set; }

        public bool HasChildren()
        {
            foreach (Node? child in Children)
                if (child is not null) return true;
            return false;
        }
    }

    public IList<string> FindWords(char[][] board, string[] words)
    {
        var result = new List<string>();
        if (board.Length == 0 || board[0].Length == 0) return result;

        var root = new Node();
        foreach (string word in words)
        {
            Node current = root;
            foreach (char ch in word)
            {
                int index = ch - 'a';
                current.Children[index] ??= new Node();
                current = current.Children[index]!;
            }
            current.Word = word;
        }

        int rows = board.Length;
        int cols = board[0].Length;
        int[] dr = { -1, 1, 0, 0 };
        int[] dc = { 0, 0, -1, 1 };

        void Search(int row, int col, Node parent)
        {
            int index = board[row][col] - 'a';
            Node? node = parent.Children[index];
            if (node is null) return;

            if (node.Word is not null)
            {
                result.Add(node.Word);
                node.Word = null;
            }

            char saved = board[row][col];
            board[row][col] = '#';
            for (int direction = 0; direction < 4; direction++)
            {
                int nextRow = row + dr[direction];
                int nextCol = col + dc[direction];
                if (nextRow >= 0 && nextRow < rows &&
                    nextCol >= 0 && nextCol < cols &&
                    board[nextRow][nextCol] != '#')
                {
                    Search(nextRow, nextCol, node);
                }
            }
            board[row][col] = saved;

            if (node.Word is null && !node.HasChildren())
                parent.Children[index] = null;
        }

        for (int row = 0; row < rows; row++)
            for (int col = 0; col < cols; col++)
                Search(row, col, root);

        return result;
    }
}

static class Program
{
    static void CheckSet(string[] expected, IList<string> actual)
    {
        if (!new HashSet<string>(expected).SetEquals(actual))
            throw new Exception("Found-word set differs from expected.");
    }

    static void Main()
    {
        char[][] first =
        {
            new[] { 'o', 'a', 'a', 'n' },
            new[] { 'e', 't', 'a', 'e' },
            new[] { 'i', 'h', 'k', 'r' },
            new[] { 'i', 'f', 'l', 'v' }
        };
        char[][] original = first.Select(row => (char[])row.Clone()).ToArray();
        var solution = new Solution();
        CheckSet(new[] { "eat", "oath" }, solution.FindWords(first, new[] { "oath", "pea", "eat", "rain" }));
        for (int r = 0; r < first.Length; r++)
            if (!first[r].SequenceEqual(original[r])) throw new Exception("Board was not restored.");

        CheckSet(Array.Empty<string>(), solution.FindWords(
            new[] { new[] { 'a', 'b' }, new[] { 'c', 'd' } }, new[] { "abcb" }));
        CheckSet(new[] { "a", "ab" }, solution.FindWords(
            new[] { new[] { 'a', 'b' } }, new[] { "a", "ab" }));
        Console.WriteLine("Word Search II checks passed.");
    }
}
```

## Correctness argument

Each trie node represents a dictionary prefix. Search advances only when the current board letter has a matching child, so every explored path is a prefix of at least one not-yet-reported word. The board marker prevents revisiting a cell in the current path; restoring the saved letter after exploring neighbors allows other paths to use it. A terminal payload identifies a complete dictionary word, which is emitted and cleared so it cannot be emitted again. Descendants remain available for longer words sharing that prefix. Once a node is nonterminal and childless, no unreported word uses that prefix, so pruning its parent edge cannot remove an answer. Starting DFS from every cell covers every possible first letter.

## Step-by-step dry run

For the sample board, start at o and follow trie edges o-a-t-h. At h, the terminal payload “oath” is emitted. Searches that attempt prefixes such as o-p stop immediately because the trie edge is absent. Starting at e, the path e-a-t reaches terminal “eat” and emits it. The word “pea” is never explored beyond p if the board has no matching continuation.

## Time complexity

Building the trie costs O(S), where S is total dictionary characters. If L is the maximum word length, a conservative board-search bound is O(MN·4·3^(L-1)): each start has at most four first moves and, after the first step, at most three choices because the prior cell cannot be reused. Trie-prefix pruning and removal of found branches usually reduce work. The constraints cap L at 10.

## Space complexity

O(V times 26 references) for V trie nodes, plus O(L) recursion depth and O(R) result strings for R found words. The board is modified in place and restored.

## Alternatives and tradeoffs

- Run a separate board search for every word; simpler but repeats shared-prefix exploration and may be much slower for 30,000 words.
- Use a HashSet of words for terminal checks while enumerating board paths; it still explores prefixes that no word uses.
- Keep per-node remaining-word counts to prune without scanning 26 child slots; this adds bookkeeping that must be updated exactly once per found word.
- A bitmask or visited matrix avoids a sentinel character but allocates or carries additional state.

## Common mistakes and gotchas

- Allowing diagonal moves or reusing a board cell.
- Searching every neighbor without checking the trie edge first.
- Returning immediately after finding a word and missing longer words that share the prefix.
- Removing a terminal node that still has child words.
- Failing to restore the board after recursive exploration.
- Returning duplicates when several board paths spell the same dictionary word.
- Using '#' as a marker when '#' could be a valid board symbol; the lowercase constraint makes it safe here.

## Edge-case tests

- A word of length one.
- A word whose prefix is also a dictionary word.
- A path that would require reusing one cell.
- A missing trie edge prunes the search.
- Multiple board paths spell one dictionary word; emit it once.
- Confirm every board row is restored after the method returns.

## Reflection questions
1. Why is a missing trie edge a sound pruning condition?
2. Why must a found terminal keep its children?
3. What invariant makes pruning an empty trie branch safe?

## Source
- [Word Search II](https://leetcode.com/problems/word-search-ii/)
