<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Reference: Floating-point and decimal type keywords

*Automatically generated draft.*

# Scope and version
This lesson covers the C# built-in floating-point and decimal type keywords: `float`, `double`, and `decimal`. 
*   **Scope:** C# 15 stable on .NET 11 GA.
*   **Reference:** [Microsoft Learn C# built-in types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table).

# How this group fits the mental model
In C#, built-in type keywords are aliases for underlying .NET types. `float`, `double`, and `decimal` have value semantics: a variable of one of these types represents the value itself rather than a reference to a separately allocated object by default. The runtime's physical storage location is an implementation detail and can vary with context.

These types are used to represent numbers with fractional parts. Choosing between them involves a trade-off between memory usage, precision (how many decimal places are accurate), and the range of values they can represent.

# Supplied names explained

*   **`float`**: An alias for `System.Single`. It is a 32-bit single-precision floating-point type. It is useful for graphics or scenarios where memory efficiency is prioritized over high precision.
*   **`double`**: An alias for `System.Double`. It is a 64-bit double-precision floating-point type. This is the default type for fractional numbers in C# and offers a balance of range and performance.
*   **`decimal`**: An alias for `System.Decimal`. It is a 128-bit data type. Unlike the others, it is a high-precision, base-10 type. It is often useful for financial and monetary calculations because many base-10 fractions are represented exactly, unlike in binary floating point; its finite precision means arithmetic can still round.

# Cross-item comparison

| Feature | `float` | `double` | `decimal` |
| :--- | :--- | :--- | :--- |
| **Precision** | ~6-9 digits | ~15-17 digits | 28-29 digits |
| **Size** | 4 bytes | 8 bytes | 16 bytes |
| **Primary Use** | High-performance math | General-purpose math | Financial/Currency |

*Source: [Floating-point numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)*

# Examples

```csharp
float temperature = 25.5f;    // Requires 'f' suffix
double gravity = 9.81;        // Default for fractional numbers
decimal price = 19.99m;       // Requires 'm' suffix
```

# Common mistakes
1.  **Precision Loss:** Using `float` or `double` for currency. Because these types use binary floating-point representation, they cannot exactly represent base-10 fractions (like 0.1), which can produce rounding differences; choose a representation and rounding policy that fit the domain.
2.  **Suffix Omission:** Forgetting the `f` or `m` suffix. Without a suffix, a number with a decimal point is treated as a `double` by the compiler, which may cause compilation errors if you try to assign it directly to a `float` or `decimal` variable.

# Knowledge checks with answers

**1. Which type should you choose for a banking application calculating interest?**
*   *Answer:* `decimal`. It represents many decimal fractions exactly and may fit financial domain rules, but it has finite precision and arithmetic can still round.

**2. Why does `float` use less memory than `double`?**
*   *Answer:* `float` is a 32-bit type (4 bytes), whereas `double` is a 64-bit type (8 bytes).

**3. If you write `var x = 1.2;`, what is the type of `x`?**
*   *Answer:* `double`. In C#, any literal number containing a decimal point is treated as a `double` unless a suffix (`f` or `m`) is provided.
