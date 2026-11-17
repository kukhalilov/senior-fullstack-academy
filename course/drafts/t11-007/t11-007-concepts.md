# stacks, queues, deques, and priority-agnostic worklists — Core concepts and how they fit together

## Learning objectives

- Distinguish LIFO, FIFO, deque, and priority ordering.
- Explain array, circular-buffer, and linked implementations and their boundary states.
- Analyze amortized transfer/growth costs in simulated structures.
- Match parsing, history, traversal, and buffering workloads to their access order.

## Prerequisites

Know arrays, references, loops, and basic complexity analysis. An abstract data type specifies allowed operations and their meaning; a representation is the storage used to implement them.

## Core concepts

### Ordering contracts

A stack exposes its most recently pushed, not-yet-removed item. A queue exposes its earliest enqueued, not-yet-removed item. A deque permits adding/removing at both ends. A priority queue chooses according to an ordering key and can violate arrival order. These contracts are different even when one implementation could represent all of them.

### Representations and costs

An array-backed stack keeps a top/count; push writes at the next slot and pop clears or ignores the last slot. A growable array occasionally allocates and copies, so append/push may be O(n) worst case but O(1) amortized under geometric growth. A fixed-capacity stack must choose an overflow policy.

A queue can use a circular buffer with head, count, and capacity. Tail is derived as `(head+count) mod capacity`; enqueue writes there, dequeue reads head and advances it modulo capacity. Count distinguishes full from empty even when head equals tail. A linked queue holds head and tail so enqueue/dequeue update a bounded number of links; when removing the last node, both references must become null.

### Deques and simulations

A deque supports stack operations at one end and queue operations at opposite ends. It does not promise constant-time middle indexing. To implement a queue with two stacks, push new items to incoming; when outgoing is empty, transfer all items once, reversing their order. Each item moves at most once each direction, so operations are amortized O(1), though one dequeue can be O(n). To implement a stack using queues, rotate older items behind the newest after push, or use two queues; state which operation bears the cost.

### Applications follow the access order

Nested delimiters and reverse Polish evaluation need the most recent unresolved operand/opener, so use a stack. BFS needs to process the oldest discovered frontier item, so use a queue. Undo/history commonly pops the most recent action, but real systems may need command semantics, persistence, or branching beyond a basic stack. Producer-consumer buffering preserves item order and additionally needs synchronization/backpressure; a plain queue alone does not provide thread safety.

## Mechanisms and relationships

| Work | Ordering rule | Natural structure |
|---|---|---|
| Nested delimiter matching | Most recent unmatched opener | Stack |
| Reverse Polish evaluation | Most recent operands | Stack |
| Breadth-first worklist | Earliest discovered pending item | Queue |
| Add/remove at both ends | End chosen by operation | Deque |
| Queue via two stacks | Reverse twice over item lifetime | Two stacks, lazy transfer |
| Priority scheduling | Lowest/highest key first | Priority queue, outside this scope |

## Worked examples

For queue-from-stacks, enqueue A,B,C into incoming. On first dequeue, transfer C,B,A to outgoing; pop returns A. Next pops B and C directly. New item D goes to incoming; it is transferred only when outgoing empties. FIFO order is preserved, and each item is transferred at most once.

## Misconceptions and edge cases

- A stack and queue are interfaces/contracts, not necessarily linked structures.
- Empty pop/dequeue behavior must be explicit: throw, return a sentinel/nullable result, or use a Try-pattern.
- For a circular queue, head==tail alone cannot distinguish empty from full without count or a reserved slot.
- Amortized O(1) does not mean every operation has worst-case O(1) latency.
- Transferring two stacks on every dequeue destroys the amortized bound; transfer only when outgoing is empty.
- A normal queue is not automatically safe for concurrent producers/consumers.
- Priority-based ordering differs from FIFO even if priorities happen to be equal; define ties.

## Knowledge checks with answers

1. **Which item leaves a LIFO stack?** The most recently pushed item still present.
2. **Why does a ring buffer need a count or reserved slot?** Head and tail equality can represent both empty and full.
3. **Why is queue-from-stacks amortized O(1)?** Each element transfers from incoming to outgoing at most once.
4. **What order does BFS need?** FIFO by discovery.
5. **Does a basic queue provide thread safety or backpressure?** No; those are separate coordination policies.

Sources: [OpenDSA: Linear Lists](https://opendsa-server.cs.vt.edu/ODSA/Books/Catalog/html/ListIntro.html), [OpenDSA: Queues](https://opendsa-server.cs.vt.edu/ODSA/Books/Catalog/html/Queue.html).
