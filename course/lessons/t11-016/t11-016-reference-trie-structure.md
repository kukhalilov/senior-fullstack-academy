# tries, prefix trees, and string dictionaries — Reference: Prefix-node structure and terminal semantics

## Scope and version

This lesson explains the ten supplied structural terms for a character trie.

## How this group fits the mental model

Each root-to-node path spells a prefix. Edges represent symbols; terminal state records whether the complete path is a stored key.

## Supplied names explained

- Trie/prefix tree — A rooted tree that shares common key prefixes. A key of length L follows L edges; keys with common prefixes share nodes.
- Root node — The node for the empty prefix. It usually exists even when no empty key is stored.
- Character edge — A parent-to-child link labeled by one symbol in the chosen alphabet. In a general trie, an edge may represent a token, byte, bit, or compressed label instead.
- Prefix node — The node reached after consuming a prefix. It may be nonterminal, terminal, or terminal with descendants.
- Terminal/end-of-key marker — State indicating that a complete key ends at this node. It is independent of the node's child links.
- Key that is also a prefix — A stored key whose node also has descendants, such as “app” when “apple” is stored.
- Child lookup — Find the outgoing edge for the next symbol. An array indexed by a fixed alphabet gives direct lookup; a map performs a key lookup with its own time and memory characteristics.
- Shared prefix — A sequence of symbols common to multiple keys, represented by one shared path rather than copied per key.
- Alphabet size — Number A of distinct edge labels that may occur at a node. It influences fixed-array width and wildcard branching.
- Node count by distinct prefixes — For a root plus one node per distinct nonempty prefix, node count is 1 plus the number of unique prefixes of all stored keys; it is at most 1 plus the sum of key lengths.

## Cross-item comparison

A prefix node records position in the key path; terminal state records membership. Neither implies the other: a node can be nonterminal with children, or terminal without children, or both terminal and branching.

## Examples

After inserting “app” and “apple”, the shared nodes a, ap, and app occur once. The app node has terminal=true and a child l; the apple node is terminal and has no child. Exact search for “ap” fails although its node exists; prefix search for “ap” succeeds.

With keys “to”, “tea”, and “ted”, root has a t edge, which branches to o and e; e branches to a and d. Every shared prefix is a node once.

## Common mistakes

- Inferring key membership from node existence.
- Treating terminal nodes as leaves.
- Counting one complete path per key rather than shared prefixes when estimating memory.
- Assuming fixed child-array width is free because the alphabet is small.

## Knowledge checks with answers

1. **What does the root represent?** The empty prefix.
2. **Can a terminal node have children?** Yes; the key can prefix longer keys.
3. **What determines node count?** Distinct prefixes, including the root.
4. **What does alphabet size affect?** Child storage and how many branches a wildcard may explore.

Sources: [USACO Guide: String Searching and Tries](https://usaco.guide/adv/string-search), [Microsoft Dictionary<TKey,TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2).
