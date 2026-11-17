# bitwise operations, masks, and subset enumeration — Reference: Low bits, parity, and population counts

# Scope and version

The language-specific notes are for current C# 15, checked 2026-11-17. C# 11 introduced the unsigned right-shift operator `>>>`. All other names below are the exact supplied inventory items.

# How this group fits the mental model

This group provides the bit-level building blocks for masks and subset state. Begin with fixed-width bit patterns, then reason about an operator’s truth table and the type of its operands. Signedness does not alter AND/OR/XOR truth tables, but it matters for shifts, overflow, casts, and displaying a result.

# Supplied names explained

- `Isolate least significant set bit x AND -x` — For nonzero two’s-complement x, `x & -x` retains only its lowest 1 bit. For signed minimum value, negation wraps to itself in unchecked arithmetic, so the expression still yields that bit pattern; unsigned reasoning is often clearer.

- `Clear least significant set bit x AND (x-1)` — For nonzero x, `x & (x - 1)` clears its lowest 1 bit. Repeating it reaches zero after exactly the number of set bits.

- `Population count` — Counts 1 bits in a fixed-width representation. Brian Kernighan’s loop clears one set bit each iteration; .NET provides `System.Numerics.BitOperations.PopCount` for unsigned masks. A problem may disallow built-ins, and speed is workload-dependent.

- `Parity bit` — The parity is the population count modulo two. XORing each bit/value accumulates parity because pairs cancel.

- `Power-of-two test` — A positive unsigned x is a power of two exactly when `x & (x - 1)` is zero. Also require x != 0; zero has no set bit.

- `Power-of-two shift-width boundary` — A positive power of two has one set bit, but constructing `2^n` as `1 << n` requires n below the integer width. In C#, a width-sized shift wraps the count; choose a wider unsigned type or represent the boundary differently.

- `XOR of range pattern` — The XOR from 0 through n repeats a four-case pattern based on n modulo 4: n, 1, n+1, 0. XOR of [L,R] is prefixXor(R) XOR prefixXor(L-1), with a special case when L=0.

- `XOR cancellation by even multiplicity` — A value XORed an even number of times cancels to zero; an odd multiplicity leaves one copy. The singleton solution additionally requires every non-singleton value to occur exactly twice.

- `Mask off higher bits` — AND with a low-bit mask to discard higher positions. Construct the mask using a type and edge-case branch that handles zero bits and the full width safely.

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
