# dynamic programming states, recurrences, and tabulation — Core concepts and how they fit together

## Learning objectives

- Define a state so future decisions depend only on represented information.
- Derive base cases and transitions from legal choices or predecessors.
- Distinguish minimization, maximization, and counting recurrences.
- Evaluate dependencies with memoization or a valid bottom-up order.
- Analyze state count, transition work, memory, reconstruction, and numeric bounds.

## Prerequisites

Know recursion, arrays, graphs, induction, and asymptotic analysis. Understand that a state is a mathematical subproblem, not merely an array cell chosen for convenience.

## Core concepts

Dynamic programming stores solutions to subproblems so repeated work is avoided. Overlapping subproblems create reuse. A state is a compact key for one subproblem; a transition or recurrence defines its answer using smaller states. Base cases provide directly known values. The state must retain all history that can affect future choices, but irrelevant past details should be omitted.

Optimal substructure means an optimal solution can be expressed through optimal solutions of appropriate subproblems. Counting DP sums ways over disjoint choices; minimization takes a minimum over feasible choices; maximization takes a maximum. The operator is part of the recurrence and reflects the problem's objective.

## Mechanisms and relationships

### State, recurrence, and proof

Write a sentence for every state, including its indices and boundary meaning. Derive transitions by partitioning solutions according to a final choice or predecessor. Prove the alternatives are complete and do not omit a legal solution. For counting, overlapping alternatives must not count the same object twice unless inclusion-exclusion or another correction is included.

### Top-down and bottom-up

Memoization evaluates a state only when reached, stores it under a complete cache key, and distinguishes “not computed” from every valid result. Tabulation evaluates states in an order that places every dependency first. The state dependency graph is a DAG when dependencies strictly progress toward base states. Push/forward DP sends contributions from a state to successors; pull/backward DP computes a state from predecessor values.

### Impossible states and arithmetic

An impossible state is not the same as an uncomputed state. For a minimization DP, a large sentinel may represent unreachable, but adding cost to it can overflow or make an impossible transition appear better. Guard before arithmetic, or use a representation with a separate reachability flag. For counting, zero often means no ways, while a base state may have one way (the empty construction).

### Space optimization and reconstruction

Keep a value only as long as a future transition needs it. Rolling arrays are safe when dependencies use a fixed number of prior rows. In-place updates need a proved loop order: descending indices can protect old values in a 0/1 selection recurrence, while ascending indices may intentionally allow reuse in an unbounded recurrence. To recover a chosen solution, store decisions/predecessors or recompute them from the final values.

## Worked examples

For House Robber, let dp[i] be the maximum money from houses 0 through i. The final house is either taken, leaving i-2, or skipped, leaving i-1: dp[i]=max(dp[i-1], nums[i]+dp[i-2]). The two alternatives are exhaustive and mutually exclusive by the final decision. Only the previous two values are required, so storage can roll.

For Unique Paths, dp[r,c] counts paths to a cell. Every path arrives from above or left (except at the top and left boundaries), so the count is their sum. Each path has a unique last move, making the alternatives disjoint.

## Misconceptions and edge cases

- DP is not simply recursion with an array; state equivalence and recurrence correctness must be justified.
- Two histories can share a state only if their future subproblem is identical for the property being computed.
- An uncomputed cache entry and an impossible state need distinct encodings.
- Loop order can change whether choices are reusable.
- Rolling memory may be valid for the final value but insufficient for reconstructing a path.
- Counts and accumulated costs need numeric types sized for intermediate values, not just expected examples.

## Knowledge checks with answers

1. **What makes a cache key sufficient?** It contains every part of history that can change the subproblem's future answer.
2. **Why split a counting recurrence by final move?** To form complete, non-overlapping classes of solutions.
3. **When is bottom-up order valid?** Every dependency of a state has already been computed.
4. **Why guard an unreachable sentinel before adding?** Sentinel arithmetic can overflow or fabricate a finite candidate.
5. **What can rolling arrays lose?** Earlier values needed for reconstructing decisions.

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
