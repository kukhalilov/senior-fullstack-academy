# dynamic programming states, recurrences, and tabulation — Reference: Subproblems, state, and recurrence

## Scope and version

This lesson explains the eleven supplied state and recurrence terms for general finite-state DP.

## How this group fits the mental model

State design determines which histories can share a cached answer. The recurrence describes all legal ways to derive that answer; boundaries and base values complete the definition.

## Supplied names explained

- Overlapping subproblems — Distinct paths in a recursive solution ask the same subproblem again. Storing the answer avoids repeated evaluation. Overlap motivates reuse but does not prove that the proposed state is sufficient.
- Optimal substructure — An optimal complete solution can be composed from optimal solutions to relevant smaller subproblems. It supports a recurrence for optimization, but can also be used by a recurrence that compares multiple alternatives rather than a single greedy choice.
- State definition — A precise sentence describing exactly one subproblem and the meaning of its answer, including what indices, prefix/suffix, capacity, or other context is fixed.
- State dimensions — Independent parameters needed to identify a subproblem, such as position and remaining capacity. Each dimension affects the number of states; omitting a relevant dimension can merge inequivalent histories.
- Transition/recurrence — The equation that derives a state answer from smaller states and legal choices. Specify whether alternatives are summed, minimized, or maximized, and whether they partition solutions without overlap.
- Base case — A directly known smallest state that anchors the recurrence. Examples include one way to build the empty choice, zero cost at a zero-sized target, or a known endpoint value.
- Impossible-state sentinel — A reserved value indicating no feasible solution exists for a state. Choose it outside valid results, guard it before arithmetic, and distinguish it from uncomputed storage.
- Minimization recurrence — Take the least value over feasible predecessor/choice costs. Ignore impossible predecessors before adding transition cost.
- Maximization recurrence — Take the greatest value over feasible choices. Define whether choosing nothing is permitted; this changes the neutral/base value for negative-valued options.
- Counting recurrence — Sum counts from disjoint classes of valid constructions. If two transitions can describe the same construction, the recurrence double-counts unless corrected.
- State-space boundary — The legal range of each state dimension and the conditions under which a transition exists. For example, a grid transition from above is absent in the top row.

## Cross-item comparison

Overlapping subproblems concern repeated computation; optimal substructure concerns how an optimum decomposes. A problem can have one without the other. The state definition identifies repeated subproblems, while a correct recurrence proves how their answers combine.

## Examples

For Coin Change, define dp[x] as the fewest coins for amount x. The state range is 0..amount; dp[0]=0. For each denomination c<=x, a candidate is dp[x-c]+1 only if x-c is reachable. The minimum over candidates is the recurrence. An unreachable sentinel must not be incremented; otherwise an impossible predecessor can masquerade as a finite solution. If no candidate is feasible, dp[x] stays impossible.

For Decode Ways, define dp[i] as the number of decodings of the first i characters. A one-character transition is allowed only when s[i-1] is not zero; a two-character transition is allowed only for values 10 through 26. The empty prefix has one way, so dp[0]=1, but a prefix beginning with zero has zero decodings.

## Common mistakes

- Describing a state only as “the answer up to i” without specifying what up to i means.
- Leaving out a dimension such as remaining capacity or previous choice.
- Using a single sentinel for both impossible and not-yet-computed.
- Adding a transition cost to an impossible sentinel.
- Summing transitions whose solution sets overlap.
- Assuming max permits an empty choice when the specification requires at least one item.

## Knowledge checks with answers

1. **What does state dimension count affect?** The number of distinct subproblems and memory use.
2. **What must be true of count-transition classes?** They must cover every valid construction exactly once.
3. **Why is dp[0] often one in counting?** There is one way to choose nothing, which lets a first valid choice extend it.
4. **What defines the impossible sentinel?** It cannot be confused with a valid answer and must be protected from unsafe arithmetic.

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
