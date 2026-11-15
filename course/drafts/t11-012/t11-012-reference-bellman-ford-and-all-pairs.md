# weighted shortest paths and distance relaxation — Reference: Bellman-Ford and Floyd-Warshall

## Scope and version

This lesson explains the ten supplied repeated-relaxation and all-pairs terms.

## How this group fits the mental model

Bellman-Ford expands the maximum number of edges a path may use on each pass. Floyd-Warshall expands which vertices may appear internally. Both are dynamic programs over increasingly broad path sets.

## Supplied names explained

- Bellman-Ford algorithm — Repeatedly relax every directed edge; supports negative weights.
- V-1 relaxation passes — A shortest simple path has at most V-1 edges if no relevant negative cycle exists.
- Early-stop optimization — Stop when a full pass makes no change.
- Reachable negative-cycle detection — A further improvement from a source-reachable vertex reveals a reachable negative cycle.
- Negative-cycle reachability impact — Costs are unbounded for pairs that can reach the cycle and then reach the target.
- Floyd-Warshall algorithm — Update all pairs through each possible intermediate vertex.
- Intermediate-vertex recurrence — Compare current distance with route i->k->j.
- All-pairs distance matrix — Store shortest cost for every ordered pair.
- O(V³) Floyd-Warshall time — Three nested vertex loops.
- O(V²) Floyd-Warshall space — One distance matrix, plus optional predecessor/next-hop matrices.

## Cross-item comparison

Bellman-Ford is single-source and handles negative edges in O(VE). Floyd-Warshall computes all pairs in O(V³) regardless of edge density and is suitable for small V. Both must guard unreachable sentinel additions. For bounded-edge routes, use previous-round state in Bellman-Ford.

## Examples

With at most two edges, pass one handles one edge and pass two uses only pass-one distances to consider one more. In Floyd-Warshall, after processing k, every candidate path may use vertices from the processed set as internal nodes.

## Common mistakes

- Performing V passes for the answer and misplacing negative-cycle detection.
- Detecting cycles through an unreachable vertex.
- Updating bounded-flight distance in place.
- Putting Floyd-Warshall's k loop inside i/j incorrectly.
- Adding infinity to finite values.
- Forgetting that negative cycles invalidate finite shortest distances.

## Knowledge checks with answers

1. **Why V-1 passes?** Any simple path has at most V-1 edges.
2. **What proves a reachable negative cycle?** An edge can still relax after V-1 passes.
3. **What is Floyd's state dimension?** Ordered source-target pair.
4. **What is its standard complexity?** O(V³) time and O(V²) space.

Sources: [CP-Algorithms: Bellman-Ford](https://cp-algorithms.com/graph/bellman_ford.html), [CP-Algorithms: Floyd-Warshall](https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html).
