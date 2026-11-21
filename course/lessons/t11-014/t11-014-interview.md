# greedy choices, invariants, and correctness proofs — Interview questions and reasoning

## Core questions

1. How do you distinguish a greedy algorithm from a greedy heuristic?
2. What is an exchange argument, and what must it prove?
3. How do you formulate a useful invariant for a greedy scan?
4. When is sorting by earliest finish time correct?
5. How do you search for a counterexample to a proposed local rule?
6. Why does the order of equal-key items deserve attention?
7. When might dynamic programming be preferable?
8. How do you analyze a greedy method that sorts and then uses a heap?

## Concise interview answers

- An exact greedy algorithm commits to local choices and has a proof that those choices preserve an optimum; a heuristic lacks that guarantee or may only have an approximation bound.
- An exchange argument transforms an optimum to include the greedy choice without violating constraints or worsening the objective.
- State a property that holds before and after each decision and implies feasibility or bounds future possibilities.
- Earliest-finish selection is optimal for maximum-cardinality compatible intervals because an exchange can replace the first interval of an optimum with one finishing no later.
- Test smallest adversarial cases with ties, duplicates, tight capacity, and decisions that consume a scarce resource; compare against brute force on tiny instances.
- Ties may alter feasibility or future options, so either prove all tied choices interchangeable or specify a safe tie-break.
- DP is useful when multiple choices lead to overlapping states whose optimum values can be compared and reused.
- Add sorting cost, scan cost, and each heap operation; for n items this is typically O(n log n) plus O(n log n) heap work, simplified according to the actual operations.

## Deep follow-up answers

### Is optimal substructure enough to justify greedy?

No. It says an optimum can be composed from optimal subproblem solutions, but the algorithm may still need to compare several first choices. DP uses optimal substructure while retaining alternatives. Greedy additionally needs a safe-choice theorem, such as an exchange argument or a staying-ahead property.

### What is the exact structure of an exchange proof?

Take an arbitrary optimal solution. Find the first point where it differs from the greedy solution. Replace the conflicting part with the greedy choice. Prove the modified solution remains feasible and its objective is no worse. Then the residual instance has the same structure, allowing induction. If the exchanged item changes a capacity, deadline, or ordering constraint, account for that explicitly.

### How does a staying-ahead proof differ?

It compares prefixes rather than transforming one complete solution. Define a metric after the same number of decisions and prove the greedy prefix is at least as favorable under that metric. Then show the metric implies a final objective bound. “The greedy prefix looks better” is insufficient without a relation to final feasibility or score.

### Why does Jump Game admit a one-number summary?

For the reachability decision, reachable indices form a contiguous prefix from zero: every position up to the current farthest endpoint can be reached by some jump from an earlier reachable index. Scanning that prefix and extending the endpoint captures all future reachability. A path-output or minimum-jump variant asks for more information and needs additional state or reconstruction.

### How should a candidate greedy rule be tested?

Write a small exact oracle that enumerates all feasible solutions or uses a trusted DP. Generate small randomized cases, compare objective values, and save failing seeds. Minimize a failure to reveal the assumption the rule violated. Then write a proof for the repaired rule; testing cannot establish correctness for every input.

## Scenario questions

### A greedy algorithm passes all visible tests. Is it ready?

Not until the choice rule has a proof under the exact constraints. Include ties and boundary assumptions. Tiny differential tests can help find counterexamples, but a passing suite alone gives no universal guarantee.

### A deadline solution uses a max-heap. Why might the heap remove the largest duration?

After considering jobs in deadline order, if selected total duration exceeds the current deadline, removing the longest selected job recovers the most time while reducing the job count by only one. This reasoning is specific to the objective and assumptions; a different objective may need a different eviction rule.

### A coin-change greedy rule fails on one denomination set. What next?

State the valid denomination assumptions, if any. Otherwise use DP or another exact method. Do not patch isolated counterexamples into an unproved local rule.

### A proof works when keys are distinct. What must be revisited?

Determine whether ties can change which items precede one another, consume different resources, or change later feasibility. Add a tie-break and prove it, or show all tied choices are equivalent for the objective.

## Tradeoffs and alternatives

- Greedy often offers low memory and fast scans, but relies on a nontrivial structural proof.
- Dynamic programming compares alternatives and reuses overlapping states, often at greater memory and runtime cost.
- Exhaustive search provides a simple exact reference for tiny inputs but scales exponentially or factorially.
- Approximation methods may be appropriate when exact optimization is too expensive, but require a stated quality guarantee and should not be described as exact greedy.
- Sorting is appropriate for static choice order; heaps are useful when the best next available item changes dynamically.

## Common weak answers

- “Pick the largest” or “pick the earliest” without naming the objective and assumptions.
- “It has optimal substructure, so greedy works.”
- “The invariant says the partial answer is feasible,” without proving optimality.
- “I tested many cases,” as a substitute for proof.
- “Ties do not matter,” without an argument.
- Giving O(n) after sorting n items and omitting O(n log n) preprocessing.
- Calling a heuristic exact because it usually performs well.

## Self-check rubric

Score each item 0 (missing), 1 (partial), or 2 (clear and correct):

- States objective and feasible-solution constraints precisely.
- Defines an explicit local choice and tie behavior.
- Gives a correctness proof matched to the rule.
- Identifies assumptions and a plausible counterexample when they are removed.
- Distinguishes exact optimality from feasibility or approximation.
- Accounts for sorting, scans, heap operations, and auxiliary state.
- Compares greedy with an appropriate DP or exhaustive alternative.

Sources: [USACO Guide: Greedy](https://usaco.guide/bronze/intro-greedy), [USACO Guide: Greedy Sorting](https://usaco.guide/silver/greedy-sorting), [Competitive Programmer's Handbook](https://usaco.guide/PAPS.pdf).
