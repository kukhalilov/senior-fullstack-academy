<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: Conversion rules and numeric behavior

## Scope and version

**Scope and Version:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior ([Microsoft Learn C# numeric literal, numeric conversion, and numeric type references](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions), checked 2026-11-20).

This reference lesson covers the exact set of conversion rules, promotion behaviors, and special numeric outcomes specified in the inventory group. It is designed for self-study learners seeking to understand how C# transforms numbers between types at compile time and runtime.

---

## How this group fits the mental model

In C#, numeric types have defined ranges and representations. When a number moves between types—or participates in mixed-type arithmetic—the language applies specified conversion and operator rules.

The inventory items in this reference lesson represent the core rules governing that movement:
- **Conversions** dictate whether a data transformation requires explicit programmer approval or happens automatically.
- **Promotions** dictate how mixed-type arithmetic expressions agree on a common operand type.
- **Extensions and Truncation** describe the microscopic bit-level operations that happen when widening or narrowing types.
- **Exceptions and Special Values** (`OverflowException`, `NaN`, `PositiveInfinity`, `NegativeInfinity`) represent boundary conditions when math or range limits are exceeded.

---

## Supplied names explained

*   **Explicit numeric conversion**: A conversion from one numeric type to another where an explicit cast expression (such as `(int)x`) is required because data loss, precision loss, or overflow is possible. Governed by [Microsoft Learn Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions).
*   **Constant-expression conversion**: Certain `int` constant expressions can convert implicitly to specific integral/native-sized types when the value is in range. This is not a general rule for all constants or all targets.
*   **Checked explicit numeric conversion**: An explicit conversion performed within a `checked` context or operator; for integral conversions, an out-of-range result throws `OverflowException`; for floating-point-to-integral conversions, checked conversions throw. Saturating behavior described for unchecked conversions is runtime- and target-specific. Documented in [Microsoft Learn Checked and Unchecked](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked).
*   **Unchecked explicit numeric conversion**: An explicit conversion performed within an `unchecked` context where overflow checking is disabled. Integral-to-integral conversions discard bits according to the language rules; floating-point-to-integral out-of-range results are unspecified by the language, with documented runtime-specific behavior. Documented in [Microsoft Learn Checked and Unchecked](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked).
*   **Integral numeric promotion**: The automatic promotion of smaller integral types (`sbyte`, `byte`, `short`, `ushort`, and `char`) to `int` (or larger types like `uint`, `long`, or `ulong`) before performing unary or binary operations, as detailed in [Microsoft Learn Integral Numeric Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types).
*   **Floating-point numeric promotion**: The automatic promotion rule in binary operations involving floating-point types, where a `float` operand is promoted to `double` if another operand is `double`; `decimal` cannot be mixed with `float` or `double` without an explicit conversion, as outlined in [Microsoft Learn Floating-Point Numeric Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types).
*   **Sign extension**: A bit-level operation used when widening a signed integral type (like `sbyte` or `short`) to a larger type, preserving the negative sign by filling the new upper bits with copies of the sign bit.
*   **Zero extension**: A bit-level operation used when widening an unsigned integral type (or `char`) to a larger type, filling all newly added upper bits with zeros.
*   **Truncation toward zero**: The standard behavior when casting a floating-point type to an integral type where any fractional part is discarded entirely (e.g., `1.9` becomes `1`, and `-1.9` becomes `-1`).
*   **OverflowException**: A runtime exception thrown during a checked numeric conversion or arithmetic operation when the result exceeds the boundaries of the destination type.
*   **NaN**: Stands for "Not a Number," a special IEEE 754 floating-point value resulting from undefined operations (such as `0.0 / 0.0`), referenced in [Microsoft Learn Floating-Point Numeric Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types).
*   **PositiveInfinity**: An IEEE 754 special value representing positive infinity; it can result from floating-point overflow or positive nonzero floating-point division by zero. `double.MaxValue` is the greatest finite `double`, not a threshold defining infinity as an ordinary number.
*   **NegativeInfinity**: An IEEE 754 special value representing negative infinity; it can result from floating-point overflow or negative nonzero floating-point division by zero. `double.MinValue` is the most negative finite `double`.

---

## Cross-item comparison

| Item A | Item B | Key Difference |
| :--- | :--- | :--- |
| **Explicit numeric conversion** | *Constant-expression conversion* | Standard explicit conversions always require a cast syntax in code; constant-expression conversions allow compile-time literal values to convert implicitly if they fit the target range. |
| **Checked explicit numeric conversion** | **Unchecked explicit numeric conversion** | Checked integral conversions throw on overflow; unchecked integral conversions truncate according to the language rules. Floating-point conversions have distinct rules, including runtime-specific behavior for unchecked out-of-range values. |
| **Sign extension** | **Zero extension** | Sign extension replicates the most significant bit (preserving negative values for signed types), while zero extension always pads upper bits with `0` (used for unsigned types). |
| **Integral numeric promotion** | **Floating-point numeric promotion** | Integral promotion follows C# operator rules (small integral operands commonly become `int`); it is not specified as a CPU word-alignment optimization. Floating-point expressions follow separate rules, and `decimal` cannot mix with binary floating-point types. |
| **NaN** | **PositiveInfinity / NegativeInfinity** | `NaN` is a special IEEE 754 value for an undefined numeric result; positive and negative infinity are distinct special values. Neither is an ordinary finite number. |

---

## Examples

The following code blocks illustrate these conversion and promotion rules in valid C#. *(Note: Unexecuted code examples are marked as unverified).*

```csharp
// Unverified example: Integral numeric promotion and sign vs zero extension
sbyte smallSigned = -10;
int promotedSigned = smallSigned; // Uses sign extension; promotedSigned is -10 (all upper bits set to 1)

byte smallUnsigned = 250;
int promotedUnsigned = smallUnsigned; // Uses zero extension; promotedUnsigned is 250 (upper bits set to 0)
```

```csharp
// Unverified example: Floating-point truncation and special values
double originalValue = 1.99;
int truncated = (int)originalValue; // Truncation toward zero: truncated equals 1

double invalidDivision = 0.0 / 0.0; // Produces NaN
bool isNotANumber = double.IsNaN(invalidDivision); // True
```

---

## Common mistakes

*   **Assuming one unchecked-conversion rule:** `(byte)1000` in an unchecked integral conversion follows language-defined low-bit truncation. Unchecked floating-point-to-integral out-of-range behavior is unspecified by C# and has runtime/version-specific documented saturation; decimal-to-integral overflow throws even in unchecked context.
*   **Confusing truncation with rounding:** When casting `double` to `int` via **Truncation toward zero**, `3.9` becomes `3`, not `4`. It drops the fractional component rather than rounding to the nearest integer.
*   **Ignoring runtime version discrepancies in floating-point casts:**
    *   Starting in .NET 9, .NET documents saturation for unchecked floating-point conversions to `int`, `uint`, `long`, and `ulong` on x86 and x64; this is not a C# language guarantee ([Microsoft Learn .NET 9 breaking change: FP-to-integer conversions](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/9.0/fp-to-integer)).
    *   Starting with .NET 11, unchecked `float`/`double` conversions to `sbyte`, `byte`, `short`, `ushort`, and `char` saturate on CoreCLR and Native AOT; the change does not apply to Mono ([Microsoft Learn .NET 11 breaking change: FP to small integer conversions](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/11/fp-to-small-integer)). Assuming uniform behavior across Mono and CoreCLR/Native AOT in .NET 11 for small-integer floating-point casting can introduce platform-dependent bugs.

---

## Knowledge checks with answers

1. **Question:** What bit-level extension strategy is applied when widening an unsigned `byte` to an `int`?
   * **Answer:** **Zero extension**, because unsigned types pad all newly added upper bits with zeros.

2. **Question:** What is the result of casting `-1.9` to an integer (`int`) in C#?
   * **Answer:** `-1`. C# uses **Truncation toward zero**, completely discarding the fractional component.

3. **Question:** Under .NET 11 rules on CoreCLR, what happens when you perform an unchecked floating-point conversion to a `byte` with a value far exceeding `Byte.MaxValue`?
   * **Answer:** The value **saturates to destination bounds** (clamping to the maximum allowable value for `byte`), per the CoreCLR/Native AOT runtime update (note that Mono is excluded from this behavior change) ([Microsoft Learn .NET 11 breaking change: FP to small integer conversions](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/11/fp-to-small-integer)).

4. **Question:** Which special floating-point constant represents the result of dividing a non-zero positive number by `0.0`?
   * **Answer:** `PositiveInfinity`.
