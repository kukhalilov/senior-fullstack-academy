# tries, prefix trees, and string dictionaries — Interview questions and reasoning

## Core questions

1. How does a trie differ from a hash set of complete strings?
2. Why does a trie node need a terminal marker?
3. What is the time and memory cost of a fixed-alphabet child array?
4. How do exact search and prefix search differ?
5. How do you implement wildcard search?
6. How can deletion preserve keys that share prefixes?
7. How does a trie accelerate board word search?
8. When is a trie a poor choice?

## Concise interview answers

- A trie shares prefixes explicitly and supports traversal by symbol; a hash set is usually simpler for exact-key membership.
- A path can exist only as a prefix, or it can be both a complete key and a prefix of longer keys.
- Lookup is O(L) child steps for key length L; a fixed array costs O(A) references per node for alphabet size A.
- Exact search requires endpoint terminal=true; prefix search only requires that the path exists.
- Follow literal edges and DFS all existing children at wildcard symbols; require terminal status after consuming the full pattern.
- Clear the key's terminal flag, then prune upward only while nodes are nonterminal and childless.
- Search board paths through trie edges and stop whenever the current path is not a dictionary prefix.
- For exact lookup alone, a hash set may be faster to implement and more memory-efficient; dense fixed child arrays can waste substantial space.

## Deep follow-up answers

### What is the actual trie node bound?

With one node per distinct prefix, node count is one plus the number of distinct nonempty prefixes across keys, at most one plus the sum of their lengths. Actual memory also depends on child representation, object headers, terminal data, and allocator overhead. A fixed array reserves A references even for a node with one child; sparse maps avoid empty slots but add entry structures and lookup indirection.

### Does O(L) lookup mean the whole operation is independent of dictionary size?

Under constant-time or expected-constant-time child lookup, following one key takes O(L) steps. Building the data structure depends on all inserted key characters. Prefix enumeration additionally depends on the subtree explored and output emitted; wildcard search may branch over many paths. State the operation and child lookup assumptions precisely.

### Why is terminal state independent of children?

If “app” and “apple” are both stored, the node for “app” must be terminal and still retain its l child. Exact lookup checks the marker; prefix lookup does not. Deleting “app” clears the marker while keeping the path for “apple”.

### How do you design wildcard search?

At a literal symbol, follow one matching edge. At a wildcard, recurse through every existing child and return true if any branch reaches a terminal node exactly when the pattern ends. If q positions can branch over alphabet size A, the worst case can grow as A^q times query length; trie pruning helps only when branches are absent.

### How does MapSum handle overwrites?

Store current values by full key. On replacing old value with new value, compute delta=new-old and add that delta to every prefix aggregate along the path. Adding the full new value would double-count prior contributions. A terminal value may be stored at the endpoint while a separate key map supplies the old value.

### Why does trie-guided board search help?

Many candidate board paths share dictionary prefixes. The trie lets all words share work. If a path has no outgoing edge for the next board character, no target word can use that path, so stop immediately. The board DFS still needs its own visited-cell invariant and must restore each mark after exploring that branch.

## Scenario questions

### Exact lookup is the only required operation. Would you choose a trie?

Usually start with a hash set unless memory/layout, ordered traversal, or a future prefix requirement favors a trie. Compare full-key hashing, average key length, alphabet, and object overhead under the actual workload.

### Deleting a key also removes a prefix of a longer key. What should happen?

Clear terminal state at the shorter key's endpoint. Retain the node and descendants. Prune only unused nonterminal leaf nodes while walking toward the root.

### Wildcard searches are timing out.

Inspect wildcard count and alphabet branching, stop dead paths early, avoid exploring children after a successful branch when the query is boolean, and consider whether query limits make a trie the right representation.

### A board search finds a word but misses a longer word sharing that path.

Do not return immediately at a terminal node. Emit the word, clear only its terminal payload if duplicate output should be prevented, then continue into children.

## Tradeoffs and alternatives

- Fixed arrays give direct indexing and simple iteration, but reserve alphabet-width storage at every node.
- Hash-map children suit sparse or variable alphabets but have per-map overhead and expected lookup costs.
- Sorted child maps support ordered traversal but add logarithmic lookup and balancing overhead.
- Radix tries reduce unary-node chains but need multi-symbol edge matching and splitting.
- Hash sets are strong for exact membership; sorted dictionaries suit complete-key order and ranges.
- Binary tries specialize the alphabet to bits and support bitwise queries, with fixed-width and signedness assumptions.

## Common weak answers

- “Tries are O(1),” without accounting for key length or child lookup.
- “A node means the word exists,” without terminal state.
- “A fixed array is always faster,” while ignoring large per-node memory.
- “Delete the path,” without checking whether another key shares it.
- “Wildcard search is O(L),” while ignoring branching.
- “Trie improves Word Search II,” without explaining the prefix-pruning condition or cell-reuse invariant.

## Self-check rubric

Score each item 0 (missing), 1 (partial), or 2 (clear and correct):

- Defines node, edge, path, and terminal marker separately.
- Gives the correct exact-versus-prefix condition.
- Accounts for child representation in lookup and memory.
- Explains wildcard branching and full-pattern terminal validation.
- Preserves shared prefixes during deletion.
- States trie-guided board-search and visited-cell invariants.
- Compares against hash sets or sorted dictionaries using query needs.

Sources: [USACO Guide: String Searching and Tries](https://usaco.guide/adv/string-search), [Microsoft Dictionary<TKey,TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2), [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/), [Design Add and Search Words](https://leetcode.com/problems/design-add-and-search-words-data-structure/), [Word Search II](https://leetcode.com/problems/word-search-ii/).
