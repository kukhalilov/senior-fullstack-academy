# binary heaps and priority queues — Reference: Heap-based problem patterns and alternatives

## Scope and version

This reference maps common selection and scheduling queries to heap patterns and compares structures with different update/query needs.

## How this group fits the mental model

A heap is effective when the algorithm repeatedly asks for the next extremum. The root is a decision point; the remaining items are candidates, not a sorted result.

## Supplied names explained

- **Kth largest with size-k min-heap:** retain the k greatest values; the smallest retained value at the root is kth largest.
- **Top-k selection:** count or rank candidates and retain only the best k, or use buckets when frequency range is small.
- **Merge k sorted sequences:** keep one current head per nonempty sequence; emit the smallest and replace it with that sequence's next item.
- **Two heaps for running median:** max-heap lower half and min-heap upper half, balanced so their roots are middle values.
- **Repeated extremum extraction:** remove a highest/lowest item, update candidates, and insert the changed result.
- **Heap sort relationship:** repeatedly extract roots to produce ordered output; standard in-place heap sort is O(n log n), unstable, and uses O(1) auxiliary array space.
- **Heap versus sorted array:** heap updates and root removal are logarithmic; a sorted array has O(1) extremum access but O(n) insertion/removal shifts.
- **Heap versus monotonic deque:** a heap supports general priority candidates; a monotonic deque exploits ordered expiration and dominance for fixed windows in amortized O(1).
- **Expected quickselect alternative:** partitions around pivots to find one kth value in expected O(n) time, but does not maintain a dynamic stream and has O(n²) worst case for basic randomized/poor pivot schemes.

## Cross-item comparison

Choose a bounded heap when k is small and updates arrive; choose quickselect for one static kth query; use sorting when full order is needed; use a deque when window order and expiration let candidates be permanently dominated. For a running median, two roots expose both middle values without sorting the full stream after each insertion.

## Examples

When merging three sorted lists, enqueue their first nodes. Repeatedly dequeue the smallest node, append it, and enqueue its successor. The heap contains at most one frontier node per list, so each of N nodes is processed once in O(log k) heap work.

## Common mistakes

- Using a max-heap of all n values for kth largest when a size-k min-heap suffices.
- Comparing object references or non-deterministic equal priorities unintentionally.
- Forgetting to balance the two median heaps after insertion.
- Assuming quickselect is dynamically maintainable across stream updates.
- Using a heap for fixed sliding extrema when monotonic dominance supports a simpler deque.

## Knowledge checks with answers

1. **Why use a min-heap for kth largest?** Its root is the weakest member of the retained top-k set.
2. **How large is the heap in k-way merge?** At most one current head per nonempty sequence.
3. **When is quickselect preferable?** A single static order-statistic query where expected linear selection is acceptable.

Sources: [USACO Guide: Priority Queues](https://usaco.guide/silver/priority-queues), [Top K Frequent Elements](https://leetcode.com/problems/top-k-frequent-elements/), [Merge k Sorted Lists](https://leetcode.com/problems/merge-k-sorted-lists/).
