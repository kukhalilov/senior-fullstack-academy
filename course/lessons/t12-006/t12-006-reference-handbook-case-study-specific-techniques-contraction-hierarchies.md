# end-to-end system design case studies — Reference: Contraction hierarchies

Sources: [HLD Handbook](https://hld.handbook.academy/), [Geisberger et al., Contraction Hierarchies: Faster and Simpler Hierarchical Routing in Road Networks](https://ai.dmi.unibas.ch/research/reading_group/geisberger-et-al-wea2008.pdf), [Customizable Contraction Hierarchies](https://doi.org/10.1145/2886843), [Exact Routing in Large Road Networks Using Contraction Hierarchies](https://pubsonline.informs.org/doi/abs/10.1287/trsc.1110.0401?journalCode=trsc).

## Scope and version

This lesson explains the classical contraction hierarchies (CH) preprocessing technique for exact shortest-path queries in weighted road networks with nonnegative edge weights and notes customizable variants. The speed and space results depend on graph structure, contraction order, weight model, and implementation; they are not universal complexity guarantees for every graph. Time-dependent traffic, turn restrictions, transit, and live closures require suitable extensions or alternative routing models.

## How this group fits the mental model

On a road map, Dijkstra’s algorithm can find a shortest path but may explore many local streets for each query. CH spends more work before queries: it orders vertices by a heuristic importance, removes/contracts lower-ranked vertices, and adds shortcut edges when necessary so shortest paths are preserved. A query then performs a restricted bidirectional search that moves upward through the hierarchy from both endpoints. Shortcuts let the search cross large low-level areas quickly.

This is an index optimized for many queries over a relatively stable network. The trade is preprocessing time and extra shortcut storage in exchange for faster point-to-point queries. If edge weights or topology change frequently, rebuilding/customizing the hierarchy has cost; if the graph changes rarely and queries are numerous, preprocessing can pay off.

## Supplied names explained

- **Contraction order/rank:** ordering in which vertices are removed; query search follows rank constraints. Ordering quality influences shortcut count and query speed.
- **Witness search:** checks whether a path avoiding the vertex being contracted already preserves a route of no greater cost; if not, a shortcut is needed to preserve shortest paths.
- **Shortcut edge:** compact representation of a path through contracted vertices, storing enough information to unpack the original route for navigation instructions.
- **Up-down path:** a shortest path in the augmented hierarchy can be represented by ascending ranks toward a peak and then descending toward the target; a bidirectional query searches this structure.
- **Customization:** recomputing edge/shortcut weights for a new metric while retaining some preprocessed topology, as in customizable CH variants. It is not free and support depends on algorithm/metric assumptions.
- **Baseline:** Dijkstra or A* on the original graph is simpler and may be preferable for small graphs, few queries, rapidly changing weights, or when implementation simplicity dominates.

## Cross-item comparison

| Method | Preprocessing/index | Query and update fit |
| --- | --- | --- |
| Dijkstra | None beyond graph representation | General nonnegative edge weights; may explore a large area per query; straightforward after edge changes |
| A* | Requires an admissible heuristic for the graph/cost model | Often explores less when a useful heuristic exists; heuristic validity must match the modeled costs |
| Contraction hierarchies | Expensive graph ordering, witness searches, shortcut creation; potentially substantial index | Very fast exact queries on suitable road networks; topology/weight updates can require customization or rebuilding |
| Transit-node / hub-label methods | More extensive preprocessing and index structures | Can answer queries very quickly on suitable large networks, with different space and update trade-offs |

“Exact” means exact for the graph, edge weights, and constraints encoded in the index. It does not mean the route is optimal for a more recent traffic snapshot or a real-world restriction missing from that graph.

## Examples

Consider a city grid where a query travels across many neighborhood streets. During preprocessing, contract local intersections in a chosen order. When removing an intersection would otherwise hide the best path between two surviving neighbors, witness search fails to find an equally short bypass, so preprocessing adds a shortcut storing the omitted path. A query from one side of the city can use that shortcut and higher-level roads rather than exploring every local intersection.

When a route is returned, recursively unpack shortcut references to produce the actual road segments and instructions. Test that the unpacked path is valid in the original graph and that its total weight equals the reported route weight. When a road closes or traffic changes, determine whether it changes topology, edge weight, or turn constraints and use the implemented update/customization process; stale shortcuts can return a path inconsistent with current data.

Before adoption, benchmark preprocessing duration, shortcut count/index size, p50/p95 query latency, explored nodes, path-unpacking cost, customization/rebuild duration, and correctness against Dijkstra on sampled origin-destination pairs. Include disconnected regions, one-way streets, turn restrictions, and changed metrics in verification.

## Common mistakes

- Calling CH a faster Dijkstra without explaining the preprocessing/index and shortcut invariant.
- Assuming every graph contracts efficiently; performance depends on network hierarchy and contraction order.
- Ignoring preprocessing time, memory, index deployment, and rebuild/customization cost.
- Claiming exact real-world routes when the graph omits closures, turn costs, vehicle restrictions, or current traffic.
- Returning shortcut edges as if they were physical roads without unpacking them for path output.
- Failing to validate the returned path and cost against the original graph.
- Assuming ordinary CH automatically supports arbitrary live weight changes; customization has algorithm-specific assumptions and cost.
- Choosing CH for a small graph or few queries where Dijkstra/A* is simpler and already fast enough.

## Knowledge checks with answers

1. **Why are shortcuts added during preprocessing?** To preserve shortest paths that would otherwise pass through a contracted vertex, allowing the query to skip lower-level nodes.
2. **What is the main workload fit?** Many shortest-path queries over a relatively stable suitable road graph, where preprocessing and index costs are amortized.
3. **Does exact CH output guarantee the fastest current drive?** No. It is exact for the encoded graph/weights; stale or incomplete traffic/constraint data can make the result operationally suboptimal.
4. **How can you validate shortcut unpacking?** Check the expanded edge sequence exists in the base graph, respects direction/constraints, and sums to the reported path cost.
