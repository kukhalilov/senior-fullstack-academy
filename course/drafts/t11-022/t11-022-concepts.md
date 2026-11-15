# monotonic stacks and monotonic queues — Core concepts and how they fit together

## Learning objectives

- Choose increasing or decreasing candidate order from the query.
- State precisely when an index is pushed, resolved, expired, or dominated.
- Prove linear total work by counting pushes and pops.
- Handle circular traversal, duplicate extrema, and equal-boundary ownership.
- Distinguish a monotonic deque from a general deque, queue, or heap.

## Prerequisites

Know arrays, index-based stacks, queues/deques, and sliding-window boundaries. Review [stack and sliding-window patterns](https://usaco.guide/gold/stacks) if needed.

## Core concepts

A monotonic stack stores candidates whose values are ordered from bottom to top. A decreasing stack is common for next-greater queries: a new value resolves smaller top values. An increasing stack is common for next-smaller boundaries: a new value removes larger top values. The exact strict or non-strict comparison defines the equality policy.

Use indices rather than only values when answers need distances, positions, expiration, or width. A value stack can be sufficient when only the value matters and duplicates need no distinction.

A monotonic deque stores indices ordered by position and candidate value. Indices expire in chronological order at the front; dominated candidates are removed from the back. For a maximum window, keep values decreasing so the front is the current maximum. For a minimum, keep them increasing.

## Mechanisms and relationships

The amortized argument is aggregate: every input index enters once and leaves at most once. A loop may pop repeatedly during one iteration, but total pops across the whole input are O(n). This is not an O(1) worst-case bound per update; one update may pop many candidates.

For nearest smaller boundaries, a bar of height h can span from one position after its nearest smaller left bar through one position before its nearest smaller right bar. Width is `right - left - 1`. If equal heights exist, compute one side with strict comparison and the other with non-strict comparison so each range or subarray is assigned exactly once.

For circular arrays, scan up to 2n logical positions using `i % n`. Push unresolved indices only during the first pass; a second pass supplies wraparound candidates without inserting duplicate copies.

## Worked examples

For next greater values `[2,1,3]`, store unresolved indices `[0,1]` after the first two elements. When 3 arrives, pop 1 then 2: both are resolved by the nearest greater value 3. For a sliding maximum with window size 3 over `[1,3,-1,-3,5]`, adding 5 removes the smaller candidates at the back; expired indices are removed at the front before reporting the next maximum.

For `[2,2]` in a histogram, a consistent strict/non-strict boundary convention must allow a rectangle of height 2 and width 2. Popping equal heights only on one side is a common convention; symmetric strictness can leave a bar without the correct full span.

## Misconceptions and edge cases

- “Nested loops mean quadratic.” Not necessarily: prove each index is pushed and popped a bounded number of times.
- “The stack is increasing” is incomplete; specify bottom-to-top order, stored values/indices, and the pop comparison.
- Equal values are not interchangeable when identity, expiration, or ownership matters.
- A deque front is only the answer after stale indices have expired.
- A monotonic queue cannot answer arbitrary range queries after its discarded candidates are gone.
- Sentinels simplify boundaries but must not collide with valid values unless the code distinguishes them structurally.

## Knowledge checks with answers

1. **Why can a new larger value remove smaller candidates in a window maximum deque?** Those candidates occur earlier, expire sooner, and cannot exceed the new value.
2. **Why can a stack algorithm with an inner pop loop still be O(n)?** Each index is pushed once and popped at most once.
3. **Why use asymmetric comparisons when counting subarray minima?** It gives equal minima a deterministic owner so a subarray is counted once.
4. **When should a circular scan push indices?** Usually only during the first logical pass, while later passes resolve existing candidates.

Sources: [USACO Guide: Stacks](https://usaco.guide/gold/stacks), [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window), [Sum of Subarray Minimums](https://leetcode.com/problems/sum-of-subarray-minimums/).
