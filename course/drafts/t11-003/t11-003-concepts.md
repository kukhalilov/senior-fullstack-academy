# two-pointer and sliding-window techniques — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to state the invariant behind a pointer scan, justify every pointer movement, distinguish fixed and variable windows, select updateable window state, and identify cases where the usual linear-window argument fails.

## Prerequisites

You should know array indices, loop invariants at an introductory level, and the difference between a contiguous subarray/substring and a subsequence. A contiguous range `[left, right]` includes every position between its endpoints; its length is `right - left + 1`.

## Core concepts

### Pointers are positions plus a movement proof

A pointer is an index whose value marks a boundary or candidate. The algorithm must answer two questions at every move: what candidates remain possible, and why is the discarded position safe to forget? “This is the usual pattern” is not a proof.

With sorted values and target `T`, let `a[left] + a[right]` be the current sum. If it is less than `T`, every pair using `left` and an index at most `right` has an equal or smaller sum, so `left` cannot participate in a solution. If the sum is too large, every pair using `right` and an index at least `left` has an equal or larger sum, so `right` can be discarded. This elimination works because sorted order gives monotonicity.

### Opposite-direction scans

Opposite pointers often begin at the first and last positions. They are useful for sorted pair problems, symmetric comparisons, and finding an extremum with a greedy elimination argument. A sorted array is a strong signal for pair elimination, but it is not enough by itself: derive the exact comparison and movement rule.

If the input is not sorted, sorting may enable the proof. Decide whether reordering is allowed. If original indices matter, keep the original index alongside each sorted value; sorting then costs O(n log n), and it does not magically preserve a constant-space requirement.

### Same-direction scans and compaction

A read pointer examines each original value. A write pointer marks where the next retained value belongs. For stable in-place filtering, maintain this invariant: before processing read position `r`, the prefix before `write` contains exactly the retained values from the already examined input, in their original relative order. If the current item should remain, write it at `write` and increment `write`.

The write index never passes the read index, so overwriting cannot destroy an unexamined value. The prefix is meaningful; the suffix after it may contain stale values and is outside the returned result. State the valid prefix length explicitly.

### Sliding windows are stateful contiguous ranges

The interval `[left, right]` is the current window. Expand by advancing `right`; contract by advancing `left`. A fixed-size window has a predetermined width. A variable-size window changes width to satisfy an invariant, such as “no character appears twice” or “sum is at least target.”

A useful loop has three pieces: add the entering element, repair validity if required, then update the answer only when the window's current status matches the objective. For a minimum valid length, shrink while valid and record every valid length before removing its left element. For a maximum valid length, shrink until valid and record the resulting valid range.

### Window state should be reversible and sufficient

For a running sum, adding x means `sum += x`; removing x means `sum -= x`. For multiplicities, increment or decrement the relevant count and remove zero-count keys when the number of distinct keys must be tracked. “Present” and “appears at least twice” are different state: a Boolean cannot preserve multiplicity after removals.

The at-most-K technique counts all windows with at most K distinct values. The count contribution for each right endpoint is `right - left + 1` after shrinking to validity, because every suffix ending at `right` that starts at or after `left` is also valid. Exactly K can be computed as `atMost(K) - atMost(K - 1)` when both counts refer to the same set of subarrays and K is in the intended domain.

### Monotonicity determines whether shrinking works

For nonnegative values, extending a sum window never decreases its sum, and removing a left value never increases its sum. This lets a minimum-length sum-at-least-target window advance greedily. If negative numbers are allowed, neither statement holds. For example, `[8, -7, 8]` has a qualifying short range even though shrinking an earlier valid window can lower its sum. The standard two-pointer proof no longer applies.

Nonnegative input is not a universal requirement for every sliding window. Distinct-character windows use a different invariant; adding a repeated character may invalidate the window and removing characters from the left eventually repairs it. The correct question is whether the selected validity condition changes predictably as boundaries move.

## Mechanisms and relationships

| Pattern | State/invariant | Why a move is safe | Typical cost |
|---|---|---|---|
| Opposite pointers on sorted data | A solution remains in the current candidate interval | Order proves one endpoint impossible | O(n) scan after sorting, if needed |
| Read/write compaction | Retained values occupy the prefix before `write` | A write never overwrites unread data | O(n) time, O(1) extra space |
| Fixed window | State summarizes exactly the last k items | Remove the departing item and add the entering one | O(n) time after initialization |
| Variable window | Current range is valid or is being repaired | Monotone validity lets one boundary catch up | Often O(n), if each index moves only forward |
| Frequency window | Counts match the range's multiplicities | Increment/decrement updates membership and counts | O(n) expected with a hash map; bounded alphabet may use an array |

“Each pointer only moves forward” gives O(n) total pointer movement, but total work can still be higher if each state update scans the whole window, copies it, or performs an expensive operation. Analyze the update cost too.

## Worked examples

### Find a pair in sorted data

In `[1, 2, 4, 6, 9]` with target 10, endpoints sum to 10; return them. For target 8, endpoints sum to 10, so 9 cannot be used with any remaining value at least 1; move the right pointer. The new endpoints 1 and 6 sum to 7, so 1 cannot pair with any value at most 6; move left. Continue until a pair is found or the candidate interval is empty.

### Fixed window

For width 3 over `[4, 1, 7, 2, 5]`, first sum the initial window: 12. To move one step, subtract 4 and add 2, obtaining 10 for `[1,7,2]`; then subtract 1 and add 5 to obtain 14. Recomputing each sum from scratch costs O(nk); incremental updates cost O(n) after the first O(k) sum.

### Distinct characters

For `abca`, add `a`, `b`, and `c`; the window is valid and length 3. Adding the second `a` violates uniqueness. Remove from the left, decrementing counts, until the earlier `a` has left. The valid window is now `bca`. The left boundary never moves backward.

## Misconceptions and edge cases

- A pair of pointers is not automatically a two-pointer algorithm: the movement still needs a correctness argument.
- A sliding window only represents contiguous ranges; it does not represent arbitrary subsequences.
- An exact-sum window is not generally valid with negative values. Prefix-sum techniques are more appropriate for many such tasks.
- For an empty input, avoid computing a window length from invalid endpoints. Check the problem's constraints and define empty behavior explicitly.
- Use `right - left + 1` for an inclusive window. Confusing inclusive and half-open boundaries creates off-by-one errors.
- If a frequency map stores last-seen indices, a duplicate outside the active range must not move `left` backwards; use `left = Math.Max(left, lastSeen + 1)`.
- C# `char` represents a UTF-16 code unit. A problem that defines characters as arbitrary Unicode scalar values may need rune-aware processing; follow the problem's stated alphabet and unit.
- Sorting can change stable order and original indices. Mention its cost and preserve indices when the result requires them.

## Knowledge checks with answers

1. **Why can a too-small sum justify moving the left pointer in a sorted array?** Every remaining partner is no larger than the current right value, so that left value cannot reach the target.
2. **Why does a running sum support constant-time window updates?** Addition and removal have inverse updates, so the sum need not be recomputed over all current elements.
3. **Why do negative values break the common minimum-sum window?** Expanding may reduce the sum and shrinking may increase it, so boundary movement is no longer monotone with validity.
4. **When can exactly-K counting use a difference?** When `atMost(K)` and `atMost(K-1)` count the same objects under nested “at most” conditions; their difference counts those with exactly K.
5. **What does O(n) pointer movement fail to account for?** Costly work inside each iteration, such as rescanning a window or copying it.

Sources: [USACO Guide: Two Pointers](https://usaco.guide/silver/two-pointers), [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window).
