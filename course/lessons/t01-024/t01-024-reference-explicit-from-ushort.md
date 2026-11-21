
# C# numeric literals and numeric conversions — Reference: ushort explicit numeric conversions

# Scope and version
This lesson covers `ushort` explicit numeric conversions in C# 15 / .NET 11. It focuses on the specific set of conversions from `ushort` (an unsigned 16-bit integer) to other integral types.

*Reference: [Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)*

# How this group fits the mental model
The listed conversions from `ushort` require casts because those source-to-target paths are explicit in C#. A cast's result depends on source and target types, value, and checked context; implicit numeric conversions can also lose precision.

Because a `ushort` can hold values up to 65,535, it may exceed the capacity of smaller types (like `sbyte` or `byte`). Therefore, the compiler requires you to explicitly acknowledge the risk of data loss or overflow by using a cast.

# Supplied names explained
The following list defines the explicit conversions from `ushort` to other types:

*   **ushort to sbyte (explicit numeric conversion):** Converts a 16-bit unsigned integer to an 8-bit signed integer. This may result in data loss if the `ushort` value is greater than 127.
*   **ushort to byte (explicit numeric conversion):** Converts a 16-bit unsigned integer to an 8-bit unsigned integer. This may result in data loss if the `ushort` value is greater than 255.
*   **ushort to short (explicit numeric conversion):** Converts a 16-bit unsigned integer to a 16-bit signed integer. This may result in data loss if the `ushort` value is greater than 32,767.
*   **ushort to nint (explicit numeric conversion):** Converts a 16-bit unsigned integer to a native-sized signed integer. Every `ushort` value fits in `nint` on supported 32-bit and 64-bit processes, but this predefined conversion is explicit.
*   **ushort to char (explicit numeric conversion):** Converts a 16-bit unsigned integer to a 16-bit UTF-16 code unit. This is explicit because `char` is treated as a distinct type from `ushort` in C#.

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
1.  **Ignoring Overflow:** Assuming a narrowing integral cast clamps the value. Checked casts throw on overflow; unchecked casts truncate according to language rules.
2.  **Confusing `nint`:** Forgetting that `nint` is signed, meaning a large `ushort` value might be interpreted as a negative number depending on the platform's architecture.
3.  **Missing the Cast:** Attempting to assign a `ushort` to a `byte` without the `(byte)` cast will result in a compile-time error.

# Knowledge checks with answers

**Q1: Why is a cast required to convert `ushort` to `short`?**
*Answer:* Even though both are 16 bits, `ushort` can hold values up to 65,535, while `short` only goes up to 32,767. The compiler requires an explicit cast because the value might exceed the `short` range.

**Q2: What happens if you convert a `ushort` value of 300 to a `byte`?**
*Answer:* In an `unchecked` context (default), the value will be truncated to 44 (the lower 8 bits of 300).

**Q3: Is `ushort` to `nint` always a safe conversion?**
*Answer:* No. While `nint` is generally large enough to hold the value, the conversion is explicit because it involves changing from an unsigned type to a signed type.
