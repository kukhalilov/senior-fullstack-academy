<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: Explicit numeric conversions from char

# Scope and version

**Automatically generated draft.**

- **Topic:** C# numeric literals and numeric conversions
- **Assigned Inventory Group:** Explicit numeric conversions from `char`
- **Edition / Scope:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions))
- **Checked Date:** 2026-11-14

---

# How this group fits the mental model

In C#, numbers can be converted from one type to another either implicitly (automatically, when no data loss is possible) or explicitly (manually using a cast expression, when data loss or truncation might happen). The items in this group (`char` to `sbyte`, `char` to `byte`, and `char` to `short`) represent narrowing, explicit conversions originating from a 16-bit UTF-16 code unit (`char`). Because a `char` can hold values up to `65,535`, converting it into smaller or signed numeric containers (`sbyte`, `byte`, `short`) requires developer intent and an explicit cast because the destination type might not have enough range to hold every possible `char` value.

---

# Supplied names explained

- **char to sbyte (explicit numeric conversion):** Converts a 16-bit unsigned character code into an 8-bit signed integer (`sbyte`). Because an `sbyte` only ranges from `-128` to `127`, this conversion requires an explicit cast and will behave according to current overflow rules if the character code exceeds the `sbyte` range.
- **char to byte (explicit numeric conversion):** Converts a 16-bit unsigned character code into an 8-bit unsigned integer (`byte`). Because a `byte` ranges from `0` to `255`, characters above `255` exceed the destination range, making an explicit cast mandatory.
- **char to short (explicit numeric conversion):** Converts a 16-bit unsigned character code into a 16-bit signed integer (`short`). Because `short` ranges from `-32,768` to `32,767`, `char` values above `short.MaxValue` are outside the `short` range: checked conversion throws; unchecked integral conversion truncates according to the language's conversion rules.

---

# Cross-item comparison

- **`char` to `byte` vs. `char` to `sbyte`:** `byte` is unsigned (`0` to `255`), whereas `sbyte` is signed (`-128` to `127`). Both target 8-bit widths, but `sbyte` cuts off at a much lower numeric threshold for positive values.
- **`char` to `short` vs. 8-bit conversions (`byte` / `sbyte`):** `short` matches the 16-bit width of `char`, meaning it can preserve numerical values up to `32,767` without bit truncation, whereas 8-bit conversions truncate or overflow much earlier.

---

# Examples

The following C# code snippet demonstrates explicit numeric conversions from `char` using valid syntax ([Microsoft Learn C# Language Specification - Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/conversions)). *Note: This code snippet is unverified as no execution output was supplied.*

```csharp
char letter = 'A'; // UTF-16 code 65

// Explicit numeric conversions from char
sbyte sb = (sbyte)letter;
byte b = (byte)letter;
short sh = (short)letter;
```

---

# Common mistakes

- **Assuming implicit safety:** Attempting to assign a `char` directly to a `byte`, `sbyte`, or `short` without a cast (`(byte)`) causes a compilation error because narrowing conversions are never implicit.
- **Ignoring range limits:** Forgetting that `char` holds unsigned 16-bit values up to `65,535`, which easily overflows smaller signed types like `sbyte` or `short`.

---

# Knowledge checks with answers

1. **Why is an explicit cast required when converting a `char` to a `byte`?**
   - *Answer:* Because a `char` is 16 bits wide and can represent values up to `65,535`, whereas an 8-bit `byte` maxes out at `255`. The compiler requires an explicit conversion to acknowledge potential data truncation.
2. **What is the structural difference between `char` to `sbyte` and `char` to `short` conversions?**
   - *Answer:* `sbyte` is an 8-bit signed type with a maximum positive value of `127`, whereas `short` is a 16-bit signed type matching the bit-width of `char`, accommodating values up to `32,767` before hitting negative signed representation boundaries.
