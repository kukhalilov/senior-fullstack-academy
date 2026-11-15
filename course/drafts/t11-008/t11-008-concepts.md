# interval representations, merging, and scheduling — Core concepts and how they fit together

## Learning objectives

- Derive overlap and compatibility tests from endpoint inclusion.
- Prove the common sorting scans with invariants and exchange reasoning.
- Recognize tie-breaks that protect correctness.

## Prerequisites

Know how to compare ordered values and sort records with a comparer. Be comfortable tracing a loop invariant and reading asymptotic bounds.

## Core concepts

An interval is described by ordered endpoints and a rule about endpoint inclusion. The objective determines whether to unite ranges, choose a compatible subset, or intersect ordered streams.

## Mechanisms and relationships

## Endpoint semantics

For closed intervals `[a,b]` and `[c,d]`, they overlap exactly when `max(a,c) <= min(b,d)`. Thus touching endpoints count. For half-open `[a,b)` and `[c,d)`, nonempty overlap requires `max(a,c) < min(b,d)`; touching alone is disjoint. Open/closed mixtures require comparing whether the shared endpoint is included by both. Do not carry a `<=` test into a problem whose semantics say touching intervals are compatible.

An empty interval may be permitted in a general interval library (for example `[x,x)` is empty), but particular problems can require `start < end` or allow `start == end`. Follow their contract; do not silently discard zero-length ranges if the statement allows them.

## Merge by start

Sort by start. Keep a current interval `[L,R]`. If the next start is at most R for closed intervals, extend R to `max(R,nextEnd)`; otherwise emit the current range and begin another. The invariant is that emitted intervals are sorted and pairwise disjoint and the current interval is exactly the union of the processed final connected component. Touching is merged for closed intervals, but not necessarily for half-open ones.

## Insert into an ordered disjoint list

Given sorted disjoint intervals and a new closed interval, emit ranges strictly before it (`end < newStart` under shared-endpoint overlap). Absorb every range whose start is at most the evolving new end; update both new bounds. Append the merged range, then the untouched suffix. The evolving end matters because absorbing one interval can make a later interval overlap too.

## Earliest-finish scheduling

To maximize the number of non-overlapping intervals with equal value, sort by finish ascending. Accept an interval when its start is at least the previous accepted finish for the touching-compatible convention. Why optimal? Let G be the earliest-finishing interval and O the first interval in any optimal schedule. Since `finish(G) <= finish(O)`, replacing O with G leaves at least as much room for every later interval. Repeating the exchange yields an optimal schedule beginning with the greedy choice. Minimum removals equals n minus this maximum compatible count.

## Minimum arrows and interval intersections

For closed balloon intervals, sort by end and place an arrow at the smallest end in the remaining group. Any interval starting after that point cannot be burst by this arrow; every interval starting at or before it can. Maintain the rightmost point common to the group, shrinking it as intervals are visited. If an interval starts beyond the current intersection, a new arrow is necessary. For two sorted disjoint lists, emit `[max(starts), min(ends)]` when nonempty, then advance the interval with the smaller end; it cannot intersect a later interval in the other list.

## Removing covered intervals and tie-breaking

Sort by start ascending and, for equal starts, end descending. This places the widest interval first among equal starts, so a later interval with the same start cannot be mistakenly counted as uncovered. Track the greatest end seen. If the current end is no larger, the current interval is covered; otherwise count it and update the farthest end. For unique half-open intervals the containment test remains `priorStart <= currentStart && currentEnd <= priorEnd`.

## Complexity and numeric safety

Sorting arbitrary input generally dominates at O(n log n); the scan is O(n). Already sorted lists may be processed in O(n). Comparators should avoid subtraction (`a[0]-b[0]`) because it can overflow for full-width signed endpoints; use `CompareTo` or relational comparisons. When midpoint or endpoint arithmetic is involved, consider the stated numeric range. Stable sorting is unnecessary if all tie-break keys are explicit; stability cannot replace a required tie-break.

## Worked examples

For closed intervals `[1,2]` and `[2,3]`, equality makes them overlap. For scheduling, the same problem family may explicitly define touching as compatible, so accepting the second range is valid. For insertion, an expanding new end can absorb a later interval that was not initially overlapping.

## Misconceptions and edge cases

- Using one overlap predicate for closed and half-open intervals.
- Merging compatible scheduling intervals when the objective counts touching endpoints as non-overlapping.
- Sorting by start for maximum-cardinality scheduling and assuming it is optimal.
- Forgetting descending end tie-break when starts match in coverage counting.
- Updating an overlap intersection with `max(end)` where it must shrink with `min(end)`.
- Advancing both pointers in interval-list intersections without proof; advancing the earlier-ending range is sufficient.

Sources: [USACO Guide: Greedy with Sorting](https://usaco.guide/silver/greedy-sorting), [USACO Guide: Problem-Analysis Paradigms](https://usaco.guide/PAPS.pdf).

## Knowledge checks with answers

1. **What is the first decision before coding an overlap predicate?** Determine which endpoints are included.
2. **Which sort key supports maximum compatible count?** End ascending.
3. **Why use descending end for equal starts in covered-interval counting?** It makes the containing interval precede contained ones.
