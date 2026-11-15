# linked lists, pointer rewiring, reversal, and cycles — Problem: Intersection of Two Linked Lists

## Goals

- Find the first shared node by reference identity in O(m+n) time and O(1) space.
- Handle unequal prefixes without computing list lengths.
- Avoid confusing equal values with shared nodes.

## Problem statement

Given the heads of two acyclic singly linked lists, return the node at which they intersect, or null if they do not intersect. The lists must retain their original structure.

## Input constraints

- 1 <= each list length <= 30,000.
- 1 <= node value <= 100,000.
- The shared structure contains no cycles.
- Values can be equal in separate, non-shared nodes.

## Examples with expected output

1. A = [4,1,8,4,5], B = [5,6,1,8,4,5] with the same node 8 and suffix -> return that shared node object.
2. A = [1,9,1,2,4], B = [3,2,4] sharing node 2 -> return the shared node object.
3. A = [2,6,4], B = [1,5] -> null.
4. A and B both contain a distinct node valued 7 -> null.

## Clarifying assumptions

- Intersection means reference identity: the paths reach the same node object.
- If lists intersect, their suffix from the first shared node is identical because each node has one Next reference.
- The method returns the existing node, not a new node with the same value.
- Inputs remain unchanged.

## Progressive hints

1. If list lengths differ, direct simultaneous traversal starts at different distances from the end.
2. Let one pointer traverse A then B, and the other traverse B then A.
3. Each pointer then covers the same total path length m+n.
4. Compare references, including null; after equalizing path lengths, they meet at the first shared node or both reach null.

## Complete C# solution

```csharp dsa-solution
using System;

public sealed class ListNode
{
    public int Val { get; set; }
    public ListNode? Next { get; set; }
    public ListNode(int val = 0, ListNode? next = null) { Val = val; Next = next; }
}

public static class Program
{
    public static ListNode? GetIntersectionNode(ListNode? headA, ListNode? headB)
    {
        ListNode? a = headA;
        ListNode? b = headB;
        while (!ReferenceEquals(a, b))
        {
            a = a is null ? headB : a.Next;
            b = b is null ? headA : b.Next;
        }
        return a;
    }

    private static void AssertSame(ListNode? actual, ListNode? expected, string label)
    {
        if (!ReferenceEquals(actual, expected)) throw new InvalidOperationException(label + " identity failed.");
    }

    public static void Main()
    {
        var shared = new ListNode(8, new ListNode(4, new ListNode(5)));
        var a = new ListNode(4, new ListNode(1, shared));
        var b = new ListNode(5, new ListNode(6, new ListNode(1, shared)));
        AssertSame(GetIntersectionNode(a, b), shared, "Shared suffix");

        var equalA = new ListNode(7);
        var equalB = new ListNode(7);
        AssertSame(GetIntersectionNode(equalA, equalB), null, "Equal values, distinct nodes");
        AssertSame(GetIntersectionNode(null, null), null, "Both empty");
        Console.WriteLine("All Intersection of Two Linked Lists checks passed.");
    }
}
```

## Correctness argument

Let the lists have prefix lengths a and b before their common suffix of length c. Pointer A traverses a+c+b nodes before reaching the common suffix on its second path; pointer B traverses b+c+a. They reach the first common node after equal total distance, so their references coincide there. If there is no intersection, each path has length m+n and both pointers become null together. Since each pointer switches only after reaching null, neither can get stuck in a longer unmatched prefix. Reference comparison ensures equal-valued separate nodes are not mistaken for intersection.

## Step-by-step dry run

For A prefix length 2, B prefix length 3, and a shared suffix starting at 8: A traverses its two unique nodes and shared tail, then restarts at B; B traverses its three unique nodes and shared tail, then restarts at A. After each has covered the other's prefix, both arrive at shared node 8 on the same step.

## Time complexity

O(m+n); each pointer traverses at most both lists once.

## Space complexity

O(1) auxiliary references.

## Alternatives and tradeoffs

- Compute lengths, advance the longer list by their difference, then walk together. This is also O(m+n) time and O(1) space but needs explicit length bookkeeping.
- A hash set of nodes from one list gives expected O(m+n) time but uses O(m) space.
- Comparing values is not a valid alternative because equal values do not imply shared identity.

## Common mistakes and gotchas

- Comparing node values instead of references.
- Returning the first matching value rather than the actual shared node.
- Forgetting to switch a pointer to the other head when it reaches null.
- Declaring no intersection as soon as pointer values differ at one position.
- Mutating either list while searching; the problem requires original structure to remain.
- Applying this argument to cyclic lists, which have different intersection/cycle relationships.

## Edge-case tests

- No shared nodes with equal values.
- Shared node is the head of both lists.
- One list is a prefix of the other.
- Long unequal prefixes before a shared suffix.
- Null inputs as defensive behavior.

## Reflection questions

1. Why do both pointers travel the same combined length?
2. What does it mean for two singly linked lists to intersect?
3. Why do they share the entire suffix after the first intersection?
4. How does length alignment solve the same problem?

Source: [LeetCode: Intersection of Two Linked Lists](https://leetcode.com/problems/intersection-of-two-linked-lists/).
