# sweep-line events and active intervals — Interview questions and reasoning

## Core questions

1. What makes a sweep line more efficient than checking every pair of intervals?
2. Why must endpoint semantics be clarified before sorting events?
3. When can a scalar active counter answer the query?
4. Why does Meeting Rooms II pop all end times at or before a new start?
5. How do inclusive bloom intervals differ from half-open meetings?
6. What does coordinate compression preserve and discard?
7. Why is an active height multiset needed for skyline?

## Concise interview answers

- A sweep processes only event coordinates; sorting costs O(n log n), then a linear scan maintains a sufficient summary.
- Equal-coordinate order determines whether touching intervals overlap. Half-open `[s,e)` releases at e; a closed interval includes e.
- A counter answers aggregate concurrency. Identity, max height, or covered length requires richer state.
- Several meetings may end before the new start, and each should free a room. Half-open adjacency makes `end<=start` reusable.
- Flowers are inclusive, so count `start<=t` and subtract only `end<t`. Meetings are typically half-open, so `end<=start` allows reuse.
- Compression preserves coordinate order/equality but not distances.
- Skyline's visible height is the greatest active building height; count alone cannot identify it, and duplicate heights need multiplicity.

## Deep follow-up answers

### What is the sweep invariant?

State whether it describes objects active at the coordinate, immediately after all events there, or on the segment to its right. For grouped half-open deltas, after applying all changes at x, the prefix count is the active population on `[x,nextX)`. For point queries with closed intervals, membership is checked directly at t.

### How do you prove a room count is minimal?

At a moment with p simultaneous meetings, p separate rooms are necessary. A min-heap allocation reuses every room whose end is no later than the next start, so it never allocates a new room while one is free. It therefore uses exactly the peak concurrency and is sufficient.

### What changes for geometric area?

The event coordinate is often x. The active structure must represent coverage across y, such as covered length in a segment tree over compressed elementary intervals. Multiply the constant covered y-length by the next x-gap. Compression ranks alone are not physical distances.

## Scenario questions

### Two meetings share an endpoint

Ask whether intervals are half-open. If `[1,3)` and `[3,5)`, release at 3 before allocating the second. If the contract is closed `[1,3]`, both include point 3 and overlap at that instant.

### A calendar booking is rejected

Check the predecessor and successor in start order. For half-open intervals, overlap occurs when `newStart < oldEnd && oldStart < newEnd`. Return before insertion so rejection leaves state unchanged.

### A skyline heap reports a height whose building ended

Track active multiplicity by height and lazily remove heap tops whose active count is zero. Process all starts and ends at x before emitting one key point.

## Tradeoffs and alternatives

- Event sorting handles sparse, large coordinate ranges; a direct difference array can be faster when the range is small and dense.
- A heap is useful when the smallest end or greatest height is needed; it does not replace a range-coverage segment tree.
- Offline query sorting can answer many point queries in one sweep; binary search is simpler for a small number of independent queries.
- A scalar counter minimizes state but cannot answer identity or rank queries.

## Common weak answers

- “Sort starts and ends” without saying which equal-time event is applied first.
- “Use a counter for active intervals” when the requested output is a maximum height or union length.
- “Coordinate compression makes coordinates small” without preserving original gap widths for length calculations.
- “The heap top is active” without accounting for stale entries or duplicate heights.
- “O(n log n)” without identifying sort and active-structure update costs.

## Self-check rubric

Rate each as **not yet**, **with a prompt**, or **independently**:

- I can state the interval endpoint convention and exact event tie rule.
- I can identify the minimum sufficient active state for the query.
- I can prove the sweep invariant before coding.
- I can account for sorting, updates, and output costs.
- I test touching intervals, duplicate endpoints, and point queries at boundaries.

Sources: [USACO Guide: Sweep Line](https://usaco.guide/plat/sweep-line?lang=cpp), [My Calendar I](https://leetcode.com/problems/my-calendar-i/), [The Skyline Problem](https://leetcode.com/problems/the-skyline-problem/).
