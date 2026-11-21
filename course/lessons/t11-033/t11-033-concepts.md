# Fenwick trees, segment trees, and static range queries — Core concepts and how they fit together

## Learning objectives

Choose a range structure from its update/query contract, derive Fenwick prefix operations, define a segment-tree combine and identity, explain lazy-tag composition, use sparse tables only under correct operation properties, and make indexing conventions explicit.

## Prerequisites

You should know arrays, prefix sums, recursion or iterative trees, and logarithmic complexity. An associative operation satisfies `(a⊗b)⊗c = a⊗(b⊗c)`; a monoid also has an identity `e` such that `e⊗a=a⊗e=a`.

For a broader treatment of range-query structures, see the [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).

## Core concepts

**Range conventions.** An inclusive array range `[l,r]` contains both endpoints; a half-open range `[l,r)` includes `l` but excludes `r`. Half-open ranges have length `r-l` and make adjacent intervals compose cleanly. Convert deliberately when an API or problem uses another convention.

**Fenwick tree.** A one-based tree cell `tree[i]` stores a block of length `lowbit(i)`, where `lowbit(i)=i&(-i)`. Updating index `i` advances by `lowbit(i)`; querying a prefix retreats by it. Point delta updates and prefix sums take `O(log n)`. A sum on `[l,r]` is `prefix(r)-prefix(l-1)`. The subtraction depends on an invertible aggregate; arbitrary min queries cannot use this formula.

**Segment tree.** Each node stores an aggregate for an interval. Combining child values must match the problem's associative operation. A point update changes one leaf and recomputes ancestors; a range query decomposes its range into `O(log n)` fully covered nodes. For non-power-of-two `n`, either use recursive intervals or pad an iterative tree with the operation identity.

**Lazy propagation.** A node stores an aggregate plus a deferred update tag representing work not yet sent to children. `apply(tag,nodeAggregate,length)` updates the aggregate; `compose(newTag,oldTag)` represents applying old then new. For range-add/range-sum, aggregate increases by `delta*segmentLength`; tags add. For range assignment, the new assignment replaces any older pending assignment. Mixed add/assign requires a carefully ordered composition.

**Sparse table.** Precompute answers for every interval of length `2^k`. For idempotent operations (`x⊗x=x`) such as min/max, a query of length `L` combines two blocks of size `2^floor(log2 L)` covering the endpoints; overlap is harmless. Sum is not idempotent, so this overlapping query would count overlap twice. A disjoint sparse table supports static associative operations with `O(1)` queries using a different construction.

## Mechanisms and relationships

Prefix sums, Fenwick trees, and segment trees all reuse partial aggregates. Prefix sums optimize immutable sums, Fenwick structures update a compact hierarchy of prefix blocks, and segment trees organize explicit intervals. Coordinate compression sorts distinct known coordinates and maps them to dense indices; preserve whether compressed positions represent points or gaps between coordinates. A dynamic segment tree allocates nodes only along visited paths in a huge domain, using `O(Q log C)` nodes for `Q` operations over coordinate width `C` in the common point/path pattern.

For range coverage, interval maps can be simpler than a lazy tree if the number of disjoint intervals remains small. For maximum overlap of a small number of bookings, sweep-line endpoint deltas may be simpler than a tree. Select the data structure from constraints and operation semantics, not from topic labels.

## Worked examples

For a one-based Fenwick index `i=12` (`1100`), `lowbit=4`; that cell covers four entries ending at 12. Update at index 5 visits 5,6,8,16,... because each step jumps by the low bit of the current index. Prefix query at 13 visits 13,12,8,... and sums disjoint blocks that partition the prefix.

For range add +2 on three values whose node sum is 10, the node aggregate becomes `10 + 2*3 = 16`, and its pending add tag becomes 2. If a later assignment to 7 arrives, the aggregate becomes 21 and the pending assignment supersedes the old add.

## Misconceptions and edge cases

- Fenwick's internal indexes are commonly one-based even if problem input is zero-based.
- Range-sum subtraction does not generalize to min/max.
- Segment-tree combine must be associative; query fragments are combined in order for noncommutative operations.
- Lazy-tag composition order matters; assignment and addition do not commute.
- Sparse-table overlap is safe only for idempotent operations.
- Non-power-of-two tree sizes and neutral padding values need deliberate handling.
- Coordinate compression preserves order, not numeric distance; range endpoints may need lower/upper-bound conversion.
- Empty ranges and out-of-domain updates should be handled according to the problem contract.

## Knowledge checks with answers

1. **Why can Fenwick answer sums on `[l,r]`?** Sum supports inverse subtraction, so subtract the preceding prefix.
2. **Why can sparse-table min use overlapping blocks?** Minimum is idempotent, so repeated overlap does not change the result.
3. **What must a lazy tag define?** Its effect on a node aggregate and how it composes with an older pending update.
4. **Does coordinate compression preserve gaps?** No; it preserves order of listed coordinates, not their original distances.
