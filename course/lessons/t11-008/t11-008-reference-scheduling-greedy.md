# interval representations, merging, and scheduling — Reference: Interval scheduling and overlap removal

## Scope and version

This lesson explains the seven supplied maximum-cardinality scheduling and equal-cost removal concepts.

## How this group fits the mental model

When selecting the largest compatible subset, make the current schedule finish as early as possible. This leaves a superset of future choices. It is a greedy selection problem, not an interval-union problem.

## Supplied names explained

- `Maximum-cardinality interval scheduling` — Choose the largest number of pairwise compatible intervals.
- `Earliest-finish-time greedy rule` — Sort by end ascending and accept a range if its start is at least the last selected end for touching-compatible closed intervals.
- `Compatibility by endpoint convention` — Decide whether equality is permitted; the Non-overlapping Intervals problem explicitly allows touching.
- `Exchange argument` — Replace the first interval of an optimal solution with the greedy earliest-finishing one; the replacement cannot reduce room for the remaining schedule.
- `Minimum removals for non-overlapping intervals` — With equal removal cost, retain a maximum compatible subset and remove the rest: `n - kept`.
- `Greedy counterexample testing` — Try nested intervals, equal starts, equal ends, duplicates, and touching boundaries to expose incorrect sort keys or predicates.
- `Tie-breaking for equal finish endpoints` — Any deterministic tie order among equal ends is safe for maximum cardinality when compatibility uses only the finish boundary; explicit tie-breaks can aid reproducibility.

## Cross-item comparison

Selecting one earliest-ending interval minimizes the blocking boundary. By contrast, merging intervals maximizes covered extent and can consume many ranges into one. The visual similarity of sorted scans hides a different objective and invariant.

## Examples

For `[1,2],[2,3],[1,3]`, accept `[1,2]`, then `[2,3]`, because touching is allowed. Remove the longer `[1,3]`; one removal is optimal. Earliest-start selection could choose `[1,3]` first and leave only one interval.

## Common mistakes

- Sorting by start rather than earliest finish for maximizing compatible count.
- Using strict `start > lastEnd` where touching is allowed.
- Applying this greedy rule when intervals have different weights or removal costs.
- Equating “remove overlaps” with merging ranges.
- Forgetting that duplicate identical nonempty intervals conflict with each other.

## Knowledge checks with answers

1. **Why choose earliest finish?** It leaves the most remaining time for future choices.
2. **How many removals?** Total intervals minus the maximum compatible count.
3. **Can this solve weighted scheduling?** No; value differences require a different method, often dynamic programming.
4. **What does endpoint equality do here?** The source problem says touching ranges are non-overlapping, so equality is compatible.

Source: [USACO Guide: Greedy with Sorting](https://usaco.guide/silver/greedy-sorting), [LeetCode: Non-overlapping Intervals](https://leetcode.com/problems/non-overlapping-intervals/).
