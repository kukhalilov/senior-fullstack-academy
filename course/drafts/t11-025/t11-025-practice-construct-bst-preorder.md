# binary search tree ordering, lookup, and mutation — Problem: Construct Binary Search Tree from Preorder Traversal

## Goals
- Use the root-left-right order of preorder together with BST bounds.
- Consume each value once without repeatedly scanning for subtree boundaries.
- Distinguish an out-of-range next value from a value to consume.

## Problem statement
Given a preorder traversal of a BST with unique values, construct and return that BST. The input is guaranteed to describe a valid BST.

## Input constraints
- `1 <= preorder.Length <= 100`.
- `1 <= preorder[i] <= 1,000`.
- Values are unique and a valid BST exists.

## Examples with expected output
- `[8,5,1,7,10,12] -> [8,5,10,1,7,null,12]`.
- `[1,3] -> [1,null,3]`.
- `[5] -> [5]`.

## Clarifying assumptions
- Preorder visits root, left subtree, then right subtree.
- Values are distinct, so strict exclusive bounds apply.
- A node outside the current recursive interval belongs to a later subtree and must not advance the preorder cursor.

## Progressive hints
1. The next unused value is the root of the current subtree.
2. Maintain the exclusive range allowed by ancestor decisions.
3. Build left before right; if the next value falls outside the current range, return null without consuming it.

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
    static TreeNode BstFromPreorder(int[] preorder)
    {
        int index = 0;
        TreeNode? Build(long lowerExclusive, long upperExclusive)
        {
            if (index == preorder.Length) return null;
            int value = preorder[index];
            if (value <= lowerExclusive || value >= upperExclusive) return null;

            index++;
            var node = new TreeNode(value);
            node.left = Build(lowerExclusive, value);
            node.right = Build(value, upperExclusive);
            return node;
        }

        TreeNode? root = Build(long.MinValue, long.MaxValue);
        if (index != preorder.Length)
            throw new ArgumentException("The sequence is not a valid BST preorder traversal.", nameof(preorder));
        return root!;
    }

    static int[] Preorder(TreeNode? root)
    {
        var values = new List<int>();
        void Visit(TreeNode? node) { if (node is null) return; values.Add(node.val); Visit(node.left); Visit(node.right); }
        Visit(root);
        return values.ToArray();
    }

    static void Check(int[] expectedPreorder)
    {
        TreeNode root = BstFromPreorder(expectedPreorder);
        int[] actual = Preorder(root);
        if (!expectedPreorder.AsSpan().SequenceEqual(actual))
            throw new InvalidOperationException($"Expected preorder [{string.Join(',', expectedPreorder)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 8, 5, 1, 7, 10, 12 });
        Check(new[] { 1, 3 });
        Check(new[] { 5 });
        Check(new[] { 3, 2, 1, 4, 5 });
        Check(new[] { 8, 10, 9 });
        Console.WriteLine("Construct BST from preorder checks passed.");
    }
}
```

## Correctness argument
At each subtree call, the bounds encode all ancestor restrictions. In preorder, the first value that lies inside those bounds is the subtree root and is consumed once. Its left subtree can contain only values below it, and its right subtree only values above it. If the next value is outside a call's interval, it cannot belong to that subtree and is left for a later ancestor's right subtree. Since the sequence is guaranteed valid, the recursive calls consume every value and reconstruct exactly the BST whose preorder was supplied.

## Step-by-step dry run
For `[8,5,1,7,10,12]`, consume 8 as root. In the left range `(-∞,8)`, consume 5, then 1; the next 7 is above 5 and becomes its right child. Returning to root, 10 lies outside the left range but inside `(8,+∞)`, so it becomes the root's right child; 12 becomes its right child.

## Time complexity
O(n): each input value is consumed once and each recursive call either consumes one value or stops at the next out-of-range value.

## Space complexity
O(h) nodes of recursion depth plus the O(n) output tree; recursion depth is O(n) for a skewed preorder.

## Alternatives and tradeoffs
- A monotonic stack constructs the BST in O(n) and can be implemented iteratively, avoiding recursion depth. It pops ancestors while the next key belongs in a right subtree.
- Repeatedly partitioning the remaining sequence to find left/right ranges can cost O(n²) on skewed inputs.
- Bounds make ancestor restrictions explicit and generalize to validation and other constrained tree reconstructions.

## Common mistakes and gotchas

- Consuming a value even when it exceeds the current subtree's bound; it may belong to an ancestor's right subtree.
- Building the right subtree before the left, which violates preorder consumption order.
- Using inclusive bounds despite the distinct strict-key definition.
- Scanning the remaining array at every recursive call and reaching O(n²).
- Ignoring unconsumed values when generalizing beyond the guaranteed-valid input.

## Edge-case tests

- Single node and two-node left/right chains.
- Fully increasing and fully decreasing preorder sequences.
- A right subtree whose root appears after the entire left subtree.
- Values at both extremes if generalized to signed integer keys.

## Reflection questions

1. Why can a value outside the current bounds be left unconsumed?
2. Why must the left subtree be constructed before the right?
3. How does the monotonic-stack alternative avoid recursion?

## Source
- [Construct Binary Search Tree from Preorder Traversal](https://leetcode.com/problems/construct-binary-search-tree-from-preorder-traversal/)
