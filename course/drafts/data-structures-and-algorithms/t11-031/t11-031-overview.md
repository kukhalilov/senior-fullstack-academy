# bitwise operations, masks, and subset enumeration — Big-picture orientation and mental model

## Problem and purpose

Bitwise algorithms work directly with the binary representation of integers. They can express set membership compactly, count parity or set bits, combine independent flags, and enumerate subsets. They are useful when the problem's state has a small finite universe or when a binary identity simplifies a proof.

The operator details here follow the [Microsoft C# bitwise and shift reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/bitwise-and-shift-operators).

## Plain-language mental model

Treat an integer as a row of fixed-width light switches. AND keeps a switch on only when both rows have it on; OR turns it on when either row does; XOR turns it on when exactly one row does. A mask is another row used to select or change chosen positions. The row has a fixed width, so the chosen integer type and its signed interpretation matter.

## How the parts fit together

Start with a truth-table or state meaning, not a trick. For a set of up to `w` possible elements, bit `i` can represent membership of element `i`. Then AND with a one-bit mask tests membership; OR sets it; AND with the complement clears it; XOR toggles it. For XOR cancellation, pair multiplicities precisely: pairs cancel, so one unpaired value remains only when the input contract guarantees that structure.

For subset enumeration over `n` elements, each of `n` bit positions is independently absent or present, giving `2^n` masks. A compact representation does not make exhaustive search polynomial. C# adds language-specific behavior: signed right shift, unsigned logical shift, masked shift counts, and fixed-width overflow rules.

## Concept map

| Goal | Bit pattern idea | Typical cost |
|---|---|---|
| Combine flags or compare bits | AND, OR, XOR, complement | constant time per machine word |
| Store a small subset | one bit per universe element | one integer word if it fits |
| Count set bits | clear the lowest set bit or reuse a smaller count | up to word width, or linear table |
| Enumerate all subsets | every mask from zero to `2^n-1` | `O(2^n)` outputs/states |
| Enumerate all submasks of each mask | nested mask/submask loops | `O(3^n)` total pairs |

## End-to-end walkthrough

For `[4,1,2,1,2]`, XOR every value. XOR is associative and commutative, and `x ^ x` is zero while `x ^ 0` is `x`. The two 1s cancel, the two 2s cancel, and 4 remains. The algorithm is linear and uses one accumulator. This argument depends on every other value occurring an even number of times; it does not find an arbitrary unique value without that contract.

## When to use it and tradeoffs

Use masks when the universe is small and fixed, parity or fixed-width representation is part of the problem, or the bit-level invariant is clearer than a larger data structure. Prefer ordinary arrays or sets when the universe is large, sparse, or values are not naturally tied to bit positions. Always include the type width and signedness in the explanation. Exhaustive bitmask methods are appropriate only when the exponential number of candidates fits the constraints.

## What later lessons cover

The concepts lesson derives truth tables, masks, low-bit identities, and subset complexity. Reference lessons detail C# operators and shifts, bit-mask operations, counting identities, and subset enumeration limits. Practice lessons apply XOR, population counts, bit reversal, carry propagation, modulo-three reconstruction, common-prefix AND, and subset masks.
