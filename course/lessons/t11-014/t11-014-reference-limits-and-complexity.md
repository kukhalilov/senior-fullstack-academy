# greedy choices, invariants, and correctness proofs — Reference: Failure modes, alternatives, and analysis

## Scope and version

This lesson explains the nine supplied boundaries, alternatives, and analysis terms for greedy algorithms.

## How this group fits the mental model

Greedy code can be short and fast while its choice rule is wrong. Correctness, input assumptions, tie behavior, and implementation cost must each be assessed separately.

## Supplied names explained

- Counterexample to local optimum — A valid small input where the locally preferred choice yields a worse final objective or no feasible solution, while another first choice succeeds.
- Choice blocks globally better completion — A greedy step may consume scarce capacity, a denomination, or a slot needed by a more valuable later combination. Identify this conflict when constructing adversarial examples.
- Greedy versus dynamic programming — Greedy commits to one choice based on a proof. DP compares multiple states or choices and reuses overlapping subproblems. DP is often safer when future value depends on which resource was consumed, though it may cost more time and memory.
- Greedy versus exhaustive search — Exhaustive search enumerates alternatives and can serve as a correctness oracle on tiny inputs, but usually grows exponentially or factorially. Greedy can reduce work only when justified by structure.
- Sorting cost in greedy algorithm — Comparison sorting n candidates usually costs O(n log n); any linear scan after it does not make the total O(n). If the keys lie in a bounded integer domain, a different sorting method may alter the bound but needs its own assumptions.
- Priority-queue operation cost — A binary heap supports peek in O(1) and insertion/removal in O(log n); building a heap from n elements can be O(n). Count each operation and any initial sorting.
- Tie-breaking correctness — Equal primary keys may be interchangeable under the proof, or a secondary key may be necessary. State deterministic comparison behavior and prove the tie case.
- Input-assumption dependence — Positivity, sorted order, unique answer, common release time, bounded value range, and endpoint inclusivity can be essential. A correct algorithm under one contract may fail when any assumption changes.
- Approximation algorithms are distinct from exact greedy proofs — An approximation algorithm proves a bound on solution quality (for example, a ratio relative to optimum). A heuristic may have no such guarantee. Neither is an exact greedy proof unless it always returns an optimum under the contract.

## Cross-item comparison

A counterexample rejects a proposed exact rule. DP or exhaustive search can replace it or act as an oracle. Sorting and heap costs describe runtime, not correctness. Approximation guarantees describe quality when exact optimization is not promised.

## Examples

For arbitrary coin denominations {1,3,4}, the greedy choice 4 for amount 6 blocks the two-coin solution 3+3. A DP over amounts can compare all denominations and recover the exact minimum. For a different denomination system, a proof may establish greedy optimality; the counterexample shows why the assumptions must be explicit.

When choosing among equal finish times for unweighted interval scheduling, a deterministic secondary sort by start or input index can make output reproducible. The correctness proof must show that the primary finish-time property remains satisfied. If intervals carry weights, the unweighted exchange proof no longer establishes a maximum-weight result.

## Common mistakes

- Reporting only the scan cost and omitting sort or heap work.
- Treating a passed random test suite as a guarantee.
- Comparing greedy against a brute-force oracle with different tie or feasibility semantics.
- Using an exact-optimum label for an algorithm that only has an approximation ratio.
- Forgetting that output size can dominate even a linear decision scan.

## Knowledge checks with answers

1. **How can a local rule be disproved?** Give a valid input where its result is suboptimal or infeasible.
2. **When does DP help?** When alternative states overlap and their values can be reused to compare future outcomes.
3. **What is the total cost of sort then scan?** Sorting plus scan, typically O(n log n)+O(n)=O(n log n).
4. **What does an approximation proof promise?** A specified bound relating the returned solution to the optimum, not necessarily equality.

Sources: [USACO Guide: Greedy](https://usaco.guide/bronze/intro-greedy), [USACO Guide: Greedy Sorting](https://usaco.guide/silver/greedy-sorting), [Competitive Programmer's Handbook](https://usaco.guide/PAPS.pdf).
