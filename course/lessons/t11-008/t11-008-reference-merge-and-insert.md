# interval representations, merging, and scheduling — Reference: Merging and inserting intervals

## Scope and version

This lesson explains the eight supplied sort, merge, and insertion operations for one-dimensional intervals.

## How this group fits the mental model

Sorting by start turns a global coverage problem into a scan with one active output interval. If the input is already sorted and disjoint, insertion can avoid sorting entirely.

## Supplied names explained

- `Sort by start endpoint` — Establish nondecreasing starts so no unseen interval can begin before the current one.
- `Merge overlapping intervals` — Replace a connected run under the chosen overlap convention with one interval covering their union.
- `Extend merged end` — For closed ranges, update current end to `max(currentEnd,nextEnd)` when the next start is at most current end.
- `Insert interval into sorted disjoint list` — Add one range while retaining order and disjointness.
- `Emit intervals before overlap region` — Append intervals that end strictly before the new start when equality is considered overlap.
- `Merge overlap region` — Expand the inserted range to include each overlapping interval; the expanding end can pull in additional later ranges.
- `Emit intervals after overlap region` — Append the untouched suffix once the next start is beyond the merged end.
- `In-place output compaction` — Write merged output into the front of an array while maintaining a write index; ensure unread inputs are not overwritten before being read.

## Cross-item comparison

General Merge Intervals sorts arbitrary input, usually O(n log n). Insert Interval assumes an already sorted disjoint list and takes O(n) time. The two tasks share endpoint predicates but not the same preconditions or setup cost.

## Examples

Closed `[1,3]`, `[2,6]`, `[8,10]`: extend first end to 6, then emit before starting `[8,10]`. In insertion, insert `[4,8]` into `[1,2],[3,5],[6,7],[8,10],[12,16]`; successive absorption expands the new range through `[3,10]`.

## Common mistakes

- Updating the merged end to the next end rather than its maximum, which can shrink coverage.
- Using `next.Start < current.End` when the problem treats closed touching ranges as overlap.
- Forgetting the insertion range expands while absorbing intervals.
- Sorting an already ordered insertion input unnecessarily and ignoring its stated invariant.
- Writing compacted output over unprocessed input.

## Knowledge checks with answers

1. **Why sort by start?** Every future interval starts no earlier than the current scan item.
2. **Why use maximum end on merge?** The union must cover both intervals.
3. **When does insertion stop absorbing?** Once the next start is beyond the evolving merged end under the problem's endpoint rule.
4. **What does in-place compaction require?** A write position that never overtakes unread values.

Source: [LeetCode: Merge Intervals](https://leetcode.com/problems/merge-intervals/), [LeetCode: Insert Interval](https://leetcode.com/problems/insert-interval/).
