<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: byte explicit numeric conversions

## Scope and version

* **Topic:** C# numeric literals and numeric conversions (`byte` explicit numeric conversions)
* **Scope Boundary:** This reference lesson covers exactly two conversions starting from the `byte` type: `byte to sbyte (explicit numeric conversion)` and `byte to char (explicit numeric conversion)`. Nonnumeric conversions, larger integral conversions, and parsing APIs are excluded.
* **Edition & Snapshot Date:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-17.
* **Sources:** [Microsoft Learn Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions) [1], [Microsoft Learn Integral Numeric Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types) [2].

---

## How this group fits the mental model

In C#, numeric types have distinct storage ranges and signedness rules. A `byte` is an unsigned 8-bit integer type storing values from `0` to `255`.

An explicit conversion from `byte` is required for the listed targets because C# does not define an implicit path to them. In checked context, an out-of-range conversion throws; unchecked integral conversion follows language-defined low-bit and signedness rules.

The inventory group covered in this lesson (`byte to sbyte` and `byte to char`) represents narrow transitions where the compiler refuses implicit conversions because:
1. An `sbyte` uses signed representation (`-128` to `127`), meaning large `byte` values will exceed the positive boundary.
2. A `char` represents a UTF-16 code unit (`U+0000` to `U+FFFF`), which bridges an integral value to a character identity.

---

## Supplied names explained

* **`byte to sbyte (explicit numeric conversion)`**: Converts an unsigned 8-bit integer (`byte`) into a signed 8-bit integer (`sbyte`). Because the maximum value of a `byte` (`255`) exceeds the maximum value of an `sbyte` (`127`), this requires an explicit cast operator `(sbyte)`. Values from `0` through `127` retain their numeric value, while values from `128` through `255` in checked context, out-of-range values throw `OverflowException`; in unchecked context, integral conversion truncates to the low-order bits according to language rules.
* **`byte to char (explicit numeric conversion)`**: Converts an unsigned 8-bit integer (`byte`) into a 16-bit UTF-16 code unit (`char`). Because moving from an 8-bit integral storage format to a 16-bit character format requires an explicit cast syntax, this is treated as an explicit numeric conversion. The resulting `char` takes the UTF-16 code unit with that numeric value; values 0–127 correspond to ASCII code points, while 128–255 are not all ASCII.

---

## Cross-item comparison

| Conversion Name | Source Type | Destination Type | Why It Requires Explicit Syntax | Overflow / Range Behavior |
| :--- | :--- | :--- | :--- | :--- |
| **byte to sbyte (explicit numeric conversion)** | `byte` (Unsigned 8-bit, 0 to 255) | `sbyte` (Signed 8-bit, -128 to 127) | Potential loss of positive range (values 128–255 exceed `sbyte.MaxValue`). | Can throw `OverflowException` in a `checked` context if out of bounds. |
| **byte to char (explicit numeric conversion)** | `byte` (Unsigned 8-bit, 0 to 255) | `char` (Unsigned 16-bit, U+0000 to U+FFFF) | Crosses type categories from integral numeric to UTF-16 character representation. | Safe for all valid `byte` inputs because `byte` fits entirely within the lower range of `char`. |

---

## Examples

> **Note:** The following code snippets are unverified and provided as pseudocode/examples conforming to C# syntax rules.

### Example 1: Basic explicit conversions
```csharp
byte originalByte = 100;

// Explicit conversion from byte to sbyte
sbyte convertedSbyte = (sbyte)originalByte;

// Explicit conversion from byte to char
char convertedChar = (char)originalByte;
```
* **Expected Result:** `convertedSbyte` becomes `100` (since it is within the `sbyte` positive range). `convertedChar` becomes the character with code point `100` (which is `'d'`).

### Example 2: Handling values above 127 for sbyte
```csharp
byte highByte = 200;

// Explicit conversion in an unchecked context
sbyte wrappedSbyte = (sbyte)highByte;
```
* **Expected Result:** In an `unchecked` context (the default), `200` bit-shifts or wraps into the negative range, resulting in `-56`. In a `checked` context, this operation throws an `OverflowException`.

---

## Common mistakes

* **Assuming implicit safety:** Attempting `sbyte sb = byteVal;` without the explicit cast `(sbyte)` will cause a compilation error. The C# compiler disallows implicit narrowing or signedness-changing conversions.
* **Forgetting checked contexts:** Ignoring whether code runs inside a `checked` block when converting `byte` to `sbyte` values greater than `127`, leading to undetected numeric corruption instead of exceptions.
* **Confusing character codes with digit values:** Treating `byte to char` as a numeric digit parser (e.g., expecting `byte 5` to become character `'5'`, code point `53`). Instead, `byte 5` maps directly to character code point `U+0005`.

---

## Knowledge checks with answers

1. **Question:** Why does converting a `byte` to an `sbyte` require an explicit conversion instead of happening implicitly?
   * **Answer:** Because the `byte` type can hold positive values up to `255`, whereas an `sbyte` can only hold values up to `127`. An implicit conversion would risk unintended range violations without developer acknowledgment.
2. **Question:** What is the resulting character code point when you perform a `byte to char (explicit numeric conversion)` on a `byte` with the value `65`?
   * **Answer:** The resulting `char` has the code point `65` (which corresponds to the uppercase ASCII letter `'A'`).
3. **Question:** In the default `unchecked` context, what happens to the value when an out-of-range `byte` (such as `200`) undergoes a `byte to sbyte (explicit numeric conversion)`?
   * **Answer:** The bits are reinterpreted under two's complement rules, resulting in a negative value (`-56`), rather than throwing an exception.
