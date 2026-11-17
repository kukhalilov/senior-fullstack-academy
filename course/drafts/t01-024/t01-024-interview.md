<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Interview questions and reasoning

*Automatically generated draft.*

# C# Numeric Literals and Numeric Conversions

In C#, numeric literals are the raw values you type into your code (like `10` or `3.14`). Understanding how these are interpreted by the compiler and how they convert between types is fundamental to writing safe, predictable code.

### Mental Model
Think of numeric types as containers of different sizes and shapes.
*   An implicit conversion is permitted without cast syntax; some, such as `long` to `float`, lose precision. Explicit conversions require a cast and have source/target-specific range and rounding behavior.

---

### Core questions
1.  **What determines the type of a numeric literal?**
    *   The syntax (digits, suffixes, and prefixes) determines the compile-time type. For example, `10` is an `int`, but `10L` is a `long`.
2.  **What is the difference between implicit and explicit conversion?**
    *   Implicit conversions are the paths allowed by the language and can still lose precision (e.g., `long` to `float`). Explicit conversions require a cast and may lose range or precision.
3.  **How do `checked` and `unchecked` contexts affect conversions?**
    *   They affect specified integral arithmetic/conversions and floating-point-to-integral conversions. Unchecked integral narrowing follows truncation rules; floating-point out-of-range behavior and decimal conversions follow distinct rules.

### Concise interview answers
*   **How do you define a `decimal` literal?** Use the `M` or `m` suffix (e.g., `1.5m`).
*   **What happens when you convert a `double` to an `int`?** It truncates toward zero. In a checked context, an out-of-range conversion throws. In an unchecked context, the C# result is unspecified; .NET 9 documents saturation for specified runtime targets. NaN maps to zero in that documented behavior.
*   **Why use digit separators?** The underscore `_` (e.g., `1_000_000`) improves readability without affecting the numeric value.

### Deep follow-up answers
*   **Explain numeric promotion.** C# applies operator-specific rules; `byte`/`short` operands commonly promote to `int`. This rule is not a guarantee against overflow.
*   **How has conversion behavior changed in recent versions?** For .NET 9, documented runtime targets saturate unchecked conversions to `int`, `uint`, `long`, and `ulong`; .NET 11 adds selected small targets on CoreCLR and Native AOT. Checked out-of-range conversions throw. In .NET 11, conversions between `decimal` and `float`/`double` are correctly rounded from the exact source value, and unchecked conversions to small integers (like `byte` or `short`) saturate to destination bounds on CoreCLR/Native AOT.

### Scenario questions
*   **Scenario:** You are implementing a financial calculation. What guides the numeric representation?
    *   **Answer:** The domain's required scale, rounding, range, and interoperability. `decimal` often fits base-10 amounts, but it has finite precision and can still round.
*   **Scenario:** You need to store a large number that exceeds `int.MaxValue`.
    *   **Answer:** Use a `long` or a `long` literal (e.g., `3_000_000_000L`).

### Tradeoffs and alternatives
*   **`float` vs `double` vs `decimal`:**
    *   `float`: 32-bit binary floating-point, about 6–9 decimal digits.
    *   `double`: 64-bit binary floating-point, about 15–17 decimal digits.
    *   `decimal`: 16-byte decimal-scaled representation, about 28–29 digits; performance depends on workload.
*   **Implicit vs Explicit:** Follow the type and domain contract; implicit conversions can lose precision, while casts do not automatically validate inputs.

### Common weak answers
*   **"Casts always work."** Weak because they ignore overflow risks and potential data loss.
*   **"All numbers are doubles by default."** Incorrect; integer literals default to `int` (or `long` if the value is too large), while real literals default to `double`.
*   **"I don't need to worry about overflow."** Weak because in `checked` contexts, overflow causes runtime crashes.

### Self-check rubric
*   **Can you identify the type of `10U`?** (Answer: `uint`)
*   **Can you explain why `int` to `long` is implicit?** (Answer: Every `int` value fits in `long` and is preserved exactly.)
*   **What is the purpose of the `_` in `1_000`?** (Answer: Readability; it is ignored by the compiler.)
*   **What happens to `double.NaN` when converted to an integer in .NET 9?** (Answer: In the documented .NET 9 unchecked conversion behavior, NaN converts to zero.)

***

**Sources:**
*   [C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)
*   [Checked and Unchecked](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked)
*   [.NET 9 Floating-point to Integer Conversion](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/9.0/fp-to-integer)
*   [.NET 11 Floating-point to Small Integer Conversion](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/11/fp-to-small-integer)
