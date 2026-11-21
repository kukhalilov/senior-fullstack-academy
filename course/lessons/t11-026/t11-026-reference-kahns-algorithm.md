# directed acyclic graphs and topological ordering — Reference: Indegree queue algorithm

## Scope and version

This reference covers the indegree-based frontier method and its complete-order cycle test.

## How this group fits the mental model

Indegree counts unfinished prerequisites. When the count reaches zero, the vertex is eligible to emit; removing it releases its dependents.

## Supplied names explained

- **`Indegree count`:** number of incoming edges to a vertex. With unique edges, count each prerequisite once; repeated input edges require deduplication or they must be decremented equally many times.
- **`Zero-indegree frontier`:** set of vertices whose remaining prerequisites are all processed; these are exactly the currently ready choices.
- **`Kahn's algorithm`:** initialize indegrees and a ready frontier, repeatedly emit a ready vertex, then reduce each outgoing neighbor's count and enqueue it when the count reaches zero.
- **`Remove outgoing edges conceptually`:** processing u means its constraints on successors are satisfied; implementations normally leave adjacency intact and update counters instead of mutating the graph.
- **`Decrement neighbor indegrees`:** for every edge `u -> v` when u is emitted, subtract one from v. Enqueue v exactly on transition from 1 to 0.
- **`Processed-vertex cycle test`:** if emitted count is less than V, the unprocessed remainder contains or depends on a directed cycle; no complete order exists.
- **`FIFO frontier`:** a normal queue gives O(1) insertion/removal and returns any valid choice among currently ready vertices.
- **`Lexicographically smallest order with min-priority queue`:** choose the smallest ready key each time. This greedily gives the lexicographically smallest topological order; operations add O(log V) overhead.

## Cross-item comparison

FIFO and min-priority frontiers make the same cycle decision and both produce valid orders. The min-priority queue constrains tie choices and costs more. Conceptual edge removal is implemented by indegree updates, so adjacency can still be reused.

## Examples

For 0 -> 1 and 0 -> 2, indegrees begin [0,1,1]. Emit 0; both neighbors become zero and enter the frontier. Emitting either one next is valid; the other then becomes the last item.

## Common mistakes

- Counting incoming edges in the wrong direction for prerequisite pairs.
- Forgetting to include isolated vertices in the initial frontier.
- Enqueueing a neighbor every time it is seen instead of only when its indegree becomes zero.
- Reporting success when the output is shorter than V.
- Assuming all unprocessed vertices are themselves on a cycle; some can be downstream dependents.

## Knowledge checks with answers

1. **Why is zero indegree a safe emission condition?** No unprocessed prerequisite points into that vertex.
2. **When do you enqueue a neighbor?** Exactly when its remaining indegree changes from one to zero.
3. **What does incomplete processing mean?** The graph has a cycle that blocks completion.

Sources: [USACO Guide: Topological Sort](https://usaco.guide/gold/toposort?lang=cpp), [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/).
