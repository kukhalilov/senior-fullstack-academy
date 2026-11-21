# linked lists, pointer rewiring, reversal, and cycles — Problem: Linked List Cycle

## Goals

- Detect a cycle using Floyd's fast/slow pointers in constant space.
- Distinguish a cycle-entry node from the first meeting point.
- Check pointer safety before moving two links.

## Problem statement

Given the head of a linked list, return true if following next references eventually reaches a node already visited, and false if traversal reaches null. The cycle's connection index is not supplied to the method.

## Input constraints

- 0 <= number of nodes <= 10,000.
- -100,000 <= node value <= 100,000.
- The tail either points to a node in the list or to null.

## Examples with expected output

1. values [3,2,0,-4], tail connects to node index 1 -> true.
2. values [1,2], tail connects to node index 0 -> true.
3. values [1], tail connects to null -> false.
4. Empty list -> false.

## Clarifying assumptions

- The method receives node references; test metadata such as `pos` is used only to build the linked structure and is not an argument.
- Node values may repeat and do not determine whether a cycle exists.
- Return a Boolean only; do not mutate the links.
- The list may be empty or cyclic, so traversal to null alone is not sufficient.

## Progressive hints

1. A hash set of visited node references can detect repeats but uses O(n) space.
2. Instead move slow by one link and fast by two.
3. If fast reaches null, there is no cycle; if the pointers meet, a cycle exists.
4. Check fast and fast.Next before advancing fast twice.

## Complete C# solution

```csharp dsa-solution
using System;

public sealed class ListNode
{
    public int Val { get; set; }
    public ListNode? Next { get; set; }
    public ListNode(int val = 0) { Val = val; }
}

public static class Program
{
    public static bool HasCycle(ListNode? head)
    {
        ListNode? slow = head;
        ListNode? fast = head;
        while (fast is not null && fast.Next is not null)
        {
            slow = slow!.Next;
            fast = fast.Next.Next;
            if (ReferenceEquals(slow, fast)) return true;
        }
        return false;
    }

    private static ListNode? Build(int[] values, int cycleIndex)
    {
        var nodes = new ListNode[values.Length];
        for (int i = 0; i < values.Length; i++) nodes[i] = new ListNode(values[i]);
        for (int i = 0; i + 1 < nodes.Length; i++) nodes[i].Next = nodes[i + 1];
        if (nodes.Length > 0 && cycleIndex >= 0) nodes[^1].Next = nodes[cycleIndex];
        return nodes.Length == 0 ? null : nodes[0];
    }

    private static void AssertEqual(bool actual, bool expected, string label)
    {
        if (actual != expected) throw new InvalidOperationException(label + " failed.");
    }

    public static void Main()
    {
        AssertEqual(HasCycle(Build(new[] { 3, 2, 0, -4 }, 1)), true, "Example 1");
        AssertEqual(HasCycle(Build(new[] { 1, 2 }, 0)), true, "Example 2");
        AssertEqual(HasCycle(Build(new[] { 1 }, -1)), false, "Example 3");
        AssertEqual(HasCycle(null), false, "Empty list");
        AssertEqual(HasCycle(Build(new[] { 1 }, 0)), true, "Self-cycle");
        Console.WriteLine("All Linked List Cycle checks passed.");
    }
}
```

## Correctness argument

If the list is acyclic, fast advances until fast or fast.Next is null, so the loop ends and the method returns false. If a cycle exists, after both pointers enter it, fast gains one node of relative distance on slow each iteration modulo the cycle length. This modular distance must eventually become zero, so the references meet and the method returns true. Comparing references is necessary; equal node values do not imply the pointers occupy the same node.

## Step-by-step dry run

For 1→2→3→4→(2), slow advances 1,2,3; fast advances 1,3,2. They have not yet met. Next slow reaches 4 and fast reaches 4, so ReferenceEquals is true. That meeting proves a cycle exists; it is not necessarily the entry.

## Time complexity

O(n) in the worst case: pointers traverse the noncyclic prefix and at most a bounded number of cycle laps before meeting.

## Space complexity

O(1) auxiliary space.

## Alternatives and tradeoffs

- A HashSet<ListNode> detects the first repeated node directly in O(n) expected time and O(n) space. Use reference equality, not value equality.
- A visit marker on nodes would mutate input and may not be permitted.
- Finding the cycle entry is a follow-up phase after a meeting; the meeting test alone returns only a Boolean.

## Common mistakes and gotchas

- Dereferencing fast.Next without first checking fast.
- Comparing values instead of object references.
- Moving fast only one link, which does not guarantee the same meeting argument.
- Assuming fast==slow at initialization proves a cycle; both begin at head, so compare only after advancing.
- Confusing first meeting with the cycle entry.
- Traversing until null on cyclic input.

## Edge-case tests

- Empty list.
- Single node without a cycle.
- Single node pointing to itself.
- Cycle back to head.
- Cycle beginning after a noncyclic prefix.
- Repeated values in an acyclic list.

## Reflection questions

1. Why do the pointers need different speeds?
2. What does null termination prove?
3. Why is ReferenceEquals appropriate?
4. What additional procedure finds the entry after the pointers meet?

Source: [LeetCode: Linked List Cycle](https://leetcode.com/problems/linked-list-cycle/).
