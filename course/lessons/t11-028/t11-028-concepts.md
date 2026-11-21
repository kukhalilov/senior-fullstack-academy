# constraint search, pruning, and puzzle backtracking — Core concepts and how they fit together

## Learning objectives

- Define variables, domains, partial assignments, constraints, and complete solutions.
- Separate immediate consistency from the harder question of whether a partial state is extendable.
- Use fixed order, minimum remaining values, candidate order, forward checking, and proven pruning appropriately.
- Explain symmetry breaking and why it requires a solution-preserving argument.
- Restore all mutable state and state a soundness/completeness proof for recursive search.
- Estimate branching/depth growth and use bit masks safely for small finite domains.

## Prerequisites

Know recursion, arrays/collections, graph or tree traversal, Boolean predicates, and basic time/space complexity. A backtracking call represents one node in an implicit search tree; its children are the legal next decisions.

## Core concepts

### Variables, domains, assignments, constraints

A **Variable** is a decision to make, such as the column for a row's queen, an empty Sudoku cell, or the bucket assigned to a number. Its **Domain of candidate values** is the set of values still allowed by the current state. A **Partial assignment** fixes some variables but not all. A **Constraint predicate** states a rule the final assignment must satisfy. A **Complete assignment** assigns every required variable and satisfies every constraint.

A **Consistency check** asks whether the partial assignment violates a rule whose needed values are already known. Consistency is necessary but not always sufficient for completion: a locally valid partial state can still leave a future variable with no legal value.

### Search tree and choose-recurse-undo

At each state, choose an unassigned variable and one candidate value. If the choice is consistent, record it, recurse, and then restore the prior state before the next candidate. The invariant at a recursive entry is that the mutable state represents exactly the decisions along that search path. A complete assignment is an answer; no remaining candidate means a dead end.

When returning a single solution or Boolean feasibility result, a successful branch may stop the search and retain its completed state if the caller needs that solution. When enumerating all solutions, save/copy each completed answer and restore state before continuing. A mutable working board cannot be reused as an output snapshot without copying it.

### Forward checking and propagation

**Constraint propagation** derives consequences of current assignments and removes impossible values from remaining domains. **Forward checking** is a limited form: after a choice, update domains of directly affected unassigned variables. **Dead-end detection** finds an empty remaining domain and rejects that branch immediately. These methods must be reversible: log removed candidates, use reversible bit masks, or recompute domains from the assignment. Incorrect restoration can silently corrupt sibling branches.

### Search order and pruning

**Most-constrained-variable heuristic** (also called **Minimum remaining values**) chooses the unassigned variable with the fewest currently legal values. **Fail-first ordering** prioritizes choices likely to expose contradictions early. These heuristics change exploration order, not the valid solution set. **Candidate ordering** can try promising values first; unless it is a proven pruning rule, it must still eventually try the other candidates when completeness is required.

**Bound-based pruning** rejects a partial state when a mathematical bound proves it cannot improve or reach a valid result. **Early contradiction detection** checks constraints before deeper recursion. **Symmetry breaking** selects a canonical representative from equivalent states, but is safe only when transformations preserve the task's solution semantics. **Duplicate-state elimination** memoizes equivalent search states; the state key must contain every fact that can affect future choices. A **Sound-pruning proof** must establish that every discarded branch contains no required answer. An unproven heuristic guess must not discard branches in an exact solver.

### Complexity

If each level has at most b choices and the depth is d, a loose bound is `O(b^d)` search nodes. Assigning distinct items to positions often gives factorial growth, while subset choices often give exponential growth. Pruning reduces explored nodes on many inputs but does not automatically improve the worst-case bound. Complexity should include work per node, state copying, and output size. Enumerating all solutions has a lower bound proportional to output size.

### Bit-mask domain representation

