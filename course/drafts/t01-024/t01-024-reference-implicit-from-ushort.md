<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: ushort implicit numeric conversions

# Scope and version

* **Topic:** C# numeric literals and numeric conversions (`ushort` implicit numeric conversions)
* **Edition / Snapshot:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-17 ([Microsoft Learn Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **Automatic Generation Notice:** This is an automatically generated draft.
* **Scope Boundary:** This reference lesson covers only the exact set of implicit numeric conversions originating from the `ushort` type as defined in the inventory group. All other conversions, literal formatting options, and operators are excluded.

# How this group fits the mental model

In C#, numeric types have differing bit widths, signs, and ranges. When you assign a numeric value from one type to another, the compiler must guarantee that the operation is safe—meaning no unexpected loss of magnitude or precision occurs.

An **implicit numeric conversion** is performed automatically by the compiler without requiring an explicit cast syntax (such as `(int)`). The `ushort` type represents an unsigned 16-bit integer, spanning values from $0$ to $65,535$. Because larger integer types, floating-point types, and the native unsigned integer type (`nuint`) can fully represent every possible value of a 16-bit unsigned integer without overflow, the language permits widening conversions automatically. Understanding these conversions helps you select appropriate variable targets and design clean, warning-free mathematical expressions.

# Supplied names explained

* **ushort to int (implicit numeric conversion):** Promotes a 16-bit unsigned value to a 32-bit signed integer (`int`). Because the maximum value of `ushort` ($65,535$) easily fits within the positive range of a signed 32-bit integer (up to over 2 billion), this conversion is entirely safe and requires no explicit cast.
* **ushort to uint (implicit numeric conversion):** Promotes a 16-bit unsigned value to a 32-bit unsigned integer (`uint`). Both types are unsigned, and the destination range is strictly larger, preventing any range overflow.
* **ushort to long (implicit numeric conversion):** Promotes a 16-bit unsigned value to a 64-bit signed integer (`long`). This widening step places the small unsigned value into a much larger signed container.
* **ushort to ulong (implicit numeric conversion):** Promotes a 16-bit unsigned value to a 64-bit unsigned integer (`ulong`). This maps the 16-bit range directly into the broad 64-bit unsigned numeric space.
* **ushort to float (implicit numeric conversion):** Converts a 16-bit unsigned integer to a single-precision floating-point type (`float`). While `float` has a much larger maximum range, very large integer values can experience minor precision approximation, though values originating from a `ushort` convert precisely.
* **ushort to double (implicit numeric conversion):** Converts a 16-bit unsigned integer to a double-precision floating-point type (`double`). The `double` type provides greater precision and range than `float`, safely accommodating all `ushort` values.
* **ushort to decimal (implicit numeric conversion):** Converts a 16-bit unsigned integer to a high-precision 128-bit decimal type (`decimal`). This is particularly useful in financial or high-accuracy contexts where binary floating-point rounding is undesirable.
* **ushort to nuint (implicit numeric conversion):** Promotes a 16-bit unsigned integer to a native-size unsigned integer (`nuint`), whose size corresponds to the platform's pointer size (32-bit on 32-bit architectures, 64-bit on 64-bit architectures). Because native unsigned integers are at least 32 bits wide, a 16-bit `ushort` fits safely.

# Cross-item comparison

* **Implicit vs. Explicit conversions:** All items in this inventory are *implicit*, meaning the C# compiler handles them automatically during assignment or method invocation. By contrast, converting from a larger type back to `ushort` requires an *explicit* numeric conversion (cast) because data loss or overflow can occur.
* **Integer expansion (`int`, `uint`, `long`, `ulong`, `nuint`) vs. Fractional representation (`float`, `double`, `decimal`):** Converting to larger integer types preserves exact integer values through zero extension or sign extension models. Converting to floating-point or decimal types maps the integer onto a real-number representation, where binary types (`float`, `double`) use base-2 scientific notation and `decimal` uses base-10 scaling.

# Examples

```csharp
// Unverified code example demonstrating implicit numeric conversions from ushort
ushort originalValue = 1000;

// Integer promotions
int toInt = originalValue;           // ushort to int (implicit numeric conversion)
uint toUint = originalValue;         // ushort to uint (implicit numeric conversion)
long toLong = originalValue;         // ushort to long (implicit numeric conversion)
ulong toUlong = originalValue;       // ushort to ulong (implicit numeric conversion)
nuint toNuint = originalValue;       // ushort to nuint (implicit numeric conversion)

// Real and decimal number conversions
float toFloat = originalValue;       // ushort to float (implicit numeric conversion)
double toDouble = originalValue;     // ushort to double (implicit numeric conversion)
decimal toDecimal = originalValue;   // ushort to decimal (implicit numeric conversion)
```

*Expected behavior:* The compiler compiles all assignments successfully without warning or cast annotations, because every target type can accommodate the entire domain of `ushort`.

# Common mistakes

* **Confusing implicit widening with narrowing conversions:** Assuming that because `ushort` can implicitly convert *to* larger types, larger types can implicitly convert *back* to `ushort`. Attempting to assign an `int` or `double` directly to a `ushort` variable causes a compile-time error because it is a narrowing operation requiring an explicit conversion.
* **Assuming floating-point conversions are identical to decimal conversions:** While both `float` and `decimal` are valid implicit targets for `ushort`, `decimal` maintains exact base-10 precision suitable for currency, whereas `float` uses binary approximation.

# Knowledge checks with answers

1. **Question:** Why does assigning a `ushort` variable to an `int` variable require no explicit cast syntax?
   * **Answer:** Because it is an implicit numeric conversion (`ushort to int (implicit numeric conversion)`) where the destination type's range fully encompasses all possible values of a `ushort`.
2. **Question:** Is it valid to assign a `ushort` value directly to a `decimal` variable without a cast?
   * **Answer:** Yes, via `ushort to decimal (implicit numeric conversion)`, because the compiler permits widening conversions to high-precision decimal formats automatically.
3. **Question:** What kind of conversion is required to go in the reverse direction—from `int` back to `ushort`?
   * **Answer:** An explicit conversion (cast) is required because values in an `int` may exceed the maximum bounds of a `ushort`.
