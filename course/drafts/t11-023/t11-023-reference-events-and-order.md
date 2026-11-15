# sweep-line events and active intervals — Reference: Events, sorting, and coordinate ties

## Scope and version

This reference covers event representation, coordinate ordering, and endpoint ties for interval sweeps.

## How this group fits the mental model

Event construction determines where the sweep state can change. Tie ordering determines the meaning of the state at a shared coordinate and must come from the interval contract.

## Supplied names explained

- **Start event:** marks where an interval begins contributing to the chosen state.
- **End event:** marks where it stops contributing; whether it contributes at that exact coordinate depends on endpoint closure.
- **Event coordinate:** the time or geometric coordinate at which one or more state changes occur.
- **Sort by coordinate:** arrange events in sweep order; a linear scan afterward can process only these critical points.
- **Equal-coordinate event ordering:** define how starts and ends at one coordinate interact, or group changes and inspect the state at the correct side of the point.
- **Closed interval tie rule:** for closed `[s,e]`, both endpoints belong; a start at x and end at x overlap at x if the question counts point overlap.
- **Half-open interval tie rule:** for `[s,e)`, end at x is inactive at x while a start at x is active; adjacent intervals do not overlap.
- **Stable event tie-break:** use an explicit deterministic tie key when event order matters; stability alone does not guarantee correct semantics.
- **Sweep direction:** choose increasing or decreasing coordinate order to match which past/future information the invariant needs.

## Cross-item comparison

For maximum concurrency on half-open ranges, applying all `-1` end deltas and `+1` start deltas at x before measuring the following segment avoids a transient false overlap. For closed point overlap, measure the coordinate with starts included before ends are removed, or use an equivalent event grouping. For inclusive bloom queries, answer the point query directly with `start <= t <= end`.

## Examples

`[10,20)` and `[20,30)` can share a room because the first interval excludes 20. In a min-heap sweep, release all end times `<=20` before adding the second meeting. For closed `[10,20]` and `[20,30]`, both contain 20 and a point-overlap query counts two at that instant.

## Common mistakes

- Applying a universal “ends before starts” rule without checking interval semantics.
- Measuring state after only one event when multiple events share a coordinate.
- Forgetting that same-coordinate intermediate counts may be artifacts of chosen sort order.
- Using a stable sort as a substitute for an explicit tie rule.
- Mixing point inclusion with activity on the segment after the point.

## Knowledge checks with answers

1. **Can two half-open intervals meeting at an endpoint share a room?** Yes; the ending interval is inactive when the starting one begins.
2. **Should same-coordinate events always be processed one by one?** No; grouping is often clearer when the query concerns state after all changes.
3. **What determines tie order?** Whether endpoints are open/closed and whether the answer is measured at the point or in an adjacent segment.

Sources: [USACO Guide: Sweep Line](https://usaco.guide/plat/sweep-line?lang=cpp), [My Calendar I](https://leetcode.com/problems/my-calendar-i/), [Car Pooling](https://leetcode.com/problems/car-pooling/).
