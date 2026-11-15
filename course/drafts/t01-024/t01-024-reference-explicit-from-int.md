<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: int explicit numeric conversions

# Scope and version

**Automatically generated draft.**  
This self-study reference lesson covers the C# numeric conversion rules for the inventory group **int explicit numeric conversions**, based on C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior ([Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

---

# How this group fits the mental model

In C#, numeric types have distinct sizes and ranges. When you convert an `int` (a 32-bit signed integer) into a smaller, wider, unsigned, or differently signed numeric type, the compiler requires an **explicit numeric conversion**. 

Explicit conversions signal caller responsibility ([Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)). Because an `int` value might exceed the capacity of the target type (or hold a negative value when the target is unsigned), implicit conversions are not allowed. You must use a cast operator (e.g., `(byte)`) to instruct the compiler that you accept the risks of overflow or range truncation.

---

# Supplied names explained

Every item in the assigned inventory group represents a specific explicit numeric conversion originating from `int`:

- **int to sbyte (explicit numeric conversion)**: Converts a 32-bit signed integer (`int`) into an 8-bit signed integer (`sbyte`). Required because `sbyte` has a smaller numeric range (-128 to 127) than `int`.
- **int to byte (explicit numeric conversion)**: Converts a 32-bit signed integer (`int`) into an 8-bit unsigned integer (`byte`). Required because `byte` has a restricted positive range (0 to 255) and cannot represent negative `int` values.
- **int to short (explicit numeric conversion)**: Converts a 32-bit signed integer (`int`) into a 16-bit signed integer (`short`). Required because `short` (-32,768 to 32,767) is narrower than `int`.
- **int to ushort (explicit numeric conversion)**: Converts a 32-bit signed integer (`int`) into a 16-bit unsigned integer (`ushort`). Required because `ushort` cannot hold negative values or numbers above 65,535.
- **int to uint (explicit numeric conversion)**: Converts a 32-bit signed integer (`int`) into a 32-bit unsigned integer (`uint`). Required because an `int` can contain negative numbers, which are invalid in an unsigned `uint`.
- **int to ulong (explicit numeric conversion)**: Converts a 32-bit signed integer (`int`) into a 64-bit unsigned integer (`ulong`). Required because `ulong` is unsigned and cannot accept negative `int` values, even though its positive upper bound exceeds `int`.
- **int to nuint (explicit numeric conversion)**: Converts a 32-bit signed integer (`int`) into a native-sized unsigned integer (`nuint`). Required because `nuint` is unsigned.
- **int to char (explicit numeric conversion)**: Converts a 32-bit signed integer (`int`) into a 16-bit UTF-16 code unit (`char`). Required because `char` represents an unsigned UTF-16 code unit (0 to 65,535) and cannot store negative `int` values or values exceeding 16 bits.

---

# Cross-item comparison

To understand how these conversions relate, consider the direction of safety versus explicit requirement:
- **Signed-to-Signed narrowing** (`int to sbyte`, `int to short`): Both types can represent negative numbers, but the destination range is smaller. Out-of-range values truncate or overflow depending on the `checked`/`unchecked` context.
- **Signed-to-Unsigned restriction** (`int to byte`, `int to ushort`, `int to uint`, `int to ulong`, `int to nuint`, `int to char`): Even when the destination type has a larger bit width (such as `int to ulong`), an explicit conversion is always required because the destination cannot accept negative `int` values ([Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

---

# Examples

The following code snippet demonstrates unverified explicit conversions from `int` to the inventory types.

```csharp
// Unverified pseudocode / code example
int originalValue = 300;

// 1. int to sbyte
sbyte asSByte = (sbyte)originalValue;

// 2. int to byte
byte asByte = (byte)originalValue;

// 3. int to short
short asShort = (short)originalValue;

// 4. int to ushort
ushort asUShort = (ushort)originalValue;

// 5. int to uint
uint asUInt = (uint)originalValue;

// 6. int to ulong
ulong asULong = (ulong)originalValue;

// 7. int to nuint
nuint asNuint = (nuint)originalValue;

// 8. int to char
char asChar = (char)originalValue;
```

---

# Common mistakes

1. **Assuming larger bit-width implies implicit conversion**: Developers often assume converting `int` to `ulong` or `uint` can be implicit since the target can store large numbers. C# requires an explicit cast because `int` can be negative.
2. **Ignoring runtime context**: Forgetting that explicit narrowing conversions can throw an `OverflowException` inside a `checked` block, whereas they in unchecked integral conversions, out-of-range values are truncated according to language rules.

---

# Knowledge checks with answers

1. **Question**: Why is an explicit cast required when converting an `int` to a `ulong`?  
   **Answer**: Because `ulong` is an unsigned type and cannot represent negative numbers that an `int` variable might hold ([Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

2. **Question**: Can an `int` be converted implicitly to a `short`?  
   **Answer**: No. Converting `int` to `short` is a narrowing conversion that risks data loss or range overflow, so it requires an explicit numeric conversion ([Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
