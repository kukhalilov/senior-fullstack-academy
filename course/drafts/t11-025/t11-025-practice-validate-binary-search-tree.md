# binary search tree ordering, lookup, and mutation — Problem: Validate Binary Search Tree

## Goals
- Check the ordering rule for entire subtrees, not only child edges.
- Carry strict lower and upper bounds from every ancestor.
- Avoid sentinel values that exclude legal integer keys.

## Problem statement
Given the root of a binary tree, return whether it is a valid strict BST: every key in a node's left subtree is smaller than the node's key, every key in its right subtree is larger, and both subtrees obey the same rule.

## Input constraints
- `1 <= number of nodes <= 10^4`.
- `-2^31 <= Node.val <= 2^31 - 1`.

## Examples with expected output
- `[2,1,3] -> true`.
- `[5,1,4,null,null,3,6] -> false`.
- `[int.MinValue] -> true`.

## Clarifying assumptions
- Duplicate values are invalid because the definition is strict.
- Null children are valid empty subtrees.
- Bounds are exclusive; a node must satisfy `lower < value < upper`.

## Progressive hints
1. Checking only a node against its children misses violations from more distant ancestors.
2. Each recursive call needs the smallest and largest permitted ancestor keys.
3. Use a wider bound type for `int` keys, or nullable bounds, so `int.MinValue` and `int.MaxValue` remain valid.

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
    static bool IsValidBST(TreeNode? root)
    {
        if (root is null) return true;
        var pending = new Stack<(TreeNode Node, long Lower, long Upper)>();
        pending.Push((root, long.MinValue, long.MaxValue));
        while (pending.Count > 0)
        {
            var (node, lower, upper) = pending.Pop();
            if (node.val <= lower || node.val >= upper) return false;
            if (node.left is not null) pending.Push((node.left, lower, node.val));
            if (node.right is not null) pending.Push((node.right, node.val, upper));
        }
        return true;
    }

    static void Check(bool expected, TreeNode? root)
    {
        bool actual = IsValidBST(root);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(true, new TreeNode(2, new TreeNode(1), new TreeNode(3)));
        Check(false, new TreeNode(5, new TreeNode(1), new TreeNode(4, new TreeNode(3), new TreeNode(6))));
        Check(false, new TreeNode(10, new TreeNode(5, null, new TreeNode(12)), new TreeNode(15)));
        Check(false, new TreeNode(2, new TreeNode(2), null));
        Check(true, new TreeNode(int.MinValue));
        Check(true, new TreeNode(int.MaxValue));
        Console.WriteLine("Validate BST checks passed.");
    }
}
```

## Correctness argument
Each stack entry carries the exclusive interval allowed by all ancestors. The current node is invalid if it lies on or beyond either bound. For a left child subtree, the current value becomes the new upper bound; for the right subtree, it becomes the new lower bound. Therefore every descendant is checked against every ancestor constraint. The explicit stack avoids relying on call-stack depth for a potentially skewed tree. The root begins with bounds wider than every `int`, preserving both endpoints.

## Step-by-step dry run
For root 10, left child 5, and 12 as 5's right child, the stack entry for 5 carries `(-∞,10)`. Its right subtree carries `(5,10)`. Since 12 is not below 10, validation returns false even though 12 is greater than its immediate parent 5.

## Time complexity
O(n), visiting each node at most once; short-circuiting may stop sooner on invalid input.

## Space complexity
O(h) explicit stack, where h is tree height; worst-case O(n).

## Alternatives and tradeoffs
- Iterative inorder traversal can require O(h) explicit stack and verifies that values are strictly increasing.
- Nullable `long?` bounds work without sentinels; a `long` interval is concise because keys are `int`.
- For `long` keys, use nullable bounds rather than `long.MinValue`/`MaxValue` sentinels.

## Common mistakes and gotchas

- Comparing each node only with its immediate children.
- Allowing equality in either subtree under a strict-key contract.
- Initializing bounds with `int.MinValue` and `int.MaxValue`, which would reject valid endpoint keys.
- Using `value-1` or `value+1` to create strict bounds, which can overflow.
- Treating an empty child as invalid.

## Edge-case tests

- A descendant violates a distant ancestor bound.
- Duplicate values.
- Single-node minimum and maximum integer keys.
- A valid left/right chain and a null subtree.

## Reflection questions

1. What information must flow from ancestors to a recursive call?
2. Why does immediate parent-child comparison fail?
3. Why are wider or nullable bounds safer than integer sentinels?

## Source
- [Validate Binary Search Tree](https://leetcode.com/problems/validate-binary-search-tree/)
