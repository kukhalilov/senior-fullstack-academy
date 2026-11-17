# linked lists, pointer rewiring, reversal, and cycles — Reference: Insertion, deletion, and sentinels

## Scope and version

This reference covers the eight supplied mutation terms. It focuses on singly linked rewiring and assumes exclusive mutation of the list during the operation.

## How this group fits the mental model

Mutation changes reachability. Preserve a path to every node that must remain reachable, and define which reference becomes the new head/tail before returning.

## Supplied names explained

- `Pointer rewiring` — Change one or more node links to insert, remove, merge, or reorder nodes. A small number of assignments can alter the whole reachable sequence, so establish the order and invariant first.
- `Insert after a known node` — Save the old successor, set newNode.Next to it, then set node.Next to newNode. The operation is O(1) once node is known; locating node may cost O(n).
- `Delete after a known node` — If node.Next exists, save or inspect its successor and set node.Next to node.Next.Next. The removed node becomes unreachable from this chain; handle tail bookkeeping if the deleted node was the tail.
- `Dummy head node` — Temporary node whose next points to the real head. It gives the first real node a predecessor, simplifying head deletion and list construction. Return dummy.Next, not the dummy.
- `Sentinel node` — A boundary node with a special structural role, often an always-present dummy at the head or tail. It reduces endpoint branches but is not ordinary user data.
- `Save-next-before-rewire rule` — Before overwriting current.Next, save its old value when traversal still needs it. This prevents losing the unprocessed suffix during reversal, merge, or extraction.
- `Head replacement` — Assign the caller-visible head to the new first node after insertion, deletion, or reversal. In C#, return the new head or mutate a wrapper that owns it.
- `Tail maintenance` — Keep the optional tail consistent when append, deletion, reversal, or emptying changes the last reachable node. A stale tail may point into a detached chain.

## Cross-item comparison

`Dummy head node` is one common `Sentinel node` arrangement. `Insert after a known node` and `Delete after a known node` update local references, while `Head replacement` and `Tail maintenance` preserve endpoint anchors. `Save-next-before-rewire rule` is a traversal safety practice used across `Pointer rewiring` operations.

## Examples

To insert X after A in A→B→C: first set X.next=B, then A.next=X, producing A→X→B→C. If A.next is redirected to X before preserving B, the old suffix becomes unreachable unless it was saved elsewhere.

To delete the original head in dummy→A→B, set dummy.next=B and return dummy.next. The dummy makes this structurally the same as deleting B after A.

## Common mistakes

- Redirecting the predecessor before saving the successor.
- Returning a dummy node instead of dummy.Next.
- Forgetting to replace head after deleting/reversing the first node.
- Leaving tail pointing at a detached node.
- Assuming the removed node must have its Next cleared; that depends on the API/ownership contract.
- Deleting by value without specifying which duplicate occurrence is intended.

## Knowledge checks with answers

1. **What is the safe insertion assignment order?** New node points to old successor, then predecessor points to new node.
2. **Why does a dummy simplify head deletion?** Every real node has a predecessor, including the former head.
3. **What does save-next protect?** Reachability of the not-yet-processed suffix.
4. **When must tail change?** Whenever the operation changes which node is last, including becoming empty.

Source: [OpenDSA: Linked Lists](https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20260527013510/html/ListLinked.html).
