# disjoint-set union and connectivity maintenance — Core concepts and how they fit together

## Learning objectives

- Model DSU as a partition and state the parent-forest invariant.
- Explain `Find`, `Union`, connected queries, and component-count maintenance.
- Distinguish representatives from semantic IDs and root metadata.
- Explain size/rank balancing, compression variants, and amortized bounds.
- Recognize where DSU fits and where traversal or dynamic-connectivity structures are required.

## Prerequisites

Know arrays, graph vertices/edges, undirected connected components, equivalence relations, and asymptotic analysis. A path in an undirected graph connects its endpoints; connectedness is transitive, which is why a partition is an appropriate model.

## Core concepts

### A changing partition

A partition divides a universe into nonempty, pairwise-disjoint sets whose union is the entire universe. DSU begins with singleton sets and supports merging sets. It does not split sets. This merge-only property is fundamental: ordinary DSU is not a general-purpose mutable graph representation.

### Parent forest and root invariant

An array `parent` represents each set as a rooted tree. A root satisfies `parent[root] == root`. Every nonroot points to a parent in the same set, and repeatedly following parents reaches exactly one root. Therefore two elements are in the same set exactly when `Find` returns the same root. Only roots should be linked during a union; linking arbitrary nodes can invalidate this equivalence between roots and sets.

### Representatives are arbitrary

The root is a representative chosen by the implementation. It is not inherently the smallest ID, oldest member, original graph root, or a stable external identity. Balancing heuristics may choose different representatives while representing the same partition. Compare roots for equality; keep semantic values (minimum label, account name, etc.) as separate root metadata if the task requires them.

### Operations and component count

`Find(x)` returns the root for x. A connected query is `Find(a) == Find(b)`. `Union(a,b)` finds both roots; if they match, it returns false and changes nothing. Otherwise it links one root beneath the other, combines root metadata, decrements the number of components, and returns true. With n initialized elements, `components = n - successfulUnionCount`. Self-unions and repeated connections return false.

### Metadata at roots

Size is initialized to one at singleton roots and combined only after a successful merge. After a root becomes a child, its old size is stale; query `size[Find(x)]`. The same pattern can maintain sums, minimum values, or other summaries that can be combined when two sets merge. Component count is global metadata. DSU does not keep a member list; enumerate members by scanning all elements and grouping by root, or maintain additional structures with their own costs.

## Mechanisms and relationships

### Keep the parent trees shallow

Union by size attaches the smaller root tree below the larger. Each time an element gains depth, its containing set at least doubles, so depth increases at most logarithmically. Union by rank attaches lower rank under higher rank and increments the surviving rank only when ranks tie. Rank is a balancing certificate; after compression it need not equal the tree's current height. Either heuristic alone guarantees `O(log n)` tree height.

Path compression rewrites nodes on a find path to point directly to the root. Path halving redirects the current node to its grandparent and advances using the shortened link. Path splitting redirects visited nodes to their grandparents while advancing along the previous parent chain. These variants preserve roots and set membership while shortening future finds. Combined with union by size or rank, they yield `O(α(n))` amortized time per operation over a sequence, where α is inverse Ackermann. This is an amortized sequence bound, not a hard constant worst-case guarantee for each individual call.

### Incremental connectivity and cycle detection

For an undirected graph whose edges are inserted over time, union each edge's endpoints. A successful union joins previously separate components; a failed union means an existing path already connects them, so the inserted edge closes a cycle. DSU cannot return that path or the cycle's edge list because it stores no graph adjacency.

### Grouping from shared relationships

If accounts share email addresses, union the account IDs whenever an email is encountered again. The transitive closure of those unions gives identity groups; equal names alone are not evidence. Then scan and group emails by the final account root. More generally, the DSU elements can represent accounts, variables, grid cells, or mapped keys—the choice depends on which entities the required equivalence relation concerns.

### Kruskal connection

Kruskal sorts weighted edges by increasing cost and accepts an edge only if its endpoints currently lie in different components. DSU tests that condition and merges them. A failed union would create a cycle. Sorting and the cut-property proof make the greedy choice safe; DSU only provides the component test. Dijkstra's priority queue solves shortest paths, a different objective, and is not an alternative to DSU inside Kruskal.

## Worked examples

Initially `parent = [0,1,2,3]`, with four components. `Union(0,1)` may make root 1 point to 0 (or choose the reverse on a tie); `Union(2,3)` creates another two-element set. Now `Find(1) == Find(0)` and `Find(2) == Find(3)`, but the two roots differ. Unioning their roots reduces the count to one. A subsequent union between any pair returns false. The exact parent array may differ after path halving, but the partition stays `{0,1,2,3}`.

For equations `a==b`, `b==c`, `a!=c`, first union a with b and b with c. The inequality check then sees the same root for a and c, correctly rejecting the system. Checking inequality before all equalities would miss the contradiction.

## Misconceptions and edge cases

- **“Different immediate parents mean different sets.”** False. Compare `Find` roots, not `parent[x]`.
- **“A representative is a stable group ID.”** False. It may change after merging.
- **“Every union reduces the count.”** Only successful unions do.
- **“With compression each operation is worst-case O(1).”** The standard guarantee is amortized inverse-Ackermann with balancing.
- **“DSU is best for all connected components.”** Static DFS/BFS is often simpler and retains graph traversal context.
- **“DSU can delete an edge by undoing its parent assignment.”** A component may have alternate paths; the forest alone cannot determine whether deletion splits it.
- **“DSU answers path or distance queries.”** It only answers component membership and maintained component summaries.
- Directed reachability is not an equivalence relation; DSU does not model it.

## Knowledge checks with answers

1. **What must `parent[root]` equal?** The root itself.
2. **When does component count decrease?** Exactly when a union joins two different roots.
3. **Can the root be assumed to be the smallest ID?** No; store that as separate metadata if needed.
4. **Why do equalities need two passes in the equation problem?** Later equalities can transitively contradict an earlier inequality.
5. **What is the standard amortized bound with compression and size/rank?** `O(α(n))` per operation over the sequence.
6. **Why is arbitrary deletion unsupported?** The DSU parent forest does not encode alternate paths or how a deletion partitions a connected component.

Sources: [CP-Algorithms: Disjoint Set Union](https://cp-algorithms.com/data_structures/disjoint_set_union.html), [USACO Guide: DSU](https://usaco.guide/gold/dsu).
