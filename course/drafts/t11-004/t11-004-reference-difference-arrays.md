# prefix sums, difference arrays, and static range queries — Reference: Difference arrays and offline range updates

## Scope and version

This lesson covers the seven supplied difference-array terms. Range endpoints are zero-based and inclusive unless an item states otherwise.

## How this group fits the mental model

A difference array stores changes between adjacent values. Its prefix accumulation reconstructs the underlying values. To add x across a whole interval, place a positive marker where the update starts and a cancelling marker just after it ends.

## Supplied names explained

- `Difference array` — A sequence of boundary changes whose prefix accumulation produces a value sequence. It compactly combines many interval additions before reconstruction.
- `First difference` — For values A, define `D[0]=A[0]` and `D[i]=A[i]-A[i-1]` for i>0. Prefix-summing D recovers A. If using a sentinel boundary representation, define that convention explicitly.
- `Range increment boundary markers` — To add x to inclusive `[l,r]`, add x at `D[l]` and subtract x at `D[r+1]`. The cancellation prevents this update from affecting later positions.
- `Right-boundary cancellation at end plus one` — The cancellation index is r+1 because r is included. If r is the final array index, allocate a sentinel slot at n or omit the unused cancellation after checking bounds; do not index past an n-length array.
- `Prefix reconstruction from differences` — Scan left to right, accumulating markers; each running total is the net added amount at that position. Add it to initial values if the update-only difference array was built separately.
- `Offline range updates` — Apply many updates to markers in O(1) each, then perform one O(n) reconstruction once all updates are known. This is efficient when intermediate arrays are not queried.
- `Difference array with initial values` — Either first convert initial A to its first differences and apply update markers there, or keep A as a base array and prefix-sum a separate zero-initialized update-marker array onto each value. Use one convention consistently.

## Cross-item comparison

`First difference` is the transform; `Prefix reconstruction from differences` is its inverse. `Range increment boundary markers` and `Right-boundary cancellation at end plus one` encode one interval update. A `Difference array with initial values` clarifies how original values enter the reconstruction. `Offline range updates` describes the workload that makes this representation useful.

## Examples

Start with four zeroes and apply +3 to `[1,3]`. Use an update marker array with `D[1]+=3`, `D[4]-=3`. Its prefix accumulation is `[0,3,3,3]` for the four output positions; the sentinel at index 4 cancels any effect beyond the requested range. For initial `[5,2,8,1]`, add the same cumulative increments to obtain `[5,5,11,4]`.

## Common mistakes

- Placing the cancellation at r rather than r+1, excluding the final element.
- Writing `D[n]` into an n-sized array for an update ending at n-1.
- Prefixing the original array and update array inconsistently, applying an update twice.
- Expecting a difference array alone to answer a query between updates.
- Forgetting that a negative update marker is required to stop propagation.

## Knowledge checks with answers

1. **Which two markers encode adding x to `[l,r]`?** `D[l]+=x` and `D[r+1]-=x`.
2. **Why can the final cancellation use a sentinel slot?** It marks a boundary after the final output element and is never itself emitted.
3. **How many scans are needed after q updates?** One O(n) reconstruction after O(q) marker updates.
4. **Why are these updates called offline?** The final array is reconstructed after all operations rather than made queryable after every operation.

Sources: [USACO Guide: More Prefix Sums](https://usaco.guide/silver/more-prefix-sums), [CSES Range Update Queries](https://usaco.guide/problems/cses-1651-range-update-queries/solution).
