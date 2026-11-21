
# C# numeric literals and numeric conversions — Reference: long explicit numeric conversions

# Scope and version

**Scope and Version:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-20. Source authority: Microsoft Learn C# numeric literal, numeric conversion, and numeric type references [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions).

This reference lesson covers one bounded inventory group: **long explicit numeric conversions**. All nonnumeric conversions, arithmetic operator catalogs beyond promotion, parsing APIs, and representation internals are excluded.

---

# How this group fits the mental model

In C#, numeric types have distinct sizes and ranges. When you store a value from a wider type (such as a 64-bit integer like `long`) into a narrower or differently sized type, C# requires an **explicit numeric conversion** (a cast). This signals caller responsibility because information loss—such as truncation of higher bits or sign changes—can occur if the source value exceeds the destination type's capacity.

The items in this reference inventory dictate how a 64-bit signed integer (`long`) transforms into other integral or character types when an explicit cast is applied.

---

# Supplied names explained

The following ten explicit conversions define the complete scope of this reference inventory group:

1. **long to sbyte (explicit numeric conversion)**: Casts a 64-bit signed integer to an 8-bit signed integer. Required because `long` has a much larger range than `sbyte`.
2. **long to byte (explicit numeric conversion)**: Casts a 64-bit signed integer to an 8-bit unsigned integer. Required because of both range differences and the shift from signed to unsigned representation.
3. **long to short (explicit numeric conversion)**: Casts a 64-bit signed integer to a 16-bit signed integer (`short`).
4. **long to ushort (explicit numeric conversion)**: Casts a 64-bit signed integer to a 16-bit unsigned integer (`ushort`).
5. **long to int (explicit numeric conversion)**: Casts a 64-bit signed integer to a 32-bit signed integer (`int`), dropping the upper 32 bits.
6. **long to uint (explicit numeric conversion)**: Casts a 64-bit signed integer to a 32-bit unsigned integer (`uint`).
7. **long to ulong (explicit numeric conversion)**: Casts a 64-bit signed integer to a 64-bit unsigned integer (`ulong`), shifting sign interpretation.
8. **long to nint (explicit numeric conversion)**: Casts a 64-bit signed integer to a native-sized signed integer (`nint`), which is 32-bit on 32-bit architectures and 64-bit on 64-bit architectures.
9. **long to nuint (explicit numeric conversion)**: Casts a 64-bit signed integer to a native-sized unsigned integer (`nuint`).
10. **long to char (explicit numeric conversion)**: Casts a 64-bit signed integer to a 16-bit UTF-16 code unit (`char`), not necessarily a complete Unicode scalar value.

---

# Cross-item comparison

- **Signed vs. Unsigned destinations (`long to sbyte` vs. `long to byte`, `long to short` vs. `long to ushort`, `long to int` vs. `long to uint`, `long to nint` vs. `long to nuint`)**: In checked conversions, negative values cannot convert to unsigned targets and out-of-range values throw. In unchecked conversions, narrowing integral values follow specified bit truncation and destination interpretation rules.
- **Fixed-width vs. Native-width (`long to int` vs. `long to nint`, `long to uint` vs. `long to nuint`)**: Fixed-width conversions always target a 32-bit boundary regardless of architecture. Native-width conversions target 32-bit or 64-bit sizes depending on the target platform architecture.

---

# Examples

The following code snippet demonstrates explicit casting from `long` to several inventory types.

```csharp
// Unverified code example (syntax valid for C# 15 / .NET 11)
long largeValue = 300L;

// long to short (explicit numeric conversion)
short asShort = (short)largeValue;

// long to sbyte (explicit numeric conversion) - 300 exceeds sbyte max (127)
sbyte asSByte = (sbyte)largeValue;

// long to char (explicit numeric conversion)
char asChar = (char)65L; // Represents 'A'
```

*Expected results:* `asShort` becomes `300`. The `asSByte` conversion throws in checked context; in unchecked context it keeps the low 8 bits. `asChar` becomes `'A'`.

---

# Common mistakes

- **Assuming implicit safety**: Attempting to assign a `long` variable directly to an `int` or `byte` without an explicit cast (`(int)` or `(byte)`) causes a compile-time error.
- **Ignoring overflow without context**: Checked integral casts throw when out of range; unchecked integral narrowing follows defined bit rules. Floating-point and decimal conversions have different rules.

---

# Knowledge checks with answers

1. **Question:** Why does assigning a `long` value to a `byte` variable require an explicit cast?
   * **Answer:** Because `long` has a larger size and range than `byte`, meaning an implicit conversion could cause silent data loss. The explicit cast signals caller responsibility.
2. **Question:** What happens when you perform a `long to char` explicit numeric conversion using a number corresponding to a valid UTF-16 code point?
   * **Answer:** An in-range numeric result becomes a UTF-16 code-unit value; it may be a surrogate and not a standalone Unicode scalar.
