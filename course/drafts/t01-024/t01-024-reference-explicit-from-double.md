<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: double explicit numeric conversions

# Scope and version

* Automatically generated draft.
* **Scope:** This reference lesson covers explicit numeric conversions from `double` to other numeric types in C#, as defined by the C# 15 / .NET 11 GA environment (checked 2026-11-20).
* **Source Authority:** Microsoft Learn C# numeric literal, numeric conversion, and numeric type references ([Source Snapshot](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **Exclusions:** Nonnumeric conversions, implicit conversions, operator catalogs, and parsing APIs are excluded.

# How this group fits the mental model

In C#, numbers occupy different amounts of memory and have different ranges and precisions. A `double` is a 64-bit double-precision floating-point type that can store very large or fractional numbers.

When you want to store a `double` value inside a smaller or fundamentally different numeric type (such as an integer or a `float`), the compiler requires an **explicit numeric conversion** (a cast). This signals that you acknowledge the risk of data loss, precision reduction, or range overflow.

Within the broader topic of numeric conversions, `double` explicit conversions act as boundary bridges. They take a wide, fractional, or potentially out-of-range value and force it into a restricted destination container, subject to runtime rules and context flags.

# Supplied names explained

Every item in this reference inventory represents a specific cast operation from a `double` source to a distinct numeric destination. Because explicit conversions can lose precision or exceed destination limits, each destination type handles out-of-range values according to C# language rules and recent runtime updates.

* **double to sbyte (explicit numeric conversion):** Casts a `double` to a signed 8-bit integer (`sbyte`). In a `checked` context, an out-of-range conversion throws `OverflowException`. In `unchecked`, C# leaves out-of-range results unspecified; .NET 11 documents saturation for small targets on CoreCLR and Native AOT, not Mono ([.NET 11 Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/11/fp-to-small-integer)).
* **double to byte (explicit numeric conversion):** Casts a `double` to an unsigned 8-bit integer (`byte`). The fractional part is truncated toward zero. For unchecked out-of-range conversions have a result unspecified by C#; .NET 11 documents saturation for this small target on CoreCLR and Native AOT, not Mono. Checked out-of-range conversion throws.
* **double to short (explicit numeric conversion):** Casts a `double` to a signed 16-bit integer (`short`), truncating toward zero when the result is in range. Checked out-of-range casts throw; unchecked out-of-range results are unspecified by C#, with .NET 11 saturation documented for CoreCLR/Native AOT.
* **double to ushort (explicit numeric conversion):** Casts a `double` to an unsigned 16-bit integer (`ushort`), truncating toward zero when in range. Checked out-of-range casts throw; unchecked out-of-range results are unspecified by C#, with .NET 11 saturation documented for CoreCLR/Native AOT.
* **double to int (explicit numeric conversion):** Casts a `double` to a signed 32-bit integer (`int`). In a `checked` context, an out-of-range conversion throws `OverflowException`. In `unchecked`, the language result is unspecified; .NET 9 documents saturation for these targets in its specified runtime behavior ([.NET 9 Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/9.0/fp-to-integer)).
* **double to uint (explicit numeric conversion):** Casts a `double` to an unsigned 32-bit integer (`uint`). Truncates fractional values toward zero when in range; unchecked out-of-range results are unspecified by C# and may follow documented runtime-specific saturation behavior. Checked conversion throws.
* **double to long (explicit numeric conversion):** Casts a `double` to a signed 64-bit integer (`long`). Explicitly required because a `double` has a wider exponent range than integer types, even if integer types have more exact precision integers at smaller magnitudes.
* **double to ulong (explicit numeric conversion):** Casts a `double` to an unsigned 64-bit integer (`ulong`). Negative values are out of range for unsigned targets: checked conversion throws; unchecked out-of-range behavior is unspecified by C# and may be runtime-specific. .NET 9 documents saturation for `ulong` on x86/x64.
* **double to nint (explicit numeric conversion):** Casts a `double` to a native-size signed integer (`nint`), which is 32 or 64 bits according to process size. Truncation is toward zero in range; checked out-of-range casts throw.
* **double to nuint (explicit numeric conversion):** Casts a `double` to a native-size unsigned integer (`nuint`). Truncation is toward zero in range; checked out-of-range casts throw, while unchecked out-of-range results are unspecified by C#.
* **double to float (explicit numeric conversion):** Casts a `double` (64-bit) down to a `float` (32-bit single-precision floating-point). This conversion can experience precision loss because a `float` has fewer mantissa bits.
* **double to decimal (explicit numeric conversion):** Casts a `double` to finite-range decimal-scaled `decimal`. .NET 11 correctly rounds from the exact binary source; NaN, infinity, and out-of-range inputs throw, while sufficiently small values can become zero ([.NET 11 Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/11/decimal-biginteger-floating-point-conversions)).
* **double to char (explicit numeric conversion):** Casts a `double` to a 16-bit UTF-16 code unit (`char`). The fractional portion is discarded; an in-range numeric result maps to a code-unit value, not necessarily a complete Unicode scalar.

