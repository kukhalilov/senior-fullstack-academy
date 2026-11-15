# two-pointer and sliding-window techniques — Reference: Window state and validity

## Scope and version

This lesson explains each supplied state term. Choose accumulator types from the problem's maximum possible totals, not only from the type of one input element.

## How this group fits the mental model

Boundaries determine the active contiguous range; state summarizes it. Update state to exactly reflect the new range before checking validity or measuring an answer.

## Supplied names explained

- `Window validity invariant` — A predicate such as “no duplicate character” or “at most K distinct values.” For a longest-valid objective, shrink until valid then record; for a shortest-valid objective, record while valid and shrink to seek improvement.
- `Running window sum` — Add each entering value and subtract each departing value. It is O(1) per update. That does not imply sum-threshold validity is monotone, especially for signed values.
- `Frequency map` — A key-to-multiplicity map for the current range. Increment on entry and decrement on exit. A zero-count key must not be confused with a present value; delete it or track distinct count separately. Hash lookup is expected O(1), not a universal worst-case guarantee.
- `Frequency array` — An indexed count table for a compact, known key range. It avoids hashing but requires safe mapping and storage for every possible key. An arbitrary Unicode value cannot be blindly used as an index into a small table.
- `Distinct-element count` — Number of keys with positive frequency. Increase only on 0-to-1; decrease only on 1-to-0 transitions.
- `At-most-K count` — After shrinking a window to at most K distinct values, every start from left through right also gives a valid suffix ending at right. Add `right - left + 1` to count all such windows. A negative K yields zero valid windows.
- `Exactly-K via difference of at-most counts` — Subtract `atMost(K - 1)` from `atMost(K)`. Since the first set is a subset of the second, the difference counts windows with exactly K distinct values. Use a wide total when O(n²) windows may be counted.
- `Monotone shrink condition` — A violation can be repaired by advancing left and future input never requires left to move backward. This is the property enabling amortized linear boundary movement; establish it for the chosen predicate.
- `Nonnegative-input requirement for minimal-sum window` — In the standard shortest subarray with sum at least target scan, nonnegative values ensure expansion cannot lower the sum and removing the left value cannot increase it. Negative elements break that proof; prefix sums with a different search structure may be needed.

## Cross-item comparison

`Frequency map` handles broad key domains; `Frequency array` fits a known small domain. `Distinct-element count` is derived from transitions between zero and positive frequency. `At-most-K count` uses a valid window; `Exactly-K via difference of at-most counts` derives an exact count from nested conditions. A `Running window sum` is state only; it does not guarantee a `Monotone shrink condition`.

## Examples

For `[a,a,b]`, counts are a:2 and b:1, distinct count 2. Removing one a leaves distinct count 2; removing the other changes a's frequency from one to zero and drops distinct count to 1. For `[1,2,1]`, `atMost(2)=6`, `atMost(1)=3`, so exactly-two-distinct subarrays number 3.

## Common mistakes

- Decrementing distinct count for every removal instead of only when a count reaches zero.
- Counting zero-count map entries as distinct values.
- Using `int` for a potentially quadratic count.
- Applying the positive-sum shrink proof to data containing negatives.
- Shrinking once when multiple removals may be needed.

## Knowledge checks with answers

1. **When does distinct count decrease?** A frequency changes from one to zero.
2. **Why add `right - left + 1` for an at-most-K window?** Every suffix of a valid window remains valid.
3. **Why does subtracting at-most counts produce exactly K?** It removes all windows with fewer than K distinct values.
4. **Which assumption is broken by signed inputs in the minimum-sum window?** Monotonic change in sum as the boundaries move.

Source: [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window).
