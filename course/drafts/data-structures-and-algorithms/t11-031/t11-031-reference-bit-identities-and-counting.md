# bitwise operations, masks, and subset enumeration — Reference: Low bits, parity, and population counts

## Scope and version

These identities apply to fixed-width two's-complement values; examples clarify signed boundaries. C# shift and bitwise behavior is specified in the [Microsoft operator reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators).

## How this group fits the mental model

The lowest set bit is the rightmost one in a binary pattern. Arithmetic on a two's-complement value interacts with that bit in a predictable way, enabling compact extraction, clearing, and counting. The proof depends on a fixed representation and careful zero/negative handling.

## Supplied names explained

- **Isolate least significant set bit x AND -x** — For nonzero fixed-width two's-complement `x`, `x & -x` leaves only its lowest set bit. It also works for the minimum signed value at the bit-pattern level in unchecked two's-complement contexts, but avoid treating `-x` as a representable mathematical positive magnitude.
- **Clear least significant set bit x AND (x-1)** — `x & (x-1)` turns off the lowest one bit. Repeating on a nonnegative value eventually reaches zero; each iteration removes exactly one set bit.
- **Population count** — The number of one bits. Kernighan's loop repeatedly applies `x &= x-1` and runs once per set bit. A fixed-width loop checks every bit. Modern .NET also exposes `BitOperations.PopCount`, but a problem may prohibit built-ins; inspect the assigned contract.
- **Parity bit** — XORing all bits gives parity: one if the count of one bits is odd, zero if even. XORing values similarly tracks parity per bit.
- **Power-of-two test** — For positive `x`, `(x & (x-1)) == 0` exactly when one bit is set. Include `x > 0`; without it, zero also satisfies the bit expression.
- **Power-of-two-of-two boundary** — The highest representable power of two is type-specific. For signed 32-bit positive `int`, `1<<30` is the largest positive power; `1<<31` is the negative sign-bit pattern. For `uint`, `1u<<31` is valid; do not shift by 32 to represent `2^32`.
- **XOR of range pattern** — XOR from zero through `n` repeats every four: `n`, `1`, `n+1`, `0` when `n mod 4` is 0,1,2,3 respectively. XOR over `[l,r]` is `prefix(r) ^ prefix(l-1)` with a separate `l==0` case.
- **XOR cancellation by even multiplicity** — If every value occurs an even number of times except one value with odd multiplicity, XOR of all values returns that odd-multiplicity value. The common single-number problem specializes this to pairs and one singleton.
- **Mask off higher bits** — AND with a low-bit mask retains only selected lower positions. Construct the mask without shifting by the full type width; unsigned types make intended bit patterns clearer.

## Cross-item comparison

Kernighan population count loops only over set bits (`O(popcount(x))`), while a fixed-width scan always checks all bits. The power-of-two test is the same lowest-bit-clearing identity plus a positive-value guard. XOR parity and XOR cancellation use the same self-inverse operation at different levels: individual bits versus whole values.

## Examples

For `x=12` (`1100`), `x & -x` isolates `0100`, and `x & (x-1)` gives `1000`. Kernighan's loop takes two iterations, so the population count is two. For `[4,1,2,1,2]`, XOR cancels pairs and returns 4.

## Common mistakes

- Applying the positive power-of-two predicate to zero without a guard.
- Assuming signed bit tricks are arbitrary-precision arithmetic identities.
- Negating the minimum signed integer to obtain a positive magnitude.
- Forgetting XOR cancellation requires even multiplicity for every other value.
- Using a full-width low-bit mask expression that shifts by the type width.

## Knowledge checks with answers

1. **How many iterations does Kernighan's loop take?** One per set bit.
2. **Why must a power-of-two predicate check `x>0`?** Zero has no set bits but satisfies `x & (x-1) == 0`.
3. **What assumption lets XOR find one exceptional value?** Every other value has even multiplicity and the exceptional value has odd multiplicity.
