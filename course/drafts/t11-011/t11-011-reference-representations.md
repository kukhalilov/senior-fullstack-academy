# graph models, representations, and traversal — Reference: Explicit and implicit graph representations

## Scope and version

This lesson explains the ten supplied storage and graph-density terms.

## How this group fits the mental model

Representation determines memory cost and which operations are cheap. Prefer the simplest representation that matches graph size, density, and query workload.

## Supplied names explained

- Adjacency list — For each vertex, store its outgoing/incident neighbors.
- Adjacency matrix — A V-by-V structure records whether each ordered pair is connected.
- Edge list — Store each edge as endpoint data; useful for scanning all edges.
- O(V+E) adjacency-list space — Vertices plus stored neighbor entries; undirected edges are listed twice.
- O(V²) matrix space — Storage includes absent edges.
- Constant-time matrix edge lookup — Inspect one cell directly.
- Grid as implicit graph — Each cell is a vertex; valid neighboring cells are computed when needed.
- Neighbor generation — Produce only legal outgoing neighbors for the current vertex.
- Sparse graph — E is much smaller than V².
- Dense graph — E approaches the number of possible vertex pairs.

## Cross-item comparison

Adjacency lists are generally memory-efficient for sparse graphs and traverse only present edges. Matrices spend quadratic memory but simplify edge tests and can be appropriate for dense small graphs. An edge list is compact but expensive for repeatedly finding neighbors. An implicit grid removes adjacency storage entirely.

## Examples

For an undirected edge between 0 and 2, add 2 to list 0 and 0 to list 2. In an m-by-n grid, an orthogonal neighbor candidate is (r+1,c); check r+1<m before access.

## Common mistakes

- Storing only one endpoint for an undirected adjacency list.
- Accidentally adding reverse edges to a directed graph.
- Allocating an adjacency matrix for a huge sparse graph.
- Generating diagonal grid moves when only 4-directional moves are allowed.

## Knowledge checks with answers

1. **Which representation uses O(V+E)?** Adjacency list.
2. **Which makes an edge lookup O(1)?** Adjacency matrix.
3. **Why is a grid often implicit?** Its neighbors follow a small coordinate rule.
4. **What changes for an undirected edge list?** Each edge may be stored once, but adjacency traversal requires indexing or extra structure.

Sources: [USACO Guide: Graph Traversal](https://usaco.guide/silver/graph-traversal), [USACO Guide: Flood Fill](https://usaco.guide/silver/flood-fill).
