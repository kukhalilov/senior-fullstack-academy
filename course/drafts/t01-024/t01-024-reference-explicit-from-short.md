<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: short explicit numeric conversions

*This is an automatically generated draft.*

# Scope and version
This lesson covers the explicit numeric conversions from the `short` type to other integral types in C# 15 / .NET 11. The information provided is based on the .NET 11 GA release and .NET 9 behavior, with data checked as of 2026-11-14. 

Source: [Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)

# How this group fits the mental model
In C#, numeric conversions are categorized as either implicit (safe, no data loss) or explicit (requires a cast, potential for data loss or overflow). Because a `short` (a 16-bit signed integer) can hold values that do not fit into smaller types (like `sbyte` or `byte`) or unsigned types (where negative values are invalid), the compiler requires you to explicitly acknowledge the risk of data loss or overflow using a cast. This group of conversions represents the specific scenarios where you must manually instruct the compiler to perform the conversion from `short`.

# Supplied names explained
*   **short to sbyte (explicit numeric conversion):** Converts a 16-bit signed integer to an 8-bit signed integer. Requires a cast because the `short` value may exceed the range of `sbyte` (-128 to 127).
*   **short to byte (explicit numeric conversion):** Converts a 16-bit signed integer to an 8-bit unsigned integer. Requires a cast because the `short` value may be negative or exceed 255.
*   **short to ushort (explicit numeric conversion):** Converts a 16-bit signed integer to a 16-bit unsigned integer. Requires a cast because the `short` value may be negative.
*   **short to uint (explicit numeric conversion):** Converts a 16-bit signed integer to a 32-bit unsigned integer. Requires a cast because the `short` value may be negative.
*   **short to ulong (explicit numeric conversion):** Converts a 16-bit signed integer to a 64-bit unsigned integer. Requires a cast because the `short` value may be negative.
*   **short to nuint (explicit numeric conversion):** Converts a 16-bit signed integer to a native-sized unsigned integer. Requires a cast because the `short` value may be negative.
*   **short to char (explicit numeric conversion):** Converts a 16-bit signed integer to a 16-bit Unicode character. Requires a cast because the `short` value may be negative or outside the valid range of a `char`.

# Cross-item comparison
*   **Implicit vs. Explicit:** Unlike implicit conversions (e.g., `short` to `int`), which happen automatically, all items in this list require an explicit cast (e.g., `(byte)myShort`) because they involve potential range violations or sign mismatches.
*   **Checked vs. Unchecked:** These conversions are subject to `checked` and `unchecked` contexts. In a `checked` context, an overflow exception is thrown if the value is out of range; in an `unchecked` context, integral conversion follows the language's truncation rules.

# Examples
```csharp
short myShort = -10;

// Explicit conversion required
byte myByte = (byte)myShort; 

// In a checked context, this would throw an OverflowException
checked
{
    short largeShort = 300;
    sbyte mySbyte = (sbyte)largeShort; // Throws exception
}
```
*Note: The code above is unverified.*

# Common mistakes
*   **Ignoring sign:** Attempting to convert a negative `short` to an unsigned type (like `byte` or `ushort`) without considering that the result will be interpreted as a large positive number due to bit representation.
*   **Assuming safety:** Forgetting that even if a `short` value fits in the destination type, the compiler still mandates an explicit cast for these specific conversions.
*   **Context confusion:** Relying on default `unchecked` behavior in production code when you actually need to detect overflow errors using `checked` blocks.

# Knowledge checks with answers
1. **Question:** Why does `short` to `ushort` require an explicit conversion?
   **Answer:** Because a `short` can contain negative values, which are not representable in a `ushort`.

2. **Question:** What happens if you convert a `short` value of 300 to an `sbyte` in an `unchecked` context?
   **Answer:** The unchecked integral conversion truncates to the destination representation, yielding a different value; a checked conversion throws.

3. **Question:** Are these conversions always safe?
   **Answer:** No. They are explicit precisely because they are not guaranteed to be safe; they may result in data loss or overflow depending on the value of the `short` and the destination type.
