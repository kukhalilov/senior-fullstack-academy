# tries, prefix trees, and string dictionaries — Reference: Compressed, bitwise, and memory variants

## Scope and version

This lesson explains the nine supplied representation and comparison terms.

## How this group fits the mental model

All variants exploit a shared path structure but choose different edge labels and child storage. Select a representation based on alphabet, query patterns, and memory constraints.

## Supplied names explained

- Radix/compressed trie — A trie variant that combines chains of single-child nodes into edges labeled by multiple symbols. It reduces node count but traversal must match within edge labels and insertion may split an edge.
- Path compression of single-child chains — Replace a sequence of one-child nodes with one multi-symbol edge while preserving key boundaries and terminal positions. A terminal node cannot be merged away unless its terminal state remains representable.
- Binary trie — A trie over bits, with at most two children per level. It often stores fixed-width integers from most-significant or least-significant bit according to the query design.
- Bitwise XOR trie connection — To maximize XOR with a query value, at each bit prefer the opposite bit when that child exists, because it sets the current XOR bit to one; otherwise take the matching bit. Correctness depends on consistent bit width and signed-number interpretation.
- Trie memory proportional to stored prefixes — Node count follows distinct prefixes, but actual bytes also include child containers, labels, terminal payloads, object headers, and allocator overhead.
- Trie versus hash set — A hash set is usually simpler and more compact for exact membership; a trie supports prefix traversal and per-symbol branching without scanning unrelated full keys.
- Trie versus sorted dictionary — A sorted dictionary maintains ordered complete keys and supports ordered operations, while a trie explicitly shares prefixes. Their lookup, iteration, and memory costs differ; neither dominates for every workload.
- Fixed versus sparse alphabet — Fixed arrays give direct indexing and predictable cost but allocate A slots per node. Sparse maps store only present edges but add per-node/per-edge metadata and lookup indirection.
- Pruning after deletion — Remove only nodes that are both nonterminal and childless, proceeding upward. Stop at the first node still representing a key or supporting another key.

## Cross-item comparison

Path compression attacks long unary chains; sparse maps attack mostly empty child arrays. Binary tries change the alphabet to bits and answer bitwise questions. Hash sets and sorted dictionaries store complete keys under different query contracts rather than sharing character-prefix paths.

## Examples

For a long key “internationalization” with no branching words, an uncompressed trie has one node per prefix. A radix trie can store long single-child runs as multi-character edge labels. If another key diverges after “inter”, that edge is split at the branching prefix; if a key ends inside an edge, a terminal boundary must be represented.

For 8-bit values, a binary trie may use eight decisions per key. Querying x chooses the opposite bit at each level when possible, greedily maximizing the most significant differing bit first. For signed integers, define whether bits represent two's-complement order or nonnegative values before applying this rule.

## Common mistakes

- Compressing through a terminal node and losing a key endpoint.
- Assuming a radix trie changes the asymptotic key-length bound; it mainly reduces nodes and pointer traversals.
- Ignoring container/object overhead when comparing actual memory.
- Using signed comparisons in an XOR trie without specifying width and domain.
- Pruning a node still used by a longer key.

## Knowledge checks with answers

1. **When must a radix edge be split?** When insertion diverges inside its label or terminates at an interior prefix.
2. **Why does XOR search prefer the opposite bit?** It maximizes the highest-order differing bit when possible.
3. **When does a hash set usually fit better?** Exact-key membership without prefix operations.
4. **What condition permits deletion pruning?** Node is nonterminal and has no children.

Sources: [USACO Guide: String Searching and Tries](https://usaco.guide/adv/string-search), [Microsoft Dictionary<TKey,TValue>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.dictionary-2).
