# graph models, representations, and traversal — Big-picture orientation and mental model

## Problem and purpose

Graphs model entities connected by relationships. Unlike a tree, a graph can contain cycles, multiple paths, and disconnected components. The algorithm must choose a representation, track discovery, and match directedness and edge meaning to the problem.

## Plain-language mental model

Think of a graph as a map: vertices are places and edges are allowed moves. A traversal explores that map. DFS follows one route deeply before backtracking; BFS expands outward in distance layers. A visited set prevents revisiting cyclic paths. A grid is a graph too, but its neighbors can be generated from row and column coordinates rather than stored explicitly.

## How the parts fit together

An adjacency list stores outgoing neighbors and uses O(V+E) space. An adjacency matrix uses O(V²) space and checks a possible edge in O(1). The graph's direction matters: an undirected edge appears in both lists; directed reachability follows only outgoing edges. A traversal starting from one source only reaches that source's component or reachable set; a complete undirected component count starts again from each unvisited vertex.

For unweighted shortest paths by edge count, BFS provides minimum distances. DFS is useful for reachability and component exploration but does not guarantee shortest paths. Multi-source BFS initializes the queue with every starting source at distance zero and propagates from all of them together.

## Concept map

| Need | Representation or traversal | Key state |
| --- | --- | --- |
| Sparse graph neighbors | Adjacency list | Visited per vertex |
| Frequent edge-existence checks on dense graph | Adjacency matrix | Matrix row/column |
| Reachability or flood fill | DFS or BFS | Mark before adding to frontier |
| Shortest edge-count path | BFS | Parent or distance |
| All connected components | Restart traversal at each unseen vertex | Component count |
| Bipartite test | BFS/DFS two-coloring | Color per component |
| Grid connected regions | Implicit graph flood fill | Bounds and cell visited |
| Propagation from many initial cells | Multi-source BFS | Initial frontier and minute/layer |

## End-to-end walkthrough

For an undirected graph, build adjacency in both directions. Start BFS at a source, mark it visited when enqueuing it, and enqueue each unseen neighbor. Marking at enqueue ensures each vertex enters the queue at most once, even if multiple current vertices lead to it. When the queue empties, exactly the source-reachable set has been processed.

## When to use it and tradeoffs

Use adjacency lists for sparse graphs and scans over neighbors; matrices suit small dense graphs or many edge queries. Use BFS where shortest unweighted distance or layer timing matters. DFS often has simpler recursive structure but call-stack depth can reach V. In large graphs prefer iterative traversal and ensure the frontier cannot accumulate duplicates.

## What later lessons cover

References compare graph types, representations, DFS/BFS, connectivity, and coloring. Practice covers grids, adjacency matrices, deep copying by reference identity, multi-source propagation, bipartiteness, and directed reachability. Weighted shortest paths and disjoint sets are separate topics.

Sources: [USACO Guide: Graph Traversal](https://usaco.guide/silver/graph-traversal), [USACO Guide: Flood Fill](https://usaco.guide/silver/flood-fill).
