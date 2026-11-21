# constraint search, pruning, and puzzle backtracking — Reference: Variables, domains, and constraint state

## Scope and version

This reference defines the names for representing an exact-search problem. These are general algorithm concepts, not versioned APIs.

## How this group fits the mental model

Backtracking is useful only after the problem is represented precisely: identify decisions, their legal values, the partial state, and the rules that constrain it. These definitions determine what a recursive call must remember and what it may safely reject.

## Supplied names explained

- **`Variable`:** a decision position whose value must be selected, such as one board row's queen column or one empty Sudoku cell.
- **`Domain of candidate values`:** values still permitted for a variable under the current partial assignment.
- **`Partial assignment`:** values chosen for some but not all variables along the current search path.
- **`Constraint predicate`:** a rule that determines whether a completed assignment is allowed; some predicates can also reject partial states when already violated.
- **`Complete assignment`:** an assignment to every required variable that satisfies every constraint.
- **`Consistency check`:** a check that a current choice does not violate the constraints that can already be evaluated.
- **`Remaining-domain representation`:** the current legal candidate set for each unassigned variable, recomputed or maintained incrementally.
- **`Constraint propagation`:** derive consequences of assignments and remove values that can no longer occur in any valid completion.
- **`Forward checking`:** after a choice, update directly affected future domains and reject when one becomes empty.
- **`Dead-end detection`:** detect that the branch has no legal continuation, for example an empty domain or an exceeded capacity.

## Cross-item comparison

A consistency check sees whether the current partial state already breaks a rule. Propagation may infer additional restrictions on unassigned variables. Forward checking is a limited propagation step focused on variables immediately affected by the latest choice. A dead-end is the conclusion that no candidate remains for a required next decision. All must be based on the same constraint model so they cannot reject a valid completion.

## Examples

In N-Queens, a variable is a row's queen column; its initial domain is `0..n-1`, reduced by occupied columns and diagonals. In Sudoku, a cell's domain consists of digits absent from its row, column, and box. In a word-search path, the next variable is the next character position and its domain is neighboring cells with the needed character, excluding cells already used on this path.

## Common mistakes

- Calling a partial assignment a solution before every required variable is assigned.
- Using only an immediate consistency check when a future domain has already become empty.
- Maintaining candidate domains without recording how to restore removed candidates.
- Defining variables that do not match the actual decisions, making the recursion omit or duplicate cases.

## Knowledge checks with answers

1. **Can a consistent partial assignment still be impossible to complete?** Yes; consistency only rules out currently visible violations.
2. **What does forward checking do after a choice?** Removes values made impossible in directly affected remaining domains and detects empty ones.
3. **What makes a complete assignment a solution?** Every required variable has a value and every constraint is satisfied.

Sources: [USACO Guide: Complete Search](https://usaco.guide/CP2.pdf), [USACO Guide: Complete Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp).
