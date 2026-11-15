<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: int implicit numeric conversions

## Scope and version

* **Topic:** `int` implicit numeric conversions in C#
* **Scope and Boundary:** This reference lesson covers exactly the five predefined implicit numeric conversions originating from the `int` type, as specified in the frozen source snapshot. All nonnumeric conversions, explicit narrowing casts, parsing APIs, operator catalogs, and other source types are excluded.
* **Edition and Verification:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-14 ([Microsoft Learn Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
* **Draft Status:** Automatically generated draft.

---

## How this group fits the mental model

In C#, a numeric type conversion allows a value of one numeric type to be treated as another. When the target type is large enough to represent every possible value of the source type without losing magnitude or precision, C# performs this automatically. This is called an **implicit numeric conversion**.

The `int` type represents a 32-bit signed integer. Because other types provide wider ranges, floating-point precision, or exact high-precision decimal storage, a 32-bit signed integer can be converted into those wider or more flexible representations safely without an explicit cast operator. Understanding these paths helps you supply integer constants and variables to methods requiring wider types smoothly.

---

## Supplied names explained

* **int to long (implicit numeric conversion):** Converts a 32-bit signed integer (`int`) into a 64-bit signed integer (`long`). This is completely safe because every number that fits in 32 bits also fits in 64 bits.
* **int to float (implicit numeric conversion):** Converts a 32-bit signed integer (`int`) into a single-precision 32-bit floating-point number (`float`). While `float` uses a mantissa and exponent layout, all 32-bit integers can be converted, though very large integers may experience minor precision rounding because a `float` has 24 bits of mantissa precision.
* **int to double (implicit numeric conversion):** Converts a 32-bit signed integer (`int`) into a double-precision 64-bit floating-point number (`double`). A `double` provides 53 bits of mantissa precision, allowing it to represent all standard 32-bit integer values exactly.
* **int to decimal (implicit numeric conversion):** Converts a 32-bit signed integer (`int`) into a 128-bit high-precision decimal number (`decimal`). This conversion is exact because the `decimal` type is designed to hold financial and high-precision data with a scale, easily accommodating any 32-bit integer value without data loss.
* **int to nint (implicit numeric conversion):** Converts a 32-bit signed integer (`int`) into a native-sized signed integer (`nint`). On 32-bit platforms `nint` is 32 bits, and on 64-bit platforms it is 64 bits. Since an `int` is never larger than a native integer, this conversion is always safe and implicit.

---

## Cross-item comparison

| Source Type | Target Type | Conversion Category | Precision / Loss Risk |
| :--- | :--- | :--- | :--- |
| `int` | `long` | Implicit Numeric Conversion | None (wider bit-width) |
| `int` | `float` | Implicit Numeric Conversion | Possible precision loss for values exceeding 24 bits of magnitude |
| `int` | `double` | Implicit Numeric Conversion | None (53 bits of mantissa precision) |
| `int` | `decimal` | Implicit Numeric Conversion | None (exact high-precision representation) |
| `int` | `nint` | Implicit Numeric Conversion | None (adapts to 32-bit or 64-bit native size) |

---

## Examples

The following unverified code example demonstrates each of the five permitted implicit numeric conversions from an `int` variable:

```csharp
int sourceValue = 42;

// 1. int to long
long asLong = sourceValue;

// 2. int to float
float asFloat = sourceValue;

// 3. int to double
double asDouble = sourceValue;

// 4. int to decimal
decimal asDecimal = sourceValue;

// 5. int to nint
nint asNint = sourceValue;
```

*Expected results:* All assignments compile without an explicit cast operator (`(long)`, etc.). The resulting variables hold equivalent numerical values in their respective target types.

---

## Common mistakes

* **Expecting complete bit-exactness when converting to `float`:** Developers sometimes assume 32-bit integers convert to 32-bit floats with zero compromise. Because `float` reserves bits for an exponent, integers with large magnitudes can lose low-order precision bits.
* **Confusing implicit widening with narrowing conversions:** Attempting to assign a `long` or `double` back to an `int` implicitly will trigger a compilation error. Only conversions that never overflow or lose core integer range (such as the five listed in this inventory) are implicit.

---

## Knowledge checks with answers

1. **Question:** Why does the conversion from `int` to `double` not risk precision loss, whereas `int` to `float` can?
   * **Answer:** A `double` has a 53-bit significand (mantissa), which can perfectly represent all 32-bit integer values. A `float` has only a 24-bit significand, meaning integers larger than $2^{24}$ (16,777,216) cannot be represented with absolute exactness.
2. **Question:** Do you need an explicit cast operator (e.g., `(decimal)`) to assign an `int` variable to a `decimal` variable?
   * **Answer:** No. The conversion from `int` to `decimal` is an implicit numeric conversion ([Microsoft Learn Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
