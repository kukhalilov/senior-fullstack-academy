# binary search tree ordering, lookup, and mutation — Interview questions and reasoning

## Core questions

1. State the BST invariant without limiting it to immediate children.
2. Why is search O(height), and what is its worst-case cost?
3. Why does inorder traversal produce sorted keys?
4. How should a validator handle integer minimum and maximum values?
5. Explain the three BST deletion cases.
6. Why is an inorder successor a safe replacement for a two-child node?
7. How do you find the kth smallest value?
8. How does the BST property simplify lowest common ancestor?
9. How do rotations affect key order?
10. When should a plain BST be replaced by a self-balancing tree or ordered collection?

## Concise interview answers

- Every key in the complete left subtree is less than the node, and every key in the complete right subtree is greater, under a strict unique-key policy.
- Each comparison follows one root-to-leaf path, so lookup is O(h). A plain BST may be a chain, making h=O(n); only a balance guarantee gives O(log n).
- Inorder visits left, node, right; the BST invariant orders the left keys below the node and right keys above it.
- Propagate exclusive ancestor bounds. Use nullable bounds or a wider type; `int` sentinels reject legal endpoint keys.
- A leaf becomes null, a one-child node is replaced by its child, and a two-child node uses successor or predecessor then removes that replacement from its old position.
- The minimum key in the right subtree exceeds all left-side keys and is no greater than other right-side keys. It has no left child, so removing it reduces to an easy case.
- Visit in inorder, count from 1, and stop at k. For repeated dynamic rank queries, maintain subtree sizes.
- If both targets are smaller than the current key go left; if both larger go right; otherwise the current node is their split point or one target is the ancestor.
- A rotation changes local shape while preserving inorder key order.
- Use a balanced tree or library ordered collection when worst-case logarithmic mutation and ordered operations matter; plain BSTs do not self-balance.

## Deep follow-up answers

### Why do bounds validation and inorder validation both work?

Bounds validation directly checks the global invariant in one DFS. Inorder validation checks an equivalent consequence: values must be strictly increasing. Bounds are often easier to reason about when explaining ancestor violations; inorder is compact but must compare every adjacent visited value and define duplicate behavior consistently.

### What is the exact cost of a range query?

The cost is O(h + r) in a balanced/prunable analysis for h tree height and r reported nodes, because branches outside the interval are skipped. The worst case remains O(n), especially for an unbalanced tree or a range that includes nearly all keys. Outputting r keys itself costs Ω(r).

### Should two-child deletion copy a value or transplant a node?

Value copying is simple when callers observe only the resulting set of key-value data. If external references, payload identity, or stable node handles matter, moving the successor node preserves object identity more faithfully. The API contract determines the choice.

### What changes when duplicate keys are permitted?

The rule must be designed first: count duplicates at one node, consistently route them to one side, or compare a composite unique key. Validation intervals, successor behavior, deletion, and rotations must all follow the same rule. “Duplicates always go left” is not enough unless rebalancing preserves that relation.

### How does preorder construction use one pass?

The next unconsumed key is the root of the current range. Bounds determine whether it belongs in that subtree; if not, leave the cursor unchanged for an ancestor's later subtree. This consumes each key once. A monotonic stack offers an iterative O(n) alternative.

## Scenario questions

### A validator accepts root 10 with 12 somewhere in its left subtree

It probably compared only immediate edges. Propagate the root's upper bound 10 through the entire left subtree and reject any value at least 10.

### Searching sorted insertion data becomes slow

The tree has likely degenerated into a chain. The algorithm still obeys BST ordering but has O(n) height. Use a self-balancing implementation or a library ordered collection when worst-case guarantees are necessary.

### A rank query is called thousands of times between updates

Plain inorder traversal may repeatedly visit many nodes. Store subtree sizes and update them during every insertion/deletion, or use an ordered collection that exposes rank if available. The metadata's consistency becomes part of the invariant.

## Tradeoffs and alternatives

- A plain BST gives O(h) search, mutation, and extremum lookup; sorted traversal visits all n keys.
- A sorted array gives O(log n) static lookup and compact memory, but insertion/deletion shifts O(n) elements.
- A balanced BST adds maintenance work to guarantee O(log n) height.
- A hash set/map gives expected fast exact-key lookup but does not preserve sorted order or range navigation.
- A specialized structure may fit a different query model, but this module compares the BST only with its supplied alternatives.

## Common weak answers

- “Every node's children are ordered” without checking the full subtrees.
- “BST search is O(log n)” without a balancing condition.
- “Delete a node with two children by taking any child.” The replacement must preserve the entire order invariant.
- “The successor is a leaf.” It has no left child but may have a right child.
- “Rotations reorder the keys.” They preserve inorder order.
- “Use recursion” without considering a chain-shaped tree and stack depth.

## Self-check rubric

Rate each as **not yet**, **with a prompt**, or **independently**:

- I can state strict global ordering and define a duplicate policy.
- I can validate using inherited bounds without sentinel overflow.
- I can explain how search, insertion, and deletion update links and the root.
- I can derive the successor/predecessor deletion cases.
- I can use inorder for order statistics and reason about early stop.
- I can state O(height) costs and recognize when balancing is required.

Sources: [Competitive Programmer's Handbook, USACO Guide edition](https://usaco.guide/CPH.pdf), [Delete Node in a BST](https://leetcode.com/problems/delete-node-in-a-bst/), [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/).
