# prefix sums, difference arrays, and static range queries — Big-picture orientation and mental model

## Problem and purpose

Repeatedly summing a range costs time proportional to the range length. Prefix sums preprocess cumulative totals so static range queries can be answered by subtracting two stored totals. Difference arrays solve the inverse workload: many range updates are recorded cheaply and applied together in one final reconstruction pass.

The word “static” matters. A prefix table answers repeated questions about data that does not change. If updates and queries are interleaved, use a data structure designed for updates, such as a Fenwick or segment tree, covered elsewhere.

## Plain-language mental model

Place a marker before the first array value and keep a running total as you walk right. The total at each boundary tells you how much has accumulated from the beginning. To isolate a middle range, subtract the total before it from the total after it: everything before the range cancels.

For `[3, -2, 5, 1]`, define `prefix[0] = 0` and `prefix[i+1] = prefix[i] + values[i]`. Then prefix is `[0,3,1,6,7]`. The sum of half-open range `[1,4)`—values `[-2,5,1]`—is `prefix[4] - prefix[1] = 7 - 3 = 4`.

For range updates, imagine writing a +d marker at the beginning and a -d marker just after the end. A later running sum applies all changes that have begun and not yet ended. This boundary-marker trick is the discrete inverse of prefix accumulation.

## How the parts fit together

- **One-dimensional prefix aggregates** store cumulative information at boundaries. A leading identity value makes range formulas uniform.
- **Prefix-frequency maps** use the difference between two prefixes to count subarrays. A map remembers how often each earlier prefix has appeared.
- **Prefix remainders** turn divisibility of a range sum into equality of normalized remainders.
- **Two-dimensional prefix sums** store cumulative rectangles; inclusion-exclusion cancels the extra strips and corner counted more than once.
- **Difference arrays** encode offline range changes at two boundaries, then one scan reconstructs final values.
- **Index and numeric limits** govern correctness: distinguish inclusive from half-open ranges and choose a sufficiently wide accumulator.

## Concept map

```text
Cumulative aggregate at boundaries
├─ static range query: after - before
├─ subarray property: prefix[right] - prefix[left]
│  ├─ count target sums with prefix-frequency map
│  └─ count divisible sums with normalized remainders
├─ rectangle query: 2D inclusion-exclusion
└─ inverse accumulation: difference markers
   └─ many offline updates → one reconstruction scan
```

These structures answer different workloads. Prefix sums support immutable data and many queries. Difference arrays efficiently batch range updates when the final array is needed after all updates. Neither automatically handles arbitrary interleaved updates and queries.

## End-to-end walkthrough

Suppose a static array is `[4, -1, 2, 7]` and you need the sum of several inclusive ranges. Convert inclusive `[left,right]` to half-open boundary indices `[left,right+1)` and build `prefix = [0,4,3,5,12]`.

1. Query indices 1 through 3 inclusive: `prefix[4] - prefix[1] = 12 - 4 = 8`, matching `-1 + 2 + 7`.
2. Query index 2 alone: `prefix[3] - prefix[2] = 5 - 3 = 2`.
3. Each query now uses two table reads and one subtraction, O(1), after O(n) preprocessing.
4. If the array changes, the stored totals after the changed position become stale. Rebuilding costs O(n); if such updates are frequent, choose an online range-query structure.

The example also shows why a zero leading prefix is helpful: ranges beginning at index zero need no separate special case.

## When to use it and tradeoffs

Use prefix sums for repeated static range sums; use prefix-frequency maps for counting subarrays whose sum meets an exact condition, including signed inputs; use 2D prefixes for many static rectangle queries; use differences for many offline interval additions. Check overflow: prefix totals can be much larger than any one element.

Do not use a static prefix table when values change often and each update must immediately affect queries. For a sliding range queried only once, a direct scan may be simpler. For noninvertible aggregates such as range minimum, subtraction does not undo the prefix; a different structure is needed.

## What later lessons cover

The concepts lesson connects cumulative totals, prefix differences, frequency counts, remainders, rectangles, and update markers. Reference lessons cover exact index formulas and failure modes. Independent practice lessons solve immutable range sum, pivot index, target-sum subarrays, divisible subarrays, 2D range sum, and corporate flight bookings.

Sources: [USACO Guide: Prefix Sums](https://usaco.guide/silver/prefix-sums), [USACO Guide: More Prefix Sums](https://usaco.guide/silver/more-prefix-sums).
