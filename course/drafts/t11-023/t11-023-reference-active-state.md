# sweep-line events and active intervals — Reference: Maintaining active intervals and resources

## Scope and version

This reference compares count-only overlap state, active end-time heaps, and structures that retain interval identity.

## How this group fits the mental model

The active state is the summary consulted between event coordinates. Its data structure must preserve exactly the information the requested answer needs.

## Supplied names explained

- **Active interval set:** the intervals currently contributing under the selected endpoint convention.
- **Active overlap counter:** scalar count of active intervals; sufficient for peak concurrency but not identities.
- **Maximum simultaneous overlap:** largest active count observed over the sweep.
- **Active end-time min-heap:** earliest ending active interval is available at the root.
- **Release finished intervals:** pop every end time `<= nextStart` for half-open meetings before allocating at that start.
- **Meeting-room allocation count:** peak simultaneous meetings, equal to the minimum rooms required when rooms are interchangeable.
- **Resource assignment versus count-only query:** count tells how many are needed; assignment must also preserve which resource is free and which interval uses it.

## Cross-item comparison

A counter uses O(1) state and handles aggregate overlap. A min-heap provides the earliest reusable room end in O(log n) updates. A set/map of active identities is necessary when removals are by object or when the query ranks active objects. Avoid a more complex structure when the count alone answers the question.

## Examples

Meetings `[0,30)`, `[5,10)`, `[15,20)` require two rooms. At start 15, the heap contains end times 10 and 30; release 10, then insert 20. The active heap size is two. For a capacity sweep, each trip contributes `+passengers` at pickup and `-passengers` at drop-off. Grouped deltas at the same location respect drop-off-before-pickup when checking occupancy after that location.

## Common mistakes

- Releasing only one finished meeting when several end before the next start.
- Using `< start` instead of `<= start` for half-open meetings.
- Assuming a count can identify which room to reuse or which building is tallest.
- Forgetting to remove a rejected booking from state in an insertion problem.
- Comparing room count with largest single interval count rather than peak concurrency.

## Knowledge checks with answers

1. **What is the minimum number of rooms?** The maximum number of simultaneous meetings.
2. **Why pop all ended meetings?** The heap should represent exactly active meetings, not all meetings that have ever started.
3. **When does a scalar counter stop being sufficient?** When the query needs active identities, resource assignment, or a ranked active value.

Sources: [Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii/), [Car Pooling](https://leetcode.com/problems/car-pooling/), [USACO Guide: Sweep Line](https://usaco.guide/plat/sweep-line?lang=cpp).
