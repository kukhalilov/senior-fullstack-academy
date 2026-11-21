# linked lists, pointer rewiring, reversal, and cycles — Core concepts and how they fit together

## Learning objectives

- Explain the difference between node references and node values.
- Traverse, insert, delete, reverse, and merge without losing nodes.
- Use sentinels and fast/slow pointers to simplify common boundary cases.
- State the time and space costs with traversal included.

## Prerequisites

Know references, classes, null, loops, and basic asymptotic analysis. A singly linked node contains a value and a reference to its successor; a doubly linked node also has a predecessor reference.

## Core concepts

### Sequence through references

The head identifies the first node; following `Next` reaches the rest. If the list is null-terminated, the final node's next is null. A tail reference, when maintained, identifies the final node and can make append O(1), but every operation that changes the final node must update it. A circular list has no null end marker; algorithms need another stopping condition.

Values and nodes are different. Two separate nodes may both contain 7. An intersection problem means both paths eventually reference the same node object. Comparing values would incorrectly call equal-valued but separate nodes an intersection.

### Traversal and mutation costs

Indexing the ith node requires following i links, so indexed access is O(n). Inserting after a node already in hand changes a constant number of references and is O(1); finding that node remains O(n). Doubly linked lists add previous links and use more storage, but can remove a known node without first locating its predecessor. The runtime `LinkedList<T>` API exposes node objects and linked navigation; it does not turn positional search into constant time.

### Rewire without losing the remainder

Before overwriting a link, save the reference needed to continue. For reversal, maintain `previous` as the reversed prefix and `current` as the first unprocessed node. Save `current.Next`, point current to previous, then advance. At termination previous is the new head. This invariant handles empty and single-node inputs naturally.

For deletion in a singly linked list, the predecessor is usually needed to bypass the removed node. A dummy head gives every real node a predecessor, including the original first node. The dummy is not part of the returned data and must not leak into output.

### Fast and slow pointers

Moving slow one edge and fast two edges can find the middle or detect a cycle. In an acyclic list, fast reaches null (or its next is null). In a cycle, the pointers eventually meet because their relative distance around the cycle changes by one each step. To find the cycle entry after a meeting, reset one pointer to head and move both one edge; they meet at the entry. To remove the nth node from end, advance a lead pointer n nodes, then move lead and follow together until lead reaches the end, preserving a fixed gap.

### Merge while preserving nodes

For two sorted lists, compare their current values and link the smaller node after the output tail. Save/advance the selected input pointer before overwriting output links. A dummy node avoids special handling of the first emitted node. Append whichever remainder is non-null after one input ends. Reusing nodes uses O(1) auxiliary references; allocating a fresh result uses O(n+m) nodes.

## Mechanisms and relationships

| Need | Technique | Important invariant |
|---|---|---|
| Insert/remove around head | Dummy/sentinel node | Dummy precedes every real node |
| Reverse | Previous/current/next | Previous is reversed prefix; current starts untouched suffix |
| Find middle | Slow one, fast two | Fast's progress is twice slow's |
| Detect cycle | Floyd pointers | A meeting implies a cycle; null reach implies none |
| Remove nth from end | Fixed pointer gap | Lead remains n nodes ahead until it reaches tail |
| Find shared node | Identity comparison | Compare references, not values |

## Worked examples

To remove the head of `5 → 7 → 9`, a dummy's next initially references 5. Set the dummy's next to 7; head becomes `dummy.Next`, so no separate head-removal branch is needed. For two sorted lists `1→4` and `2→3`, a dummy tail links 1, then 2, then 3, then the remaining 4.

## Misconceptions and edge cases

- A known-node insertion is O(1); finding an index first is O(n).
- A singly linked list cannot move backward without saved predecessors or another pass.
- Changing head requires returning/updating the new head reference.
- Cyclic input never reaches null; null-terminated traversal is unsafe without a cycle premise.
- Reversal and merge can lose suffix nodes if next is overwritten before being saved.
- A list can contain repeated values without repeated node identity.
- Recursive traversal uses O(n) call stack in the worst case and may overflow on long lists.
- Tail and previous pointers become inconsistent if only next links are updated.

## Knowledge checks with answers

1. **Why is array-style indexing O(n)?** Reach each position by following links from a known node.
2. **What must be saved before reversing current.Next?** The old next reference.
3. **What does a Floyd meeting establish?** A cycle exists, not where its entry is.
4. **What does intersection compare?** Node object identity.
5. **Why use a dummy head?** It gives the original first node an ordinary predecessor for uniform rewiring.

Sources: [OpenDSA: Linked Lists](https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20260527013510/html/ListLinked.html), [Microsoft Learn: LinkedList<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.linkedlist-1).
