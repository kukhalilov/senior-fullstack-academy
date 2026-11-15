# Fenwick trees, segment trees, and static range queries — Interview questions and reasoning

## Core questions

These tradeoffs follow the range-query overview in the [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).

1. How do you choose among prefix sums, Fenwick trees, segment trees, and sparse tables?
2. Why does a Fenwick tree use the lowest set bit?
3. What algebraic property must a segment-tree operation satisfy?
4. How does a lazy tag affect both an aggregate and a child state?
5. When may a sparse-table query use overlapping blocks?
6. Why do coordinate compression and half-open ranges help?

## Concise interview answers

1. Match the structure to whether data is static, which updates are required, and whether the aggregate supports prefix subtraction or is idempotent.
2. It determines the width and parent/child traversal of the partial prefix blocks.
3. Associativity; an identity is useful for empty/padded ranges. Commutativity is not required if order is preserved.
4. Apply its effect to the node summary immediately, store the pending tag, and push it to children before a partial descent.
5. When the operation is idempotent, such as min/max, so repeated overlap does not alter the result.
6. Compression maps known ordered keys to dense indices; half-open ranges have length `r-l` and adjacent intervals compose without endpoint overlap.

## Deep follow-up answers

**Why can Fenwick range sums use prefix subtraction?** Addition forms a group with inverses, so the sum on `[l,r]` is the prefix through `r` minus the prefix before `l`. Minimum has no inverse, so two prefix minima cannot be subtracted to recover a range minimum.

**What must be specified for lazy propagation?** A tag's effect on a node aggregate, the segment length if needed, and a composition rule for older and newer tags. For add/sum, add deltas and increase sum by `delta*length`. For assignment, the newer assignment replaces prior values. Mixed tags need chronological composition.

**Why is ordinary sparse table O(1) only for idempotent queries?** It selects two power-of-two blocks that cover the range and may overlap. Repeating elements under min/max is harmless; sum double-counts the overlap. General associative operations can use disjoint power-of-two decomposition in `O(log n)` or a disjoint sparse table for `O(1)` queries after preprocessing.

**How does coordinate compression affect comparisons?** It preserves the relative ordering of known values, not distances. For strict `<x`, query through `rank(x)-1`; for `<=x`, query through `rank(x)`. Range endpoints over original coordinates may require lower/upper bounds.

## Scenario questions

1. A student queries a sparse-table sum using two overlapping blocks. Ask for a counterexample and the correct decomposition.
2. A Fenwick update starts at index zero and loops forever. Identify the one-based internal-index invariant.
3. A lazy tree receives range add followed by assignment. Determine the correct pending tag and why update order matters.
4. A Range Module query uses `[l,r]` even though the API is `[l,r)`. Test adjacent intervals and expose the endpoint bug.

## Tradeoffs and alternatives

Prefix sums are simplest for static sums. Fenwick trees are compact for point deltas and prefix-derived aggregates. Segment trees support general associative ranges and lazy updates but require more invariants. Sparse tables provide very fast static idempotent queries with `O(n log n)` memory. For a few hundred calendar bookings, a sweep-line map may be simpler than a dynamic tree; for a known finite coordinate set, compression can replace dynamic allocation.

## Common weak answers

- Choosing a structure by name without reading the update/query contract.
- Applying range-sum subtraction to min/max.
- Claiming sparse-table overlap works for all associative operations.
- Defining a lazy tag without its effect on segment length or composition order.
- Mixing inclusive and half-open boundaries.
- Saying compression preserves coordinate distance.

## Self-check rubric

Score 0 (missing), 1 (partial), or 2 (clear and correct): structure selection; Fenwick indexing; algebraic requirements; lazy composition; sparse-table idempotence; coordinate compression; boundary discipline. A strong answer scores at least 11/14 and identifies what breaks when one assumption changes.
