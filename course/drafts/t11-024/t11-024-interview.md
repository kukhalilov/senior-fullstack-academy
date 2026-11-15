# binary heaps and priority queues — Interview questions and reasoning

## Core questions

1. What is the difference between a priority queue and a heap?
2. Which two invariants make an array-backed binary heap work?
3. Why is arbitrary search O(n) even though heap insertion is O(log n)?
4. Why is bottom-up heap construction O(n), not O(n log n)?
5. How can a min-heap find the kth largest value?
6. How do two heaps maintain a running median?
7. How do you merge k sorted sequences efficiently?
8. What are the tradeoffs between lazy stale entries and an indexed heap?

## Concise interview answers

- A priority queue is an abstract interface that removes the item with best priority. A heap is one implementation; binary heaps are common, but implementations can use other branching factors or structures.
- Completeness keeps the tree height logarithmic and allows array storage. Heap order ensures each parent outranks its children, placing an extremum at the root.
- Parent-child ordering gives no directional rule for choosing a search branch. An arbitrary value may be anywhere, so search can inspect all n entries.
- Most nodes are near the leaves and need little or no downward movement. Summing each node's possible sift distance gives a geometric series bounded by O(n).
- Keep the largest k values in a min-heap. The root is the smallest of those k, hence the kth largest overall.
- Store the lower half in a max-heap and upper half in a min-heap; balance sizes and preserve `max(lower) <= min(upper)`.
- Keep one current head per nonempty sequence. Remove the smallest head and insert that node's successor, for O(N log k) time and O(k) heap space.
- Lazy deletion is simpler but may accumulate stale entries and requires filtering. An indexed heap supports direct key changes/removal in O(log n), at the cost of maintaining item positions on every swap.

## Deep follow-up answers

### What exactly is the complexity of bottom-up heapify?

Nodes at height h are O(n/2^(h+1)); each may sift O(h). The total is bounded by `n * sum(h/2^h)`, a convergent series, so the work is O(n). Inserting n items separately takes O(n log n) in the general case.

### What makes a priority comparer safe?

It must define a consistent ordering: transitive comparisons and stable results while entries are stored. Avoid subtraction comparers for unrestricted integers because subtraction can overflow. Prefer `CompareTo`, a tuple priority, or an explicit comparer. If ties must be FIFO, include a monotonically increasing sequence in the priority; the .NET API does not promise stable equal-priority order.

### When is a heap the wrong tool?

Use a sorted structure when many ordered iteration, predecessor, or arbitrary deletion queries are needed. Use a monotonic deque for sliding-window extrema with ordered expiry. Use quickselect for one static order statistic when expected linear time is acceptable. A heap is strongest when updates arrive and the next extremum is repeatedly needed.

### Does .NET `PriorityQueue<TElement,TPriority>` guarantee a binary heap or stable ties?

The public contract is a min-priority queue: the lowest priority according to its comparer is removed first. Internal implementation details are not the API contract, and equal priorities have no FIFO guarantee. The current .NET implementation documentation describes an array-backed quaternary min-heap; rely on documented behavior rather than internal shape for application correctness.

## Scenario questions

### A scheduling queue must preserve arrival order among equal priorities

Use a composite priority `(urgency, sequence)` and increment sequence on insertion. Confirm the direction of both tuple components because lexicographic ordering compares the first component first.

### Dijkstra's queue contains old distances

Store `(distance, vertex)` entries. On pop, compare the saved distance with the current best distance; skip stale entries. This keeps the code simple, but account for potentially more heap entries than vertices.

### A top-k stream receives millions of values with small k

Use a size-k min-heap for O(log k) accepted updates and O(k) memory. If the query is static and only one selection is needed, quickselect may be faster but has different worst-case and update properties.

## Tradeoffs and alternatives

- A binary heap has O(log n) insertion and root removal, O(1) peek, and O(n) search.
- A sorted array has O(log n) search but O(n) insertions due to shifts; extremum removal cost depends on which end is used.
- A balanced search tree costs O(log n) for updates and can expose both ends and ordered traversal.
- A monotonic deque can give amortized O(1) fixed-window extrema because dominated candidates never return.
- A heap can sort by repeated removal in O(n log n); standard in-place heapsort is unstable.

## Common weak answers

- “A heap is sorted.” Only the root is globally guaranteed to be the extremum.
- “Search is O(log n).” That confuses a heap with a binary search tree.
- “Equal priorities stay in insertion order.” The .NET queue does not promise that.
- “Use a heap because it is fast.” Name the repeated extremum query and required update pattern.
- “Heapify is O(n log n).” Distinguish bottom-up construction from repeated insertion.
- “Use a max-heap for kth largest.” A max-heap can work, but the size-k min-heap avoids storing values that cannot affect the answer.

## Self-check rubric

Rate each as **not yet**, **with a prompt**, or **independently**:

- I can state the heap shape and order invariants.
- I can derive root, parent, and child behavior from a zero-based array.
- I can explain O(1) peek, O(log n) root update, O(n) search, and O(n) bottom-up heapify.
- I can choose a heap orientation from the desired boundary value.
- I can explain tie handling, stale entries, and indexed updates.
- I can compare heaps with sorting, trees, deques, and selection algorithms for a concrete workload.

Sources: [USACO Guide: Priority Queues](https://usaco.guide/silver/priority-queues), [Microsoft `PriorityQueue<TElement,TPriority>`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.priorityqueue-2), [Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/), [Find Median from Data Stream](https://leetcode.com/problems/find-median-from-data-stream/).
