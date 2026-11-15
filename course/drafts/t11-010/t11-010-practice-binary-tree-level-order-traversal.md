# binary trees, recursion, and traversal patterns — Problem: Binary Tree Level Order Traversal

## Goals

- Use a FIFO queue for breadth-first traversal.
- Group each level using a fixed queue-size snapshot.
- Handle empty trees without enqueuing null.

## Problem statement

Return values level by level, left to right, from the root down.

## Input constraints

- 0 <= node count <= 2000.
- -1000 <= node value <= 1000.
- Duplicate values may occur.

## Examples with expected output

1. [3,9,20,null,null,15,7] -> [[3],[9,20],[15,7]].
2. [1] -> [[1]].
3. [] -> [].

## Clarifying assumptions

- The tree is finite and acyclic.
- Children are enqueued left before right to preserve left-to-right order.
- The level size is captured before processing any node at that level.

## Progressive hints

1. Initialize a queue with the root if non-null.
2. At the start of a level, save the queue count.
3. Dequeue exactly that many nodes and enqueue their children.
4. Store the values collected during those removals as one result level.

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
    public static IList<IList<int>> LevelOrder(TreeNode? root)
    {
        var result = new List<IList<int>>();
        if (root is null) return result;
        var queue = new Queue<TreeNode>();
        queue.Enqueue(root);
        while (queue.Count > 0)
        {
            int levelSize = queue.Count;
            var level = new List<int>(levelSize);
            for (int i = 0; i < levelSize; i++)
            {
                TreeNode node = queue.Dequeue();
                level.Add(node.val);
                if (node.left is not null) queue.Enqueue(node.left);
                if (node.right is not null) queue.Enqueue(node.right);
            }
            result.Add(level);
        }
        return result;
    }

    private static void Equal(IList<IList<int>> actual, int[][] expected, string label)
    {
        if (actual.Count != expected.Length) throw new InvalidOperationException(label + " levels");
        for (int level = 0; level < expected.Length; level++)
        {
            if (actual[level].Count != expected[level].Length) throw new InvalidOperationException(label + " width");
            for (int i = 0; i < expected[level].Length; i++)
                if (actual[level][i] != expected[level][i]) throw new InvalidOperationException(label + " value");
        }
    }

    public static void Main()
    {
        Equal(LevelOrder(new TreeNode(3, new TreeNode(9), new TreeNode(20, new TreeNode(15), new TreeNode(7)))),
            new[] { new[] { 3 }, new[] { 9, 20 }, new[] { 15, 7 } }, "Example 1");
        Equal(LevelOrder(new TreeNode(1)), new[] { new[] { 1 } }, "singleton");
        Equal(LevelOrder(null), Array.Empty<int[]>(), "empty");
        Console.WriteLine("All Level Order checks passed.");
    }
}
```

## Correctness argument

FIFO order processes nodes in nondecreasing depth. At the beginning of an iteration, the queue contains exactly the nodes of the next unprocessed level in left-to-right order. Snapshotting its count ensures only these nodes are removed; their children are appended for the following level. Enqueuing left before right preserves order within that next level. Induction over levels proves the produced lists are exactly the requested traversal.

## Step-by-step dry run

Begin with [3] in the queue and snapshot one. Remove 3, output it, enqueue 9 and 20. Snapshot two; remove those, output [9,20], and enqueue 15 and 7. The final level is [15,7].

## Time complexity

O(n), each node is enqueued and dequeued once.

## Space complexity

O(n) output; queue peak is O(w), where w is maximum tree width.

## Alternatives and tradeoffs

- Recursive DFS can collect nodes into a list indexed by depth, but call stack is O(h) and output levels still require storage.
- A queue without a size snapshot gives flat BFS order but cannot separate levels in a single pass.

## Common mistakes and gotchas

- Using the queue's changing count as the loop boundary.
- Enqueuing null children and dereferencing them.
- Enqueuing right before left when left-to-right order is expected.
- Assuming BFS queue memory is O(height).

## Edge-case tests

- Empty tree.
- Single node.
- Missing left child with a right child.
- Wide complete level.
- Duplicate values in distinct positions.

## Reflection questions

1. Why is the queue-size snapshot essential?
2. What determines the order within each level?
3. What is the queue's peak-space bound?
4. Can two structurally different trees have the same level-order values if nulls are omitted?

Source: [LeetCode: Binary Tree Level Order Traversal](https://leetcode.com/problems/binary-tree-level-order-traversal/).
