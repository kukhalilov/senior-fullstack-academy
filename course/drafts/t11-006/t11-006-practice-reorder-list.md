# linked lists, pointer rewiring, reversal, and cycles — Problem: Reorder List

## Goals

- Reorder existing nodes into alternating front/back order without changing values.
- Combine middle search, second-half reversal, and alternating merge.
- Avoid losing either half while rewiring.

## Problem statement

Given a singly linked list `L0 → L1 → … → Ln`, reorder it as `L0 → Ln → L1 → Ln-1 → L2 → Ln-2 → …`. Do not modify node values; change only links.

## Input constraints

- 1 <= number of nodes <= 50,000.
- 1 <= node value <= 1,000.
- The input is a finite acyclic list.

## Examples with expected output

1. head = [1,2,3,4] -> [1,4,2,3].
2. head = [1,2,3,4,5] -> [1,5,2,4,3].
3. head = [1] -> [1].
4. head = [1,2] -> [1,2].

## Clarifying assumptions

- Reuse each original node exactly once; do not allocate replacement list nodes.
- Values remain attached to their node and are not rewritten.
- For odd length, the middle node remains at the end of the first half and appears once.
- The method mutates in place and returns no head because the first node remains the head.

## Progressive hints

1. Split near the middle so the first half has the same size as or one more node than the second.
2. Reverse the second half.
3. Weave one node from each half, saving both next references before reconnecting.
4. Terminate the final link explicitly to avoid retaining a cycle from the old chain.

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
    private static ListNode? Reverse(ListNode? head)
    {
        ListNode? previous = null;
        ListNode? current = head;
        while (current is not null)
        {
            ListNode? next = current.Next;
            current.Next = previous;
            previous = current;
            current = next;
        }
        return previous;
    }

    public static void ReorderList(ListNode? head)
    {
        if (head?.Next is null) return;

        ListNode firstEnd = head;
        ListNode? fast = head;
        while (fast?.Next?.Next is not null)
        {
            firstEnd = firstEnd.Next!;
            fast = fast.Next.Next;
        }

        ListNode? second = firstEnd.Next;
        firstEnd.Next = null;
        second = Reverse(second);
        ListNode? first = head;

        while (second is not null)
        {
            ListNode? firstNext = first!.Next;
            ListNode? secondNext = second.Next;
            first.Next = second;
            second.Next = firstNext;
            first = firstNext;
            second = secondNext;
        }
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
        var seen = new HashSet<ListNode>();
        for (ListNode? node = head; node is not null; node = node.Next)
        {
            if (!seen.Add(node)) throw new InvalidOperationException("Unexpected cycle.");
            values.Add(node.Val);
        }
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
        ListNode? even = Build(1, 2, 3, 4);
        ReorderList(even);
        AssertSequence(Values(even), new[] { 1, 4, 2, 3 }, "Example 1");
        ListNode? odd = Build(1, 2, 3, 4, 5);
        ReorderList(odd);
        AssertSequence(Values(odd), new[] { 1, 5, 2, 4, 3 }, "Example 2");
        ListNode? single = Build(1);
        ReorderList(single);
        AssertSequence(Values(single), new[] { 1 }, "Single node");
        ListNode? pair = Build(1, 2);
        ReorderList(pair);
        AssertSequence(Values(pair), new[] { 1, 2 }, "Two nodes");
        Console.WriteLine("All Reorder List checks passed.");
    }
}
```

## Correctness argument

The slow/fast walk leaves `firstEnd` at the end of the first half; for odd length it includes the middle. Detaching at `firstEnd.Next` produces two disjoint acyclic lists. Reversal turns the second half into nodes in the required descending positional order. During weaving, `firstNext` and `secondNext` preserve both unprocessed suffixes before links change. Each iteration links exactly one front-half node followed by one back-half node; the second half is no longer than the first, so the process terminates after consuming it. The first node remains the head, all nodes are used once, and no values are changed.

## Step-by-step dry run

For `[1,2,3,4,5]`, firstEnd becomes node 3. Detach `1→2→3` and `4→5`; reverse the second to `5→4`. Weave: 1→5→2→4→3. The middle 3 has no partner and remains last.

## Time complexity

O(n): middle search, reversal, and weaving each visit a linear number of nodes.

## Space complexity

O(1) auxiliary references; no list nodes are allocated. The embedded test traversal uses a set only to detect accidental cycles.

## Alternatives and tradeoffs

- Store all node references in an array and link from alternating ends; this is easier to visualize but uses O(n) extra space.
- Reverse the whole list and attempt index-based interleaving is incorrect unless split boundaries and node ownership are carefully handled.

## Common mistakes and gotchas

- Choosing a middle convention that makes the second half longer than the first and then losing a node.
- Forgetting to detach the halves before reversing.
- Overwriting `first.Next` or `second.Next` before saving the corresponding remainder.
- Leaving a stale old next link that creates a cycle.
- Swapping values instead of rearranging node links.
- Not handling a one-node list before searching for a middle.

## Edge-case tests

- One node.
- Two nodes.
- Even and odd lengths.
- Longer list with distinct values to make identity/order visible.
- Confirm traversal terminates after reordering.

## Reflection questions

1. Where does firstEnd stop for odd and even lengths?
2. Why detach before reversing the second half?
3. What suffix references must be saved during weaving?
4. Why is the head unchanged?

Source: [LeetCode: Reorder List](https://leetcode.com/problems/reorder-list/).
