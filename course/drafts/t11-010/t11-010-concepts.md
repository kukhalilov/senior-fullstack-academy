# binary trees, recursion, and traversal patterns — Core concepts and how they fit together

## Learning objectives

- Distinguish tree structure from search-tree ordering.
- Trace DFS and BFS traversal contracts.
- Build postorder summaries for height, diameter, and balance.
- Account for node-count versus edge-count conventions and skewed recursion depth.

## Prerequisites

Know references, recursion, stacks, queues, and asymptotic analysis. Binary-tree nodes may contain duplicate values; identity is the node reference, not its value.

## Core concepts

A rooted tree is connected and acyclic with one designated root. In a binary tree each node has at most a left and right child; there is no key-order rule unless it is explicitly a binary search tree. A subtree rooted at a child is itself a tree. A leaf has no children; a null child represents absent structure.

Depth counts distance from root to node; height counts distance from node down to a deepest leaf. One convention counts edges; another counts nodes. State the convention before writing a recurrence. Here maximum depth uses node count: null has depth contribution 0, and a node returns 1 + max(left,right). Diameter in the source problem counts edges.

## Mechanisms and relationships

### Depth-first orders

Preorder processes node, left subtree, right subtree. Inorder processes left, node, right. Postorder processes left, right, node. Recursive code mirrors these definitions. An iterative inorder uses a stack: descend left while pushing, pop and emit, then move right. An iterative preorder can push right before left so left is popped first. Postorder needs two stacks or a carefully tracked last-visited node.

### Breadth-first and levels

BFS enqueues root, then repeatedly dequeues a node and enqueues its children left to right. For level grouping, capture the queue count at the start of each iteration and dequeue exactly that many nodes; newly enqueued children belong to the next level. Queue space is O(width), which can approach O(n).

### Postorder summaries

For maximum depth, recursively get child depths and return one plus the larger. For diameter, each node's through-path has leftHeight + rightHeight edges; update a shared maximum and return one plus the greater child height. The diameter may lie wholly inside one child, so the global maximum is necessary.

For balance, return either a height or a failure sentinel. If a child is unbalanced, propagate failure immediately; otherwise compare child heights and fail when their difference exceeds one. This visits each node once. Recomputing a full height at every node can degrade to O(n²) on a skewed tree.

### Paths and transformations

Root-to-leaf path state accumulates values or remaining target as the recursion descends. A path sum is successful only at a leaf; a matching prefix ending at an internal node is not enough. Inverting a tree swaps each node's child references recursively or iteratively; doing so mutates the structure but not node values. Symmetry compares mirrored pairs: outer children with each other and inner children with each other, including null structure.

## Worked examples

For a root with left subtree height 2 nodes and right subtree height 1 node, node-count height is 3; a path through the root has 3 edges. For a queue containing nodes from the current level, snapshot its size before removing them. Enqueuing grandchildren during that loop does not change the number processed in this level.

## Misconceptions and edge cases

- Inorder traversal sorts values only when the input has the binary-search-tree ordering property.
- Maximum depth by nodes and diameter by edges use different units.
- A recursive algorithm on a skewed tree can use O(n) call stack; “tree recursion is logarithmic” is false without a balance assumption.
- Comparing only node values misses structural asymmetry and duplicate-value identity.
- A path-sum match must end at a leaf.
- Repeated height computation can turn a one-pass summary into quadratic work.

## Knowledge checks with answers

1. **What does inorder guarantee for an arbitrary binary tree?** Only left-node-right visit order; not sorted values.
2. **Why snapshot queue count for a level?** Children added during processing must remain in the next level.
3. **What is a node's through-diameter?** Left height plus right height when heights count nodes; that sum counts edges.
4. **What is null height for the node-count recurrence?** Zero.
5. **Why use reference identity?** Different nodes can have the same value but remain distinct structural positions.

Source: [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
