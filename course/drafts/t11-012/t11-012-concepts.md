# weighted shortest paths and distance relaxation — Core concepts and how they fit together

## Learning objectives

- State the edge-weight precondition for BFS, 0-1 BFS, Dijkstra, Bellman-Ford, and Floyd-Warshall.
- Apply edge relaxation without overflowing or propagating unreachable sentinels.
- Explain Dijkstra finalization, stale entries, negative-cycle detection, and all-pairs recurrence.
- Choose a shortest-path method from graph size, density, weight rules, and query scope.

## Prerequisites

Know graph representations, BFS, adjacency lists/matrices, priority queues, loops, and asymptotic analysis. Use long arithmetic when path sums can exceed Int32.

## Core concepts

For source s, dist[v] is the best-known cost of a path from s to v. Initially dist[s]=0 and all others are infinity. For edge u->v with weight w, relaxation computes candidate dist[u]+w and lowers dist[v] when candidate is smaller. An unreachable dist[u] must not be added; use a sufficiently large sentinel and guard before addition. If inputs can approach numeric limits, use checked/wider arithmetic or a guarded saturating helper.

## Mechanisms and relationships

### BFS and 0-1 BFS

When every edge has the same cost, edge count orders paths, so BFS gives shortest distances. When edge weights are zero or one, a deque implements a two-level priority order: improved zero-weight transitions go to the front and one-weight transitions go to the back. If a vertex can be improved after discovery, store distances and permit reprocessing; mark-on-enqueue as permanent finalization is not valid for general weighted paths.

### Dijkstra

Dijkstra repeatedly extracts the unfinalized vertex with smallest tentative distance. With nonnegative edges, no later route through an unsettled vertex can improve a settled distance. Relax its outgoing edges and enqueue improvements. A standard library priority queue without decrease-key uses lazy entries; skip any popped pair whose distance differs from current dist. With a binary heap and adjacency lists, complexity is O((V+E) log V) in typical analysis; actual heap API and duplicate handling matter.

Negative edge weights invalidate finalization: a vertex thought settled could later improve. Zero weights are allowed for distances, though they require care when counting paths because equal-distance dependencies may form cycles.

### Bellman-Ford

Any shortest simple path in a graph with no relevant negative cycle uses at most V-1 edges. Therefore V-1 complete edge-relaxation passes suffice. Early-stop if a pass makes no changes. On an additional pass, an improvement from a reachable u proves a negative cycle reachable from the source; an unreachable cycle does not affect source distances. Vertices reachable from that negative cycle may have no finite shortest cost.

For at most k stops, a flight route has at most k+1 edges. A layered relaxation must read from the previous distance array and write to a copy; otherwise one pass may chain multiple edges and violate the bound.

### Floyd-Warshall

Initialize dist[i,i]=0, direct-edge costs to their minimum (important with parallel edges), and absent edges to infinity. For each intermediate k, update each dist[i,j] with the minimum of its current value and dist[i,k]+dist[k,j], guarding infinity. The outer k loop is essential to the invariant: after it, paths may use only intermediates among processed vertices. It costs O(V³) time and O(V²) space. A negative diagonal dist[i,i] after completion indicates a negative cycle.

### Selection and path reconstruction

Store predecessor[v]=u when relaxing via u to reconstruct one shortest path by following predecessors back to the source. Equal-cost alternatives need an explicit tie policy. Counting all shortest paths is a separate concern: positive weights make distance dependencies strictly increase along shortest edges, while zero-weight cycles can create infinitely many shortest walks or make counting ill-defined without restricting to simple paths.

## Worked examples

For a bounded-flight path with at most one stop, allow at most two edges. Round one computes routes using at most one edge. Round two computes candidates from the previous round and therefore allows at most two; in-place updates could incorrectly chain several flights in the same round.

For an all-pairs graph with direct 0->2 cost 10 and route 0->1 cost 3, 1->2 cost 4, Floyd's k=1 pass updates dist[0,2] to 7.

## Misconceptions and edge cases

- Dijkstra's condition is nonnegative weights; strictly positive is not required for distances.
- BFS does not solve arbitrary positive weighted shortest paths.
- Bellman-Ford negative-cycle detection must ignore unreachable u.
- Infinity plus a weight can overflow or create a false finite path.
- Floyd-Warshall parallel edges should keep the minimum direct cost.
- For Number of Ways to Arrive, source weights are strictly positive; this allows shortest-path counts to propagate in increasing distance order. Do not generalize that proof to zero-weight cycles.
- Minimax path cost uses maximum of current path effort and edge effort, not addition.
- Maximum-probability paths maximize products; ordinary addition-based distance is not the same objective.

## Knowledge checks with answers

1. **When is Dijkstra valid?** All edge weights are nonnegative.
2. **How many Bellman-Ford passes suffice absent reachable negative cycles?** V-1.
3. **Why use previous-round distances for bounded edges?** To limit each round to one additional edge.
4. **What does the Floyd k-loop invariant mean?** Only processed vertices may be internal path vertices.
5. **Why skip a stale Dijkstra queue entry?** A newer relaxation already found a smaller distance for that vertex.

Sources: [CP-Algorithms: Dijkstra](https://cp-algorithms.com/graph/dijkstra.html), [CP-Algorithms: Bellman-Ford](https://cp-algorithms.com/graph/bellman_ford.html), [CP-Algorithms: Floyd-Warshall](https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html).
