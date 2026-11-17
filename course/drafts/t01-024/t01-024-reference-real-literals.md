<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: Real literal forms

## Scope and version

* **Topic:** Real literal forms in C# numeric literals and numeric conversions.
* **Scope Boundary:** This reference lesson explains only the supplied inventory items governing real (floating-point and decimal) literal forms in C#. It excludes nonnumeric conversions, arithmetic operator catalogs, parsing APIs, and general integral literals.
* **Edition and Source Snapshot:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior ([Microsoft Learn C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)); checked 2026-11-17.
* **Draft Status:** Automatically generated draft.

---

## How this group fits the mental model

When writing C#, the literal syntax you choose directly determines the compile-time type of a numeric constant before any conversion occurs. Real literals represent fractional numbers and large magnitudes using decimal or exponential notation. Understanding literal forms allows you to control precision, memory usage, and how compiler-selected types interact with arithmetic operations and method overloading.

---

## Supplied names explained

* **Real literal without suffix (double):** A numeric literal containing a decimal point or an exponent without any type suffix is automatically treated by the compiler as type `double` (`System.Double`). Because `double` is the default category for unadorned real numbers, assigning such a literal to a smaller floating-point variable without an explicit cast or suffix can cause a compilation error.
* **Float suffix F or f:** Appending an `F` or `f` character to a real literal instructs the compiler to treat the constant as a `float` (`System.Single`) rather than a `double`. This is useful when targeting single-precision calculations to save memory or match specific API signatures.
* **Decimal suffix M or m:** Appending an `M` or `m` character designates the literal as a `decimal` (`System.Decimal`). The `decimal` type offers high precision and base-10 representation, making it useful when base-10 representation fits the domain; decimal arithmetic has finite precision and can still round.
* **Double suffix D or d:** Appending a `D` or `d` character explicitly marks the real literal as a `double`. While unadorned real literals default to `double`, adding the suffix explicitly clarifies intent in complex expressions or overloaded method calls.
* **Exponent notation E or e:** The `E` or `e` character introduces a scale factor expressed as a power of 10 (e.g., `1.5e2` means $1.5 \times 10^2$). Exponent notation can be combined with suffixes (such as `1.5e2f` or `4.2E-3m`) to define fractional numbers of a specific target type.
* **Digit separator _ in numeric literals:** The underscore character (`_`) can be placed anywhere between digits within a numeric literal (including real and exponent parts) to improve readability. The compiler ignores underscores completely; they have no effect on the numerical value or compile-time type.

---

## Cross-item comparison

* **Float suffix F or f vs. Decimal suffix M or m vs. Double suffix D or d vs. Real literal without suffix (double):** These forms select `float`, `decimal`, or `double`. `float`/`double` use binary floating point; `decimal` is decimal-scaled. Integral values can mix with these types under numeric promotion rules, but `decimal` cannot be mixed with `float` or `double` without an explicit conversion.
* **Exponent notation E or e vs. Digit separator _ in numeric literals:** Exponent notation changes the mathematical value of the literal by scaling it by powers of 10, whereas the digit separator is strictly a visual formatting aid that leaves the underlying value and type entirely unchanged.

---

## Examples

The following code snippets illustrate the syntax and compile-time typing rules for real literal forms. (Note: Unexecuted code example marked as unverified).

```csharp
// Unverified code example
// 1. Real literal without suffix defaults to double
double defaultDouble = 3.14;

// 2. Float suffix F/f
float singlePrecision = 3.14f;

// 3. Decimal suffix M/m for financial precision
decimal financialValue = 300.50m;

// 4. Double suffix D/d explicit designation
double explicitDouble = 3.14d;

// 5. Exponent notation E/e with suffixes
double avogadroLike = 6.022e23d;
float smallScientific = 1.5e-3F;

// 6. Digit separator _ for readability
double largePi = 3.14159_26535_89793;
decimal planetaryDistance = 149_600_000.50m;
```

---

## Common mistakes

* **Assigning an unadorned literal to a float variable:** Writing `float x = 3.14;` fails to compile because `3.14` is a `double` by default, and implicit conversion from `double` to `float` loses precision. You must use `3.14f` or an explicit cast.
* **Confusing decimal and binary floating-point ranges:** Using `double` for currency calculations can introduce binary rounding errors. Use an `M`/`m` suffix when you intend a decimal literal; whether `decimal` is the right type depends on the domain's rounding and range requirements.
* **Placing digit separators incorrectly:** While `_` improves readability, placing it adjacent to the decimal point (e.g., `3_.14`) or at the start/end of the literal (e.g., `_3.14`) is invalid syntax and causes a compiler error.

---

## Knowledge checks with answers

1. **What compile-time type does the C# compiler assign to the literal `123.45` when no suffix is present?**
   * *Answer:* `double` (`System.Double`).
2. **How does appending the `M` or `m` suffix change the behavior of a numeric literal compared to an unadorned real literal?**
   * *Answer:* It selects `decimal`, a 16-byte decimal-scaled type that can represent many decimal fractions exactly. Choose it when its range/scale and rounding behavior match the domain.
3. **What is the purpose of the underscore (`_`) character inside a numeric literal, such as `1_000.50m`?**
   * *Answer:* It acts as a digit separator to improve visual readability; the compiler ignores it entirely.
4. **Why will `float f = 5.5;` generate a compilation error, and how do you fix it?**
   * *Answer:* It fails because `5.5` is interpreted as a `double`, and implicit narrowing from `double` to `float` is not permitted. Fix it by adding the suffix: `float f = 5.5f;`.
