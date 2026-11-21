# binary trees, recursion, and traversal patterns — Problem: Invert Binary Tree

## Goals

- Swap left and right references at every node.
- Express a recursive subtree transformation.
- Preserve node values and node identities.

## Problem statement

Invert a binary tree by swapping the left and right child of every node, and return the resulting root.

## Input constraints

- 0 <= node count <= 100.
- -100 <= node value <= 100.
- Values may repeat.

## Examples with expected output

1. [4,2,7,1,3,6,9] -> [4,7,2,9,6,3,1].
2. [2,1,3] -> [2,3,1].
3. [] -> [].

## Clarifying assumptions

- The operation mutates links in place.
- Each node is visited exactly once.
- Re-inverting the resulting tree restores the original structure.

## Progressive hints

1. Invert each child subtree recursively.
2. Swap the child references at this node.
3. Return the same node as the root of its transformed subtree.
4. Null is already an inverted empty tree.

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
    public static TreeNode? InvertTree(TreeNode? root)
    {
        if (root is null) return null;
        (root.left, root.right) = (InvertTree(root.right), InvertTree(root.left));
        return root;
    }

    private static string Serialize(TreeNode? node)
    {
        if (node is null) return "#";
        return node.val + "," + Serialize(node.left) + "," + Serialize(node.right);
    }

    private static void Equal(string actual, string expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed");
    }

    public static void Main()
    {
        var tree = new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7, new TreeNode(6), new TreeNode(9)));
        string original = Serialize(tree);
        Equal(Serialize(InvertTree(tree)), "4,7,9,#,#,6,#,#,2,3,#,#,1,#,#", "Example 1 inverted");
        Equal(Serialize(InvertTree(tree)), original, "involution");
        Equal(Serialize(InvertTree(new TreeNode(2, new TreeNode(1), new TreeNode(3)))), "2,3,#,#,1,#,#", "Example 2");
        Equal(Serialize(InvertTree(null)), "#", "empty");
        Console.WriteLine("All Invert Binary Tree checks passed.");
    }
}
```

## Correctness argument

For a null subtree, returning null preserves the empty structure. For a non-null node, by induction the recursive calls invert each child subtree. Assigning the inverted original right subtree to left and inverted original left subtree to right mirrors the complete subtree rooted here. The node itself and its value are unchanged. Therefore the returned root represents the inversion of the whole input.

## Step-by-step dry run

At root 4, invert subtree 2 and subtree 7. Then set 4.left to the inverted 7 subtree and 4.right to the inverted 2 subtree. The same swap occurs at every descendant, giving children 7,2 and grandchildren 9,6,3,1.

## Time complexity

O(n), each node is visited once.

## Space complexity

O(h) recursive stack, worst-case O(n) for a skewed tree.

## Alternatives and tradeoffs

- BFS or iterative DFS can swap links without recursion; auxiliary memory is O(width) or O(height).
- A deep adversarial tree may make iterative transformation safer in a runtime with limited call-stack depth.
- The operation is an involution: applying it twice restores each original child relationship.

## Common mistakes and gotchas

- Swapping only the root's children.
- Recursing after overwriting a child reference without saving the original subtrees.
- Creating duplicate nodes when the task expects links to be mutated.
- Assuming duplicate values identify positions.

## Edge-case tests

- Empty tree and leaf.
- One-sided chain.
- Perfectly balanced tree.
- Duplicate values.
- Apply inversion twice and compare structure.

## Reflection questions

1. Why does the recurrence return the same node?
2. What must be preserved before swapping?
3. Why does applying inversion twice restore the original?
4. When might the iterative version be safer?

Source: [LeetCode: Invert Binary Tree](https://leetcode.com/problems/invert-binary-tree/).
