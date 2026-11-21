# prefix sums, difference arrays, and static range queries — Core concepts and how they fit together

## Learning objectives

- Define a prefix aggregate at boundaries and derive inclusive and half-open range formulas.
- Use prefix frequencies to count exact-sum subarrays even when values are negative.
- Explain prefix remainders, two-dimensional inclusion-exclusion, and difference markers.
- Choose static preprocessing versus an online update/query data structure.

## Prerequisites

Know array indexing, loops, addition/subtraction, and the meaning of a contiguous subarray. A half-open interval `[l,r)` includes l but excludes r; its length is `r-l`.

## Core concepts

### Store cumulative values at boundaries

For an array `a` of length n, define `P[0]=0` and `P[i+1]=P[i]+a[i]`. Thus P has n+1 entries. The inclusive sum `[l,r]` is `P[r+1]-P[l]`; the half-open sum `[l,r)` is `P[r]-P[l]`. The leading zero is the aggregate before any elements and avoids a branch for ranges starting at zero.

This subtraction works because addition has an inverse: the contribution before l appears in both prefixes and cancels. The same idea works for XOR because XOR is its own inverse. It does not work for arbitrary aggregates such as minimum, where there is no operation that cancels a prefix minimum.

### Count target-sum subarrays with prefix frequencies

Let current prefix total be S at boundary r. A previous prefix Q forms a subarray sum k ending at r exactly when `S-Q=k`, so `Q=S-k`. Store how often each prefix has appeared. Before processing values, seed frequency zero with one to represent the empty prefix; this counts a qualifying range that starts at index zero.

At each element: extend S, add `frequency[S-k]` to the answer, then increment `frequency[S]`. Query before inserting the current prefix so an empty range is not counted as a nonempty subarray. This method handles negative values because it does not rely on a monotone moving window.

### Divisibility uses equal remainders

A range sum is divisible by m when its prefix difference is divisible by m; this occurs when the prefixes have the same remainder modulo m. In languages such as C#, remainder can be negative for a negative dividend, so normalize with `((sum % m) + m) % m` when m is positive. Count prior normalized remainders, seeded with remainder zero once.

### Two-dimensional prefix sums use inclusion-exclusion

For a matrix, define a zero-padded table where `P[r+1,c+1]` is the sum of the rectangle from origin through cell `(r,c)`. A half-open rectangle `[r1,r2) × [c1,c2)` is:

`P[r2,c2] - P[r1,c2] - P[r2,c1] + P[r1,c1]`.

The top strip and left strip are subtracted; their shared top-left rectangle was subtracted twice, so add it back. The zero row and column make rectangles touching the matrix boundary use the same equation.

### Difference arrays record changes at boundaries

To add x to inclusive interval `[l,r]`, record `D[l] += x` and, if `r+1` lies inside the allocated difference range, `D[r+1] -= x`. A prefix pass accumulates active markers and yields each final value. With initial values, first encode those values as the base or apply the cumulative increments onto a copy. The operation is offline: intermediate values between updates are not directly available unless separately reconstructed.

## Mechanisms and relationships

| Workload | Preprocessing/state | Query or update cost | Limitation |
|---|---|---|---|
| Static 1D range sum | n+1 prefix values | O(1) query | Updates make later prefixes stale |
| Count exact-sum subarrays | Map of earlier prefix totals | Expected O(1) per element | Count may require 64-bit storage |
| Count divisible subarrays | Map of normalized remainders | Expected O(1) per element | Modulus must be positive for stated normalization |
| Static rectangle sum | Padded 2D prefix table | O(1) rectangle query | O(rows × columns) storage; stale after edits |
| Batch range increments | Difference markers | O(1) per update, O(n) final scan | Not a structure for arbitrary online queries |

## Worked examples

For `[1, -1, 1]` and k=1, current prefix starts at 0 with frequency 1. After first 1, `S=1`; prior prefix 0 contributes one range. After -1, `S=0`; prior prefix -1 has frequency zero. After final 1, `S=1`; earlier prefix 0 has appeared twice, so two more ranges end here. Total count is 3. A positive-only sliding window would not support this signed input proof.

For range updates on five zeroes, add 3 to indices `[1,3]`: mark `D[1]+=3`, `D[4]-=3`. Prefix reconstruction yields `[0,3,3,3,0]`.

## Misconceptions and edge cases

- Prefix array length is n+1 when it includes the empty prefix.
- Inclusive and half-open formulas differ by one boundary; write down the convention before coding.
- A prefix-frequency map needs the initial zero prefix exactly once.
- Negative values do not break prefix-sum counting; they break monotone sum-window reasoning.
- Query before inserting current prefix to avoid counting an empty range.
- Use `long` when the sum or answer may exceed `int`; subtraction and multiplication can overflow before assignment if operands stay narrow.
- Difference cancellation at `n` may require an allocated n+1 sentinel slot, or a bounds check when only final n outputs are needed.
- Rebuilding prefix sums after each update can cost O(n); many interleaved operations call for a Fenwick/segment tree.

## Knowledge checks with answers

1. **Why is `P[0]=0` useful?** It represents the empty prefix and makes ranges starting at zero use the same subtraction formula.
2. **Which earlier prefix forms a target-sum range with current S?** `S-k`.
3. **Why seed its frequency before scanning?** It counts ranges beginning at array index zero.
4. **How do equal remainders imply a divisible range?** Their difference is divisible by the modulus.
5. **Why add back the top-left corner in 2D inclusion-exclusion?** It was removed once in each strip subtraction.
6. **What is the difference array best suited for?** Many offline range increments followed by final reconstruction.

Sources: [USACO Guide: Prefix Sums](https://usaco.guide/silver/prefix-sums), [USACO Guide: More Prefix Sums](https://usaco.guide/silver/more-prefix-sums).
