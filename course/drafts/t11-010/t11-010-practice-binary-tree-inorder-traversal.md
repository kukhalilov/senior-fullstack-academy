# binary trees, recursion, and traversal patterns — Problem: Binary Tree Inorder Traversal

## Goals

- Produce left-node-right order iteratively.
- Use an explicit stack to remember ancestors whose left side is finished.
- Avoid assuming the output is sorted without BST ordering.

## Problem statement

Return the values encountered by inorder traversal: recursively traverse left, visit the node, then traverse right. Implement the iterative form.

## Input constraints

- 0 <= node count <= 100.
- -100 <= node value <= 100.
- Duplicate values are allowed.

## Examples with expected output

1. [1,null,2,3] -> [1,3,2].
2. [1,2,3,4,5,null,8,null,null,6,7,9] -> [4,2,6,5,7,1,3,9,8].
3. [] -> [].
4. [1] -> [1].

## Clarifying assumptions

- The solution returns a new list of values and does not mutate the tree.
- The tree is not assumed to be a BST.
- The explicit stack holds ancestors awaiting their visit.

## Progressive hints

1. Walk left as far as possible, pushing each node.
2. Pop and visit the most recent ancestor.
3. Continue from its right child.
4. Finish when both current is null and the stack is empty.

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
    public static IList<int> InorderTraversal(TreeNode? root)
    {
        var values = new List<int>();
        var ancestors = new Stack<TreeNode>();
        TreeNode? current = root;
        while (current is not null || ancestors.Count > 0)
        {
            while (current is not null)
            {
                ancestors.Push(current);
                current = current.left;
            }
            current = ancestors.Pop();
            values.Add(current.val);
            current = current.right;
        }
        return values;
    }

    private static void Equal(IList<int> actual, int[] expected, string label)
    {
        if (actual.Count != expected.Length) throw new InvalidOperationException(label + " length");
        for (int i = 0; i < expected.Length; i++)
            if (actual[i] != expected[i]) throw new InvalidOperationException(label + " index " + i);
    }

    public static void Main()
    {
        Equal(InorderTraversal(new TreeNode(1, null, new TreeNode(2, new TreeNode(3)))), new[] { 1, 3, 2 }, "Example 1");
        Equal(InorderTraversal(new TreeNode(1, new TreeNode(2, new TreeNode(4), new TreeNode(5, new TreeNode(6), new TreeNode(7))), new TreeNode(3, null, new TreeNode(8, new TreeNode(9))))),
            new[] { 4, 2, 6, 5, 7, 1, 3, 9, 8 }, "Example 2");
        Equal(InorderTraversal(null), Array.Empty<int>(), "empty");
        Equal(InorderTraversal(new TreeNode(1)), new[] { 1 }, "single node");
        Console.WriteLine("All Inorder Traversal checks passed.");
    }
}
```

## Correctness argument

The stack contains exactly the ancestors whose left subtrees have been explored but whose own visit and right subtree remain. Descending left pushes each node before entering its left child. When no left child remains, the top node is the next inorder node; popping and emitting it is correct, after which its right subtree is processed using the same rule. The outer loop ends only when there is no current subtree and no deferred ancestor. Therefore every node is emitted once in left-node-right order.

## Step-by-step dry run

For root 1 with right child 2 whose left child is 3: push 1; its left child is null, so pop and emit 1. Move to 2, push it and then push its left child 3. Pop and emit 3, then pop and emit 2. The resulting order is 1,3,2.

## Time complexity

O(n), each node is pushed, popped, and emitted once.

## Space complexity

O(h) stack for tree height h, plus O(n) output.

## Alternatives and tradeoffs

- Recursive inorder is shorter and uses O(h) call stack.
- Morris traversal uses O(1) auxiliary space by temporarily threading links, but mutates pointers during traversal and is more error-prone.

## Common mistakes and gotchas

- Visiting a node before exhausting its left subtree.
- Forgetting to move to the popped node's right child.
- Stopping when current is null even though ancestors remain.
- Claiming inorder output is sorted for a non-BST.

## Edge-case tests

- Empty and singleton trees.
- Left-only and right-only chains.
- Duplicate node values.
- Non-BST shape where values do not sort.

## Reflection questions

1. What does each stack entry represent?
2. Why does the outer condition include both current and stack?
3. When does inorder produce sorted values?
4. What tradeoff does Morris traversal make?

Source: [LeetCode: Binary Tree Inorder Traversal](https://leetcode.com/problems/binary-tree-inorder-traversal/).
