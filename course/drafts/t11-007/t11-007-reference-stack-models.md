# stacks, queues, deques, and priority-agnostic worklists — Reference: Stack contracts, representations, and operations

## Scope and version

This reference explains the ten supplied stack terms. The contract is LIFO; implementation details are representation choices.

## How this group fits the mental model

A stack exposes one active end. Push adds there; peek observes it; pop removes it. Storage must track the boundary and define empty/full behavior.

## Supplied names explained

- `Last-in, first-out (LIFO)` — The last item pushed is the first item popped. This matches nested structure and undoing recent actions.
- `Push` — Add an item to the top. With a growable array, most pushes are constant time but a resize may copy all elements.
- `Pop` — Remove and return the top. Removing from an empty stack must follow a defined API contract, such as throwing or returning a Try result.
- `Peek/top` — Observe the current top without removing it. Empty behavior must be defined just as for pop.
- `Empty-stack behavior` — The specified outcome for pop/peek on empty storage. Never read an uninitialized array slot or decrement a top index below its valid range.
- `Array-backed stack` — Store items in an array and a count/top index. It offers compact storage and locality; capacity growth may copy elements.
- `Linked stack` — Store a top reference and link nodes downward. Push/pop update the head in O(1); each item typically needs an allocation/reference and locality is weaker.
- `Dynamic capacity growth` — When an array fills, allocate a larger array and copy active elements. Geometric growth bounds total copying over many pushes, though one push can be O(n).
- `Fixed-capacity stack` — Preallocated storage that cannot grow. Define whether push throws, returns failure, or follows another explicit overflow policy when full.
- `Amortized push cost` — Across a sequence of pushes, occasional growth copies are spread across many cheap pushes, often yielding O(1) amortized cost while retaining O(n) worst-case cost for a single resize.

## Cross-item comparison

`Array-backed stack` emphasizes locality and growth policy; `Linked stack` emphasizes constant-time top link changes but allocates nodes. `Dynamic capacity growth` yields an array version with amortized append; `Fixed-capacity stack` avoids resizing but must handle overflow. `Push`, `Pop`, and `Peek/top` implement the `Last-in, first-out (LIFO)` contract and need an `Empty-stack behavior` definition.

## Examples

Push A, then B, then C. Peek returns C without changing the stack. Pop returns C; the next pop returns B. An array representation with count=3 stores active items at indices 0–2; after pop, count becomes 2.

## Common mistakes

- Treating peek as removal.
- Returning a stale value after pop or allowing the top index below zero.
- Claiming worst-case O(1) for push on a growable array.
- Failing to specify overflow behavior for fixed capacity.
- Confusing logical count with the last occupied index.

## Knowledge checks with answers

1. **What does LIFO specify?** Removal order is the reverse of insertion order.
2. **What does peek change?** Nothing; it observes the top.
3. **Why can a single dynamic-array push be O(n)?** It may allocate and copy all active elements during growth.
4. **What must fixed capacity define?** Behavior when another push occurs while full.

Source: [OpenDSA: Linear Lists](https://opendsa-server.cs.vt.edu/ODSA/Books/Catalog/html/ListIntro.html).
