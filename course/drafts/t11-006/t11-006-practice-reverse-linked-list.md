# linked lists, pointer rewiring, reversal, and cycles — Problem: Reverse Linked List

## Goals

- Reverse next links iteratively without losing the unprocessed suffix.
- Maintain the previous/current/next invariant.
- Handle empty and single-node lists without special branches.

## Problem statement

Given the head of a singly linked list, reverse the list and return the new head.

## Input constraints

- 0 <= number of nodes <= 5,000.
- -5,000 <= node value <= 5,000.
- Values may repeat; reversal changes links, not values or node identities.

## Examples with expected output

1. head = [1,2,3,4,5] -> [5,4,3,2,1].
2. head = [1,2] -> [2,1].
3. head = [] -> [].
4. head = [7] -> [7].

## Clarifying assumptions

- Input is a finite, acyclic singly linked list.
- Reverse the existing nodes in place; do not create replacement data nodes.
- The returned head is different from the old head for lists of length greater than one.
- The solution is iterative; recursive reversal is discussed as an alternative.

## Progressive hints

1. Track the reversed prefix and the first node not yet reversed.
2. Save current.Next before changing it.
3. Point current.Next to previous, then advance both pointers using the saved next.
4. When current becomes null, previous is the new head.

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
    public static ListNode? ReverseList(ListNode? head)
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
        AssertSequence(Values(ReverseList(Build(1, 2, 3, 4, 5))), new[] { 5, 4, 3, 2, 1 }, "Example 1");
        AssertSequence(Values(ReverseList(Build(1, 2))), new[] { 2, 1 }, "Example 2");
        AssertSequence(Values(ReverseList(null)), Array.Empty<int>(), "Example 3");
        AssertSequence(Values(ReverseList(Build(7))), new[] { 7 }, "Example 4");
        Console.WriteLine("All Reverse Linked List checks passed.");
    }
}
```

## Correctness argument

Before each iteration, previous is the head of the already reversed prefix and current is the first node of the untouched suffix. Saving current.Next preserves that suffix. Redirecting current.Next to previous extends the reversed prefix by exactly current; advancing previous and current restores the invariant for the next node. When current is null, every original node is in the reversed prefix and previous points to its head. The algorithm neither loses nor duplicates a node.

## Step-by-step dry run

For `1→2→3→null`, begin previous=null and current=1. Save 2, set 1.next=null, advance. Save 3, set 2.next=1. Save null, set 3.next=2. Current is null and previous is `3→2→1→null`.

## Time complexity

O(n), each node is visited once.

## Space complexity

O(1) auxiliary space for the iterative form.

## Alternatives and tradeoffs

- Recursive reversal can be concise but uses O(n) call stack and may overflow for long lists.
- Copying values to an array and rebuilding is O(n) extra space and changes node identities; it does not satisfy in-place node reversal.

## Common mistakes and gotchas

- Redirecting current.Next before saving its old successor.
- Returning the old head, which becomes the tail.
- Setting previous to current before redirecting, creating a self-link.
- Forgetting that the new tail must point to null; the first reversal step establishes it.
- Using an algorithm that assumes a null-terminated acyclic input on a cyclic list.

## Edge-case tests

- Empty list.
- One node.
- Two nodes.
- Repeated values with distinct node identities.
- A longer odd-length list.

## Reflection questions

1. What does previous represent before each iteration?
2. Why is next saved before rewiring?
3. Why does the new tail end with null?
4. What extra resource does recursive reversal consume?

Source: [LeetCode: Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/).
