# binary trees, recursion, and traversal patterns — Interview questions and reasoning

## Core questions

1. What makes a binary tree different from a binary search tree?
2. Explain preorder, inorder, and postorder.
3. How do you separate levels in BFS?
4. How can diameter be computed in one traversal?
5. What is the difference between node-count height and edge-count diameter?
6. What happens to recursive stack usage on a skewed tree?

## Concise interview answers

- A binary tree limits child positions to left and right; a BST adds an ordering invariant.
- DFS orders specify when a node is processed relative to its children.
- Snapshot queue size at each level and remove exactly that many nodes.
- Postorder returns child heights and updates a global maximum with their sum at each node.
- The maximum-depth problem counts nodes; diameter in this problem counts edges.
- Recursive space is O(height), which may be O(n), not always O(log n).

## Deep follow-up answers

### Why is diameter not necessarily through the root?

Every tree path has a highest node relative to the root, and its two branches meet there. That node can be deep inside one subtree. A one-pass solution computes child heights postorder and updates the global maximum at every node.

### Why use queue-size snapshots in level order?

At the start of a level, the queue contains exactly its nodes. Processing may enqueue children, so using the live queue count would mix levels or make the loop boundary move. A saved count creates a stable level boundary.

### How do you convert recursive inorder to iterative?

Push a left chain, pop and visit one node, then enter its right subtree. The stack contains ancestors whose left side is complete but whose visit and right side remain.

### Why is repeated height calculation inefficient for balance?

Computing height independently at every node revisits descendants. In a skewed tree this sums O(n)+O(n-1)+... and becomes O(n²). A postorder helper returns height or failure once per node.

### How do you test root-to-leaf sum correctly?

Carry remaining sum or accumulated value downward. Compare only at a leaf. Negative values invalidate pruning rules based only on the partial sum's sign.

## Scenario questions

1. **Need nodes grouped by distance from root.** Use BFS and a per-level count snapshot.
2. **Need a value summary from both child subtrees.** Use postorder and define the returned subtree result.
3. **Need sorted values from an arbitrary binary tree.** Inorder does not suffice unless a BST ordering invariant is known.
4. **Tree may be a long chain and runtime stack is constrained.** Use iterative traversal or explicit postorder state.
5. **Two branches have repeated equal values but different shapes.** Compare null structure and mirrored positions, not just value multisets.

## Tradeoffs and alternatives

- Recursive DFS is concise and mirrors tree induction; iterative forms expose deferred work and avoid call-stack dependence.
- DFS often uses O(height) auxiliary state; BFS can use O(width).
- Top-down path state and bottom-up summaries solve different information-flow needs.
- Morris traversal can provide constant auxiliary traversal space by temporarily mutating links, but adds restoration and correctness hazards.

## Common weak answers

- **“Inorder always sorts a binary tree.”** Only a BST's ordering invariant provides that result.
- **“Tree recursion uses O(log n) stack.”** Only if height is logarithmic; arbitrary trees can be skewed.
- **“Diameter is the max child diameter.”** That misses paths passing through the current node.
- **“Path sum is true when the running total matches anywhere.”** The task requires a leaf.
- **“Queue.Count is the level boundary.”** Child enqueues change it; snapshot the initial size.

## Self-check rubric

Can you state the node-versus-edge convention; give the recursive base case; name the exact invariant for DFS/BFS; prove a postorder summary; bound stack by height and queue by width; and distinguish values from node identity?

Sources: [OpenDSA: Binary Trees](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/BinaryTree.html), [Binary Tree Traversals](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/BinaryTreeTraversal.html), [LeetCode: Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/).
