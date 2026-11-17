# bitwise operations, masks, and subset enumeration — Reference: Operators, truth tables, and shifts

# Scope and version

The language-specific notes are for current C# 15, checked 2026-11-17. C# 11 introduced the unsigned right-shift operator `>>>`. All other names below are the exact supplied inventory items.

# How this group fits the mental model

This group provides the bit-level building blocks for masks and subset state. Begin with fixed-width bit patterns, then reason about an operator’s truth table and the type of its operands. Signedness does not alter AND/OR/XOR truth tables, but it matters for shifts, overflow, casts, and displaying a result.

# Supplied names explained

- `Bitwise AND` — For each bit position, the result is 1 only when both operands have 1. It is commonly used to test or clear selected bits.

- `Bitwise OR` — For each position, the result is 1 when either operand has 1. OR with a mask sets the mask’s selected bits.

- `Bitwise XOR` — For each position, the result is 1 when the operand bits differ. XOR toggles selected bits and cancels equal values in pairs.

- `Bitwise NOT` — Flips every bit in the fixed-width representation. In C#, `~x` includes the sign bit and is not a logical Boolean negation.

- `Left shift` — Moves bit positions toward more significant positions and fills low positions with zero. Bits shifted out are discarded; C# bitwise and shift operations never throw for overflow and behave identically in checked and unchecked contexts. The resulting signed value may have a changed sign bit. [C# shift semantics](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators)

- `Right shift` — Moves bits toward less significant positions. C# signed `>>` is arithmetic and copies the sign bit; unsigned `>>` fills high positions with zero.

- `Logical versus arithmetic right shift` — A logical shift fills high bits with zero; an arithmetic shift of a signed value replicates the sign bit. C# 11 added `>>>` for logical right shift; unsigned operands also shift logically.

- `XOR self-inverse identity` — `x ^ x` is zero, `x ^ 0` is x, and `(x ^ y) ^ y` is x. Parentheses are unnecessary mathematically, but precedence and casts matter in code.

- `AND/OR truth tables` — AND outputs 1 only for (1,1); OR outputs 0 only for (0,0). These per-bit truth tables explain mask set/test/clear operations.

- `Two's-complement representation` — C# signed integer types use fixed-width two’s-complement representation. Negation is bitwise complement plus one modulo the width; the most significant bit is the sign bit.

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
