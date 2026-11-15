<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: long implicit numeric conversions

*Automatically generated draft.*

# Scope and version
This lesson covers the implicit numeric conversions from the `long` type to floating-point and decimal types in C# 15 / .NET 11. It focuses on how these conversions allow safe assignment and operation without data loss of magnitude, though precision loss may occur. This content is current as of the .NET 11 GA release (checked 2026-11-14).

Source: [Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)

# How this group fits the mental model
In C#, numeric types have different ranges and precision. An "implicit conversion" is a safe operation performed automatically by the compiler because the target type can represent the source value without overflow. When moving from a `long` (a 64-bit integer) to floating-point types (`float`, `double`) or `decimal`, the compiler allows the conversion because these types can accommodate the magnitude of a `long`.

# Supplied names explained

* **long to float (implicit numeric conversion)**: Converts a 64-bit signed integer to a single-precision 32-bit floating-point number. While the magnitude is preserved, the `float` type has fewer significant digits than a `long`, meaning precision may be lost for very large integers.
* **long to double (implicit numeric conversion)**: Converts a 64-bit signed integer to a double-precision 64-bit floating-point number. This is generally safer than converting to `float` because `double` provides more significant digits.
* **long to decimal (implicit numeric conversion)**: Converts a 64-bit signed integer to a 128-bit decimal type. This is the most precise conversion, as `decimal` is designed for financial and scientific calculations where rounding errors must be minimized.

# Cross-item comparison

| Conversion | Target Type | Precision Characteristics |
| :--- | :--- | :--- |
| `long` to `float` | `float` | Lowest precision; potential for rounding large integers. |
| `long` to `double` | `double` | Higher precision than `float`; standard for general math. |
| `long` to `decimal` | `decimal` | Highest precision; exact representation of the integer. |

Source: [Integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types), [Floating-point numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)

# Examples

```csharp
long myLong = 1234567890123456789L;

// Implicit conversions: no casting required
float myFloat = myLong;     // May lose precision
double myDouble = myLong;   // High precision
decimal myDecimal = myLong; // Exact representation
```

# Common mistakes
* **Assuming precision is always kept**: A common mistake is assuming that because the conversion is "implicit" (safe from overflow), it is also "exact." Converting a very large `long` to a `float` can result in a loss of precision because the `float` type cannot represent every integer value exactly.
* **Ignoring the cost**: While these conversions are implicit, they are not free. Converting to `decimal` is significantly slower than converting to `double` or `float` due to the complexity of the `decimal` type's internal representation.

# Knowledge checks with answers

1. **Question**: Why is `long` to `float` an implicit conversion if it can lose precision?
   * **Answer**: In C#, "implicit" refers to the ability to store the *magnitude* of the value without overflow. The compiler permits it because it is safe from a range perspective, even if the underlying representation (floating-point) differs from the source (integer).

2. **Question**: Which of the three conversions is best for financial calculations?
   * **Answer**: `long` to `decimal` is the best choice because the `decimal` type provides the high precision required for financial data, avoiding the rounding issues inherent in binary floating-point types like `float` and `double`.

3. **Question**: Does the compiler require an explicit cast for `long` to `double`?
   * **Answer**: No. Because `double` can represent the range of a `long`, the conversion is implicit and the compiler handles it automatically.
