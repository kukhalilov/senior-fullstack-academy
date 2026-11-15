# linked lists, pointer rewiring, reversal, and cycles — Problem: Merge Two Sorted Lists

## Goals

- Merge two non-decreasing lists by splicing existing nodes.
- Use a dummy head and tail pointer to simplify construction.
- Preserve each input node exactly once and attach the remaining suffix.

## Problem statement

Given the heads of two sorted linked lists, merge them into one sorted list by splicing together their nodes, and return the merged head.

## Input constraints

- The total number of nodes in both lists is between 0 and 50.
- -100 <= node value <= 100.
- Each list is sorted in non-decreasing order.

## Examples with expected output

1. list1 = [1,2,4], list2 = [1,3,4] -> [1,1,2,3,4,4].
2. list1 = [], list2 = [] -> [].
3. list1 = [], list2 = [0] -> [0].
4. list1 = [1,5], list2 = [2,3,4] -> [1,2,3,4,5].

## Clarifying assumptions

- The input lists are acyclic and do not share nodes; each input node should appear once in output.
- The algorithm reuses nodes by splicing links rather than allocating copies.
- Equal values are allowed; when equal, choosing list1 first is a deterministic tie rule.
- The dummy node is temporary and is not included in the result.

## Progressive hints

1. Maintain a dummy node and a tail of the output already built.
2. Compare the current values and link the smaller current node after tail.
3. Advance the pointer from the list that supplied the node, then move tail.
4. When either input ends, append the other suffix because it is already sorted.

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
    public static ListNode? MergeTwoLists(ListNode? list1, ListNode? list2)
    {
        var dummy = new ListNode();
        ListNode tail = dummy;
        while (list1 is not null && list2 is not null)
        {
            if (list1.Val <= list2.Val)
            {
                ListNode selected = list1;
                list1 = list1.Next;
                tail.Next = selected;
            }
            else
            {
                ListNode selected = list2;
                list2 = list2.Next;
                tail.Next = selected;
            }
            tail = tail.Next;
        }
        tail.Next = list1 ?? list2;
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
        AssertSequence(Values(MergeTwoLists(Build(1, 2, 4), Build(1, 3, 4))), new[] { 1, 1, 2, 3, 4, 4 }, "Example 1");
        AssertSequence(Values(MergeTwoLists(null, null)), Array.Empty<int>(), "Example 2");
        AssertSequence(Values(MergeTwoLists(null, Build(0))), new[] { 0 }, "Example 3");
        AssertSequence(Values(MergeTwoLists(Build(1, 5), Build(2, 3, 4))), new[] { 1, 2, 3, 4, 5 }, "Unequal lengths");
        Console.WriteLine("All Merge Two Sorted Lists checks passed.");
    }
}
```

## Correctness argument

At each loop start, the output chain contains the smallest already-selected nodes from both lists in sorted order, and tail is its last node. Both input pointers identify the first unused node of their respective sorted suffixes. The smaller current head is no larger than any remaining node in either suffix, so linking it next preserves sorted order and consumes exactly one input node. When one suffix is empty, the other suffix is already sorted and every remaining value is at least the output tail; attaching it completes the merge. The dummy separates output initialization from the returned first real node.

## Step-by-step dry run

For `1→2→4` and `1→3→4`, compare heads and choose list1's 1 on a tie, then list2's 1, then 2, 3, 4, and finally attach the remaining 4. The result is `1→1→2→3→4→4`.

## Time complexity

O(n+m), where n and m are the input lengths; each node is consumed once.

## Space complexity

O(1) auxiliary references, excluding the reused nodes. The dummy is one temporary node.

## Alternatives and tradeoffs

- Allocate fresh nodes for a non-mutating merge; this costs O(n+m) additional nodes and preserves inputs.
- Recursive merge can be concise but uses O(n+m) call stack and may overflow on large lists.
- A heap is useful for merging many sorted lists, not just two; for two lists, the direct pairwise scan is simpler.

## Common mistakes and gotchas

- Forgetting to advance the selected input before linking/advancing tail.
- Dropping the unconsumed suffix when a list ends.
- Returning dummy instead of dummy.Next.
- Comparing only values for node identity; equal values are separate nodes.
- Reusing nodes when input lists share nodes without accounting for aliasing; this lesson assumes disjoint lists.
- Claiming O(1) space when allocating a new output list.

## Edge-case tests

- Both lists empty.
- One list empty.
- One list ends before the other.
- Equal values across both inputs.
- Negative values and duplicates.

## Reflection questions

1. Why is it safe to append the remaining suffix without further comparisons?
2. What does the output-tail invariant state?
3. Why does the dummy node simplify an empty result?
4. What changes if the output must not mutate either input list?

Source: [LeetCode: Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/).
