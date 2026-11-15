# backtracking, subsets, permutations, and combinations — Reference: Subsets, combinations, and choose/skip search

## Scope and version

This lesson explains the eight supplied subset and combination-generation terms.

## How this group fits the mental model

Subsets decide independently whether to include each position. Combinations select values while imposing an ordering on candidate indices so equivalent selections are generated once.

## Supplied names explained

- Subset choose-or-skip recursion — Branch include/exclude at every input position.
- Combination generation — Select a multiset of candidates satisfying a condition, without regard to order.
- Candidate start index — Earliest index permitted for the next choice.
- Nondecreasing choice indices — Preserve index order and avoid permutation duplicates.
- Avoid permutation duplicates in combinations — Do not explore the same values in different arrangements.
- Combination sum with reuse — Recurse from the chosen index so it can be selected again.
- Combination sum without reuse — Recurse from the next index so each position is used once.
- Empty subset — The result formed by choosing nothing; included in the power set.

## Search templates and invariants

### Choose or skip each position

A binary include/exclude recursion has two branches per position. At depth i, the path contains the selected values among positions before i; after both branches, it again contains exactly the parent's selections. At i=n, copy the path. An equivalent loop-based subset search records the current path at each node, then chooses each possible next index. The loop version uses O(n) stack depth and emits a subset when visited; binary recursion uses O(n) stack depth and emits at leaves. Both enumerate the same power set.

### Canonical combination order

For combinations, pass a start index and only consider i >= start. After choosing i, recurse with i+1 for single-use positions or i for unlimited reuse. This creates nondecreasing indices along the path. A target sum adds remaining as state; a subset-only search needs no target. When all candidates are positive and sorted, a candidate above remaining permits break; when values can be negative, neither that break nor pruning merely because a partial sum is too large is generally valid.

For duplicate-valued single-use candidates, sort and skip an equal value only when it is a later sibling choice: i > start and values[i] == values[i-1]. The start comparison is essential. At a deeper recursive call start has advanced, so another equal occurrence can be chosen to satisfy a required multiplicity. For example, [1,1,6] must remain possible even though selecting the second 1 as a root-level first choice is redundant.

## Output and complexity distinctions

For n indexed inputs, the power set has exactly 2^n subsets. Their total number of stored elements is n·2^(n-1) for n>0, because each position appears in half of all subsets. Thus writing all subsets costs Θ(n·2^n) time and storage, although the decision tree has 2^n leaves and a single current path needs only O(n) auxiliary space.

Combination count depends on constraints. Without reuse and with distinct candidates, the number of k-element selections is at most the binomial coefficient C(n,k); across all sizes it is 2^n. With unlimited reuse from m candidate types and exactly k picks, the number of multisets is C(m+k-1,k). A target bound may constrain k only when candidate values have a positive minimum. These counts help distinguish search overhead from returned-answer size.

## Worked duplicate trace

For sorted [1a,1b,2] in a single-use unique-combination search, at root depth the branch choosing 1a is explored and the sibling choice 1b is skipped. Inside the 1a branch, the next call may choose 1b, so [1,1] is still reachable. A global skip of every later equal value would incorrectly remove it. In contrast, a permutation needs order to vary, so its duplicate rule uses used-position state rather than a monotonically increasing start index.

## Cross-item comparison

Subsets have 2^n positional choices. Combinations may have different branching depending on sum and reuse rules. Reuse determines whether the recursion index stays at i or advances to i+1. With duplicate values, same-depth skipping after sorting is needed for unique value combinations.

## Examples

For candidates [2,3,6,7], target 7 with reuse, choosing 2 continues from its own index; choosing 3 continues from its index. Since candidates are positive and sorted, stop a loop once candidate exceeds remaining sum. Without reuse, the next index is i+1.

## Common mistakes

- Advancing the start index after a reusable choice and losing repeated use.
- Keeping the same index for a single-use candidate.
- Permuting combinations by restarting at zero.
- Omitting the empty subset.
- Applying positivity-based pruning to negative candidates.
- Using a global duplicate skip and accidentally removing a valid repeated-value selection.
- Reporting only search-node count when every emitted subset must also be copied.

## Knowledge checks with answers

1. **Why is candidate index nondecreasing?** To generate each combination in one canonical order.
2. **How do reuse variants differ?** Same index for reuse; next index for single use.
3. **When is the empty subset emitted?** The empty path is a valid subset.
4. **What makes remaining-sum break valid?** Candidates are positive and sorted.

Sources: [USACO Guide: Complete Search with Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp), [USACO Guide: Competitive Programming 2](https://usaco.guide/CP2.pdf).
