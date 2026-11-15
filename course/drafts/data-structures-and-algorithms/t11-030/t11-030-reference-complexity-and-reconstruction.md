# sequence and string dynamic programming — Reference: Rolling arrays, reconstruction, and validation

## Scope and version

This lesson compares the supplied complexity and recovery techniques for sequence DP. See [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp) and the [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf) for general DP treatment.

## How this group fits the mental model

Once a recurrence is correct, count its states and work per state. Then decide what output is required: only an optimum value, one witness, or every witness. Memory compression is valid only if the retained state still contains everything needed for the next transition and requested output.

## Supplied names explained

- **O(nm) two-sequence DP** — A table over all prefix pairs has `(n+1)(m+1)` states. If each transition performs constant work, time is `O(nm)`. The same table needs `O(nm)` memory.
- **Rolling two-row optimization** — When row `i` depends only on row `i-1` and the current row, keep two arrays of width `m+1`, clear or overwrite the next row correctly, then swap. Value memory becomes `O(m)`; choose the shorter string as the column dimension where symmetry allows. A one-row update may be possible but has more delicate old/new-value dependencies.
- **LIS O(n log n) tails method** — Binary-search a sorted-by-length summary for each value. It reduces time from `O(n²)` to `O(n log n)` and uses `O(n)` space. For strictly increasing subsequences, lower bound locates the first tail `>= x`.
- **Reconstruct one optimal alignment** — Start from a terminal state and follow predecessor transitions that preserve its value. Emit matched characters or operations as appropriate, then reverse if collected backward. Ties can yield different but equally optimal answers.
- **Backtrack choice table** — Store which predecessor was selected while filling the value table. This makes reconstruction direct at the cost of additional memory. A direction table may be smaller than storing complete strings in each state.
- **Prefix-index conversion** — Prefix length `i` means the next character to consume has zero-based index `i`; it is `s[i]` when `i<n`. A state over the first `i` characters uses `s[i-1]` as its final character when `i>0`. State clearly whether endpoints are inclusive or prefix lengths.
- **Substring versus subsequence counterexample** — In `"abcde"`, `"ace"` is a subsequence but not a substring. The example exposes whether a recurrence illegally skips characters in a contiguous problem.
- **Brute-force comparison for short strings** — For small inputs, enumerate all subsequences or all substrings, compute the result directly, and compare with the DP. This is a strong way to test transition and boundary mistakes; exponential brute force is for checking tiny cases, not production constraints.

## Cross-item comparison

Two-row compression preserves only value dependencies and generally loses the path. A choice table preserves enough history to reconstruct one result. LIS tails compresses a different mathematical summary, not rows of the quadratic recurrence. Complexity must be stated for the chosen implementation, including auxiliary storage and any substring construction costs.

## Examples

For two length-1000 strings, an `(n+1) × (m+1)` integer table has about one million cells; two rows need about two thousand cells. If the answer must include an actual LCS, rolling rows alone do not retain enough decisions. A separate reconstruction strategy or full table is needed.

## Common mistakes

- Claiming `O(m)` memory while retaining a full table for reconstruction.
- Failing to reset cells in a reused row, allowing stale values to leak.
- Giving a complexity that ignores work to create or hash candidate substrings.
- Treating the LIS tails summary as a direct reconstruction.
- Using a brute-force oracle on constraints large enough to make it exponential.

## Knowledge checks with answers

1. **When do two rows suffice?** When every new row depends only on the immediately previous row and the current row's already-computed cells.
2. **Does rolling DP automatically reconstruct an answer?** No; discarded history must be restored by stored decisions or another method.
3. **Why compare brute force only on tiny inputs?** Its exhaustive state space grows exponentially, while it is useful as an independent oracle at small sizes.
