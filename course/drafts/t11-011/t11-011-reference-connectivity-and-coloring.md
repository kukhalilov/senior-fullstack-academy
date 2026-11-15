# graph models, representations, and traversal — Reference: Connectivity, cycles, and graph coloring

## Scope and version

This lesson explains the ten supplied connectivity, coloring, and grid concepts.

## How this group fits the mental model

Traversal labels the portion reachable under the graph's edge semantics. Repeating that process discovers undirected components. Coloring imposes a constraint across every edge and detects contradictions.

## Supplied names explained

- Connected components — Maximal sets of vertices connected by undirected paths.
- Reachability — Existence of a directed or undirected path from a specified source.
- Undirected cycle detection — Detect revisiting an already discovered vertex other than the DFS parent; a visited neighbor alone may just be the parent edge.
- Bipartite graph — Vertices can be divided into two sets such that every edge crosses between them.
- Two-coloring — Assign alternating colors across each edge; conflicting same-color adjacency disproves bipartiteness.
- Grid flood fill — Traversal over same-valued or eligible adjacent cells, usually with 4- or 8-direction choice explicit.
- Directed versus undirected connectivity — Directed reachability is asymmetric; weak or strong connectivity require distinct definitions.
- Strong connectivity distinction — In a directed graph, every vertex can reach every other only within a strongly connected component.
- Mark-on-enqueue rule — Mark before adding a vertex to BFS so it enters the queue once.
- Traversal source selection — Choose one source for reachability, all initial sources for multi-source propagation, or every unvisited vertex for component enumeration.

## Cross-item comparison

Two-coloring is a constrained traversal, not a sort or a component-count routine. A graph with multiple components needs a fresh arbitrary color for each new component. In an undirected graph, an odd cycle creates a same-color conflict.

## Examples

For a triangle, color vertex 0 red; its two neighbors are blue. The edge between those neighbors conflicts, proving non-bipartite. For an isolated vertex, assign either color and continue; it poses no conflict.

## Common mistakes

- Checking only the component containing vertex zero.
- Treating directed reachability as symmetric.
- Declaring an undirected DFS back-edge to the immediate parent a cycle.
- Omitting boundary checks in grid neighbor generation.
- Using 8-directional grid connectivity when the statement specifies orthogonal adjacency.

## Knowledge checks with answers

1. **How count components?** Start a traversal at each unseen vertex and increment the count.
2. **What edge disproves bipartiteness?** One whose endpoints already have the same color.
3. **Why skip the DFS parent in undirected cycle checks?** The reverse adjacency entry is the tree edge just traversed.
4. **Does directed reachability imply strongly connected?** No; strong connectivity requires mutual reachability among vertices.

Sources: [USACO Guide: Graph Traversal](https://usaco.guide/silver/graph-traversal), [USACO Guide: Flood Fill](https://usaco.guide/silver/flood-fill).
