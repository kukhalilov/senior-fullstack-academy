# comparison sorting algorithms and selection — Reference: Order statistics and sorting contracts

## Scope and version

This lesson explains the nine supplied selection, comparator, and sort-contract terms.

## How this group fits the mental model

Sorting determines every rank; selection determines only a target rank. A comparator defines the order being requested, so its consistency is part of correctness rather than a cosmetic detail.

## Supplied names explained

- Quickselect — Partitions around pivots and continues only into the region containing the target rank.
- Kth order statistic — The value at a specified rank in sorted order; duplicates occupy separate ranks.
- Expected linear selection — Randomized quickselect has expected O(n) work under the random-pivot model.
- Worst-case quadratic selection — Repeatedly poor partitions can reduce one element at a time, causing O(n²).
- Comparator consistency — Comparison outcomes must form a strict weak ordering (including transitivity of both “comes before” and equivalence); violating a sorting API's comparator contract can make results invalid or behavior undefined, depending on the API.
- Descending order — Reverse the comparator's sign safely or compare operands in reversed argument order; do not negate arbitrary Int32 values because MinValue cannot be negated.
- Sort stability requirement — Decide whether equal-key records must retain prior order; if so, select a stable algorithm or encode a unique tie key.
- Partial sorting — Arrange enough of a range to answer a limited rank/query without fully ordering all elements.
- Sorting versus selection — Full sort costs O(n log n) and supports all ranks; selection is expected O(n) for one rank but leaves other elements unordered.

## Cross-item comparison

For kth largest, target ascending index n-k. Sorting is simplest and deterministic; quickselect is preferable when only one rank is needed and expected behavior is acceptable. A bounded heap offers O(n log k) and is attractive for streaming or when k is small.

## Examples

In [3,2,3,1,2,4,5,5,6], the fourth largest is 4. Sorting and indexing uses ascending index 9-4=5; the value at index 5 is 4. Equal fives count as separate ranks.

## Common mistakes

- Targeting k rather than n-k for a zero-based ascending array.
- Deduplicating before selection and thereby changing the rank semantics.
- Sorting the entire input while claiming linear selection complexity.
- Assuming expected O(n) means worst-case O(n).
- Negating values to reverse a comparator when a value could be Int32.MinValue.

## Knowledge checks with answers

1. **What index is kth largest?** n-k in ascending zero-based order.
2. **Does quickselect sort both sides?** No; it only explores the target side.
3. **What if many ranks are needed?** Full sorting may be simpler and competitive.
4. **Why must comparators be transitive?** Sorting algorithms rely on a coherent strict ordering.

Source: [USACO Guide: Custom Comparators and Coordinate Compression](https://usaco.guide/silver/sorting-custom).
