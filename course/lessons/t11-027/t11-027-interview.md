# disjoint-set union and connectivity maintenance — Interview questions and reasoning

## Core questions

1. What does DSU represent, and what are its two central operations?
2. Why must `Union` link roots rather than arbitrary nodes?
3. What do path compression and union by size/rank each contribute?
4. What does a failed union mean when processing undirected edges?
5. Which queries and mutations does ordinary DSU not support?
6. How do you group all elements of each component for output?

## Concise interview answers

1. DSU maintains a partition under merges. `Find` returns an element's set representative; `Union` merges the sets containing two elements.
2. Linking roots preserves exactly one representative per component and keeps the parent forest acyclic.
3. Balancing heuristics limit height during merges; compression shortens paths during finds. Together they give amortized `O(α(n))` operations.
4. The endpoints were already connected by an earlier path, so the new edge closes a cycle.
5. Arbitrary edge deletion, shortest paths, path reconstruction, and member enumeration without a scan or extra structure.
6. Scan all elements, call `Find`, and bucket each element by root; sort the resulting groups by problem rules.

## Deep follow-up answers

### Why is the representative arbitrary?

The representative is the root chosen by union's balancing rule and tie-breaking. Different correct implementations can select different roots while representing the same partition. If the application requires a minimum label or another semantic property, keep it in separate root metadata and combine it after successful unions.

### What is the precise complexity claim?

Union by size or rank alone gives `O(log n)` tree height. Pair either with path compression or standard halving/splitting and an intermixed sequence has inverse-Ackermann amortized cost, conventionally `O(α(n))` per operation after initialization. It is a sequence-wide amortized bound, not a strict worst-case constant for every call.

### Why does failed union imply a cycle only for undirected edge insertion?

An existing undirected path between endpoints plus the new undirected edge forms a cycle. Directed reachability does not define a symmetric equivalence relation, so the same root model does not detect directed cycles.

### Why is deletion hard?

DSU remembers a forest of representative pointers, not all original edges or alternate paths. Removing a graph edge may or may not disconnect its endpoints depending on alternate routes. The parent forest lacks the information to decide which. Rollback DSU supports a restricted stack-like undo model by logging changed fields; it is used in specialized offline algorithms and is not arbitrary online deletion.

### How would you solve Accounts Merge?

Make account indices DSU elements. Map every email to its first account; union later accounts that contain that email. After all unions, group emails by final roots, sort them, and use a guaranteed-consistent name from the component. Equal names alone are insufficient evidence to merge.

### How does Kruskal use DSU?

Sort candidate weighted edges ascending. Accept an edge only when it joins two separate DSU components. The cut property justifies that greedy edge choice; DSU makes cycle/connectivity checks efficient. A priority queue in Dijkstra serves shortest-path relaxation, not the same MST task.

## Scenario questions

- You receive 500,000 edge additions with connectivity queries between them. What structure fits, and what must be initialized? **DSU**, after mapping all possible vertices to unique IDs; successful edge additions call `Union`, and queries compare roots.
- A system needs to remove arbitrary connections as requests arrive. Does ordinary DSU fit? **No**; choose an appropriate dynamic-connectivity method or a different representation for the required bounds.
- You need the actual route between two vertices, not just whether one exists. Is DSU enough? **No**; retain graph edges and run an appropriate traversal/search.
- A grid contains a small number of active cells in a huge coordinate plane. What must root counting account for? Count only IDs that correspond to active/touched cells.
- Two equations assert `a!=b` and later `a==c`, `c==b`. How should checks be ordered? Union all equalities first, then check inequalities.

## Tradeoffs and alternatives

- **DSU vs DFS/BFS:** DSU handles repeated connectivity queries under merges and does not require retaining adjacency. DFS/BFS is direct for a static graph, runs in `O(V+E)`, and can preserve paths/traversal context.
- **Size vs rank:** either balances trees to logarithmic height alone. Size also yields component cardinality; rank is a compact balancing certificate and is not current height after compression.
- **Full compression vs halving/splitting:** all shorten future paths; iterative variants avoid recursion and may reduce writes or simplify stack behavior.
- **Ordinary DSU vs rollback DSU:** ordinary DSU prioritizes fast finds with compression; rollback variants log changes for controlled undo and commonly omit compression. They solve different operation models.
- **DSU vs Kruskal's priority ordering:** DSU does not order edges. Kruskal sorts by weight, then uses DSU to decide whether an edge joins components.

## Common weak answers

- “Union just sets `parent[a]=b`.” This may link nonroots and break the partition representation.
- “Every union reduces component count.” Redundant unions do not.
- “Find is always constant time.” The strong standard claim is amortized inverse-Ackermann with a balancing heuristic.
- “The root is the smallest ID.” It is arbitrary unless a separate minimum-label summary is maintained.
- “We can delete an edge by reversing its union.” The DSU operation may represent many graph edges and alternate paths.
- “Different roots prove variables are unequal.” They only mean no equality path has merged them; absent an inequality, they may still receive equal values.

## Self-check rubric

You are ready to explain DSU if you can:

- State the root and partition invariants without conflating parent pointers with graph edges.
- Write `Find` with a valid compression strategy and `Union` by size/rank.
- Update component count and root metadata only after successful merges.
- Explain the amortized bound and its assumptions.
- Map a problem's entities to IDs without namespace collisions.
- Identify when deletion, paths, directed reachability, or static traversal makes ordinary DSU insufficient.

Sources: [CP-Algorithms: Disjoint Set Union](https://cp-algorithms.com/data_structures/disjoint_set_union.html), [USACO Guide: DSU](https://usaco.guide/gold/dsu).
