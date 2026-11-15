# bitwise operations, masks, and subset enumeration — Core concepts and how they fit together

## Learning objectives

Explain AND, OR, XOR, and complement bit by bit; create and use a mask; reason about two's-complement identities; count bits; enumerate subsets; and identify fixed-width and signedness hazards in C#.

## Prerequisites

You should know integer types, binary place values, loops, and basic sets. A bit position `i` has value `2^i`; bit positions are zero-based.

Language-specific claims use the [current C# bitwise and shift operator reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators).

## Core concepts

For corresponding bits, AND is one only for `1&1`; OR is one if either is one; XOR is one when they differ; NOT flips every bit in the fixed-width representation. XOR also obeys `x^x=0`, `x^0=x`, associativity, and commutativity.

A mask with only bit `i` set is `1 << i` for an `int`-sized bit pattern. Test with `(x & mask) != 0`, set with `x | mask`, clear with `x & ~mask`, and toggle with `x ^ mask`. Ensure the bit index is in range and choose signed or unsigned types deliberately. `1 << 31` is a negative signed `int` bit pattern; it is not a positive mathematical power of two.

## Mechanisms and relationships

In two's-complement arithmetic, `x & -x` isolates the least significant set bit, and `x & (x-1)` clears it. These identities include the sign bit when a fixed-width signed value is represented as bits, but reasoning about negative values must preserve the exact width and language semantics. Repeating clear-lowest-bit until zero counts set bits for nonnegative inputs; for arbitrary signed values in C#, use an unsigned representation or a fixed 32-iteration loop when counting the 32-bit pattern.

A subset mask uses bit `i` to encode whether item `i` is selected. Testing each of `n` positions per mask yields `O(n2^n)` work to materialize every subset. Iterating every submask for every mask totals `3^n`: each bit is absent from the outer mask, in the mask but not submask, or in both. This is suitable only for small `n`.

C# shift details are language-specific. `int`/`uint` shift counts use the low five bits; `long`/`ulong` use six. Thus a count equal to the width acts like zero rather than producing an all-zero result. `>>` is arithmetic for signed values and fills from the sign bit; `>>>` is logical and fills zeros. Shift operations discard bits shifted out; they do not throw overflow exceptions even in checked context. See the [C# bitwise and shift operator reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators).

## Worked examples

`x=10` is binary `1010`. Mask `1<<1` is `0010`; `x & mask` is nonzero, so bit 1 is set. `x & (x-1)` gives `1010 & 1001 = 1000`, clearing its lowest set bit. Repeating produces `1000`, then `0000`, so the population count is two.

For `n=3`, masks `000` through `111` represent all eight subsets. The mask `101` selects elements at indices 0 and 2. With three elements, exhaustive enumeration is small; with 30 elements, `2^30` masks are already impractical in many settings.

## Misconceptions and edge cases

- Bitwise NOT flips all bits in the type, not just bits visibly written in a short binary numeral.
- A shift by the type width is masked in C#; it is not a safe way to clear all bits.
- Signed right shift and unsigned right shift differ for negative values.
- `x & -x` must account for fixed-width signed representation; avoid negating the minimum signed value as a mathematical absolute-value operation.
- XOR uniqueness requires exact even-multiplicity assumptions.
- `O(2^n)` enumeration remains exponential even though each subset uses one integer.
- For `n` equal to the bit width, `1 << n` is not a valid way to represent `2^n` in that same type.

## Knowledge checks with answers

1. **What does XOR do to equal bits?** Produces zero; different bits produce one.
2. **How do you clear bit `i`?** `x & ~(1 << i)`, with the bit index and integer width in range.
3. **What does C# `-1 >>> 1` do for `int`?** It shifts zeros from the left, yielding `0x7fffffff`.
4. **Why is subset enumeration exponential?** Each of `n` items independently has two membership choices, giving `2^n` subsets.
