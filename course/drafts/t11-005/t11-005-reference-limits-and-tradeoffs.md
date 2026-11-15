# binary search, bounds, rotated arrays, and monotone answers — Reference: Limits and algorithm selection

## Scope and version

This reference explains the six supplied algorithm-selection terms. “Logarithmic” refers to the number of candidate halvings, not necessarily total runtime.

## How this group fits the mental model

Binary search is efficient only when its proof assumptions and data access costs match the problem. Compare preprocessing, query count, mutation, and check cost before selecting it.

## Supplied names explained

- `Logarithmic iteration count` — Halving N candidates takes O(log N) checks. Searching an answer interval of width R takes O(log R) iterations, with details depending on inclusive endpoints and whether endpoints are known candidates.
- `Random-access requirement` — Array midpoint access is O(1). A linked list midpoint may require traversal; repeated midpoint scans can erase the benefit. Search structures should provide efficient access to the midpoint.
- `Monotonicity requirement` — Each check must order the remaining candidates so a result on one side rules out the other. Alternating predicates cannot safely be bisected by this method.
- `Duplicate-value ambiguity` — Equality may identify one position but does not identify the first or last occurrence. On some rotated arrays, duplicates also obscure sorted-half detection. Choose bounds or a duplicate-aware proof matching the contract.
- `Linear scan versus binary search` — A scan is O(n), simpler, and often better for small inputs or one query. Binary search is O(log n) for sorted random-access data but sorting first adds O(n log n) and may mutate/reorder data.
- `Discrete versus continuous search space` — Discrete answer search has exact integer boundaries and termination after a finite number of halvings. Continuous search approximates a real value and needs tolerance, iteration count, and floating-point error analysis; this curriculum does not cover it.

## Cross-item comparison

`Logarithmic iteration count` explains the ideal check count; `Random-access requirement` and `Monotonicity requirement` determine whether that count is useful and correct. `Duplicate-value ambiguity` determines whether equality or ordering identifies the requested boundary. `Linear scan versus binary search` includes preprocessing and query volume. `Discrete versus continuous search space` changes how termination and accuracy are defined.

## Examples

For one query on an unsorted small list, scanning is usually the direct choice. For many queries on an immutable sorted array, lower bound provides O(log n) per query without repeated sorting. For an unsorted input that must remain in original order, sorting a copy may cost more space than a one-time scan; measure the actual workload.

## Common mistakes

- Saying all binary search solutions are O(log n) when feasibility work scans input.
- Ignoring the cost of sorting before a search.
- Searching a linked list as though midpoint access were constant time.
- Treating duplicates as if any match satisfied a first/last requirement.
- Assuming a continuous search has exact integer-style termination.
- Ignoring that a scan can be preferable for small or one-off workloads.

## Knowledge checks with answers

1. **What additional cost belongs in answer-search complexity?** Feasibility-check cost per iteration.
2. **Why may linked-list binary search be inefficient?** Getting to each midpoint is not O(1).
3. **When can linear scan be the better choice?** Small inputs, unsorted data, or very few queries.
4. **What extra criterion does continuous search need?** A precision/error tolerance or fixed iteration budget.

Source: [USACO Guide: Binary Search](https://usaco.guide/silver/binary-search).
