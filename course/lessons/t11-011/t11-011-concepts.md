# graph models, representations, and traversal — Core concepts and how they fit together

## Learning objectives

- Translate a problem into vertices, edges, direction, and weights.
- Choose adjacency lists, matrices, or implicit neighbors from workload and constraints.
- Implement DFS/BFS with a visited invariant that prevents repeated frontier entries.
- Distinguish reachability, connected components, shortest unweighted paths, and bipartiteness.

## Prerequisites

Know arrays, lists, stacks, queues, sets, and asymptotic analysis. Coordinates and object references may identify vertices even when their values repeat.

## Core concepts

A graph G=(V,E) consists of vertices and edges. An edge can be directed or undirected; a graph may be weighted or unweighted, simple or contain parallel edges/self-loops depending on the contract. A path is a sequence of adjacent vertices; a cycle returns to a prior vertex. Degree counts incident edges in undirected graphs; directed graphs distinguish in-degree and out-degree. A connected undirected graph has a path between every vertex pair; a disconnected graph splits into components.

## Mechanisms and relationships

### Representations

An adjacency list stores each vertex's neighbors. For a simple undirected graph it stores each edge twice, once at each endpoint, and uses O(V+E) memory. An adjacency matrix stores whether each ordered pair is an edge, uses O(V²), and answers an edge lookup in O(1). An edge list stores endpoints per edge and is compact, but neighbor lookup requires scanning. Sparse/dense describes E relative to V².

A grid can be an implicit graph: a cell is a vertex and valid orthogonal moves are edges generated on demand. Check row and column bounds before reading; diagonal movement is not implied. Avoid constructing explicit adjacency when formulaic neighbors suffice.

### Traversal state and visited timing

DFS uses recursion or a stack; BFS uses a queue. Mark a vertex visited when discovering/enqueuing it, before it can be enqueued by another neighbor. This ensures each vertex enters the frontier at most once and makes the O(V+E) bound hold. Marking only on dequeue can add duplicate entries, potentially increasing memory and work.

For a complete traversal forest, loop over all vertices and start a traversal from each unvisited one. In undirected graphs, each such start labels one connected component. A directed traversal finds reachability from a source; strongly connected components are a distinct notion.

### Shortest paths and multi-source BFS

In an unweighted graph, BFS processes vertices by nondecreasing edge distance. First discovery gives minimum edge count. DFS can establish reachability but may find a longer route first. Multi-source BFS marks and enqueues every source at distance zero; all later layers represent distance from the nearest source.

### Bipartite coloring

A graph is bipartite if vertices can be colored with two colors so every edge crosses colors. BFS/DFS assigns the opposite color to an uncolored neighbor. A same-colored adjacent pair is a conflict. Run across every connected component. An undirected graph is bipartite exactly when it has no odd-length cycle; an isolated vertex is bipartite.

## Worked examples

In Number of Provinces, the symmetric matrix describes an undirected graph. For every unseen city, increment the province count and DFS across matrix entries equal to 1. In Rotting Oranges, enqueue every initially rotten cell; then each BFS layer is one minute. In Clone Graph, map each original node reference to one new node so cycles terminate and repeated values do not merge distinct nodes.

## Misconceptions and edge cases

- BFS shortest-path guarantees apply to equal edge costs, not weighted graphs.
- A single source traversal does not count all disconnected components.
- A directed graph's reachability is not undirected connectedness.
- Marking visited after enqueue can create duplicate work.
- Node value is not necessarily unique identity.
- Matrix O(V²) space can dominate for sparse graphs.
- Grid rows/columns and permitted directions must follow the input definition.

## Knowledge checks with answers

1. **Adjacency-list space?** O(V+E).
2. **When is first BFS discovery shortest?** In an unweighted graph, by edge count.
3. **Why mark on enqueue?** To prevent another edge from enqueueing the same vertex again.
4. **How find every undirected component?** Restart traversal at each still-unvisited vertex.
5. **What proves bipartite failure?** An edge joins two vertices assigned the same color.

Sources: [USACO Guide: Graph Traversal](https://usaco.guide/silver/graph-traversal), [USACO Guide: Flood Fill](https://usaco.guide/silver/flood-fill).
