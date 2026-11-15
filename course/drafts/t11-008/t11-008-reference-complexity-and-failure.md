# interval representations, merging, and scheduling — Reference: Complexity and boundary cases

## Scope and version

This lesson explains the eight supplied complexity, endpoint, ordering, and failure-case terms.

## How this group fits the mental model

Most interval algorithms have a simple scan after establishing a useful order. Correctness depends on the order and boundary predicate; complexity depends on whether sorting is needed and whether the scan revisits elements.

## Supplied names explained

- `O(n log n) sort plus O(n) scan` — Typical arbitrary-input merge or scheduling bound, with sorting dominating.
- `Already-sorted O(n) scan` — A one-pass bound when the precondition guarantees order and no additional sort is required.
- `Duplicate intervals` — Equal ranges can merge into one, conflict in scheduling, or be treated as a coverage duplicate depending on the task.
- `Equal start endpoints` — Often require a secondary end ordering; coverage counting uses descending end to put the containing interval first.
- `Equal end endpoints` — Affects tie order but generally not earliest-finish cardinality when all are equally compatible at that boundary.
- `Inclusive endpoint overlap` — Closed intervals sharing a point overlap; use equality in the relevant predicate.
- `Integer endpoint extremes` — Avoid comparator subtraction, which may overflow; use `CompareTo`. If arithmetic is necessary, widen or guard it.
- `Stable versus unstable sort relevance` — Stability only preserves original order among equal keys; it does not provide a missing semantic tie-break unless original order is meaningful.

## Cross-item comparison

Explicit secondary keys are more reliable than assuming stable sort. A `CompareTo` comparator can order start ascending and end descending without subtracting values. Once ordered, many algorithms append each interval once, so the scan remains linear.

## Examples

To sort by start ascending and end descending: compare starts; if equal, compare `right.End` to `left.End`. This correctly places `[1,10]` before `[1,3]`. For endpoints near Int32.MinValue and Int32.MaxValue, subtraction can overflow and invert order.

## Common mistakes

- Claiming O(n) total time after sorting arbitrary input without counting the sort.
- Using `a.Start - b.Start` as a comparator on full-range signed endpoints.
- Assuming stability fixes equal-start coverage handling without an explicit end tie-break.
- Treating duplicate intervals identically across merge, scheduling, and coverage tasks.
- Ignoring endpoint semantics when equal values occur.

## Knowledge checks with answers

1. **When is sorting unnecessary?** When ordering is guaranteed by the input contract and the chosen scan relies on it.
2. **Why not subtract comparator keys?** The subtraction can overflow and produce the wrong sign.
3. **Does stability imply correct secondary ordering?** Only if preserving input order is the intended secondary rule.
4. **Why keep duplicate-case tests?** Duplicates can change kept counts or boundary transitions even when sorting looks correct.

Source: [USACO Guide: Greedy with Sorting](https://usaco.guide/silver/greedy-sorting).
