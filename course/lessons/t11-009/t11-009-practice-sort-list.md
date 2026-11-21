# comparison sorting algorithms and selection — Problem: Sort List

## Goals

- Sort singly linked nodes in O(n log n) without random access.
- Use bottom-up merge sort with O(1) auxiliary node references.
- Relink existing nodes rather than allocate replacement data nodes.

## Problem statement

Given the head of a singly linked list, return the same nodes linked in ascending order.

## Input constraints

- 0 to 50,000 nodes.
- Node values range from -100,000 to 100,000.
- The follow-up asks for O(n log n) time and O(1) memory.

## Examples with expected output

1. [4,2,1,3] -> [1,2,3,4].
2. [-1,5,3,4,0] -> [-1,0,3,4,5].
3. [] -> [].
4. [2,1,2] -> [1,2,2].

## Clarifying assumptions

- Sort by node value ascending; equal nodes may appear in either order because stability is not required.
- The implementation relinks the original nodes.
- O(1) auxiliary memory excludes the constant number of dummy/reference variables; no recursion or array conversion is used.

## Progressive hints

1. Linked lists merge efficiently because merging needs only sequential access and pointer updates.
2. Find the list length once.
3. For run widths 1,2,4,..., cut adjacent runs and merge them in place.
4. Keep a tail pointer to stitch each merged run into the result.

## Complete C# solution

```csharp dsa-solution
using System;

public sealed class ListNode
{
    public int val;
    public ListNode? next;
    public ListNode(int value = 0, ListNode? nextNode = null) { val = value; next = nextNode; }
}

public static class Program
{
    public static ListNode? SortList(ListNode? head)
    {
        int length = 0;
        for (ListNode? node = head; node is not null; node = node.next) length++;
        if (length < 2) return head;

        var dummy = new ListNode(0, head);
        for (int width = 1; width < length; width *= 2)
        {
            ListNode? current = dummy.next;
            ListNode tail = dummy;
            while (current is not null)
            {
                ListNode left = current;
                ListNode? right = Split(left, width);
                current = Split(right, width);
                (ListNode? mergedHead, ListNode mergedTail) = MergeRuns(left, right);
                tail.next = mergedHead;
                tail = mergedTail;
            }
            tail.next = null;
        }
        return dummy.next;
    }

    private static ListNode? Split(ListNode? head, int size)
    {
        if (head is null) return null;
        ListNode tail = head;
        for (int i = 1; i < size && tail.next is not null; i++) tail = tail.next;
        ListNode? remainder = tail.next;
        tail.next = null;
        return remainder;
    }

    private static (ListNode? Head, ListNode Tail) MergeRuns(ListNode? a, ListNode? b)
    {
        ListNode? head = null;
        ListNode? tail = null;
        while (a is not null && b is not null)
        {
            ListNode chosen;
            if (a.val <= b.val)
            {
                chosen = a;
                a = a.next;
            }
            else
            {
                chosen = b;
                b = b.next;
            }
            if (head is null) head = chosen;
            else tail!.next = chosen;
            tail = chosen;
        }
        ListNode? remainder = a ?? b;
        if (head is null) head = remainder;
        else tail!.next = remainder;
        tail ??= head;
        while (tail?.next is not null) tail = tail.next;
        return (head, tail ?? throw new InvalidOperationException("Both runs were empty."));
    }

    private static ListNode? Build(params int[] values)
    {
        var dummy = new ListNode();
        ListNode tail = dummy;
        foreach (int value in values) { tail.next = new ListNode(value); tail = tail.next; }
        return dummy.next;
    }

    private static int[] Values(ListNode? head)
    {
        var result = new System.Collections.Generic.List<int>();
        for (ListNode? node = head; node is not null; node = node.next) result.Add(node.val);
        return result.ToArray();
    }

    private static void Equal(int[] actual, int[] expected, string label)
    {
        if (actual.Length != expected.Length) throw new InvalidOperationException(label + " length");
        for (int i = 0; i < actual.Length; i++)
            if (actual[i] != expected[i]) throw new InvalidOperationException(label + " index " + i);
    }

    public static void Main()
    {
        Equal(Values(SortList(Build(4, 2, 1, 3))), new[] { 1, 2, 3, 4 }, "Example 1");
        Equal(Values(SortList(Build(-1, 5, 3, 4, 0))), new[] { -1, 0, 3, 4, 5 }, "Example 2");
        Equal(Values(SortList(null)), Array.Empty<int>(), "empty");
        Equal(Values(SortList(Build(2, 1, 2))), new[] { 1, 2, 2 }, "duplicates");
        Console.WriteLine("All Sort List checks passed.");
    }
}
```

## Correctness argument

Before a pass of width w, the list is a sequence of individually sorted runs of at most w nodes. Each iteration cuts two adjacent runs, then MergeRuns repeatedly attaches the smaller head; this produces a sorted run containing exactly their nodes. The prior output tail links that run after the already merged prefix. Once all pairs are processed, every run has size at most 2w and the list contains each original node exactly once. Doubling w eventually yields a single sorted run. All modifications are link rewrites; no data node is lost or duplicated.

## Step-by-step dry run

For 4->2->1->3, width 1 merges (4,2) and (1,3) into 2->4 and 1->3. Width 2 merges those runs into 1->2->3->4. The pass tail is explicitly terminated to prevent stale links from forming cycles.

## Time complexity

O(n log n): each of O(log n) passes visits and merges every node a constant number of times.

## Space complexity

O(1) auxiliary node references; the list nodes are reused. No recursion stack is present.

## Alternatives and tradeoffs

- Top-down merge sort is concise but uses O(log n) recursion stack.
- Converting values to an array simplifies sorting but uses O(n) extra memory and changes link identity behavior.
- Stability can be preserved by choosing from the left run on equal values, as this implementation does.

## Common mistakes and gotchas

- Forgetting to cut runs, which can cause loops or merge the wrong range.
- Advancing the run cursor after rewiring without saving the next run.
- Failing to terminate the merged pass tail.
- Returning the dummy node instead of dummy.next.
- Claiming O(1) memory while using recursion.

## Edge-case tests

- Empty and one-node lists.
- Odd length and incomplete final runs.
- Reverse order and duplicate values.
- Negative values.
- Confirm node count is unchanged.

## Reflection questions

1. Why is bottom-up merge sort suitable for linked lists?
2. What does Split guarantee about its returned remainder?
3. Why terminate the pass tail?
4. Which invariant holds before every width pass?

Source: [LeetCode: Sort List](https://leetcode.com/problems/sort-list/).