For a small domain, bit i can represent whether value i is present/occupied. Candidate extraction uses bitwise operations; a common low-bit idiom is `bit = mask & -mask`. It depends on the integer width and signed arithmetic of the language. In C#, shifts by 32 or more are masked for `int`, so do not assume `1 << n` keeps widening; use `long` only within its safe width or `BigInteger` for larger domains. For N-Queens with `n <= 9`, a 32-bit mask is comfortably wide. Always derive the full mask from a proven domain bound and mask shifted diagonals back to that width.

## Mechanisms and relationships

### Correctness proof structure

For **soundness**, show that every emitted complete assignment satisfies every constraint. For **completeness**, show that each legal next value is either explored or excluded by a proven sound pruning rule, and that every state change is restored exactly before a sibling is explored. Together these establish that the search returns valid answers and misses none. For a stop-after-first solver, the result is one valid solution if found; it does not enumerate the rest.

### Restoration patterns

- Mutate and restore: save the old board cell, write a sentinel/choice, recurse, and restore before continuing.
- Add/remove: add a candidate to a path, recurse, then remove it.
- Reversible state: set a row/column/diagonal bit and clear that exact bit on failure.
- Trail/log: record each domain deletion and undo to a saved trail length.

Early return after a found solution needs deliberate semantics: retain a solved board when solving in place, but copy a solution before unwinding if enumerating. If a recursive branch fails, all state it changed must be restored regardless of how many nested calls were made.

### Constraint models differ

N-Queens has pairwise column and diagonal conflicts. Sudoku has row, column, and subgrid uniqueness, with cell domains derived from those three constraints. Word Search has local adjacency and a path-specific no-cell-reuse rule; visited cells must be restored after exploring a path. Equal-sum partition problems assign items to capacity-limited, interchangeable buckets, making equal-load symmetry useful. Word Search II combines a grid path with a trie so a search branch ends when no dictionary word has the current prefix.

## Worked examples

In a four-queen board, place row 0 at column 1. The occupied-column set gains bit `1<<1`; one diagonal mask marks the next row's threatened column 2, and the other marks column 0. The next row may choose only columns not in any mask. After exploring a child, clear or recompute its masks before testing another column. Mask shifts model diagonal movement one row down and must be clipped to `fullMask`.

For Sudoku, suppose an empty cell has candidates `{2,7}` while another has `{4}`. Choosing the one-candidate cell first is the minimum-remaining-values heuristic: if 4 later conflicts, the branch fails immediately rather than after guessing several cells. This improves search order but does not prove a value is correct; the recursive solver still explores alternatives if a candidate fails.

## Misconceptions and edge cases

- A partial state passing current checks is not proof it can be completed.
- Pruning on a heuristic “looks unlikely” rule can make an exact solver incomplete.
- Sorting candidates changes order; it is not pruning unless branches are actually ruled out by proof.
- Symmetric states may still represent distinct required outputs, such as distinct N-Queens boards; do not suppress them when enumeration requires all.
- Mutable state must be restored on every failed path, including nested early exits.
- A successful stop-after-first search may intentionally leave the solution in the board; all-solutions enumeration must snapshot results.
- A bit mask is only safe when every represented index and shift fits the chosen integer type.
- Exponential search can still be appropriate when hard constraints keep n small, but the worst-case limit must be read carefully.

## Knowledge checks with answers

1. **What is a dead end?** A partial state with no legal extension under the next decision, often detected by an empty domain.
2. **Does MRV prune solutions?** No; it changes variable order, provided all candidates are still explored.
3. **What must justify symmetry breaking?** A proof that every required solution remains represented by the chosen canonical branches.
4. **Why restore a board cell?** A sibling branch must begin from exactly the parent state's decisions.
5. **Does practical pruning guarantee a polynomial worst case?** No.
6. **What should an all-solutions solver do at a leaf?** Copy/store the complete solution, then continue search with state restored.

Sources: [USACO Guide: Complete Search](https://usaco.guide/CP2.pdf), [USACO Guide: Complete Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp).
