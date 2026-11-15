# backtracking, subsets, permutations, and combinations — Reference: Permutations, used-state, and duplicate control

## Scope and version

This lesson explains the seven supplied permutation and duplicate-handling terms.

## How this group fits the mental model

A permutation is built position by position. Every input index can be selected once; duplicate values at different indices can create identical outputs, so a canonical choice rule is needed.

## Supplied names explained

- Permutation generation — Choose an unused input position for each output position.
- Used-element boolean array — Tracks selected indices in a recursive prefix.
- Swap-based in-place permutation — Fix one array position, swap a candidate into it, recurse, then swap back.
- Duplicate values after sorting — Equal values become adjacent, enabling a local rule.
- Same-depth duplicate skip — For unique outputs, skip a duplicate candidate if its equal predecessor has not been used in the current path.
- Distinct positions with equal values — Positions remain separate inputs even when their value is equal.
- Lexicographic next permutation boundary — A separate iterative technique: find rightmost ascent, swap with successor, reverse suffix; not the recursive unique-permutation pattern.

## Building and restoring permutation state

For n distinct positions, recursion depth is the next output position. A used array indexed by input position makes legality constant-time:

```text
Search:
    if path length is n: save a copy; return
    for each input index i:
        if used[i]: continue
        used[i] = true
        append value[i]
        Search
        remove last path value
        used[i] = false
```

The two undo operations must happen after every child branch. A finally block can help when recursion can throw and mutable state must remain usable, although ordinary contest solutions assume no exception during traversal. Alternatively, swap-based recursion fixes one output position in the array, tries each remaining index there, recurses to the next position, and swaps back. It uses O(n) recursion plus the result, without a used array or separate path, but mutates its working array and makes restoration correctness central. Clone the caller's array first if caller state must remain unchanged.

With duplicates, sorting is a canonicalization aid; it does not make equal occurrences the same input position. The common used-array rule is: when values[i] equals values[i-1], skip i if i-1 is currently unused. This forces equal copies to enter a path from left to right. For [1a,1b,2], choosing 1b before 1a would represent the same value-prefix, so it is skipped; after 1a is in the path, 1b is legal and creates the required second 1.

If value frequencies are c1, c2, ..., ck, the number of distinct output permutations is n!/(c1!c2!...ck!). This is a multiset-permutation count: swapping labels among equal occurrences does not produce a new value sequence.

## Lexicographic next permutation

This iterative operation transforms one arrangement into its immediate successor in lexicographic order:

1. Scan from right to left for the rightmost pivot i with a[i] < a[i+1].
2. If no pivot exists, the sequence is nonincreasing and already the last permutation; an API must choose whether to report no successor or wrap to the sorted first permutation.
3. Otherwise find the rightmost element greater than the pivot. The suffix is nonincreasing, so this is the smallest suffix value that is still greater than the pivot.
4. Swap pivot and successor, then reverse the suffix. Reversal changes the suffix from descending to ascending, making the result the smallest sequence greater than the original.

For [1,3,2], the rightmost ascent is 1<3 at index 0. The rightmost suffix value greater than 1 is 2; after swapping and reversing the suffix, the result is [2,1,3]. Strict comparisons also support repeated values. This operation enumerates unique permutations if started from a sorted arrangement and repeatedly advanced until the last arrangement; it is not the same as recursive branching, and emitting P arrangements still costs Θ(n·P).

## Cross-item comparison

For distinct inputs, used-state is sufficient. For duplicates, sorting plus depth-aware skipping ensures equal values are chosen in a consistent order. In-place swapping avoids a used array but requires restoring every swap, including after recursive calls.

## Examples

For [1,1,2], at depth zero choose the first 1; the second 1 is skipped because its equal predecessor is unused. At the next depth, the second 1 may be chosen because the first is already used, allowing output [1,1,2].

## Common mistakes

- Skipping every duplicate globally and losing multiplicity.
- Skipping equal predecessor even when it is used, which can remove valid repeated-value permutations.
- Forgetting to undo a swap.
- Using a subset start index for permutations and eliminating valid orderings.
- Assuming next-permutation has a successor after a fully descending sequence without defining wraparound behavior.
- Finding the leftmost ascent or choosing an arbitrary larger suffix element, which skips lexicographic arrangements.

## Knowledge checks with answers

1. **Why use indices in used-state?** Equal values may be distinct input occurrences.
2. **When does same-depth skip apply?** Equal predecessor is unused in the current prefix.
3. **Why sort first?** It makes equal values adjacent.
4. **What must swap-based recursion restore?** The original array order before exploring the next branch.

Sources: [USACO Guide: Complete Search with Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp), [USACO Guide: Competitive Programming 2](https://usaco.guide/CP2.pdf).
