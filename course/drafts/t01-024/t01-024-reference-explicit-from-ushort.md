<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: ushort explicit numeric conversions

*This is an automatically generated draft.*

# Scope and version
This lesson covers `ushort` explicit numeric conversions in C# 15 / .NET 11. It focuses on the specific set of conversions from `ushort` (an unsigned 16-bit integer) to other integral types. 

*Reference: [Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)*

# How this group fits the mental model
In C#, numeric types have different ranges. An **implicit conversion** occurs when the destination type can always hold the source value without data loss. An **explicit conversion** (using a cast) is required when the compiler cannot guarantee that the source value fits within the destination range. 

Because a `ushort` can hold values up to 65,535, it may exceed the capacity of smaller types (like `sbyte` or `byte`). Therefore, the compiler requires you to explicitly acknowledge the risk of data loss or overflow by using a cast.

# Supplied names explained
The following list defines the explicit conversions from `ushort` to other types:

*   **ushort to sbyte (explicit numeric conversion):** Converts a 16-bit unsigned integer to an 8-bit signed integer. This may result in data loss if the `ushort` value is greater than 127.
*   **ushort to byte (explicit numeric conversion):** Converts a 16-bit unsigned integer to an 8-bit unsigned integer. This may result in data loss if the `ushort` value is greater than 255.
*   **ushort to short (explicit numeric conversion):** Converts a 16-bit unsigned integer to a 16-bit signed integer. This may result in data loss if the `ushort` value is greater than 32,767.
*   **ushort to nint (explicit numeric conversion):** Converts a 16-bit unsigned integer to a native-sized signed integer. While `nint` is at least 32 bits, the conversion is explicit because it involves a change in signedness.
*   **ushort to char (explicit numeric conversion):** Converts a 16-bit unsigned integer to a 16-bit Unicode character. This is explicit because `char` is treated as a distinct type from `ushort` in C#.

# Cross-item comparison
| Conversion | Destination Range | Risk |
| :--- | :--- | :--- |
| `ushort` to `sbyte` | -128 to 127 | Overflow/Truncation |
| `ushort` to `byte` | 0 to 255 | Overflow/Truncation |
| `ushort` to `short` | -32,768 to 32,767 | Overflow/Truncation |
| `ushort` to `nint` | Platform-dependent | Sign interpretation |
| `ushort` to `char` | U+0000 to U+FFFF | Type mismatch |

# Examples
```csharp
ushort source = 300;

// Explicit conversion to byte
// Result: 44 (300 truncated to 8 bits)
byte b = (byte)source; 

// Explicit conversion to short
// Result: 300 (Fits within short range)
short s = (short)source;

// Explicit conversion to char
char c = (char)source;
```
*Note: The code above is unverified.*

# Common mistakes
1.  **Ignoring Overflow:** Assuming an explicit conversion will automatically "clamp" or "saturate" the value. In an `unchecked` context (the default), the bits are simply truncated, which can lead to unexpected negative numbers or wrapped values.
2.  **Confusing `nint`:** Forgetting that `nint` is signed, meaning a large `ushort` value might be interpreted as a negative number depending on the platform's architecture.
3.  **Missing the Cast:** Attempting to assign a `ushort` to a `byte` without the `(byte)` cast will result in a compile-time error.

# Knowledge checks with answers

**Q1: Why is a cast required to convert `ushort` to `short`?**
*Answer:* Even though both are 16 bits, `ushort` can hold values up to 65,535, while `short` only goes up to 32,767. The compiler requires an explicit cast because the value might exceed the `short` range.

**Q2: What happens if you convert a `ushort` value of 300 to a `byte`?**
*Answer:* In an `unchecked` context (default), the value will be truncated to 44 (the lower 8 bits of 300).

**Q3: Is `ushort` to `nint` always a safe conversion?**
*Answer:* No. While `nint` is generally large enough to hold the value, the conversion is explicit because it involves changing from an unsigned type to a signed type.
