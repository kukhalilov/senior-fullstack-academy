<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Interview questions and reasoning

*Automatically generated draft.*

# C# Numeric Literals and Numeric Conversions

In C#, numeric literals are the raw values you type into your code (like `10` or `3.14`). Understanding how these are interpreted by the compiler and how they convert between types is fundamental to writing safe, predictable code.

### Mental Model
Think of numeric types as containers of different sizes and shapes. 
*   **Implicit conversion** is like pouring water from a small cup into a large bucket; it is safe and automatic because the bucket can always hold the water.
*   **Explicit conversion** (casting) is like trying to pour a large bucket into a small cup; you must acknowledge the risk of "spilling" (data loss or overflow) by using a cast operator `(type)`.

---

### Core questions
1.  **What determines the type of a numeric literal?**
    *   The syntax (digits, suffixes, and prefixes) determines the compile-time type. For example, `10` is an `int`, but `10L` is a `long`.
2.  **What is the difference between implicit and explicit conversion?**
    *   Implicit conversions are safe, widening operations (e.g., `int` to `long`). Explicit conversions are narrowing operations that require a cast and may result in data loss or overflow.
3.  **How do `checked` and `unchecked` contexts affect conversions?**
    *   They control overflow behavior. In a `checked` block, an overflow throws an `OverflowException`. In an `unchecked` block, the value wraps around (truncation).

### Concise interview answers
*   **How do you define a `decimal` literal?** Use the `M` or `m` suffix (e.g., `1.5m`).
*   **What happens when you convert a `double` to an `int`?** It truncates toward zero. Since .NET 9, if the value is out of range, it uses saturating behavior (clamping to the min/max of the destination).
*   **Why use digit separators?** The underscore `_` (e.g., `1_000_000`) improves readability without affecting the numeric value.

### Deep follow-up answers
*   **Explain numeric promotion.** When performing arithmetic, C# promotes smaller types (like `short` or `byte`) to `int` before calculation to prevent overflow during intermediate steps.
*   **How has conversion behavior changed in recent versions?** In .NET 9, floating-point to integer conversions use saturating behavior for out-of-range values. In .NET 11, conversions between `decimal` and floating-point types are more accurately rounded, and unchecked conversions to small integers (like `byte` or `short`) saturate to destination bounds on CoreCLR/Native AOT.

### Scenario questions
*   **Scenario:** You are calculating financial data. Which type should you use?
    *   **Answer:** Use `decimal`. It provides higher precision and avoids the rounding errors inherent in binary floating-point types like `float` or `double`.
*   **Scenario:** You need to store a large number that exceeds `int.MaxValue`.
    *   **Answer:** Use a `long` or a `long` literal (e.g., `3_000_000_000L`).

### Tradeoffs and alternatives
*   **`float` vs `double` vs `decimal`:**
    *   `float`: Low precision, high performance, 32-bit.
    *   `double`: Standard precision, high performance, 64-bit.
    *   `decimal`: High precision, slower performance, 128-bit. Best for financial calculations.
*   **Implicit vs Explicit:** Implicit is preferred for safety. Explicit is necessary for narrowing but introduces the risk of `OverflowException` or data truncation.

### Common weak answers
*   **"Casts always work."** Weak because they ignore overflow risks and potential data loss.
*   **"All numbers are doubles by default."** Incorrect; integer literals default to `int` (or `long` if the value is too large), while real literals default to `double`.
*   **"I don't need to worry about overflow."** Weak because in `checked` contexts, overflow causes runtime crashes.

### Self-check rubric
*   **Can you identify the type of `10U`?** (Answer: `uint`)
*   **Can you explain why `int` to `long` is implicit?** (Answer: `long` has a larger range; no data loss is possible.)
*   **What is the purpose of the `_` in `1_000`?** (Answer: Readability; it is ignored by the compiler.)
*   **What happens to `double.NaN` when converted to an integer in .NET 9?** (Answer: It saturates to the destination's bounds.)

***

**Sources:**
*   [C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)
*   [Checked and Unchecked](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked)
*   [.NET 9 Floating-point to Integer Conversion](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/9.0/fp-to-integer)
*   [.NET 11 Floating-point to Small Integer Conversion](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/11/fp-to-small-integer)
