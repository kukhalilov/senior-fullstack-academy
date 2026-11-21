# binary search tree ordering, lookup, and mutation — Reference: Height, degeneration, and balanced-tree boundary

## Scope and version

This reference relates plain BST costs to height and distinguishes the ordinary BST invariant from balancing invariants.

## How this group fits the mental model

Ordering decides which direction is legal; height counts how many such decisions are needed. A tree can be ordered and still be a poor search structure if it is tall.

## Supplied names explained

- **Height-dependent operation cost:** search, insert, delete, and extremum lookup take O(h) for height h; traversal still visits O(n) nodes.
- **Degenerate chain from sorted insertion:** ascending insertion repeatedly follows right links, creating height n (or n-1 depending on convention) and O(n) operations.
- **Expected shape under random insertion:** random key order often yields logarithmic expected height under the random-permutation model, but individual trees can be taller and the guarantee is probabilistic.
- **AVL balance invariant: each node's left/right subtree heights differ by at most one (orientation only):** rebalancing uses rotations after updates.
- **Red-black invariants: black root and NIL leaves, no red node has a red child, equal black height on every node-to-NIL path (orientation only):** these rules prevent a root-to-leaf path from being more than twice as long as another and give height O(log n); this module does not derive or implement insertion/deletion fix-up.
- **Tree rotations as rebalancing idea:** a local pointer rearrangement changes shape while preserving inorder key order.
- **Unbalanced BST limitation:** no self-correction exists; insertion order can control height.
- **Self-balancing trees excluded from implementation detail:** AVL and red-black full update algorithms, B-trees and other variants belong outside this lesson's scope.

## Cross-item comparison

Plain BST operations are O(h), with O(n) worst case. Self-balancing trees add metadata and mutation work to maintain h=O(log n). A randomized insertion assumption may explain common observed behavior but is not a replacement for a worst-case guarantee.

## Examples

Insert `1,2,3,4,5` into a plain BST: every new key follows the right edge, so searching for 5 examines all five nodes. A rotation can change local shape without changing inorder sequence, but an ordinary BST does not rotate by itself.

## Common mistakes

- Writing O(log n) for a plain BST without an explicit balance guarantee.
- Confusing AVL's height-difference rule with red-black color properties.
- Saying “red-black colors keep the tree balanced” without naming the no-red-parent/child and equal-black-height rules that bound path length.
- Assuming rotations change the sorted inorder order.
- Treating “expected balanced” as deterministic worst-case behavior.
- Implementing only one rotation and claiming a complete self-balancing tree.

## Knowledge checks with answers

1. **What variable controls lookup work?** Height h, not node count alone.
2. **Can a BST be valid but degenerate?** Yes; a sorted insertion sequence creates a chain.
3. **What does a rotation preserve?** The inorder ordering of keys while changing local shape.

Sources: [Competitive Programmer's Handbook, USACO Guide edition](https://usaco.guide/CPH.pdf).
