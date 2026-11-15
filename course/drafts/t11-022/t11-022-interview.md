# monotonic stacks and monotonic queues — Interview questions and reasoning

## Core questions

1. What property makes a stack “monotonic”?
2. How do you choose the pop inequality for next-greater and next-smaller queries?
3. Why can an inner pop loop still run in linear time overall?
4. When should a deque store indices rather than values?
5. Why does a sliding-window maximum use a decreasing deque?
6. How do equal values affect subarray-minimum contribution counting?
7. What does a virtual sentinel do in a histogram scan?

## Concise interview answers

- Values in a chosen stack order remain monotone from bottom to top after every insertion and removal.
- State whether the query is strict. For next strictly greater, pop unresolved values only while the current value is greater; for a strict smaller boundary, the exact side-specific equality policy must be derived.
- Each index is pushed once and popped at most once, so aggregate pushes and pops are O(n), even if one iteration removes many entries.
- Use indices when the result needs a distance, when elements expire from a window, or when equal values need distinct ownership.
- A decreasing deque puts the maximum at the front. Smaller older values can be removed because newer larger candidates last longer.
- Use asymmetric strictness so each subarray with tied minima is assigned to exactly one occurrence.
- A sentinel creates a final boundary that flushes unresolved candidates; it must be distinguished from actual input.

## Deep follow-up answers

### What is the right way to justify a pop?

Name the query class represented by the candidate. Show that the arriving value is at least as useful, is closer or expires later, and therefore makes the popped candidate unable to answer any remaining query. Without this dominance argument, maintaining monotone order alone does not prove correctness.

### Why is the amortized proof not the same as constant worst-case update time?

One arrival can pop almost the entire stack. The linear guarantee is over the whole sequence: each index enters once and leaves once. An individual operation may still take O(n).

### How do you avoid double-counting equal minima?

Specify one side as strictly smaller and the other as smaller-or-equal (or the symmetric convention), then derive the ownership span from those exact boundaries. Validate on `[x,x]`: its two singleton subarrays and one length-two subarray must each be assigned once.

## Scenario questions

### The solution passes unique-value tests but fails on duplicates

Write a two-element equal input and derive which index owns each answer. Check whether the code pops on `>` or `>=` on each side. Do not patch the operator until the intended ownership or strictness rule is stated.

### A nested loop appears quadratic

Count pushes and pops over the whole run. If every candidate is inserted once and can only be removed once, total stack operations are O(n). Also account for other per-iteration work and any repeated allocation.

### A sliding-window maximum returns an expired value

At index i, compute the left boundary `i-k+1` and remove deque-front indices smaller than it before reading the maximum. Verify that the deque stores indices and that output begins only after a complete window.

## Tradeoffs and alternatives

- A monotonic deque answers fixed-window extrema in O(1) amortized update time; a heap handles broader priorities but needs stale-entry handling and O(log n) operations.
- A stack handles one-sided nearest boundaries; a deque handles both candidate domination and age-based expiration.
- Direct scans are easier to verify for small bounds but often O(n²).
- Contribution counting compresses many subarray minima into per-index spans; a brute-force sum is simpler for testing small cases.

## Common weak answers

- “The stack is increasing” without specifying stored item, orientation, scan direction, and comparison.
- “It is linear because it uses a stack” without the push-once/pop-once accounting.
- “Pop duplicates” without saying whether the query is strict or how ownership is assigned.
- “The front is the maximum” before expiring indices outside the current window.
- Computing width as `right-left` when both boundaries are exclusive.

## Self-check rubric

Rate each as **not yet**, **with a prompt**, or **independently**:

- I can state the candidate invariant and exact pop condition.
- I can justify every removal through dominance.
- I can prove aggregate O(n) time without claiming each update is worst-case constant.
- I handle equal values and boundaries with a tiny dry run.
- I can explain why a stack, deque, heap, or direct scan fits the query.

Sources: [USACO Guide: Stacks](https://usaco.guide/gold/stacks), [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window).
