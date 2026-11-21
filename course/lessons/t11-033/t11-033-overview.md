# Fenwick trees, segment trees, and static range queries — Big-picture orientation and mental model

## Problem and purpose

Range-query problems ask for information about subarrays or coordinate intervals: a sum, minimum, count, or coverage state. Repeatedly scanning each range can be too slow, especially when values change between queries. Range data structures organize partial answers so updates and queries reuse work.

The general range-query framing appears in the [Competitive Programmer's Handbook range-query chapter](https://usaco.guide/CPH.pdf).

## Plain-language mental model

Instead of remembering every possible range, store answers for carefully chosen chunks. A query combines a small number of chunks. An update changes only the chunks that contain the changed position. Each structure chooses different chunks and supports different operations.

## How the parts fit together

Static prefix sums store cumulative totals and answer range sums in constant time but require rebuilding after a change. A Fenwick tree stores overlapping prefixes selected by the lowest set bit, supporting point changes and prefix aggregates compactly. A segment tree stores an aggregate per interval and supports broader associative operations and point updates. Lazy propagation defers range updates to avoid visiting every element. Sparse tables precompute power-of-two intervals; overlapping blocks give constant-time queries when the operation is idempotent, such as min or max.

Coordinate compression maps known values to dense ranks while preserving ordering. Dynamic segment trees create nodes only for visited parts of a huge coordinate range. The correct choice depends on whether data is static, which updates exist, the aggregate's algebra, and numeric/index bounds.

## Concept map

| Need | Common choice | Update/query shape |
|---|---|---|
| Static range sum | Prefix sums | Build `O(n)`, query `O(1)` |
| Point update + prefix/range sum | Fenwick tree | Update/query `O(log n)` |
| Point update + associative range aggregate | Segment tree | Update/query `O(log n)` |
| Range updates + aggregate | Lazy segment tree | Usually `O(log n)` per operation |
| Static range min/max | Sparse table | Build `O(n log n)`, query `O(1)` |
| Huge sparse coordinates | Coordinate compression or dynamic tree | Depends on known vs online coordinates |

## End-to-end walkthrough

For an array `[1,3,5]`, a point update changes index 1 from 3 to 2, then an inclusive query asks for indices `[0,2]`. A Fenwick tree stores partial sums; updating index 1 adds `-1` to all tree nodes covering it. The total becomes 8. A prefix difference answers the range because sum is invertible: `prefix(2)-prefix(-1)` (or, in one-based Fenwick indexing, two prefix queries). A range minimum cannot use subtraction, so it calls for a different aggregate structure.

## When to use it and tradeoffs

Choose prefix sums for static additive data. Choose Fenwick for compact point-delta updates with prefix/range sums or counts. Choose a segment tree when the combine operation is associative but not necessarily invertible, or when updates/ranges are more general. Lazy propagation requires a precise mapping from updates to aggregates and a composition rule for pending updates. Choose sparse tables for static idempotent queries; their `O(1)` query combines two potentially overlapping blocks, which is safe for min/max but not sum.

## What later lessons cover

Concepts establish interval conventions, identities, associativity, and operation selection. Reference lessons detail Fenwick trees, segment trees, lazy updates, and sparse tables. Practice applies updates, coordinate compression, dynamic coverage, overlap counts, range-sum counting, reverse-pair counting, static RMQ, and insertion-cost counts.