# Cross-item comparison

To understand how these conversions relate, consider the following structural comparisons derived from C# conversion architecture:

* **To Integer Types (`sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `nint`, `nuint`, `char`):** These conversions drop any fractional component (truncation toward zero) and translate magnitude into discrete whole numbers. They face range limitations and potential overflow or saturation.
* **To Floating-Point / High-Precision Types (`float`, `decimal`):** Unlike integer casts, both conversions round to a representable target. `double` to `float` can underflow to zero or overflow to infinity; `double` to `decimal` can underflow to zero or throw for NaN, infinity, or out-of-range values. .NET 11 correctly rounds from the exact source value ([Source Snapshot](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)).

# Examples

The following code snippets demonstrate explicit conversions from `double` in valid C# syntax. *Note: Unexecuted code example marked as unverified.*

```csharp
// Unverified C# Code Example
double originalDouble = 123.45;

// 1. Converting to integer types (truncates fraction)
int asInt = (int)originalDouble;          // Result: 123
sbyte asSByte = (sbyte)originalDouble;    // Result: 123 (truncates toward zero)

// 2. Converting to single-precision float
float asFloat = (float)originalDouble;    // Result: 123.45f (with potential precision shift)

// 3. Converting to decimal
decimal asDecimal = (decimal)originalDouble; // Result: 123.45m (correctly rounded in .NET 11)

// 4. Converting to char
char asChar = (char)65.99d;               // Result: 'A' (value 65 after truncation)
```

# Common mistakes

* **Expecting implicit conversion:** Writing `int x = 10.5;` will cause a compile-time error because you cannot implicitly convert a `double` to an `int`. You must explicitly cast: `int x = (int)10.5;`.
* **Ignoring precision loss when casting to `float`:** Assuming a 64-bit `double` fits losslessly into a 32-bit `float`. Precision can be truncated because `float` has fewer bits for the fractional mantissa.
* **Forgetting truncation behavior:** Assuming that casting `double` to an integer rounds to the nearest whole number. C# explicit numeric conversions truncate toward zero (e.g., `(int)9.9` becomes `9`, and `(int)-9.9` becomes `-9`).

# Knowledge checks with answers

1. **Question:** What happens to the fractional part of a `double` when you use an explicit numeric conversion to an integer type like `int`?
   * **Answer:** The fractional part is truncated (discarded) toward zero.
2. **Question:** Why does the compiler reject code that assigns a `double` variable directly to a `float` variable without a cast?
   * **Answer:** A `double` has a wider range and greater precision than a `float`, meaning an implicit conversion could cause loss of data or precision, which C# prevents without explicit developer acknowledgment.
3. **Question:** How has runtime behavior for unchecked conversions from `double` to small integer types (like `sbyte` or `short`) evolved on CoreCLR in recent .NET versions?
   * **Answer:** In `checked`, out-of-range values throw. In `unchecked`, results are unspecified by C#; .NET 11 specifies saturating behavior for small targets on CoreCLR and Native AOT, not Mono.
