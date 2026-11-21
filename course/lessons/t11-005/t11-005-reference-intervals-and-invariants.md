# binary search, bounds, rotated arrays, and monotone answers — Reference: Intervals, invariants, and termination

## Scope and version

This lesson explains the nine supplied interval terms. Index examples use integer arrays; numeric answer ranges may require wider arithmetic.

## How this group fits the mental model

The interval tells you which candidates the loop still represents. The invariant states which candidates are already ruled out and which may still contain the result. A consistent pair determines initialization, updates, termination, and sentinel meaning.

## Supplied names explained

- `Closed search interval` — `[lo,hi]` contains both endpoints. It is empty when `lo > hi`; exact search commonly loops while `lo <= hi` and discards a midpoint with `mid±1`.
- `Half-open search interval` — `[lo,hi)` contains lo but not hi. It is empty when `lo == hi`, naturally permits the n insertion boundary, and commonly uses `hi=mid` in lower-bound search.
- `Loop invariant` — A statement true before and after each iteration that relates excluded regions to the answer and bounds the remaining candidates. State it in words and verify initialization, preservation, and termination.
- `Candidate elimination` — The proof that a comparison rules out a region. In sorted search, values on one side of mid cannot satisfy the target predicate; retain the midpoint only when its boundary side remains possible.
- `Midpoint floor` — `lo+(hi-lo)/2` for nonnegative bounds with lo<=hi. The subtraction-first form avoids overflowing `lo+hi` and rounds toward lo.
- `Overflow-safe midpoint` — Compute midpoint without summing both large endpoints, e.g. `lo+(hi-lo)/2`. This form assumes the difference itself is representable; for full signed domains, use a wider type or a carefully derived unsigned formulation.
- `Sentinel result` — A value such as -1 for not found, or n for a lower-bound position after the last item. Ensure it cannot be confused with a valid index and check before indexing.
- `Empty interval` — No candidate remains. In a closed interval this is `lo>hi`; in a half-open interval it is `lo==hi`. The loop condition must match the chosen convention.
- `Termination measure` — A nonnegative quantity, usually the number of candidates or interval width, that strictly decreases after every iteration. Without strict progress, a midpoint update may loop forever.

## Cross-item comparison

`Closed search interval` keeps both endpoints; `Half-open search interval` excludes its upper boundary. They define different empty conditions and midpoint updates. `Loop invariant` explains correctness; `Candidate elimination` preserves it. `Midpoint floor` is one rounding rule; `Overflow-safe midpoint` describes arithmetic safety. `Sentinel result` describes the post-search contract, `Empty interval` the state, and `Termination measure` why the loop finishes.

## Examples

For lower bound over `[0,n)`, if `a[mid] < target`, set lo=mid+1; otherwise set hi=mid. The number of candidate indices hi-lo strictly decreases, and at equality the boundary is the first value not below target. For closed exact search, if `a[mid] < target`, set lo=mid+1; if greater, set hi=mid-1. The midpoint is removed, so the closed candidate count decreases.

## Common mistakes

- Mixing a half-open empty condition with a closed update rule.
- Setting lo=mid in a lower-bound loop with floor midpoint.
- Failing to discard mid when equality is not the stopping condition.
- Computing `(lo+hi)/2` when bounds may overflow their type.
- Indexing a sentinel boundary n as if it were an element.
- Claiming termination without showing the interval shrinks.

## Knowledge checks with answers

1. **What is empty for `[lo,hi)`?** lo equals hi.
2. **Why can lower bound set hi=mid?** Mid remains a possible first-true answer, while positions above it are excluded.
3. **How do you establish termination?** Show a nonnegative candidate measure strictly decreases each iteration.
4. **What does sentinel n mean for an array of length n?** No index before n satisfies the searched boundary predicate.

Source: [USACO Guide: Binary Search](https://usaco.guide/silver/binary-search).
