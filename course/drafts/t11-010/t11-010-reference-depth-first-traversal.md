# binary trees, recursion, and traversal patterns — Reference: Depth-first traversal orders

## Scope and version

This lesson explains the nine supplied DFS order and implementation terms.

## How this group fits the mental model

Depth-first traversal follows a branch before returning to siblings. The three standard orders differ only in when the current node is processed relative to its children.

## Supplied names explained

- Preorder traversal — Visit node, then left and right subtrees.
- Inorder traversal — Visit left subtree, node, then right subtree.
- Postorder traversal — Visit both subtrees before node.
- Recursive traversal — Use the call stack to remember the current node and unfinished child work.
- Iterative traversal with explicit stack — Store deferred nodes or ancestors in a heap-allocated stack.
- Visit-before-children rule — Preorder; useful when the parent action must precede descendants.
- Visit-between-children rule — Inorder; sorted only when BST ordering is valid.
- Visit-after-children rule — Postorder; useful when results depend on child summaries.
- Null-root base case — A missing subtree contributes an empty result, often returning without visiting.

## Cross-item comparison

Preorder naturally copies or serializes parent before children. Inorder exposes BST values in sorted order only under the BST invariant. Postorder computes heights because child summaries are available before the parent. An explicit stack simulates recursion but does not remove the O(height) storage requirement.

## Examples

For root 2 with left child 1 and right child 3: preorder is [2,1,3], inorder [1,2,3], and postorder [1,3,2]. For iterative inorder, push the entire left chain, pop and visit, then explore that popped node's right subtree.

## Common mistakes

- Swapping preorder and postorder visit placement.
- Claiming inorder sorts an arbitrary binary tree.
- Pushing left before right in a LIFO preorder stack, causing right to be processed first.
- Omitting a null-root base case.
- Forgetting that an explicit stack can also grow O(n) on a skewed tree.

## Knowledge checks with answers

1. **Which order visits the parent first?** Preorder.
2. **Which order computes child-dependent values naturally?** Postorder.
3. **Does iterative traversal eliminate auxiliary memory?** No; it moves deferred state to an explicit structure.
4. **When is inorder sorted?** When the tree satisfies BST ordering.

Source: [OpenDSA: Binary Tree Traversals](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/BinaryTreeTraversal.html).
