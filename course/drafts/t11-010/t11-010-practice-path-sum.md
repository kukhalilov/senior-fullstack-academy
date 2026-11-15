# binary trees, recursion, and traversal patterns — Problem: Path Sum

## Goals

- Carry a remaining target down one root-to-leaf path.
- Require the match to end at a leaf.
- Support negative node values without invalid pruning.

## Problem statement

Return true if there is a root-to-leaf path whose node values sum to targetSum. A leaf has no children.

## Input constraints

- 0 <= node count <= 5000.
- -1000 <= node value <= 1000.
- -1000 <= targetSum <= 1000.

## Examples with expected output

1. [5,4,8,11,null,13,4,7,2,null,null,null,1], target 22 -> true.
2. [1,2,3], target 5 -> false.
3. [], target 0 -> false.
4. [1,2], target 1 -> false because the matching prefix is not a leaf.

## Clarifying assumptions

- A path must begin at the root and end at a leaf; it cannot start or stop at arbitrary nodes.
- The empty tree contains no such path.
- Remaining sum is carried as long in the implementation to avoid overflow if constraints are later broadened.

## Progressive hints

1. Subtract the current value from the target before descending.
2. Check equality only when the current node is a leaf.
3. Recurse into either existing child with the updated remainder.
4. Do not prune based on sign; values can be negative.

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
    public static bool HasPathSum(TreeNode? root, int targetSum) =>
        Search(root, (long)targetSum);

    private static bool Search(TreeNode? node, long remaining)
    {
        if (node is null) return false;
        long afterCurrent = remaining - node.val;
        if (node.left is null && node.right is null) return afterCurrent == 0;
        return Search(node.left, afterCurrent) || Search(node.right, afterCurrent);
    }

    private static void Equal(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed: " + actual);
    }

    public static void Main()
    {
        var example = new TreeNode(5,
            new TreeNode(4, new TreeNode(11, new TreeNode(7), new TreeNode(2))),
            new TreeNode(8, new TreeNode(13), new TreeNode(4, null, new TreeNode(1))));
        Equal(HasPathSum(example, 22), true, "Example 1");
        Equal(HasPathSum(new TreeNode(1, new TreeNode(2), new TreeNode(3)), 5), false, "Example 2");
        Equal(HasPathSum(null, 0), false, "empty");
        Equal(HasPathSum(new TreeNode(1, new TreeNode(2)), 1), false, "must end at leaf");
        Equal(HasPathSum(new TreeNode(-2, null, new TreeNode(-3)), -5), true, "negative path");
        Console.WriteLine("All Path Sum checks passed.");
    }
}
```

## Correctness argument

Search returns false for null because no root-to-leaf path exists there. At a non-null node it subtracts that node's value from the remaining target. If the node is a leaf, the unique path reaching it has the target sum exactly when the remainder becomes zero. Otherwise any valid path must continue into a child, and the recursive disjunction checks both possible branches with the updated remainder. Induction over subtree height proves the result.

## Step-by-step dry run

For path 5->4->11->2 and target 22, remainders become 17, 13, 2, then 0 at leaf 2, so return true. If a remainder becomes zero at an internal node, the method still continues because that node does not complete a root-to-leaf path.

## Time complexity

O(n) worst case, with short-circuit return if a path succeeds early.

## Space complexity

O(h) recursion stack.

## Alternatives and tradeoffs

- An explicit stack can carry node/remainder pairs to avoid recursive call-stack use.
- A path list can reconstruct the actual matching path but requires O(h) additional state.

## Common mistakes and gotchas

- Accepting a matching sum at an internal node.
- Returning true for an empty tree when target is zero.
- Pruning when the remainder becomes negative; node values may be negative.
- Starting a new path at each node rather than requiring the root.

## Edge-case tests

- Empty tree and zero target.
- Single-node match and mismatch.
- Internal-node prefix that matches but is not a leaf.
- Negative node values.
- Multiple branches with only one valid leaf path.

## Reflection questions

1. Why is the leaf condition necessary?
2. Why subtract the current node before recursing?
3. Why is sign-based pruning invalid?
4. What would you change to return the actual path?

Source: [LeetCode: Path Sum](https://leetcode.com/problems/path-sum/).
