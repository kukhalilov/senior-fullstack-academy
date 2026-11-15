<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: float implicit numeric conversions

# Scope and version

*Automatically generated draft.*

This reference lesson covers the exact named inventory item: **float to double (implicit numeric conversion)** within C# numeric conversions. 

- **Scope boundary:** This lesson strictly explains the mechanics and implications of converting a single-precision floating-point value (`float`) to a double-precision floating-point value (`double`) implicitly. Nonnumeric conversions, explicit narrowing casts, and parsing APIs are excluded.
- **Edition and checked date:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-14.
- **Reference citation:** [Microsoft Learn Numeric Conversions Table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions) [1].

# How this group fits the mental model

In C#, numbers are represented by different types that trade off memory size, precision, and range. A `float` uses 32 bits of memory, while a `double` uses 64 bits. 

When you move data from a smaller container into a larger container that can safely hold all possible values of the original type without losing magnitude or core representation, C# performs an **implicit numeric conversion**. You do not need to write explicit cast syntax (such as `(double)`) because the compiler guarantees that the operation is safe and loss-free regarding range overflow.

# Supplied names explained

* **float to double (implicit numeric conversion):** An automatic, compiler-managed conversion from the 32-bit single-precision type (`System.Single`) to the 64-bit double-precision type (`System.Double`). Because `double` provides a larger exponent range and precision capacity, the source value fits entirely inside the destination format.

# Cross-item comparison

While this lesson focuses on a single inventory item, it sits alongside broader conversion categories defined in C#:

* **Implicit numeric conversion vs. Explicit numeric conversion:** Implicit conversions happen automatically because they are safe and cannot overflow (such as `float` to `double`). Explicit conversions require a cast operator (such as `double` to `float`) because they risk losing precision or overflowing.
* **Binary floating-point conversion vs. Decimal conversion:** Moving between binary floating-point types (`float` and `double`) preserves base-2 approximations, whereas conversions involving `decimal` manage base-10 exact fractional scaling.

# Examples

The following code snippet demonstrates the implicit conversion from `float` to `double`.

```csharp
// Unverified C# code snippet
using System;

class Program
{
    static void Main()
    {
        // Declare a 32-bit single-precision floating-point variable
        float originalFloat = 123.456f;

        // Implicitly convert float to double
        // No explicit cast syntax like (double) is required.
        double convertedDouble = originalFloat;

        Console.WriteLine($"Float value: {originalFloat}");
        Console.WriteLine($"Double value: {convertedDouble}");
    }
}
```

*Expected behavior:* The `float` value is automatically promoted to a `double` type at compile time and runtime without throwing exceptions or requiring explicit syntax.

# Common mistakes

* **Assuming infinite decimal exactness:** While converting `float` to `double` preserves the exact bit pattern value represented by the 32-bit float, binary floating-point representation cannot perfectly express certain base-10 fractions (like `0.1f`). Do not confuse widening a `float` to a `double` with converting a `float` to an exact base-10 `decimal`.
* **Writing redundant casts:** Because the conversion is implicit, writing code like `double d = (double)f;` is unnecessary syntax clutter.

# Knowledge checks with answers

1. **Question:** Why is a cast operator (like `(double)`) unnecessary when assigning a `float` variable to a `double` variable?
   * **Answer:** Because the conversion is an implicit numeric conversion; `double` provides a larger range and precision capacity than `float`, ensuring the compiler can perform the conversion safely without risk of range overflow.

2. **Question:** Does converting a `float` to a `double` convert a base-2 binary approximation into an exact base-10 decimal number?
   * **Answer:** No. It widens the underlying binary floating-point container from 32 bits to 64 bits, but it does not change the inherent nature of binary floating-point representation.

# Sources

* [Microsoft Learn: Built-in numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions) [1]
