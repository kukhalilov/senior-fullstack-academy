# backtracking, subsets, permutations, and combinations — Interview questions and reasoning

## Core questions
1. What does a backtracking state represent?
2. How do you ensure each combination is generated once?
3. Why can duplicate pruning depend on the current recursion depth?
4. When is it safe to stop a loop because a candidate is too large?
5. How do you include output size in a complexity estimate?
6. How can a recursion tree be converted into an iterative algorithm?

## Concise interview answers
- A state contains the partial answer and enough information to identify legal next choices; often it also includes a start index, remaining target, or used-position set.
- Impose a canonical order on choices, such as nondecreasing candidate indices, so each unordered combination has one representation.
- Equal sibling choices produce equivalent branches; equal values may still be needed at deeper levels to represent multiplicity.
- Early termination is valid when candidates are sorted and all values are positive, because later candidates are at least as large.
- Count emitted answers and multiply by the cost to construct each answer; output can dominate search overhead.
- Replace the call stack with explicit frames containing the state and next choice index, preserving the same enter/choose/undo transitions.

## Deep follow-up answers
### How do you design the state?
Start from the decisions that remain. For subsets, a start index prevents reordering. For permutations, a used set identifies available positions. For target sums, remaining target captures the outstanding constraint. The path is the partial answer and must be copied when saved.

### Why distinguish sibling duplicates from path duplicates?
When sorted values are equal, choosing either copy as the next sibling choice leads to the same value-level branch. Skipping the later sibling avoids a duplicate result. Once the earlier copy has already been selected in the path, selecting the next equal copy at a deeper step is a distinct multiplicity choice. The exact predicate differs by search model: combinations commonly use i > start; permutations commonly use an unused previous equal value as the skip condition.

### When may a branch be pruned?
A prune must prove that no completion can satisfy the objective. In positive sorted target-sum problems, candidate > remaining proves every later candidate is also too large. It is not safe with negative candidates, where later additions could offset an overshoot. Other valid prunes include a remaining-count upper bound or a constraint-specific feasibility test, provided the bound is sound.

### How do you analyze enumeration?
Separate preprocessing, tree exploration, and output construction. If there are R answers of average length L, output materialization alone costs Θ(RL). For n distinct values, permutations have n! answers of length n, so Θ(n·n!) time and output storage. A search with few answers may still explore many partial states, so count both where needed.

## Scenario questions
### A solution returns the right values but duplicate combinations. What do you inspect?
Check whether choice order is canonical, whether candidates are grouped or sorted, and whether equal values are skipped only among sibling choices. Verify recursion advances after a single-use choice and stays at the same index only when reuse is permitted.

### A solution misses answers containing repeated values. What likely went wrong?
The duplicate condition may be global rather than depth-local, or a same-depth skip condition may have been copied into a different search model. In single-use combinations, later equal occurrences must remain available in deeper calls; in permutation generation, an equal value may be selected after its previous equal copy is already in the path.

### A target-sum DFS is too slow. Which optimizations preserve correctness?
Sort positive candidates and break when a candidate exceeds remaining. Avoid duplicate sibling branches when candidates repeat. Add a feasibility bound only after proving it cannot exclude a valid completion. Memoization may help a count/reachability problem, but enumerating all paths needs careful reconstruction and duplicate handling.

### Recursion depth is unsafe. What can replace it?
Use explicit stack frames that store the state and the next candidate to examine. Preserve the same order of choosing, descending, undoing, and saving results. Alternatively, use iterative subset expansion or next-permutation algorithms when their structure matches the task.

## Tradeoffs and alternatives
- Recursive DFS closely expresses the search tree and naturally restores a path after each branch; deep input risks call-stack limits.
- Iterative explicit-stack DFS avoids call-stack use but requires carefully modeled frames and restoration.
- Breadth-first search can find a shallowest solution when depth itself is the objective, but often retains many frontier states.
- Dynamic programming merges states when many paths reach the same subproblem; direct enumeration may still require path reconstruction and output can remain exponential.
- A frequency-count state can be clearer for multiset choices; index sorting and sibling skipping may be simpler for moderate input sizes.

## Common weak answers
- “Backtracking is brute force”: omits state, legal choices, pruning, and duplicate control.
- “Sort and skip duplicates”: does not state that the skip is local to a recursion depth or explain multiplicity.
- “The recursion is O(2^n)”: ignores answer-copy costs and can mischaracterize permutation or combination trees.
- “Break when the value is too large”: fails to state the required sorted, positive-input assumptions.
- “Memoization makes it faster”: does not identify equivalent states or explain how distinct output paths are preserved.
- “Use a set at the end”: hides duplicate work and does not explain a canonical generation strategy.

## Self-check rubric
Score each criterion 0 (missing), 1 (partly correct), or 2 (clear and correct):
- Defines state and invariant.
- Identifies legal choices and the progress measure.
- Explains choose/recurse/undo or an equivalent iterative transition.
- Proves duplicate suppression preserves repeated-value answers.
- States assumptions required for every prune.
- Includes preprocessing, output construction, and auxiliary space in complexity.
- Compares a meaningful alternative and its tradeoff.

## Source
- [USACO Guide: Complete Search](https://usaco.guide/bronze/complete-rec?lang=cpp)
- [USACO Guide: Competitive Programmer's Handbook](https://usaco.guide/CP2.pdf)
- [Subsets](https://leetcode.com/problems/subsets/)
- [Subsets II](https://leetcode.com/problems/subsets-ii/)
- [Permutations](https://leetcode.com/problems/permutations/)
- [Permutations II](https://leetcode.com/problems/permutations-ii/)
- [Combination Sum](https://leetcode.com/problems/combination-sum/)
- [Combination Sum II](https://leetcode.com/problems/combination-sum-ii/)
- [Letter Combinations of a Phone Number](https://leetcode.com/problems/letter-combinations-of-a-phone-number/)
- [Palindrome Partitioning](https://leetcode.com/problems/palindrome-partitioning/)
