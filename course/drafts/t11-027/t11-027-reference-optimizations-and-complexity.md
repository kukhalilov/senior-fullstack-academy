# disjoint-set union and connectivity maintenance — Reference: Path compression and union heuristics

## Scope and version

This reference covers the named forest optimizations and their standard complexity guarantees. DSU is a data-structure technique, not a versioned runtime API. All variants preserve the same set partition while changing parent links.

## How this group fits the mental model

Unbalanced parent trees make `Find` slow. Union heuristics limit tree height when sets merge; compression strategies shorten paths as finds occur. The mechanisms complement each other: a balancing heuristic plus compression provides the near-constant amortized bound.

## Supplied names explained

- **`Path compression`:** after finding a root, rewrite nodes visited on the path to point directly to that root.
- **`Union by size`:** link the smaller root tree under the larger and add sizes at the surviving root.
- **`Union by rank`:** link lower-rank roots under higher-rank roots; on equal ranks, choose either parent and increment its rank. Rank is a balancing certificate, not necessarily current height after compression.
- **`Path halving`:** while walking upward, make the current node point to its grandparent and continue from the shortened link.
- **`Path splitting`:** redirect each visited node to its grandparent, but advance along the previous parent chain; common loop variants should be checked against this pointer behavior.
- **`Amortized inverse-Ackermann complexity`:** a sequence-wide upper bound involving the extremely slowly growing inverse Ackermann function α.
- **`O(α(n)) amortized operations`:** the conventional per-operation summary for compression plus union by size/rank, amortized across an operation sequence.
- **`Parent forest`:** the collection of rooted parent trees, one per disjoint set; compression changes its shape without changing its roots.
- **`Representative root`:** the self-parent node at the top of one set's tree.

## Cross-item comparison

`Union by size` uses exact component cardinality and is convenient when size metadata is also needed. `Union by rank` stores a compact height-related certificate and needs no exact component count. Either alone bounds tree height by `O(log n)`. `Path compression` sends all visited nodes to the root; `Path halving` performs fewer writes by skipping upward two levels each iteration. Standard compression variants combined with either balancing heuristic achieve the same asymptotic amortized bound.

## Examples

For `0 -> 1 -> 2 -> 3` where 3 is the root, full compression during `Find(0)` makes 0, 1, and 2 point to 3. One path-halving loop is:

```csharp
while (parent[x] != x)
{
    parent[x] = parent[parent[x]];
    x = parent[x];
}
```

With union by size, if roots have sizes 2 and 5, attach the size-2 root under the size-5 root and store 7 at the surviving root. The child root's old size must not be used as the current set size.

## Common mistakes

- Stating `O(1)` worst-case for every call; the known bound is amortized over a sequence.
- Updating rank when unequal ranks are joined.
- Treating rank as exact current height after compression.
- Applying size updates to nonroots or when a union finds the same root.
- Mixing the path-halving assignment with path-splitting advancement and mislabeling what it does.

## Knowledge checks with answers

1. **What is the height bound with size/rank but no compression?** `O(log n)`.
2. **What combination gives inverse-Ackermann amortized operations?** Path compression or a standard halving/splitting variant with union by size or rank.
3. **Does compression alter component membership?** No; it only shortens parent paths.

Sources: [CP-Algorithms: Disjoint Set Union](https://cp-algorithms.com/data_structures/disjoint_set_union.html), [USACO Guide: DSU](https://usaco.guide/gold/dsu).
