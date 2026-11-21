# backtracking, subsets, permutations, and combinations — Core concepts and how they fit together

## Learning objectives

- Define a recursive state, choice set, base case, and undo step.
- Distinguish subsets, combinations, and permutations by ordering and reuse.
- Suppress duplicates without removing valid multiplicity.
- Apply only sound pruning and include output-construction costs.

## Prerequisites

Know recursion, arrays, lists, sorting, and call-stack complexity. Understand the difference between an input position and its value; duplicate values can occupy distinct positions.

## Core concepts

Backtracking constructs a partial candidate along a branch of a search tree. A recursive call represents one state. It enumerates choices, applies one, recurses, and restores state before trying a sibling. The invariant must describe exactly what the current path and candidate index mean. A base case records or checks a complete candidate.

For subsets, each position is chosen or skipped, yielding 2^n subsets. For permutations, choose one unused position per depth, yielding n! arrangements for distinct elements. Combinations choose candidates in increasing index order to avoid counting the same selection in multiple orders. Reuse rules determine whether the next recursion starts at the same index or the next one.

## Mechanisms and relationships

### Mutable path state

Push a choice onto a shared path before recursion and remove it afterward. This reuses one list and saves copying. Every exit path must restore it; otherwise siblings inherit values from the prior branch. An alternative copies the path for each child, which is simpler to reason about but allocates more.

### Duplicate control

If duplicates are allowed in input but output combinations must be unique, sort values and skip an equal value when it appears at the same recursion depth as an earlier equal value. Do not skip an equal value selected at a deeper level if multiplicity is valid. In unique permutations, when nums[i] equals nums[i-1], skip i if the prior equal position has not been used in the current prefix. This canonicalizes the order in which equal positions are chosen.

### Pruning

Prune only if no continuation can satisfy the task. With positive candidates sorted ascending, a value greater than remaining sum implies later values also exceed it, so the loop can break. Negative candidates invalidate that monotonicity. Decision tasks may stop at the first solution; enumeration tasks must continue after recording a result.

### Complexity

The search-tree node count may be 2^n, n!, or another combinatorial function. Each node may copy a path or inspect candidate choices. Output storage is separate and unavoidable when all answers must be returned. An O(2^n) subset algorithm can require O(n*2^n) output elements in total.

Backtracking differs from dynamic programming: DP merges equivalent subproblems when only a summarized value is needed; enumeration generally must preserve distinct paths/outputs and cannot collapse states without a proof.

## Worked examples

For Combination Sum with sorted positive candidates [2,3,6,7] and target 7, choosing 2 recurses at the same index because it can be reused; after remaining becomes 1, candidates exceed it and the branch stops. Choosing 7 records a solution and returns. In Combination Sum II, each position may be used once, so recurse with i+1; skipping equal candidates at the same depth avoids duplicate combinations.

## Misconceptions and edge cases

- Sorting may change output order but not the set of answers when the problem allows any order.
- Equal values at different positions are still separate choices when multiplicity matters.
- A duplicate skip rule is depth-sensitive; skipping all equal values loses valid repeated selections.
- A partial sum above target is not always pruneable if negative values are allowed.
- Recording a solution does not necessarily mean stop; it depends on whether extensions can also be valid.
- Recursion depth and output size may exceed comfortable memory even when each branch is simple.

## Knowledge checks with answers

1. **Why undo after recursion?** Restore the parent's state before exploring a sibling choice.
2. **What prevents combination permutations?** Enforce a nondecreasing candidate index.
3. **When can sorted remaining-sum pruning break?** When later candidate values are not guaranteed positive/nondecreasing.
4. **What is the unique-permutation duplicate rule?** Skip an equal predecessor when that predecessor is not already used in the current prefix.
5. **Why report output size?** Materializing all answers can dominate runtime and memory.

Sources: [USACO Guide: Complete Search with Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp), [USACO Guide: Competitive Programming 2](https://usaco.guide/CP2.pdf).
