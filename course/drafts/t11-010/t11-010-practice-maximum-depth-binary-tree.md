# binary trees, recursion, and traversal patterns — Problem: Maximum Depth of Binary Tree

## Goals

- Derive a recursive height recurrence.
- Use the source problem's node-count definition.
- Handle an empty tree with a precise base case.

## Problem statement

Return the maximum depth: the number of nodes along the longest root-to-leaf path.

## Input constraints

- 0 <= node count <= 10,000.
- -100 <= node value <= 100.
- Values need not be unique.

## Examples with expected output

1. [3,9,20,null,null,15,7] -> 3.
2. [1,null,2] -> 2.
3. [] -> 0.

## Clarifying assumptions

- Depth is measured in nodes, as specified by this problem.
- A null root has depth zero.
- Recursive stack use is O(height), which is O(n) for a skewed tree.

## Progressive hints

1. The longest path descends through one of the children.
2. Compute both child depths.
3. Add one for the current node.
4. Return zero for null.

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
    public static int MaxDepth(TreeNode? root)
    {
        if (root is null) return 0;
        int leftDepth = MaxDepth(root.left);
        int rightDepth = MaxDepth(root.right);
        return 1 + Math.Max(leftDepth, rightDepth);
    }

    private static void Equal(int actual, int expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        Equal(MaxDepth(new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)))), 3, "Example 1");
        Equal(MaxDepth(new TreeNode(1, null, new TreeNode(2))), 2, "skewed tree");
        Equal(MaxDepth(null), 0, "empty");
        Equal(MaxDepth(new TreeNode(5)), 1, "single node");
        Console.WriteLine("All Maximum Depth checks passed.");
    }
}
```

## Correctness argument

For a null subtree, there are zero nodes on any downward path, so returning zero is correct. For a non-null node, every root-to-leaf path consists of this node followed by a path in exactly one child subtree. By induction the recursive calls return the maximum node-count depths of those subtrees; taking their maximum and adding one yields the longest path through the current root. Thus the result is correct for every tree.

## Step-by-step dry run

At root 3, the left subtree rooted at 9 returns 1. The right subtree rooted at 20 returns 2 because each child returns 1. Root returns 1+max(1,2)=3.

## Time complexity

O(n), each node is visited once.

## Space complexity

O(h) recursion stack for height h; worst case O(n), balanced case O(log n).

## Alternatives and tradeoffs

- BFS can count levels iteratively and avoid recursive stack; queue space is O(width).
- An explicit DFS stack also avoids call-stack use but still requires O(h) auxiliary state.

## Common mistakes and gotchas

- Returning -1 for null while using a node-count recurrence.
- Returning edge height when the problem asks node count.
- Assuming the tree is balanced from its type.
- Using node values to infer structure.

## Edge-case tests

- Empty tree.
- Single node.
- Left-only and right-only chains.
- Complete tree.
- Duplicate values do not affect depth.

## Reflection questions

1. What does the function return for a null subtree?
2. Why add one to the larger child result?
3. How does a skewed tree affect recursion space?
4. How would the recurrence change if height counted edges?

Source: [LeetCode: Maximum Depth of Binary Tree](https://leetcode.com/problems/maximum-depth-of-binary-tree/).
