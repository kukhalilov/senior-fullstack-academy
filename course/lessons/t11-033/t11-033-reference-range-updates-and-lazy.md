# Fenwick trees, segment trees, and static range queries — Reference: Range updates and lazy propagation

## Scope and version

This lesson describes lazy segment trees and sparse dynamic trees at the level of the supplied inventory. A full “segment tree beats” implementation is outside scope. See [USACO Guide range queries](https://usaco.guide/gold/PURS) and [USACO Guide sparse segment trees](https://usaco.guide/plat/sparse-segtree?lang=cpp).

## How this group fits the mental model

Without lazy propagation, updating every element in a range may cost linear time. A lazy node records the effect on its whole interval and postpones distributing that work until a later operation needs child detail. Correctness depends on the aggregate update and tag composition laws.

## Supplied names explained

- **Range update** — Applies a change to every value or position in an interval, such as add `d`, assign `x`, or flip bits. Its effect on stored aggregates must be computable.
- **Lazy tag** — A compact description of a deferred update attached to a node. The tag represents all updates affecting the node that have not yet been sent to its children.
- **Push deferred update** — Before descending from a tagged node, apply its tag to both children and clear it from the parent, preserving the represented values.
- **Apply tag to aggregate** — Update a node summary without visiting leaves. For range-add/range-sum, `sum += delta*length`; for range assignment to `x`, `sum=x*length`.
- **Compose lazy tags** — Combine a newer update with an older deferred one in execution order. For add tags, add deltas. For assignment, the newer assignment replaces older pending changes. If tags combine add and assign, represent the order explicitly; the operations do not commute.
- **Range add and range sum** — A canonical example: add `d` to a fully covered interval and increase its sum by `d*segmentLength`; partial overlaps push then recurse and recombine.
- **Range assign and range sum** — Assign every value to `x`; a covered segment sum becomes `x*segmentLength`. A later assignment overrides earlier pending assignment/add effects when applied after them.
- **Segment tree beats boundary (orientation only)** — A specialized technique for updates such as range `chmin` with range sums, storing extra extrema and counts and descending only when node summaries cannot safely apply the update. It has stricter invariants and amortized proofs; this inventory only orients the learner.
- **Sparse/dynamic segment tree** — A segment tree over a huge coordinate universe that allocates a node only when an operation visits it. Missing children represent a default aggregate. It suits online sparse coordinates when compression cannot be done in advance.
- **O(Q log coordinate range) sparse storage** — With `Q` point/path operations, each can create at most one node per tree level, yielding `O(Q log C)` created nodes for coordinate width `C`, plus roots and bookkeeping. Range operations may visit more nodes; state the operation model.

## Cross-item comparison

Range add and range assign have different tag composition: add then assign leaves only the assignment; assign then add is an assignment plus a later delta. A dense tree allocates all nodes up front and has predictable indexing. A dynamic tree saves space for sparse visits but uses pointers/references and allocates up to logarithmically many nodes per visited path.

## Examples

For node sum 12 over length 4, a pending range add of 3 makes the aggregate 24 (`12+3*4`). If a range assignment to 5 then arrives, the aggregate becomes 20; its tag supersedes the old add because the assignment is newer. Reversing the operations would give `12` only if the assignment applies to all four values and the later add has not yet occurred; with assignment to 5 then add 3, the final sum would be 32.

## Common mistakes

- Updating a node sum by `delta` instead of `delta*length`.
- Pushing a tag but forgetting to clear it, causing duplicate application.
- Composing assignment and addition in the wrong chronological order.
- Applying a tag to a child without knowing its segment length.
- Claiming `O(Q log C)` dynamic-node space for arbitrary range recursion without bounding visited nodes.
- Using segment tree beats without its required node invariants and amortized argument.

## Knowledge checks with answers

1. **What sum change does range-add `d` cause on a segment of length `L`?** `d*L`.
2. **Which tag wins when a new assignment arrives after an old pending add?** The new assignment, because it overwrites prior values.
3. **Why can a dynamic tree use less space?** It materializes only coordinate paths actually visited.
