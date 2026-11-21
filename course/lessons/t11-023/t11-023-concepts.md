# sweep-line events and active intervals — Core concepts and how they fit together

## Learning objectives

- Convert interval boundaries into a sorted event stream.
- Define same-coordinate handling from open, closed, or half-open semantics.
- Choose an active summary that can actually answer the query.
- Explain sort-plus-scan and active-update costs.
- Use coordinate compression when only event-coordinate order matters.

## Prerequisites

Know interval notation, sorting, heaps, ordered collections, and prefix sums. Distinguish a point at x from the open segment immediately after x.

## Core concepts

A sweep-line algorithm processes event coordinates in sorted order. Each interval creates a start and an end event. Its active-state invariant describes which intervals contribute at the current coordinate or segment. For half-open `[s,e)`, the interval contributes for `s <= x < e`; at equal x, an ending interval is no longer active when a new one starts. A grouped-delta scan can apply all changes at x and measure the state for the following segment. For closed intervals, both ends are included and a start at x may overlap an end at x.

The needed summary depends on the query. A scalar counter answers maximum overlap. A min-heap of end times releases reusable rooms. A calendar insertion may require ordered predecessor/successor checks. Skyline requires the greatest active height, not just a count. Flowers use inclusive intervals evaluated at discrete query points.

## Mechanisms and relationships

Sort events in O(n log n), then scan them in O(n). If each active update costs O(log n), include that as well. For heap-based meeting rooms, before a new start s, pop every end `<=s` under half-open semantics. For inclusive bloom queries at t, count starts `<=t` and ends `<t`.

Coordinate compression sorts unique coordinates and maps each to a rank while preserving order. It does not preserve distances: if interval length matters, retain original coordinates or gap widths. Difference events store a change at a boundary; prefix accumulation recovers the active count on the next segment.

In two-dimensional sweeps, rectangle edges become events and an active coverage structure tracks y-ranges. A segment tree over compressed y-coordinates can maintain covered length or maximum coverage, but the node invariant must match the geometric query. Merely counting active rectangles cannot compute union length or skyline.

## Worked examples

For half-open meetings `[1,4)` and `[4,7)`, process the end at 4 before treating the new meeting as active. The peak is one room. For a closed pair of intervals `[1,4]` and `[4,7]`, both contain point 4, so they overlap there; the tie rule differs.

For a rectangle `[left,right) x [bottom,top)`, a vertical sweep can add its y-coverage at left and remove it at right. Between x-events, the covered y-length is constant; area contribution is width times active covered length. This requires an active structure over y intervals, not an overlap counter.

## Misconceptions and edge cases

- Sorting by coordinate alone does not define tie semantics.
- A half-open interval's end event is not active at the end coordinate.
- Coordinate compression preserves order, not numeric distance.
- A maximum overlap count cannot identify which intervals are active.
- Large coordinate gaps do not justify allocating an array indexed by raw coordinates.
- A scan's state should be observed either at the point or after the grouped event, according to the query.

## Knowledge checks with answers

1. **Why group all same-coordinate deltas for a half-open interval count?** The resulting active count describes the open segment after that coordinate without a transient false peak.
2. **Why is a count insufficient for skyline?** The query needs the maximum active height, not just how many buildings exist.
3. **What does coordinate compression preserve?** Ordering and equality of event coordinates, but not gaps or lengths.
4. **At bloom time t, which endpoints are included?** Starts at t and ends at t are both included: starts `<=t`, ends `<t` are subtracted.

Sources: [USACO Guide: Sweep Line](https://usaco.guide/plat/sweep-line?lang=cpp), [Car Pooling](https://leetcode.com/problems/car-pooling/), [The Skyline Problem](https://leetcode.com/problems/the-skyline-problem/).
