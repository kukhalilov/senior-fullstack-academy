<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Big-picture orientation and mental model

*This is an automatically generated draft.*

# C# Numeric Literals and Numeric Conversions

## Problem and purpose
In C#, you frequently need to represent numbers—ranging from simple counts to precise financial values—and move those values between different types. The challenge is that numbers have different storage sizes and levels of precision. If you try to put a large number into a small container, or a precise decimal into a format that doesn't support it, you risk data loss or errors. This topic provides the rules for defining numbers in code and safely (or explicitly) converting them between types.

## Plain-language mental model
Think of numeric types as containers of different sizes and shapes. 
*   **Implicit conversion** is like pouring water from a small cup into a large bucket; it is safe, automatic, and guaranteed not to spill.
*   **Explicit conversion** is like pouring from a large bucket into a small cup; you must use a "funnel" (a cast) to tell the compiler you accept the risk that some water might overflow or be lost.
*   **Literals** are the raw ingredients—the numbers you type directly into your code. By adding suffixes (like `L` or `f`), you tell the compiler exactly which "container" to use for that value.

## How the parts fit together
The system relies on three layers:
1.  **Literals:** How you write numbers (e.g., `100` vs `100L`). This sets the initial type.
2.  **Conversion Rules:** The logic that determines if a value can move from Type A to Type B.
3.  **Context:** The environment (like `checked` or `unchecked` blocks) that dictates what happens when a conversion results in a value that is too large for the destination.

## Concept map
*   **Literal Syntax:** Defines the starting type (e.g., `1.0` is `double`, `1.0f` is `float`).
*   **Implicit Conversion:** Safe, automatic widening (e.g., `int` to `long`).
*   **Explicit Conversion:** Manual narrowing (e.g., `long` to `int`), requiring a cast.
*   **Numeric Promotion:** How the compiler decides the type of an expression (e.g., `int + double` results in a `double`).
*   **Overflow Behavior:** How the system handles values that exceed the destination's capacity (e.g., `OverflowException` vs. truncation).

## End-to-end walkthrough
Imagine you are calculating a total:

1.  **Define:** You write `int count = 10;`. The literal `10` is treated as an `int`.
2.  **Promote:** You add a `double` value: `var total = count + 5.5;`. Because `double` is more precise, the compiler promotes the `int` to a `double` automatically.
3.  **Convert:** You need to store the result in a smaller type: `short finalResult = (short)total;`. You must use an explicit cast `(short)` because the compiler won't assume it's safe to lose the decimal part or potentially overflow the `short`.
4. **Handle:** If `total` is `40000`, an unchecked cast to `short` discards high bits according to integral conversion rules; a checked cast throws `OverflowException`.

## When to use it and tradeoffs
*   **Use implicit conversions** whenever possible to keep code clean and safe.
*   **Use explicit conversions** only when you are certain the value fits or when you intentionally want to truncate data (like removing decimals).
*   **Tradeoff:** Using `decimal` provides high precision for money but is slower than `float` or `double`. Using `float`/`double` is fast but introduces approximation errors.
*   **Runtime Changes:** Be aware that C# leaves unchecked out-of-range floating-point-to-integral results unspecified; documented .NET runtime versions and target types may saturate, which can change your application's behavior without changing your code.

## What later lessons cover
*   **Detailed API Catalog:** A breakdown of every specific conversion path (e.g., `sbyte` to `long`, `float` to `int`).
*   **Overflow Management:** Deep dives into `checked` and `unchecked` blocks.
*   **Floating-Point Nuances:** Understanding `NaN`, `PositiveInfinity`, and precision limits.

*Sources: [Microsoft Learn - Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions), [Integral Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types), [Floating-Point Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types), [Checked/Unchecked](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked).*
