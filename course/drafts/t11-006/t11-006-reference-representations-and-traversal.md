# linked lists, pointer rewiring, reversal, and cycles — Reference: Node structures and traversal

## Scope and version

This reference explains the nine supplied representation terms. These are timeless structures; pointer names below are conceptual rather than a catalog of every C# collection member.

## How this group fits the mental model

A list is a sequence encoded by node references. The head anchors traversal; optional tail and previous links trade bookkeeping/storage for different operations.

## Supplied names explained

- `Singly linked list` — Each node points to at most one successor. Traversal follows next links; backward movement requires another pass or saved state.
- `Doubly linked list` — Each node has next and previous references. It supports movement in both directions and easier removal of a known node, at the cost of extra references and invariant maintenance.
- `Circular linked list` — The last node links back to an earlier node, often the head. Traversal cannot rely on null termination; stop when returning to a known node or under a bounded count.
- `Head reference` — The reference to the first node. An empty null-terminated list has no head; insertion/deletion may replace it.
- `Tail reference` — Optional reference to the last node, enabling constant-time append when maintained. Removing or reversing the end requires updating it.
- `Node identity` — The identity of the node object itself. Two nodes may have equal values but are not the same node; shared-list intersection compares references.
- `Next reference` — Link from a node to its successor, or null at the end of a null-terminated list. Rewiring it can detach or reconnect an entire suffix.
- `Previous reference` — Link from a doubly linked node to its predecessor. It must agree reciprocally with the predecessor's next link.
- `Sequential traversal` — Start at head and follow links until the stopping condition. A null-terminated acyclic traversal is O(n); a cyclic structure needs cycle-aware termination.

## Cross-item comparison

`Singly linked list` saves predecessor storage; `Doubly linked list` supports reverse navigation. A `Circular linked list` changes the stop condition rather than the basic node identity. `Head reference` and `Tail reference` anchor ends. `Next reference` and `Previous reference` define adjacency; `Node identity` distinguishes shared structure from equal values. `Sequential traversal` explains why locating an arbitrary position costs linear time.

## Examples

For nodes A→B→C, head references A and tail references C. In a doubly linked representation, A.next=B and B.previous=A. A separate node D with the same value as B is not B; an intersection test must compare object references.

## Common mistakes

- Assuming equal values prove two lists intersect.
- Traversing a circular list until null.
- Updating next but forgetting the reciprocal previous link.
- Maintaining a stale tail after deletion or reversal.
- Claiming O(1) access by position because nodes are individually allocated.

## Knowledge checks with answers

1. **What extra capability does a doubly linked list add?** Backward traversal and predecessor access.
2. **Why can a circular traversal loop forever?** The links never reach null.
3. **What identifies a list's first node?** Its head reference.
4. **What distinguishes equal-valued nodes?** Their object identity/reference.

Source: [OpenDSA: Linked Lists](https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20260527013510/html/ListLinked.html).
