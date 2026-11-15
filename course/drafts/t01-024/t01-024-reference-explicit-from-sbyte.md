<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: sbyte explicit numeric conversions

*Automatically generated draft.*

# Scope and version
This lesson covers `sbyte` explicit numeric conversions in C# 15 / .NET 11. The information is based on the .NET 11 GA release and .NET 9 behavior, checked as of 2026-11-14. 
Source: [Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)

# How this group fits the mental model
In C#, an `sbyte` is a signed 8-bit integer. Because it can hold negative values, the compiler does not allow an implicit conversion to unsigned types (like `byte` or `uint`) or `char`, as these types cannot represent negative numbers. To perform these assignments, you must use an **explicit numeric conversion**—a cast—which signals to the compiler that you accept the responsibility for potential data loss or overflow if the `sbyte` value is negative or outside the target range.

# Supplied names explained
The following explicit conversions require a cast (e.g., `(targetType)mySbyte`) because they involve moving from a signed 8-bit type to unsigned types or `char`:

*   **sbyte to byte (explicit numeric conversion):** Converts an 8-bit signed integer to an 8-bit unsigned integer.
*   **sbyte to ushort (explicit numeric conversion):** Converts an 8-bit signed integer to a 16-bit unsigned integer.
*   **sbyte to uint (explicit numeric conversion):** Converts an 8-bit signed integer to a 32-bit unsigned integer.
*   **sbyte to ulong (explicit numeric conversion):** Converts an 8-bit signed integer to a 64-bit unsigned integer.
*   **sbyte to nuint (explicit numeric conversion):** Converts an 8-bit signed integer to a native-sized unsigned integer (32-bit or 64-bit depending on the platform).
*   **sbyte to char (explicit numeric conversion):** Converts an 8-bit signed integer to a 16-bit Unicode character.

# Cross-item comparison
*   **Implicit vs. Explicit:** Unlike implicit conversions (which are safe and automatic), these explicit conversions require a cast. If the `sbyte` value is negative, the bit representation is reinterpreted in the target type, which may result in a large positive value.
*   **Sign Extension vs. Zero Extension:** When converting to larger types (like `ushort` or `uint`), the system uses sign extension to preserve the value's sign if the target were signed. However, because these targets are unsigned, the negative bit pattern of the `sbyte` is preserved, resulting in a value that is not numerically equivalent to the original `sbyte`.

# Examples
```csharp
sbyte mySbyte = -1;

// Explicit conversion required
byte myByte = (byte)mySbyte; 
ushort myUshort = (ushort)mySbyte;

// Result: myByte becomes 255, myUshort becomes 65535
// This occurs because the bit pattern of -1 is reinterpreted as unsigned.
```
*Note: The code above is unverified.*

# Common mistakes
*   **Assuming numerical equality:** A common error is assuming that `(byte)mySbyte` will result in the same mathematical value if `mySbyte` is negative. It will not; it will result in the unsigned representation of those bits.
*   **Forgetting the cast:** Attempting to assign an `sbyte` to a `byte` without the `(byte)` cast will result in a compile-time error.

# Knowledge checks with answers
1. **Question:** Why is an explicit cast required when converting `sbyte` to `byte`?
   **Answer:** Because `sbyte` is signed and `byte` is unsigned. The compiler requires an explicit cast to ensure the developer acknowledges that negative values cannot be represented in the target type.

2. **Question:** If `sbyte` is -1, what is the result of `(uint)mySbyte`?
   **Answer:** The result is the maximum value of a 32-bit unsigned integer (all bits set to 1), because the negative bit pattern of the `sbyte` is preserved and reinterpreted as unsigned.

3. **Question:** Are these conversions safe from overflow?
   **Answer:** They are "safe" in that they compile, but they are not "safe" in terms of preserving the original numeric value if the `sbyte` is negative. The developer is responsible for checking the value before conversion.
