# sweep-line events and active intervals — Big-picture orientation and mental model

## Problem and purpose

Intervals are easy to reason about one at a time but difficult when many start, end, or overlap at different coordinates. A sweep line sorts only the important coordinates, processes them in order, and maintains a compact summary of what is active at the current point or segment.

## Plain-language mental model

Imagine moving a marker from left to right along time or the x-axis. At a start event, an interval becomes relevant; at an end event, it stops being relevant. Between two consecutive event coordinates, the active set does not change. The algorithm therefore does not need to inspect every possible coordinate, including enormous gaps.

## How the parts fit together

1. Translate each object into start/end events.
2. Sort by coordinate and define what equal-coordinate events mean.
3. Update the active summary while maintaining an invariant.
4. Answer the query from that summary after all events at a coordinate are handled consistently.
5. Account for sorting and the cost of updating the active structure.

| Query | State often sufficient |
| --- | --- |
| Peak number of simultaneous intervals | Active count |
| Minimum number of meeting rooms | Min-heap of active end times |
| Accept/reject one interval | Ordered neighbors or an interval structure |
| Bloom count at query times | Start/end counts and offline query sweep |
| Visible building height | Active height multiset and maximum |

## Concept map

Endpoint semantics control event ordering. A half-open interval `[start,end)` is active after its start and inactive at its end; intervals meeting at one endpoint do not overlap. A closed interval includes both ends, so touching intervals may overlap at that point. Querying “at time t” can also differ from measuring activity on the segment immediately after t. Write the contract before choosing a tie rule.

## End-to-end walkthrough

For meetings `[0,30)`, `[5,10)`, and `[15,20)`, sort starts and place current end times in a min-heap. Before starting at time 15, pop every end time `<=15`; the meeting ending at 10 has freed its room. The long meeting ending at 30 remains, so the new meeting shares the second room. The maximum active heap size is 2.

For flowers with inclusive interval `[3,3]`, a person arriving at 3 must count the flower. In an offline query sweep, include starts `<=t` but subtract only ends `<t`; subtracting ends `<=t` would incorrectly exclude flowers blooming at their end time.

## When to use it and tradeoffs

Use a sweep when the state changes only at ordered event coordinates and the query can be answered from a maintained summary. Sorting and scanning is often O(n log n). Coordinate compression maps a sparse set of coordinates to dense ranks when arrays or trees are useful. A count-only summary cannot recover the active identities or answer arbitrary union/geometry queries; use a richer active structure when required.

## What later lessons cover

References detail tie rules, active state and heaps, coordinate compression and geometric events, and sweep invariants/costs. Six problems cover room counts, capacity, booking, maximum overlap, inclusive point queries, and skyline height.

Sources: [USACO Guide: Sweep Line](https://usaco.guide/plat/sweep-line?lang=cpp), [Car Pooling](https://leetcode.com/problems/car-pooling/), [Number of Flowers in Full Bloom](https://leetcode.com/problems/number-of-flowers-in-full-bloom/).
