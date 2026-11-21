# prefix sums, difference arrays, and static range queries — Interview questions and reasoning

## Core questions

1. How does a prefix table answer an inclusive range sum?
2. Why does an exclusive-prefix table use n+1 entries?
3. How do you count subarrays summing to k when negative values are allowed?
4. Why must the empty prefix be seeded in a prefix-frequency map?
5. How does equal-remainder counting find sums divisible by k?
6. How does a difference array encode a range increment?
7. When should you use a Fenwick or segment tree instead?

## Concise interview answers

1. With `P[0]=0` and `P[i+1]=P[i]+a[i]`, inclusive `[l,r]` sums to `P[r+1]-P[l]`.
2. There is one prefix at every boundary, including before the first and after the last item.
3. At current prefix S, prior prefix `S-k` defines each matching range; a frequency map counts all prior occurrences. This works with signed elements.
4. It represents the boundary before index zero and counts a matching subarray that starts at the first element.
5. A range sum is divisible by positive k exactly when its endpoint prefixes have the same normalized remainder modulo k.
6. For inclusive `[l,r]`, add x at `D[l]` and subtract x at `D[r+1]`, then prefix-sum all markers after the updates.
7. Use a dynamic structure when updates and queries are interleaved; prefix tables assume static data, and difference arrays defer reconstruction until updates are complete.

## Deep follow-up answers

### “Why does prefix frequency count negative-value subarrays?”

Because it uses the identity `currentPrefix - previousPrefix = target`, not a monotonic property of sums. Negative values can make the running total move either direction, but the map still finds every earlier boundary with the exact needed value. It counts prior boundaries by frequency so repeated totals represent distinct ranges.

### “Why query a prefix map before inserting the current sum?”

The current prefix boundary paired with itself represents an empty range. If the target is zero and current prefix is inserted first, the algorithm could count that invalid empty range. Querying first uses only strictly earlier boundaries; then the current boundary is available for future endpoints.

### “Why can't I subtract two prefix minima to get a range minimum?”

Prefix subtraction depends on an inverse operation that cancels the shared prefix. Addition has subtraction as an inverse, XOR is self-inverse, but minimum has no such inverse. Range minimum needs another technique, such as a sparse table for static idempotent queries or a segment tree for updates.

### “How do you normalize a negative remainder in C#?”

For positive k, compute `r = sum % k`; if r is negative, add k. C# remainder has magnitude less than k, so one addition yields a representative in `[0,k)` and preserves congruence. Taking absolute value does not preserve the correct modulo class in general.

## Scenario questions

### Thousands of immutable range-sum queries

Build an exclusive prefix table once. Each inclusive query uses two reads and one subtraction. If updates are later added to the requirements, explain that the table becomes stale and choose a dynamic structure.

### Count exact-sum ranges over signed integers

Use prefix frequency. Seed zero once, extend current prefix, add the frequency of current minus target, then increment current frequency. Use wide types for prefix totals and the answer when constraints require them.

### Apply thousands of known interval additions, then return the final array

Use a difference array. Convert endpoints consistently, mark start and exclusive end, then perform one prefix reconstruction. If queries must observe the result after each update, this offline method is insufficient.

### Query sums of many static matrix rectangles

Build a zero-padded 2D prefix table. Use four-corner inclusion-exclusion, adding back the top-left overlap. Check row and column boundary conventions separately.

## Tradeoffs and alternatives

- Prefix tables trade O(n) preprocessing and storage for O(1) static sum queries.
- Prefix-frequency maps trade O(n) expected storage for linear-time counting of many subarray properties.
- Difference arrays make offline interval additions cheap but defer the final values until reconstruction.
- Fenwick and segment trees handle dynamic workloads with more implementation complexity.
- Direct scans remain useful for one query or as brute-force test oracles.

## Common weak answers

- Saying “prefix sum” without stating whether the right endpoint is inclusive or half-open.
- Forgetting the empty prefix and failing at index zero.
- Using a sliding window for exact sums with negatives.
- Treating C# `%` as always nonnegative.
- Claiming a difference array can answer after every individual update without reconstruction.
- Applying subtraction to aggregates without an inverse.
- Ignoring overflow in the cumulative total or the number of subarrays.

## Self-check rubric

- Can you derive the range formula from boundary definitions rather than memorize it?
- Can you explain the seed entry and query-before-insert order?
- Can you state the exact reason signed values do or do not break the pattern?
- Can you normalize negative remainders and prove the result is in range?
- Can you show which overlap is subtracted and restored in two dimensions?
- Can you match static, offline, and online workloads to appropriate structures?
- Can you account for indexing, sentinel slots, storage, and numeric bounds?

Sources: [USACO Guide: Prefix Sums](https://usaco.guide/silver/prefix-sums), [USACO Guide: More Prefix Sums](https://usaco.guide/silver/more-prefix-sums).
