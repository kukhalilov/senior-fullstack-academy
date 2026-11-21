<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: sbyte implicit numeric conversions

*This is an automatically generated draft.*

# Scope and version
This lesson covers `sbyte` implicit numeric conversions within the context of C# 15 and .NET 11. All information is based on the official Microsoft Learn C# documentation and .NET 11 compatibility notes, checked as of 2026-11-20.

# How this group fits the mental model
In C#, `sbyte` is an 8-bit signed integer. The language defines implicit conversions from it to the listed destinations. These target types accommodate its magnitude; the exactness of floating-point conversions depends on the target, though all `sbyte` values are exact in `float` and `double`.

# Supplied names explained
The following list defines the valid implicit conversions from `sbyte`:

*   **sbyte to short (implicit numeric conversion):** Promotes an 8-bit signed integer to a 16-bit signed integer.
*   **sbyte to int (implicit numeric conversion):** Promotes an 8-bit signed integer to a 32-bit signed integer.
*   **sbyte to long (implicit numeric conversion):** Promotes an 8-bit signed integer to a 64-bit signed integer.
*   **sbyte to float (implicit numeric conversion):** Converts the integer to a single-precision 32-bit floating-point number.
*   **sbyte to double (implicit numeric conversion):** Converts the integer to a double-precision 64-bit floating-point number.
*   **sbyte to decimal (implicit numeric conversion):** Converts the integer to a 128-bit decimal type, which is used for financial and monetary calculations requiring high precision.
*   **sbyte to nint (implicit numeric conversion):** Converts the integer to a native-sized signed integer (32-bit or 64-bit depending on the platform architecture).

# Cross-item comparison
*   **Integral vs. Floating-point:** Conversions to `short`, `int`, `long`, and `nint` maintain exact integer representation. Conversions to `float`, `double`, and `decimal` change the internal representation to support fractional values.
*   **Precision:** Every `sbyte` value is exactly representable as `float`, `double`, or `decimal`.

# Examples
```csharp
sbyte mySbyte = 10;

short myShort = mySbyte;     // Implicitly converted
int myInt = mySbyte;         // Implicitly converted
double myDouble = mySbyte;   // Implicitly converted
decimal myDecimal = mySbyte; // Implicitly converted
```

# Common mistakes
*   **Assuming symmetry:** You cannot implicitly convert from a larger type (like `int`) to an `sbyte`. That requires an explicit cast, which may result in data loss or overflow.
*   **Ignoring context:** While these conversions are implicit, remember that arithmetic operations involving these types may trigger **numeric promotion**, where the compiler promotes operands to a common type before performing the calculation.

# Knowledge checks with answers
1.  **Question:** Can you implicitly convert an `sbyte` to a `byte`?
    *   **Answer:** No. An `sbyte` can contain negative values, which a `byte` cannot represent. This would require an explicit conversion.
2.  **Question:** Why is the conversion from `sbyte` to `int` considered "safe"?
    *   **Answer:** Because every value that fits in an 8-bit signed integer (`sbyte`) is guaranteed to fit within the range of a 32-bit signed integer (`int`).
3.  **Question:** Where can I find the official documentation for these conversions?
    *   **Answer:** [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)
