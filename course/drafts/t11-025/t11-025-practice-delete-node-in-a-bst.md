# binary search tree ordering, lookup, and mutation — Problem: Delete Node in a BST

## Goals
- Separate the search step from the structural deletion cases.
- Handle zero, one, or two children without breaking ordering.
- Return changed subtree roots so root deletion works.

## Problem statement
Given a BST root and key, delete the node with that key if it exists and return the possibly changed root. If the key is absent, return the original tree unchanged.

## Input constraints
- `0 <= number of nodes <= 10^4`.
- `-10^5 <= Node.val, key <= 10^5`.
- Node values are unique and the input is a valid BST.

## Examples with expected output
- `root=[5,3,6,2,4,null,7], key=3 -> [5,4,6,2,null,null,7]` (one valid result).
- `root=[5,3,6,2,4,null,7], key=0 -> original tree`.
- `root=[], key=0 -> []`.

## Clarifying assumptions
- Node values are unique.
- Either successor or predecessor replacement is valid for a two-child node.
- This solution copies the successor value into the target node. If external references to node identity must be preserved, physically transplant the successor instead.

## Progressive hints
1. Search down the BST and return the current root unchanged if the key lies in the other subtree.
2. A node with at most one child can be replaced directly by that child.
3. For two children, use the smallest key in the right subtree, then remove its old occurrence.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

sealed class TreeNode
{
    public int val;
    public TreeNode? left, right;
    public TreeNode(int val, TreeNode? left = null, TreeNode? right = null)
    { this.val = val; this.left = left; this.right = right; }
}

static class Program
{
    static TreeNode? DeleteNode(TreeNode? root, int key)
    {
        TreeNode? parent = null;
        TreeNode? current = root;
        while (current is not null && current.val != key)
        {
            parent = current;
            current = key < current.val ? current.left : current.right;
        }
        if (current is null) return root;

        if (current.left is not null && current.right is not null)
        {
            TreeNode successorParent = current;
            TreeNode successor = current.right;
            while (successor.left is not null)
            {
                successorParent = successor;
                successor = successor.left;
            }
            current.val = successor.val;
            if (successorParent == current) successorParent.right = successor.right;
            else successorParent.left = successor.right;
            return root;
        }

        TreeNode? replacement = current.left ?? current.right;
        if (parent is null) return replacement;
        if (ReferenceEquals(parent.left, current)) parent.left = replacement;
        else parent.right = replacement;
        return root;
    }

    static int[] Inorder(TreeNode? root)
    {
        var result = new List<int>();
        void Visit(TreeNode? node) { if (node is null) return; Visit(node.left); result.Add(node.val); Visit(node.right); }
        Visit(root);
        return result.ToArray();
    }

    static void Check(int[] expected, TreeNode? root, int key)
    {
        int[] actual = Inorder(DeleteNode(root, key));
        if (!expected.AsSpan().SequenceEqual(actual))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 2, 4, 5, 6, 7 }, new TreeNode(5, new TreeNode(3, new TreeNode(2), new TreeNode(4)), new TreeNode(6, null, new TreeNode(7))), 3);
        Check(new[] { 2, 3, 4, 5, 6, 7 }, new TreeNode(5, new TreeNode(3, new TreeNode(2), new TreeNode(4)), new TreeNode(6, null, new TreeNode(7))), 0);
        Check(Array.Empty<int>(), null, 0);
        Check(Array.Empty<int>(), new TreeNode(8), 8);
        Check(new[] { 9 }, new TreeNode(8, null, new TreeNode(9)), 8);
        Check(new[] { 2, 4 }, new TreeNode(3, new TreeNode(2), new TreeNode(4)), 3);
        Check(new[] { 3, 4 }, new TreeNode(4, new TreeNode(2, null, new TreeNode(3))), 2);
        Check(new[] { 5, 15, 17, 20, 25 }, new TreeNode(10, new TreeNode(5), new TreeNode(20, new TreeNode(15, null, new TreeNode(17)), new TreeNode(25))), 10);
        Console.WriteLine("BST deletion checks passed.");
    }
}
```

## Correctness argument
The search follows the BST comparison path without changing links. The structural update reconnects the replacement subtree at the parent link. When found, returning the only child preserves all keys because that child already lies within the deleted node's ancestor bounds. With two children, the right-subtree minimum is greater than every left-subtree key and no greater than any other right-subtree key. Replacing the value with it preserves order. Its old node has no left child, so unlinking it only requires reconnecting its possible right child.

## Step-by-step dry run
Delete 3 from `[5,3,6,2,4,null,7]`. Node 3 has two children. Its right-subtree minimum is 4. Copy 4 into that position, then delete the old leaf 4 from the left child. Inorder becomes `2,4,5,6,7`, which is sorted and contains every original key except 3.

## Time complexity
O(h) for search plus successor walk and removal, all bounded by a constant number of root-to-leaf paths; worst case O(n).

## Space complexity
O(1) auxiliary space; the implementation iteratively tracks only parent, current node, and the successor path.

## Alternatives and tradeoffs
- Use the inorder predecessor (maximum in left subtree) symmetrically.
- Transplant the successor node when callers retain object references and node identity is observable.
- Self-balancing trees must also update heights/colors and rotate after deletion; that behavior is outside this plain BST solution.

## Common mistakes and gotchas

- Handling two children by simply dropping one subtree.
- Failing to remove the successor's original node, leaving a duplicate key.
- Assuming successor has no right child; deletion must reconnect that possible child.
- Returning the old root after deleting a root with zero or one child.
- Copying a successor value when application-level node identity must remain attached to a key.

## Edge-case tests

- Missing key, empty tree, and deleting the only root.
- Leaf and one-child node.
- Two-child node whose successor is the direct right child.
- Two-child node whose successor is deeper and has a right child.

## Reflection questions

1. Why is the successor guaranteed to have no left child?
2. Why must deletion reconnect the replacement at the parent link or root reference?
3. What changes if node identity is part of the API contract?

## Source
- [Delete Node in a BST](https://leetcode.com/problems/delete-node-in-a-bst/)
