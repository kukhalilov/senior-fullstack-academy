# binary search tree ordering, lookup, and mutation — Reference: Insertion, deletion, and ordered queries

## Scope and version

This reference explains link updates for insertion and deletion, plus ordered queries that reuse inorder structure.

## How this group fits the mental model

Mutations follow one search path and change only a local link or replacement key. Inorder order supplies minimum, maximum, successor, predecessor, and selection by rank.

## Supplied names explained

- **Insert at empty child link:** descend by comparisons and attach the new unique key where the chosen child is null; an empty tree receives a new root.
- **Delete leaf node:** replace the parent's reference to it with null, or return null when it is the root.
- **Delete node with one child:** replace the node with its only child, preserving that child's subtree.
- **Delete node with two children:** choose successor or predecessor, move its key/node into the target position, then remove it from the old position.
- **Inorder successor replacement:** select the minimum key in the target's right subtree; it has no left child.
- **Inorder predecessor replacement:** select the maximum key in the target's left subtree; it has no right child.
- **Minimum and maximum key:** follow left links to the minimum or right links to the maximum, O(height).
- **Kth smallest by inorder traversal:** count visits in ascending traversal and stop at k; O(height+k) worst case and O(height) stack.
- **Range query pruning:** skip left when node key is below the lower query bound and skip right when above the upper bound; runtime O(height + reported nodes) in balanced/prunable cases, O(n) worst case.
- **Subtree-size augmentation:** store each node's subtree node count; use left size to choose a rank branch, but recalculate metadata on every changed path.

## Cross-item comparison

Successor and predecessor are symmetric replacement choices. The successor route is often implemented as “leftmost node in right subtree.” Value-copy replacement is compact; node transplant may be necessary when external code relies on node identity. A plain inorder kth query can stop early, while subtree sizes help repeated rank queries but add mutation obligations.

## Examples

Delete 5 from a tree where its right subtree is rooted at 8 and has left child 6. The successor is 6. Replace 5's key with 6, then remove the old 6 node (which has no left child and at most one right child). The remaining inorder sequence stays sorted.

## Common mistakes

- Deleting a two-child node without reconnecting the successor's possible right child.
- Failing to return the updated root when deleting or inserting at the root.
- Treating a valid successor as necessarily a leaf; it can have a right child.
- Forgetting to update subtree-size metadata up the changed path.
- Counting kth traversal from zero while the problem defines k as 1-indexed.

## Knowledge checks with answers

1. **Why does the successor have no left child?** If it did, that child would be a smaller key in the same right subtree.
2. **What are the three deletion shapes?** Leaf, one child, and two children.
3. **What does subtree-size metadata buy?** O(height) rank selection after O(height) mutation updates, rather than scanning k inorder nodes.

Sources: [Competitive Programmer's Handbook, USACO Guide edition](https://usaco.guide/CPH.pdf), [Delete Node in a BST](https://leetcode.com/problems/delete-node-in-a-bst/), [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/).
