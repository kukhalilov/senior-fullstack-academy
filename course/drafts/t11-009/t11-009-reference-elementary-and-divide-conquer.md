# comparison sorting algorithms and selection — Reference: Elementary sorts and merge sort

## Scope and version

This lesson explains the ten supplied elementary and divide-and-conquer terms as algorithm concepts independent of any language runtime.

## How this group fits the mental model

Elementary sorts maintain a partially ordered prefix or suffix. Merge sort instead recursively creates sorted runs and combines them with a linear merge. The input's presortedness, size, and stability requirement influence the choice.

## Supplied names explained

- Insertion sort — Extends a sorted prefix by shifting larger values and inserting the next value; stable when equal keys are not shifted past.
- Selection sort — Repeatedly selects the smallest remaining value and swaps it into the next position; O(n²) comparisons and usually unstable.
- Bubble sort — Repeated adjacent swaps move out-of-order neighboring values; stable with strict swaps, but O(n²) worst case.
- Adaptive sorting behavior — Uses existing order to reduce work; insertion sort takes linear time on already sorted input.
- Merge sort — Recursively sorts halves and merges them with predictable O(n log n) time.
- Divide-and-conquer recurrence — Expresses work across subproblems; merge sort satisfies T(n)=2T(n/2)+O(n).
- Merge operation — Selects the smaller next key from two sorted runs until one is exhausted, then copies the remainder.
- Stable merge — On equivalent keys, takes from the left run first to retain their original order.
- Top-down merge sort — Recursively splits until singleton ranges, then merges while returning.
- Bottom-up merge sort — Starts with width-one runs and iteratively merges adjacent runs of doubling width.

## Cross-item comparison

Insertion sort has low overhead and adapts to nearly sorted ranges but quadratic worst-case work. Merge sort provides a worst-case time guarantee and stability for arrays at the cost of auxiliary storage. Bottom-up and top-down versions have the same asymptotic merge work, with different control and stack behavior.

## Examples

Merge [1,4,7] and [2,4,8] by taking 1,2, then left 4 before right 4 to preserve stability, then 7,8. The stable result retains the input order of equivalent records across the two runs.

## Common mistakes

- Shifting equal keys in insertion sort and silently losing stability.
- Forgetting the remainder when one merge run becomes empty.
- Computing a merge midpoint with an overflow-prone sum in full-range index variants.
- Claiming bottom-up merge sort eliminates auxiliary array storage.
- Claiming selection sort becomes linear on sorted input; it still scans each suffix.

## Knowledge checks with answers

1. **Why is insertion sort adaptive?** Already ordered items require few or no shifts.
2. **What tie rule preserves stable merge?** Take the left item when keys compare equal.
3. **What is the common array merge buffer cost?** O(n) auxiliary elements.
4. **What changes in bottom-up merge sort?** Run widths grow iteratively instead of recursive splitting.

Sources: [OpenDSA: Insertion Sort](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/InsertionSort.html), [Bubble Sort](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/BubbleSort.html), [Selection Sort](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/SelectionSort.html), [Implementing Mergesort](https://opendsa-server.cs.vt.edu/ODSA/Books/cnu/cpsc270/fall-2026/F26/html/MergesortImpl.html).
