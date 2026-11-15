# binary search tree ordering, lookup, and mutation — Problem: Kth Smallest Element in a BST

## Goals
- Use inorder traversal to read BST values in sorted order.
- Stop once the 1-indexed kth visit is reached.
- Understand when subtree-size augmentation is worth maintaining.

## Problem statement
Given the root of a BST and integer k, return the kth smallest node value using 1-based rank.

## Input constraints
- `1 <= k <= n <= 10^4`.
- `0 <= Node.val <= 10^4`.

## Examples with expected output
- `root=[3,1,4,null,2], k=1 -> 1`.
- `root=[5,3,6,2,4,null,null,1], k=3 -> 3`.
- `root=[2,1,3], k=3 -> 3`.

## Clarifying assumptions
- k is valid and counts from 1, not 0.
- Values are distinct for this problem, but inorder rank traversal also works with duplicates if the BST's duplicate policy is consistent.
- Only one query is requested; no subtree-size metadata is needed.

## Progressive hints
1. Inorder traversal of a BST visits values in increasing order.
2. An explicit stack can perform inorder without traversing the whole tree first.
3. Count popped nodes and return immediately at count k.

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
    static int KthSmallest(TreeNode root, int k)
    {
        var stack = new Stack<TreeNode>();
        TreeNode? current = root;
        int visited = 0;
        while (current is not null || stack.Count > 0)
        {
            while (current is not null) { stack.Push(current); current = current.left; }
            current = stack.Pop();
            if (++visited == k) return current.val;
            current = current.right;
        }
        throw new ArgumentOutOfRangeException(nameof(k), "k must be a valid tree rank.");
    }

    static void Check(int expected, TreeNode root, int k)
    {
        int actual = KthSmallest(root, k);
        if (actual != expected) throw new InvalidOperationException($"Expected {expected}, got {actual}.");
    }

    static void Main()
    {
        Check(1, new TreeNode(3, new TreeNode(1, null, new TreeNode(2)), new TreeNode(4)), 1);
        Check(3, new TreeNode(5, new TreeNode(3, new TreeNode(2, new TreeNode(1)), new TreeNode(4)), new TreeNode(6)), 3);
        Check(3, new TreeNode(2, new TreeNode(1), new TreeNode(3)), 3);
        Console.WriteLine("Kth Smallest checks passed.");
    }
}
```

## Correctness argument
Inorder traversal of a valid BST visits keys in strictly increasing order. The stack version simulates the recursive order: it descends to the leftmost unvisited node, visits it, then explores its right subtree. Therefore the kth node popped is exactly the kth smallest. Returning at that visit is safe because earlier nodes are precisely the k-1 smaller nodes.

## Step-by-step dry run
For root 3 with left subtree `1 -> right 2` and right child 4, the stack visits 1, then 2, then 3, then 4. For k=3, return 3 and do not traverse the remainder.

## Time complexity
O(h+k) in the early-stop analysis: descend/ascend along paths and visit k nodes; worst-case O(n).

## Space complexity
O(h) for the explicit traversal stack; worst-case O(n).

## Alternatives and tradeoffs
- Recursive inorder is shorter but uses call stack O(h).
- Store subtree sizes and descend by left-subtree rank for O(h) per query. Mutations must update sizes correctly.
- Sorting all values costs O(n log n) time and O(n) storage, doing unnecessary work for small k.

## Common mistakes and gotchas

- Treating k as zero-indexed.
- Traversing preorder or level-order, which is not sorted order.
- Building a full sorted list when early stopping is available.
- Claiming O(log n) for an unbalanced tree without size augmentation or balancing.
- Forgetting that the follow-up about frequent updates changes the data-structure design.

## Edge-case tests

- k=1 (minimum) and k=n (maximum).
- A left-skewed or right-skewed tree.
- A k near the beginning, to verify early stop.

## Reflection questions

1. Why does inorder traversal sort BST values?
2. Which nodes remain on the stack when the kth item is returned?
3. What metadata enables rank selection without visiting k nodes?

## Source
- [Kth Smallest Element in a BST](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)
