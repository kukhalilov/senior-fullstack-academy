<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: float explicit numeric conversions

# Scope and version

*Automatic draft. Not independently verified.*

This reference lesson covers the exact group of C# numeric conversions starting from the `float` type to other primitive numeric and character types, as defined for C# 15 / .NET 11 GA ([Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

**Scope Boundaries:**
* **Included:** Explicit conversions from `float` to `sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `nint`, `nuint`, `decimal`, and `char`.
* **Excluded:** Implicit conversions, reference conversions, boxing, user-defined conversions, nonnumeric conversions, arithmetic operator catalogs, and parsing/formatting APIs.

---

# How this group fits the mental model

In C#, numeric types range from single-precision binary floating-point numbers (`float`) to whole numbers of varying sizes (`sbyte`, `byte`, `short`, `ushort`, `int`, `uint`, `long`, `ulong`, `nint`, `nuint`), character representations (`char`), and high-precision decimal fractions (`decimal`).

Because a `float` can represent fractional values and much wider or narrower numeric ranges than integer types or `char`, these conversions are **explicit**. They require a cast operator (`(targetType)value`) to signal caller responsibility. When converting, you cross the boundary from an approximate binary floating-point format into fixed-range integers, precise decimals, or UTF-16 code units. For floating-point-to-integral conversions, checked out-of-range values throw; unchecked out-of-range results are unspecified by C#. Documented .NET 9 and .NET 11 runtime changes add saturating behavior for specific targets and runtimes.

---

# Supplied names explained

Every item in this reference group is an **explicit numeric conversion** originating from a `float` value.

* **`float to sbyte (explicit numeric conversion)`**: Converts a single-precision floating-point value to a signed 8-bit integer (`sbyte`). Fractional parts are truncated toward zero. In a checked context, an out-of-range conversion throws; unchecked out-of-range behavior is unspecified by C#, with runtime-specific saturation documented for certain targets in .NET 9 and .NET 11.
* **`float to byte (explicit numeric conversion)`**: Converts a `float` to an unsigned 8-bit integer (`byte`), truncating any fractional component toward zero.
* **`float to short (explicit numeric conversion)`**: Converts a `float` to a signed 16-bit integer (`short`), truncating the fractional part toward zero.
* **`float to ushort (explicit numeric conversion)`**: Converts a `float` to an unsigned 16-bit integer (`ushort`), discarding fractional digits toward zero.
* **`float to int (explicit numeric conversion)`**: Converts a `float` to a signed 32-bit integer (`int`), truncating toward zero.
* **`float to uint (explicit numeric conversion)`**: Converts a `float` to an unsigned 32-bit integer (`uint`), truncating toward zero.
* **`float to long (explicit numeric conversion)`**: Converts a `float` to a signed 64-bit integer (`long`), truncating toward zero.
* **`float to ulong (explicit numeric conversion)`**: Converts a `float` to an unsigned 64-bit integer (`ulong`), truncating toward zero.
* **`float to nint (explicit numeric conversion)`**: Converts a `float` to a native-sized signed integer (`nint`, 32-bit on 32-bit platforms, 64-bit on 64-bit platforms), truncating toward zero.
* **`float to nuint (explicit numeric conversion)`**: Converts a `float` to a native-sized unsigned integer (`nuint`), truncating toward zero.
* **`float to decimal (explicit numeric conversion)`**: Converts a `float` to finite-range decimal-scaled `decimal`. .NET 11 correctly rounds from the exact binary source value, but cannot restore decimal information absent from the float; NaN/infinity and out-of-range values throw, while sufficiently small values can become zero ([Microsoft Learn .NET 11 Core Libraries Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/11/decimal-biginteger-floating-point-conversions)).
* **`float to char (explicit numeric conversion)`**: Converts the numeric value to a UTF-16 code unit through the explicit numeric conversion rules. Fractions are truncated toward zero when in range; out-of-range behavior depends on checked context and runtime version.

---

# Cross-item comparison

* **Integer targets (`sbyte` through `nuint`) vs. `char`**: Integer conversions map the numeric magnitude (with truncation toward zero). The `char` conversion similarly treats the intermediate integer as a UTF-16 code unit.
* **Signed vs. Unsigned integer targets**: Signed targets (`sbyte`, `short`, `int`, `long`, `nint`) accept negative `float` inputs, whereas unsigned targets (`byte`, `ushort`, `uint`, `ulong`, `nuint`) handle negative numbers differently depending on runtime settings and checked contexts.
* **`decimal` target vs. Integer targets**: `float` to `decimal` rounds to the representable decimal range and may throw or become zero at extremes. In-range float-to-integral conversions truncate toward zero.

---

# Examples

*Unverified code example (not executed).*

```csharp
float fValue = 123.75f;

// Truncates fractional part toward zero
int iResult = (int)fValue; // 123

// Conversion to decimal rounds the represented float value to decimal precision
decimal decResult = (decimal)fValue; // 123.75m

// Conversion to char treats truncated value as UTF-16 code unit
char cResult = (char)65.9f; // 'A' (65)
```

---

# Common mistakes

* **Expecting automatic rounding**: Explicit conversions to integer types truncate toward zero (`(int)123.9f` becomes `123`, not `124`). Use explicit rounding methods if you need nearest-value rounding.
* **Assuming identical behavior across all historical runtimes**: C# leaves unchecked out-of-range floating-point-to-integral results unspecified. .NET 9 and .NET 11 document saturation for particular target types and runtimes; checked out-of-range casts throw ([Microsoft Learn JIT 9.0 Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/9.0/fp-to-integer), [Microsoft Learn JIT 11 Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/11/fp-to-small-integer)).

---

# Knowledge checks with answers

1. **Question:** What happens to the fractional component of a `float` when you perform an explicit numeric conversion to `int`?
   * **Answer:** The fractional component is truncated toward zero.

2. **Question:** Why are conversions from `float` to integral types classified as explicit numeric conversions rather than implicit conversions?
   * **Answer:** Because a `float` can contain fractional values, wider magnitudes, and special values (like NaN or Infinity) that cannot fit safely into every target integer type without data loss or explicit programmer intent.

3. **Question:** How does converting `float to decimal` differ from converting `float to long`?
   * **Answer:** `float to decimal` retains precision and fractional components in a base-10 format, whereas `float to long` discards the fractional component entirely and fits the value into a 64-bit integer range.
