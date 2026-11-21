# Fenwick trees, segment trees, and static range queries — Reference: Sparse tables and choosing a range structure

## Scope and version

This lesson compares static sparse tables and common alternatives. See [CSES Static Range Minimum Queries](https://cses.fi/problemset/task/1647/) and [Competitive Programmer's Handbook range queries](https://usaco.guide/CPH.pdf).

## How this group fits the mental model

Static structures spend preprocessing and storage so queries need little work. Sparse tables store every power-of-two interval. Their fastest overlapping-block query depends on idempotence; static data alone does not make every aggregate safe to overlap.

## Supplied names explained

- **Sparse table** — A table `st[k][i]` stores the aggregate of the interval starting at `i` with length `2^k`. Preprocessing is `O(n log n)` time and memory.
- **Power-of-two interval precomputation** — Level zero stores single values; level `k` combines two adjacent level `k-1` blocks to form length `2^k`.
- **Idempotent operation** — An operation where `x⊗x=x`; minimum and maximum are examples. This property makes duplicate overlap harmless.
- **O(1) static min/max query** — For range length `L`, choose `k=floor(log2 L)` and combine blocks `[l,l+2^k)` and `[r-2^k,r)`. They cover the range and may overlap; idempotent min/max remains correct.
- **O(log n) non-idempotent query by disjoint power-of-two intervals** — For a general associative operation that is not idempotent, an ordinary sparse table can decompose a range into disjoint power-of-two intervals and combine `O(log n)` entries. A distinct disjoint sparse table precomputes suffix/prefix aggregates around block boundaries and answers general associative queries in `O(1)` after `O(n log n)` preprocessing; do not conflate these structures.
- **Static versus dynamic data** — Static means values do not change after preprocessing. Updates generally require rebuilding or selecting a dynamic structure such as Fenwick/segment tree.
- **Prefix sums for static sums** — Store cumulative sums; answer inclusive `[l,r]` as `prefix[r+1]-prefix[l]` in `O(1)` after `O(n)` build. Values can be negative; an identity is unnecessary for subtraction.
- **Fenwick versus segment tree** — Fenwick is compact for point updates and prefix aggregates with inverse/range conversion. Segment trees handle general associative range aggregates and richer lazy updates at greater implementation cost.
- **Range minimum query** — Find `min(a[l..r])`; static sparse tables answer in `O(1)`, while dynamic updates typically call for a segment tree.
- **Inclusive versus half-open indices** — Inclusive `[l,r]` has length `r-l+1`; half-open `[l,r)` has length `r-l`. Prefix sums, tree recursion, and external query formats must use a consistent convention.

## Cross-item comparison

Ordinary sparse tables give `O(1)` queries for idempotent operations by overlapping blocks; for general associative operations, disjoint blocks can be combined in `O(log n)`. Disjoint sparse tables are a distinct structure that can answer a general associative query in `O(1)` after preprocessing. Prefix sums are simpler and faster to build for sums; Fenwick trees add point-update support; segment trees support broad updates and aggregates.

## Examples

For the CSES array `[3,2,4,5,1,1,5,3]`, one-based inclusive RMQ `[5,6]` has minimum 1. Convert to zero-based inclusive `[4,5]` or half-open `[4,6)` before indexing; clearly record which convention your table uses.

## Common mistakes

- Using overlapping sparse-table blocks for sum or concatenation.
- Calling ordinary sparse table and disjoint sparse table the same construction.
- Forgetting that a static table must be rebuilt after a point update.
- Mixing one-based statement positions with zero-based arrays.
- Using `prefix[r]-prefix[l]` for an inclusive range when the prefix array is indexed by element positions rather than prefix lengths.

## Knowledge checks with answers

1. **Why can min use overlapping blocks?** Min is idempotent.
2. **How do ordinary sparse tables answer general associative queries?** Combine disjoint power-of-two blocks, typically `O(log n)` pieces.
3. **What does a disjoint sparse table improve?** Static general associative queries to `O(1)` after `O(n log n)` preprocessing.
