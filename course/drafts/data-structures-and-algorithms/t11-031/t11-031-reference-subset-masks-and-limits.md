# bitwise operations, masks, and subset enumeration — Reference: Subset masks and complexity

## Scope and version

This lesson covers exact subset-mask and submask ideas. Runtime estimates assume each mask operation is constant time for the chosen machine integer; output construction adds work proportional to output size. See [USACO Guide bitmask DP](https://usaco.guide/gold/dp-bitmasks).

## How this group fits the mental model

An `n`-element universe maps to an `n`-bit membership vector. Each bit chooses included or excluded, so integer masks enumerate subsets in binary order. This representation is compact only when the universe fits the type and enumerating all possibilities is feasible.

## Supplied names explained

- **Subset bit mask** — Bit `i` is one exactly when item `i` is selected. The empty subset is mask zero; the full subset is `(1<<n)-1` only when `n` is below the width boundary.
- **Enumerate all masks from zero to 2^n minus one** — Loop over all `2^n` values, mapping each to one subset. Use a wider counter or another loop shape when `n` could reach the counter width; ordinary integer shifts can wrap.
- **Test whether subset contains element** — Check `(mask & (1<<i)) != 0`, with index `i` in the represented universe.
- **Enumerate submasks of a mask** — Starting with `sub=mask`, repeatedly use `sub=(sub-1)&mask` until zero. This visits nonzero submasks in descending numeric order; process zero separately or use a loop form that includes it. Guard against an infinite loop when zero is included.
- **O(2^n) subset enumeration** — There are `2^n` subsets. Inspecting all `n` bits for each costs `O(n2^n)`; outputting every element of every subset has total `Theta(n2^(n-1))` element work.
- **O(3^n) all-mask submask enumeration** — Across all masks, each bit is absent from the mask, present in mask but absent from submask, or present in both; hence `3^n` mask/submask pairs.
- **Bitmask DP connection** — A DP state indexed by a mask records information about that subset, such as best cost or reachability. It often yields `O(n2^n)` transitions, still exponential.
- **Small-universe requirement** — Integer masks are suitable when `n` fits the chosen representation and exponential work is acceptable. For larger or sparse universes, use sets, bit arrays, or other structures.
- **Signed overflow hazard** — In C#, shifts discard bits and mask the shift count; checked context does not prevent bit loss. `1 << 31` produces a signed negative pattern, and `1 << 32` acts like shift zero. Guard width boundaries and use `uint`/`ulong` as appropriate.

## Cross-item comparison

Boolean recursion can generate subsets without a machine-width limit, though it still creates `2^n` leaves. Masks give compact membership tests and are convenient DP keys. Submask loops enumerate substructures of one selected set; looping these for every set produces `3^n`, which is often more expensive than a single `2^n` sweep.

## Examples

For `[a,b,c]`, mask `101` represents `{a,c}`. Testing bit 1 returns false. Across all masks there are eight subsets. Across all outer masks and their submasks there are `3^3=27` pairs, including each empty submask.

## Common mistakes

- Assuming `1<<n` is valid when `n` equals the integer width.
- Forgetting mask zero in a submask enumeration.
- Writing `while (sub != 0) { ...; sub=(sub-1)&mask; }` and claiming it visits zero.
- Forgetting that materializing every subset has output-proportional cost.
- Calling a bitmask DP polynomial time because its transitions are bit operations.

## Knowledge checks with answers

1. **How many subsets of `n` elements exist?** `2^n`.
2. **Why is the all-mask/all-submask count `3^n`?** Each element has three membership statuses for a pair `(sub,mask)`.
3. **What is one safe approach to include zero in a submask loop?** Use a loop that processes `sub`, breaks when `sub==0`, otherwise assigns `(sub-1)&mask`.
