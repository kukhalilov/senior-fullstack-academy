# interval representations, merging, and scheduling — Interview questions and reasoning

## Core questions

1. What does “overlap” mean for this problem's endpoint convention?
2. Why does sorting by start support merging?
3. Why does sorting by finish maximize the number of compatible intervals?
4. What invariant does the scan maintain?
5. What is the total complexity including sorting?

## Concise interview answers

- Closed intervals overlap when `max(starts) <= min(ends)`; half-open intervals require strict inequality for nonempty intersection.
- Merge by start while maintaining the union of the current connected component.
- Earliest-finish greedy maximizes compatible count because replacing any optimal first choice with the earliest finisher leaves at least as much room.
- Two sorted disjoint lists can be intersected in linear time by advancing the interval with the earlier end.
- A sort-and-scan algorithm is normally O(n log n) overall, not O(n).

## Deep follow-up answers

### Why does earliest-finish scheduling work?

Let G be the compatible interval with smallest finish, and let O be the first interval in an optimal schedule. Since G finishes no later than O, replacing O by G preserves compatibility with all later choices. Therefore an optimal schedule exists that starts with G. Apply the same reasoning to the remaining suffix.

### Why is the arrow problem related but not identical?

Both choose an earliest-ending boundary. In maximum-cardinality scheduling, select that interval and continue after its end. For closed balloon ranges, place a point at that end and group every later interval containing the point. State the objective and invariant rather than memorizing one template.

### What tie-break prevents covered-interval errors?

Sort start ascending and end descending. Equal-start containing intervals must precede the shorter intervals they cover. Stability only preserves input order and does not guarantee this semantic order.

### Why can endpoint subtraction break a comparator?

For signed full-width integers, `a - b` can overflow, changing the sign used for ordering. `CompareTo` or relational comparisons avoid that arithmetic.

## Scenario questions

1. **Rooms `[1,2]` and `[2,3]` may be used back-to-back.** Scheduling treats the equality boundary as compatible; use `start >= previousEnd`.
2. **Ranges describe inclusive service coverage.** Merge touching ranges when the shared endpoint is covered by both.
3. **Two calendars each provide sorted, disjoint closed busy intervals.** Compute pairwise intersections and advance the interval that ends first.
4. **An incoming interval list is already sorted and disjoint.** Insert in one pass; do not pay to sort again.
5. **Each interval has a different profit.** Earliest-finish alone is not enough; weighted interval scheduling needs a value-aware method.

## Tradeoffs and alternatives

- Sorting arbitrary data costs O(n log n), while sorted-input scans may be O(n).
- In-place sorting or output compaction can reduce allocation but introduces mutation and unread-data hazards.
- Weighted objectives and online updates need different algorithms from static equal-weight greedy scans.
- A general sweep line tracks events and active sets; it is broader than one-dimensional merge scans.

## Common weak answers

- **“Touching intervals always overlap.”** That depends on inclusion and on the problem's explicit compatibility definition.
- **“Sort by start for all interval problems.”** Scheduling and balloon hitting need end order; coverage counting also needs a tie-break.
- **“Partial overlap means covered.”** Coverage requires one interval to contain the other.
- **“The scan is O(n), so the algorithm is O(n).”** Include the sort unless input order is guaranteed.
- **“Use stable sort to resolve equal starts.”** Stable order is not necessarily the required descending-end order.

## Self-check rubric

Be able to derive predicates from endpoint inclusion; distinguish union, scheduling, stabbing, intersection, and containment objectives; state each scan's invariant; justify the greedy exchange; explain all tie-breaks; and account for sort and output memory.

Sources: [USACO Guide: Greedy with Sorting](https://usaco.guide/silver/greedy-sorting), [USACO Guide: Problem-Analysis Paradigms](https://usaco.guide/PAPS.pdf).
