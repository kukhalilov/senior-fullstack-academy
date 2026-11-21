# linked lists, pointer rewiring, reversal, and cycles — Problem: Copy List with Random Pointer

## Goals

- Deep-copy every node and preserve both next and random relationships.
- Use a reference-identity map to guarantee one clone per original node.
- Prove copied links point only to copied nodes.

## Problem statement

Each node has an integer value, a next reference, and a random reference that may point to any node in the list or null. Construct exactly one new node per original node, with the same values and corresponding next/random relationships. No copied link may point to an original node. Return the copied head.

## Input constraints

- 0 <= number of nodes <= 1,000.
- -10,000 <= node value <= 10,000.
- Each random reference is null or points to a node in this next-linked list.

## Examples with expected output

1. `[[7,null],[13,0],[11,4],[10,2],[1,0]]` -> a deep copy with the same value and random-index structure.
2. `[[1,1],[2,1]]` -> a copied two-node list where both random links point to the copied second node.
3. `[[3,null],[3,0],[3,null]]` -> preserve distinct nodes even though values repeat.
4. Empty head -> null.

## Clarifying assumptions

- The `next` chain is finite and acyclic; random links may point backward, forward, to self, or null.
- Node identity, not value, keys the mapping. The Node class below does not override equality, so the default class equality is reference identity. If a node type overrides equality by value, supply a reference-identity comparer instead.
- The clone has exactly the same number of nodes and is independent of later original-link changes.
- Input links are not modified by this two-pass mapping solution.

## Progressive hints

1. A random link may target a node whose clone has not yet been created.
2. First create all cloned nodes and map each original reference to its clone.
3. In a second pass, translate each original next/random target through the map.
4. Never assign an original target directly into a copied link.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class Node
{
    public int Val { get; set; }
    public Node? Next { get; set; }
    public Node? Random { get; set; }
    public Node(int val) { Val = val; }
}

public static class Program
{
    public static Node? CopyRandomList(Node? head)
    {
        if (head is null) return null;
        var clones = new Dictionary<Node, Node>();

        for (Node? current = head; current is not null; current = current.Next)
            clones.Add(current, new Node(current.Val));

        for (Node? current = head; current is not null; current = current.Next)
        {
            Node clone = clones[current];
            clone.Next = current.Next is null ? null : clones[current.Next];
            clone.Random = current.Random is null ? null : clones[current.Random];
        }
        return clones[head];
    }

    private static void AssertClone(Node? original, Node? copy, string label)
    {
        var originals = new List<Node>();
        var copies = new List<Node>();
        for (Node? node = original; node is not null; node = node.Next) originals.Add(node);
        for (Node? node = copy; node is not null; node = node.Next) copies.Add(node);
        if (originals.Count != copies.Count) throw new InvalidOperationException(label + " count failed.");

        var originalIndex = new Dictionary<Node, int>();
        for (int i = 0; i < originals.Count; i++) originalIndex.Add(originals[i], i);
        for (int i = 0; i < originals.Count; i++)
        {
            if (ReferenceEquals(originals[i], copies[i]) || originals[i].Val != copies[i].Val)
                throw new InvalidOperationException(label + " node copy failed.");
            int? nextIndex = originals[i].Next is null ? null : originalIndex[originals[i].Next!];
            int? randomIndex = originals[i].Random is null ? null : originalIndex[originals[i].Random!];
            if (!SameTarget(copies[i].Next, copies, nextIndex) || !SameTarget(copies[i].Random, copies, randomIndex))
                throw new InvalidOperationException(label + " links failed.");
        }
    }

    private static bool SameTarget(Node? actual, List<Node> copies, int? targetIndex) =>
        targetIndex is null ? actual is null : ReferenceEquals(actual, copies[targetIndex.Value]);

    private static Node? Build(int[] values, int?[] randomTargets)
    {
        var nodes = new Node[values.Length];
        for (int i = 0; i < values.Length; i++) nodes[i] = new Node(values[i]);
        for (int i = 0; i < nodes.Length; i++)
        {
            if (i + 1 < nodes.Length) nodes[i].Next = nodes[i + 1];
            if (randomTargets[i] is int target) nodes[i].Random = nodes[target];
        }
        return nodes.Length == 0 ? null : nodes[0];
    }

    public static void Main()
    {
        Node? first = Build(new[] { 7, 13, 11, 10, 1 }, new int?[] { null, 0, 4, 2, 0 });
        AssertClone(first, CopyRandomList(first), "Example 1");
        Node? second = Build(new[] { 1, 2 }, new int?[] { 1, 1 });
        AssertClone(second, CopyRandomList(second), "Example 2");
        Node? third = Build(new[] { 3, 3, 3 }, new int?[] { null, 0, null });
        AssertClone(third, CopyRandomList(third), "Repeated values");
        AssertClone(null, CopyRandomList(null), "Empty list");
        Console.WriteLine("All Copy List with Random Pointer checks passed.");
    }
}
```

## Correctness argument

The first pass creates exactly one fresh node for every original next-chain node and stores it by original reference identity. The second pass sets each clone's next and random links to the mapped clone of the corresponding original target, or null when the original link is null. The input constraint guarantees each non-null random target is in the map. Thus every output node is fresh, values match, links preserve the original graph structure, and no copied link reaches an original node. Returning the mapped original head completes the deep copy.

## Step-by-step dry run

For original A→B with A.random=B and B.random=B, pass one creates A′ and B′ and records both mappings. Pass two sets A′.Next=B′ and A′.Random=B′; B′.Next=null and B′.Random=B′. The copied graph has the same relationships but distinct node objects.

## Time complexity

O(n) expected, two traversals plus expected constant-time dictionary operations.

## Space complexity

O(n) for the mapping and copied nodes.

## Alternatives and tradeoffs

- Interleave each clone immediately after its original, set clone random via `original.Random.Next`, then separate the two chains. This uses O(1) auxiliary map space but temporarily mutates the original list and requires careful restoration.
- A dictionary is easier to reason about and preserves the input unchanged, at the cost of O(n) mapping storage.

## Common mistakes and gotchas

- Using node value as the map key; repeated values refer to distinct original nodes.
- Creating a new clone each time a random link reaches a target, resulting in multiple copies of one original.
- Copying Next but leaving Random links aimed at original nodes.
- Assuming random only points forward.
- Forgetting null random links.
- Using an equality comparer based on values rather than reference identity.
- Interleaving clones without restoring original Next links in the constant-extra-space alternative.

## Edge-case tests

- Empty list.
- One node with null random.
- One node with random pointing to itself.
- Random links backward and forward.
- Repeated node values.
- Confirm no copied reference is identical to any original node.

## Reflection questions

1. Why are two passes needed with the dictionary approach?
2. Why must dictionary keys use node identity?
3. What property ensures every random target has a map entry?
4. What invariant supports the interleaving alternative?

Source: [LeetCode: Copy List with Random Pointer](https://leetcode.com/problems/copy-list-with-random-pointer/).
