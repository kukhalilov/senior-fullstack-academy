# knapsack, subset-sum, and resource-allocation DP — Reference: Subset sum, partition, and counting variants

## Scope and version

This reference covers the supplied reductions and counting variants. All formulas assume the stated nonnegative/positive input conditions unless noted.

## How this group fits the mental model

Several problems that look different reduce to reachable or counted subset sums. The reduction defines what a DP state means and what target to use; only then should the recurrence be implemented.

## Supplied names explained

- **`Equal partition by half-total target`:** if total S is even, test whether a subset reaches S/2; the complement has the same sum.
- **`Target Sum sign assignment reduction`:** for total S and desired signed sum T, count subsets with sum `(S-T)/2` representing negative choices, after range and parity checks.
- **`Count subsets reaching target`:** maintain the number of index subsets for each sum; duplicate values are distinct item choices.
- **`Minimum partition difference`:** find the largest reachable x no greater than S/2 and return `S-2x`.
- **`Coin change minimum count relationship`:** a separate minimum-cost unbounded recurrence can find fewest coins; use an unreachable sentinel and ascending amounts when coins may repeat.
- **`Coin change number-of-combinations relationship`:** coin-first, amount-ascending updates count unordered denomination multisets without ordering duplicates.
- **`Parity feasibility condition`:** an integer subset target exists only when the relevant numerator is even.
- **`Zero-valued item counting effect`:** each indexed zero doubles subset/sign assignment counts but does not change Boolean reachability.

## Cross-item comparison

Equal partition asks whether any subset reaches one fixed half-total. Target Sum counts all sign assignments and uses a target derived from S and T. Minimum partition difference optimizes closeness to half rather than testing one target. Coin-change combination counting is unbounded in coin reuse but unordered; Target Sum counting is 0/1 over array indices and includes zero sign choices.

## Examples

For `nums=[1,5,11,5]`, total is 22, so equal partition asks whether sum 11 is reachable; the item 11 itself suffices. For Target Sum with `nums=[1,1,1,1,1]`, S=5 and T=3, negative subset target is `(5-3)/2=1`, giving five index choices. For `nums=[0,0,1]`, target 1, the two zero signs multiply the one valid sign choice by four.

## Common mistakes

- Checking only even total for equal partition without running subset-sum reachability.
- Dividing a negative or odd Target Sum numerator using truncating integer arithmetic without first checking range and parity.
- Ignoring zero elements when counting ways.
- Counting coin permutations when the task asks for combinations.
- Using a Boolean array for a problem that asks for the number of distinct index assignments.

## Knowledge checks with answers

1. **What must be true before equal partition can succeed?** Total must be even and half-total must be reachable.
2. **What is Target Sum's negative-subset target?** `(S-T)/2`, provided `-S <= T <= S` and `S-T` is even.
3. **How many extra ways do z zero values contribute?** A factor of `2^z` to each otherwise compatible sign assignment count.

Sources: [USACO Guide: Intro to DP](https://usaco.guide/gold/intro-dp), [USACO Guide: Knapsack Applications](https://usaco.guide/PAPS.pdf).
