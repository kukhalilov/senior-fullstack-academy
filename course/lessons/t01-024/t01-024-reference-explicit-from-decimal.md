
# C# numeric literals and numeric conversions — Reference: decimal explicit numeric conversions

# Scope and version
* **Topic:** C# numeric literals and numeric conversions — specifically, the `decimal explicit numeric conversions` inventory group ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **Target Audience:** Self-study learners seeking exact reference details on casting `decimal` values to other primitive types.
* **Edition and Timeline:** C# 15 / .NET 11 General Availability (GA) numeric conversions and .NET 9 behavior; checked 2026-11-20 ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **Scope Boundary:** This reference covers only the named explicit conversions originating from `decimal`. Nonnumeric conversions, widening conversions, parsing APIs, and other source types are excluded ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

---

# How this group fits the mental model
In C#, when you work with high-precision financial or currency data, you typically use the `decimal` type. However, other parts of an application or library may require integral types (`int`, `long`, `byte`, etc.) or lighter-weight floating-point types (`float`, `double`).

Because converting a `decimal` to another primitive type can result in a loss of fractional precision, range overflow, or fractional truncation, C# requires an **explicit numeric conversion** (a cast). This tells the compiler that you, the developer, accept responsibility for potential data truncation or overflow behavior ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

---

# Supplied names explained

* **decimal to sbyte (explicit numeric conversion):** Casts a `decimal` to an 8-bit signed integer. Fractional digits are truncated toward zero. Throws `OverflowException` if the truncated result is outside [-128, 127], regardless of `checked` or `unchecked` ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to byte (explicit numeric conversion):** Casts a `decimal` to an 8-bit unsigned integer, truncating fractional digits toward zero. Throws `OverflowException` if the truncated result is outside [0, 255], regardless of `checked` or `unchecked` ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to short (explicit numeric conversion):** Casts a `decimal` to a 16-bit signed integer, truncating toward zero. Throws `OverflowException` if the truncated result is outside [-32768, 32767], regardless of `checked` or `unchecked` ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to ushort (explicit numeric conversion):** Casts a `decimal` to a 16-bit unsigned integer, truncating toward zero. Throws `OverflowException` if the truncated result is outside [0, 65535], regardless of `checked` or `unchecked` ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to int (explicit numeric conversion):** Casts a `decimal` to a 32-bit signed integer, truncating fractional digits toward zero. Throws `OverflowException` if the truncated result is outside the `int` range, regardless of `checked` or `unchecked` ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to uint (explicit numeric conversion):** Casts a `decimal` to a 32-bit unsigned integer, truncating toward zero. Throws `OverflowException` if the truncated result is outside the `uint` range, regardless of `checked` or `unchecked` ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to long (explicit numeric conversion):** Casts a `decimal` to a 64-bit signed integer, truncating toward zero. Throws `OverflowException` if the truncated result is outside the `long` range, regardless of `checked` or `unchecked` ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to ulong (explicit numeric conversion):** Casts a `decimal` to a 64-bit unsigned integer, truncating toward zero. Throws `OverflowException` if the truncated result is outside the `ulong` range, regardless of `checked` or `unchecked` ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to nint (explicit numeric conversion):** Casts a `decimal` to a native 32-bit or 64-bit signed integer depending on the platform architecture, truncating toward zero ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to nuint (explicit numeric conversion):** Casts a `decimal` to a native 32-bit or 64-bit unsigned integer depending on the platform architecture, truncating toward zero ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **decimal to float (explicit numeric conversion):** Casts a `decimal` to a single-precision floating-point number. May cause a loss of precision because `float` has fewer significant digits than `decimal`. In .NET 11, conversions between decimal and float or double are correctly rounded from the exact source value ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions), [Microsoft Learn .NET 11 Core Libraries Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/11/decimal-biginteger-floating-point-conversions)).
* **decimal to double (explicit numeric conversion):** Casts a `decimal` to a double-precision floating-point number. May incur precision adjustments. In .NET 11, conversions between decimal and float or double are correctly rounded from the exact source value ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions), [Microsoft Learn .NET 11 Core Libraries Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/11/decimal-biginteger-floating-point-conversions)).
* **decimal to char (explicit numeric conversion):** Casts a `decimal` to a 16-bit Unicode character (`char`), truncating fractional parts and converting the resulting integral value to its corresponding character representation ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

---

# Cross-item comparison

* **Integral Targets (`sbyte` through `nuint`, `char`) vs. Floating-Point Targets (`float`, `double`):**
  Conversions from `decimal` to integral targets round toward zero. Conversions to `float` or `double` round to the nearest target value and can lose precision or range; .NET 11 correctly rounds from the exact decimal source value ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **Checked vs. Unchecked Explicit Numeric Conversions:**
  When converting `decimal` to an integral type, the fractional part is rounded toward zero and an out-of-range result always throws `OverflowException`, including in an `unchecked` context. This differs from some floating-point-to-integral conversions. ([Microsoft Learn C# Keywords - Checked and Unchecked](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked)).

---

# Examples

```csharp
using System;

decimal moneyValue = 123.45m;

// Truncates fractional part for integral targets
int intVal = (int)moneyValue; // intVal becomes 123
char charVal = (char)65m;     // charVal becomes 'A'

// Converts to floating-point representations with precision handling (.NET 11 correctly rounded)
float floatVal = (float)moneyValue;   // floatVal becomes 123.45f
double doubleVal = (double)moneyValue; // doubleVal becomes 123.45d

// Decimal-to-integral overflow throws even in an unchecked context.
decimal outOfRange = 1000m;
try
{
    unchecked
    {
        byte tinyVal = (byte)outOfRange; // Throws OverflowException because 1000 exceeds byte.MaxValue
    }
}
catch (OverflowException)
{
    Console.WriteLine("The value is outside the byte range.");
}
```

---

# Common mistakes
* **Assuming implicit conversion from decimal:** Trying to assign a `decimal` variable directly to an `int` or `float` without an explicit cast operator causes a compile-time error ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **Ignoring truncation toward zero:** Expecting rounding (such as 0.9 turning into 1) when casting a `decimal` to an integer type. Explicit numeric conversions always truncate toward zero, meaning `1.9m` becomes `1` and `-1.9m` becomes `-1` ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

---

# Knowledge checks with answers

1. **Question:** What happens to the fractional component `.99` when you perform an explicit conversion from `decimal` to `int`?
   * **Answer:** The fractional component is truncated toward zero ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
2. **Question:** Why is an explicit cast required when converting a `decimal` value to a `long`?
   * **Answer:** Because the conversion can cause a loss of precision (via truncation) or throw an overflow exception if the value is outside the range of `long`, requiring the developer to explicitly acknowledge responsibility ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
3. **Question:** In .NET 11, how are conversions between `decimal` and `float` or `double` handled regarding rounding?
   * **Answer:** They are correctly rounded from the exact source value ([Microsoft Learn .NET 11 Core Libraries Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/11/decimal-biginteger-floating-point-conversions)).
