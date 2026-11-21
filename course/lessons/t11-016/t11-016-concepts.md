# tries, prefix trees, and string dictionaries — Core concepts and how they fit together

## Learning objectives

- Explain how a trie represents shared prefixes with edges and nodes.
- Distinguish a path existing from a complete key being stored.
- Compare fixed arrays, hash-map children, and sorted child collections.
- Analyze insertion, exact search, prefix search, wildcard branching, and deletion.
- Recognize when a trie is preferable to a hash set or sorted dictionary.

## Prerequisites

Know strings, arrays, trees, hash maps, DFS, and basic complexity analysis. This topic uses lowercase English letters for several problems, but a general trie may store Unicode code points, bytes, tokens, or bits depending on its key alphabet.

## Core concepts

A trie node corresponds to a prefix, not necessarily a stored key. Each outgoing edge appends one symbol. The root represents the empty prefix. A terminal marker distinguishes an inserted key from a path that only leads to longer keys; a terminal node may also have children.

For a key of length L, insert and exact lookup follow at most L edges. Prefix search succeeds when the prefix path exists, even if its endpoint is not terminal. The number of nodes is one plus the number of distinct nonempty prefixes among stored keys. A fixed child array uses O(A) references per node for alphabet size A; sparse child maps use storage proportional to actual edges but require map overhead.

## Mechanisms and relationships

### Operations

Insertion creates missing child nodes and marks the endpoint. Exact search follows the path and checks terminal status; prefix search only checks path existence. Deletion first confirms the full key exists, clears its terminal marker, then walks back pruning nodes that are nonterminal and childless. If a deleted key is also a prefix of another key, its node remains.

### Prefix and pattern queries

Enumeration locates the prefix node, then DFSes descendants and emits terminal keys. Lexicographic traversal visits child symbols in sorted order. Wildcard search follows a literal edge for ordinary symbols and explores every child for a wildcard. If there are q wildcards over an alphabet of size A, worst-case branching can approach A^q before accounting for path length; missing branches prune early.

### Trie-guided board search

For word search on a board, begin a DFS from each cell and follow the trie edge matching that cell. A missing edge proves no dictionary word extends the board path, so that search branch stops. Mark each board cell while it is in the current path so it cannot be reused in that word, then restore it. Finding a terminal word can clear its terminal payload to avoid returning it more than once; pruning a now-empty trie branch can further reduce later work.

### Variants

A radix/compressed trie merges chains of single-child nodes and stores edge labels that may span multiple symbols. A binary trie branches on bit 0 or 1 and is useful for bitwise prefix relations such as maximum XOR. These representations change edge semantics and query invariants; they are not just different child containers for the same character trie.

## Worked examples

Insert “car”, “cart”, and “cat”. The paths share c-a. The node after r is terminal for “car” and has a t child for “cart”; the node after a is not terminal unless “ca” was inserted. A search for “ca” therefore fails while startsWith “ca” succeeds.

With words “bad”, “dad”, and “mad”, query “.ad” branches from the root across the available first-letter children, then follows a and d. The search returns true if any full matching path ends at a terminal node; reaching a nonterminal prefix at the query's end is not enough.

## Misconceptions and edge cases

- A node with children is not automatically a stored key.
- A stored key can also be a prefix of longer stored keys.
- Deleting a key must not remove shared nodes needed by other keys.
- Prefix lookup and exact lookup have different terminal conditions.
- Fixed arrays trade memory for predictable direct lookup; they are not always preferable.
- Trie traversal is O(key length) only under stated child-lookup assumptions; enumerating results also costs the output size.
- Unicode strings have encoding and normalization concerns; a char-based edge is a UTF-16 code unit in C#, not necessarily a Unicode scalar or grapheme cluster.

## Knowledge checks with answers

1. **Why have a terminal marker?** A path can be only a prefix, or both a prefix and a stored key.
2. **What does prefix search check?** That the requested path exists, even if it is not terminal.
3. **When may deletion prune a node?** When it is nonterminal and has no remaining children.
4. **What is wildcard search's worst case?** It may explore many children at each wildcard, up to alphabet-size branching per wildcard.
5. **When might a hash set be better?** When only exact key membership is needed and prefix structure is not useful.

Sources: [USACO Guide: String Searching and Tries](https://usaco.guide/adv/string-search), [Microsoft Dictionary<TKey,TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2).
