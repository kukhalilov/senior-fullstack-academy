# backtracking, subsets, permutations, and combinations — Reference: Decision trees, partial state, and recursion

## Scope and version

This lesson explains the ten supplied search-state and recursion terms.

## How this group fits the mental model

Each recursive call is a search-tree node. Its state must be sufficient to enumerate valid continuations, and sibling branches must not contaminate one another.

## Supplied names explained

- Search space — All candidates that could be considered before pruning.
- Decision tree — Branching structure where each edge represents one choice.
- Partial candidate — Current prefix/path that may become a complete solution.
- Choice — A permitted next value, index, boundary, or include/exclude decision.
- Explore branch — Apply one choice and recursively process its continuations.
- Undo choice — Restore the parent state after returning.
- Base case — Condition at which the candidate is recorded, rejected, or no further choices exist.
- Recursion depth — Number of active decisions; often O(n) for these tasks.
- Mutable path state — Shared list representing the current branch, with append/recurse/remove discipline.
- State-copy alternative — Pass a new copied path to a child; easier isolation but higher allocation.

## Defining a state precisely

A useful recursive state answers three questions:

1. What partial answer has already been built?
2. Which decisions remain legal?
3. What progress measure guarantees termination?

The path alone is often insufficient. In subset or combination generation, a start index records which positions can still be selected. In permutation generation, a used-position set records availability. In target-sum search, remaining records the unfilled amount. In palindrome partitioning, the next unprocessed string index determines legal substring starts. State should be sufficient to resume exactly that branch, while avoiding redundant data that can be derived cheaply.

The invariant is a statement that is true at entry to every recursive call. For example: path contains selected values from positions strictly before start; remaining equals target minus the sum of path; and no input occurrence appears twice. State transitions should preserve the invariant, and base cases should correspond to the problem's completion condition. A proof becomes easier when the invariant names both what has been chosen and what has not.

## Mutation, copying, and control flow

The common mutable-path pattern is choose, recurse, undo. The append and its matching removal must be paired even when a branch immediately reaches a base case. A completed answer must be copied because the mutable path will continue changing. A shallow copy is sufficient when path elements are immutable values or references that the search does not mutate; nested mutable elements may require deeper copying or immutable representations.

Copy-per-child makes parent state naturally stable and can simplify reasoning, but repeatedly copies prefixes. Across a deep tree, this extra copying can add significant work and allocate many temporary collections. Mutate-and-undo avoids those copies but relies on disciplined restoration. An explicit stack can replace the language call stack for deep searches; each frame must retain its state and next choice so the algorithm can resume the parent after a child completes.

Every recursive transition should make progress toward a finite bound: increase the position, reduce remaining using positive values, mark a previously unused position, or consume part of the input. Same-index recursion is still progressing in Combination Sum because remaining decreases. Same-index recursion with a zero candidate would not progress and can loop forever.

## Search tree and solution enumeration

Each node represents one partial state; outgoing edges are legal choices. A base case can record a complete answer and return, reject a dead end, or contribute a value to an aggregate. Some problems allow a completed partial answer to be extended into longer answers, so recording a solution does not always imply returning. Subsets record at every node, while fixed-length permutations record only at depth n.

The search is exhaustive only if its choice generator includes every legal next decision. Conversely, generating multiple paths for the same semantic answer requires canonical ordering or a proved duplicate rule. Pruning must preserve every completion the output contract requires. These conditions are separate: a search can be exhaustive but duplicate answers, or unique but omit valid answers.

## Cross-item comparison

The search tree describes possible choices; mutable state is the concrete representation of one root-to-current-node path. A candidate may be complete before the entire search ends, so recording a base case does not always terminate recursion.

## Examples

For each input position in Subsets, branch into include and exclude. At depth n, emit the selected path. For a permutation, one branch is created per unused position until the path length reaches n.

## Common mistakes

- Forgetting to remove a path choice after recursion.
- Mutating the input array when only path state should change.
- Recording incomplete candidates or missing valid base cases.
- Stopping after the first result when all solutions are required.
- Omitting an availability or start-index field needed to resume the branch.
- Using a recursive transition that does not decrease a finite progress measure.
- Treating every successful partial state as terminal when valid longer answers may extend it.

## Knowledge checks with answers

1. **What must a state identify?** Enough information to determine valid future choices.
2. **Why undo?** The next sibling must begin from the same parent state.
3. **What is search depth for a length-n permutation?** n choices.
4. **When can state copying be preferable?** When simpler isolation outweighs allocation cost.

Sources: [USACO Guide: Complete Search with Recursion](https://usaco.guide/bronze/complete-rec?lang=cpp), [USACO Guide: Competitive Programming 2](https://usaco.guide/CP2.pdf).
