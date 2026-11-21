# tries, prefix trees, and string dictionaries — Problem: Replace Words

## Goals
- Replace each derivative word with the shortest dictionary root that prefixes it.
- Stop trie traversal at the first terminal node.
- Preserve words that have no matching root.

## Problem statement
Given lowercase root words and a sentence of lowercase words separated by single spaces, replace each word that begins with one or more roots by its shortest matching root. Return the transformed sentence.

## Input constraints
- 1 <= dictionary.Length <= 1,000.
- Each root has length 1 through 100 and lowercase English letters.
- Sentence length is 1 through 1,000,000.
- It contains 1 through 1,000 lowercase words, each length 1 through 1,000.
- Words are separated by exactly one space; there are no leading or trailing spaces.

## Examples with expected output
- roots=["cat","bat","rat"], sentence="the cattle was rattled by the battery" -> "the cat was rat by the bat".
- roots=["a","b","c"], sentence="aadsfasf absbs bbab cadsfafs" -> "a a b c".

## Clarifying assumptions
- A root must match from the first character of a word.
- If several roots match, the shortest one wins.
- Input sentence uses exactly the space format in the constraints.

## Progressive hints
1. Insert every root and mark its endpoint terminal.
2. Walk each sentence word from the trie root.
3. Return the first terminal prefix encountered; traversal order guarantees shortest.
4. If an edge is missing before a terminal, keep the original word.

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
        public bool IsRoot { get; set; }
    }

    static void Insert(Node root, string word)
    {
        Node current = root;
        foreach (char ch in word)
        {
            int index = ch - 'a';
            current.Children[index] ??= new Node();
            current = current.Children[index]!;
        }
        current.IsRoot = true;
    }

    static string ShortestRoot(Node root, string word)
    {
        Node current = root;
        for (int i = 0; i < word.Length; i++)
        {
            Node? next = current.Children[word[i] - 'a'];
            if (next is null) return word;
            current = next;
            if (current.IsRoot) return word[..(i + 1)];
        }
        return word;
    }

    static string ReplaceWords(IList<string> dictionary, string sentence)
    {
        var root = new Node();
        foreach (string word in dictionary) Insert(root, word);

        string[] words = sentence.Split(' ');
        var result = new StringBuilder(sentence.Length);
        for (int i = 0; i < words.Length; i++)
        {
            if (i > 0) result.Append(' ');
            result.Append(ShortestRoot(root, words[i]));
        }
        return result.ToString();
    }

    static void Check(string expected, string actual)
    {
        if (expected != actual) throw new Exception($"Expected '{expected}', got '{actual}'.");
    }

    static void Main()
    {
        Check("the cat was rat by the bat", ReplaceWords(new[] { "cat", "bat", "rat" }, "the cattle was rattled by the battery"));
        Check("a a b c", ReplaceWords(new[] { "a", "b", "c" }, "aadsfasf absbs bbab cadsfafs"));
        Check("app app", ReplaceWords(new[] { "app" }, "application apple"));
        Console.WriteLine("Replace Words checks passed.");
    }
}
```

## Correctness argument

Every root is inserted as a path with IsRoot=true at its endpoint. For a sentence word, traversal consumes characters from its beginning. The first terminal node encountered is the shortest stored root prefix because all shorter prefixes were visited earlier; returning there satisfies the replacement rule. If the path disappears or the word ends without reaching a terminal node, no dictionary root prefixes the word, so preserving it is correct. Applying this independently to every word preserves their order and separators.

## Step-by-step dry run

For root “cat” and word “cattle”, traversal follows c, a, t. The node after t is terminal, so return “cat” immediately without reading “tle”. For “apple”, the path diverges at p after “ap”; if no root ends there, keep the original word.

## Time complexity

Let R be total root characters and S total sentence characters. Trie construction is O(R); scanning words examines at most their lengths, so O(S). Splitting and joining also process O(S) characters.

## Space complexity

O(R) trie nodes plus O(S) for split word strings and output builder.

## Alternatives and tradeoffs

- Sort roots by length and test each against each word; easy to understand but can repeat many prefix comparisons.
- A set of all prefixes can check candidates while scanning but may store many strings.
- A streaming parser can avoid Split allocations for very large sentences, while retaining trie lookup time.

## Common mistakes and gotchas

- Returning the longest matching root rather than the shortest.
- Continuing traversal after the first terminal.
- Replacing a word when the root appears in its middle.
- Rebuilding or searching the root collection from scratch for each character.
- Losing spaces or changing word order during reconstruction.

## Edge-case tests

- Root equals the whole word.
- Several nested roots match the same derivative; shortest must win.
- No root matches.
- Word ends at a nonterminal trie node.
- Sentence contains one word and no spaces.

## Reflection questions
1. Why does the first terminal encountered represent the shortest root?
2. Why must root matching begin at the word's first character?
3. How could you process the sentence without allocating the Split array?

## Source
- [Replace Words](https://leetcode.com/problems/replace-words/)
