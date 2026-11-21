
# C# numeric literals and numeric conversions — Reference: nint implicit numeric conversions

# Scope and version
This lesson covers `nint` implicit numeric conversions as defined in C# 15 / .NET 11. The information is based on the official Microsoft Learn documentation for C# numeric conversions, checked as of 2026-11-20.

# How this group fits the mental model
In C#, `nint` is a native-sized integer type. Its size depends on the underlying platform (32-bit or 64-bit). Because the compiler cannot always guarantee the exact bit-width of `nint` at compile time, implicit conversions are restricted to types that are guaranteed to hold the value regardless of whether the platform is 32-bit or 64-bit. These conversions allow you to promote a platform-dependent integer to a wider or more flexible type without explicit casting.

# Supplied names explained

*   **nint to long (implicit numeric conversion):** Converts a native-sized integer to a 64-bit signed integer. This is safe because `long` is at least as large as `nint` on all supported platforms.
*   **nint to float (implicit numeric conversion):** Converts a native-sized integer to a 32-bit single-precision floating-point type. Note that while this is an implicit conversion, it may result in a loss of precision for very large integer values.
*   **nint to double (implicit numeric conversion):** Converts a native-sized integer to a 64-bit double-precision floating-point type. This provides more precision than `float` when representing the `nint` value.
*   **nint to decimal (implicit numeric conversion):** Converts a native-sized integer to a 128-bit decimal type. This is useful for financial or high-precision calculations where exact representation is required.

# Cross-item comparison

| Conversion Target | Precision/Range Impact | Use Case |
| :--- | :--- | :--- |
| **long** | Exact (no loss) | Standard 64-bit integer arithmetic. |
| **float** | Potential precision loss | Interop with APIs requiring single-precision floats. |
| **double** | High precision | General-purpose floating-point math. |
| **decimal** | Exact (no loss) | Financial or high-precision math. |

# Examples

```csharp
nint nativeVal = 100;

// Implicitly promoted to larger types
long longVal = nativeVal;
float floatVal = nativeVal;
double doubleVal = nativeVal;
decimal decimalVal = nativeVal;
```
*Note: These examples are unverified.*

# Common mistakes

1.  **Assuming `nint` to `int` is implicit:** Converting `nint` to `int` is **not** an implicit conversion because `nint` could be 64-bit while `int` is 32-bit. You must use an explicit cast.
2.  **Ignoring precision loss:** While the conversion to `float` is implicit, it does not mean it is "lossless." Very large `nint` values may lose precision when stored in a `float`.
3.  **Platform assumptions:** Developers sometimes forget that `nint` size changes. Relying on implicit conversion to `long` is safe, but performing arithmetic that assumes a specific bit-width can lead to bugs when moving between 32-bit and 64-bit environments.

# Knowledge checks with answers

**1. Why is `nint` to `long` an implicit conversion?**
*Answer:* Because `long` is guaranteed to be 64 bits, which is sufficient to hold the value of `nint` on both 32-bit and 64-bit platforms.

**2. Is `nint` to `int` an implicit conversion?**
*Answer:* No. Because `nint` can be 64-bit, it cannot be implicitly converted to a 32-bit `int` without potential data loss.

**3. Which listed conversion preserves each native integer value exactly?**
*Answer:* `nint` to `decimal` preserves the integer value. That does not make decimal universally correct for finance; use domain-specific scale and rounding rules.

**Source:** [Microsoft Learn: Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)
