# binary search tree ordering, lookup, and mutation — Big-picture orientation and mental model

## Problem and purpose

A binary search tree (BST) is a binary tree organized by key order. It lets search, insertion, and deletion follow one path instead of scanning every node—provided the tree stays reasonably short. The ordering rule is global: every key in a node's left subtree is smaller than that node, and every key in its right subtree is larger. The lessons use distinct keys and a strict duplicate policy unless a variant says otherwise.

## Plain-language mental model

At each node, the key acts like a decision point. If the target is smaller, every key in the right subtree is ruled out; if larger, every key in the left subtree is ruled out. This resembles binary search, but the path length depends on the tree's height. A plain BST can be a chain, so its operations are O(height), not automatically O(log n).

## How the parts fit together

| Need | BST property or operation |
| --- | --- |
| Check the whole ordering | Validate with bounds inherited from ancestors |
| Find a key | Compare and follow one child link |
| Add a unique key | Attach a new leaf at the missing search link |
| Remove a key | Handle leaf, one-child, and two-child cases |
| Read values in order | Inorder traversal |
| Find the kth smallest | Stop at the kth inorder visit |
| Find a lowest common ancestor | Follow the ordered split point |
| Build from preorder | Consume values while enforcing inherited bounds |

## Concept map

Subtree bounds express the invariant more accurately than parent-child checks. Search, insertion, and deletion all depend on the same comparison rule. Inorder traversal connects the tree to sorted order. Height determines operation costs, and balancing algorithms exist to keep height logarithmic; this module explains their purpose but does not implement AVL or red-black maintenance.

## End-to-end walkthrough

Insert `8, 3, 10, 1, 6`. The first value becomes root. 3 goes left of 8, 10 right, 1 left of 3, and 6 right of 3. Searching for 6 compares against 8, then 3, then finds 6. Inorder visits `1,3,6,8,10`, confirming sorted order. If deleting 3, its inorder successor is 6; replacing 3 with 6 and removing the old 6 leaf preserves all bounds.

## When to use it and tradeoffs

Use a BST when ordered lookup, predecessor/successor, range traversal, and updates belong together. A sorted array is compact and excellent for static data, but insertion shifts items. A plain BST is simple but can degrade to O(n); use a self-balancing tree or a library ordered collection when worst-case logarithmic updates are required.

## What later lessons cover

Four references cover ordering/search, mutation and rank queries, height and balancing boundaries, and correctness/representation details. Seven problems practice validation, search, insertion, deletion, kth-smallest, BST LCA, and construction from preorder. General tree traversals and self-balancing implementations are scoped elsewhere or excluded.

Sources: [Competitive Programmer's Handbook, USACO Guide edition](https://usaco.guide/CPH.pdf), [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/).
