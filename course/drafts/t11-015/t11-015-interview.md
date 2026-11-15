# dynamic programming states, recurrences, and tabulation — Interview questions and reasoning

## Core questions

1. How do you define a DP state?
2. How do you derive a recurrence rather than guess one?
3. What is the difference between memoization and tabulation?
4. How do you prove a DP recurrence correct?
5. How do you estimate time and memory?
6. When can memory be reduced to a rolling array?
7. How do you represent an unreachable state safely?
8. Why can loop direction change a recurrence's meaning?

## Concise interview answers

- A state names one subproblem and includes all context that can affect its remaining decisions.
- Partition valid solutions by a final choice or predecessor; derive the value/count from those smaller states and define bases.
- Memoization recursively evaluates and caches reached states; tabulation fills an explicit dependency order.
- Prove base states, transition soundness, transition completeness, and that evaluation order computes dependencies first.
- Count evaluated states and transition work per state; memory includes table dimensions, cache, stack, and reconstruction data.
- Roll storage only when every future state needs a bounded set of previous layers and no discarded value is needed for reconstruction.
- Use a sentinel outside valid values or a separate reachability flag; guard it before arithmetic.
- Direction controls whether an update reads an old-layer value or one just written, which determines whether a choice can be reused.

## Deep follow-up answers

### How do you know a state is sufficient?

Two histories mapped to the same state must have identical future legal choices and identical future contribution to the answer. If one history's future differs, the state needs another dimension or must preserve additional information. Try to construct two histories with the same proposed key but different optimal completions; if possible, the state is incomplete.

### How do you derive a recurrence?

Choose a canonical way to classify complete solutions, often by their last action, final item, or predecessor state. Verify the classes cover all valid solutions and are disjoint when counting. For minimization or maximization, each candidate must be feasible and every optimum must appear among candidates. Then define smallest subproblems directly.

### What does “states times transitions” mean?

If S states are evaluated and each examines at most T constant-cost choices, the runtime is O(ST). If transition costs differ, sum them instead of hiding a larger per-state scan. For example, Coin Change has A+1 amount states and k candidate coin transitions per state, giving O(Ak); grid path DP has mn states and constant predecessor work, giving O(mn).

### When is rolling memory correct?

Draw the dependency layers. If a state uses only the previous row, a single row can suffice, provided update order preserves old values until their last read. If it uses the previous two rows, keep two. For in-place 0/1 versus unbounded item recurrences, loop direction controls whether the current item can be read again; derive that separately for the exact recurrence.

### How do you recover an actual solution?

Store, for each state, which predecessor or choice attained its value; follow these pointers backward from the terminal state. Alternatively, retain values and recompute a predecessor satisfying the recurrence. Rolling arrays may discard information needed for this, so choices may require a separate table.

### How do sentinel and overflow risks interact?

An unreachable sentinel such as a large cost must not be incremented before checking reachability. Counts can exceed bounds in intermediate prefixes even if a final invalid suffix makes the answer small or zero. Derive bounds for every state and intermediate expression, choose a sufficiently wide or arbitrary-precision type, and make any final narrowing conversion explicit.

## Scenario questions

### A recurrence returns the right examples but fails at the first row. What do you inspect?

Check the state meaning, base initialization, missing predecessor cases, and whether an absent predecessor is treated as zero, one, impossible, or excluded. Trace the smallest grid and compare each cell to its mathematical definition.

### A memoized result changes when another caller reaches it. What likely failed?

The cache key may omit a state dimension, or a mutable result object may be shared and modified. Verify both subproblem identity and value ownership.

### A DP is too large. What can you try?

Find whether dimensions are truly needed, exploit sparse reachable states, roll dependency layers, or reformulate a bounded dimension. Do not discard a dimension unless future behavior is independent of it.

### A greedy algorithm appears faster than the DP. Can you substitute it?

Only with a separate proof that every locally committed choice is safe under the exact constraints. DP correctness does not imply a greedy-choice property.

## Tradeoffs and alternatives

- Memoization follows recurrence structure and skips unreachable states; it may use recursion depth and dictionary overhead.
- Tabulation avoids call-stack use and enables tight memory control; it may compute unused states and requires a valid order.
- Brute force is useful as a tiny-instance oracle but can be exponential.
- Greedy may be faster but discards alternatives and requires a safe-choice proof.
- Algebraic formulas can replace DP for special combinatorial structures but may require careful overflow-safe evaluation.

## Common weak answers

- “State is the array index,” without defining what the value represents.
- “Use DP because there are overlapping subproblems,” without a recurrence or state sufficiency argument.
- “Initialize everything to zero,” when zero is a valid value or unreachable states need distinct representation.
- “It is O(n),” while each state loops over n choices.
- “Space can be optimized,” without tracing dependency lifetimes and update direction.
- “The final answer fits in int,” without checking intermediate values and sentinels.

## Self-check rubric

Score each item 0 (missing), 1 (partial), or 2 (clear and correct):

- Defines the state precisely and justifies its dimensions.
- Derives a complete recurrence from legal choices.
- Defines and proves base cases and impossible states.
- Gives an evaluation order compatible with dependencies.
- Proves transition soundness and completeness.
- Counts states, transition work, and memory accurately.
- Explains numeric bounds and reconstruction tradeoffs.

Sources: [USACO Guide: Introduction to DP](https://usaco.guide/gold/intro-dp), [Competitive Programmer's Handbook](https://usaco.guide/CPH.pdf).
