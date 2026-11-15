# weighted shortest paths and distance relaxation — Reference: Preconditions, proof sketches, and algorithm selection

## Scope and version

This lesson explains the nine supplied algorithm-selection and proof terms.

## How this group fits the mental model

Start with the objective and edge weights, then choose the lightest algorithm whose proof assumptions hold. Query count, graph size, density, and path constraints also matter.

## Supplied names explained

- Unweighted graph -> BFS — Equal edge costs make layer count equal path cost.
- Weights zero or one -> 0-1 BFS — Deque order processes binary-weight improvements efficiently.
- Nonnegative weights -> Dijkstra — Minimum tentative extraction safely finalizes distances.
- Negative edges -> Bellman-Ford or DAG method — Bellman-Ford tolerates them absent reachable negative cycles; topological relaxation handles DAGs in linear graph time.
- Small all-pairs graph -> Floyd-Warshall — Dense O(V³) computation may be simplest for small V.
- DAG shortest paths in topological order — Relax outgoing edges once in a topological ordering; negative edges are allowed because no cycles exist.
- Relaxation invariant — Distances represent paths within an algorithm-defined edge or intermediate-vertex limit.
- Negative cycle makes shortest cost unbounded — Repeating the cycle reduces path sum without limit for affected source-target pairs.

## Cross-item comparison

Dijkstra uses nonnegative-weight finalization; Bellman-Ford uses repeated edge-count expansion; DAG relaxation relies on acyclic dependency order. Floyd-Warshall handles all pairs, not just one source. The algorithm name must follow the problem's actual cost semantics.

## Examples

For a DAG with edge weights -2 and 5, process vertices in topological order and relax each edge once; negative weights do not create cycles. For an undirected negative edge, traversing back and forth forms a negative cycle, so shortest path cost may be unbounded.

## Common mistakes

- Using Dijkstra because weights are integers, without checking negativity.
- Using Bellman-Ford for a tiny DAG when topological relaxation is simpler.
- Running Floyd-Warshall on huge V.
- Forgetting a bounded-stop condition adds an edge-count dimension.
- Treating a maximum-probability objective as an additive shortest path without a valid transformation.

## Knowledge checks with answers

1. **What is the first algorithm-selection question?** What edge costs and constraints are permitted?
2. **Why does a DAG permit negative edges?** There is no cycle to repeat indefinitely, and topological order is acyclic.
3. **When is all-pairs output requested?** Consider Floyd-Warshall for small graphs.
4. **What does a negative cycle do?** It can make affected shortest costs unbounded below.

Sources: [USACO Guide: Shortest Paths](https://usaco.guide/gold/shortest-paths), [CP-Algorithms: Dijkstra](https://cp-algorithms.com/graph/dijkstra.html), [CP-Algorithms: Bellman-Ford](https://cp-algorithms.com/graph/bellman_ford.html).
