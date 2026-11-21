# graph models, representations, and traversal — Reference: DFS, BFS, and traversal state

## Scope and version

This lesson explains the ten supplied traversal and discovery-state terms.

## How this group fits the mental model

DFS and BFS differ in frontier order. Both need a visited state when graphs can contain cycles. A traversal forest results when a traversal is restarted for remaining vertices.

## Supplied names explained

- Depth-first search — Explore a neighbor path before backtracking.
- Recursive DFS — Use function calls as the frontier stack; depth can reach V.
- Iterative DFS with stack — Explicitly store deferred vertices.
- Breadth-first search — Explore in increasing edge-distance layers.
- Queue-based BFS — FIFO queue maintains layer order.
- Visited set — Records discovered vertices to stop revisits.
- Discovery parent — Vertex from which a node was first found; reconstructs a BFS tree/path.
- Traversal forest — Collection of discovery trees covering all vertices after restarting from unseen nodes.
- Multi-source BFS — Initialize one queue with all sources, each at distance zero.
- O(V+E) traversal bound — With adjacency lists and mark-on-discovery, each vertex and edge entry is processed O(1) times.

## Cross-item comparison

DFS and BFS both answer reachability in O(V+E) on adjacency lists. BFS additionally gives shortest edge-count distances in unweighted graphs. Recursive DFS may risk call-stack limits; iterative DFS avoids call stack but still stores a frontier.

## Examples

In a diamond graph, source S reaches A and B, both of which reach T. Marking T visited when it is first enqueued avoids a second queue entry. In multi-source BFS, if S1 and S2 are both initialized, T receives distance from the nearer one.

## Common mistakes

- Marking only when dequeued and allowing duplicate frontier insertions.
- Using DFS order to claim a shortest path.
- Starting once and assuming disconnected vertices were processed.
- Forgetting that a directed graph traversal follows edge direction.

## Knowledge checks with answers

1. **When does BFS give shortest path?** For unweighted/equal-cost edges.
2. **What prevents cycles from causing infinite traversal?** Visited state.
3. **What is stored as a discovery parent?** The predecessor that first discovered the vertex.
4. **How start multi-source BFS?** Mark and enqueue every source at distance zero.

Sources: [USACO Guide: Graph Traversal](https://usaco.guide/silver/graph-traversal), [USACO Guide: Flood Fill](https://usaco.guide/silver/flood-fill).
