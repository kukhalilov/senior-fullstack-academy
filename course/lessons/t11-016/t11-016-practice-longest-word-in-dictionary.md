# tries, prefix trees, and string dictionaries — Problem: Longest Word in Dictionary

## Goals
- Find the longest word whose every nonempty prefix is also in the dictionary.
- Traverse only trie children that are complete words.
- Resolve equal-length candidates by lexicographic order.

## Problem statement
Return the longest dictionary word that can be built by adding one character at a time, with every intermediate prefix present as a word. If multiple answers have maximum length, return the lexicographically smallest. Return the empty string if no word qualifies.

## Input constraints
- 1 <= words.Length <= 1,000.
- Each word has length 1 through 30 and contains lowercase English letters.

## Examples with expected output
- ["w","wo","wor","worl","world"] -> "world".
- ["a","banana","app","appl","ap","apply","apple"] -> "apple".
- ["abc"] -> "".

## Clarifying assumptions
- Prefixes are formed from left to right by appending one character.
- Only nonempty words are input; a one-character word is buildable without an empty string entry.
- Lexicographic order is ordinary lowercase English alphabet order.

## Progressive hints
1. Mark every complete dictionary word at its trie node.
2. A word is buildable only if each parent prefix node is terminal.
3. Start traversal at one-letter terminal nodes and descend only through terminal children.
4. Visit children alphabetically and keep the first word among equal maximum lengths.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;
using System.Text;

static class Program
{
    private sealed class Node
    {
        public Node?[] Children { get; } = new Node?[26];
        public bool IsWord { get; set; }
    }

    static string LongestWord(string[] words)
    {
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
            current.IsWord = true;
        }

        string best = "";
        var path = new StringBuilder();
        void Search(Node node)
        {
            if (path.Length > best.Length)
                best = path.ToString();

            for (int i = 0; i < 26; i++)
            {
                Node? child = node.Children[i];
                if (child is null || !child.IsWord) continue;
                path.Append((char)('a' + i));
                Search(child);
                path.Length--;
            }
        }

        Search(root);
        return best;
    }

    static void Check(string expected, string actual)
    {
        if (expected != actual) throw new Exception($"Expected '{expected}', got '{actual}'.");
    }

    static void Main()
    {
        Check("world", LongestWord(new[] { "w", "wo", "wor", "worl", "world" }));
        Check("apple", LongestWord(new[] { "a", "banana", "app", "appl", "ap", "apply", "apple" }));
        Check("", LongestWord(new[] { "abc" }));
        Check("a", LongestWord(new[] { "b", "a" }));
        Console.WriteLine("Longest Word checks passed.");
    }
}
```

## Correctness argument

The trie marks exactly the input words as terminal. Search descends from the root only through terminal children; therefore every visited nonempty path has all its prefixes in the dictionary and is buildable. Conversely, every buildable word has a terminal node at each prefix, so its full path is reachable by this traversal. Children are visited in alphabetic order, which makes visited words lexicographic preorder. The algorithm replaces best only for a strictly longer path, so among equal maximum lengths the first, lexicographically smallest candidate remains selected.

## Step-by-step dry run

For [a, banana, app, appl, ap, apply, apple], the a-p branch continues to ap, then app, then appl. From appl, children e and y are visited in order, producing apple before apply. Both have length five; the first is kept, so the answer is apple.

## Time complexity

Building the trie takes O(S), where S is total input characters. Traversal visits only buildable trie nodes and is O(V) in the worst case, plus O(L) when copying a new best word of length L; here word length is at most 30.

## Space complexity

O(V times 26 references) for the fixed-array trie, plus O(L) traversal path and best string.

## Alternatives and tradeoffs

- Sort words lexicographically, then use a hash set of buildable prefixes. This can be simpler and takes O(S log W) comparisons, with W words.
- For each candidate, test every prefix in a hash set; straightforward but repeats prefix extraction and hashing.
- Trie traversal encodes the prefix condition directly and shares common paths.

## Common mistakes and gotchas

- Traversing through a nonterminal prefix node, allowing a word whose intermediate prefix is absent.
- Breaking a branch when the full word is absent even though a shorter prefix may be the best answer; only descend through terminal children.
- Overwriting best on equal length without comparing lexicographic order.
- Visiting children in an arbitrary order while relying on first-wins tie handling.

## Edge-case tests

- No buildable word when all entries have a missing one-letter prefix.
- One-letter candidate.
- Two maximum words with a lexicographic tie.
- A longer word whose immediate prefix is absent.
- Input order differs from lexicographic order.

## Reflection questions
1. Why can traversal skip every nonterminal child?
2. Why does alphabetical DFS order support first-wins ties?
3. How could a sorted set solution avoid a trie?

## Source
- [Longest Word in Dictionary](https://leetcode.com/problems/longest-word-in-dictionary/)
