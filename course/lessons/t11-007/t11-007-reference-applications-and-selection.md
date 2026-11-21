# stacks, queues, deques, and priority-agnostic worklists — Reference: Applications, complexity, and selection boundaries

## Scope and version

This reference covers the eight supplied application and selection terms. Priority-queue operations and concurrent queue APIs are outside this scope.

## How this group fits the mental model

Select a worklist based on the order in which unresolved work must be revisited. An application may need additional parsing rules, synchronization, persistence, or scheduling beyond the basic ADT.

## Supplied names explained

- `Delimiter matching` — Push opening delimiters; on a closer, require the top opener to be its matching type and pop it. Reject an unmatched closer immediately and require the stack empty at end. Nesting is naturally LIFO.
- `Expression evaluation` — A stack stores operands or operators while a parser applies precedence/associativity rules. Reverse Polish notation needs an operand stack; infix parsing requires more grammar logic than a stack alone.
- `Monotonic parsing stack use (conceptual link only)` — Some scans maintain a stack whose values or indices are monotone, popping entries when a new item makes them obsolete. This is an algorithmic extension; its detailed invariants belong to the separate monotonic-structures topic.
- `Undo/history stack` — Push reversible actions or prior states and pop the newest when undoing. Real history may store commands, snapshots, or inverse operations; arbitrary external side effects are not automatically reversible.
- `Breadth-first traversal worklist` — A FIFO queue processes nodes in discovery order, so all nodes at one distance are handled before the next level in an unweighted graph/tree. Mark nodes at enqueue time to prevent duplicate work.
- `Producer-consumer buffering` — A queue preserves order between producers adding work and consumers removing it. Concurrency safety, capacity/backpressure, cancellation, and shutdown require coordination beyond a plain queue.
- `Array versus linked implementation tradeoffs` — Arrays usually provide locality and compact storage but may resize; linked nodes allow local link changes but allocate and have pointer overhead. Include operation pattern and lookup/traversal cost in the comparison.
- `FIFO/LIFO versus priority ordering` — FIFO uses arrival order, LIFO uses reverse arrival order, priority ordering uses an explicit priority key. Priority queues are a distinct structure and tie policy must be defined.

## Cross-item comparison

`Delimiter matching`, many `Expression evaluation` cases, and `Undo/history stack` use LIFO. `Breadth-first traversal worklist` uses FIFO. `Monotonic parsing stack use (conceptual link only)` applies a stronger value/index invariant. `Producer-consumer buffering` adds concurrent coordination. `Array versus linked implementation tradeoffs` concerns representation; `FIFO/LIFO versus priority ordering` concerns which item is selected next.

## Examples

In BFS, mark a vertex visited when enqueued, then dequeue it and enqueue newly discovered neighbors. A FIFO queue keeps distances nondecreasing. In delimiter validation, when `]` appears, only a `[` at the top can match; searching deeper would violate nesting.

## Common mistakes

- Using a queue for nested delimiters and matching the oldest opener.
- Marking BFS nodes only when dequeued, allowing multiple enqueues and duplicate processing.
- Assuming a stack can undo an irreversible external action without a compensating operation.
- Treating a basic queue as thread-safe or bounded without checking its implementation.
- Confusing highest priority with earliest arrival.
- Comparing arrays and linked lists only by insertion complexity.

## Knowledge checks with answers

1. **Why is delimiter matching LIFO?** The most recently opened delimiter must close first.
2. **Why enqueue a BFS node only once?** It prevents repeated work and preserves a single shortest discovery in unweighted traversal.
3. **What additional concerns does producer-consumer buffering introduce?** Thread safety, capacity, backpressure, cancellation, and shutdown.
4. **What selects an item in a priority queue?** Its priority rule rather than FIFO or LIFO alone.

Sources: [OpenDSA: Linear Lists](https://opendsa-server.cs.vt.edu/ODSA/Books/Catalog/html/ListIntro.html), [OpenDSA: Queues](https://opendsa-server.cs.vt.edu/ODSA/Books/Catalog/html/Queue.html).
