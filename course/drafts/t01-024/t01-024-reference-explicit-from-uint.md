<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: uint explicit numeric conversions

*Draft: Automatically generated.*

# Scope and version

This reference lesson covers the exact explicit numeric conversions from `uint` (32-bit unsigned integer) to other smaller or signed integral types in C#, as defined for C# 15 / .NET 11 GA and .NET 9 behavior ([Microsoft Learn C# numeric conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

**Scope Boundaries:**
* **Included Inventory:** `uint to sbyte (explicit numeric conversion)`, `uint to byte (explicit numeric conversion)`, `uint to short (explicit numeric conversion)`, `uint to ushort (explicit numeric conversion)`, `uint to int (explicit numeric conversion)`, `uint to nint (explicit numeric conversion)`, and `uint to char (explicit numeric conversion)`.
* **Excluded:** Implicit conversions, reference conversions, parsing APIs, user-defined conversions, and arithmetic operator catalogs.

---

# How this group fits the mental model

In C#, numeric types have strict ranges and memory widths. When you store a 32-bit unsigned integer (`uint`), its value can range from `0` to `4,294,967,295`. 

Because types like `byte`, `sbyte`, `short`, `ushort`, `int`, `nint`, and `char` have smaller storage sizes or reserved sign bits, the compiler cannot guarantee that an arbitrary `uint` value will fit safely inside them. Therefore, C# requires an **explicit numeric conversion** (a cast) to signal that you, the programmer, take responsibility for potential precision loss, truncation, or overflow.

---

# Supplied names explained

* **`uint to sbyte (explicit numeric conversion)`**: Converts a `uint` into a signed 8-bit integer (`sbyte`), which holds values from `-128` to `127`. Because `uint` can hold much larger numbers and negative values do not exist in `sbyte`, casting requires explicit syntax and triggers overflow checks in a `checked` context.
* **`uint to byte (explicit numeric conversion)`**: Converts a `uint` into an unsigned 8-bit integer (`byte`), which holds values from `0` to `255`. Values above `255` exceed the destination capacity.
* **`uint to short (explicit numeric conversion)`**: Converts a `uint` into a signed 16-bit integer (`short`), holding values from `-32,768` to `32,767`. 
* **`uint to ushort (explicit numeric conversion)`**: Converts a `uint` into an unsigned 16-bit integer (`ushort`), holding values from `0` to `65,535`.
* **`uint to int (explicit numeric conversion)`**: Converts a `uint` into a signed 32-bit integer (`int`), holding values from `-2,147,483,648` to `2,147,483,647`. Even though both types occupy 32 bits, `uint` uses its highest bit for magnitude, whereas `int` uses its highest bit as a sign indicator. Thus, `uint` values above `2,147,483,647` exceed the positive range of `int`.
* **`uint to nint (explicit numeric conversion)`**: Converts a `uint` into a native-sized signed integer (`nint`), which matches the pointer size of the execution platform (32-bit on 32-bit architectures, 64-bit on 64-bit architectures). On 64-bit platforms, a `uint` easily fits within an `nint`, but the explicit cast remains syntactically required because of potential width mismatches on 32-bit platforms.
* **`uint to char (explicit numeric conversion)`**: Converts a `uint` into a 16-bit Unicode character (`char`), representing UTF-16 code units from `U+0000` to `U+FFFF`.

---

# Cross-item comparison

All items in this inventory share a common characteristic: they convert from a 32-bit unsigned source (`uint`) to a narrower or sign-conflicting destination type, and **all require explicit cast syntax**. 

| Source Type | Destination Type | Destination Range | Cast Syntax Required? |
| :--- | :--- | :--- | :--- |
| `uint` | `sbyte` | `-128` to `127` | Yes (Explicit) |
| `uint` | `byte` | `0` to `255` | Yes (Explicit) |
| `uint` | `short` | `-32,768` to `32,767` | Yes (Explicit) |
| `uint` | `ushort` | `0` to `65,535` | Yes (Explicit) |
| `uint` | `int` | `-2,147,483,648` to `2,147,483,647` | Yes (Explicit) |
| `uint` | `nint` | Platform-dependent signed bits | Yes (Explicit) |
| `uint` | `char` | `U+0000` to `U+FFFF` | Yes (Explicit) |

---

# Examples

The following code snippets illustrate valid syntax for performing these explicit numeric conversions. 

```csharp
// Unverified code example
uint originalValue = 300;

// 1. uint to ushort explicit conversion (Value fits: 300 <= 65535)
ushort asUshort = (ushort)originalValue;

// 2. uint to byte explicit conversion (Value exceeds 255; bits truncate or overflow depending on context)
byte asByte = (byte)originalValue;

// 3. uint to int explicit conversion
int asInt = (int)originalValue;

// 4. uint to char explicit conversion
char asChar = (char)65; // Represents 'A'
```

---

# Common mistakes

1. **Assuming same-width types are implicit:** Developers often assume that converting a `uint` to an `int` can be done implicitly because both take 32 bits of memory. However, because `uint` can represent values larger than `int.MaxValue`, the compiler requires an explicit cast (`uint to int (explicit numeric conversion)`).
2. **Ignoring overflow behavior:** Performing narrowing casts in a `checked` block without verifying bounds can throw an `OverflowException` at runtime if the `uint` value exceeds the target type's maximum limit.
3. **Confusing sign flags:** Casting a large `uint` value (where the highest bit is `1`) into a signed type like `sbyte` or `int` the result follows integral conversion rules; depending on the target width, high bits are discarded and the destination signed type interprets its own sign bit.

---

# Knowledge checks with answers

1. **Question:** Why does converting a `uint` to an `int` require an explicit cast even though both types use 32 bits of memory?
   * **Answer:** Because `uint` uses its bit pattern to represent larger positive numbers (up to $\approx 4.29$ billion) than a signed `int` can accommodate (which caps at $\approx 2.14$ billion due to reserving a sign bit).
2. **Question:** What happens conceptually when you execute `uint to byte (explicit numeric conversion)` on the value `300` in an unchecked context?
   * **Answer:** The value exceeds the maximum `byte` limit (`255`), unchecked conversion discards high-order bits according to the language's integral conversion rules.
3. **Question:** True or False: Converting `uint` to `nint` requires explicit syntax because target platform bit-widths can vary.
   * **Answer:** True.
