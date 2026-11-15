# graph models, representations, and traversal — Problem: Clone Graph

## Goals

- Deep-copy a connected graph with cycles.
- Map original node references to exactly one cloned node each.
- Rebuild neighbor edges without confusing equal values with identity.

## Problem statement

Given a reference to a node in a connected undirected graph, return a deep copy of the graph. Each node has an integer value and a list of neighbor references.

## Input constraints

- 0 <= number of nodes <= 100.
- Node values are unique and within 1..100 in the source contract.
- The graph is connected from the given node, with no repeated edges or self-loops.
- The input may still contain cycles.

## Examples with expected output

1. Adjacency lists [[2,4],[1,3],[2,4],[1,3]] -> structurally identical copied graph.
2. One node with no neighbors -> one separate node with no neighbors.
3. Null start node -> null.

## Clarifying assumptions

- A clone is a distinct object; no cloned neighbor points back to an original node.
- Dictionary keys use node reference identity. The supplied Node type does not override equality.
- Breadth-first discovery creates each clone once, then copies all adjacency entries.

## Progressive hints

1. A graph can cycle, so naive recursive cloning may loop forever.
2. Maintain a map from each original reference to its clone.
3. Create a clone when first discovering a neighbor and enqueue that original.
4. For every original edge, append the corresponding cloned neighbor.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class Node
{
    public int val;
    public IList<Node> neighbors;
    public Node(int value = 0, IList<Node>? adjacent = null)
    {
        val = value;
        neighbors = adjacent ?? new List<Node>();
    }
}

public static class Program
{
    public static Node? CloneGraph(Node? node)
    {
        if (node is null) return null;
        var clones = new Dictionary<Node, Node>();
        var queue = new Queue<Node>();
        clones[node] = new Node(node.val);
        queue.Enqueue(node);

        while (queue.Count > 0)
        {
            Node original = queue.Dequeue();
            Node copy = clones[original];
            foreach (Node neighbor in original.neighbors)
            {
                if (!clones.TryGetValue(neighbor, out Node? neighborCopy))
                {
                    neighborCopy = new Node(neighbor.val);
                    clones.Add(neighbor, neighborCopy);
                    queue.Enqueue(neighbor);
                }
                copy.neighbors.Add(neighborCopy);
            }
        }
        return clones[node];
    }

    private static void Require(bool condition, string label)
    {
        if (!condition) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        var a = new Node(1); var b = new Node(2); var c = new Node(3);
        a.neighbors.Add(b); b.neighbors.Add(a);
        b.neighbors.Add(c); c.neighbors.Add(b);
        c.neighbors.Add(a); a.neighbors.Add(c);
        Node clone = CloneGraph(a)!;
        Require(!ReferenceEquals(clone, a), "root is distinct");
        Require(clone.val == 1 && clone.neighbors.Count == 2, "root data and degree");
        Node cloneB = (Node)clone.neighbors[0];
        Node cloneC = (Node)clone.neighbors[1];
        Require(!ReferenceEquals(cloneB, b) && !ReferenceEquals(cloneC, c), "neighbors are distinct");
        Require(cloneB.neighbors.Count == 2 && cloneC.neighbors.Count == 2, "cycle and adjacency copied");
        Require(ReferenceEquals(cloneB.neighbors[0], clone), "back edge targets clone root");
        Require(ReferenceEquals(cloneC.neighbors[1], clone), "other back edge targets clone root");

        Node isolated = new Node(7);
        Node isolatedCopy = CloneGraph(isolated)!;
        Require(!ReferenceEquals(isolated, isolatedCopy) && isolatedCopy.neighbors.Count == 0, "isolated node");
        Require(CloneGraph(null) is null, "null graph");
        Console.WriteLine("All Clone Graph checks passed.");
    }
}
```

## Correctness argument

The map invariant is that every discovered original node has exactly one distinct clone with the same value. On first seeing a neighbor, the algorithm creates and records its clone before enqueueing the original, so cycles cannot trigger duplicate clones. For each original adjacency entry, it appends the mapped clone to the current copy's neighbor list, preserving each edge and its order. Since the graph is connected, BFS eventually processes every node reachable from the given reference. The result has a one-to-one mapping of reachable originals to clones and no original references among copied edges.

## Step-by-step dry run

Start with original A mapped to A'. Process A's neighbors B,C: create B',C' and add them to A'. Process B: its edge back to A uses existing A'; its edge to C uses existing C'. Processing C similarly links back to A' and B'. The cycle is preserved without recursion looping.

## Time complexity

O(V+E), where each node is created once and each adjacency entry is copied once.

## Space complexity

O(V) map and queue, plus O(V+E) cloned graph output.

## Alternatives and tradeoffs

- DFS can perform the same map-based cloning recursively or with a stack; recursion depth can be O(V).
- Cloning by node value only works if values are guaranteed unique. Reference-keyed mapping expresses identity directly and remains robust if values repeat.

## Common mistakes and gotchas

- Cloning each neighbor without a map and looping forever on cycles.
- Using one clone per edge rather than per original node.
- Adding original neighbors to the clone's adjacency list.
- Keying by value when distinct nodes may share values.
- Forgetting to return the clone corresponding to the original entry node.

## Edge-case tests

- Null start.
- Single isolated node.
- Two nodes with reciprocal edge.
- Cycle and multiple paths to one node.
- Multiple nodes with equal values in a generalized implementation.

## Reflection questions

1. What invariant does the original-to-clone map establish?
2. Why record a clone before enqueueing its original?
3. Why does object identity matter when values repeat?
4. What part of the output accounts for E space?

Source: [LeetCode: Clone Graph](https://leetcode.com/problems/clone-graph/).
