# bitwise operations, masks, and subset enumeration — Reference: Subset masks and complexity

# Scope and version

The language-specific notes are for current C# 15, checked 2026-11-17. C# 11 introduced the unsigned right-shift operator `>>>`. All other names below are the exact supplied inventory items.

# How this group fits the mental model

This group provides the bit-level building blocks for masks and subset state. Begin with fixed-width bit patterns, then reason about an operator’s truth table and the type of its operands. Signedness does not alter AND/OR/XOR truth tables, but it matters for shifts, overflow, casts, and displaying a result.

# Supplied names explained

- `Subset bit mask` — For a universe of n indexed elements, bit i indicates whether element i is included. There are 2^n masks, each representing one distinct subset.

- `Enumerate all masks from zero to 2^n minus one` — Loop over masks in `[0, 2^n)`; mask zero represents the empty subset. The count and shift must fit the chosen integer width.

- `Test whether subset contains element` — Element i is present when `(mask & (1 << i)) != 0`. Index i must be below the mask width.

- `Enumerate submasks of a mask` — For nonzero submasks, repeatedly use `sub = (sub - 1) & mask`, starting at mask. This visits every nonzero submask in descending order; process zero separately if required.

- `O(2^n) subset enumeration` — There are 2^n masks. If each mask scans n elements to materialize/output a subset, total work is O(n·2^n), and output storage can also be exponential.

- `O(3^n) all-mask submask enumeration` — Across every mask, iterating its submasks costs `sum_k C(n,k)2^k = 3^n` mask/submask pairs. This is feasible only for small n.

- `Bitmask DP connection` — A subset mask can be a DP state; transitions add/remove one item. The state count is 2^n, often with another factor n, so this technique targets small universes rather than arbitrary n.

- `Small-universe requirement` — Bitmask representation requires the universe size to fit the chosen word and exhaustive subset iteration also grows exponentially. Use arrays, sets, or another representation for larger universes.

- `Signed overflow hazard` — In C#, signed overflow is unchecked by default unless configured otherwise; checked contexts can throw. Shifting into a sign bit, negating the minimum value, and computing `1 << width` need explicit width-aware reasoning.

# Cross-item comparison

AND inspects/intersects selected 1-bits; OR sets selected 1-bits; XOR toggles and cancels equal operands. Arithmetic right shift preserves sign; logical right shift fills with zero. Set and toggle differ because setting an already-set bit leaves it set while toggling clears it. `x & (x-1)` removes one low set bit, whereas a fixed-width scan examines every position regardless of how many are set. Subset masks compactly encode a set, but recursion can be clearer and works beyond a machine word; neither representation changes the exponential output size.

# Examples

With a 32-bit unsigned value `0b1010`, mask bit 1 is `1u << 1`. AND tests it, OR sets it, `value & ~mask` clears it, and XOR toggles it. For extraction, first validate the requested bit interval, then shift and mask; special-case a range spanning the entire width rather than shifting by the width.

# Common mistakes

- Failing to state whether bit 0 is least significant.
- Applying a signed shift to a raw bit pattern and expecting zero fill.
- Constructing a signed mask at the highest bit without considering the sign.
- Forgetting C# masks the shift count to the operand width.
- Using a fixed-width trick where the universe exceeds that width.
- Quoting O(2^n) while omitting the extra O(n) work to output each subset.

# Knowledge checks with answers

1. What happens when a set bit is toggled twice? **It returns to its original state.**
2. How many submask pairs exist over all masks of n bits? **3^n.**
3. Why does a signed negative number count need an explicit interpretation? **It may mean mathematical magnitude or the full fixed-width two’s-complement pattern.**
4. When is a full-width mask special? **The usual `(1 << width)-1` shifts by zero in C# rather than producing all ones; use an explicit all-ones value or branch.**

# Sources

- [Reference](https://usaco.guide/silver/bitwise?lang=cpp)
- [Reference](https://usaco.guide/gold/dp-bitmasks)
- [Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)
- [.NET `BitOperations` API](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0)
- [Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-versioning)
- [Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/whats-new/csharp-11#unsigned-right-shift-operator)
- [Reference](https://leetcode.com/problems/single-number/)
- [Reference](https://leetcode.com/problems/number-of-1-bits/)
- [Reference](https://leetcode.com/problems/counting-bits/)
- [Reference](https://leetcode.com/problems/reverse-bits/)
- [Reference](https://leetcode.com/problems/sum-of-two-integers/)
- [Reference](https://leetcode.com/problems/single-number-ii/)
- [Reference](https://leetcode.com/problems/bitwise-and-of-numbers-range/)
- [Reference](https://leetcode.com/problems/subsets/)
