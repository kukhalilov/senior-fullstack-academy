# two-pointer and sliding-window techniques — Reference: Window sizes and boundary updates

## Scope and version

This lesson covers the six supplied shapes. Unless noted, a window is inclusive `[left,right]`, with length `right - left + 1`.

## How this group fits the mental model

Window shape describes boundary motion. A separate invariant describes what the current range means. To obtain linear time, updates must be incremental and each boundary should move only O(n) times.

## Supplied names explained

- `Fixed-size sliding window` — A known width k moves one position at a time. Initialize its state, then remove the outgoing element and add the incoming one. Each window is processed in O(1) update time after O(k) initialization. Check k against input length before indexing.
- `Variable-size sliding window` — The width changes as boundaries move to maintain a validity condition. It is useful when moving a boundary can predictably restore validity and never requires moving backward.
- `Expand-then-contract window` — Advance right to gain content; while valid, record the result and remove from left. This pattern commonly finds a shortest valid range. Record before the removal that makes it invalid.
- `Contiguous subarray window` — A contiguous array range that includes every position between its ends. State such as sum or count can be maintained incrementally. It cannot omit a troublesome interior item.
- `Contiguous substring window` — A contiguous range of string positions. Character semantics depend on the task: .NET string indexing uses UTF-16 code units, while another prompt may define Unicode scalar values or user-perceived grapheme clusters.
- `Enter-and-leave update` — When the window shifts, update its summary for the entering right element and departing left element. For counts, decrement on exit and remove zero-count keys if key count represents distinct values.

## Cross-item comparison

`Fixed-size sliding window` has predetermined width; `Variable-size sliding window` lets validity determine width. `Expand-then-contract window` is a common schedule for the latter, not the definition of all variable windows. `Contiguous subarray window` and `Contiguous substring window` name the sequence domain. `Enter-and-leave update` names state maintenance shared by both shapes.

## Examples

For width three over `[4,1,7,2,5]`, first sum to 12; shifting subtracts 4 and adds 2, yielding 10. For distinct characters over `abca`, adding the final `a` violates uniqueness; remove from the left through the earlier `a` before treating the window as valid again.

## Common mistakes

- Using inclusive boundaries with a length formula that omits `+1`.
- Updating only the entering value but not the leaving one.
- Recording a longest-range answer while the current window is invalid.
- Treating a subsequence as a window.
- Assuming shrinking repairs every condition without proving monotonicity.

## Knowledge checks with answers

1. **What is the inclusive window length?** `right - left + 1`.
2. **What changes during a one-step fixed-window shift?** Remove the outgoing value and add the incoming value.
3. **What must be true when measuring a longest valid range?** The active range satisfies the invariant.
4. **Do all windows need nonnegative values?** No; that assumption belongs to particular sum-threshold proofs, not to all window invariants.

Source: [USACO Guide: Sliding Window](https://usaco.guide/gold/sliding-window).
