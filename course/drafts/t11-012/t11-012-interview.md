# weighted shortest paths and distance relaxation — Interview questions and reasoning

## Core questions

1. Which shortest-path algorithm works for these edge weights?
2. What does edge relaxation mean?
3. Why does Dijkstra require nonnegative weights?
4. How many Bellman-Ford passes are sufficient?
5. How do stale priority-queue entries arise?
6. How would you count shortest paths without invalidating Dijkstra?

## Concise interview answers

- Equal edge costs -> BFS; zero/one -> 0-1 BFS; nonnegative -> Dijkstra; negative -> Bellman-Ford or a DAG-specific method; small all-pairs -> Floyd-Warshall.
- Relax u->v when dist[u]+w improves dist[v], guarding unreachable and overflow.
- Nonnegative weights ensure the minimum tentative distance cannot later be improved.
- V-1 edge-relaxation rounds suffice for simple shortest paths without a relevant negative cycle; one more detects reachable negative cycles.
- A lazy priority-queue update enqueues a new entry after every improvement rather than changing an existing key; older entries are skipped when popped.
- Count on strict improvements by replacing count, and on equal distances by adding count; positive weights ensure predecessors are processed first.

## Deep follow-up answers

### Why is BFS not a replacement for Dijkstra?

BFS orders by number of edges, which equals cost only when all edges have equal weight. Different positive weights can make a longer-in-edges path cheaper. 0-1 BFS is a specialized exception for binary weights.

### What does the Dijkstra invariant say?

When a valid minimum tentative distance is extracted, it is the true shortest distance. If a cheaper path existed, its last unsettled predecessor would have a tentative distance no greater than that path and would have been extracted first; nonnegative remaining edges cannot make the candidate worse than the supposed settled value.

### Why use previous-pass distances for a stop bound?

If a pass reads writes it has made itself, one pass can traverse multiple flights depending on edge order. A snapshot ensures pass j considers paths with at most j edges, preserving the constraint independent of input ordering.

### What qualifies as a relevant negative cycle?

For source s and target t, an unbounded-below route exists when s can reach a negative cycle and that cycle can reach t. Bellman-Ford's extra-pass relaxation flags cycles reachable from s; propagating affected vertices identifies which targets are unbounded.

### What is special about minimax and probability variants?

Minimum effort combines edges with max and selects the minimum such path; the relaxation is max(current, edge). Maximum probability combines by multiplication and selects the maximum; with probabilities in [0,1], path value cannot increase as edges are appended. The objective algebra must be reflected in the queue order and relaxation.

## Scenario questions

1. **Nonnegative costs, one source.** Dijkstra with adjacency list and a min-priority queue.
2. **Negative edges and need detect an arbitrage-like cycle.** Bellman-Ford with an additional reachable relaxation pass.
3. **At most k intermediate stops.** Layered Bellman-Ford with up to k+1 edges or a state that includes edge count.
4. **All distances for n=80.** Floyd-Warshall is a compact fit.
5. **Grid edges cost only zero or one.** 0-1 BFS using a deque.

## Tradeoffs and alternatives

- Dijkstra is fast for nonnegative sparse graphs; Bellman-Ford handles negative edges but costs O(VE).
- Floyd-Warshall is dense and simple but cubic.
- DAG relaxation supports negative weights in O(V+E) because order removes cycles.
- A heap implementation with decrease-key avoids stale entries but is more complex; lazy duplicates are often simpler.
- .NET's `PriorityQueue<TElement,TPriority>` is a quaternary min-heap with no decrease-key and no FIFO guarantee for equal priorities; use lazy duplicate entries for Dijkstra and skip stale distances.

## Common weak answers

- **“Dijkstra handles any weight if the graph is small.”** Negative weights invalidate its correctness proof.
- **“BFS works when weights are positive.”** They must be equal for edge-count order to match cost.
- **“V Bellman-Ford passes are always needed.”** V-1 suffice for distances; an extra pass is for negative-cycle detection.
- **“Infinity plus an edge is still infinity.”** Machine arithmetic may overflow.
- **“Count equal shortest paths by adding all queue pops.”** Stale entries and equal-route update semantics require deliberate handling.

## Self-check rubric

Can you name preconditions, state relaxation and invariants, guard sentinels, choose a numeric type, explain queue ordering and stale entries, and identify when stop/edge count must become part of state?

Sources: [CP-Algorithms: Dijkstra](https://cp-algorithms.com/graph/dijkstra.html), [CP-Algorithms: Bellman-Ford](https://cp-algorithms.com/graph/bellman_ford.html), [CP-Algorithms: Floyd-Warshall](https://cp-algorithms.com/graph/all-pair-shortest-path-floyd-warshall.html), [USACO Guide: Shortest Paths](https://usaco.guide/gold/shortest-paths).
