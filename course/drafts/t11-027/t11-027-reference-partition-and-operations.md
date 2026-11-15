# disjoint-set union and connectivity maintenance — Reference: Set partition, find, and union

## Scope and version

This reference covers the merge-only partition model and its core operations. DSU is a timeless data structure rather than a versioned API. The implementation below uses dense integer IDs, union by size, and iterative path halving.

## How this group fits the mental model

The parent forest is a compact encoding of the current partition. Each set has one self-parent root, and that root serves as an arbitrary representative. Finds expose representatives; unions connect roots and merge components. The graph application adds edges to this partition but the DSU itself does not retain those edges.

## Supplied names explained

- **`Disjoint-set union`:** a data structure for maintaining disjoint sets under merge operations and representative queries.
- **`Union-find name`:** another name for DSU, highlighting its two central operations, `Union` and `Find`.
- **`Disjoint partition`:** a collection of nonoverlapping sets covering the initialized universe. Every element belongs to exactly one current set.
- **`Set representative`:** one root chosen to stand for a set. Its identity is implementation-defined.
- **`Find operation`:** follows parent links to the root and returns the representative; optimized implementations also shorten the traversed path.
- **`Union operation`:** finds both roots and, when they differ, links one root under the other and merges their sets.
- **`Connected query`:** tests whether two elements have equal roots. This is an equivalence/connectivity test, not a path query.
- **`Component count`:** number of current sets; decrement it only after a successful union.
- **`Representative identity is arbitrary`:** callers must not treat the numeric root as the smallest member or persistent domain ID.
- **`Incremental edge additions`:** inserting an undirected edge corresponds to merging its endpoint sets; there is no inverse operation for arbitrary edge removal.

## Cross-item comparison

`Find` observes which component an element belongs to; `Union` changes the partition by combining components. A connected query is two finds and does not mutate the partition except for path-shortening writes. A failed union is a connected query followed by no merge. Component count records the number of sets globally, whereas the representative identifies one set only within the current DSU instance.

## Examples

```text
parent = [0, 1, 2, 3], components = 4
Union(0, 1) -> true, components = 3
Union(2, 3) -> true, components = 2
Connected(0, 1) -> true
Union(1, 3) -> true, components = 1
Union(0, 2) -> false, components = 1
```

One correct implementation is:

```csharp
sealed class Dsu
{
    private readonly int[] parent;
    private readonly int[] size;
    public int Components { get; private set; }

    public Dsu(int n)
    {
        parent = new int[n];
        size = new int[n];
        Components = n;
        for (int i = 0; i < n; i++) { parent[i] = i; size[i] = 1; }
    }

    public int Find(int x)
    {
        while (parent[x] != x)
        {
            parent[x] = parent[parent[x]];
            x = parent[x];
        }
        return x;
    }

    public bool Union(int a, int b)
    {
        int ra = Find(a), rb = Find(b);
        if (ra == rb) return false;
        if (size[ra] < size[rb]) (ra, rb) = (rb, ra);
        parent[rb] = ra;
        size[ra] += size[rb];
        Components--;
        return true;
    }
}
```

## Common mistakes

- Comparing `parent[a]` and `parent[b]` instead of finding roots.
- Linking nonroots or decrementing component count after a redundant union.
- Reading a child's stale `size` after it has ceased to be a root.
- Assuming union picks a stable or semantically meaningful representative.
- Forgetting to map one-based labels or sparse strings into unique valid integer IDs.

## Knowledge checks with answers

1. **What does `Union` return when both elements already have the same root?** `false`; no partition change occurs.
2. **How many components remain after k successful unions from n singleton elements?** `n-k`.
3. **Does `Find` promise to return the smallest element?** No.

Sources: [CP-Algorithms: Disjoint Set Union](https://cp-algorithms.com/data_structures/disjoint_set_union.html), [USACO Guide: DSU](https://usaco.guide/gold/dsu).
