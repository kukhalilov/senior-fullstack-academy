<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Exercises and worked solutions

# C# Numeric Literals and Conversions

*Draft: Automatically generated for educational purposes.*

## Goals
*   Understand how literal syntax determines the initial type of a number.
*   Master the difference between implicit (safe) and explicit (risky) conversions.
*   Learn how `checked` and `unchecked` contexts control overflow behavior.
*   Recognize how runtime updates (like .NET 9/11) affect floating-point to integer conversions.

## Worked Example
In C#, the compiler assigns a type to a literal based on its suffix. If you omit a suffix, the compiler defaults to `int` for integers and `double` for real numbers.

```csharp
// Literals
var a = 100;          // int
var b = 100L;         // long
var c = 100.5;        // double
var d = 100.5f;       // float
var e = 1_000_000;    // Digit separator for readability

// Implicit conversion (Safe)
int myInt = 10;
long myLong = myInt;  // Implicit: int to long is always safe

// Explicit conversion (Requires cast)
long largeLong = 5000000000L;
int truncatedInt = (int)largeLong; // Explicit: Potential data loss
```

## Exercises

### Exercise 1: Literal Types
Identify the type of these literals:
1. `123`
2. `123U`
3. `123.0`
4. `123.0m`

### Exercise 2: Implicit vs Explicit
Which of these assignments will cause a compile-time error?
1. `long x = 10;`
2. `int y = 10L;`
3. `float z = 10;`

### Exercise 3: Overflow Behavior
Predict the result of this code:
```csharp
checked {
    int val = (int)3000000000.0; 
}
```

## Progressive Hints

*   **Exercise 1:** Remember that default literals without suffixes are `int` (for integers) and `double` (for real numbers).
*   **Exercise 2:** Implicit conversions only work if the destination type can hold all possible values of the source type.
*   **Exercise 3:** A `double` value of 3 billion is larger than the maximum value of a 32-bit `int` (approx. 2.1 billion). The `checked` keyword forces an exception when data loss occurs.

## Complete Solutions

### Exercise 1
1. `int`
2. `uint`
3. `double`
4. `decimal`

### Exercise 2
1. Valid (Implicit).
2. **Error**: Cannot implicitly convert `long` to `int` because `long` is larger. Requires an explicit cast.
3. Valid (Implicit).

### Exercise 3
This will throw an `OverflowException`. Because 3,000,000,000 exceeds `int.MaxValue` (2,147,483,647), the `checked` block detects the overflow and throws an exception rather than silently truncating the bits.

## Tests and Edge Cases
*   **Floating-point to Integer:** C# leaves unchecked out-of-range floating-point-to-integral results unspecified; documented .NET 9 targets saturate unchecked conversions to `int`, `uint`, `long`, and `ulong`. Checked conversions throw.
*   **Small Integer Saturation:** As of .NET 11, unchecked conversions to those small integral types saturate on CoreCLR and Native AOT; Mono is excluded. Checked conversions still throw on out-of-range inputs.
*   **Precision:** `decimal` is preferred for financial calculations to avoid the approximation errors inherent in `float` and `double` (binary floating-point).

## Reflection Questions
1. Why does C# require an explicit cast for `int y = 10L;` but not for `long x = 10;`?
2. How does the `_` digit separator change the underlying value of a literal?
3. If you are working with currency, why should you use the `m` suffix instead of the `d` suffix?

## Sources
* [Microsoft Learn: Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)
* [Microsoft Learn: Integral Numeric Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types)
* [Microsoft Learn: Floating-point Numeric Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)
* [Microsoft Learn: Checked and Unchecked](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked)
* [.NET 9 Floating-point to Integer Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/9.0/fp-to-integer)
* [.NET 11 Floating-point to Small Integer Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/11/fp-to-small-integer)
