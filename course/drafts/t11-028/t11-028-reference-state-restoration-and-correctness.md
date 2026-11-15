# constraint search, pruning, and puzzle backtracking — Reference: Mutation, restoration, and validation

## Scope and version

This reference covers safe mutable state, stopping behavior, solution validation, and correctness checks for search. These are general algorithm techniques, not versioned APIs.

## How this group fits the mental model

Recursive siblings must start from the same parent state. Correct backtracking therefore has two obligations: every branch that may contain an answer is explored, and every failed branch restores the shared state before a sibling begins.

## Supplied names explained

- **`Choose-recurse-undo sequence`:** apply one candidate, recursively explore it, then reverse its state change before testing another candidate.
- **`Restore board cell`:** write back the exact saved character/value after the recursive path using that cell returns.
- **`Restore domain candidate`:** reinsert or unmark values removed from an unassigned variable's domain on the current path.
- **`Stop after first solution`:** return as soon as one complete valid answer is found when the task asks only for existence or one solution.
- **`Enumerate all solutions`:** save each complete answer and continue exploring every remaining legal branch.
- **`Validate complete assignment`:** check all constraints at a leaf, or rely on incremental checks only when they prove all constraints are maintained.
- **`Partial validity versus extendability`:** passing current checks means no known contradiction, not necessarily that a completion exists.
- **`Brute-force tiny-case comparison`:** compare a pruned solver with an unpruned exhaustive implementation on small inputs to detect unsound pruning.
- **`Exponential versus factorial growth`:** branching over subsets often yields `2^n` states; assigning distinct ordered positions can yield `n!` permutations, before pruning.

## Cross-item comparison

`Stop after first solution` can leave an in-place board solved because no sibling will be explored. `Enumerate all solutions` must copy each leaf result and undo mutations so later results are independent. Brute-force tiny-case comparison is a validation technique, while a formal correctness proof explains why all cases are covered for every allowed input. Neither replaces runtime assertions for examples and edge cases.

## Examples

```text
old = board[r][c]
board[r][c] = choice
if Search(next):
    return true          // retain solved board for a one-solution in-place API
board[r][c] = old       // failed branch; restore before sibling
```

For a path list: append the choice, recurse, and remove the last entry. For a bit mask, set a bit before recursion and clear it afterward unless successful termination intentionally preserves the solved state.

## Common mistakes

- Returning from an inner branch without undoing state when the parent will continue searching.
- Saving references to a mutable board as all-solutions output instead of deep-copying it.
- Claiming completeness while skipping candidates based on an unproved heuristic.
- Treating a locally valid partial board as a completed solution.
- Comparing against brute force only on large cases where both versions share the same bug; tiny exhaustive cases are most useful.

## Knowledge checks with answers

1. **What state should a failed child leave for its sibling?** Exactly the parent partial assignment, with all child-only changes undone.
2. **Why copy an all-solutions board at a leaf?** Later search mutations would otherwise change the saved answer.
3. **What do completeness and soundness mean?** Completeness misses no valid answer; soundness emits no invalid answer.

Sources: [USACO Guide: Complete Search](https://usaco.guide/CP2.pdf), [USACO Guide: Complete Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp).
