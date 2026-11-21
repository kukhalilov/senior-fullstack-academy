# knapsack, subset-sum, and resource-allocation DP — Reference: Capacity states and item decisions

## Scope and version

This reference defines the common state and transition forms. These are timeless dynamic-programming patterns rather than versioned APIs.

## How this group fits the mental model

Each item creates a decision: skip it or take it if it fits. The item dimension enforces eligibility; the capacity dimension records the resource limit or target. The objective stored at a state may be a maximum, minimum, count, or Boolean—not every knapsack recurrence has the same initialization or merge operator.

## Supplied names explained

- **`0/1 knapsack`:** each indexed item is either selected once or not selected. The take transition reads the previous item-prefix state.
- **`Unbounded knapsack`:** an item type may be selected repeatedly; a take transition can reuse a state that already includes that type.
- **`Capacity dimension`:** the resource amount represented by a DP coordinate, usually `0..W`.
- **`Item-prefix dimension`:** the count/prefix of items allowed in a state, preserving which choices are eligible.
- **`Skip current item`:** carry the best/count/reachability result without using the current item.
- **`Take current item`:** if it fits, combine its contribution with a state having the remaining capacity/target.
- **`Maximum-value recurrence`:** compare skip value with item value plus a feasible predecessor value.
- **`Minimum-cost recurrence`:** take the minimum over valid transitions and use an infinity sentinel for unreachable states.
- **`Boolean reachability recurrence`:** combine skip/take states with logical OR.
- **`Subset-sum decision`:** Boolean 0/1 knapsack where each item contributes its value and the question is whether the target sum is reachable.

## Cross-item comparison

For 0/1 use, the take state must exclude the current item, normally by reading the previous item row. For unbounded use, the take state may include the current item again. In a compressed array, the same distinction appears as descending versus ascending capacity scans. Boolean, counting, maximum, and minimum objectives differ in the state value and combination operator even when the state coordinates look alike.

## Examples

For weights `[2,3]`, values `[4,5]`, and capacity 3, a 0/1 maximum-value table considers skipping or taking each item once; the answer is 5. A Boolean subset-sum state with values `[2,3]` and target 5 becomes reachable by taking both items. A minimum-coin state for amount 3 with coin 2 remains unreachable and must not default to zero.

## Common mistakes

- Using zero as the value of an impossible minimum-cost state.
- Reading a current-layer state in a 0/1 recurrence and thereby selecting an item more than once.
- Treating equal values at different indices as the same item.
- Forgetting that a capacity normally means “at most,” while subset-sum target reachability means “exactly this sum.”

## Knowledge checks with answers

1. **What is the 0/1 choice for each item?** Skip or take once.
2. **What does the item-prefix dimension accomplish?** It limits which items are eligible and distinguishes previous-layer states.
3. **What is subset sum's objective?** Boolean reachability of an exact target using each item at most once.

Sources: [USACO Guide: Intro to DP](https://usaco.guide/gold/intro-dp), [USACO Guide: Book Shop](https://usaco.guide/problems/cses-1158-book-shop/solution).
