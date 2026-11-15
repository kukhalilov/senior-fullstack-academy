<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: Implicit numeric conversions from char

# Scope and version

* **Edition & Checked Date:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-14 ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **Topic Scope:** This reference lesson covers the exact inventory group of implicit numeric conversions originating from the `char` type, explaining their role within broader C# numeric literal and conversion concepts.
* **Automatic Draft Notice:** This document is an automatically generated draft.

# How this group fits the mental model

In C#, numeric types and characters share a close relationship at the binary representation level. A `char` value represents a 16-bit UTF-16 code unit. Because a `char` holds a UTF-16 code-unit value, C# allows certain widening operations to happen automatically without explicit casting. 

When you assign or operate on a `char` value alongside wider numeric types, the compiler can widen the 16-bit unsigned value into larger integral or floating-point representations safely, without losing magnitude or precision. This group of implicit conversions ensures that `char` data can flow naturally into mathematical expressions or wider storage types.

# Supplied names explained

* **char to ushort (implicit numeric conversion):** Promotes a 16-bit unsigned character code into a 16-bit unsigned integer type (`ushort`), which shares the exact same bit width and range.
* **char to int (implicit numeric conversion):** Widens a 16-bit unsigned character code into a 32-bit signed integer (`int`), preventing overflow since the source range fits entirely within a positive signed 32-bit integer.
* **char to uint (implicit numeric conversion):** Widens a 16-bit unsigned character code into a 32-bit unsigned integer (`uint`).
* **char to nint (implicit numeric conversion):** Converts a 16-bit unsigned character code into a native-sized signed integer (`nint`), which matches the pointer size of the execution target (32-bit or 64-bit).
* **char to nuint (implicit numeric conversion):** Converts a 16-bit unsigned character code into a native-sized unsigned integer (`nuint`).
* **char to long (implicit numeric conversion):** Widens a 16-bit unsigned character code into a 64-bit signed integer (`long`).
* **char to ulong (implicit numeric conversion):** Widens a 16-bit unsigned character code into a 64-bit unsigned integer (`ulong`).
* **char to float (implicit numeric conversion):** Converts a 16-bit unsigned character code into a single-precision 32-bit floating-point type (`float`).
* **char to double (implicit numeric conversion):** Converts a 16-bit unsigned character code into a double-precision 64-bit floating-point type (`double`).
* **char to decimal (implicit numeric conversion):** Converts a 16-bit unsigned character code into a 128-bit high-precision financial/decimal type (`decimal`).

# Cross-item comparison

Within this inventory group, all conversions share a common source (`char`) but target different integer and floating-point representations ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)):

* **To 16-bit (`ushort`):** Retains identical bit-width and range characteristics.
* **To Signed/Unsigned 32-bit and 64-bit (`int`, `uint`, `nint`, `nuint`, `long`, `ulong`):** Widens the container to accommodate larger arithmetic operations. Signed targets succeed because the maximum value of a `char` fits safely inside positive signed limits.
* **To Floating-Point and Decimal (`float`, `double`, `decimal`):** Transforms an exact integer code point into a real-number representation, useful when characters participate in mixed-type mathematical calculations.

# Examples

```csharp
// Unverified code example illustrating implicit conversions from char
char letter = 'A';

ushort asUshort = letter;       // char to ushort (implicit numeric conversion)
int asInt = letter;             // char to int (implicit numeric conversion)
uint asUint = letter;           // char to uint (implicit numeric conversion)
nint asNint = letter;           // char to nint (implicit numeric conversion)
nuint asNuint = letter;         // char to nuint (implicit numeric conversion)
long asLong = letter;           // char to long (implicit numeric conversion)
ulong asUlong = letter;         // char to ulong (implicit numeric conversion)
float asFloat = letter;         // char to float (implicit numeric conversion)
double asDouble = letter;       // char to double (implicit numeric conversion)
decimal asDecimal = letter;     // char to decimal (implicit numeric conversion)
```

*Expected behavior:* Each assignment compiles without explicit cast syntax because the compiler recognizes that no data loss or range violation can occur when converting a 16-bit `char` to these specific wider destinations.

# Common mistakes

* **Treating `char` as a string:** Trying to apply these implicit numeric conversions directly to multi-character string literals (e.g., `"A"`) will fail to compile, because numeric conversions apply strictly to the `char` type.
* **Assuming reverse implicit convertibility:** While a `char` converts implicitly *to* `int`, `long`, or `double`, an integer or floating-point type can never convert implicitly *back* to a `char`. Reverse conversions require explicit casts because larger numbers or negative values cannot fit safely into a 16-bit unsigned character container.

# Knowledge checks with answers

1. **Question:** Why is an explicit cast (such as `(int)myChar`) unnecessary when assigning a `char` to an `int` variable?
   * **Answer:** Because C# defines an implicit numeric conversion from `char` to `int`, allowing the compiler to perform the widening conversion safely and automatically ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
2. **Question:** Can you implicitly convert a 32-bit signed integer (`int`) back into a `char` using the rules of this inventory group?
   * **Answer:** No. Implicit numeric conversions from `char` are one-way (source is `char`). Converting wider numeric types back to `char` requires explicit handling because of potential range violations.
