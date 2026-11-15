# binary search tree ordering, lookup, and mutation — Core concepts and how they fit together

## Learning objectives

- State strict BST order over complete subtrees.
- Reuse the ordering rule for search, insertion, deletion, traversal, and rank queries.
- Relate operation cost to height and identify where plain BST guarantees stop.

## Prerequisites

Know binary-tree nodes and links, comparisons, and the meaning of a subtree. Inorder traversal visits left subtree, node, then right subtree.

## Core concepts

### The global ordering invariant

For strict unique keys, every value in a node's entire left subtree is less than the node's value, and every value in the entire right subtree is greater. The word *entire* matters: checking only immediate children is insufficient. For example, 12 cannot appear anywhere in the left subtree of 10, even if its parent is 15.

If duplicates are allowed, the data structure must define a policy: store a multiplicity at one node, route equal keys consistently to one side, or extend the comparison with a unique tie-breaker. Inserting equal values to the left changes the validation bounds and rotation rules for balanced variants. The canonical problems here use distinct keys, so strict bounds are appropriate.

## Mechanisms and relationships

### Search, insert, and delete share one path rule

Compare the target with the current key. Equality answers a search. A missing left/right link is the insertion position. Deletion first uses the same search path, then changes links locally:

1. A leaf is replaced with null.
2. A node with one child is replaced by that child.
3. A node with two children is replaced by its inorder successor (the minimum in its right subtree) or predecessor (the maximum in its left subtree); then remove that replacement node from its old position.

The successor has no left child, so its removal has at most one child. Copying the successor value into the deleted node preserves node links but changes the value associated with that object; alternatively, physically transplant the successor node when identity matters.

### Traversal and order statistics

Inorder traversal visits left subtree, node, right subtree and therefore emits strict BST keys in ascending order. Reverse inorder emits descending order. To find one kth-smallest value, an iterative inorder traversal can stop immediately at visit k, using O(height) stack space. If many rank queries follow mutations, store subtree sizes and update them on every mutation; then descend by comparing k with the left-subtree size. That augmentation makes updates more complex and must remain consistent after deletion.

### Height governs the cost

Search, insert, delete, predecessor/successor lookup, and a pruned range query cost O(height) plus output where applicable. A balanced tree has height O(log n), but a plain BST offers no such guarantee. Inserting sorted keys into an initially empty ordinary BST creates a chain of height n. Random insertion order tends to produce shorter expected height under suitable assumptions, but this is not a deterministic guarantee.

AVL and red-black trees add balance metadata and rotations to bound height. The exact invariants differ; these lessons identify that boundary without teaching their complete algorithms. A library ordered collection is preferable when predictable balanced height is required; this hand-built plain BST does not provide that guarantee.

### Bounds, sentinels, and integer endpoints

Validation should carry an allowed lower and upper bound from all ancestors. A strict check is `lower < value < upper`. Using `int.MinValue` and `int.MaxValue` as sentinel bounds accidentally excludes those legal key values. Use nullable bounds, or a wider type such as `long` when keys are `int`. With duplicates, bound inclusivity must match the chosen duplicate policy.

### Recursive and iterative representations

Recursive code mirrors subtree structure and is often clearest for validation, mutation, and preorder construction. Its call stack is O(height), which becomes O(n) for a chain and may overflow for a sufficiently deep tree. Iterative search and inorder traversal use explicit links or stacks and make memory behavior visible. Recursion depth limits depend on runtime and environment; do not claim a universal safe node count.

## Worked examples

Consider root 10, left child 5, and 12 as the right child of 5. Each parent-child edge looks locally ordered, but 12 is in the root's left subtree and violates the global upper bound of 10. This is why validation carries the root's bound through every deeper call.

## Misconceptions and edge cases

- Immediate child checks do not establish the global invariant.
- An ordered tree is not necessarily balanced; sorted insertion can create a chain.
- Integer sentinels can exclude legal endpoint keys; use wider or nullable bounds.
- A duplicate-key policy must agree across validation, insertion, deletion, and balancing.
- Recursive depth is O(height), which can be O(n); iterative code avoids depending on call-stack limits.

## Topic boundary

The named concepts are strict/global subtree ordering; lower and upper bounds; path search and O(height) lookup; inorder ordering; successor/predecessor; leaf/one-child/two-child deletion; root and link changes; minimum/maximum; kth-smallest traversal; range pruning; subtree-size augmentation; degenerate and expected shapes; rotations and balance invariants at a conceptual level; duplicate policy; node identity; recursion versus iteration; and sorted-array tradeoffs. AVL, red-black, B-tree, treap, and splay implementations remain outside scope.

Sources: [Competitive Programmer's Handbook, USACO Guide edition](https://usaco.guide/CPH.pdf), [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/), [Delete Node in a BST](https://leetcode.com/problems/delete-node-in-a-bst/).

## Knowledge checks with answers

1. **Can 12 be the right child of 5 inside the left subtree of 10?** No. It violates the inherited strict upper bound 10.
2. **What is the cost of searching an unbalanced BST?** O(height), up to O(n).
3. **What does inorder traversal return for a strict BST?** All keys in ascending order.
