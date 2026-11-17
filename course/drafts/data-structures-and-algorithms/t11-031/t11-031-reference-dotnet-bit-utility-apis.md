# bitwise operations, masks, and subset enumeration — Reference: Relevant .NET bit and integer APIs

Sources: [Microsoft `BitOperations` class](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.bitoperations?view=net-10.0), [generic math](https://learn.microsoft.com/en-us/dotnet/standard/generics/math), [`IBinaryInteger<TSelf>`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.ibinaryinteger-1?view=net-10.0), [`IBinaryNumber<TSelf>`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.ibinarynumber-1?view=net-10.0), [C# language versioning](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-versioning), and [`BigInteger`](https://learn.microsoft.com/en-us/dotnet/api/system.numerics.biginteger?view=net-10.0).

## Scope and version

This reference covers the general-purpose fixed-width helpers in `System.Numerics.BitOperations` present in .NET 10, the related .NET 7/C# 11 generic-math integer interfaces, and relevant `BigInteger` bit operations. The `BitOperations` class also includes `Crc32C` overloads, which compute checksums and are outside this lesson's scope. API overloads and edge cases were checked against Microsoft Learn on November 17, 2026.

## How this group fits the mental model

`BitOperations` packages common operations on 32-bit, 64-bit, or native-width words. It does not change the underlying bit pattern or remove the need to choose signedness, width, and zero-input behavior deliberately. `BigInteger` is a separate arbitrary-precision signed integer type, and generic-math interfaces let algorithms name bit operations without hard-coding a primitive type. Use helpers when they clarify intent; use a manual loop when the exercise explicitly asks for the derivation.

## Supplied names explained

| Method | .NET 10 overloads | Meaning and important boundary behavior |
|---|---|---|
| `BitOperations.IsPow2` | `int`, `long`, `nint`, `uint`, `ulong`, `nuint` | Returns whether the value is a power of two. Zero and negative values are not powers of two. |
| `BitOperations.LeadingZeroCount` | `uint`, `ulong`, `nuint` | Counts zeros from the most significant end of that operand width. Zero returns the full width: 32, 64, or the native width. |
| `BitOperations.TrailingZeroCount` | `int`, `long`, `nint`, `uint`, `ulong`, `nuint` | Counts zeros from the least significant end of the fixed-width pattern. Zero likewise returns the operand width; signed overloads inspect the signed value's fixed-width representation. |
| `BitOperations.Log2` | `uint`, `ulong`, `nuint` | Returns floor(log₂(value)) for positive values. By API convention, zero returns zero even though mathematical log₂(0) is undefined. |
| `BitOperations.PopCount` | `uint`, `ulong`, `nuint` | Returns the number of set bits in the supplied unsigned mask. For a signed value's raw pattern, convert explicitly to the corresponding unsigned type first. |
| `BitOperations.RotateLeft` / `BitOperations.RotateRight` | `uint`, `ulong`, `nuint`, each with an `int` offset | Rotates bits within the word, moving shifted-out bits around to the other end instead of discarding them. Offsets are treated modulo the word width (32, 64, or native width). |
| `BitOperations.RoundUpToPowerOf2` | `uint`, `ulong`, `nuint` | Returns the least representable power of two greater than or equal to the input. Zero returns zero; if the next power of two overflows the type, the method also returns zero. |

`Hardware-intrinsic and software-fallback behavior` — The class uses hardware intrinsics when available and optimized software fallbacks otherwise. This does not promise one particular machine instruction or that a helper is faster for every workload. Benchmark the real path if performance is the reason for choosing between equivalent implementations.

## Generic math and arbitrary-precision integers

.NET 7 and C# 11 introduced generic math interfaces with static abstract numeric members. `System.Numerics.IBinaryInteger<TSelf>` exposes common binary-integer operations including `LeadingZeroCount`, `PopCount`, `RotateLeft`, `RotateRight`, and `TrailingZeroCount`; it also provides `GetShortestBitLength`. `System.Numerics.IBinaryNumber<TSelf>` exposes `IsPow2`, `Log2`, and the `AllBitsSet` value. These interfaces let a generic method express a bit algorithm once for types that implement the required contract. They are a separate API surface from `BitOperations` overloads.

The exact supplied generic-math inventory is:

| API name | Role |
|---|---|
| `System.Numerics.IBinaryInteger<TSelf>` | Generic contract for binary integer types. |
| `System.Numerics.IBinaryNumber<TSelf>` | Generic contract for binary numeric types. |
| `IBinaryInteger<TSelf>.GetShortestBitLength` | Shortest two's-complement representation length exposed by the interface. |
| `IBinaryInteger<TSelf>.LeadingZeroCount` | Generic leading-zero count operation. |
| `IBinaryInteger<TSelf>.PopCount` | Generic set-bit-count operation. |
| `IBinaryInteger<TSelf>.RotateLeft` | Generic left rotation operation. |
| `IBinaryInteger<TSelf>.RotateRight` | Generic right rotation operation. |
| `IBinaryInteger<TSelf>.TrailingZeroCount` | Generic trailing-zero count operation. |
| `IBinaryNumber<TSelf>.IsPow2` | Generic power-of-two predicate. |
| `IBinaryNumber<TSelf>.Log2` | Generic base-2 logarithm operation. |
| `IBinaryNumber<TSelf>.AllBitsSet` | Generic value whose bits are all set. |
| `BigInteger.GetBitLength` | Public instance API for shortest two's-complement length without the sign bit. |
| `BigInteger.IsPowerOfTwo` | Instance property reporting whether the arbitrary-precision value is a power of two. |
| `BigInteger.IsEven` | Instance property reporting whether the arbitrary-precision value is even. |
| `.NET 7 generic-math introduction` | Version boundary for the base-class-library generic-math interfaces. |
| `C# 11 generic-math introduction` | Language support for static virtual/abstract interface members used by generic math. |

`BigInteger` implements both interfaces. It also has `GetBitLength()`, which reports the number of bits needed for its shortest two's-complement representation without the sign bit; it returns zero for zero and minus one. `BigInteger` supports `&`, `|`, `^`, `~`, `<<`, `>>`, and `>>>` (the `BigInteger bitwise operators: &, |, ^, ~, <<, >>, >>>` inventory item). Its bitwise operations use two's-complement semantics with virtual sign extension (`BigInteger two's-complement virtual sign extension`), so a negative value has no fixed highest sign-bit position. If an algorithm requires exactly 32, 64, or k bits, first constrain the value to that finite width with a mask; do not assume `BigInteger` behaves like a fixed-width unsigned word.

`IBinaryInteger<TSelf>.GetShortestBitLength()` is an explicit interface implementation for `BigInteger`; `BigInteger.GetBitLength()` is its public instance method for shortest two's-complement length. `BigInteger.PopCount`, `LeadingZeroCount`, and related generic-math methods operate according to the `BigInteger` type's signed representation, not a caller-selected finite machine width. Use a fixed-width unsigned primitive or explicitly mask before interpreting a result as a finite-word count.

`BigInteger.GetBitLength`, `BigInteger.IsPowerOfTwo`, and `BigInteger.IsEven` are named primitive APIs. For example, an explicit 32-bit mask makes the intended finite-width interpretation of `-1` visible before counting:

```csharp
using System.Numerics;

BigInteger mask32 = (BigInteger.One << 32) - BigInteger.One;
BigInteger low32 = new BigInteger(-1) & mask32;
BigInteger setBits = BigInteger.PopCount(low32); // 32
```

## Cross-item comparison

Manual loops expose each bit invariant and are useful when the exercise forbids built-ins. The library methods state intent directly and handle width-specific mechanics, but callers must still select the right overload and respect edge conventions. A rotate preserves every bit by wraparound; a shift discards bits that leave the word. Zero-count methods return the width for zero, while `Log2(0)` returns the API’s sentinel convention of zero.

## Examples

```csharp
using System.Numerics;

uint pattern = 0b_1011;
int ones = BitOperations.PopCount(pattern);                 // 3
int leading = BitOperations.LeadingZeroCount(0u);           // 32
int trailing = BitOperations.TrailingZeroCount(0u);         // 32
int floorLog = BitOperations.Log2(8u);                      // 3
int zeroLogConvention = BitOperations.Log2(0u);             // 0
uint rotated = BitOperations.RotateLeft(0x8000_0001u, 1);   // 3
uint rounded = BitOperations.RoundUpToPowerOf2(9u);          // 16
uint noRepresentablePower = BitOperations.RoundUpToPowerOf2(0x8000_0001u); // 0
bool isPower = BitOperations.IsPow2(1024);                   // true
```

Guard zero counts before using them as indexes or shift amounts: a zero word's leading/trailing zero count equals its width. Treat `Log2(0) == 0` as a documented sentinel convention, not as evidence that zero has logarithm zero. Likewise, distinguish `RoundUpToPowerOf2` returning zero for input zero from zero returned because the requested result overflowed.

## Common mistakes

- Assuming a signed `int` `PopCount` overload exists; convert the intended bit pattern to `uint` explicitly.
- Assuming zero has zero leading or trailing zeros; the fixed-width result equals 32, 64, or native width.
- Treating `Log2(0)` as a mathematical result rather than an API convention.
- Treating a zero `RoundUpToPowerOf2` result as unambiguous without checking whether the input was zero or overflowed.
- Confusing rotation with shifting: rotation preserves all bits by wrapping them around.
- Promising hardware-instruction use or a speedup without checking runtime, architecture, and workload.
- Treating the class's `Crc32C` checksum helpers as general-purpose mask or population-count methods.

## Knowledge checks with answers

1. What width does `TrailingZeroCount(0u)` report? **32, because the zero pattern has no set bit and the 32-bit overload counts the whole word.**
2. What does `Log2(0u)` return? **Zero by the API's documented convention; mathematical log₂(0) is undefined.**
3. How does rotation differ from shifting? **Bits leaving one end re-enter at the opposite end, so the word's bits are preserved.**
4. Why can `RoundUpToPowerOf2` return zero for two different cases? **The input is zero, or the next representable power of two overflows the selected unsigned type.**
5. Does `BitOperations.PopCount` guarantee a single CPU instruction? **No. It uses hardware intrinsics when available and optimized software fallbacks otherwise.**
6. How does `BigInteger` differ from `uint` for bitwise operations? **It has arbitrary precision and virtual sign extension, not a fixed 32-bit word; apply a finite-width mask when the algorithm requires one.**
7. What did generic math add for binary-integer algorithms? **.NET 7/C# 11 interfaces such as `IBinaryInteger<TSelf>` expose static bit operations to generic code through a declared type constraint.**
