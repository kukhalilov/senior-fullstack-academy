# weighted shortest paths and distance relaxation — Big-picture orientation and mental model

## Problem and purpose

Shortest-path algorithms minimize a path cost from a source, or between every pair. The edge-weight rules determine which algorithm is valid. Using a familiar algorithm outside its preconditions can silently return wrong answers.

## Plain-language mental model

Keep the best-known price to reach every vertex. Relaxing an edge asks whether reaching its start and paying that edge gives a cheaper route to its end. Different algorithms decide when a tentative distance is final and how broadly to repeat relaxations.

## How the parts fit together

BFS works when each edge has equal cost. 0-1 BFS handles only zero/one weights, placing zero-cost improvements at the deque front and one-cost improvements at the back. Dijkstra works for nonnegative weights and repeatedly settles the least tentative distance. Bellman-Ford permits negative edges by repeating edge relaxations up to V-1 rounds. Floyd-Warshall computes all-pairs distances by allowing each vertex in turn as an intermediate.

Use wider distance types and an explicit unreachable sentinel. Never add an edge weight to infinity. Dijkstra's lazy priority queue may retain obsolete entries; skip a popped entry if it no longer matches the best distance. Negative cycles reachable from the source make some shortest costs unbounded below.

## Concept map

| Edge/cost structure | Algorithm | Typical scope |
| --- | --- | --- |
| Equal edge costs | BFS | Single source |
| Weights in {0,1} | 0-1 BFS | Single source |
| Nonnegative weights | Dijkstra | Single source |
| Negative edges, no reachable negative cycle | Bellman-Ford | Single source |
| Small graph, all pairs | Floyd-Warshall | All pairs |
| DAG, possibly negative weights | Topological relaxation | Single source or all sources |

## End-to-end walkthrough

Suppose a tentative distance to u is 7 and edge u->v costs 3. The candidate for v is 10. If its previous best was 12, update dist[v]=10 and record u as its predecessor. If a priority-queue entry later pops with distance 12, it is stale and cannot improve anything, so skip it. This separates an item's historical queue key from current state.

## When to use it and tradeoffs

For one source and nonnegative costs, Dijkstra is usually the default. For a small dense graph with many source-target queries, Floyd-Warshall can be simpler. Bellman-Ford is necessary when negative edges are present, though slower. With a stop bound, add edge-count state or use layered Bellman-Ford; an unconstrained Dijkstra state by vertex alone may discard a more expensive but lower-stop route.

## What later lessons cover

References formalize relaxation, Dijkstra/BFS variants, Bellman-Ford/Floyd-Warshall, and algorithm selection. Practice covers shortest transmission time, bounded stops, minimax effort, all-pairs thresholds, path counting, obstacle removal, maximum probability, and unit-cost grid BFS.

Sources: [CP-Algorithms: Dijkstra](https://cp-algorithms.com/graph/dijkstra.html), [CP-Algorithms: Bellman-Ford](https://cp-algorithms.com/graph/bellman_ford.html), [CP-Algorithms: Floyd-Warshall](https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html), [USACO Guide: Shortest Paths](https://usaco.guide/gold/shortest-paths).
