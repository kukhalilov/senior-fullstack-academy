# comparison sorting algorithms and selection — Big-picture orientation and mental model

## Problem and purpose

Sorting arranges values under an order; selection finds one rank without necessarily arranging everything. This topic builds the algorithmic reasoning behind comparison sorting, partitioning, and order statistics rather than cataloguing a language's runtime sort API.

## Plain-language mental model

Imagine organizing cards. Insertion sort takes each new card and inserts it into the already ordered prefix. Merge sort sorts two halves and carefully merges them. Quicksort places items on sides of a pivot and recursively handles the sides. Heap sort repeatedly removes the extreme item from a heap. Each approach spends work differently and offers different guarantees.

Comparison sorting can learn only through pairwise ordering comparisons. In the general case it needs Ω(n log n) comparisons in the worst case. Algorithms such as counting sort and radix sort can escape that lower bound only by exploiting stronger assumptions about keys; they are explicitly outside this unit.

## How the parts fit together

An algorithm is not described by time alone. Ask whether it is stable, in-place, adaptive, worst-case bounded, and how it behaves on duplicates. Stability preserves the original relative order of equal keys. In-place describes auxiliary memory, not stability. A randomized quicksort/quickselect pivot changes expected behavior but does not erase worst-case guarantees.

Sorting is appropriate when many ranks or the complete order are needed. Selection is preferable when only one order statistic matters. A custom comparator changes what “sorted” means and must be consistent; it is central to arranging numbers into the largest concatenated value.

## Concept map

| Need | Candidate | Main property |
| --- | --- | --- |
| Small or nearly sorted array | Insertion sort | Adaptive; stable with correct shift condition |
| Predictable O(n log n), stable order | Merge sort | Extra auxiliary storage for arrays |
| Fast average practical partition sort | Quicksort | Pivot-sensitive worst case; duplicate-aware partition helps |
| O(n log n) worst-case with little extra array storage | Heap sort | Unstable, less locality than common quicksort implementations |
| One kth rank only | Quickselect | Expected O(n), worst O(n²) for poor pivots |
| Merge two already sorted sequences | Two-pointer merge | O(m+n), no resorting required |

## End-to-end walkthrough

For `[5,1,1,2]`, a sort returns the complete order `[1,1,2,5]`. To find the second largest, full sorting is unnecessary: target the ascending index `n-k` and partition until that position is settled. Equal values still occupy separate ranks; “second largest” is not “second distinct largest.”

## When to use it and tradeoffs

Choose based on constraints and required guarantees, not a single universal winner. A teaching implementation is useful for seeing invariants, but production code should normally use a well-tested library sort unless the problem explicitly forbids it or a specialized contract matters. For adversarial inputs, deterministic worst-case guarantees may outweigh average speed.

## What later lessons cover

The concepts lesson proves the main invariants and lower bound. References enumerate the supplied algorithms, partition schemes, properties, and comparator rules. Practice implements a general sort, a Dutch-national-flag partition, linked-list merge sort, backward array merge, quickselect, and a transitive concatenation comparator.

Source: [USACO Guide: Problem-Analysis Paradigms](https://usaco.guide/PAPS.pdf), [USACO Guide: Custom Comparators](https://usaco.guide/silver/sorting-custom?lang=cpp).
