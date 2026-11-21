# tries, prefix trees, and string dictionaries — Problem: Design Add and Search Words Data Structure

## Goals
- Support inserting lowercase words and searching exact-length patterns.
- Interpret dot as exactly one arbitrary lowercase letter.
- Use DFS branching only at wildcard positions.

## Problem statement
Design a WordDictionary with AddWord(word) and Search(pattern). A dot in a search pattern matches any one lowercase English letter. Return true if some previously added word matches the entire pattern.

## Input constraints
- Added word length is 1 through 25 and contains lowercase English letters.
- Search pattern contains lowercase English letters or dots.
- A search pattern contains at most two dots.
- At most 10,000 AddWord and Search calls are made.

## Examples with expected output
- AddWord("bad"), AddWord("dad"), AddWord("mad").
- Search("pad") -> false.
- Search("bad") -> true.
- Search(".ad") -> true.
- Search("b..") -> true.

## Clarifying assumptions
- Each dot matches one character, not zero or more characters.
- Matching is case-sensitive under the lowercase input contract.
- Duplicate additions do not change search results.

## Progressive hints
1. Reuse a trie with a terminal marker.
2. For a literal, follow one edge.
3. For a dot, try every existing child and accept if any recursive branch succeeds.
4. At the end of the pattern, require a terminal node.

## Complete C# solution
```csharp dsa-solution
using System;

public sealed class WordDictionary
{
    private sealed class Node
    {
        public Node?[] Children { get; } = new Node?[26];
        public bool IsWord { get; set; }
    }

    private readonly Node root = new();

    private static int Index(char ch) => ch - 'a';

    public void AddWord(string word)
    {
        Node current = root;
        foreach (char ch in word)
        {
            int index = Index(ch);
            current.Children[index] ??= new Node();
            current = current.Children[index]!;
        }
        current.IsWord = true;
    }

    public bool Search(string pattern)
    {
        bool Match(Node node, int position)
        {
            if (position == pattern.Length) return node.IsWord;
            char ch = pattern[position];
            if (ch != '.')
            {
                Node? next = node.Children[Index(ch)];
                return next is not null && Match(next, position + 1);
            }

            foreach (Node? child in node.Children)
                if (child is not null && Match(child, position + 1))
                    return true;
            return false;
        }

        return Match(root, 0);
    }
}

static class Program
{
    static void Check(bool expected, bool actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        var dictionary = new WordDictionary();
        dictionary.AddWord("bad");
        dictionary.AddWord("dad");
        dictionary.AddWord("mad");
        Check(false, dictionary.Search("pad"));
        Check(true, dictionary.Search("bad"));
        Check(true, dictionary.Search(".ad"));
        Check(true, dictionary.Search("b.."));
        Check(false, dictionary.Search("b."));
        Check(false, dictionary.Search("...."));
        Console.WriteLine("Wildcard word dictionary checks passed.");
    }
}
```

## Correctness argument

At recursive state (node,position), node represents exactly the pattern prefix consumed so far. For a literal, the only possible next trie node is its matching edge; recursion explores precisely that continuation. For a dot, every possible next lowercase symbol is represented by one child, so exploring all existing children considers every matching continuation. A branch succeeds at pattern end only if its node is terminal, which ensures a previously added word matches the complete pattern. The recursive cases are therefore sound and complete.

## Step-by-step dry run

With “bad”, “dad”, and “mad” stored, search “.ad” branches at the root to b, d, and m. Each branch then follows a and d; each ends terminal, so the query succeeds at the first successful branch. Search “b.” reaches a nonterminal node after two symbols because the pattern ends before d, so it returns false.

## Time complexity

Insertion is O(L). Search without wildcards is O(L). With q wildcards and alphabet size A, a conservative upper bound is O(A^q·L); trie prefixes that do not exist prune branches early. Here A=26 and q<=2.

## Space complexity

Trie storage is O(total distinct prefixes times 26 references); recursive search depth is O(L).

## Alternatives and tradeoffs

- Store words in a hash set and test patterns by scanning all words of matching length; simpler but query time depends on dictionary size.
- Compile patterns to a regex and scan all words; avoids custom branching but still examines candidate keys and needs careful escaping.
- For many wildcard queries, a trie shares literal prefixes and prunes impossible branches.

## Common mistakes and gotchas

- Treating dot as any-length wildcard instead of exactly one symbol.
- Returning true when the pattern is consumed at a nonterminal node.
- Following only one child for a dot.
- Forgetting to check the entire pattern length.
- Indexing characters without enforcing the stated alphabet in a generalized API.

## Edge-case tests

- Literal exact match.
- Wildcard at the first, middle, and final position.
- Pattern shorter or longer than any stored matching word.
- A wildcard branch with no child.
- Empty pattern defensively matches only if an empty word was added.

## Reflection questions
1. Why does a wildcard require branching over children?
2. What is the terminal check at the recursion base case?
3. How would complexity change if every position were a wildcard?

## Source
- [Design Add and Search Words Data Structure](https://leetcode.com/problems/design-add-and-search-words-data-structure/)
