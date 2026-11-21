# constraint search, pruning, and puzzle backtracking — Reference: Search heuristics and sound pruning

## Scope and version

This reference covers variable/value ordering and rules that reduce an exact search tree. They are general methods rather than versioned APIs.

## How this group fits the mental model

The search tree contains candidate assignments. Ordering decides which valid branch to examine first; pruning decides whether a whole branch can be discarded. Ordering may improve time to a first solution but does not alter completeness. Pruning is safe only when it proves no required solution lies in the discarded branch.

## Supplied names explained

- **`Most-constrained-variable heuristic`:** choose the unassigned variable with the smallest legal domain to expose failure early.
- **`Minimum remaining values`:** the conventional name for selecting the variable with the fewest remaining candidates; ties can use a deterministic secondary rule.
- **`Fail-first ordering`:** prioritize decisions expected to reveal contradictions soon; it is a heuristic order, not permission to skip alternatives.
- **`Candidate ordering`:** order a variable's values, perhaps trying a promising value first; exact search still visits the rest unless a proof rules them out.
- **`Bound-based pruning`:** stop a branch when a valid lower/upper bound proves it cannot meet a target or improve the current optimum.
- **`Early contradiction detection`:** evaluate a constraint as soon as enough choices are known instead of waiting for a complete assignment.
- **`Symmetry breaking`:** restrict equivalent choices to a canonical representative, only when the transformation preserves the required answer semantics.
- **`Duplicate-state elimination`:** memoize a complete key of future-relevant state so an equivalent subproblem is not explored repeatedly.
- **`Sound-pruning proof`:** establish that every completion of a rejected state is impossible or irrelevant to the requested result.
- **`Worst-case search tree`:** the maximum branching/depth expansion allowed by the input; successful pruning on samples does not remove this complexity bound.

## Cross-item comparison

The most-constrained-variable rule and fail-first ordering choose which branch comes first; they should not remove any candidate. Bound-based pruning and early contradiction detection may remove branches, but need a correctness argument. Symmetry breaking and duplicate-state elimination also discard work, but rely on a canonicalization proof or a complete memoization key. A guessed “unlikely” branch is not sound pruning.

## Examples

For Sudoku, if remaining empty cells have domain sizes 5, 2, and 4, MRV selects the size-2 cell. If neither value works, failure is exposed before exploring the other cells. Both values must still be tried. In equal-sum buckets, if a positive number exceeds a bucket's remaining capacity, that placement is impossible and can be pruned; trying the same next number in two buckets with identical current loads is redundant because those bucket labels are interchangeable.

## Common mistakes

- Treating a promising candidate order as a proof that later candidates can be omitted.
- Breaking symmetry among buckets when they have different future constraints or identities.
- Memoizing only part of the state, so distinct subproblems are incorrectly treated as equal.
- Claiming a heuristic makes worst-case complexity polynomial without proof.
- Applying an optimization whose domain assumptions (such as nonnegative item sizes) do not hold.

## Knowledge checks with answers

1. **Does MRV discard candidates?** No; it selects a variable, then all legal values still need consideration.
2. **What is required to prune a branch?** A proof that no required answer can be lost.
3. **When is same-load bucket skipping safe?** Buckets are interchangeable and have identical constraints, so swapping their labels preserves feasibility.

Sources: [USACO Guide: Complete Search](https://usaco.guide/CP2.pdf), [USACO Guide: Complete Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp).
