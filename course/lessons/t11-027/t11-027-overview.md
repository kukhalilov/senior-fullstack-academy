# disjoint-set union and connectivity maintenance — Big-picture orientation and mental model

## Problem and purpose

When relationships are only added, many questions become: are these two objects now in the same group, and how many groups remain? Re-running graph traversal after every addition repeats work. Disjoint-set union (DSU), also called union-find, tracks the evolving partition directly. It is used for incremental undirected connectivity, grouping records through shared keys, cycle detection, and the connectivity test in Kruskal's minimum spanning tree algorithm.

## Plain-language mental model

Imagine a set of labeled people initially standing alone. A union request joins the groups containing two people. Find asks which group contains someone. The implementation does not store a meaningful group name; it stores a representative selected for efficiency. To ask whether two people are grouped together, compare their representatives.

## How the parts fit together

| Need | DSU mechanism |
| --- | --- |
| Represent current groups | Parent forest with one root per group |
| Find an element's group | Follow parent links to the root |
| Merge groups | Link one root under another |
| Avoid tall trees | Union by size/rank and path compression |
| Count groups | Decrease a counter after each successful merge |
| Detect a cycle during edge insertion | A union that returns false means endpoints were already connected |
| Group all values for output | Scan values and bucket them by `Find(value)` |

## Concept map

The foundation is a partition into disjoint equivalence classes. `Find` exposes a class through its arbitrary representative. `Union` joins two classes only if their roots differ. Union by size/rank controls the forest's height, and compression shortens paths during finds. This gives amortized `O(α(n))` operations for standard combinations. The structure handles incremental merging, but does not retain paths, support arbitrary edge deletion, or automatically enumerate set members.

## End-to-end walkthrough

Start with vertices `{0}`, `{1}`, `{2}`, `{3}` and component count four. Add undirected edge `(0,1)`: their roots differ, so union succeeds and the count becomes three. Add `(2,3)`: count becomes two. Add `(1,2)`: the roots of the two groups differ, so they merge and count becomes one. If edge `(0,3)` arrives next, both roots are already equal; union returns false, showing the edge closes a cycle. Which numeric root survives is an implementation detail.

## When to use it and tradeoffs

Use DSU when the universe is known or can be mapped to IDs, operations merge groups, and queries ask connectivity or component metadata. DFS/BFS is often clearer for a static graph and can retain traversal information. DSU cannot directly answer shortest-path or path-reconstruction questions, and a normal DSU cannot efficiently split a component after arbitrary edge deletion. For deletion-heavy dynamic connectivity, specialized rollback/offline techniques are needed.

## What later lessons cover

The concepts lesson establishes the parent-forest invariant, operation semantics, metadata, and limits. The reference lessons enumerate the exact operations, balancing and compression methods, applications, and implementation rules. The practice lessons apply DSU to cycle detection, identity grouping, component counting, bipartite coordinate connectivity, equality constraints, and Kruskal. The interview lesson consolidates recognition cues and tradeoffs.

Sources: [CP-Algorithms: Disjoint Set Union](https://cp-algorithms.com/data_structures/disjoint_set_union.html), [USACO Guide: DSU](https://usaco.guide/gold/dsu).
