# binary search, bounds, rotated arrays, and monotone answers — Reference: Search and bound variants

## Scope and version

This timeless reference covers the nine supplied sorted-search terms. Indices are zero-based; bounds use a half-open interval and return n when the boundary is after the final element.

## How this group fits the mental model

Ordered values turn comparisons into monotone predicates. Choosing the predicate precisely determines whether the result is a matching value, a first acceptable position, or a duplicate range.

## Supplied names explained

- `Exact binary search` — Search for equality in sorted data. If using a closed interval, return a matching index when found and -1 when the interval empties. With duplicates, any match is valid only if the task does not request a particular occurrence.
- `Lower bound` — First index whose value is greater than or equal to target; n if none. It is the insertion position before equal values.
- `Upper bound` — First index whose value is strictly greater than target; n if none. It is the insertion position after equal values.
- `First occurrence` — Lower bound of target, followed by an equality check. If the returned index is n or its value differs, target is absent.
- `Last occurrence` — Upper bound minus one, followed by an equality check. Guard the boundary before indexing; if upper bound is zero or the previous value differs, target is absent.
- `Left-biased midpoint` — Floor midpoint `lo+(hi-lo)/2`. It is appropriate when an update can set hi to mid and the interval still shrinks.
- `Right-biased midpoint` — Ceiling midpoint `lo+(hi-lo+1)/2`. It is useful when searching for the last true candidate with an update such as lo=mid; it prevents stalling.
- `Insertion position` — The boundary where a target can be inserted while preserving order. Lower bound inserts before equal items; upper bound inserts after equal items. Both may return n.
- `Sorted-array precondition` — Values must be ordered under the same comparison used by the search. If this precondition fails, half-discard reasoning is invalid; sorting first changes positions and costs time.

## Cross-item comparison

`Exact binary search` answers membership; `Lower bound` and `Upper bound` identify boundaries even when the target is absent. `First occurrence` and `Last occurrence` compose a bound with equality validation. Left-biased and `Right-biased midpoint` choices correspond to different retained-endpoint updates, not arbitrary style. `Insertion position` is a bound result. The `Sorted-array precondition` is required for all logarithmic elimination.

## Examples

For `[1,2,2,2,5]` and target 2, lower bound is 1 and upper bound is 4; first occurrence is 1, last occurrence is 3, count is 3. For target 4, lower bound is insertion position 4 and upper bound is also 4, but neither means 4 exists.

## Common mistakes

- Returning lower bound as a found index without checking equality.
- Using upper bound minus one when upper bound is zero.
- Returning any equal index when the task requires first/last.
- Using a floor midpoint with an update that retains mid as lower bound, causing an infinite loop.
- Searching unsorted input.
- Overflowing `lo+hi` for large numeric bounds.

## Knowledge checks with answers

1. **What is the count of target copies?** `upperBound-lowerBound`.
2. **Can lower bound return an index where target is absent?** Yes; it is an insertion boundary and must be checked for equality.
3. **When is a ceiling midpoint useful?** When the lower endpoint is retained in a last-true search.
4. **Why does sorting the input first require care?** It changes original positions and adds preprocessing cost.

Source: [USACO Guide: Binary Search](https://usaco.guide/silver/binary-search).
