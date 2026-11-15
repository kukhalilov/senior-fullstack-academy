# binary search tree ordering, lookup, and mutation — Problem: Insert into a Binary Search Tree

## Goals
- Follow one search path to find the only safe insertion link.
- Return an updated root so insertion at an empty tree is handled.
- Preserve every existing node and the strict ordering invariant.

## Problem statement
Insert a value that is guaranteed not to exist in the original BST. Return the root of any tree that contains the new value and remains a valid BST.

## Input constraints
- `0 <= number of nodes <= 10^4`.
- `-10^8 <= Node.val, val <= 10^8`.
- Existing values are unique and `val` is absent.

## Examples with expected output
- `root=[4,2,7,1,3], val=5 -> [4,2,7,1,3,5]`.
- `root=[], val=5 -> [5]`.
- `root=[4], val=2 -> [4,2]`.

## Clarifying assumptions
- The new key is unique, so duplicate insertion behavior is outside this problem.
- Any valid resulting shape is accepted; ordinary leaf insertion is sufficient.
- The method returns the potentially changed root reference.

## Progressive hints
1. Search as if looking for `val`.
2. Since it is absent, the search ends at a null child link.
3. Create a leaf there and reconnect it while returning each updated subtree root.

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
    static TreeNode InsertIntoBST(TreeNode? root, int value)
    {
        if (root is null) return new TreeNode(value);
        TreeNode current = root;
        while (true)
        {
            if (value < current.val)
            {
                if (current.left is null) { current.left = new TreeNode(value); break; }
                current = current.left;
            }
            else if (value > current.val)
            {
                if (current.right is null) { current.right = new TreeNode(value); break; }
                current = current.right;
            }
            else throw new ArgumentException("The input contract requires a new unique value.", nameof(value));
        }
        return root;
    }

    static void Inorder(TreeNode? node, System.Collections.Generic.List<int> output)
    {
        if (node is null) return;
        Inorder(node.left, output); output.Add(node.val); Inorder(node.right, output);
    }

    static void Check(int[] expected, TreeNode? root, int value)
    {
        var inserted = InsertIntoBST(root, value);
        var values = new System.Collections.Generic.List<int>();
        Inorder(inserted, values);
        if (!expected.AsSpan().SequenceEqual(values.ToArray()))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', values)}].");
    }

    static void Main()
    {
        Check(new[] { 1, 2, 3, 4, 5, 7 }, new TreeNode(4, new TreeNode(2, new TreeNode(1), new TreeNode(3)), new TreeNode(7)), 5);
        Check(new[] { 5 }, null, 5);
        Check(new[] { 2, 4 }, new TreeNode(4), 2);
        Check(new[] { -10, 0 }, new TreeNode(-10), 0);
        Console.WriteLine("BST insertion checks passed.");
    }
}
```

## Correctness argument
At every node, the comparison chooses the only subtree where the absent value can belong. The search stops at a null link whose ancestor comparisons establish a lower and upper bound containing the value. Attaching a leaf there preserves all ancestor bounds and leaves all existing subtrees unchanged. Returning the root also handles the initially empty tree.

## Step-by-step dry run
Insert 5 into root 4 with right child 7. Since 5>4, move right; since 5<7 and 7's left link is empty, attach 5 there. Its ancestors require `5>4` and `5<7`, so the invariant remains true.

## Time complexity
O(h), where h is the original height; worst case O(n).

## Space complexity
O(1) auxiliary space; one node is allocated.

## Alternatives and tradeoffs
- Recursive insertion returns a new subtree root from each call and is concise, but uses O(h) stack.
- Rebalancing after insertion is not part of a plain BST; a self-balancing tree needs additional rules.
- A sorted array supports binary search but insertion requires shifting O(n) values.

## Common mistakes and gotchas

- Forgetting to assign the result to `root.left` or `root.right` in recursive code.
- Not returning a new root when the input is null.
- Creating a duplicate even though the prompt guarantees absence.
- Rebuilding the entire tree unnecessarily.
- Claiming insertion is logarithmic for every plain BST.

## Edge-case tests

- Empty tree.
- Insert smaller and larger than the root.
- Insert between existing keys at a missing link.
- Long skewed tree.

## Reflection questions

1. Why is the first null search link a valid insertion location?
2. Which ancestor bounds does the new leaf need to satisfy?
3. Why is root reassignment essential for an empty input tree?

## Source
- [Insert into a Binary Search Tree](https://leetcode.com/problems/insert-into-a-binary-search-tree/)
