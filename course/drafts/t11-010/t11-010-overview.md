# binary trees, recursion, and traversal patterns — Big-picture orientation and mental model

## Problem and purpose

Trees encode hierarchical relationships. Binary-tree algorithms exploit at most two child links, but node values need not have any ordering. This unit teaches structural reasoning: where to visit, what information to return from a subtree, and how height affects resource use.

## Plain-language mental model

Treat a node as the root of a smaller tree. A recursive algorithm solves the same question for its left and right subtrees, then combines the answers. Traversal order says when the current node is processed: before children (preorder), between them (inorder), or after them (postorder). Breadth-first traversal instead visits one distance layer at a time with a queue.

## How the parts fit together

Depth measures distance downward from the root; height measures distance downward to a deepest leaf. Problems vary on whether these count edges or nodes. Maximum depth as defined here counts nodes, while diameter counts edges. A postorder summary can return child heights and update a global path answer in one pass. This avoids recomputing subtree information.

Recursion is concise, but its stack grows with tree height. A tree with a suitable balancing invariant has logarithmic height; the informal label “balanced” alone is not a proof of that bound. A skewed tree can have height n. Iterative traversal uses an explicit stack or queue and makes storage visible, though level-order queues may hold an entire wide layer.

## Concept map

| Need | Traversal/state | Key boundary |
| --- | --- | --- |
| Visit nodes in a specified DFS order | Preorder, inorder, postorder | When current node is emitted |
| Visit by distance layers | Queue BFS | Capture queue count before processing level |
| Compute height or diameter | Postorder child summaries | Empty tree height and edge/node units |
| Transform every subtree | Recursive swap or visit | Return transformed root |
| Check symmetry | Compare mirrored child pairs | Structure and value both matter |
| Root-to-leaf condition | Carry path state | Test only at a leaf, not any node |

## End-to-end walkthrough

For a node with left and right subtree heights L and R, its height in node-count convention is 1 + max(L,R), with null height 0. Its longest path passing through it has L + R edges. A postorder visit gets L and R before combining them; updating the diameter there handles paths whose highest point is this node. The global maximum covers paths through any node, not just the root.

## When to use it and tradeoffs

Use recursive subtree summaries when each answer composes from child answers and depth is safe. Prefer an iterative form when a skewed tree can exceed the language's call-stack limits or when explicit control is useful. BFS is natural for levels and minimum edge distance in an unweighted tree; DFS is often simpler for subtree aggregates.

## What later lessons cover

The concepts lesson fixes the terminology, traversal contracts, recursion invariants, and height/diameter relation. Four references cover structure, DFS, BFS, and recursive summaries. Eight problems exercise these patterns with compiling C# programs.

Sources: [OpenDSA: Binary Trees](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/BinaryTree.html), [Binary Tree Traversals](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/BinaryTreeTraversal.html).
