# binary heaps and priority queues — Reference: Heap order, tree shape, and array layout

## Scope and version

This reference covers the classic array-backed binary heap model. .NET's built-in priority queue uses a quaternary heap internally, but follows the same priority-queue behavior.

## How this group fits the mental model

Tree shape makes the structure compact; heap order makes the root the selected extremum. These invariants explain both the fast root operations and why the rest is not sorted.

## Supplied names explained

- **Complete binary tree:** every level is full except possibly the last, which fills left to right.
- **Min-heap order:** each parent priority is no greater than either child; the root is minimum.
- **Max-heap order:** each parent priority is no less than either child; the root is maximum.
- **Array-backed heap:** store the complete tree in level order without child pointers.
- **Root index:** 0 in the usual zero-based layout.
- **Parent index:** for i>0, integer division `(i-1)/2`.
- **Left-child index:** `2*i+1`, if within array bounds.
- **Right-child index:** `2*i+2`, if within array bounds.
- **Heap invariant:** shape remains complete and every parent-child pair obeys the chosen priority order.
- **Duplicate priorities:** several items may compare equal; the root is one of the tied extrema, but no tie order is implied.

## Cross-item comparison

Min-heap and max-heap change the comparer, not the complete-tree shape. A heap array is level-order storage; it is not sorted order. A sorted array gives all ranks directly but pays more on updates.

## Examples

In a zero-based heap array `[2,5,3,9,7]`, index 1 has parent 0 and children 3 and 4. Min-heap order holds because 2<=5, 3; 5<=9,7. The root 2 is minimum, while indices 1 and 2 are not otherwise ordered relative to each other.

## Common mistakes

- Using one-based formulas with a zero-based array.
- Checking only parent-to-left-child order and forgetting the right child.
- Assuming the left child is always higher priority than the right.
- Treating equal priorities as stable FIFO entries.
- Confusing heap order with a binary search tree's left/right value ordering.

## Knowledge checks with answers

1. **What are the children of index i?** `2i+1` and `2i+2` when in bounds.
2. **Does a min-heap expose the second-smallest item at a fixed index?** No; only the root is guaranteed minimum.
3. **What does completeness add?** A compact array layout and logarithmic height.

Sources: [USACO Guide: Priority Queues](https://usaco.guide/silver/priority-queues), [Microsoft PriorityQueue<TElement,TPriority>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2).
