# stacks, queues, deques, and priority-agnostic worklists — Big-picture orientation and mental model

## Problem and purpose

Many algorithms need to control which item is processed next. A stack processes the most recently added item first; a queue processes the earliest added item first. These are abstract data types: their ordering contract matters independently of whether they use arrays or linked nodes.

Stacks and queues turn ordering constraints into simple operations. They support parsing nested expressions, undo history, breadth-first exploration, task buffering, and simulations. Choosing the wrong ordering can make an otherwise plausible algorithm incorrect.

## Plain-language mental model

A stack is a pile of books: add and remove from the top. A queue is a waiting line: join at the back and leave from the front. A deque has both ends available. A priority queue differs: it chooses by priority, not strictly by arrival order.

The underlying storage need not match the metaphor. An array stack tracks a top index; a circular queue wraps head and tail around a fixed or growable array; a linked queue maintains front and back references. Each implementation must define what happens when it is empty and, for bounded storage, when it is full.

## How the parts fit together

- **LIFO stack** supports nested work and recently added state.
- **FIFO queue** supports arrival order and level-by-level processing.
- **Deque** supports either end and can implement stack- or queue-like policies.
- **Representations** trade locality, allocation, resizing, and bookkeeping.
- **Simulations** build one ADT from another, with costs depending on which operations are cheap.
- **Applications** include delimiter matching, expression evaluation, undo, BFS worklists, and producer-consumer buffers.

## Concept map

```text
Need a next-item rule?
├─ newest item first → stack (LIFO)
├─ oldest item first → queue (FIFO)
├─ either end → deque
└─ smallest/largest priority → priority queue (different structure)
     ↓ implementation choices
array / growable array / circular buffer / linked nodes
```

## End-to-end walkthrough

Validate `([])`: read left to right. Push `(`, push `[`. On `]`, pop and require `[`. On `)`, pop and require `(`. The input is valid exactly when every closing delimiter matches the most recent unmatched opener and the stack ends empty. The LIFO rule mirrors nested structure: the most recently opened delimiter must close first.

Using a queue would remove the earliest opener and fail on nested examples. The abstract ordering rule is what solves the problem; the array-backed implementation is an engineering choice.

## When to use it and tradeoffs

Use a stack when recent unresolved items must be handled first; a queue when arrival order or breadth-first layers matter; a deque when both ends are semantically useful. A ring buffer avoids shifting array elements but needs wraparound and full/empty handling. Dynamic arrays offer locality and amortized growth; linked nodes avoid contiguous resizing but allocate per item and have weaker locality.

Do not substitute a priority queue for FIFO unless priority order is explicitly required. Do not assume every operation has worst-case O(1): dynamic growth can copy an array, while amortized cost averages that occasional work over many operations.

## What later lessons cover

The concepts lesson compares the contracts, representations, amortized costs, and worklist applications. References detail stack, queue, deque/simulation, and selection behavior. Independent practice solves delimiter validation, minimum tracking, both ADT simulations, reverse Polish notation, and a circular queue.

Sources: [OpenDSA: Linear Lists](https://opendsa-server.cs.vt.edu/ODSA/Books/Catalog/html/ListIntro.html), [OpenDSA: Queues](https://opendsa-server.cs.vt.edu/ODSA/Books/Catalog/html/Queue.html).
