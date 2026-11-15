# comparison sorting algorithms and selection — Interview questions and reasoning

## Core questions

1. What does stability guarantee, and when does it matter?
2. Why is merge sort O(n log n) in the worst case?
3. What distinguishes Lomuto and Hoare partition contracts?
4. Why can quicksort be quadratic, and how do randomization and three-way partition help?
5. When is selection preferable to sorting?
6. How do you prove a custom comparator is suitable for sorting?

## Concise interview answers

- Stability preserves input order among records whose keys compare equal.
- Merge sort divides into halves and merges linearly, yielding O(n log n) at every input shape; array implementations commonly need O(n) buffer.
- Lomuto often returns the pivot's final index; Hoare returns a partition boundary.
- Random pivots provide expected balance, while three-way partition avoids repeated work on equal keys; neither makes quicksort's worst case better than O(n²).
- Quickselect is expected O(n) for one rank; full sorting supports all ranks and has deterministic O(n log n) with merge sort.
- A comparator needs a coherent transitive ordering; test equality, reversed argument pairs, and triples for cycles.

## Deep follow-up answers

### Prove the comparison lower bound

There are n! orders of n distinct elements. A binary decision tree with height h has at most 2^h leaves, so correctness requires 2^h >= n!. Taking logarithms gives h >= log2(n!) = Ω(n log n). The argument is limited to comparison-based algorithms on arbitrary distinct keys.

### Explain partition correctness

State the exact regions after each scan step. For Dutch-national-flag partition: indices below low are less than pivot, low through scan-1 equal pivot, scan through high unknown, and above high greater than pivot. Each branch shrinks the unknown band; the greater swap must not advance scan.

### Why is bottom-up heap construction linear?

Although a single sift-down can be logarithmic, most heap nodes are close to leaves and have small possible heights. Summing node count times height over all levels is O(n), followed by n extractions costing O(log n) each.

### Design a robust quickselect

Convert rank to index n-k, copy input if mutation is not allowed, select randomized pivots, and use three-way partition for duplicates. Narrow to the only region that can contain the target. State expected O(n), worst O(n²), and compare with heap selection or full sort.

## Scenario questions

1. **A stable report sort is required on a secondary key after a primary-key sort.** Use a stable algorithm or compose a comparator over both keys.
2. **The input is a linked list and O(1) auxiliary memory matters.** Use bottom-up merge sort by relinking nodes, not array conversion.
3. **Find a single percentile from a large in-memory array.** Quickselect is a candidate; a bounded heap may be better for streaming data.
4. **Adversarial request data can control input order.** Avoid relying on a naive deterministic quicksort pivot for a worst-case guarantee.
5. **Values are small bounded integers.** Counting sort may beat comparison sorting, but its assumptions and memory are outside this topic.

## Tradeoffs and alternatives

- Merge sort buys predictable time and stability with auxiliary memory.
- Heap sort buys worst-case time and low auxiliary storage but is unstable.
- Quicksort offers expected performance and locality but pivot-sensitive worst-case behavior.
- Insertion sort is simple and adaptive for small/nearly sorted ranges.
- Quickselect avoids full ordering when only one rank is needed.

## Common weak answers

- **“Quicksort is always O(n log n).”** That is expected or balanced-case behavior, not its worst case.
- **“Hoare partition returns the pivot index.”** It returns a cut boundary; recursive ranges must match that contract.
- **“Kth largest means kth distinct.”** Duplicates occupy ranks unless the statement explicitly says distinct.
- **“Stable means in-place.”** Stability and storage are independent.
- **“Sort by concatenated numeric value.”** Largest-number ordering compares ab with ba, not integer magnitude.

## Self-check rubric

Can you state the exact postcondition of a partition routine; account for duplicates; distinguish average, expected, and worst-case bounds; include buffers and recursion in space analysis; translate rank correctly; and justify comparator transitivity?

Sources: [USACO Guide: Problem-Analysis Paradigms](https://usaco.guide/PAPS.pdf), [USACO Guide: Custom Comparators](https://usaco.guide/silver/sorting-custom?lang=cpp).
