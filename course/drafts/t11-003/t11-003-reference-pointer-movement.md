# two-pointer and sliding-window techniques — Reference: Pointer arrangements and movement invariants

## Scope and version

This timeless reference covers the six supplied arrangements and movement rules. Examples use zero-based array indices; problem statements may request one-based output indices.

## How this group fits the mental model

A pointer marks a candidate position or boundary. The algorithm is correct only when an invariant explains what remains possible and why a moved pointer can be forgotten.

## Supplied names explained

- `Opposite-direction pointers` — Begin at opposite ends and move inward. In a sorted pair-sum scan, endpoint order proves which endpoint cannot belong to a solution. In palindrome checking, compare symmetric characters and stop at the center. These use different proof properties despite sharing a shape.
- `Same-direction pointers` — Move from left to right, often at different rates. The read/write form scans each input item and maintains a boundary; a merge form advances through one of two sequences. Monotone movement bounds total advances.
- `Read/write compaction pointers` — Read visits each source element; write identifies the next retained slot. Maintain that the prefix before write contains exactly the retained values encountered so far, in original order. Since write never exceeds read, writing cannot damage unexamined input.
- `Two-pointer merge` — Compare current elements of two sorted inputs, emit or consume the selected one, and advance its source pointer. Continue with the remaining suffix once one input ends. A newly allocated merged output uses O(n+m) space even though the scan uses O(1) pointer state.
- `Sorted-input elimination rule` — For sorted candidates, an endpoint comparison can prove that one endpoint cannot participate in any remaining answer. Too-small pair sums discard the low endpoint; too-large sums discard the high endpoint. Confirm the objective and order support that bound before applying the rule.
- `Duplicate skipping after sorting` — Skip repeated values at a fixed anchor and after a found value-combination to avoid outputting duplicate tuples. Apply only when answers are identified by values; equal-valued positions can still be distinct answers in index-based tasks.

## Cross-item comparison

`Opposite-direction pointers` often pair candidates; `Same-direction pointers` advance through data in one direction. `Read/write compaction pointers` specialize the latter with an output prefix; `Two-pointer merge` coordinates two inputs. `Sorted-input elimination rule` is a proof used by some opposing scans, not a pointer arrangement. `Duplicate skipping after sorting` is a result de-duplication policy, not a universal movement rule.

## Examples

For `[1,4,7]` and `[2,3]`, a merge compares heads and emits `1,2,3,4`; when the second input ends, append `7`. For stable filtering of `[0,5,0,2]`, a read/write scan produces valid prefix `[5,2]`; the suffix is unspecified unless the contract asks to fill it.

## Common mistakes

- Moving both pair pointers when only one endpoint has been proved impossible.
- Omitting the remaining suffix in a merge.
- Writing beyond the read pointer during in-place compaction.
- Skipping equal values in an index-pair task where equal values at separate positions matter.
- Calling a scan linear while performing an unbounded rescan inside each iteration.

## Knowledge checks with answers

1. **What protects unread values during compaction?** write never passes read and the retained prefix invariant is maintained.
2. **Why does endpoint elimination require sorted values?** Sorted order bounds every candidate involving that endpoint.
3. **Does a merged output count as auxiliary storage?** Yes; a new output array/list requires O(n+m) space.
4. **When may duplicate skipping change the answer set?** When different indices, rather than value-tuples, are distinct answers.

Source: [USACO Guide: Two Pointers](https://usaco.guide/silver/two-pointers).
