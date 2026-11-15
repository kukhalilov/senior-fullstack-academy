# binary trees, recursion, and traversal patterns — Reference: Tree shape, terminology, and representations

## Scope and version

This lesson explains the fifteen supplied structural terms. Tree terminology is stable; representation conventions must be stated by each problem.

## How this group fits the mental model

Tree shape controls navigation and resource use. Values are payload; edges and null children define structure. A binary tree does not imply sorted keys or balanced height.

## Supplied names explained

- Rooted tree — Connected acyclic structure with one designated root.
- Binary tree — Each node has zero, one, or two child positions, conventionally left and right.
- N-ary tree — A node can have any number of children; child enumeration replaces two fixed links.
- Root node — Top node with no parent in the rooted view.
- Parent and child — Adjacent nodes related by an edge directed away from the root.
- Sibling — Nodes sharing a parent.
- Leaf node — Node with no children.
- Subtree — A node together with all descendants and their connecting edges.
- Tree depth — Number of edges from the root to a node, unless a problem explicitly counts nodes.
- Tree height — Longest downward path to a leaf; state whether edges or nodes are counted.
- Balanced shape — Informal description unless the exact balance condition is supplied; balance may mean a local height bound or a global shape property.
- Skewed tree — Each node has at most one child along a long chain; height can be n.
- Null child — Missing child reference; it contributes no node and is the usual recursive base case.
- Level-order array representation — Commonly breadth-first serialization with null markers; omitted trailing nulls may be allowed, but parsing rules belong to the format.
- Node identity — Reference identity distinguishes nodes even when their values are equal.

## Cross-item comparison

Binary tree describes branching degree; binary search tree adds an ordering invariant. Balanced and skewed describe shape and therefore height, independent of node values. Null markers in a level-order array encode structure, not payload values.

## Examples

Two different nodes may both contain 5 but have different parents and positions. A chain of n nodes is still a binary tree, but has height n by node count and can exhaust recursion at sufficient scale.

## Common mistakes

- Treating a general binary tree as a binary search tree.
- Assuming the left child value is smaller than the parent.
- Confusing depth and height.
- Measuring height in nodes in one function and edges in another without translating.
- Using values as unique node identifiers.

## Knowledge checks with answers

1. **Can a binary tree have one child at each level?** Yes; it is skewed.
2. **Does binary imply balanced?** No.
3. **Can sibling nodes have equal values?** Yes.
4. **Why does null matter?** It is an explicit absent subtree and supplies a base case.

Source: [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
