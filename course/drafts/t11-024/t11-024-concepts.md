# binary heaps and priority queues — Core concepts and how they fit together

## Learning objectives

- Distinguish the priority-queue abstract behavior from a heap implementation.
- Derive parent and child indices and state heap order.
- Explain sift-up, sift-down, root replacement, and bottom-up construction.
- Choose a comparer and handle equal priorities explicitly.
- Recognize when a bounded heap, two heaps, or lazy deletion solves a problem.

## Prerequisites

Know arrays, complete trees, logarithms, sorting, and basic asymptotic analysis. The heap's shape is complete, while its values are only partially ordered.

## Core concepts

A complete binary tree fills each level before the next and fills the last level from left to right. Store nodes in an array: root at index 0; parent of i>0 is `(i-1)/2`; left child is `2i+1`; right child is `2i+2`. These formulas eliminate explicit node pointers.

In a min-heap every parent priority is no greater than its children; the root is minimum. A max-heap reverses the order. This is a local parent-child invariant, not a promise that siblings or array elements are sorted.

Insert at the end and sift up while the new item outranks its parent. Remove the root, move the final array item to the root, then sift down with the higher-priority child. A binary heap has height O(log n), so these operations take O(log n). The root is O(1); arbitrary search is O(n) without an index.

Bottom-up build starts at the last internal node and sifts down toward the root. Although one sift can cost O(log n), most nodes are near leaves; summing work gives O(n), faster asymptotically than n individual O(log n) insertions.

## Mechanisms and relationships

Priority is defined by a comparer. .NET's `PriorityQueue<TElement,TPriority>` removes the lowest priority according to its comparer; its current implementation is an array-backed quaternary min-heap and equal priorities have no FIFO guarantee. A max-heap can reverse the priority comparer or use a safely ordered composite priority.

When an arbitrary item's priority changes, the heap position must be known and repaired by sift-up or sift-down. An indexed heap tracks item-to-index locations. Lazy deletion instead inserts a new version and discards stale entries at the root when they surface; it is simpler but can use more space unless periodically compacted.

## Worked examples

For a size-k min-heap retaining the k largest values, the root is the weakest retained candidate. If a new value is no greater, it cannot enter the top k. If greater, replace the root and restore heap order. The root remains the kth largest.

For a running median, maintain a max-heap of the lower half and min-heap of the upper half. Enforce `lower.Count == upper.Count` or `lower.Count == upper.Count+1` and `max(lower) <= min(upper)`. The median is the lower root for odd count or the mean of both roots for even count.

## Misconceptions and edge cases

- A heap array is not sorted; only parent-child order is guaranteed.
- A min-heap priority queue does not automatically provide stable tie ordering.
- Arbitrary membership/search is not O(log n); it is generally O(n).
- A custom comparer must obey a consistent ordering; inconsistent comparison can invalidate the heap invariant.
- Computing an even median must widen before adding two integers to avoid overflow.
- Lazy deletion can grow stale storage; report the actual space bound.

## Knowledge checks with answers

1. **What is guaranteed at the root of a min-heap?** A minimum-priority item, not the complete sorted order.
2. **Why is bottom-up heap construction O(n)?** Most nodes require very little sift distance, and the aggregate height-weighted work is linear.
3. **Does .NET preserve insertion order for equal priorities?** No; add a sequence number if stability is required.
4. **What is the typical cost of arbitrary search?** O(n) without an auxiliary index.

Sources: [Microsoft PriorityQueue<TElement,TPriority>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2), [USACO Guide: Priority Queues](https://usaco.guide/silver/priority-queues).
