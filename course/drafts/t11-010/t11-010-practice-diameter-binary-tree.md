# binary trees, recursion, and traversal patterns — Problem: Diameter of Binary Tree

## Goals

- Compute the longest path between any two nodes.
- Count path length in edges.
- Combine child heights in one postorder traversal.

## Problem statement

Return the diameter: the number of edges in the longest path between any two nodes. The path need not pass through the root.

## Input constraints

- 1 <= node count <= 10,000.
- -100 <= node value <= 100.
- The tree is a binary tree; values may repeat.

## Examples with expected output

1. [1,2,3,4,5] -> 3.
2. [1,2] -> 1.
3. A single node -> 0.

## Clarifying assumptions

- Recursive height uses node count with null height 0.
- The path through a node has leftHeight + rightHeight edges.
- The best path may be entirely inside a child, so retain a global maximum.

## Progressive hints

1. A longest path has its highest node where its two branches meet.
2. At that node, add left and right child heights.
3. Return one plus the larger child height to the parent.
4. Update the best answer at every node.

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
    public static int DiameterOfBinaryTree(TreeNode? root)
    {
        int bestEdges = 0;
        Height(root, ref bestEdges);
        return bestEdges;
    }

    private static int Height(TreeNode? node, ref int bestEdges)
    {
        if (node is null) return 0;
        int leftHeight = Height(node.left, ref bestEdges);
        int rightHeight = Height(node.right, ref bestEdges);
        bestEdges = Math.Max(bestEdges, leftHeight + rightHeight);
        return 1 + Math.Max(leftHeight, rightHeight);
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(DiameterOfBinaryTree(new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5)), new TreeNode(3))), 3, "Example 1");
        Equal(DiameterOfBinaryTree(new TreeNode(1, new TreeNode(2))), 1, "Example 2");
        Equal(DiameterOfBinaryTree(new TreeNode(1)), 0, "single node");
        Equal(DiameterOfBinaryTree(null), 0, "empty generalization");
        Console.WriteLine("All Diameter checks passed.");
    }
}
```

## Correctness argument

For every node, Height returns the maximum number of nodes on a downward path beginning at that node: null returns 0, and a node adds one to the larger child height. Any simple path in a tree has a unique highest node relative to the root. Its branches descend into that node's left and right subtrees; the longest path through it uses the maximum downward branch in each, giving leftHeight + rightHeight edges. Updating the maximum at every node considers the highest node of every possible diameter. Therefore the final maximum is the tree diameter in edges.

## Step-by-step dry run

At node 2, each child 4 and 5 has height 1, so the through path is 2 edges. Node 2 returns height 2. At root 1, left height is 2 and right height is 1, so the through path has 3 edges, the maximum.

## Time complexity

O(n), each node's height is computed once.

## Space complexity

O(h) recursive stack, worst-case O(n).

## Alternatives and tradeoffs

- An iterative postorder traversal can avoid call-stack use but must store traversal state and child results.
- Recomputing depth for every candidate node is simpler to sketch but can cost O(n²).

## Common mistakes and gotchas

- Returning height in nodes as the diameter answer in edges.
- Restricting the path to one through the root.
- Computing only one subtree height before updating.
- Re-running a full height traversal at each node.
- Forgetting the one-node diameter is zero edges.

## Edge-case tests

- Single node.
- Left and right branches of different lengths.
- Skewed tree where diameter is height minus one.
- Diameter located wholly inside a subtree.

## Reflection questions

1. Why does height return nodes while diameter counts edges?
2. Why update the maximum at each node?
3. What is the diameter for one node?
4. What complexity does repeated height computation risk?

Source: [LeetCode: Diameter of Binary Tree](https://leetcode.com/problems/diameter-of-binary-tree/).
