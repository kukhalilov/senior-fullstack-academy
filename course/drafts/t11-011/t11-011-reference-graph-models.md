# graph models, representations, and traversal — Reference: Graph types, vertices, and edges

## Scope and version

This lesson explains the sixteen supplied graph model terms.

## How this group fits the mental model

Choose the graph's semantics before choosing its representation. Direction, weight, multiplicity, and connectivity alter which traversals and proofs apply.

## Supplied names explained

- Vertex/node — Entity represented by a graph position.
- Edge — Relationship or permitted transition between vertices.
- Directed graph — Each edge has an orientation from source to destination.
- Undirected graph — An edge permits movement both ways.
- Weighted graph — Edges carry costs, distances, or other values.
- Unweighted graph — Edges have equal cost or are counted as one hop.
- Simple graph — No parallel edges or self-loops.
- Multigraph — Multiple distinct edges may connect the same vertices.
- Self-loop — An edge from a vertex to itself.
- Degree — Number of incident edges in an undirected graph.
- In-degree — Number of directed edges entering a vertex.
- Out-degree — Number leaving it.
- Walk — Sequence of vertices joined by edges; vertices and edges may repeat.
- Trail — Walk with no repeated edge; a vertex may repeat.
- Path/simple path — In the common algorithmic convention, a walk with no repeated vertices. Some texts use “path” more loosely, so follow the problem's definition.
- Cycle — A closed path that returns to its start; in the common simple-cycle convention, no other vertex repeats. Directed cycles must follow edge directions.
- Connected graph — In an undirected graph, every pair has a path.
- Disconnected components — Maximal connected vertex groups in an undirected graph.

## Cross-item comparison

Direction changes reachability: u->v does not imply v->u. Weight changes shortest-path algorithms: ordinary BFS handles equal edge costs, not arbitrary weights. Multiedges and loops may be valid in general but many coding contracts exclude them.

## Examples

An undirected edge {2,5} is stored in both adjacency lists. A directed edge 2->5 appears only in 2's outgoing list. A loop 3->3 contributes both incoming and outgoing degree in a directed graph.

## Common mistakes

- Silently converting a directed relation to undirected.
- Assuming every graph is simple.
- Counting degree from a directed adjacency list without distinguishing in/out.
- Treating edge weight as a label with no algorithmic effect.
- Confusing a walk (repetition allowed) with a trail or simple path.

## Knowledge checks with answers

1. **Does directed reachability imply the reverse?** No.
2. **What is a connected component?** A maximal mutually reachable group in an undirected graph.
3. **When can ordinary BFS find shortest path?** When each edge has equal cost.
4. **Can a graph contain self-loops?** Unless excluded by the contract, yes.

Source: [USACO Guide: Graph Traversal](https://usaco.guide/silver/graph-traversal).
