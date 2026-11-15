# tries, prefix trees, and string dictionaries — Big-picture orientation and mental model

## Problem and purpose

A trie stores strings by sharing their common prefixes. Instead of treating each key as one indivisible value, it follows one symbol edge at a time. This makes prefix queries natural: reaching a node tells us that some stored key has the path's prefix, while a terminal marker tells us whether that exact path is itself a key.

## Plain-language mental model

Imagine sorting words into a tree of labeled doors. The first door is the first character, the next door is the second, and so on. Words such as “tea” and “team” share the path t-e-a. The node after a is both a complete key and a prefix of a longer key, so completion must be recorded separately from children.

## How the parts fit together

Insertion walks or creates a path, then marks the endpoint terminal. Exact search follows the path and checks that marker. Prefix search follows the path and only checks that it exists. Prefix enumeration starts at that node and traverses terminal descendants. Wildcard search branches at wildcard symbols. Deletion clears the terminal marker and prunes only nodes that no remaining key uses.

Child storage determines the memory and lookup tradeoff. A fixed array gives direct lookup for a small alphabet but reserves a slot for every possible symbol at every node. A hash map or sorted map stores only present edges, adding per-edge overhead but supporting sparse or larger alphabets.

## Concept map

| Need | Trie feature |
| --- | --- |
| Exact key membership | Traverse then check terminal marker |
| Any key with a prefix | Traverse prefix; node existence is enough |
| Shortest matching root | Stop at first terminal node along the path |
| Wildcard pattern | Branch over children at wildcard positions |
| All keys under a prefix | DFS from the prefix node |
| Reduce repeated board search | Stop when a board path is not a trie prefix |
| Store aggregates for prefixes | Maintain values along traversed nodes |

## End-to-end walkthrough

Insert “app” and “apple”. Both words share a-p-p. Mark the node after the third p terminal for “app”, then continue l-e and mark that node terminal for “apple”. Exact search for “app” succeeds because its node is terminal. Prefix search for “app” also succeeds. Exact search for “ap” fails even though that node has children, because it is not terminal. Deleting “app” clears only its terminal marker; the shared path remains because “apple” still uses it.

## When to use it and tradeoffs

Use a trie when prefix operations, autocomplete, wildcard traversal, or shared-prefix search are central. Traversing a key of length L takes O(L) child lookups, independent of the number of stored keys under the usual map-operation model. Memory is proportional to distinct prefix nodes plus child-storage overhead.

For exact membership alone, a hash set is often simpler and more memory-efficient. A sorted dictionary supports ordered key lookup and range traversal but does not share prefix nodes explicitly. Radix tries compress chains; binary tries operate on bits for tasks such as XOR queries.

## What later lessons cover

References explain node and terminal semantics, operations and child representations, wildcard and prefix queries, and compressed/bitwise alternatives. Six C# problems apply these ideas to exact lookup, wildcard matching, root replacement, prefix sums, buildable words, and board word search.

Sources: [USACO Guide: String Searching and Tries](https://usaco.guide/adv/string-search), [Microsoft Dictionary<TKey,TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2).
