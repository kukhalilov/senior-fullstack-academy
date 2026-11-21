# constraint search, pruning, and puzzle backtracking — Interview questions and reasoning

## Core questions

1. What is the state of one recursive call, and what is its invariant?
2. What is the difference between a consistent partial assignment and a complete solution?
3. How does MRV differ from pruning?
4. What proof obligation does a pruning rule have?
5. Why must mutable state be restored before exploring a sibling?
6. When is symmetry breaking safe?
7. How do you estimate search complexity and explain practical pruning?

## Concise interview answers

1. A call represents the decisions made on one root-to-node path; its mutable state must encode exactly those decisions and their constraints.
2. A consistent partial assignment has no currently exposed violation; a complete solution assigns every required variable and satisfies every constraint.
3. MRV chooses which variable to branch on first while still exploring its legal values. Pruning discards a branch and must prove it contains no required answer.
4. Show that every completion of the rejected state is invalid or irrelevant to the requested result.
5. So each sibling sees the same parent assignment, avoiding contamination from the previous branch.
6. Only when a transformation preserves the problem and every required answer has a canonical equivalent retained by the restriction.
7. Bound branching factor and depth, multiply by work per node and account for output; pruning often improves practical behavior but does not automatically change worst-case exponential/factorial growth.

## Deep follow-up answers

### Explain soundness and completeness

Soundness means every answer emitted at a complete leaf satisfies the original constraints. Completeness means every valid answer is reached by a branch or represented by a proven equivalence transformation. A heuristic ordering is compatible with completeness as long as remaining candidates are eventually tried. An unproved prune violates completeness. Restoration is part of the proof because it ensures a sibling explores the intended state rather than one modified by an earlier branch.

### When should you use propagation?

When a decision logically removes values from unassigned variables and that work is likely to avoid more expensive descendants. Forward checking updates directly affected domains; stronger propagation can derive further implications but costs time and requires reversible updates. Measure cost per node against the search reduction; more propagation is not automatically faster.

### Why does MRV often help?

It chooses a variable with few legal values, so a contradiction or forced choice is exposed early. It is a value-ordering/variable-ordering heuristic, not a correctness shortcut. It may cost extra to compute each domain; in Sudoku, masks make domain counts cheap.

### How do you prune interchangeable buckets?

At one recursive depth, if two unlabeled buckets have equal current loads and identical constraints, assigning the next item to either produces states equivalent under swapping bucket labels. Try one load only. This is unsafe if buckets have different identities, costs, or eligibility rules.

### How do you use a trie for multiple grid words?

Build a trie of dictionary words, then traverse the board while carrying the node for the current prefix. A missing child proves no dictionary word continues that branch. Clear terminal words after reporting them and remove a trie node only after it has no remaining terminal or descendants. Restore visited board markers after each DFS path.

### What is the role of a bit mask?

A small finite set can be encoded by bits, making membership, union, and candidate subtraction constant-time machine operations. The domain must fit the chosen integer width; in C#, shifts do not widen values, so larger domains require a wider or arbitrary-precision representation. Bit masks accelerate constraint checks but do not reduce the search tree by themselves.

## Scenario questions

- Sudoku has one empty cell with two candidates and many cells with six. Which cell do you choose? **The two-candidate cell under MRV; try both candidates if necessary.**
- Your N-Queens solver returns one board but the prompt asks for all distinct boards. What changes? **Save each complete board and continue every remaining branch; do not apply reflection pruning unless output equivalence explicitly allows it.**
- A word-search solver marks cells in a global visited set. What can go wrong? **A cell visited in one failed path may still be needed by a different valid path; visitation is path-local and must be undone.**
- Two equal-load sides both accept the next matchstick. Can one side be skipped? **Yes for identical square sides, because swapping their labels preserves all future possibilities.**
- You prune a branch because it “looks unlikely.” Is that valid? **Not for exact feasibility/enumeration unless the rule proves no required solution is lost.**

## Tradeoffs and alternatives

- **Fixed order vs MRV:** fixed order is simpler and has less selection overhead; MRV can expose failures earlier but requires candidate-domain evaluation.
- **Forward checking vs no propagation:** forward checking costs state updates but can detect empty future domains before deeper recursion.
- **Sound pruning vs heuristic guesses:** pruning may reduce work only when justified; guesses can miss valid answers.
- **Symmetry breaking vs duplicate filtering:** symmetry breaking avoids generating equivalent branches; filtering after enumeration still pays to produce them and may be invalid if those outputs are distinct answers.
- **Find one vs enumerate all:** stopping at the first complete solution is efficient for feasibility, while enumeration must copy and preserve every answer and may be output-dominated.
- **Backtracking vs dynamic programming:** backtracking explores assignments; memoized DP is preferable when many paths reach the same future-relevant state. A complete memo key is essential.

## Common weak answers

- “The partial state is valid, so it can be completed.” Local validity does not prove extendability.
- “MRV prunes the bigger domains.” It selects a variable; legal values of that variable still need exploration.
- “Trying the best-looking candidate first lets us skip the rest.” Candidate order alone does not prove alternatives impossible.
- “I restore the board only on failure.” A successful Word Search path may still need restoration before returning; an in-place Sudoku solver intentionally retains success.
- “Symmetry means half the answers are duplicates.” Distinct board configurations may still be separately required outputs.
- “It is exponential, so it cannot work.” Small input bounds and strong sound pruning can make exact search appropriate; analyze actual constraints.

## Self-check rubric

You are ready to explain constraint search if you can:

- Define the recursive state and its invariant precisely.
- Separate valid partial state from complete solution.
- Distinguish ordering heuristics from branch-eliminating rules.
- Prove every prune is sound and show all remaining legal candidates are covered.
- Restore each changed piece of state before sibling recursion.
- Justify symmetry with a solution-preserving mapping.
- Estimate worst-case nodes, work per node, recursion depth, and output size.

Sources: [USACO Guide: Complete Search](https://usaco.guide/CP2.pdf), [USACO Guide: Complete Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp).
