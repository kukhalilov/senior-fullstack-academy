# linked lists, pointer rewiring, reversal, and cycles — Big-picture orientation and mental model

## Problem and purpose

A linked list represents a sequence as separate nodes connected by references. It can insert or remove a node with a small number of link changes once the relevant node is known. Finding that node still takes traversal, and there is no constant-time indexing as there is with an array.

Linked-list interview problems are often about preserving node identity while changing references. One overwritten `next` link can make the rest of the list unreachable, so pointer order and invariants are central to correctness.

## Plain-language mental model

Think of each node as a card with a value and an arrow to the next card. The head reference points to the first card. To insert after a known node, connect the new card to the old next card, then redirect the known node's arrow. To reverse a list, walk it once while turning each arrow backward; before changing an arrow, save the card it used to point to.

Unlike an array, the 10th list node cannot usually be reached by arithmetic. Follow nine links. This sequential access makes a list a poor choice for repeated random indexing even though local link updates can be cheap.

## How the parts fit together

- **Node representation and traversal** define head, next/previous links, optional tail, and node identity.
- **Sentinels** add a temporary node before the real head to simplify deletion and merging when the real head may change.
- **Fast and slow pointers** move at different rates to find a middle, maintain a gap, or detect cycles.
- **Reversal and merging** rewire next references while preserving access to every unprocessed node.
- **Identity problems** compare node objects, not values; equal values do not imply shared nodes.
- **Tradeoffs** include no O(1) indexing and weaker memory locality compared with a dynamic array.

## Concept map

```text
head → node → node → null
         ├─ traverse to find position: O(n)
         ├─ known-node link update: O(1)
         ├─ dummy before head: simplify mutation
         ├─ fast/slow: middle, gap, cycle
         └─ save next → reverse/merge without losing suffix
```

## End-to-end walkthrough

Reverse `1 → 2 → 3 → null`. Set previous=null and current=head.

1. Save next=2, redirect node 1's next to null, then advance previous=1 and current=2.
2. Save next=3, redirect node 2's next to 1, advance previous=2 and current=3.
3. Save next=null, redirect node 3's next to 2, advance; current becomes null.
4. Previous is now the new head: `3 → 2 → 1 → null`.

The saved next reference is essential: without it, redirecting node 1's next would lose access to nodes 2 and 3. Empty and one-node lists also work because the loop simply performs zero or one iterations.

## When to use it and tradeoffs

Choose a linked structure when the workload naturally follows links or frequently mutates known positions. For arrays, stacks, and queues in ordinary application code, built-in collections often provide better locality and simpler memory management. Big-O for a known-node edit does not include the traversal needed to find that node.

Cycles violate the usual assumption that traversal eventually reaches null. Use a cycle-aware algorithm when input may be cyclic; otherwise an ordinary loop can never terminate. During mutation, define whether the result preserves existing nodes, creates new nodes, or changes head/tail references.

## What later lessons cover

The concepts lesson develops link invariants and identity. References explain node forms, mutation/sentinels, fast/slow and reversal, merge and tradeoffs. Separate problems cover reversing, merging, cycles, nth-from-end deletion, reordering, digit-list addition, intersection by identity, and random-pointer cloning.

Sources: [OpenDSA: Linked Lists](https://opendsa.cs.vt.edu/ODSA/Books/pubbook/odsa-all-0013bb43-a12f-4ab3-9b86-73b317f1e37e/fall-2020/F20_Public/html/ListLinked.html), [Microsoft Learn: LinkedList<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.linkedlist-1).
