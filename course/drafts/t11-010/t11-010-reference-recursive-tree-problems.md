# binary trees, recursion, and traversal patterns — Reference: Recursive summaries, paths, and complexity

## Scope and version

This lesson explains the ten supplied recursive-combination, path, and complexity concepts.

## How this group fits the mental model

A recursive tree function should specify what one call returns for its subtree. Postorder makes child results available before combining them at the current node. A global accumulator is appropriate for answers that may be centered anywhere in the tree.

## Supplied names explained

- Recursive subtree result — A clearly defined value computed for the subtree rooted at a node.
- Postorder combination — Obtain left and right results, then combine them at the current node.
- Maximum depth recurrence — Node-count depth is 0 for null and 1+max(child depths) otherwise.
- Tree diameter through child heights — At a node, left height plus right height is a candidate edge-count path; update a global best.
- Balance check with height result — Return height or an unbalanced sentinel to detect failure in one pass.
- Root-to-leaf path state — Carry the partial path or remaining sum down one branch at a time.
- Path sum — Accept only at a leaf when accumulated values match the target.
- O(n) visit-once traversal — Each node is processed a constant number of times.
- O(height) recursion stack — Active calls follow one root-to-leaf path; height can be n.
- Skewed-tree stack risk — Linear recursion depth may exceed practical stack limits.

## Cross-item comparison

Top-down methods pass state from parent to child; bottom-up summaries return child facts upward. Diameter and balance are naturally bottom-up. Path sum is naturally top-down. Some problems can use either, but the contract should make information flow explicit.

## Examples

For a leaf, height in nodes is 1 and through-node diameter is 0 edges. If left and right child heights are 2 and 3 nodes, the through path has 5 edges. A path sum at a node with matching remaining target succeeds only if both children are null.

## Common mistakes

- Recomputing subtree height at each node and making a skewed tree O(n²).
- Returning an edge height when the parent expects node height.
- Updating diameter only at root.
- Returning true for target sum at an internal node.
- Assuming recursion depth is logarithmic for arbitrary trees.

## Knowledge checks with answers

1. **What should a recursive summary state?** Its meaning for every subtree, including null.
2. **Why use a global diameter maximum?** The longest path may be entirely within a child.
3. **How short-circuit balance in one traversal?** Propagate an unbalanced sentinel instead of recomputing heights.
4. **What governs call-stack depth?** Tree height.

Source: [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
