# bitwise operations, masks, and subset enumeration — Reference: Testing and changing individual bits

# Scope and version

The language-specific notes are for current C# 15, checked 2026-11-16. C# 11 introduced the unsigned right-shift operator `>>>`. All other names below are the exact supplied inventory items.

# How this group fits the mental model

This group provides the bit-level building blocks for masks and subset state. Begin with fixed-width bit patterns, then reason about an operator’s truth table and the type of its operands. Signedness does not alter AND/OR/XOR truth tables, but it matters for shifts, overflow, casts, and displaying a result.

# Supplied names explained

- `One-bit mask 1 shifted by index` — For a valid bit index i, `1u << i` selects that bit in a 32-bit unsigned word. Use `1UL` for 64-bit masks; signed `1 << 31` produces the sign bit.

- `Test bit` — A bit is set when `(value & mask) != 0`. Ensure mask and value use compatible widths and intended signed/unsigned interpretation.

- `Set bit` — Use `value | mask` to make every selected bit 1 without changing other bits.

- `Clear bit` — Use `value & ~mask` to make selected bits 0 and preserve all others.

- `Toggle bit` — Use `value ^ mask` to flip selected bits; applying the same mask again restores the original value.

- `Mask low k bits` — For a width-safe unsigned type, `(1u << k) - 1` selects the lowest k bits only when k is in range and below the word width. Handle k=0 and k=width separately to avoid shift-count wrap.

- `Extract bit range` — Shift the desired low endpoint to bit zero, then AND with a mask of the range width. Validate start, length, and end against the type width; avoid constructing a mask with an invalid full-width shift.

- `Unsigned shift behavior` — Unsigned right shift fills vacated high bits with zero, which is useful for treating a signed int’s bit pattern as raw bits after an explicit unchecked cast to uint.

- `Shift-count bounds` — C# masks shift counts: for int/uint only the low 5 bits are used, and for long/ulong the low 6 bits are used. A shift by the type width therefore behaves like shift by zero; guard counts explicitly.

- `Bit-width assumptions` — A bit trick is meaningful only with a stated fixed width and interpretation. In C#, int/uint have 32 bits and long/ulong have 64; casts, overflow context, and signed shifts affect behavior.

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
