# tries, prefix trees, and string dictionaries — Problem: Implement Trie (Prefix Tree)

## Goals
- Implement insertion, exact search, and prefix search.
- Keep terminal status independent from child links.
- Support a key that is also a prefix of another key.

## Problem statement
Design a trie supporting Insert(word), Search(word) for exact previously inserted keys, and StartsWith(prefix) for whether any stored key has that prefix.

## Input constraints
- word and prefix lengths are 1 through 2,000.
- Inputs contain lowercase English letters only.
- At most 30,000 calls are made across insert, search, and startsWith.

## Examples with expected output
- Insert("apple"), Search("apple") -> true.
- Search("app") -> false before inserting "app".
- StartsWith("app") -> true after inserting "apple".
- Insert("app"), Search("app") -> true.

## Clarifying assumptions
- Lowercase a-z is the complete alphabet.
- Duplicate insertion is idempotent.
- A prefix path can exist without being a complete inserted word.

## Progressive hints
1. Give each node 26 child slots and a terminal boolean.
2. Insertion creates missing nodes then marks only the endpoint.
3. Exact search needs both a complete path and terminal=true.
4. Prefix search needs only a complete path.

## Complete C# solution
```csharp dsa-solution
using System;

public sealed class Trie
{
    private sealed class Node
    {
        public Node?[] Children { get; } = new Node?[26];
        public bool IsWord { get; set; }
    }

    private readonly Node root = new();

    private static int Index(char ch)
    {
        if (ch < 'a' || ch > 'z')
            throw new ArgumentException("Only lowercase English letters are supported.");
        return ch - 'a';
    }

    private Node? FindNode(string text)
    {
        Node current = root;
        foreach (char ch in text)
        {
            Node? next = current.Children[Index(ch)];
            if (next is null) return null;
            current = next;
        }
        return current;
    }

    public void Insert(string word)
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

    public bool Search(string word) => FindNode(word)?.IsWord == true;

    public bool StartsWith(string prefix) => FindNode(prefix) is not null;
}

static class Program
{
    static void Check(bool expected, bool actual)
    {
        if (expected != actual) throw new Exception($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        var trie = new Trie();
        trie.Insert("apple");
        Check(true, trie.Search("apple"));
        Check(false, trie.Search("app"));
        Check(true, trie.StartsWith("app"));
        trie.Insert("app");
        Check(true, trie.Search("app"));
        trie.Insert("apple");
        Check(true, trie.Search("apple"));
        Check(false, trie.StartsWith("apply"));
        Console.WriteLine("Implement Trie checks passed.");
    }
}
```

## Correctness argument

Insertion maintains the invariant that each traversed node represents exactly the prefix consumed so far, creating a child only for a missing next symbol. Marking the endpoint records the complete key without changing intermediate nodes. FindNode returns a node exactly when every query symbol follows an existing edge. Exact search additionally checks that this node is terminal, while prefix search does not. Therefore paths for longer words cannot cause a false exact match, and a stored prefix remains searchable when it has children.

## Step-by-step dry run

Insert “apple”: create nodes a-p-p-l-e and mark e terminal. Search “app” reaches the third node but sees terminal=false, so returns false. StartsWith “app” returns true because the path exists. Insert “app” marks that third node terminal without removing the l-e descendants.

## Time complexity

Each operation takes O(L) child lookups for input length L.

## Space complexity

At most one node per distinct prefix plus the root. With a 26-slot array per node, storage is O(26V), where V is node count.

## Alternatives and tradeoffs

- Hash-map children reduce empty child slots for sparse nodes but add map/object overhead and expected-time lookup.
- A HashSet<string> is simpler for exact membership but cannot answer prefix queries without scanning keys.
- A sorted map of full words supports ordered operations but does not share character paths.

## Common mistakes and gotchas

- Returning true from Search when FindNode succeeds, even if terminal is false.
- Inferring terminal status from whether a node has children.
- Clearing child links when marking a prefix word terminal.
- Forgetting duplicate insertion should not change the represented set.
- Allocating a node for each repeated prefix rather than sharing it.

## Edge-case tests

- A word and its shorter prefix are both inserted.
- Search a missing final edge.
- Search a path that exists only as a prefix.
- Insert the same word twice.
- Uppercase input is rejected by the fixed-alphabet implementation.

## Reflection questions
1. Why is terminal state separate from child existence?
2. How would you add deletion without removing shared prefixes?
3. When would a child dictionary be preferable to a 26-slot array?

## Source
- [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/)
