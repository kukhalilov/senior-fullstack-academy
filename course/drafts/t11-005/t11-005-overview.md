# binary search, bounds, rotated arrays, and monotone answers — Big-picture orientation and mental model

## Problem and purpose

Binary search finds a boundary in an ordered space by repeatedly discarding a portion that cannot contain the answer. The space may be sorted array positions, feasible answer values, or a rotated sequence with a recognizable sorted region. The essential requirement is a monotone property: once a candidate is known to be impossible, an entire half can be discarded.

## Plain-language mental model

Imagine a row of doors where every door to the left is locked and every door from some point onward is open. You do not inspect every door. Check the middle, keep the half containing the transition, and repeat until the boundary is isolated. “Find an element” is one possible question; “find the first acceptable position” is often the more general boundary question.

For a sorted array `[1,2,2,2,5]`, the first position whose value is at least 2 is index 1, while the first whose value is greater than 2 is index 4. Their difference gives the count of 2s. These are different boundaries, so each deserves a clearly defined predicate and return convention.

## How the parts fit together

- **Exact search** asks whether a target occurs and returns a matching position or failure sentinel.
- **Lower and upper bounds** locate the first position meeting `>= target` and `> target`; they support insertion points and duplicate ranges.
- **Interval convention and invariant** determine initialization, midpoint rounding, updates, and termination.
- **Answer-space search** finds the first or last value satisfying a monotone feasibility check, rather than locating a value in an input array.
- **Rotated-array search** uses the sorted half to determine which side still has a valid order-based search interval; the supplied problem assumes distinct values.
- **Virtual matrix search** maps a flattened sorted matrix index back to row and column.
- **Limits** matter: binary search needs efficient random access and a monotone predicate, and its bounds and arithmetic must be safe.

## Concept map

```text
Monotone order or predicate
├─ sorted array: exact match, lower/upper bound
├─ answer range: first feasible / last feasible
├─ rotated sorted array: identify ordered half
└─ row-major matrix: virtual flattened index
       ↓
Invariant + interval convention + safe midpoint
       ↓
halve candidate space until boundary/result is determined
```

## End-to-end walkthrough

Find the first array position whose value is at least 6 in `[1,3,6,6,9]`. Use a half-open search interval `[lo,hi)=[0,5)`, where the answer is the first true position or n if none exists.

1. `mid=2`; value 6 satisfies `>=6`, so the first true position is at or before mid. Set `hi=2`.
2. `mid=1`; value 3 is false, so all positions through mid are false. Set `lo=2`.
3. Now lo equals hi at 2. That boundary is the first true position, and the repeated values begin there.

The interval strictly shrinks each time. The algorithm does not need a special duplicate rule: the predicate itself encodes “first value at least target.”

## When to use it and tradeoffs

Use binary search when the candidate space is ordered or a feasibility predicate changes monotonically, and checking the middle is efficient. It reduces O(n) candidate inspections to O(log n) checks for arrays or bounded numeric ranges. For a sorted linked list, random access is not O(1), so repeatedly walking to the middle can lose the expected benefit. If the input is small, an O(n) scan may be clearer and fast enough.

Do not binary search a predicate that alternates true and false without a monotonic boundary. Prove the search bounds contain an answer or define a sentinel outcome when feasibility is impossible. For answer-space search, bound arithmetic and feasibility accumulators too.

## What later lessons cover

The concepts lesson derives invariants and boundary templates. References group exact/bound variants, intervals, answer search, rotated arrays/matrices, and limitations. Independent practice lessons cover eight named tasks, including first/last occurrences, answer-space feasibility, and virtual matrix indexing.

Source: [USACO Guide: Binary Search](https://usaco.guide/silver/binary-search).
