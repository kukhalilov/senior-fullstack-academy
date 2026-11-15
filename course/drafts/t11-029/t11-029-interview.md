# knapsack, subset-sum, and resource-allocation DP — Interview questions and reasoning

## Core questions

1. What does the item-prefix dimension mean in 0/1 knapsack?
2. Why does descending capacity prevent reusing an item in a compressed 0/1 DP?
3. How do you reduce equal partition and Target Sum to subset sum?
4. Why are coin-first and target-first counting loops different?
5. What makes O(nW) pseudo-polynomial?
6. What must be retained to reconstruct the selected indices?

## Concise interview answers

1. It limits eligible choices to the items processed so far; transitions distinguish skip from take.
2. The predecessor capacity is read before the current item has updated it, preserving the previous item layer.
3. Equal partition requires even total and a reachable half-total. Target Sum with total S and target T counts subsets of `(S-T)/2` (or `(S+T)/2`) after range/parity checks.
4. Coin-first counts denomination multisets once; target-first counts ordered sequences by their final element.
5. The runtime depends on numeric capacity W, whose value may be exponential in its binary encoding length.
6. A table by item prefix or enough predecessor/choice data; the final compressed objective alone is insufficient.

## Deep follow-up answers

### Derive loop direction from the recurrence

For 0/1 items, `new[c] = old[c] OR old[c-w]` (or max/count equivalent), so the take state must come from the previous item layer. A one-array update scans c downward; `dp[c-w]` has not yet been changed by the current item. For unbounded reuse, take may use the current layer: scan upward so newly improved smaller capacities can feed larger capacities. Loop order is an implementation of the recurrence, not a coding convention.

### Explain Target Sum's reduction and zero handling

Let P be the positive-assigned sum and N the negative-assigned sum. `P+N=S` and `P-N=T`, so `N=(S-T)/2`. Reject when T is outside `[-S,S]`, or the numerator is negative/odd. Count subsets of indices with that sum. Each zero index may be assigned either sign and leaves the numeric sum unchanged, so it doubles each compatible count; a descending 0/1 count update correctly does that once.

### Distinguish combination counts from sequence counts

Coin Change II processes coin types outside and amounts upward. This imposes a canonical denomination order, so permutations of the same multiset are counted once while each coin may repeat. Combination Sum IV processes target sums outside and values inside: each ordered sequence has one final value and a prefix counted by the smaller target, so order permutations count separately. Positivity ensures all dependencies point to smaller targets.

### When should you avoid capacity DP?

Check the numeric capacity, total, and memory before allocating. `O(nW)` can be useful for moderate W even when n is moderately large, but becomes infeasible when W is huge. If n is small, meet-in-the-middle can enumerate half-subsets and combine them without an array indexed by W. Sparse-state approaches may help when only few sums are reachable.

### What is required for reconstruction?

The final value answers the optimization question but loses which item decisions created it. Keep item-prefix rows, store predecessor choices while updating, or recompute subproblems with enough state. If multiple subsets tie, define whether any optimum is accepted or apply an explicit tie rule.

### Explain the two-budget recurrence

For each binary string, count its zero and one costs. Update `dp[z,o] = max(dp[z,o], dp[z-zeroCost,o-oneCost]+1)` for feasible states, scanning both dimensions downward. This handles the string once. Because the state stores a best value under at-most budgets, returning the full-budget state gives the best feasible subset.

## Scenario questions

- A 0/1 sum problem returns true for target 10 using one value 5. What likely bug occurred? **The capacity loop ran upward and reused the current value.**
- Your Target Sum formula produces `-1` after division. What should happen? **Check range and parity before forming/indexing the subset target; return zero ways when infeasible.**
- Coin Change II returns 7 for `[1,2,3]`, amount 4. What did it likely count? **Ordered sequences, so it used target-first ordering; unordered combinations should be 4.**
- A subset count doubles after processing a zero. Is that a bug? **No; include/exclude the indexed zero are different subsets.**
- The capacity is 10^12 and n is 30. Is an array DP suitable? **No; consider meet-in-the-middle or another state formulation.**
- You need actual selected items but only kept `dp[capacity]`. What is missing? **Per-item predecessor/choice information or a table to reconstruct the path.**

## Tradeoffs and alternatives

- **0/1 vs unbounded:** each input item is limited to one use versus repeatable use; the capacity traversal direction changes accordingly.
- **Boolean reachability vs counting:** OR answers existence, while addition counts distinct index choices and must account for zeros.
- **Coin-first vs target-first counting:** unordered combinations versus ordered sequences.
- **One-dimensional vs two-dimensional table:** compressed memory versus clearer layer provenance and easier reconstruction.
- **Capacity DP vs meet-in-the-middle:** pseudo-polynomial in W versus exponential in n/2; choose based on actual bounds.
- **Boolean array vs bitset:** simple state updates versus compact word-parallel reachability, with width and representation details to manage.

## Common weak answers

- “Descending loops are just faster.” They preserve 0/1 semantics; ascending may change the answer.
- “Even total means equal partition exists.” It only makes the target integral; reachability is still required.
- “Target Sum is subset sum with target/2.” The correct expression depends on S and T and needs range/parity checks.
- “Zeros do nothing.” They do not change reachable sums but multiply index-subset/sign counts.
- “Combination means order never matters.” The problem definition decides; the loop nesting encodes it.
- “O(nW) is polynomial, so it scales.” It is pseudo-polynomial and can be infeasible for large numeric W.
- “We can recover chosen items from the last cell.” Provenance was discarded unless saved separately.

## Self-check rubric

You are ready to explain this DP family if you can:

- State what every DP cell means and why its base value is correct.
- Derive take/skip transitions from the exact “once or unlimited” rule.
- Justify the loop direction for a compressed state.
- Derive subset and sign reductions algebraically and check feasibility conditions.
- Explain which output semantics determine loop nesting for counts.
- Check capacity bounds, numeric overflow, memory, reconstruction, and pseudo-polynomial cost.

Sources: [USACO Guide: Intro to DP](https://usaco.guide/gold/intro-dp), [USACO Guide: Knapsack Applications](https://usaco.guide/PAPS.pdf).
