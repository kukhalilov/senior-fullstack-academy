# linked lists, pointer rewiring, reversal, and cycles — Problem: Remove Nth Node From End of List

## Goals

- Remove a node counted from the tail in one traversal.
- Use a dummy head so deleting the real head is handled uniformly.
- Maintain a fixed n-node gap between lead and follow pointers.

## Problem statement

Given the head of a singly linked list and n, remove the nth node from the end and return the new head.

## Input constraints

- 1 <= number of nodes <= 30.
- 1 <= n <= number of nodes.
- 0 <= node value <= 100.
- The list is acyclic.

## Examples with expected output

1. head = [1,2,3,4,5], n = 2 -> [1,2,3,5].
2. head = [1], n = 1 -> [].
3. head = [1,2], n = 1 -> [1].
4. head = [1,2], n = 2 -> [2].

## Clarifying assumptions

- n is valid and no larger than list length.
- The method removes the node by changing links; it does not copy values over it.
- The list is finite and acyclic.
- The returned head may differ from the input head.

## Progressive hints

1. Add a dummy node before head so the original head has a predecessor.
2. Advance lead n links from the dummy.
3. Move lead and follow together until lead is at the final node.
4. Then follow.Next is the node to remove; bypass it and return dummy.Next.

## Complete C# solution

```csharp dsa-solution
using System;
using System.Collections.Generic;

public sealed class ListNode
{
    public int Val { get; set; }
    public ListNode? Next { get; set; }
    public ListNode(int val = 0, ListNode? next = null) { Val = val; Next = next; }
}

public static class Program
{
    public static ListNode? RemoveNthFromEnd(ListNode? head, int n)
    {
        if (n <= 0) throw new ArgumentOutOfRangeException(nameof(n));
        var dummy = new ListNode(0, head);
        ListNode? lead = dummy;
        ListNode? follow = dummy;

        for (int step = 0; step < n; step++)
        {
            lead = lead.Next;
            if (lead is null) throw new ArgumentOutOfRangeException(nameof(n));
        }

        while (lead.Next is not null)
        {
            lead = lead.Next;
            follow = follow!.Next;
        }

        follow!.Next = follow.Next!.Next;
        return dummy.Next;
    }

    private static ListNode? Build(params int[] values)
    {
        var dummy = new ListNode();
        ListNode tail = dummy;
        foreach (int value in values) { tail.Next = new ListNode(value); tail = tail.Next; }
        return dummy.Next;
    }

    private static int[] Values(ListNode? head)
    {
        var values = new List<int>();
        for (ListNode? node = head; node is not null; node = node.Next) values.Add(node.Val);
        return values.ToArray();
    }

    private static void AssertSequence(int[] actual, int[] expected, string label)
    {
        if (actual.Length != expected.Length) throw new InvalidOperationException(label + " length failed.");
        for (int i = 0; i < expected.Length; i++)
            if (actual[i] != expected[i]) throw new InvalidOperationException(label + " value failed.");
    }

    public static void Main()
    {
        AssertSequence(Values(RemoveNthFromEnd(Build(1, 2, 3, 4, 5), 2)), new[] { 1, 2, 3, 5 }, "Example 1");
        AssertSequence(Values(RemoveNthFromEnd(Build(1), 1)), Array.Empty<int>(), "Example 2");
        AssertSequence(Values(RemoveNthFromEnd(Build(1, 2), 1)), new[] { 1 }, "Example 3");
        AssertSequence(Values(RemoveNthFromEnd(Build(1, 2), 2)), new[] { 2 }, "Remove head");
        Console.WriteLine("All Remove Nth Node From End checks passed.");
    }
}
```

## Correctness argument

The dummy predecessor makes the target's predecessor available even when the target is the original head. After advancing lead n links, lead is n links ahead of follow. Moving them together preserves this gap. When lead reaches the final node, follow is immediately before the nth node from the end. Bypassing `follow.Next` removes exactly that node. The gap invariant and valid-n constraint ensure the target exists; returning dummy.Next handles head removal.

## Step-by-step dry run

For `1→2→3→4→5`, n=2, start both at dummy. Advance lead twice to node 2. Move both until lead reaches node 5; follow is node 3. Set node 3.Next to node 5.Next, bypassing node 4. Return dummy.Next: `1→2→3→5`.

## Time complexity

O(n), one traversal with at most two pointer passes across the list.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- Count the full length, compute the target index from the front, then traverse again. This is also O(n) time and O(1) space but uses two passes.
- A stack can identify nodes from the end but uses O(n) storage.

## Common mistakes and gotchas

- Starting both pointers at head and mishandling deletion of the head.
- Advancing lead n+1 or n-1 steps relative to the chosen starting node.
- Returning the removed head instead of dummy.Next.
- Dereferencing follow.Next before proving it exists; valid n and maintained gap ensure it here.
- Confusing nth from end with zero-based index from front.

## Edge-case tests

- Remove the only node.
- Remove the first node by setting n to list length.
- Remove the tail with n=1.
- Remove a middle node.
- Invalid n is rejected defensively.

## Reflection questions

1. Why begin follow at the dummy instead of head?
2. What distance separates lead and follow after the initial advance?
3. Why does follow end at the predecessor of the target?
4. How does the two-pass length method compare?

Source: [LeetCode: Remove Nth Node From End of List](https://leetcode.com/problems/remove-nth-node-from-end-of-list/).
