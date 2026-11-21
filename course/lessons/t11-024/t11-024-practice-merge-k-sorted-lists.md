# binary heaps and priority queues — Problem: Merge k Sorted Lists

## Goals
- Merge sorted streams by keeping only their current frontier items.
- Use a deterministic composite priority for equal node values.
- Relink nodes without allocating a replacement node for every input value.

## Problem statement
Given `k` singly linked lists, each sorted in ascending order, merge them into one ascending linked list and return its head. Input nodes may be reused.

## Input constraints
- `0 <= lists.Length <= 10,000`.
- Each list has at most 500 nodes; total nodes are at most 10,000.
- `-10,000 <= node.val <= 10,000`.

## Examples with expected output
- `[[1,4,5],[1,3,4],[2,6]] -> [1,1,2,3,4,4,5,6]`.
- `[] -> []`.
- `[[],[0],[]] -> [0]`.

## Clarifying assumptions
- Every list is already sorted in nondecreasing order.
- The result must be sorted; equal values can appear in any relative order.
- Use sequence as a secondary priority to make equal-value behavior deterministic. It is not needed for correctness of the values, but documents and controls tie behavior.

## Progressive hints
1. Merging two lists at a time can repeatedly revisit nodes.
2. At any point, the smallest remaining value must be among the heads of nonempty lists.
3. Keep one head per list in a min-priority queue; after removing one, insert only its successor.

## Complete C# solution
```csharp dsa-solution
using System;
using System.Collections.Generic;

sealed class ListNode
{
    public int val;
    public ListNode? next;
    public ListNode(int val = 0, ListNode? next = null) { this.val = val; this.next = next; }
}

static class Program
{
    static ListNode? MergeKLists(ListNode?[] lists)
    {
        var queue = new PriorityQueue<ListNode, (int Value, int Sequence)>();
        int sequence = 0;
        foreach (ListNode? head in lists)
            if (head is not null) queue.Enqueue(head, (head.val, sequence++));

        var dummy = new ListNode();
        ListNode tail = dummy;
        while (queue.Count > 0)
        {
            ListNode node = queue.Dequeue();
            ListNode? next = node.next;
            tail.next = node;
            tail = node;
            if (next is not null) queue.Enqueue(next, (next.val, sequence++));
        }
        tail.next = null;
        return dummy.next;
    }

    static ListNode? From(params int[] values)
    {
        var dummy = new ListNode();
        ListNode tail = dummy;
        foreach (int value in values) { tail.next = new ListNode(value); tail = tail.next; }
        return dummy.next;
    }

    static int[] Values(ListNode? head)
    {
        var result = new List<int>();
        while (head is not null) { result.Add(head.val); head = head.next; }
        return result.ToArray();
    }

    static void Check(int[] expected, ListNode?[] lists)
    {
        int[] actual = Values(MergeKLists(lists));
        if (!expected.AsSpan().SequenceEqual(actual))
            throw new InvalidOperationException($"Expected [{string.Join(',', expected)}], got [{string.Join(',', actual)}].");
    }

    static void Main()
    {
        Check(new[] { 1, 1, 2, 3, 4, 4, 5, 6 }, new[] { From(1, 4, 5), From(1, 3, 4), From(2, 6) });
        Check(Array.Empty<int>(), Array.Empty<ListNode?>());
        Check(new[] { 0 }, new ListNode?[] { null, From(0), null });
        Check(new[] { -2, -2, 7 }, new[] { From(-2, 7), From(-2) });
        Console.WriteLine("Merge k Sorted Lists checks passed.");
    }
}
```

## Correctness argument
The queue contains the smallest unprocessed node of each nonempty list. Every later node in the same list is at least as large because that list is sorted. Therefore the minimum queued node is the smallest node remaining across all lists and is safe to append. Inserting its successor restores the frontier invariant. Each input node is removed once, so all nodes are emitted in sorted order exactly once.

## Step-by-step dry run
For `[1,4]` and `[2,3]`, the frontier begins `{1,2}`. Remove 1 and add 4, giving `{2,4}`. Remove 2 and add 3, giving `{3,4}`. Then emit 3 and 4. Each step chooses the smallest remaining list head.

## Time complexity
O(N log k), where N is the total number of nodes and the heap holds at most k nodes. For k=0 or 1, handle the empty/single-list case in O(N).

## Space complexity
O(k) auxiliary heap entries, excluding the reused input nodes and constant dummy node.

## Alternatives and tradeoffs
- Pairwise divide-and-conquer merge takes O(N log k) time and O(1) auxiliary node storage beyond recursion/iteration, but revisits nodes in merge passes.
- Sequentially merge into one accumulated list can cost O(Nk) when list lengths are balanced.
- Copying values and sorting is O(N log N) and loses node identity; it may be simpler if the output need not be linked nodes.

## Common mistakes and gotchas

- Enqueueing every node at once, increasing heap space to O(N).
- Enqueueing a successor before saving its link and then overwriting `next` while relinking.
- Leaving the final tail attached to an old successor and creating an accidental cycle or duplicate suffix; explicitly terminate it.
- Comparing node objects without a value priority.
- Using a comparator that subtracts values and may overflow for unrestricted integers; tuple comparison avoids that subtraction.
- Assuming equal values need stable order when the problem does not require it. The sequence field here makes tie order explicit anyway.

## Edge-case tests

- No lists, all empty lists, and one nonempty list.
- Equal values across lists and negative values.
- One list much longer than the others.
- Verify the resulting tail points to null.

## Reflection questions

1. Why does the minimum remaining item have to be a current list head?
2. Why is heap size bounded by k instead of N?
3. What role does the sequence component play in the priority tuple?

## Source
- [Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/)
