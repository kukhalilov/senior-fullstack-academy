
# C# numeric literals and numeric conversions — Reference: ulong implicit numeric conversions

*Draft: Automatically generated.*

# Scope and version
This lesson covers `ulong` implicit numeric conversions in C# 15 / .NET 11. The information is based on the C# language specification and .NET runtime behaviors as of 2026-11-20.

# How this group fits the mental model
The language defines implicit conversions from `ulong` to `float`, `double`, and `decimal`. The floating-point destinations can round some integer values; `decimal` can represent every `ulong` value exactly, though later decimal arithmetic can round or overflow.

# Supplied names explained

*   **ulong to float (implicit numeric conversion)**: Converts a 64-bit unsigned integer to a 32-bit single-precision floating-point number. While `float` has a larger range than `ulong`, it has less precision; therefore, the conversion may result in a loss of precision for very large `ulong` values.
*   **ulong to double (implicit numeric conversion)**: Converts a 64-bit unsigned integer to a 64-bit double-precision floating-point number. This conversion is generally safe, though extremely large `ulong` values may still experience precision loss due to the way floating-point numbers represent values.
*   **ulong to decimal (implicit numeric conversion)**: Converts a 64-bit unsigned integer to a 16-byte decimal-scaled value. The integer is represented exactly because `decimal` can represent every `ulong` value; later decimal arithmetic can still round or overflow.

# Cross-item comparison

| Conversion | Precision Impact | Use Case |
| :--- | :--- | :--- |
| `ulong` to `float` | High risk of precision loss | Performance-sensitive, low-precision math |
| `ulong` to `double` | May lose low-order integer precision for some values | General-purpose scientific calculations |
| `ulong` to `decimal` | No precision loss | Financial or exact-value requirements |

*Source: [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)*

# Examples

```csharp
// Unverified example
ulong myUlong = 1234567890123456789UL;

float f = myUlong;   // Implicit conversion to float
double d = myUlong;  // Implicit conversion to double
decimal m = myUlong; // Implicit conversion to decimal
```

In this example, the compiler automatically handles the conversion. Note that `f` may not hold the exact value of `myUlong` due to the limitations of the `float` type.

# Common mistakes
*   **Assuming exactness**: A common mistake is assuming that converting a `ulong` to a `float` or `double` preserves every digit of the original integer. `decimal` represents every `ulong` value exactly, but it has a bounded range and is not a universal substitute for integer types; use an integer type when integer arithmetic is intended.
*   **Ignoring promotion**: Remember that these are implicit conversions. If you perform arithmetic between a `ulong` and a `float`, the `ulong` will be implicitly promoted to `float` before the operation occurs.

# Knowledge checks with answers

**1. Which target preserves every `ulong` integer value exactly?**
*Answer*: `decimal`; this fact alone doesn't establish the correct type for a financial domain, whose scale and rounding rules determine the representation.

**2. Does an implicit conversion require a cast operator (e.g., `(float)myUlong`)?**
*Answer*: No. This conversion path is defined as implicit; conversion from `ulong` to floating point may still lose precision.

**3. Is it possible to lose precision when converting `ulong` to `float`?**
*Answer*: Yes. A `ulong` can convert to `float` without losing order of magnitude, but `float` cannot represent every `ulong` integer exactly.
