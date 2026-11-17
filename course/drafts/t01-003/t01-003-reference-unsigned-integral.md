<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Reference: Unsigned integral type keywords

*This is an automatically generated draft.*

# Scope and version
This lesson covers the unsigned integral type keywords in C# 15, running on .NET 11 GA. The information is based on the Microsoft Learn C# built-in type reference (checked 2026-11-14).

# How this group fits the mental model
In C#, integral types represent integers. Unsigned types represent zero and nonnegative values, with the same width's full range available above zero (for example, `byte` ranges 0–255 while `sbyte` ranges -128–127). These are value types; physical storage location is implementation- and context-dependent.

# Supplied names explained
*   **`byte`**: An 8-bit unsigned integer. It is the smallest integral type, ranging from 0 to 255.
*   **`ushort`**: A 16-bit unsigned integer. It provides a range from 0 to 65,535.
*   **`uint`**: A 32-bit unsigned integer. It provides a range from 0 to 4,294,967,295.
*   **`ulong`**: A 64-bit unsigned integer. It provides a range from 0 to 18,446,744,073,709,551,615.

# Cross-item comparison
The primary difference between these types is the amount of memory they occupy and the maximum value they can hold.

| Type | Size (bits) | Max Value |
| :--- | :--- | :--- |
| `byte` | 8 | 255 |
| `ushort` | 16 | 65,535 |
| `uint` | 32 | 4,294,967,295 |
| `ulong` | 64 | 18,446,744,073,709,551,615 |

Choose based on domain range, interoperability, and collection/API contracts. A narrower scalar type does not necessarily make arithmetic faster or an application smaller; arrays expose a clear per-element size tradeoff.

# Examples
```csharp
// Unverified example
byte smallValue = 200;
ushort mediumValue = 60000;
uint largeValue = 4000000000;
ulong veryLargeValue = 18000000000000000000UL;
```

# Common mistakes
1.  **Overflow**: Constant assignments outside permitted range may be compile-time errors; runtime integral arithmetic and conversions have checked/unchecked behavior that depends on context and operation.
2.  **Negative Assignment**: Assigning a negative number to an unsigned type is not allowed. For example, `byte b = -1;` will result in a compilation error.
3.  **Mixing Types**: Performing arithmetic between different integral types often results in an implicit conversion to a larger type. Always be mindful of the resulting type to avoid unexpected data loss or errors.

# Knowledge checks with answers

**1. Which unsigned integral type is the most memory-efficient for storing the number 200?**
*   *Answer:* `byte`, because it only requires 8 bits and can hold values up to 255.

**2. Can you store the value -5 in a `uint` variable?**
*   *Answer:* No. `uint` is an unsigned type and cannot represent negative numbers.

**3. If you need to store a value of 70,000, which type should you choose?**
*   *Answer:* `uint` (or `ulong`). `ushort` is insufficient because its maximum value is 65,535.

*Source: [Microsoft Learn C# built-in types table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)*
