# tries, prefix trees, and string dictionaries — Reference: Insertion, lookup, deletion, and child storage

## Scope and version

This lesson explains the ten supplied operation and representation terms.

## How this group fits the mental model

All basic operations walk symbols from the root. The terminal marker decides exact membership; the child representation decides per-symbol lookup and storage cost.

## Supplied names explained

- Insert key — Walk each symbol, creating a child when absent, then set terminal at the final node. Inserting an existing key should leave it present without creating duplicate paths.
- Exact-key search — Follow all key symbols and return true only if the final node is terminal.
- Prefix search — Follow the requested prefix and return true when that path exists; terminal status is not required.
- Delete key terminal marker — If the full key exists, clear terminal state. If the key is a prefix of another key, preserve its node and descendants.
- Prune unused suffix nodes — After deletion, walk backward and remove nonterminal childless nodes until reaching a node still needed by a key or branch.
- Fixed child array — Store A child references in every node and index by symbol. Lookup is direct and predictable for a small fixed alphabet; unused slots cost memory.
- Hash-map children — Store only present outgoing symbols in a dictionary. This suits sparse or variable alphabets but adds hash buckets, entry overhead, and expected-time lookup assumptions.
- Sorted child map — Store children in ordered-key form. It supports ordered traversal without sorting at query time, typically with logarithmic child lookup and more per-edge cost than a hash map.
- Sparse alphabet tradeoff — Sparse maps reduce empty child slots, especially when each node has few children, at the cost of indirection and map overhead.
- O(key length) traversal — Insert, exact search, or prefix search follows at most L edges for length L, assuming each child lookup is O(1) or expected O(1). Output enumeration adds the time to visit and emit matches.

## Cross-item comparison

Fixed arrays favor small dense alphabets and predictable lookup. Hash maps favor sparse or broader alphabets. Sorted maps favor ordered child iteration. A trie may use a different representation at different depths if the alphabet distribution justifies it, but that complicates implementation.

## Examples

Insert “app” and “apple”. Deleting “app” clears the terminal marker at the shared node but cannot prune it because the l descendant remains. Deleting “apple” afterward prunes e, l, and then the now-unused app path upward, stopping at the highest node still shared by another key.

For a 26-letter lowercase trie, a fixed array has 26 slots at each node, even if most nodes have only one child. A sparse dictionary stores only existing edges but adds an object/map representation per node or edge depending on implementation.

## Common mistakes

- Returning true from exact search merely because all path nodes exist.
- Deleting a key's nodes without checking terminal status and descendants.
- Forgetting to mark a duplicate insertion terminal (or treating duplicate insertion as a second key).
- Claiming O(L) total memory when a fixed array reserves A references per node.
- Calling dictionary lookup worst-case O(1) without qualifying its hashing model.

## Knowledge checks with answers

1. **What is the final condition for exact search?** Path exists and endpoint is terminal.
2. **What is the final condition for prefix search?** Path exists.
3. **When may suffix pruning stop?** At a terminal node or a node with another child.
4. **Why might a sparse child map save memory?** It avoids storing empty slots for absent alphabet symbols.

Sources: [USACO Guide: String Searching and Tries](https://usaco.guide/adv/string-search), [Microsoft Dictionary<TKey,TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2).
