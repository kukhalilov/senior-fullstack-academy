# prefix sums, difference arrays, and static range queries — Reference: Prefix sums for subarray counting

## Scope and version

This lesson explains the seven supplied prefix-counting patterns. Subarrays are nonempty contiguous ranges, and prefixes are stored at boundaries with an empty prefix at position zero.

## How this group fits the mental model

A subarray aggregate is the difference between two prefix aggregates. Instead of enumerating every pair of boundaries, a frequency map stores the earlier prefixes that could complete the current one.

## Supplied names explained

- `Subarray sum as prefix difference` — If current cumulative sum is S at boundary r, a range from earlier boundary l has sum `S-P[l]`. It equals target k exactly when `P[l]=S-k`.
- `Prefix-frequency map` — Maps each prior prefix sum or remainder to the number of times it appeared. Query the needed earlier value to count ranges ending at the current boundary, then record the current prefix for later endpoints. Expected operation time is O(1) with a hash map.
- `Seed frequency for empty prefix` — Initialize frequency of prefix zero to one. This represents boundary zero and counts a target-sum range beginning at the first array element.
- `Negative values with target-sum counting` — Prefix-difference counting works with signed numbers because it asks for an exact earlier total; it does not rely on window monotonicity. A shrinking sum window does not generally work when negatives can make a sum rise or fall unpredictably.
- `Prefix remainder frequency` — For positive modulus m, count prior prefixes with the same normalized remainder as the current prefix. Their difference is divisible by m. Normalize negative C# remainders into `[0,m)` with `((x % m)+m)%m`.
- `Equal prefix balance` — If each category contributes a signed increment, equal cumulative balances at two boundaries mean the intervening range has net balance zero. For binary arrays, map one value to +1 and the other to -1 to detect equal counts.
- `XOR prefix aggregate` — XOR accumulates by prefix; because `x XOR x = 0`, range XOR `[l,r)` is `prefix[r] XOR prefix[l]`. The same frequency-of-prefix idea can count ranges with target XOR by seeking `current XOR target`.

## Cross-item comparison

`Subarray sum as prefix difference` is the identity behind the `Prefix-frequency map`. `Seed frequency for empty prefix` handles ranges starting at zero. `Negative values with target-sum counting` distinguishes prefix counting from a sum window that needs monotonicity. `Prefix remainder frequency` replaces exact sums with equivalence classes modulo m. `Equal prefix balance` changes the aggregate to a signed count difference. `XOR prefix aggregate` uses XOR's self-inverse operation rather than subtraction.

## Examples

For `[1,-1,1]`, k=1, start with `freq[0]=1`. Prefix S=1 needs prior 0, contributing one; S=0 needs -1, contributing none; S=1 needs prior 0, now seen twice, contributing two. Total is 3. Query before incrementing `freq[S]` so the zero-length range at the current boundary is not counted.

## Common mistakes

- Forgetting the initial zero prefix and missing ranges starting at index zero.
- Adding the current prefix count before querying, thereby allowing an empty subarray when k=0.
- Storing only presence instead of frequency when multiple earlier boundaries yield distinct subarrays.
- Using C# `%` directly as a nonnegative remainder for negative totals.
- Applying a sum-prefix formula unchanged to XOR or balance; use the correct aggregate and inverse relation.
- Accumulating O(n²) answers in a narrow integer type.

## Knowledge checks with answers

1. **Which prior sum completes current prefix S to target k?** `S-k`.
2. **Why is zero seeded once?** It is the prefix before the first element.
3. **Why does the method allow negative array elements?** It searches exact earlier prefix values and needs no monotone boundary movement.
4. **What relation completes an XOR target?** Earlier prefix must equal `current XOR target`.

Sources: [USACO Guide: Prefix Sums](https://usaco.guide/silver/prefix-sums), [USACO Guide: More Prefix Sums](https://usaco.guide/silver/more-prefix-sums).
