# backtracking, subsets, permutations, and combinations — Reference: Sound pruning, output size, and complexity

## Scope and version

This lesson explains the ten supplied pruning, search-size, and DP-comparison terms.

## How this group fits the mental model

Pruning removes a branch only when no completion can be valid. Complexity must count the search tree, work per node, and materialized output.

## Supplied names explained

- Feasibility pruning — Stop a branch when a proven constraint cannot be repaired.
- Bound-based pruning — Compare partial objective against a bound that cannot beat the current best.
- Remaining-sum pruning — With positive candidates, stop when the next candidate exceeds the remaining target.
- Early termination for decision search — Return after the first witness when only existence is requested.
- Output-sensitive complexity — Include time and memory proportional to returned answers.
- O(2^n) subset search — Each of n positions has include/exclude choice.
- O(n!) permutation search — Distinct arrangements number n factorial.
- Branching factor — Number of choices available at a search node.
- Search tree depth — Maximum decisions along a branch.
- Backtracking versus dynamic programming — Enumeration preserves solutions; DP merges equivalent states to aggregate values when a recurrence permits it.

## Proving pruning rules

A search state stands for a set of possible completions. A prune is correct only if every completion represented by that state is invalid or cannot improve the required answer. Write down the assumptions used in the proof; the same code condition can be sound for one problem and wrong for another.

### Feasibility and remaining-sum pruning

With sorted positive candidates and target remainder r, if the next candidate x exceeds r, all subsequent candidates are at least x and also exceed r. Breaking the loop is safe. If candidates may be negative, a partial sum above target can later decrease, so overshoot alone is not a proof. If candidates include zero, same-index reuse can recurse without reducing remainder; a progress argument is then required to prevent infinite recursion.

Other feasibility bounds include comparing the maximum possible remaining sum against a required minimum, or the minimum possible remaining cost against a budget. Derive the most optimistic completion. If even that bound cannot satisfy the target, prune. Be careful about integer overflow and strict versus inclusive comparisons at equality.

### Bound-based pruning in optimization

In a maximize problem, maintain the best complete solution found so far. If an admissible upper bound for a partial state's best possible completion is no greater than the incumbent, that branch cannot improve the answer and may be pruned. For minimization, use a lower bound that is no smaller than the incumbent. The bound must be optimistic in the correct direction; an estimate that can underestimate a maximum or overestimate a minimum may discard the optimum.

### Early return is about the requested output

For a decision question such as “does any solution exist?”, returning on the first witness is correct. For finding one solution, the contract must allow any witness and should make that explicit. For counting all solutions, finding the optimum, or enumerating every solution, first success is not enough. An optimization search can stop exploring a node after proving its bound cannot beat an existing answer, which is different from stopping the whole search at the first valid result.

## Deriving enumeration complexity

Use separate quantities:
- N: visited search states or nodes.
- W: work spent per state, including scanning choices and checking constraints.
- R: number of returned answers.
- L: average answer length or total representation size per answer.

The time is at least Ω(RL) when results are materialized, and a useful total bound includes both node work and output work, such as O(NW + RL). The output can be streamed to reduce retained memory, but the time needed to produce it remains. Copying a mutable path at every leaf costs proportional to that leaf's length.

For all subsets of n distinct positions, R=2^n and total output elements are n·2^(n-1), giving Θ(n·2^n) materialization. For permutations, R=n!, each answer has n entries, giving Θ(n·n!). For unique permutations with frequencies c1...ck, R=n!/(c1!...ck!). These lower bounds hold even if feasibility checks and branching are otherwise free.

## Backtracking and dynamic programming

Backtracking is a traversal strategy; dynamic programming is reuse of equivalent subproblem results. They are not mutually exclusive: memoized search may cache whether a state is feasible, how many completions it has, or an optimum value. However, a cache keyed only by remaining target cannot stand in for enumerating paths when different prefixes must produce different answers. To enumerate, preserve enough predecessor or path information and account for duplicate routes to the same state.

## Cross-item comparison

Pruning reduces explored nodes but does not change worst-case complexity unless a stronger bound is proved. If the output itself has factorial size, any enumerator has at least factorial output work. DP can reduce repeated work when states overlap, but cannot automatically replace enumeration when each distinct path is required.

## Examples

For sorted positive combination candidates, if current value exceeds remaining sum, all later values also exceed it, so break the loop. If candidates can be negative, a later negative can restore feasibility, so that pruning is unsound.

## Common mistakes

- Pruning from an intuition rather than a proof.
- Quoting O(2^n) while ignoring copying each subset.
- Returning early from an enumeration problem after finding one valid output.
- Calling repeated recursion dynamic programming without memoization or state aggregation.
- Pruning an optimization branch with a bound in the wrong direction.
- Stopping at the first witness when the contract asks for all witnesses or the optimum.
- Claiming memoization reduces output work that the caller still requires.

## Knowledge checks with answers

1. **What makes pruning sound?** Every completion of the state would fail or be dominated.
2. **Why include output size?** Returning answers requires materializing or emitting them.
3. **When can decision search stop?** When the specification asks only whether one solution exists.
4. **What is DP's key advantage?** Reuse equivalent overlapping subproblem states.

Sources: [USACO Guide: Complete Search with Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp), [USACO Guide: Competitive Programming 2](https://usaco.guide/CP2.pdf).
