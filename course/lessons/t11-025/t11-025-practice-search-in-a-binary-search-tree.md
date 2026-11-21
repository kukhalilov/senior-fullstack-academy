# binary search tree ordering, lookup, and mutation — Problem: Search in a Binary Search Tree

## Goals
- Use the BST comparison rule to eliminate one subtree at each step.
- Return the matching node, preserving its entire subtree.
- Relate path length to tree height rather than assuming balance.

## Problem statement
Given a BST root and target value, return the node with that value as the root of the returned subtree. Return null when the value is absent.

## Input constraints
- `1 <= number of nodes <= 5,000`.
- `1 <= Node.val <= 10^7` and `1 <= val <= 10^7`.
- The input root is a BST.

## Examples with expected output
- `root=[4,2,7,1,3], val=2 -> subtree [2,1,3]`.
- `root=[4,2,7,1,3], val=5 -> null`.
- `root=[1], val=1 -> [1]`.

## Clarifying assumptions
- Values are unique under the BST ordering used here.
- Returning the existing node is important: do not create a copy or return only its value.
- Null root handling is included even though the stated input has at least one node.

## Progressive hints
1. Compare the target with the current value.
2. If the target is smaller, only the left subtree can contain it; if larger, only the right can.
3. Iterate until equality or a null link.

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
    static TreeNode? SearchBST(TreeNode? root, int target)
    {
        TreeNode? current = root;
        while (current is not null)
        {
            if (target == current.val) return current;
            current = target < current.val ? current.left : current.right;
        }
        return null;
    }

    static void Main()
    {
        var root = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7));
        TreeNode? found = SearchBST(root, 2);
        if (found?.val != 2 || found.left?.val != 1 || found.right?.val != 3)
            throw new InvalidOperationException("Must return the matching subtree root.");
        if (SearchBST(root, 5) is not null) throw new InvalidOperationException("Missing value must return null.");
        if (SearchBST(new TreeNode(1), 1)?.val != 1) throw new InvalidOperationException("Root lookup failed.");
        if (SearchBST(null, 1) is not null) throw new InvalidOperationException("Null tree must return null.");
        Console.WriteLine("BST search checks passed.");
    }
}
```

## Correctness argument
At each visited node, BST ordering ensures all keys in one subtree are on the same side of the current value. If target is smaller, the current node and right subtree cannot contain it; if larger, the current node and left subtree cannot. Equality returns the exact existing subtree root. Reaching null proves no remaining candidate exists.

## Step-by-step dry run
Search for 3 in the example: compare with 4 and go left; compare with 2 and go right; compare with 3 and return that node. No other subtree can contain a matching value because each was excluded by an earlier ordering comparison.

## Time complexity
O(h), where h is tree height; worst case O(n) for a skewed tree.

## Space complexity
O(1) auxiliary space in the iterative implementation.

## Alternatives and tradeoffs
- Recursive search mirrors the tree but uses O(h) call stack.
- A balanced BST gives O(log n) height; an ordinary BST does not promise that bound.
- Searching an unordered binary tree requires O(n) traversal in the worst case.

## Common mistakes and gotchas

- Recursing into both subtrees as if the input were an arbitrary binary tree.
- Returning `current.val` instead of the matching node/subtree.
- Continuing after equality and accidentally changing the returned subtree.
- Claiming O(log n) without a balance guarantee.

## Edge-case tests

- Target at the root, at a leaf, and absent between keys.
- Search through a chain-shaped BST.
- Null root in a generalized helper.

## Reflection questions

1. What property allows one subtree to be skipped?
2. Why does the API return a node rather than only the found value?
3. Which input shape produces O(n) lookup?

## Source
- [Search in a Binary Search Tree](https://leetcode.com/problems/search-in-a-binary-search-tree/)
