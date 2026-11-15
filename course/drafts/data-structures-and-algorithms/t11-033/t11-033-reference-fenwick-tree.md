# Fenwick trees, segment trees, and static range queries — Reference: Fenwick tree / binary indexed tree

## Scope and version

This lesson covers additive Fenwick operations and their standard one-based representation. See [USACO Guide point updates and range sums](https://usaco.guide/gold/PURS) and [Competitive Programmer's Handbook range queries](https://usaco.guide/CPH.pdf).

## How this group fits the mental model

A Fenwick tree partitions prefixes into blocks whose sizes are powers of two. The lowest set bit selects each block's width and determines which cells a query or update visits.

## Supplied names explained

- **Fenwick tree** — An array structure that stores partial prefix aggregates. For sums, point delta updates and prefix queries each take `O(log n)`.
- **Binary indexed tree (BIT)** — Another name for a Fenwick tree, not a separate structure.
- **Lowest set bit** — `lowbit(i)=i&(-i)` for positive one-based index `i`; it gives the length of the block represented by `tree[i]`.
- **Point update** — To add `delta` at zero-based position `index`, start `i=index+1`; while `i<=n`, add delta to `tree[i]` and advance `i += lowbit(i)`.
- **Prefix aggregate query** — To sum first `count` elements, start `i=count`; add `tree[i]` and retreat `i -= lowbit(i)` until zero. This decomposition visits disjoint blocks.
- **Range sum by prefix subtraction** — Inclusive `[left,right]` sum is `prefix(right+1)-prefix(left)`, using prefix lengths; the subtraction relies on additive inverses.
- **One-based internal indexing** — External zero-based position `k` maps to internal index `k+1`; prefix length `count` maps directly to internal starting index `count`.
- **O(log n) update and prefix query** — Each low-bit step removes or adds at least one set bit, so at most logarithmically many cells are visited.
- **Build from initial values** — Repeated point updates cost `O(n log n)`; an `O(n)` build can initialize cells and propagate each block to its parent. Verify the exact build variant against the chosen indexing.
- **Coordinate compression for indexed values** — Sort distinct known keys and map each to a dense rank, then store frequencies or sums in a Fenwick tree. Use lower/upper bounds to distinguish `<x` from `<=x` and retain original ordering.

## Cross-item comparison

Fenwick uses less code and memory than a general segment tree for point updates and invertible prefix aggregates such as sum or count. It cannot directly answer arbitrary min ranges or support every range update. Coordinate compression changes the index universe while the Fenwick tree still operates on ranks.

## Examples

For values `[1,3,5]`, Fenwick prefix lengths are 1, 4, and 9. Updating index 1 from 3 to 2 applies delta -1; the total prefix becomes 8. Inclusive range `[1,2]` is prefix length 3 minus prefix length 1, or `8-1=7`.

## Common mistakes

- Calling update with zero-based index directly, causing index zero to loop forever.
- Querying `prefix(right)` instead of `prefix(right+1)` for inclusive endpoints.
- Using prefix subtraction for an operation without inverses.
- Updating by a new value instead of by `newValue-oldValue` in a sum tree.
- Mishandling duplicate values after coordinate compression.

## Knowledge checks with answers

1. **What is the internal index of external position zero?** One.
2. **What is the inclusive range sum formula using prefix lengths?** `prefix(r+1)-prefix(l)`.
3. **Why does update advance by `lowbit(i)`?** The next affected Fenwick block is the next ancestor interval containing that index.
