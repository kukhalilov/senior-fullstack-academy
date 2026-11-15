# stacks, queues, deques, and priority-agnostic worklists — Reference: Queue contracts, representations, and operations

## Scope and version

This reference covers the eleven supplied FIFO queue terms. Empty and capacity behavior are part of the implementation contract.

## How this group fits the mental model

A queue admits new work at the back and serves the oldest pending work at the front. Circular arrays and linked nodes implement the same order with different storage invariants.

## Supplied names explained

- `First-in, first-out (FIFO)` — The earliest enqueued item is removed first, preserving arrival order.
- `Enqueue` — Add an item at the back. A linked queue attaches after tail; a circular buffer writes at its calculated next position.
- `Dequeue` — Remove and return the front item, then advance head or bypass the first node. If the last node leaves a linked queue, set both head and tail to null.
- `Front/peek` — Observe the oldest item without removing it. Define behavior for an empty queue.
- `Empty-queue behavior` — Specify what dequeue/peek do when no elements are present. Do not infer emptiness from stale array contents.
- `Array-backed queue` — Use an array for storage. Shifting all remaining items after each dequeue is O(n); circular indexing avoids repeated shifts.
- `Circular array queue` — Treat an array as a ring: advance indices modulo capacity and track count or reserve one slot to distinguish full from empty.
- `Linked queue` — Maintain front/head and back/tail references. Enqueue at tail and dequeue at head are O(1); handle transitions to/from empty.
- `Head and tail references` — Head identifies the next item to dequeue; tail identifies the last enqueued node. Both are null for an empty linked queue and both point to the sole node for a one-item queue.
- `Ring-buffer wraparound` — After the last physical slot, the next logical index is zero. Use `(index+1) % capacity` only when capacity is positive; empty zero-capacity buffers need separate handling.
- `Capacity-full behavior` — A fixed ring must choose reject/throw, block, overwrite, or grow. Each policy changes correctness and semantics; overwrite loses old items and is not ordinary unbounded FIFO.

## Cross-item comparison

`Array-backed queue` can be inefficient if it shifts; `Circular array queue` avoids shifting by `Ring-buffer wraparound`. `Linked queue` uses `Head and tail references` for local updates at the cost of node allocation. `Capacity-full behavior` is explicit for bounded queues. `Enqueue` and `Dequeue` implement FIFO while `Front/peek` is observational.

## Examples

With capacity 5 and logical items at slots 3 and 4, dequeue advances head to 4. Enqueue writes at `(head+count)%capacity`, wraps to slot 0, and preserves the logical order from head through wraparound. Count disambiguates empty and full when head equals tail.

## Common mistakes

- Shifting array contents after dequeue and overlooking O(n) cost.
- Forgetting to wrap an index at capacity.
- Confusing head==tail empty with head==tail full.
- Leaving tail non-null after dequeuing the only linked node.
- Silently overwriting data when the queue is full.
- Modulo by zero for an uninitialized zero-capacity ring.

## Knowledge checks with answers

1. **Which item does dequeue return?** The oldest enqueued item.
2. **How does a circular queue avoid shifting?** It advances head and tail indices modulo capacity.
3. **What extra state can distinguish empty/full when head equals tail?** A count, or one reserved unused slot.
4. **What state follows removing the last linked item?** Both head and tail become null.

Source: [OpenDSA: Queues](https://opendsa-server.cs.vt.edu/ODSA/Books/pubbook/odsa-all/fall-2019/Public_Instance/html/Queue.html).
