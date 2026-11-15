# bitwise operations, masks, and subset enumeration — Reference: Testing and changing individual bits

## Scope and version

This lesson covers the exact named mask operations using C# `int`/`uint` examples. Shift behavior follows the [current C# operator reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators).

## How this group fits the mental model

A one-bit mask isolates one position in a fixed-width word. AND observes it, OR forces it on, AND with a complemented mask forces it off, and XOR flips it. Every formula assumes a valid bit index and a type wide enough for the intended universe.

## Supplied names explained

- **One-bit mask 1 shifted by index** — `1u << i` constructs the mask for bit `i` in a 32-bit `uint` when `0 <= i < 32`. Prefer `1UL << i` for a 64-bit mask and ensure `i < 64`.
- **Test bit** — `(value & mask) != 0` means the selected position is set; equality to zero means it is clear.
- **Set bit** — `value | mask` turns the selected position on and leaves all other positions unchanged.
- **Clear bit** — `value & ~mask` turns the selected position off and preserves all others.
- **Toggle bit** — `value ^ mask` flips the selected position; applying it twice restores the value.
- **Mask low k bits** — For `uint`, `(1u << k) - 1` works for `0 <= k < 32`; for `k==32`, use `uint.MaxValue` separately because the shift count wraps to zero. A wider unsigned type can simplify boundary handling, but still guard its full width.
- **Extract bit range** — Shift the desired low endpoint to bit zero, then AND with a mask of the range width. For unsigned `x`, `(x >> start) & ((1u << width)-1)` works when width is 1..31 and `start+width <= 32`; handle width 32 separately.
- **Unsigned shift behavior** — C# `>>>` shifts in zero bits even when the operand is signed. For unsigned values, `>>` is already logical.
- **Shift-count bounds** — C# masks shift counts: five low bits for `int`/`uint`, six for `long`/`ulong`. Algorithms should explicitly validate indices instead of relying on this wrapping behavior.
- **Bit-width assumptions** — The mask type must have enough positions for the set universe; document signed interpretation, valid indices, and any reserved sign bit.

## Cross-item comparison

Set and toggle differ when the bit is already one: set leaves it one; toggle clears it. Test is observational, while the other operations mutate the represented value. Low-bit masks have width boundary cases because shifting by the width does not produce a representable `2^width` in the same type.

## Examples

For `value=10` (`1010`) and `mask=1u<<1` (`0010`), test is true, set keeps 1010, clear produces 1000, and toggle produces 1000. Applying toggle again returns 1010.

## Common mistakes

- Using `1 << 31` as a positive signed mask.
- Failing to parenthesize `(value & mask) != 0`.
- Building a full-width mask with a shift equal to the type width.
- Accepting out-of-range bit indexes and silently getting a wrapped shift count.
- Assuming a mask type is large enough because the input currently uses small values.

## Knowledge checks with answers

1. **Which operation is idempotent for an already-set bit: set or toggle?** Set.
2. **How do you test bit 5 in a `uint x`?** `(x & (1u << 5)) != 0`.
3. **How should an implementation handle `k==32` when masking all low `uint` bits?** Return `uint.MaxValue` in a separate branch.
