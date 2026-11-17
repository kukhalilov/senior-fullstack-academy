# comparison sorting algorithms and selection — Reference: Quicksort and heap sort

## Scope and version

This lesson explains the ten supplied partition, quicksort, and heap-sort terms.

## How this group fits the mental model

Partitioning rearranges a range around a pivot without fully sorting either side. Quicksort recursively sorts those sides; quickselect continues only toward one target rank. Heap sort uses a different invariant: the maximum element stays at the root of a max-heap.

## Supplied names explained

- Quicksort — Partition then recursively sort both sides; balanced partitions give O(n log n), worst-case partitions give O(n²).
- Pivot selection — Chooses the partition reference; first, middle, median-of-three, and random choices have different input sensitivity and overhead.
- Lomuto partition scheme — Scans with a boundary for values on one side, typically returning the pivot's final index; equal values can create highly unbalanced partitions.
- Hoare partition scheme — Moves two indices inward until misplaced values are found, then swaps; its returned cut is a boundary, not necessarily the pivot's final position.
- Three-way partition — Produces less-than, equal-to, and greater-than regions; useful when many keys are equal.
- Duplicate-key partitioning — Avoids repeatedly recursing through equal values; two-way schemes can degenerate on duplicate-heavy data.
- Randomized pivot — Randomly chooses pivot position; gives expected balance under standard assumptions but does not improve the worst-case bound.
- Heap sort — Builds a heap and repeatedly extracts the root into the sorted suffix, with O(n log n) worst-case time.
- Build-heap operation — Bottom-up sift-down from the last internal node; runs in O(n).
- In-place heap sort — Uses the array itself for heap and sorted suffix, O(1) auxiliary storage, and is unstable.

## Cross-item comparison

Lomuto is simple to reason about but may perform poorly with duplicates. Hoare often swaps fewer elements but demands correct boundary recursion. Three-way partition isolates equal keys. Heap sort has a deterministic worst-case bound and low extra memory but poorer locality and no stability guarantee.

## Examples

For three-way partition around 4 in [4,2,4,7,1,4], finish with a prefix below 4, a middle band equal to 4, and a suffix above 4. Quicksort can skip the middle band entirely.

## Common mistakes

- Recursing on a Hoare cut as though it were the pivot's final index.
- Using a Lomuto loop that repeatedly places equal values on only one side.
- Forgetting to shrink the heap boundary after extraction.
- Building a heap by repeated insertion and still claiming O(n) build time.
- Treating randomization as a worst-case guarantee.

## Knowledge checks with answers

1. **What does Hoare return?** A split boundary separating partition regions, not necessarily the pivot's final slot.
2. **Why use three-way partition?** To avoid reprocessing the equal-key region.
3. **What is bottom-up build-heap complexity?** O(n).
4. **Is in-place heap sort stable?** No, the swaps can reorder equal keys.

Sources: [OpenDSA: Quicksort](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/Quicksort.html), [Heapsort](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/Heapsort.html).
