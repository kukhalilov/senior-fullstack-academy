# constraint search, pruning, and puzzle backtracking — Big-picture orientation and mental model

## Problem and purpose

Constraint-search problems ask for a configuration that obeys many rules, or all such configurations. A naive approach tries complete assignments and checks them at the end. Backtracking builds one partial assignment at a time, rejects it as soon as a rule is broken, and undoes a choice before trying a sibling. It is the foundation for puzzles such as N-Queens and Sudoku, grid word paths, and equal-sum grouping.

## Plain-language mental model

Fill a row of seats one person at a time. After each placement, check whether any rule has become impossible. If so, erase the latest placement and try a different person. A partial arrangement may be valid so far but still impossible to finish; a sound pruning rule must prove that no completion can extend it before discarding the branch.

## How the parts fit together

| Question | Search component |
| --- | --- |
| What is being assigned? | Variables |
| What may each variable take? | Domain of candidate values |
| What has already been decided? | Partial assignment and mutable state |
| Is this choice currently allowed? | Constraint predicate / consistency check |
| Can future values be ruled out early? | Constraint propagation and forward checking |
| Which variable should be tried next? | Fixed order or most-constrained-variable heuristic |
| How is a branch explored safely? | Choose, recurse, undo |
| How is repeated work reduced? | Sound pruning, symmetry breaking, or duplicate-state elimination |

## Concept map

The search tree has one level per decision and one outgoing branch per legal candidate. Candidate domains and constraints define legal moves. A consistency check rejects immediate conflicts; propagation can shrink future domains. Search order changes how quickly a solution or contradiction may be found, but cannot remove valid solutions. Symmetry breaking may remove equivalent branches only when a proof shows that the required answers remain represented. Every mutable update must be restored before exploring a sibling.

## End-to-end walkthrough

For four queens, assign one row at a time. If a queen is placed in column 1 of row 0, columns and diagonals attacked by it become unavailable. At row 1, try only unoccupied columns not on an attacked diagonal. Continue until four queens are placed, yielding a complete solution, or no candidate remains, which is a dead end. Backtrack to the preceding row and try its next candidate. Bit masks encode occupied columns/diagonals compactly, but the search logic is still the same choose-check-recurse-undo process.

## When to use it and tradeoffs

Backtracking fits when the output is a solution, all solutions, or a feasibility answer and decisions combine into a partial state. Pruning can make a large practical difference, but it does not generally change exponential or factorial worst-case growth. For problems with many overlapping subproblems, dynamic programming may be a better model; for large structured constraints, specialized algorithms such as exact cover or solver libraries may be appropriate. Those are separate approaches, not automatic improvements to backtracking.

## What later lessons cover

The concepts lesson develops domains, consistency, propagation, order heuristics, pruning proofs, bit masks, and restoration. The reference lessons organize constraint states, search heuristics, puzzle-specific conflict structures, and correctness. The six practice lessons move from N-Queens and Sudoku through grid word search, capacity partitions, and trie-pruned multiword search. The interview lesson covers proof obligations and tradeoffs.

Sources: [USACO Guide: Complete Search](https://usaco.guide/CP2.pdf), [USACO Guide: Complete Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp).
