# constraint search, pruning, and puzzle backtracking — Reference: Common constraint structures

## Scope and version

This reference covers the exact constraint structures supplied for the puzzle applications in this unit. The structures are mathematical, not versioned library APIs.

## How this group fits the mental model

The choice of state representation determines how quickly a consistency check can answer whether a candidate is legal. A good representation mirrors the constraints directly: sets or bit masks for occupied chess lines, masks for Sudoku units, a visited marker for a path, and bucket totals for equal-sum partitions.

## Supplied names explained

- **`N-Queens column uniqueness`:** no two queens can share a column, so each chosen column is marked unavailable to later rows.
- **`N-Queens diagonal occupancy`:** queens conflict on diagonals when `row-column` or `row+column` matches; offset or shifted masks track attacked diagonals.
- **`Sudoku row constraints`:** each row contains digits 1 through 9 exactly once.
- **`Sudoku column constraints`:** each column contains digits 1 through 9 exactly once.
- **`Sudoku subgrid constraints`:** each 3 by 3 box contains digits 1 through 9 exactly once; for zero-based `(r,c)`, box index is `(r/3)*3+c/3`.
- **`Word-search visited cells`:** a cell may appear at most once in the current word path, but can be reused by another independent path after restoration.
- **`K-equal-subset capacity constraints`:** each of k bins must reach `total/k`; never let its running sum exceed the target, and all items must be used once.
- **`Bit-mask domain representation`:** one bit encodes one candidate/occupied value, enabling compact membership tests and candidate extraction when the domain fits the integer width.

## Cross-item comparison

Queens' column and diagonal rules are pairwise occupancy constraints, so bit sets make constant-time conflict checks. Sudoku has three intersecting all-different units, often represented with row/column/box masks. Word search is path-local, so marking and restoring board cells enforces no reuse without globally banning a cell. Equal-sum subsets use interchangeable capacity buckets; unlike the board puzzles, the key symmetry comes from bucket labels rather than geometry.

## Examples

For 8-Queens, a diagonal may be represented by `row-column+n-1` in `[0,2n-2]`, or by shifting attack masks one row at a time. For Sudoku digit `d`, bit `1<<d` can mark the digit in a row, column, and box; a candidate is legal only when that bit is absent in all three. For a word path, change a matched cell to a sentinel before exploring neighbors and restore the saved character afterward.

## Common mistakes

- Treating a row/column coordinate number as the diagonal ID without an offset for negative `row-column` values.
- Updating a Sudoku mask but forgetting to clear it after a failed candidate.
- Leaving a word-search cell marked when another branch starts.
- Using only a partial path's visited cells as a permanent global visited set.
- Shifting a bit beyond the integer width and assuming the mask grows automatically.

## Knowledge checks with answers

1. **Why can a board cell be reused by a different word-search path?** The no-reuse constraint is only within one path; restore it after backtracking.
2. **What does a Sudoku candidate mask combine?** Digits missing from the row, column, and 3x3 box.
3. **Why can equal-load buckets be symmetric?** Their labels do not affect the remaining item-to-capacity feasibility problem.

Sources: [USACO Guide: Complete Search](https://usaco.guide/CP2.pdf), [USACO Guide: Complete Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp).
