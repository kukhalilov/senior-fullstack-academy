<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: nuint explicit numeric conversions

*Note: This is an automatically generated draft.*

## Scope and version

**Scope and Version:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)). Checked 2026-11-14.

This reference lesson covers one bounded group of exact, pre-enumerated names: explicit numeric conversions originating from the native unsigned integer type (`nuint`). 

### Scope Exclusions
* All nonnumeric conversions (such as reference, boxing, unboxing, nullable, tuple, and user-defined conversions).
* Arithmetic and bitwise operator catalogs beyond numeric promotion behavior.
* Parsing and formatting APIs.
* Floating-point standards and representation internals beyond the distinctions needed for safe type selection.

---

## How this group fits the mental model

In C#, numeric types range from tiny 8-bit values to platform-native pointers like `nuint` (native unsigned integer, which matches the size of a pointer on the target architecture—32-bit on 32-bit systems, 64-bit on 64-bit systems). 

When you want to transfer a value from a wider or platform-dependent type like `nuint` into a narrower or differently signed type, the compiler requires an **explicit numeric conversion**. Because `nuint` can hold values that exceed the maximum limits of smaller types (like `byte`, `short`, or `int`), implicit conversions are not allowed. You must explicitly cast the value, taking full responsibility for potential data loss, truncation, or overflow.

---

## Supplied names explained

The inventory for this lesson consists exclusively of the following nine explicit numeric conversion paths starting from `nuint`:

1. **nuint to sbyte (explicit numeric conversion)**: Converts a native unsigned integer to an 8-bit signed integer (`sbyte`). Requires an explicit cast because `nuint` values can exceed `sbyte.MaxValue` (127) and cannot represent negative numbers.
2. **nuint to byte (explicit numeric conversion)**: Converts a native unsigned integer to an 8-bit unsigned integer (`byte`). Requires an explicit cast because `nuint` can exceed `byte.MaxValue` (255).
3. **nuint to short (explicit numeric conversion)**: Converts a native unsigned integer to a 16-bit signed integer (`short`). Requires an explicit cast because `nuint` can exceed `short.MaxValue` (32,767).
4. **nuint to ushort (explicit numeric conversion)**: Converts a native unsigned integer to a 16-bit unsigned integer (`ushort`). Requires an explicit cast because `nuint` can exceed `ushort.MaxValue` (65,535).
5. **nuint to int (explicit numeric conversion)**: Converts a native unsigned integer to a 32-bit signed integer (`int`). Requires an explicit cast because a 64-bit `nuint` can exceed `int.MaxValue` ($2^{31}-1$).
6. **nuint to uint (explicit numeric conversion)**: Converts a native unsigned integer to a 32-bit unsigned integer (`uint`). Requires an explicit cast because on 64-bit platforms, `nuint` is 64 bits wide and can exceed `uint.MaxValue` ($2^{32}-1$).
7. **nuint to long (explicit numeric conversion)**: Converts a native unsigned integer to a 64-bit signed integer (`long`). Requires an explicit cast because on a 64-bit architecture, the top bit of a 64-bit `nuint` could be interpreted as a sign bit, making the value appear negative in a signed `long`.
8. **nuint to nint (explicit numeric conversion)**: Converts a native unsigned integer to a native signed integer (`nint`). Requires an explicit cast because changing sign interpretation across platform-native widths requires explicit programmer intent.
9. **nuint to char (explicit numeric conversion)**: Converts a native unsigned integer to a 16-bit UTF-16 code unit (`char`). Requires an explicit cast because `nuint` can exceed `char.MaxValue` ($U+FFFF$).

---

## Cross-item comparison

To understand how these conversions relate, consider the broader conversion categories and semantics documented in C#:

* **Implicit vs. Explicit Numeric Conversions**: Implicit conversions happen automatically when the target type can safely represent all values of the source type without data loss. Explicit conversions (such as all items in this inventory) require a cast operator `(TargetType)` because value truncation, range overflow, or sign interpretation changes can occur.
* **Checked vs. Unchecked Contexts**: Under an explicit conversion, you can wrap operations in `checked` or `unchecked` blocks. For integral conversions, `checked` throws `OverflowException` when out of range; `unchecked` discards high-order bits according to the language rules. Floating-point and decimal sources have different rules.

---

## Examples

The following code snippets illustrate how to use the inventory items in valid C# syntax. 

*Note: The code examples below are unexecuted snippets demonstrating syntax patterns.*

```csharp
using System;

class Program
{
    static void Main()
    {
        nuint nativeVal = 300;

        // 1. nuint to byte (explicit numeric conversion)
        // 300 exceeds byte.MaxValue (255). 
        // Unchecked integral conversion truncates according to language rules.
        byte b = (byte)nativeVal; 

        // 2. nuint to ushort (explicit numeric conversion)
        // 300 fits safely within ushort bounds (0 to 65,535).
        ushort us = (ushort)nativeVal;

        // 3. nuint to int (explicit numeric conversion)
        int i = (int)nativeVal;

        Console.WriteLine($"Byte: {b}, UShort: {us}, Int: {i}");
    }
}
```

---

## Common mistakes

* **Assuming platform safety without checks**: Assuming that because a code snippet runs on a 32-bit machine, a `nuint` to `uint` or `int` conversion will never overflow. On 64-bit systems, `nuint` is 64 bits wide and will overflow standard 32-bit destinations when holding large addresses or numbers.
* **Forgetting runtime overflow behavior differences**: Expecting an `OverflowException` by default during narrowing casts. Unchecked integral conversions truncate according to language rules; checked integral conversions throw on overflow.
* **Inventing unassigned methods**: Attempting to call non-existent conversion helper methods or extension properties instead of using standard C# explicit cast syntax (e.g., writing `nativeVal.ToInt32()` instead of `(int)nativeVal`).

---

## Knowledge checks with answers

1. **Question:** Why is an explicit cast required when converting an `nuint` to a `ushort`?
   * **Answer:** An explicit cast is required because `nuint` is a platform-native unsigned integer that can hold values larger than `ushort.MaxValue` (65,535). The compiler enforces explicit syntax to ensure the developer acknowledges potential data truncation.

2. **Question:** What happens when an `nuint` value exceeds the range of a target type during an explicit numeric conversion inside a default (unchecked) context?
   * **Answer:** In an unchecked context, no exception is thrown; the value undergoes truncation or bit reinterpretation according to standard overflow behavior.

3. **Question:** Does this lesson inventory include conversions from `int` to `nuint`?
   * **Answer:** No. The inventory is strictly bounded to explicit numeric conversions originating *from* `nuint` to the specified nine destination types.
