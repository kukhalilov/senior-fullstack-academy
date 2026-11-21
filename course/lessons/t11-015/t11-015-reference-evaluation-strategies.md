# dynamic programming states, recurrences, and tabulation — Reference: Memoization, tabulation, and dependency order

## Scope and version

This lesson explains the ten supplied evaluation-strategy terms.

## How this group fits the mental model

Once states and dependencies are correct, choose how to evaluate them. Top-down follows requested dependencies; bottom-up chooses an order that makes every dependency ready before use.

## Supplied names explained

- Top-down memoization — Evaluate a recurrence recursively and cache each completed state. Only states reached from the requested answer are computed.
- Cache key — The complete tuple of state dimensions used to identify one result. Omitting a dimension incorrectly reuses another subproblem's value.
- Bottom-up tabulation — Allocate state storage and fill states iteratively in dependency order, usually beginning with base cases.
- Evaluation order — A sequence of states in which every dependency is evaluated before the dependent state. A topological order of the dependency DAG is sufficient.
- State dependency DAG — Directed graph whose vertices are states and whose edges point to dependencies. Acyclic dependencies permit finite recursive evaluation and a topological tabulation order.
- Push/forward DP — Process a state and propagate its contribution to successor states. Ensure each contribution is combined using the recurrence's correct operator.
- Pull/backward DP — Compute a state by reading its predecessors or smaller subproblems and applying its recurrence.
- Recursion depth — Maximum number of active nested calls in memoization. It can be linear or larger and may exceed a language's call-stack capacity even when state count is manageable.
- Uncomputed versus computed sentinel — Storage needs a marker for “not evaluated yet” distinct from every valid answer and from impossible states. A separate visited flag is often safest.
- Memoization cache — The mapping from complete state keys to computed answers; it can be an array for dense bounded states or a dictionary for sparse/non-integer states.

## Cross-item comparison

Memoization and tabulation can evaluate the same recurrence. Top-down may save work on unreachable states but incurs recursion and cache lookup. Bottom-up avoids recursive stack depth and often improves locality but may fill states that are never needed. Push and pull describe transition direction, not inherently top-down versus bottom-up.

## Examples

For a one-dimensional recurrence dp[i]=dp[i-1]+dp[i-2], top-down calls i-1 and i-2 and caches results. Bottom-up initializes dp[0] and dp[1], then fills increasing i. The dependency graph has edges from i to smaller indices; increasing order is a topological order.

For grid paths, pull DP at (r,c) reads from above and left. A push formulation starts at (0,0) and adds its count to down/right neighbors. Both are correct when boundaries are checked and each path contribution is propagated exactly once.

## Common mistakes

- A cache key omits a parameter that changes future options.
- A bottom-up loop reads a cell before its dependency has been initialized.
- A push recurrence adds the same contribution more than once.
- Using a valid result like zero as the “uncomputed” marker without a separate flag causes repeated work or wrong cache behavior.
- Recursive memoization is assumed safe regardless of depth.

## Knowledge checks with answers

1. **What determines valid bottom-up order?** The dependency relation, not an arbitrary loop preference.
2. **Can push and pull compute the same DP?** Yes, if both implement the same transitions and boundaries.
3. **Why can an array cache use a sentinel only sometimes?** Some result values may equal the chosen marker; a separate visited state avoids ambiguity.
4. **When can top-down be preferable?** When the reachable state subset is much smaller than the full state space.

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
