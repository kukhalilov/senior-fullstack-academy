# comparison sorting algorithms and selection — Core concepts and how they fit together

## Learning objectives

- Compare sorting algorithms by time, memory, stability, adaptivity, and worst-case behavior.
- Trace merge and partition invariants.
- Explain why comparison sorting has an Ω(n log n) worst-case lower bound.
- Distinguish full sorting from order-statistic selection.

## Prerequisites

Know arrays, recursion, logarithms, asymptotic bounds, and comparator-based ordering. Be comfortable proving loop invariants and tracing partition boundaries.

## Core concepts

### Comparison lower bound

A comparison sort can be modeled as a decision tree. With n distinct elements, there are n! possible input orders; a correct leaf must distinguish each ordering. A binary comparison tree of height h has at most 2^h leaves, so 2^h >= n!, giving h >= log2(n!) = Ω(n log n). This is a worst-case comparison lower bound for general comparison sorting, not a claim that every instance costs n log n. Duplicate keys reduce distinguishable arrangements, and presorted/adaptive input can help some algorithms. Non-comparison methods can exploit bounded or structured keys, at the cost of assumptions and often additional storage.

### Stability and auxiliary storage

A sort is stable if equal-key records retain their original relative order. Stability is useful when sorting by multiple keys in successive passes. In-place usually means auxiliary working storage is O(1) or otherwise bounded independently of input; exact definitions may exclude recursion stack or temporary output differently, so state accounting explicitly. A sort can be stable but not in-place, or in-place but unstable.

### Insertion and selection sort

Insertion sort maintains a sorted prefix and inserts the next item by shifting only strictly larger keys. This yields stability; moving equal keys past one another would break it. It takes O(n²) worst case and O(n) on already sorted input, making it useful for small/nearly sorted ranges. Selection sort repeatedly selects the remaining minimum and swaps it into place; its comparisons remain O(n²) even on sorted input, and the usual form is unstable.

### Merge sort

Divide the range into halves, recursively sort each, then merge in O(n). The recurrence T(n)=2T(n/2)+O(n) gives O(n log n) time in best, average, and worst cases. Standard array merge uses O(n) auxiliary storage and is stable when equal keys are selected from the left run first. Top-down recursion uses O(log n) call stack; bottom-up iterative merge avoids recursive calls while retaining auxiliary merge storage.

### Quicksort partition families

Quicksort partitions around a pivot and recursively sorts subranges. Balanced partitions yield O(n log n); repeatedly isolating one element yields O(n²). Lomuto commonly places one pivot at a final index, but can perform poorly on equal values. Hoare partitions with two inward-moving scans; its returned boundary is not necessarily the pivot's final index, so recursive ranges differ. Three-way partition separates less-than, equal-to, and greater-than pivot values, efficiently skipping large equal regions. Random pivots give expected O(n log n) for sorting but still O(n²) worst case.

### Heap sort

Build a max-heap, then swap the root with the last active element and sift the new root down. Bottom-up heap construction is O(n), not O(n log n), because most nodes are near the leaves. Repeated extraction costs O(n log n); array heap sort is in-place and unstable, with O(1) auxiliary storage excluding implementation details.

### Quickselect and order statistics

For the kth largest among n values, target ascending index n-k. Partition as in quicksort but recurse or iterate only into the side containing the target. With randomized pivots this is expected O(n), worst O(n²). A three-way partition handles duplicates and allows immediate termination when target lies in the equal band. Full sorting is O(n log n), simpler and useful if many ranks or ordered output are needed.

### Comparator consistency

A comparator must satisfy the target sorting API's ordering contract (commonly a strict weak ordering). Never compare by integer subtraction when overflow is possible. For largest-number concatenation, order strings a and b by comparing ab with ba; this relation is transitive for this construction, unlike numeric magnitude or length alone. Equal concatenations may be ordered either way. If all input values are zero, normalize the output to the single string 0.

## Mechanisms and relationships

The choice depends on required guarantees. Merge sort offers stable predictable O(n log n) at a memory cost. Heap sort offers O(n log n) worst-case with low auxiliary storage, but is unstable. Quicksort often has favorable locality and expected behavior but needs pivot and duplicate strategy. Insertion sort can finish tiny partitions efficiently. Hybrid runtime algorithms combine these ideas, but their exact implementation is library- and version-specific and is outside the frozen inventory.

## Worked examples

In backward merge, if nums1 holds m valid sorted values and n spare slots, compare the largest remaining values and write to index m+n-1. This avoids overwriting unread values. If the second array empties, the remaining first prefix is already in its correct positions.

For quickselect with [3,2,1,5,6,4], k=2 targets ascending index 4. A partition that places values no greater than a pivot on the left may settle index 4 without sorting all values; duplicates count as distinct positions in sorted order.

## Misconceptions and edge cases

- Ω(n log n) is not a lower bound for counting/radix sorts under bounded-key assumptions; it applies to comparison sorting.
- In-place does not mean stable; stability does not mean constant space.
- Hoare's partition boundary is not necessarily the pivot's final position.
- Randomized pivots improve expectation, not the worst-case bound.
- A comparator that works on sample pairs can still be nontransitive and produce invalid order.
- Quickselect's kth largest counts duplicates.

## Knowledge checks with answers

1. **Why Ω(n log n)?** Distinguishing n! possible orders needs a comparison decision tree of height at least log2(n!).
2. **Which merge choice preserves stability?** Choose from the left run when keys compare equal.
3. **What is quickselect's target index for kth largest?** n-k in zero-based ascending order.
4. **Why does three-way partition help duplicate-heavy data?** It excludes the equal band from further recursion.

Sources: [OpenDSA: Lower Bounds for Sorting](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/SortingLowerBound.html), [Quicksort](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/Quicksort.html), [Heapsort](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/Heapsort.html), [USACO Guide: Custom Comparators](https://usaco.guide/silver/sorting-custom).
