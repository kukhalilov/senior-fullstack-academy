# weighted shortest paths and distance relaxation — Reference: Dijkstra, BFS, and 0-1 BFS

## Scope and version

This lesson explains the ten supplied nonnegative, equal-cost, and binary-weight shortest-path terms.

## How this group fits the mental model

These algorithms differ in how they order the next candidate. FIFO is enough for equal costs, a deque handles zero/one costs, and a min-priority queue handles arbitrary nonnegative costs.

## Supplied names explained

- Dijkstra's algorithm — Repeatedly settles the unsettled vertex with minimum tentative distance.
- Nonnegative edge-weight precondition — Every edge cost is at least zero; this is essential to finalization.
- Minimum tentative-distance extraction — Choose the currently cheapest unsettled route.
- Finalized vertex — Its distance cannot improve under Dijkstra's assumptions.
- Lazy priority-queue entries — Add a new pair for every improvement instead of decreasing a key in place.
- Stale-entry skip — Ignore a popped distance that no longer equals dist[vertex].
- BFS for equal edge costs — First discovery is shortest when each transition has the same cost.
- 0-1 BFS — Use a deque for weights 0 or 1.
- Deque front/back relaxation — Push improved zero-cost neighbors to front; push one-cost neighbors to back.
- Indexed binary heap with decrease-key — Alongside adjacency lists, supports O((V+E) log V) Dijkstra by keeping one active key per vertex.
- Lazy binary heap complexity — Adding a new entry on every strict improvement costs O((V+E) log(E+1)) in a general multigraph; for simple graphs where E=O(V²), this is commonly written O((V+E) log V).
- Fibonacci heap theoretical complexity — With adjacency lists, decrease-key amortized O(1) gives theoretical O(E+V log V) Dijkstra, but Fibonacci heaps are uncommon in standard libraries.
- Dijkstra complexity by graph representation — A matrix plus linear minimum scan costs O(V²+E), usually O(V²); an adjacency list plus heap avoids scanning absent edges.

## Cross-item comparison

Dijkstra permits zero weights; a zero edge does not break distance correctness but can complicate counting equal-cost paths. 0-1 BFS is more specialized and can run in O(V+E). BFS is simpler when all weights are equal. Negative edges require another method.

### C#/.NET priority-queue note

- **.NET PriorityQueue<TElement,TPriority> quaternary min-heap:** `PriorityQueue<TElement,TPriority>` is array-backed and quaternary; lower priorities dequeue first.
- **Equal-priority dequeue order is unspecified:** the type does not promise FIFO behavior among equal priorities.
- **.NET PriorityQueue has no decrease-key:** it does not update an existing queued priority in place.
- **Lazy-update Dijkstra with .NET PriorityQueue:** enqueue a new `(vertex, distance)` entry after each strict improvement and skip entries whose saved distance no longer equals the current best. The heap arity changes constants, not the logarithmic asymptotic bound.

## Examples

Suppose vertex 4 was enqueued at distance 12, then a later route improves it to 8. Both entries remain in a lazy heap. When 12 is popped, compare it with dist[4]=8 and skip it.

## Common mistakes

- Running Dijkstra with negative edges.
- Forgetting stale entries.
- Marking visited permanently on insertion rather than on valid minimum extraction.
- Using normal FIFO BFS when edge costs differ.
- Failing to put zero-cost 0-1 BFS improvements at the front.

## Knowledge checks with answers

1. **Why can Dijkstra finalize a vertex?** Nonnegative edges cannot make a later route cheaper after minimum extraction.
2. **What is a stale entry?** A queued distance superseded by a later relaxation.
3. **What weights permit 0-1 BFS?** Only zero and one.
4. **What happens with negative weights?** Dijkstra's finalization proof fails.

Sources: [CP-Algorithms: Dijkstra](https://cp-algorithms.com/graph/dijkstra.html), [USACO Guide: Shortest Paths](https://usaco.guide/gold/shortest-paths).
