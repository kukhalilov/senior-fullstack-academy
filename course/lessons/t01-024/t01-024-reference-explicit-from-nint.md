
# C# numeric literals and numeric conversions — Reference: nint explicit numeric conversions

## Scope and version

* **Topic:** `nint` explicit numeric conversions in C#.
* **Edition:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-20. Source authority: Microsoft Learn [1].
* **Scope Boundary:** This reference lesson covers only the explicit numeric conversions originating from the native-sized signed integer type (`nint`) to the specific smaller or alternate integer/character types listed in the inventory. It excludes implicit conversions, conversions from other types to `nint`, and nonnumeric conversions.

## How this group fits the mental model

In C#, `nint` represents a native-sized signed integer whose size matches the pointer size of the execution target (32-bit on 32-bit architectures, 64-bit on 64-bit architectures). Because a `nint` can hold values that exceed the storage capacity or sign constraints of smaller types (such as `sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `ulong`, `nuint`, and `char`), the C# type system treats any conversion from `nint` to these target types as potentially lossy or unsafe.

Consequently, these conversions require an **explicit numeric conversion** [1]. An explicit conversion signals that you (the developer) accept responsibility for potential truncation, sign loss, or overflow when the runtime value exceeds the destination type's boundaries.

## Supplied names explained

* **nint to sbyte (explicit numeric conversion):** Converts a native-sized signed integer to an 8-bit signed integer (`sbyte`). Requires an explicit cast because the `nint` value may be outside the range of `-128` to `127`.
* **nint to byte (explicit numeric conversion):** Converts a native-sized signed integer to an 8-bit unsigned integer (`byte`). Requires an explicit cast because `nint` can represent negative numbers or values larger than `255`.
* **nint to short (explicit numeric conversion):** Converts a native-sized signed integer to a 16-bit signed integer (`short`). Requires an explicit cast because the source value may exceed the range of `-32,768` to `32,767`.
* **nint to ushort (explicit numeric conversion):** Converts a native-sized signed integer to a 16-bit unsigned integer (`ushort`). Requires an explicit cast because `nint` can hold negative numbers or values larger than `65,535`.
* **nint to int (explicit numeric conversion):** Converts a native-sized signed integer to a 32-bit signed integer (`int`). On 64-bit architectures, `nint` is 64 bits wide; therefore, narrowing it to 32-bit `int` requires an explicit cast and can truncate high bits or overflow.
* **nint to uint (explicit numeric conversion):** Converts a native-sized signed integer to a 32-bit unsigned integer (`uint`). Requires an explicit cast to handle potential negative values or 64-bit overflow on 64-bit systems.
* **nint to ulong (explicit numeric conversion):** Converts a native-sized signed integer to a 64-bit unsigned integer (`ulong`). Requires an explicit cast because `nint` can hold negative numbers (which cannot be represented by unsigned types).
* **nint to nuint (explicit numeric conversion):** Converts a native-sized signed integer (`nint`) to a native-sized unsigned integer (`nuint`). Requires an explicit cast because `nint` can contain negative values that are invalid for unsigned native integers.
* **nint to char (explicit numeric conversion):** Converts a native-sized signed integer to a 16-bit UTF-16 code unit (`char`). Requires an explicit cast because `nint` can be negative or exceed the `char` range (`0` to `65,535`).

## Cross-item comparison

* **Signed to Unsigned (`nint` to `byte`, `ushort`, `uint`, `ulong`, `nuint`, `char`):** These target types cannot represent negative values. Checked out-of-range integral conversions throw `OverflowException`; unchecked conversions truncate according to language integral-conversion rules.
* **Signed to Signed Narrower/Equal (`nint` to `sbyte`, `short`, `int`):** These target types accommodate negative values but have stricter magnitude boundaries. If the source `nint` exceeds the destination bit-width range, high-order bits are discarded or an overflow occurs depending on the compilation context.
* **Native-Width to Native-Width (`nint` to `nuint`):** Both types share identical memory sizing (pointer-sized), but the destination is unsigned. The explicit conversion is necessary solely to bridge signed and unsigned type domains.

## Examples

> **Note:** The following code snippet is unverified and presented as pseudocode/syntax illustration. Execution results are not guaranteed without a test runtime environment.

```csharp
// Unverified code example illustrating explicit numeric conversions from nint
nint nativeValue = 300;

// Explicit conversion from nint to short
short s = (short)nativeValue;

// Explicit conversion from nint to byte
// Note: 300 exceeds byte.MaxValue (255)
byte b = (byte)nativeValue;

// Explicit conversion from nint to uint
uint ui = (uint)nativeValue;
```

## Common mistakes

* **Omitting the explicit cast operator:** Attempting to assign a `nint` variable directly to an `int`, `short`, or `byte` variable without parentheses (e.g., `int x = nativeValue;`) results in a compile-time error because implicit narrowing or sign changes are not permitted for `nint`.
* **Assuming platform safety:** Forgetting that `nint` is 64-bit on 64-bit platforms and 32-bit on 32-bit platforms. Code that appears safe during testing on a 64-bit machine might truncate data when executed on a 32-bit architecture if bounds are not validated beforehand.
* **Ignoring negative values in unsigned targets:** Casting a negative `nint` value to `byte`, `ushort`, `uint`, `ulong`, `nuint`, or `char` without checking for sign validity, checked conversion throws if out of range; unchecked conversion truncates according to language rules.

## Knowledge checks with answers

1. **Question:** Why does converting a `nint` to an `int` require an explicit cast?
   * **Answer:** Because on 64-bit architectures, `nint` is 64 bits wide, making the conversion a narrowing operation that could potentially truncate data or overflow a 32-bit `int`.
2. **Question:** What kind of conversion is required to change a `nint` into a `byte`?
   * **Answer:** An explicit numeric conversion [1].
3. **Question:** Can a `nint` be implicitly converted to a `nuint`?
   * **Answer:** No. Conversions between signed and unsigned native integers (`nint` to `nuint`) require explicit casting because `nint` can contain negative values.

## Sources
* [Microsoft Learn: Numeric conversions reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions) [1]
* [Microsoft Learn: Integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types)
* [Microsoft Learn: C# Language Specification - Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/conversions)
