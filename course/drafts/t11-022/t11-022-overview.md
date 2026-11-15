# monotonic stacks and monotonic queues — Big-picture orientation and mental model

## Problem and purpose

Many sequence problems ask for the nearest greater/smaller value or an extremum over every moving window. Recomputing each answer independently is often quadratic. A monotonic stack or deque keeps only candidates that can still affect an unanswered or active query.

## Plain-language mental model

Imagine a line of candidates ordered by time. When a new value arrives, it can make some older candidates permanently useless. For a next-greater query, a new warmer value resolves every earlier cooler candidate still waiting on the stack. For a window maximum, an arriving larger value dominates smaller values behind it: those smaller values expire earlier and can never become a future maximum.

The structure is not magic compression. Its pop rule must be justified by dominance, and equal values need deliberate treatment.

## How the parts fit together

| Query | Structure | State retained | Typical answer |
| --- | --- | --- | --- |
| Next greater/smaller to one side | Stack | Unresolved indices | Value or distance when popped |
| Circular next greater | Stack plus two logical scans | Indices awaiting a greater value | Resolve during second pass |
| Window max/min | Deque | In-window candidates in monotonic order | Front index |
| Largest rectangle | Stack | Bars awaiting a smaller right boundary | Height times boundary span |
| Sum of subarray minima | Stack | Boundary spans assigned to each value | Value times number of owned ranges |
| Remove digits for a minimum number | Stack-like output buffer | Increasing prefix that cannot be improved | Greedy sequence after deletions |

## Concept map

Correctness depends on four linked decisions: what an index represents; which comparison triggers removal; whether equal values are retained; and how an index's lifetime ends. For a deque, expiration at the front handles the left window boundary while domination at the back handles candidate quality. For contribution counting, asymmetric strictness gives equal values one consistent owner.

## End-to-end walkthrough

For Daily Temperatures `[73,74,75,71,69,72,76,73]`, keep indices whose temperatures have not yet met a warmer future day. Index 0 waits until 74 arrives at index 1, so its answer is 1. Index 1 waits until index 2, also 1. When 72 arrives at index 5, it resolves 71 and 69, which have waited 2 and 1 days. The stack's unresolved temperatures stay decreasing from bottom to top. Each index is pushed once and popped once.

## When to use it and tradeoffs

Use these structures when a query needs a nearest extremal boundary, a sliding-window extreme, or a monotone greedy choice. A direct scan may be clearer for small bounds. A heap or ordered set supports broader operations but often costs O(log n) per update and may require lazy deletion. A monotonic structure is faster because the query's dominance relation allows discarded candidates to be forgotten permanently.

## What later lessons cover

The references formalize stack invariants, circular scans and aggregate analysis, deque expiration, and nearest-boundary ownership. Six problems progress from next-greater scans to histogram and subarray contributions. Each problem's lesson provides its own constraints, proof, tests, and alternatives.

Sources: [USACO Guide: Stacks](https://usaco.guide/gold/stacks), [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window), [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/).
