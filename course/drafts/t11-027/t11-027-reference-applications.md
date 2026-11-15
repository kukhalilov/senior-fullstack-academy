# disjoint-set union and connectivity maintenance — Reference: Connectivity, cycles, and component metadata

## Scope and version

This reference covers the named graph and grouping patterns that use DSU. They are timeless algorithms; specific problem statements and constraints are recorded in the problem manifests.

## How this group fits the mental model

Each application first chooses what a DSU element represents, then identifies which observed relationship should merge two elements. Correctness depends on choosing IDs that preserve the relation being asked about. DSU only stores the resulting equivalence classes; problem-specific data and output construction remain separate.

## Supplied names explained

- **`Incremental connectivity`:** answer component queries as undirected edges are inserted; each insertion is one union.
- **`Undirected cycle detection during insertion`:** an edge whose union fails connects endpoints already joined by an earlier path and closes a cycle.
- **`Component size`:** number of elements in one set, stored and updated at its root.
- **`Component count maintenance`:** initialize to the number of singleton IDs and decrement only after successful merges.
- **`Kruskal minimum spanning tree connection`:** process weighted edges in nondecreasing order and accept only edges that successfully union two components.
- **`Accounts or identities grouping`:** merge account IDs when a shared key (such as email) occurs; group all values by final root after all unions.
- **`Grid cell connectivity`:** map relevant cells to IDs and union neighboring cells that the problem declares connected; do not include irrelevant cells in a root count.
- **`Offline connectivity query`:** when future query information is known, some tasks can sort or reverse events to make unions suitable; fully dynamic deletion requires additional rollback/time-segment methods outside this basic structure.

## Cross-item comparison

Component count and component size are distinct metadata: one counts all sets globally, the other counts members in one root. Incremental connectivity can be processed immediately. An offline query formulation may reorder work only when the problem's answer semantics permit it. Kruskal's DSU checks whether an edge would form a cycle; it does not sort the edges or decide that lower weight is desirable.

## Examples

For incremental edge insertions `(0,1)`, `(2,3)`, `(1,2)`, component count changes 4 -> 3 -> 2 -> 1. A later `(0,3)` fails union and closes a cycle.

For accounts, store `email -> first account index`. On a repeated email, union the current account with its previous owner. Once all accounts are processed, scan emails again and group them by `Find(accountIndex)`, then sort each email list. Equal names do not merge accounts.

For Kruskal, sort candidate edges by weight, add an edge only when union succeeds, and stop after `V-1` accepted edges for a connected graph. This produces a minimum spanning tree; a priority queue in Dijkstra addresses shortest paths, a different problem.

## Common mistakes

- Treating a DSU component as a shortest-path witness.
- Counting every initialized coordinate/cell ID even when it never appears in the input.
- Merging identities by a shared display name when the prompt says only shared keys establish identity.
- Forgetting transitivity when several accounts are connected through a chain of shared emails.
- Assuming an offline query automatically makes arbitrary deletions supported by ordinary DSU.

## Knowledge checks with answers

1. **What does a failed union say about a newly inserted undirected edge?** Its endpoints already had a path, so the edge creates a cycle.
2. **Where is component size stored?** At the current representative root.
3. **What does DSU contribute to Kruskal?** A fast test/merge for edge endpoints' current components.

Sources: [CP-Algorithms: Disjoint Set Union](https://cp-algorithms.com/data_structures/disjoint_set_union.html), [USACO Guide: DSU](https://usaco.guide/gold/dsu).
