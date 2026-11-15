# comparison sorting algorithms and selection — Reference: Correctness properties and comparison limits

## Scope and version

This lesson explains the ten supplied ordering, memory, complexity, and input-shape properties.

## How this group fits the mental model

An algorithm's useful guarantees are independent dimensions. A problem may require stable order, strict worst-case time, low memory, or good performance on nearly sorted input; no single property implies another.

## Supplied names explained

- Stable sort — Equal-key records keep their original relative order.
- Unstable sort — Equal-key records may change relative order.
- In-place sort — Uses little auxiliary storage; clarify whether recursion stack is counted.
- Auxiliary space — Extra working memory beyond input and output, with recursion stack reported separately when relevant.
- Best-case complexity — Least work over inputs of size n.
- Average-case complexity — Expected/average work under an explicitly stated input or randomness model.
- Worst-case complexity — Maximum work over inputs of size n.
- Comparison-sort lower bound — General comparison sorting has worst-case Ω(n log n) comparisons for distinct arbitrary keys, derived from the n! possible orders.
- Nearly sorted input — Few elements are far from their correct positions; insertion sort can exploit this shape.
- Adversarial input — Input arranged to trigger poor partitions or other worst-case behavior.

## Cross-item comparison

Insertion sort is stable and adaptive but quadratic worst case. Merge sort is stable with predictable O(n log n) time but commonly allocates O(n). Heap sort is in-place with O(n log n) worst-case time but unstable. Quicksort is often efficient but pivot-sensitive in the worst case.

## Examples

Suppose records have keys [2a,1x,2b]. A stable ascending sort returns [1x,2a,2b]; the order of equal-key records a and b is preserved. An unstable result [1x,2b,2a] is still key-sorted but violates stability.

## Common mistakes

- Calling an algorithm “O(n log n)” without specifying average or worst case.
- Omitting recursive stack from space discussion.
- Assuming in-place also means no stack or stable behavior.
- Applying the comparison lower bound to bounded-key counting or radix methods.
- Invoking an average-case claim without naming its assumption.

## Knowledge checks with answers

1. **What must remain stable?** Original relative order among records comparing equal.
2. **Can a stable sort use O(n) auxiliary memory?** Yes; stability and memory are independent.
3. **What does Ω(n log n) apply to?** Worst-case comparison sorting of arbitrary distinct keys.
4. **Why can insertion sort be fast on nearly sorted data?** Each item moves only a small distance.

Source: [USACO Guide: Problem-Analysis Paradigms](https://usaco.guide/PAPS.pdf).
