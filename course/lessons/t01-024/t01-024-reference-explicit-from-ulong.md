
# C# numeric literals and numeric conversions — Reference: ulong explicit numeric conversions

## Scope and version

**Scope:** This reference lesson covers the exact set of explicit numeric conversions originating from the `ulong` type to other integral types in C# (`sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, `nint`, `nuint`, and `char`).

**Scope Exclusions:** All non-numeric conversions, implicit numeric conversions, conversions to `ulong` from other types, floating-point conversions, and general arithmetic operator rules are excluded.

**Version & Edition:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-20 ([Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

---

## How this group fits the mental model

In C#, numeric types have distinct bit widths and signedness. The `ulong` type represents an unsigned 64-bit integer, meaning it can store very large positive numbers.

When you convert a `ulong` value to a smaller or signed integral type, the compiler requires an **explicit numeric conversion** (a cast). This signals that you, the programmer, take responsibility for potential data loss, truncation, or overflow if the `ulong` value exceeds the range of the destination type. Understanding this group helps you choose appropriate cast operations while managing overflow safety and runtime context settings.

---

## Supplied names explained

The inventory group consists of the following ten explicit numeric conversions from `ulong`:

*   **ulong to sbyte (explicit numeric conversion):** Converts an unsigned 64-bit integer to a signed 8-bit integer (`sbyte`). Because an `sbyte` has a much smaller positive range, values exceeding 127 will cause overflow behavior governed by the current checked or unchecked context.
*   **ulong to byte (explicit numeric conversion):** Converts a `ulong` to an unsigned 8-bit integer (`byte`). Values above 255 trigger narrowing overflow rules.
*   **ulong to short (explicit numeric conversion):** Converts a `ulong` to a signed 16-bit integer (`short`). Values exceeding the maximum positive `short` limit require an explicit cast.
*   **ulong to ushort (explicit numeric conversion):** Converts a `ulong` to an unsigned 16-bit integer (`ushort`). High-order bits outside the 16-bit range are truncated or checked depending on context.
*   **ulong to int (explicit numeric conversion):** Converts a `ulong` to a signed 32-bit integer (`int`). Values greater than `int.MaxValue` require explicit handling.
*   **ulong to uint (explicit numeric conversion):** Converts a `ulong` to an unsigned 32-bit integer (`uint`). Narrows the 64-bit unsigned value down to 32 bits.
*   **ulong to long (explicit numeric conversion):** Converts a `ulong` to a signed 64-bit integer (`long`). Because `ulong` allows larger positive magnitudes than `long`, casting a large `ulong` value that exceeds `long.MaxValue` triggers overflow behavior.
*   **ulong to nint (explicit numeric conversion):** Converts a `ulong` to a native-sized signed integer (`nint`), whose size depends on the execution platform (32-bit or 64-bit).
*   **ulong to nuint (explicit numeric conversion):** Converts a `ulong` to a native-sized unsigned integer (`nuint`), matching the pointer size of the target architecture.
*   **ulong to char (explicit numeric conversion):** Converts a `ulong` to a 16-bit UTF-16 code unit (`char`). Values outside `char` range undergo explicit numeric narrowing.

---

## Cross-item comparison

*   **Signed vs. Unsigned Destinations:** Conversions from `ulong` to signed targets (`sbyte`, `short`, `int`, `long`, `nint`) evaluate whether the value fits into the positive half of the signed range. Conversions to unsigned targets (`byte`, `ushort`, `uint`, `nuint`, `char`) utilize the full bit-width capacity for positive values but still truncate or overflow if the source exceeds the destination's maximum bound.
*   **Fixed-Width vs. Native-Width Destinations:** Conversions to fixed-width types (`int`, `uint`) behave identically across all platforms. Conversions to native-width types (`nint`, `nuint`) change their overflow threshold depending on whether the runtime targets a 32-bit or 64-bit architecture.

---

## Examples

The following code snippet demonstrates explicit casts from `ulong` to members of this inventory group.

*Note: Unexecuted code example; verify behavior in your specific runtime environment.*

```csharp
ulong largeVal = 300_000UL;

// Explicit conversion to ushort (exceeds ushort.MaxValue = 65,535)
ushort asUshort = (ushort)largeVal; // Unchecked by default, results in bit truncation

// Explicit conversion to uint (fits within uint.MaxValue)
uint asUint = (uint)largeVal;

// Explicit conversion to long
long asLong = (long)largeVal;
```

---

## Common mistakes

*   **Omitting the Cast Operator:** Attempting to assign a `ulong` variable to an `int` or `ushort` variable without an explicit cast (`(int)`) causes a compile-time error because data loss is possible.
*   **Assuming Silent Safety:** Forgetting that large `ulong` values are truncated in unchecked integral conversions and throw `OverflowException` in checked conversions when casting to smaller signed types like `sbyte` or `short`.

---

## Knowledge checks with answers

1. **Question:** Why does converting a `ulong` to an `int` require an explicit cast rather than an implicit conversion?
   * **Answer:** Because `ulong` can represent much larger numbers than `int`, an implicit conversion would risk hidden data loss. An explicit cast forces the developer to acknowledge this risk.
2. **Question:** Does the conversion from `ulong` to `nuint` behave identically on 32-bit and 64-bit systems?
   * **Answer:** No. The destination type `nuint` matches the platform's pointer size (32 bits or 64 bits), which changes the point at which an overflow occurs.
