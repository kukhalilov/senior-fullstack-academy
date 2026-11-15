# binary heaps and priority queues — Reference: Priority queue operations and complexity

## Scope and version

This reference covers the core operation costs for binary heaps and the behavior of .NET's current `PriorityQueue<TElement,TPriority>` API.

## How this group fits the mental model

Each operation preserves complete shape and heap order. Root access avoids search; insertion and removal repair a path whose length is bounded by heap height.

## Supplied names explained

- **Peek minimum or maximum:** inspect the root without removal, O(1).
- **Insert/enqueue:** add at the next complete-tree leaf and restore order, O(log n).
- **Remove root/dequeue:** remove the extremum and restore order, O(log n).
- **Sift up:** swap an item with its parent while it has higher priority.
- **Sift down:** swap an item with its highest-priority child until order holds.
- **Replace root:** install a candidate at root then sift down; useful for bounded top-k selection.
- **Build heap bottom-up:** sift down internal nodes in reverse order, O(n) total.
- **O(1) root lookup:** only the extremum is directly exposed; it does not imply O(1) arbitrary lookup.
- **O(log n) insertion and root removal:** the repair path is at most tree height.
- **O(n) arbitrary search:** heap order gives no binary-search-tree branch rule.

## Cross-item comparison

Repeatedly inserting n values is O(n log n), while bottom-up build is O(n). Replacing a root in a fixed-size heap can be more efficient than dequeue then enqueue because it repairs once. .NET offers `EnqueueDequeue` and `DequeueEnqueue`, whose semantics differ in which item is added or removed first; read the contract before substituting either.

## Examples

To retain the five largest values, keep a min-heap of size five. When full, compare a candidate with the root; if it is larger, replace the root and sift down. The root lookup is constant time, and each accepted replacement is logarithmic.

## Common mistakes

- Reporting O(log n) for finding an arbitrary value.
- Claiming build-by-insertion is O(n) without a special argument; it is O(n log n) in the general case.
- Confusing `Peek` with `Dequeue` and accidentally removing the extremum.
- Failing to count output or input-copy costs when they matter.
- Applying binary-heap operation bounds to a different implementation without checking its contract.

## Knowledge checks with answers

1. **Why is root peek O(1)?** The root is stored at a fixed array position.
2. **What is the usual complexity of arbitrary search?** O(n).
3. **Why is bottom-up construction O(n)?** The summed sift distances across all nodes are linear.

Sources: [Microsoft PriorityQueue<TElement,TPriority>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2), [USACO Guide: Priority Queues](https://usaco.guide/silver/priority-queues).
