# binary search tree ordering, lookup, and mutation — Reference: BST invariants, comparison, and lookup

## Scope and version

This reference covers the strict-key ordering model used by this module and how that invariant supports lookup and ordered traversal.

## How this group fits the mental model

Each comparison discards one entire subtree because the global bounds guarantee it cannot contain the target. A correct invariant, rather than tree shape alone, is what makes that pruning safe.

## Supplied names explained

- **Global left-subtree ordering:** every descendant in the left subtree has a key smaller than the node key under strict ordering.
- **Global right-subtree ordering:** every descendant in the right subtree has a key greater than the node key.
- **Strict versus duplicate-key policy:** strict trees reject duplicate keys or store multiplicity separately; a variant that routes duplicates needs explicit inclusive bounds and consistent mutation rules.
- **Lower bound inherited from ancestors:** a node may be required to exceed an ancestor's key even when its immediate parent is smaller.
- **Upper bound inherited from ancestors:** a node may be required to stay below an ancestor's key even when its immediate parent is larger.
- **Search path:** comparisons choose left, right, or found; only one root-to-null path is visited.
- **O(height) lookup:** each level costs O(1), so a path of height h costs O(h); worst case is O(n).
- **Inorder sorted traversal:** recursively or iteratively visit left, node, right; strict BST keys appear ascending.
- **Successor:** the next larger key; if a right subtree exists, it is its minimum, otherwise ascend until leaving a left edge.
- **Predecessor:** the next smaller key; if a left subtree exists, it is its maximum, otherwise ascend until leaving a right edge.

## Cross-item comparison

Immediate-child ordering is weaker than the global invariant. Search relies on global ordering to prune; validation must therefore propagate ancestor bounds. Successor and predecessor are adjacent in inorder order, not necessarily the direct child of the original node.

## Examples

In a tree rooted at 10, its left child 5 may have a right child 8: 8 is greater than 5 and still less than 10. A right child 12 under 5 is invalid even though 12 is greater than its parent; the inherited upper bound 10 is violated.

## Common mistakes

- Checking only parent-child relationships during validation.
- Treating a plain BST as guaranteed O(log n).
- Assuming the successor is always the current node's direct right child.
- Using a duplicate policy in insertion that validation and deletion do not follow.
- Returning a value when the API asks for the matching subtree root.

## Knowledge checks with answers

1. **Why can search skip the right subtree when target < node?** Every right-subtree key is greater than the node and therefore also greater than target.
2. **Does inorder yield sorted output for any binary tree?** No; it does for a BST satisfying its ordering invariant.
3. **What is the lookup bound in an unbalanced BST?** O(height), worst-case O(n).

Sources: [Competitive Programmer's Handbook, USACO Guide edition](https://usaco.guide/CPH.pdf), [Search in a Binary Search Tree](https://leetcode.com/problems/search-in-a-binary-search-tree/).
