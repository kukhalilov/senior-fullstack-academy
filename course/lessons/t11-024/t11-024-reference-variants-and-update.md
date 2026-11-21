# binary heaps and priority queues — Reference: Comparers, updates, and deletion strategies

## Scope and version

This reference covers custom priorities, stable ties, priority changes, arbitrary deletion, and stale-entry cleanup.

## How this group fits the mental model

The comparer defines heap order. Updates and deletion are difficult when the structure cannot locate the item; indexed tracking or deferred stale-entry removal supplies that missing information.

## Supplied names explained

- **Custom priority comparer:** ordering function that determines which priority is removed first; .NET removes the lowest according to the comparer.
- **Tuple priority:** combine primary and secondary priorities, such as `(distance, vertexId)`, to give deterministic ordering.
- **Stable tie-breaking with sequence number:** attach a monotonically increasing insertion sequence and compare it after the main priority to reproduce FIFO among equals.
- **Decrease-key:** improve an item's priority in a min-heap and sift it upward; direction depends on heap orientation.
- **Increase-key:** worsen an item's priority in a min-heap and sift it downward; again orientation determines direction.
- **Indexed priority queue:** maintain item-to-array-index positions so a changed item can be found and repaired in O(log n).
- **Lazy deletion:** mark or version obsolete entries and remove them only when they reach the root.
- **Stale-entry filtering:** compare a popped entry's saved version/distance with current authoritative state and skip outdated copies.
- **Double-ended priority queue:** supports access/removal of both minimum and maximum; a single ordinary heap exposes one end.

## Cross-item comparison

An indexed heap keeps at most one entry per item and handles updates directly, but its position map must be repaired on every swap. Lazy deletion simplifies code and works well when stale entries are bounded or periodically compacted; memory may grow with all inserted versions. A balanced multiset also supports deletion and both extrema but costs O(log n) per update.

## Examples

In Dijkstra's algorithm, a simpler priority queue may receive multiple distances for one vertex. When an old distance is later popped, compare it with the current best-distance array; if unequal, skip it as stale. An indexed heap could instead update the vertex's key in place, but requires maintaining indices.

For equal priorities that must be FIFO, enqueue priority `(priority, sequence++)`; do not rely on the .NET queue to order ties stably.

## Common mistakes

- Writing a comparer that is not transitive or consistent with equality.
- Reversing only one branch of a composite priority and creating a malformed ordering.
- Forgetting stale-entry checks and processing an old priority as current.
- Updating an item's priority without knowing its heap index.
- Assuming a queue of equal priorities is FIFO.

## Knowledge checks with answers

1. **How does .NET interpret a comparer?** The lowest priority under that comparer dequeues first.
2. **How can a min-priority queue act as a max-queue?** Supply a reversed comparer or an order-safe transformed priority.
3. **What is lazy deletion's main cost?** Stale storage and the need to filter obsolete roots.

Sources: [Microsoft PriorityQueue<TElement,TPriority>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2), [USACO Guide: Priority Queues](https://usaco.guide/silver/priority-queues).
