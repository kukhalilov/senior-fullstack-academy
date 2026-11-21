# two-pointer and sliding-window techniques — Reference: Tradeoffs and failure modes

## Scope and version

This reference covers the five supplied tradeoff terms. Complexity assumes constant-time indexing and arithmetic; comparison sorting generally costs O(n log n).

## How this group fits the mental model

The one-pass appeal of pointers depends on proof and contract. Check ordering, monotonicity, mutation, duplicate semantics, and boundary conditions before selecting the pattern.

## Supplied names explained

- `Sort-then-scan time and space tradeoff` — Sorting may enable elimination and a later linear scan, but total cost includes sorting. Sorting a copy adds O(n) space; in-place sorting may still use implementation-dependent stack/workspace. Preserve original indices when required and account for changed order.
- `Stable in-place update` — Reuse input storage while preserving the order of retained values. A read/write scan can use O(1) auxiliary space. Usually only the returned prefix is meaningful; the suffix may need explicit filling if required by the contract.
- `Duplicate handling` — Decide if identity is by value or by input position. Unique value-combination tasks skip repeats; index-based tasks may accept equal values at distinct positions. Frequency tasks must preserve multiplicity.
- `Negative values invalidate monotone sum-window reasoning` — Adding a negative can lower sum; removing one can raise it. Therefore a threshold sum predicate may cease to behave monotonically as a window expands or contracts, invalidating the usual forward-only shortest-window proof. Other window invariants require their own analysis.
- `Empty and single-element boundaries` — Follow the stated constraints and define behavior before indexing. Pair tasks need two distinct positions; a one-element inclusive window has length one; empty input cannot safely use index zero. Initialize extrema so valid negative answers are not accidentally replaced by zero.

## Cross-item comparison

`Sort-then-scan time and space tradeoff` buys useful ordering with preprocessing cost. `Stable in-place update` reduces allocation while mutating data. `Duplicate handling` follows result identity semantics. `Negative values invalidate monotone sum-window reasoning` signals a failed proof assumption. `Empty and single-element boundaries` are contract checks that prevent invalid reads and wrong initialization.

## Examples

For 3Sum, sorting then scanning has O(n log n) preprocessing and O(n²) total scan time; duplicate skipping avoids repeated value triplets. For stable compaction of `[0,5,0,2]`, the valid prefix becomes `[5,2]`; fill the tail only if requested.

## Common mistakes

- Omitting the sort cost from complexity.
- Claiming O(1) space while sorting a copy or allocating output.
- Skipping equal values when equal positions are distinct results.
- Applying the nonnegative sum-window proof to signed data.
- Returning zero as a maximum when all valid values may be negative.
- Treating an empty input and “no solution” as the same without checking the contract.

## Knowledge checks with answers

1. **What dominates sort-then-linear-scan time?** Usually the O(n log n) sort.
2. **Does in-place mean the input is unchanged?** No; it means the operation reuses that storage and may mutate it.
3. **When is duplicate skipping unsafe?** When distinct index tuples are requested.
4. **What must replace a failed negative-sum window proof?** A method whose invariant handles signed prefix sums, such as an appropriate prefix-sum/deque approach for the precise problem.

Source: [USACO Guide: Two Pointers](https://usaco.guide/silver/two-pointers).
