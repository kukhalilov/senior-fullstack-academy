# tries, prefix trees, and string dictionaries — Reference: Prefix enumeration and wildcard search

## Scope and version

This lesson explains the eight supplied prefix-query and pattern-search terms.

## How this group fits the mental model

Once a query reaches a trie node, its descendants represent exactly the keys sharing that prefix. Queries either enumerate those descendants or branch where the pattern allows multiple symbols.

## Supplied names explained

- Enumerate keys under prefix — Traverse to the prefix node, then DFS through its subtree and emit terminal paths. Runtime includes the total output length, not merely the initial lookup.
- Lexicographic trie traversal — Visit child edges in ascending symbol order and emit terminal nodes in a documented order. With sorted child storage, children are already ordered; with a fixed lowercase array, scan a through z.
- Wildcard character branch — At a wildcard position, recursively try every existing child; for a literal, follow only its matching edge. A match requires the query to be fully consumed at a terminal node.
- Pattern search with multiple active nodes — A wildcard query may leave several trie nodes as possible current states. Continue each branch; accept if any complete branch reaches a terminal endpoint. Avoid confusing “some prefix matched” with “whole pattern matched.”
- Autocomplete prefix result set — Locate the prefix node and return some or all terminal descendants. A production feature may also rank, limit, or paginate results; a plain trie only represents the prefix relation.
- Longest stored prefix — Traverse the query string and remember the deepest terminal node reached. The last remembered terminal is the longest stored key that prefixes the query; the first is the shortest. Stop when an edge is absent.
- Word break trie integration — Use a trie to find dictionary words beginning at an input position, then use DP over positions to determine segmentability or count ways. The DP state answers the suffix/prefix subproblem; trie traversal supplies valid word transitions.
- Trie node as DP state — In a product search, the state may combine an input position or board location with a trie node. Matching an edge advances both components; this shares common dictionary prefixes across candidate strings.

## Cross-item comparison

Literal queries follow one path. Wildcards create branching paths. Prefix enumeration explores a subtree and pays for returned results. A longest-prefix query can stop at the end of the input or first missing edge while remembering the last terminal node.

## Examples

Store roots “cat” and “cattle”. For query “caterpillar”, record a match at “cat”; the path may stop before the next edge. The longest stored prefix is “cat”. For replacement by the shortest root, stop as soon as the first terminal is encountered.

For pattern “b..”, the first literal follows only b. Each of the next two dots branches over available children; any branch that disappears is pruned. The query succeeds only if a branch ends at a terminal node after three symbols.

## Common mistakes

- Returning a prefix node as a full wildcard match without checking terminal state.
- Returning only the first terminal when the task asks for the longest stored prefix.
- Enumerating every key in the trie and filtering by prefix instead of traversing the prefix subtree.
- Ignoring output cost for autocomplete enumeration.
- In word break, combining trie matches without a DP state can enumerate exponentially many segmentations when only reachability is needed.

## Knowledge checks with answers

1. **What does a longest-prefix query remember?** The deepest terminal node reached during traversal.
2. **How are wildcard branches pruned?** Stop a branch when the required child edge is absent.
3. **What must a complete pattern match end at?** A terminal node after consuming the entire pattern.
4. **What does the trie contribute to word break DP?** Valid dictionary-word transitions from each input position.

Sources: [USACO Guide: String Searching and Tries](https://usaco.guide/adv/string-search), [Implement Trie (Prefix Tree)](https://leetcode.com/problems/implement-trie-prefix-tree/), [Design Add and Search Words](https://leetcode.com/problems/design-add-and-search-words-data-structure/).
