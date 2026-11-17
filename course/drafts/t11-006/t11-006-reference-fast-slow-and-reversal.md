# linked lists, pointer rewiring, reversal, and cycles — Reference: Fast/slow pointers, cycles, and reversal

## Scope and version

This lesson covers the eight supplied pointer patterns for singly linked lists. Null checks must precede every dereference.

## How this group fits the mental model

Different pointer speeds encode relative distance without indexing. Reversal instead changes link direction while the current and unprocessed portions remain explicitly represented.

## Supplied names explained

- `Fast and slow pointers` — Move two references at different rates, commonly one and two links per loop. Their relative motion reveals a middle, a fixed gap, or a cycle. Check `fast != null && fast.Next != null` before advancing fast twice.
- `Middle-node search` — Advance slow once and fast twice. For even length, loop condition determines whether slow ends at the first or second middle; match the problem's required convention.
- `Nth node from end` — Advance a lead pointer n links, then move it and a follow pointer together until lead reaches the end. The gap leaves follow at the nth node from the end, with careful treatment for n equal to length.
- `Floyd cycle detection` — Slow takes one link, fast two. If fast reaches null, no cycle; if they meet, a cycle exists. Meeting is not necessarily the entry node.
- `Cycle entry detection` — After a Floyd meeting, reset one pointer to head and move both one link at a time; under the algorithm's cycle-length relation they meet at the cycle entry.
- `In-place list reversal` — Walk each node once and point its next link to previous. It reuses nodes and needs constant reference storage.
- `Previous-current-next invariant` — Before each reversal step, previous is the reversed prefix, current begins the untouched suffix, and next temporarily saves current's old successor. After rewiring and advancing, the invariant is restored.
- `Reverse a sublist` — Reverse only nodes between specified positions while reconnecting the prefix and suffix. A dummy head handles a sublist beginning at position one; save the node after the sublist before reversing links.

## Cross-item comparison

`Fast and slow pointers` is a family; `Middle-node search`, `Floyd cycle detection`, and `Nth node from end` are applications. `Cycle entry detection` continues after Floyd's meeting. `In-place list reversal` uses the `Previous-current-next invariant`; `Reverse a sublist` adds reconnection boundaries.

## Examples

For five nodes, slow advances 1→2→3 while fast advances 1→3→5; slow ends at the middle. For 1→2→3→4, a loop while fast and fast.Next exist leaves slow at 3, the second middle. In reversal, save node 2 before redirecting node 1 to null.

## Common mistakes

- Checking fast.Next without first checking fast.
- Assuming even-length middle behavior without tracing the loop condition.
- Calling the Floyd meeting point the cycle entry.
- Moving the reset pointer and meeting pointer at different speeds in cycle-entry detection.
- Overwriting current.Next before saving the suffix.
- Reversing the right nodes but forgetting to reconnect both boundaries of a sublist.

## Knowledge checks with answers

1. **What proves a cycle exists?** Fast and slow meet before fast reaches null.
2. **What does Floyd's initial meeting locate?** A point inside the cycle, not necessarily its entry.
3. **What must be saved before reversing a link?** Current's original next node.
4. **Why trace even-length examples?** The middle convention depends on loop conditions.

Source: [OpenDSA: Linked Lists](https://opendsa.cs.vt.edu/ODSA/StandaloneModules/20260527013510/html/ListLinked.html).
