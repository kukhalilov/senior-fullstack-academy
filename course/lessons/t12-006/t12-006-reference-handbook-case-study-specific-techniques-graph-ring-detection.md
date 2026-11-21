# end-to-end system design case studies — Reference: Graph ring detection

Sources: [HLD Handbook](https://hld.handbook.academy/), [NetworkX cycle algorithms](https://networkx.org/documentation/stable/reference/algorithms/cycles.html), [NetworkX simple cycles](https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.cycles.simple_cycles.html), [Johnson, Finding all the elementary circuits of a directed graph](https://doi.org/10.1137/0204007).

## Scope and version

This case study covers detecting whether a graph contains a cycle, finding one witness cycle, and the separate task of enumerating cycles. “Ring” is not a single algorithmic contract: the correct method depends on whether edges are directed, whether the graph is a multigraph, whether self-loops count, and whether the system needs one cycle, all simple cycles, or a cycle basis. NetworkX documentation was checked on 2026-11-21 for definitions and reference algorithms; the principles below are language- and library-independent.

## How this group fits the mental model

A graph represents entities as vertices and relationships as edges. A cycle is a path that returns to its start. Finding one cycle answers “does a circular dependency or route exist?” Enumerating every cycle answers the much larger question “which distinct cycles exist?” Those tasks have very different costs: the number of simple cycles can be exponential in graph size, so an API that lists all cycles may generate enormous output even when detecting one cycle is easy.

Real systems use graphs for build dependencies, service calls, workflow steps, financial relationships, routes, and provenance. Before choosing an algorithm, define what each directed edge means and whether cycles are valid, suspicious, or only problematic for a particular edge type. A graph may be acyclic in one projection and cyclic in another.

## Supplied names explained

- `Graph ring detection` — Detecting or reporting closed paths in a graph. The problem definition must specify directedness, cycle type, self-loop and parallel-edge behavior, and whether the output is one witness, every simple cycle, or a basis.

### Detection algorithms

**Directed graph: depth-first search colors.** Traverse each unvisited vertex using DFS. Mark a vertex gray while it is on the current recursion/explicit stack and black after all outgoing edges are processed. An edge to a gray vertex is a back edge and proves a directed cycle; store parent links to reconstruct the witness. An edge to a black vertex alone does not prove a cycle because that vertex may have been completed in another branch. Each vertex and edge is processed a constant number of times, so detection is O(V + E) time and O(V) auxiliary memory, excluding the graph.

**Directed graph: topological ordering.** Kahn's algorithm repeatedly removes vertices with in-degree zero. If it removes all vertices, the directed graph is acyclic; if vertices remain, at least one directed cycle exists among the remaining vertices. This gives an easy acyclicity test and a topological order, but the remaining set can include vertices downstream of a cycle, so it is not itself necessarily the cycle witness. Use DFS or strongly connected components to locate the actual cycle.

**Undirected simple graph: DFS with parent edge.** During DFS, an edge to an already visited vertex other than the traversal's parent indicates a cycle. Track the parent edge, not only the parent vertex, if parallel edges are allowed: two distinct edges connecting the same pair form a cycle in a multigraph under the usual edge-distinct definition. A self-loop is a cycle of length one if the domain counts it. The exact definition must match the application.

**Undirected incremental connectivity: disjoint-set union.** While processing an edge `(u,v)`, if `u` and `v` are already in the same connected component, adding the edge closes a cycle in an undirected graph. Union-find with path compression and union by rank/size provides near-constant amortized operations. This is useful for processing an edge stream or detecting a cycle while building a spanning forest, but it does not naturally produce the cycle path without storing additional parent/tree structure and it does not handle directed-cycle semantics.

## Cross-item comparison

This lesson contains one assigned case, so no within-group comparison applies. Choose DFS when you need a witness path or directed-cycle detection; use a topological pass when the graph is directed and acyclicity/order is the goal; use disjoint-set union for incremental undirected connectivity. Strongly connected components help isolate regions that can contain directed cycles: a component with more than one vertex contains a cycle, and a one-vertex component contains one only if it has a self-loop.

Do not confuse a **cycle basis** with the set of all simple cycles. In an undirected graph, a cycle basis is a minimal set of cycles from which other cycles can be composed under the graph's cycle-space operations; it is compact for algebraic analysis, but it does not list every simple route. If all simple cycles are required, output size can dominate runtime. Johnson's algorithm is a classic output-sensitive algorithm for enumerating elementary circuits in a directed graph, with complexity proportional to graph size and number of circuits; that can still be large when there are many circuits.

## Examples

### Directed dependency check

Edges mean “task A must finish before task B.” For edges `A→B`, `B→C`, and `C→A`, DFS reaches A, then B, then C; the edge `C→A` points to a gray ancestor, so the graph contains the cycle A→B→C→A. Report the tasks in that cycle, not every task blocked downstream of it. If instead the graph is A→B, B→C, C→D, and D→C, vertices beyond C may remain after Kahn's algorithm; DFS can return C→D→C as a compact explanation.

### Undirected duplicate relationship

An undirected graph has two vertices joined by two distinct edges. A traversal that stores only “parent vertex” may ignore both edges as parent links and incorrectly miss the cycle. Track edge IDs so the second parallel edge is recognized. If the domain models a simple graph and deduplicates edges on ingestion, document that invariant and reject or merge duplicates before detection.

### Production workflow

Validate graph size and edge references before running traversal. Use iterative DFS if recursion depth can exceed the language stack. Return a witness path and identify edge IDs when a cycle is found. If the graph changes continuously, choose between recomputing in O(V+E), maintaining incremental structure, or limiting checks to affected subgraphs; correctness and implementation complexity determine which is appropriate. For untrusted input, bound node count, edge count, and total work to prevent resource exhaustion.

## Common mistakes

- Using one directed-graph algorithm on an undirected graph or vice versa.
- Treating an edge to any visited node as a directed cycle; it must be an edge to a currently active DFS ancestor (or another valid directed-cycle criterion).
- Ignoring disconnected components and declaring a graph acyclic after searching only one root.
- Confusing the vertices left by topological removal with the exact cycle itself.
- Failing to define self-loop and parallel-edge semantics.
- Claiming O(V+E) for enumerating all cycles; output size can be exponential.
- Returning only `true` when operators need a witness cycle to repair.
- Using recursive traversal on adversarially deep input without accounting for stack limits.
- Treating a cycle basis as every simple cycle.

## Knowledge checks with answers

1. **In a directed DFS, what edge proves a cycle?** An edge to a vertex currently active on the DFS path (gray), not merely a vertex that was visited at some time.
2. **Why can topological sorting report blocked nodes that are not in a cycle?** Nodes downstream from a cycle may also retain positive in-degree after removable vertices are processed.
3. **Why track edge IDs in an undirected multigraph?** Two parallel edges can form a cycle, and checking only the parent vertex can mistakenly ignore both.
4. **Is a cycle basis the list of all cycles?** No. It is a compact generating set for the cycle space, with different semantics from enumerating every simple cycle.
5. **Why might “find all cycles” be infeasible?** A graph can contain an exponential number of simple cycles, so output itself can be exponentially large.

## Practice

Given a workflow graph with directed prerequisite edges, explain how you would detect a cycle, reconstruct one witness, report it to an operator, and handle multiple disconnected components. Then explain how the algorithm and edge cases change if the graph becomes undirected and permits duplicate edges. State the complexity and why you would not enumerate every cycle by default.
