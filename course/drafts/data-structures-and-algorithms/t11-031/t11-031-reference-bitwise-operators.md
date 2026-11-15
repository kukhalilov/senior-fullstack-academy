# bitwise operations, masks, and subset enumeration — Reference: Operators, truth tables, and shifts

## Scope and version

This lesson gives exact C# behavior for the listed operators as documented in the current [Microsoft C# reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators). Integral types and operand promotions matter; mathematical infinite-bit integers are not the execution model.

## How this group fits the mental model

Each operator transforms corresponding positions in a fixed-width value, except shifts which move positions. A truth table describes one position; applying it across the type's bits gives the result.

## Supplied names explained

- **Bitwise AND** — `x & y` sets a result bit only when both corresponding bits are one. Use it to test selected bits or keep only a mask's positions.
- **Bitwise OR** — `x | y` sets a result bit when either corresponding bit is one. OR with a mask sets those mask positions.
- **Bitwise XOR** — `x ^ y` sets a bit when corresponding bits differ. Equal operands cancel; XOR is also used to toggle mask positions.
- **Bitwise NOT** — `~x` flips every bit of the operand's promoted integral type. A short positive value can become negative because high bits are flipped in a signed type.
- **Left shift** — `x << count` moves bits toward higher positions, discards high bits leaving the type, and fills low positions with zero. For `int`/`uint`, the count uses its low five bits; `long`/`ulong` use six. A left shift is not checked arithmetic multiplication.
- **Right shift** — `x >> count` discards low bits. Signed `int`/`long` shifts are arithmetic and copy the sign bit into new high positions; unsigned `uint`/`ulong` shifts are logical and insert zeros.
- **Logical versus arithmetic right shift** — Arithmetic right shift preserves a signed value's sign; logical right shift inserts zeros regardless of sign. In modern C#, `>>>` requests logical right shift, including for a signed operand.
- **XOR self-inverse identity** — `x ^ x == 0` and `x ^ 0 == x`; applying the same XOR twice restores the original value. These identities support pair cancellation and toggling.
- **AND/OR truth tables** — Per bit: AND outputs 1 only for `(1,1)`; OR outputs 0 only for `(0,0)`. XOR is 1 for `(0,1)` and `(1,0)`; NOT maps 0 to 1 and 1 to 0.
- **Two's-complement representation** — C# signed integer values use fixed-width two's-complement patterns. The high bit represents negative values, so `~x`, arithmetic shifts, and negation must be interpreted at the type width, not as unbounded binary strings.

## Cross-item comparison

AND filters positions; OR combines or sets them; XOR toggles and cancels equal patterns. For positive integers, arithmetic and logical right shift often appear identical because the sign bit is zero. They diverge for negative signed values. `>>>` makes the logical intent explicit. Left shift discards bits at the type boundary, so it cannot safely stand in for arbitrary-precision multiplication.

## Examples

With four-bit patterns `x=1010` and `y=1100`, AND is `1000`, OR is `1110`, and XOR is `0110`. For 32-bit C# `int x=-8`, arithmetic `x >> 2` is `-2`; logical `x >>> 2` is the positive bit pattern `0x3ffffffe` (1073741822).

## Common mistakes

- Forgetting precedence: parenthesize expressions such as `(x & mask) != 0` and mixed shifts/AND.
- Assuming `~5` is a positive bit string with only the displayed bits inverted.
- Assuming a shift count of 32 clears a 32-bit `int`; C# masks that count to zero.
- Describing `>>` as always filling with zeros.
- Assuming checked context detects discarded shift bits.

## Knowledge checks with answers

1. **Which shift inserts zeros for negative `int`?** `>>>`.
2. **What is the effective `int` shift count for 32?** `32 & 31`, which is zero.
3. **Does checked mode throw when left shift discards high bits?** No; bitwise and shift operations do not throw overflow.
