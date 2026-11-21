# binary search tree ordering, lookup, and mutation — Problem: Lowest Common Ancestor of a Binary Search Tree

## Goals
- Find the split point of two target values using BST order.
- Handle the case where one target is itself the ancestor.
- Return the existing ancestor node, not just its value.

## Problem statement
Given a BST and two distinct existing node references p and q, return their lowest common ancestor (LCA). A node counts as a descendant of itself, so one target can be the LCA.

## Input constraints
- `2 <= number of nodes <= 10^5`.
- `-10^9 <= Node.val <= 10^9`.
- Values are unique; `p != q`; both nodes exist in the tree.

## Examples with expected output
- `root=[6,2,8,0,4,7,9,null,null,3,5], p=2, q=8 -> 6`.
- Same tree, `p=2, q=4 -> 2`.
- `root=[2,1], p=2, q=1 -> 2`.

## Clarifying assumptions
- The input is a valid BST and both node references belong to it.
- Because values are unique, comparing `p.val` and `q.val` is sufficient to determine search directions.
- The node itself is included in its descendant relation for LCA.

## Progressive hints
1. If both target values are smaller than the current node, their LCA must be in the left subtree.
2. If both are larger, it must be in the right subtree.
3. Otherwise the current node is the split point, including equality with either target.

## Complete C# solution
```csharp dsa-solution
using System;

sealed class TreeNode
{
    public int val;
    public TreeNode? left, right;
    public TreeNode(int val, TreeNode? left = null, TreeNode? right = null)
    { this.val = val; this.left = left; this.right = right; }
}

static class Program
{
    static TreeNode LowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q)
    {
        int low = Math.Min(p.val, q.val);
        int high = Math.Max(p.val, q.val);
        TreeNode current = root;
        while (true)
        {
            if (high < current.val) current = current.left!;
            else if (low > current.val) current = current.right!;
            else return current;
        }
    }

    static void Check(int expected, TreeNode root, TreeNode p, TreeNode q)
    {
        TreeNode actual = LowestCommonAncestor(root, p, q);
        if (!ReferenceEquals(actual, Find(root, expected)))
            throw new InvalidOperationException($"Expected ancestor node {expected}, got {actual.val}.");
    }

    static TreeNode Find(TreeNode root, int value)
    {
        TreeNode? node = root;
        while (node is not null && node.val != value) node = value < node.val ? node.left : node.right;
        return node ?? throw new InvalidOperationException("Expected node missing from test tree.");
    }

    static void Main()
    {
        var root = new TreeNode(6,
            new TreeNode(2, new TreeNode(0), new TreeNode(4, new TreeNode(3), new TreeNode(5))),
            new TreeNode(8, new TreeNode(7), new TreeNode(9)));
        Check(6, root, Find(root, 2), Find(root, 8));
        Check(2, root, Find(root, 2), Find(root, 4));
        var small = new TreeNode(2, new TreeNode(1));
        Check(2, small, small, small.left!);
        Console.WriteLine("BST LCA checks passed.");
    }
}
```

## Correctness argument
If both values are smaller than the current key, both target paths must go left, so the LCA is also in that subtree. The symmetric argument applies when both are larger. Otherwise the current key lies between the target keys or equals one of them. The target paths then either split into different subtrees or one path starts at the current node, so this node is their lowest common ancestor.

## Step-by-step dry run
At root 6, p=2 and q=8 lie on opposite sides, so 6 is the split point and is returned. For p=2 and q=4, both are less than 6, so move left. At node 2, one target equals the current node and the other lies to its right; return 2.

## Time complexity
O(h), where h is BST height; worst case O(n).

## Space complexity
O(1) auxiliary space.

## Alternatives and tradeoffs
- Find each root-to-node path and return their last common node; this uses O(h) path storage and ignores the BST split shortcut.
- General binary-tree LCA needs recursive postorder or parent/depth information because values do not direct search.
- A balanced BST keeps this query O(log n), but balance is not guaranteed here.

## Common mistakes and gotchas

- Returning the first ancestor encountered in an arbitrary traversal rather than the lowest split point.
- Descending left when one target equals the current node; equality means the current node is itself the answer if the other target is below it.
- Assuming this BST method applies to a general binary tree.
- Comparing values when a different tree may contain duplicates and references, not keys, define node identity.

## Edge-case tests

- Targets lie in different root subtrees.
- One target is the LCA of the other.
- One target is the root.
- Both targets lie deep on the same side.

## Reflection questions

1. Why is the first node whose key is between the target values the lowest ancestor?
2. Why does a target equal to the current node stop the search?
3. What extra work is needed for an ordinary binary tree?

## Source
- [Lowest Common Ancestor of a Binary Search Tree](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/)
