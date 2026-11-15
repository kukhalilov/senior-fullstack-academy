# knapsack, subset-sum, and resource-allocation DP — Reference: Loop direction, reuse, and storage optimization

## Scope and version

This reference covers one-dimensional update order, initialization, and compact reachability storage. These are algorithmic patterns, not language-version-specific features.

## How this group fits the mental model

Compressing item-prefix rows reuses one array for both the old and new layer. The iteration direction determines which version of a state is read. A correct recurrence with the wrong direction silently changes the item-reuse rules.

## Supplied names explained

- **`Descending capacity loop for 0/1 use`:** scan `W` down to item weight so `dp[c-weight]` still belongs to the previous item layer.
- **`Ascending capacity loop for unbounded use`:** scan upward so the current item can feed later capacities during the same pass.
- **`Accidental item reuse bug`:** ascending update in a 0/1 problem reads a state already updated using the current item, effectively allowing repeats.
- **`One-dimensional compression`:** replace the item-by-capacity table with one capacity array when loop order preserves dependencies.
- **`Two-dimensional reference table`:** store one row per item prefix and capacity; useful for clearer derivation or reconstruction.
- **`Bitset subset-sum update`:** shift the reachable-sum bitset by item value and OR it into the old bitset; this compactly represents 0/1 reachability.
- **`Initialize capacity-zero state`:** mark the empty selection at sum/capacity zero, such as `reachable[0]=true` or `ways[0]=1`.
- **`Impossible-state initialization`:** use false/zero for reachability/counting as appropriate, or infinity for a minimum-cost state that has no solution yet.

## Cross-item comparison

Descending and ascending scans encode different recurrences: descending preserves 0/1 item uniqueness; ascending intentionally permits unbounded reuse. The two-dimensional reference table avoids the in-place overwrite hazard because previous and current item layers are separate. A bitset changes representation and can exploit word-level parallelism, but its shifted update still must model each item only once.

## Examples

For 0/1 subset sum with target 4 and one item of value 2, start `reachable[0]=true`. Descending update marks 2 but not 4. If scanned upward, marking 2 would immediately make 4 appear reachable by reusing the same item twice. For unbounded coin value 2, ascending update should mark both 2 and 4.

For count states with one zero-valued item, `count[sum] += count[sum-0]` doubles each count once. The loop still runs once per sum, not repeatedly until a fixed point.

## Common mistakes

- Choosing loop direction by habit rather than deriving which layer the take transition reads.
- Using `for (c=0; c<=W; c++)` for a 0/1 one-dimensional update.
- Forgetting `dp[0]` represents one empty way in counting problems.
- Treating a compressed array as if it still preserves every item's previous row for reconstruction.
- Shifting a bitset beyond its supported integer width without a multiword representation.

## Knowledge checks with answers

1. **Which direction preserves 0/1 item uniqueness?** Descending capacity.
2. **Which direction permits unbounded reuse?** Ascending capacity.
3. **What does `ways[0]=1` mean?** There is one way to form amount zero: choose nothing.

Sources: [USACO Guide: Intro to DP](https://usaco.guide/gold/intro-dp), [USACO Guide: Knapsack Applications](https://usaco.guide/PAPS.pdf).
