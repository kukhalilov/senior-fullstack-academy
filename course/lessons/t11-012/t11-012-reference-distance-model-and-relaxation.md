# weighted shortest paths and distance relaxation — Reference: Distances, paths, and edge relaxation

## Scope and version

This lesson explains the ten supplied distance, path, edge, and cycle terms.

## How this group fits the mental model

All shortest-path algorithms maintain distance estimates and improve them through relaxations. Correctness depends on the weight assumptions, representation of unreachable vertices, and arithmetic range.

## Supplied names explained

- Source vertex — Vertex whose distance is defined as zero.
- Tentative distance — Best path cost currently discovered; it may improve later.
- Unreachable sentinel — Representation for no known path, such as long.MaxValue with guarded arithmetic.
- Edge relaxation — Lower dist[v] when a reachable u plus edge weight w gives a cheaper route.
- Predecessor tracking — Record the previous vertex on one chosen best route.
- Path reconstruction — Follow predecessor links backward and reverse the sequence.
- Equal-cost shortest paths — Multiple routes share the same minimum cost; decide whether one, count, or all are required.
- Overflow-safe distance addition — Guard infinity and use a wide/checked type for path sums.
- Directed weighted edge — Arc u->v with a cost; reverse traversal is not implied.
- Negative cycle — Cycle with total negative weight; reaching and repeating it can decrease path cost without bound.

## Cross-item comparison

Distance is an objective over paths, while predecessor records one witness. An unreachable marker is not a numeric path cost; guard before addition. Negative cycles matter only when reachable from the source for single-source results, but can affect pairs that can reach and leave that cycle in all-pairs analysis.

## Examples

If dist[u]=7 and edge u->v has cost 4, candidate distance is 11. Update only if v is unreachable or its best estimate exceeds 11. If u is unreachable, do not compute sentinel+4.

## Common mistakes

- Relaxing from an unreachable vertex.
- Using Int32 when summed path weights can exceed it.
- Replacing a predecessor on a worse or equal route without a tie rule.
- Treating an undirected edge as one directed arc.
- Calling a negative cycle a finite shortest path.

## Knowledge checks with answers

1. **What is tentative?** It is the best route known so far, not necessarily finalized.
2. **When can predecessor[v] change?** When a relaxation improves dist[v].
3. **Why guard sentinel addition?** It may overflow or appear to be a valid finite distance.
4. **What does a reachable negative cycle imply?** Some downstream shortest costs are unbounded below.

Sources: [CP-Algorithms: Dijkstra](https://cp-algorithms.com/graph/dijkstra.html), [CP-Algorithms: Bellman-Ford](https://cp-algorithms.com/graph/bellman_ford.html).
