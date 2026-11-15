<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: uint implicit numeric conversions

# Scope and version

*Automatically generated draft.*

This reference lesson covers the exact named group of `uint` implicit numeric conversions in C# under C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior, checked on 2026-11-14. 

The scope is strictly limited to the following inventory items:
* `uint to long (implicit numeric conversion)`
* `uint to ulong (implicit numeric conversion)`
* `uint to float (implicit numeric conversion)`
* `uint to double (implicit numeric conversion)`
* `uint to decimal (implicit numeric conversion)`
* `uint to nuint (implicit numeric conversion)`

All nonnumeric conversions, arithmetic operators, formatting APIs, and conversions originating from types other than `uint` are excluded.

Source snapshot and specification references:
* [Microsoft Learn: Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)
* [Microsoft Learn: Integral Numeric Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types)
* [Microsoft Learn: Floating-Point Numeric Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)

---

# How this group fits the mental model

In C#, a numeric value is stored with a specific bit-width and interpretation (signed vs. unsigned, integral vs. floating-point, or native-sized). When you assign or pass a numeric value from one type to another, the language and compiler must decide whether the change is safe.

An **implicit conversion** occurs automatically without requiring explicit syntax (such as a cast operator like `(long)`). The compiler permits these conversions whenever the target type can fully represent every possible value of the source type without loss of magnitude or precision. Because an unsigned 32-bit integer (`uint`) has a known upper bound ($4,294,967,295$), any target type that can accommodate that maximum value safely without overflow can accept a `uint` implicitly.

---

# Supplied names explained

* **`uint to long (implicit numeric conversion)`**
  * *Definition:* Converts a 32-bit unsigned integer to a 64-bit signed integer (`System.Int64`).
  * *Role:* Since a 64-bit signed integer has a maximum value vastly larger than the maximum value of a 32-bit unsigned integer, the sign bit is never an issue. Zero extension is used under the hood to fill the upper 32 bits safely.

* **`uint to ulong (implicit numeric conversion)`**
  * *Definition:* Converts a 32-bit unsigned integer to a 64-bit unsigned integer (`System.UInt64`).
  * *Role:* Promotes the width of the unsigned container from 32 bits to 64 bits. No precision or magnitude is lost because the destination range strictly supersedes the source.

* **`uint to float (implicit numeric conversion)`**
  * *Definition:* Converts a 32-bit unsigned integer to a single-precision floating-point number (`System.Single`).
  * *Role:* Allows integers to combine freely with floats in expressions. For large `uint` values, some low-order precision bits may be rounded due to the finite mantissa of single-precision floats, but magnitude is preserved safely.

* **`uint to double (implicit numeric conversion)`**
  * *Definition:* Converts a 32-bit unsigned integer to a double-precision floating-point number (`System.Double`).
  * *Role:* Provides a wider floating-point container. A double-precision mantissa can precisely represent all integer values up to $2^{53}$, making this conversion lossless for any valid `uint`.

* **`uint to decimal (implicit numeric conversion)`**
  * *Definition:* Converts a 32-bit unsigned integer to a 128-bit high-precision decimal number (`System.Decimal`).
  * *Role:* Used heavily in financial or high-accuracy calculations. Because `decimal` has a massive integer-handling capacity, this conversion is completely exact and lossless.

* **`uint to nuint (implicit numeric conversion)`**
  * *Definition:* Converts a 32-bit unsigned integer to a native-sized unsigned integer (`System.UIntPtr`).
  * *Role:* Maps the 32-bit unsigned value to platform-native memory sizes (32-bit on 32-bit platforms, 64-bit on 64-bit platforms). Since `nuint` is at least 32 bits wide on all supported targets, this conversion is always safe.

---

# Cross-item comparison

The following table summarizes the target types, safety profiles, and potential precision behavior for the supplied `uint` implicit conversions:

| Target Type | Category | Precision Loss Risk? | Range Safety |
| :--- | :--- | :--- | :--- |
| **`long`** | Signed Integral | None | Fully safe (Destination range strictly larger) |
| **`ulong`** | Unsigned Integral | None | Fully safe (Destination range strictly larger) |
| **`float`** | Floating-Point | Possible for values $> 2^{24}$ | Magnitude safe, precision approximation |
| **`double`** | Floating-Point | None | Fully safe (Exact representation for all `uint`) |
| **`decimal`** | High-Precision | None | Fully safe (Exact representation for all `uint`) |
| **`nuint`** | Native Integral | None | Fully safe (At least 32 bits on all runtimes) |

---

# Examples

The following code snippets illustrate valid implicit conversions from a `uint` literal or variable into each permitted target type.

```csharp
// Unverified code example
uint sourceValue = 300_000U;

// 1. uint to long
long asLong = sourceValue;

// 2. uint to ulong
ulong asUlong = sourceValue;

// 3. uint to float
float asFloat = sourceValue;

// 4. uint to double
double asDouble = sourceValue;

// 5. uint to decimal
decimal asDecimal = sourceValue;

// 6. uint to nuint
nuint asNuint = sourceValue;
```

---

# Common mistakes

* **Assuming floating-point conversions are always exact for large integers:** While `double` and `decimal` preserve exact integer representation for all 32-bit values, converting a large `uint` to a `float` can lose exact least-significant digit precision due to `float` having only 24 bits of mantissa precision.
* **Confusing implicit conversions with parsing:** Implicit conversions apply to values already compiled or stored as `uint`. They do not parse strings (such as converting `"123"` to a number).
* **Attempting reverse implicit conversions:** While a `uint` converts implicitly to a `long`, a `long` **cannot** convert implicitly to a `uint` because a signed 64-bit integer can hold negative numbers or values too large for a 32-bit unsigned container. Doing so requires an explicit cast.

---

# Knowledge checks with answers

1. **Question:** Why is an explicit cast operator (like `(long)`) unnecessary when assigning a `uint` variable to a `long` variable?
   * **Answer:** Because the range of `long` completely covers all possible values of a `uint` without risk of overflow, C# permits an *implicit* numeric conversion.

2. **Question:** Between `float` and `double`, which conversion from `uint` guarantees zero loss of integer precision across the entire 32-bit range?
   * **Answer:** `double`. A double-precision float has a 53-bit mantissa, which safely and accurately represents every 32-bit integer value, whereas `float` may round lower-order bits for very large `uint` values.

3. **Question:** True or False: You can implicitly convert a `uint` to a `ulong` because the destination type has a larger capacity.
   * **Answer:** True.
