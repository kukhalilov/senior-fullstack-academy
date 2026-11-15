# binary trees, recursion, and traversal patterns — Problem: Balanced Binary Tree

## Goals

- Check height balance in one postorder traversal.
- Propagate failure immediately rather than recomputing heights.
- Treat an empty tree as balanced.

## Problem statement

A binary tree is height-balanced if, at every node, the heights of its two child subtrees differ by at most one. Return whether the tree is height-balanced.

## Input constraints

- 0 <= node count <= 5000.
- -10,000 <= node value <= 10,000.
- Balance is required at every node, not just the root.

## Examples with expected output

1. [3,9,20,null,null,15,7] -> true.
2. [1,2,2,3,3,null,null,4,4] -> false.
3. [] -> true.

## Clarifying assumptions

- Height counts nodes and null height is zero; height differences are unchanged by consistently using edge counts.
- The helper returns -1 as an impossible height to signal an unbalanced subtree.
- The tree is not modified.

## Progressive hints

1. A top-down check that recomputes height at every node may be quadratic.
2. Get child heights once in postorder.
3. If a child already returned failure, propagate it.
4. Otherwise compare the child-height difference and return this node's height.

## Complete C# solution

```csharp dsa-solution
using System;

public sealed class TreeNode
{
    public int val;
    public TreeNode? left;
    public TreeNode? right;
    public TreeNode(int value = 0, TreeNode? leftNode = null, TreeNode? rightNode = null)
    { val = value; left = leftNode; right = rightNode; }
}

public static class Program
{
    public static bool IsBalanced(TreeNode? root) => HeightOrFailure(root) >= 0;

    private static int HeightOrFailure(TreeNode? node)
    {
        if (node is null) return 0;
        int left = HeightOrFailure(node.left);
        if (left < 0) return -1;
        int right = HeightOrFailure(node.right);
        if (right < 0 || Math.Abs(left - right) > 1) return -1;
        return 1 + Math.Max(left, right);
    }

    private static void Equal(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(IsBalanced(new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)))), true, "Example 1");
        Equal(IsBalanced(new TreeNode(1, new TreeNode(2, new TreeNode(3, new TreeNode(4), new TreeNode(4)), new TreeNode(3)), new TreeNode(2))), false, "deep imbalance");
        Equal(IsBalanced(null), true, "empty");
        Equal(IsBalanced(new TreeNode(1, new TreeNode(2), null)), true, "height difference one");
        Console.WriteLine("All Balanced Tree checks passed.");
    }
}
```

## Correctness argument

The helper returns the exact node-count height when a subtree is balanced and -1 otherwise. This is true for null. For a node, the recursive results are checked first; if either child is unbalanced, the whole subtree is unbalanced. If both are balanced, their heights are known exactly, so a difference greater than one correctly signals failure. Otherwise one plus their maximum is the node's height and the subtree meets the balance definition. The root result is nonnegative exactly when the whole tree is balanced.

## Step-by-step dry run

For root 3 with children 9 and 20, null children return 0. Node 9 returns height 1. Node 20's children return 1, so it returns 2. At root, the difference is 1, within the allowed bound; return height 3 and report balanced.

## Time complexity

O(n), each visited node is processed once; traversal can stop after detecting an unbalanced child.

## Space complexity

O(h) recursion stack, worst-case O(n).

## Alternatives and tradeoffs

- A separate height function called at each node is easier to understand but can be O(n²) on a skewed tree.
- An iterative postorder can avoid call-stack limits but requires explicit state for return values.

## Common mistakes and gotchas

- Checking only the root's immediate child heights.
- Recomputing heights for every node.
- Treating null as unbalanced.
- Returning a valid height after a child already failed.
- Using an ambiguous sentinel that could be a real height; -1 is impossible here.

## Edge-case tests

- Empty and singleton trees.
- A root with one child, difference exactly one.
- Deep imbalance below a locally balanced root.
- Skewed chain of length three and four.

## Reflection questions

1. What does the helper's -1 mean?
2. Why is postorder required?
3. Why can repeated height scans be quadratic?
4. Can a tree's root look balanced while a descendant is not?

Source: [LeetCode: Balanced Binary Tree](https://leetcode.com/problems/balanced-binary-tree/).
