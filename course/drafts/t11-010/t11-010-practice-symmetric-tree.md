# binary trees, recursion, and traversal patterns — Problem: Symmetric Tree

## Goals

- Compare mirrored pairs of subtrees recursively and iteratively.
- Check both values and null-child structure.
- Preserve reference identity and avoid value-only shape assumptions.

## Problem statement

Determine whether a binary tree is a mirror of itself around its center.

## Input constraints

- 1 <= node count <= 1000.
- -100 <= node value <= 100.
- Duplicate values are allowed.
- The follow-up asks for both recursive and iterative solutions.

## Examples with expected output

1. [1,2,2,3,4,4,3] -> true.
2. [1,2,2,null,3,null,3] -> false.
3. [1,2,2,3,null,null,3] -> true.

## Clarifying assumptions

- Symmetry compares mirrored structure, not merely the multiset of values.
- A null root is symmetric as a generalization, although source constraints contain at least one node.
- Recursive depth is bounded by tree height; the iterative form avoids call-stack use.

## Progressive hints

1. Compare the root's left and right subtrees as mirror pairs.
2. Both null is equal; exactly one null is a mismatch.
3. Values must match.
4. Compare left-left with right-right and left-right with right-left.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

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
    public static bool IsSymmetric(TreeNode? root)
    {
        if (root is null) return true;
        return IsMirror(root.left, root.right);
    }

    private static bool IsMirror(TreeNode? a, TreeNode? b)
    {
        if (a is null || b is null) return a is null && b is null;
        return a.val == b.val &&
            IsMirror(a.left, b.right) &&
            IsMirror(a.right, b.left);
    }

    public static bool IsSymmetricIterative(TreeNode? root)
    {
        if (root is null) return true;
        var pairs = new Queue<(TreeNode? A, TreeNode? B)>();
        pairs.Enqueue((root.left, root.right));
        while (pairs.Count > 0)
        {
            (TreeNode? a, TreeNode? b) = pairs.Dequeue();
            if (a is null || b is null)
            {
                if (a is not null || b is not null) return false;
                continue;
            }
            if (a.val != b.val) return false;
            pairs.Enqueue((a.left, b.right));
            pairs.Enqueue((a.right, b.left));
        }
        return true;
    }

    private static void Equal(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        var symmetric = new TreeNode(1, new TreeNode(2, new TreeNode(3), new TreeNode(4)), new TreeNode(2, new TreeNode(4), new TreeNode(3)));
        var asymmetric = new TreeNode(1, new TreeNode(2, null, new TreeNode(3)), new TreeNode(2, null, new TreeNode(3)));
        Equal(IsSymmetric(symmetric), true, "Example 1 recursive");
        Equal(IsSymmetricIterative(symmetric), true, "Example 1 iterative");
        Equal(IsSymmetric(asymmetric), false, "Example 2 recursive");
        Equal(IsSymmetricIterative(asymmetric), false, "Example 2 iterative");
        Equal(IsSymmetric(new TreeNode(1, new TreeNode(2), new TreeNode(2))), true, "equal leaves");
        Equal(IsSymmetric(null), true, "empty generalization");
        Console.WriteLine("All Symmetric Tree checks passed.");
    }
}
```

## Correctness argument

Two subtrees are mirror images exactly when both roots are absent, or both exist with equal values and their outside children mirror each other while their inside children mirror each other. The recursive method implements this definition directly. In the iterative method, the queue stores precisely the pairs that must be mirror-equal. Each pair applies the same base and value rules, then enqueues the two mirrored child pairs. If no mismatch is found, every corresponding position has matching presence and value; therefore the tree is symmetric.

## Step-by-step dry run

For root 1 with children 2 and 2, compare the first pair. Enqueue outer pair left.left with right.right and inner pair left.right with right.left. Matching values and null patterns at both pairs establish symmetry.

## Time complexity

O(n), each mirrored node pair is checked once.

## Space complexity

Recursive version O(h) call stack; iterative version O(w) queued pairs in the worst case, both O(n) worst case.

## Alternatives and tradeoffs

- The recursive form mirrors the mathematical definition and is concise.
- The iterative queue makes stack behavior explicit; a stack could also process pairs depth-first.
- Serializing the tree and comparing with a reversed representation is less direct and can obscure structural pair correspondence.

## Common mistakes and gotchas

- Comparing left subtree to left subtree instead of across the center.
- Comparing values while ignoring null structure.
- Reversing only the values at a level; that does not prove mirrored subtree shape.
- Using node values as unique identifiers.

## Edge-case tests

- One-node tree.
- Equal children with mismatched descendant placement.
- Equal values but asymmetric null structure.
- Negative and duplicate values.
- Empty defensive case.

## Reflection questions

1. Which child pairs correspond under reflection?
2. Why is matching value alone insufficient?
3. How does the iterative queue represent the proof obligations?
4. Which version has better control over call-stack depth?

Source: [LeetCode: Symmetric Tree](https://leetcode.com/problems/symmetric-tree/).
