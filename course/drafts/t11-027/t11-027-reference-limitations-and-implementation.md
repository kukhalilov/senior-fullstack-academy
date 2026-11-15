# disjoint-set union and connectivity maintenance — Reference: Limitations, invariants, and implementation details

## Scope and version

This reference covers safe initialization, ID mapping, root metadata, and operations the ordinary DSU does not support. The guidance applies to standard mutable parent-forest implementations.

## How this group fits the mental model

DSU is correct only when its internal forest continues to represent the intended partition. Initialization defines the universe. `Find` must stay within it. A successful union links roots and updates metadata. The merge-only model explains both the data structure's speed and its inability to handle general splitting operations.

## Supplied names explained

- **`No efficient general edge deletion`:** deleting an edge may or may not split its graph component depending on alternate paths, which the DSU forest does not record.
- **`No shortest-path reconstruction`:** parent pointers encode the implementation forest, not original graph edges or a shortest route.
- **`Initialize each element as singleton`:** set `parent[i]=i` and root size to one; component count starts at n.
- **`Union returns whether sets merged`:** return true exactly when the roots differed and were linked.
- **`Only representatives store root metadata`:** current size/rank/summary is read from the current root; child-root fields may be stale.
- **`Use size or rank at roots`:** compare balancing metadata only after `Find` has produced roots.
- **`Iterative find implementation`:** a loop with path halving avoids recursion depth and shortens links in place.
- **`Index and element-to-ID mapping`:** use dense zero-based indices or an injective map for strings/sparse labels; separate different namespaces with disjoint ID ranges.

## Cross-item comparison

Deleting graph edges is different from applying a stack rollback to the last union: arbitrary edge deletion can split a component and requires knowledge of alternate paths. Path reconstruction requires graph adjacency or predecessor information, not DSU parents. A dense `parent[]`/`size[]` layout is efficient after labels are mapped; a dictionary-based DSU trades additional overhead for sparse or nonnumeric identities.

## Examples

For rows and columns both labeled 0..10000, map row `x` to `x` and column `y` to `10001+y`; otherwise a row and a column with the same coordinate number would collide despite being different entity types. When counting components for a sparse input, gather touched IDs and count distinct roots only among them.

For a large sequence of `Union(a,b)`, first check whether the roots are equal. On that path, do not update root sizes or component count. On a successful merge, attach the selected root and update only the surviving root's size.

## Common mistakes

- Treating `parent[]` as the original graph's adjacency or path.
- Reinitializing IDs inconsistently or allowing two distinct domain values to share one ID.
- Letting row and column namespaces overlap unintentionally.
- Counting unused slots as real components.
- Attempting to delete an arbitrary edge by resetting one parent pointer.
- Reading stale root metadata after the root has become a child.

## Knowledge checks with answers

1. **What is the base state for n IDs?** n singleton roots and n components.
2. **Why can an arbitrary edge deletion not be handled by one parent update?** The graph may contain alternate paths; DSU never stored them.
3. **What should a caller do to enumerate members?** Scan all IDs and group by their current `Find` result, or maintain explicit member structures separately.

Sources: [CP-Algorithms: Disjoint Set Union](https://cp-algorithms.com/data_structures/disjoint_set_union.html), [USACO Guide: DSU](https://usaco.guide/gold/dsu).
