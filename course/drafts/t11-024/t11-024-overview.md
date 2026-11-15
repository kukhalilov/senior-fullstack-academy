# binary heaps and priority queues — Big-picture orientation and mental model

## Problem and purpose

When a process repeatedly needs the next smallest or largest item, sorting everything after each change wastes work. A priority queue keeps the current extremum at the root while allowing new candidates to arrive. A binary heap is a common way to implement that contract.

## Plain-language mental model

Think of a heap as a partially ordered tree. The root is guaranteed to be the item with highest priority; the rest of the elements are not fully sorted. Insert a new item at the next open tree position and move it upward until parent order is restored. Remove the root by moving the last item into its place and moving it downward.

## How the parts fit together

| Need | Heap operation or pattern |
| --- | --- |
| Repeated minimum/maximum | Peek and remove root |
| Stream kth largest | Keep only k largest in a min-heap |
| Running median | Max-heap lower half, min-heap upper half |
| Merge sorted lists | Heap of current list heads |
| Task scheduling | Prioritize currently available task counts |
| Update arbitrary item | Indexed heap, or lazy stale-entry filtering |

The priority queue is the behavior users of the structure need. Heap order is one implementation invariant. Binary heaps have two children; .NET's `PriorityQueue<TElement,TPriority>` currently uses an array-backed quaternary min-heap, so its exact internal branching differs while its public priority-queue contract is the same.

## Concept map

The complete-tree shape makes the heap compact in an array. Heap order puts an extremum at the root but leaves arbitrary search linear. Comparers define which priority is “smaller.” If equal priority items need stable ordering, include a sequence number explicitly; .NET does not promise FIFO among ties.

## End-to-end walkthrough

For a kth-largest stream with k=3, keep a min-heap of at most three values. The root is the smallest among the retained top three and therefore the current third-largest. When a new value is below the root, discard it. Otherwise replace the root; the heap again contains the top three and its root is the answer.

## When to use it and tradeoffs

Use a heap when data changes and you repeatedly need an extremum. Peek is O(1), insertion/removal O(log n), and bottom-up construction O(n). A sorted array makes peek O(1) but insert O(n); a tree supports ordered iteration and arbitrary removal; a monotonic deque is better for fixed-window extrema; quickselect can find one kth item without maintaining a stream.

## What later lessons cover

References explain heap shape and order, operations and costs, custom priorities and updates, and problem patterns. Six problems practice repeated extrema, top-k, medians, multiway merge, cooldown scheduling, and a streaming kth value.

Sources: [USACO Guide: Priority Queues](https://usaco.guide/silver/priority-queues), [Microsoft PriorityQueue<TElement,TPriority>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2), [Kth Largest Element in a Stream](https://leetcode.com/problems/kth-largest-element-in-a-stream/).
