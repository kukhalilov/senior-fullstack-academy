<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Reference: Floating-point and decimal type keywords

*Automatically generated draft.*

# Scope and version
This lesson covers the C# built-in floating-point and decimal type keywords: `float`, `double`, and `decimal`.
*   **Scope:** C# 15 stable on .NET 11 GA.
*   **Reference:** [Microsoft Learn C# built-in types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table).

# How this group fits the mental model
In C#, built-in type keywords are aliases for underlying .NET types. `float`, `double`, and `decimal` have value semantics: a variable of one of these types represents the value itself rather than a reference to a separately allocated object by default. The runtime's physical storage location is an implementation detail and can vary with context.

These types represent numeric values. `float` and `double` use IEEE 754 binary32/binary64; `decimal` uses a 96-bit integer significand scaled by a power of ten and is not an IEEE floating-point format. Choosing involves range, precision, rounding behavior, domain rules, and interoperability.

# Supplied names explained

*   **`float`**: An alias for `System.Single`. It is a 32-bit single-precision floating-point type. It is useful for graphics or scenarios where memory efficiency is prioritized over high precision.
*   **`double`**: An alias for `System.Double`. It is a 64-bit double-precision floating-point type. This is the default type for fractional numbers in C# and offers a balance of range and performance.
*   **`decimal`**: An alias for `System.Decimal`, occupying 16 bytes. It represents values using a 96-bit integer scaled by a power of ten (with sign and scale metadata). Many decimal fractions are exact, but precision and range are finite and arithmetic can round or overflow. It has no NaN or infinity values.

# Cross-item comparison

| Feature | `float` | `double` | `decimal` |
| :--- | :--- | :--- | :--- |
| **Precision** | ~6-9 digits | ~15-17 digits | 28-29 digits |
| **Size** | 4 bytes | 8 bytes | 16 bytes |
| **Typical fit** | Memory-constrained numeric data | General binary floating-point work | Decimal-domain arithmetic when required by domain rules |

*Source: [Floating-point numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)*

# Examples

```csharp
float temperature = 25.5f;    // Requires 'f' suffix
double gravity = 9.81;        // Default for fractional numbers
decimal price = 19.99m;       // Requires 'm' suffix
```

# Common mistakes
1.  **Precision Loss:** Binary `float`/`double` cannot exactly represent many decimal fractions (such as 0.1). This does not make `decimal` automatically correct for every financial calculation: choose representation, scale, and rounding policies to match the domain.
2.  **Suffix Omission:** Forgetting the `f` or `m` suffix. Without a suffix, a number with a decimal point is treated as a `double` by the compiler, which may cause compilation errors if you try to assign it directly to a `float` or `decimal` variable.

# Knowledge checks with answers

**1. Which type should you choose for a banking application calculating interest?**
*   *Answer:* There is no universal answer; `decimal` often fits decimal-based rules, but select representation, scale, and rounding according to the financial specification.

**2. Why does `float` use less memory than `double`?**
*   *Answer:* `float` is a 32-bit type (4 bytes), whereas `double` is a 64-bit type (8 bytes).

**3. If you write `var x = 1.2;`, what is the type of `x`?**
*   *Answer:* `double`. A real literal without a suffix is `double`; `f`/`F` selects `float` and `m`/`M` selects `decimal`.

`float` and `double` additionally represent positive/negative infinity and NaN; `decimal` does not. Their `MinValue`/`MaxValue` constants are the largest/smallest finite values, not infinities.
