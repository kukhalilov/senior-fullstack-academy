<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: byte implicit numeric conversions

*This is an automatically generated draft.*

# Scope and version
This lesson covers implicit numeric conversions originating from the `byte` type in C# 15 and .NET 11. It focuses on the compile-time safety and promotion rules that allow a `byte` to be treated as a larger numeric type without explicit casting. Information is based on the C# 15 / .NET 11 GA specification as of 2026-11-14.

Source: [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)

# How this group fits the mental model
In C#, implicit numeric conversions are explicitly enumerated by the language. Every `byte` value is within the range of each listed integral destination. Conversion to floating point is also implicit; exactness depends on the target format, though `byte` values are exactly representable by `float` and `double`.

# Supplied names explained
*   **byte to short (implicit numeric conversion):** Promotes the 8-bit unsigned `byte` to a 16-bit signed `short`.
*   **byte to ushort (implicit numeric conversion):** Promotes the 8-bit unsigned `byte` to a 16-bit unsigned `ushort`.
*   **byte to int (implicit numeric conversion):** Promotes the 8-bit unsigned `byte` to a 32-bit signed `int`.
*   **byte to uint (implicit numeric conversion):** Promotes the 8-bit unsigned `byte` to a 32-bit unsigned `uint`.
*   **byte to long (implicit numeric conversion):** Promotes the 8-bit unsigned `byte` to a 64-bit signed `long`.
*   **byte to ulong (implicit numeric conversion):** Promotes the 8-bit unsigned `byte` to a 64-bit unsigned `ulong`.
*   **byte to float (implicit numeric conversion):** Converts the `byte` to a 32-bit single-precision floating-point type.
*   **byte to double (implicit numeric conversion):** Converts the `byte` to a 64-bit double-precision floating-point type.
*   **byte to decimal (implicit numeric conversion):** Converts the `byte` to a 128-bit high-precision decimal type.
*   **byte to nint (implicit numeric conversion):** Promotes the `byte` to a native-sized signed integer (32 or 64 bits depending on the platform).
*   **byte to nuint (implicit numeric conversion):** Promotes the `byte` to a native-sized unsigned integer.

# Cross-item comparison
All items in this group are **implicit**, meaning they require no special syntax. They differ primarily in the target memory size and the nature of the target type (signed vs. unsigned vs. floating-point). While integer-to-integer conversions (e.g., `byte` to `int`) involve **zero extension** (filling the extra bits with zeros), conversions to floating-point types involve a change in internal representation from binary integer to floating-point format.

# Examples
```csharp
byte b = 10;

// Implicit conversions: no cast required
short s = b;
int i = b;
float f = b;
decimal d = b;

Console.WriteLine(i); // Result: 10
```
*Note: This code is unverified.*

# Common mistakes
*   **Assuming symmetry:** While you can implicitly convert `byte` to `int`, you cannot implicitly convert `int` to `byte`. The latter requires an explicit cast because the `int` might contain a value larger than 255, leading to data loss.
*   **Over-casting:** Beginners often write `(int)myByte`. While valid, the cast is redundant because the conversion is implicit.

# Knowledge checks with answers
1. **Question:** Why is `byte` to `int` an implicit conversion?
   **Answer:** Every `byte` value (0–255) is exactly representable by `int`.

2. **Question:** Does `byte` to `float` require an explicit cast?
   **Answer:** No, it is an implicit numeric conversion.

3. **Question:** If you have a `byte` variable, can you assign it to a `short` without a cast?
   **Answer:** Yes, `byte` to `short` is an implicit numeric conversion.
