<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Core concepts and how they fit together

*Draft: Automatically generated.*

# C# Numeric Literals and Numeric Conversions

## Learning objectives
* Understand how to define numeric values using literals.
* Distinguish between implicit and explicit numeric conversions.
* Learn how to manage overflow and precision using checked/unchecked contexts.
* Recognize how runtime updates affect numeric behavior.

## Prerequisites
* Basic familiarity with C# variable declaration.
* Understanding that different numeric types (e.g., `int`, `double`, `decimal`) have different memory sizes and precision capabilities.

## Core concepts
Numeric types in C# are governed by how they are represented in code (literals) and how they move between types (conversions).

### Mental Model
Think of numeric types as containers of different sizes and shapes. An **implicit conversion** is like pouring water from a small cup into a larger one—it is always safe. An **explicit conversion** is like pouring water from a large bucket into a small cup—you might lose data (overflow), so the compiler forces you to acknowledge the risk.

### Literals
Literals are the raw values written in your code.
* **Integer Literals:** Can be decimal, hexadecimal (prefixed with `0x`), or binary (prefixed with `0b`). Use the `_` digit separator for readability (e.g., `1_000_000`).
* **Suffixes:** Append letters to literals to force a specific type: `U` (unsigned), `L` (long), `F` (float), `M` (decimal), or `D` (double).

### Conversions
* **Implicit:** The compiler automatically converts the value because the target type is guaranteed to hold the source value.
* **Explicit:** Required when data loss is possible. You must use a cast, such as `(int)myDouble`.

## Mechanisms and relationships
### Numeric Promotion
When performing arithmetic, C# "promotes" operands to a common type. For example, adding an `int` and a `long` results in a `long`.

### Checked and Unchecked Contexts
By default, some conversions may silently truncate data.
* **`checked`:** Forces the runtime to throw an `OverflowException` if a conversion results in data loss.
* **`unchecked`:** Explicitly allows truncation or wrapping behavior.

### Runtime Behavior
Recent updates (e.g., .NET 9 and .NET 11) have standardized how floating-point numbers convert to integers. On modern runtimes, these conversions often use "saturating" behavior, where values exceeding the target range are clamped to the maximum or minimum possible value rather than wrapping around.

## Worked examples

### Example 1: Literals and Implicit Conversion
```csharp
// Using digit separators and suffixes
long myLong = 1_000_000L; 

// Implicit conversion: int fits into long
long promoted = 500; 
```

### Example 2: Explicit Conversion and Overflow
```csharp
double myDouble = 123.45;
// Explicit conversion: required because double has more precision than int
int myInt = (int)myDouble; // Result: 123 (truncation toward zero)

// Using checked to detect overflow
checked
{
    int largeValue = 2_000_000_000;
    // This would throw an OverflowException if the result exceeded int.MaxValue
    int result = (int)(largeValue * 2L); 
}
```

## Misconceptions and edge cases
* **Precision Loss:** Converting `double` to `decimal` or `int` is not just about size; it is about precision. `decimal` is preferred for financial calculations to avoid binary floating-point errors.
* **NaN and Infinity:** Floating-point types support `NaN` (Not a Number), `PositiveInfinity`, and `NegativeInfinity`. Converting these to integral types behaves differently depending on the runtime version.
* **Runtime Differences:** Always check your target runtime. .NET 11 introduced more consistent saturation behavior for small integer conversions compared to older versions.

## Knowledge checks with answers

1. **Question:** Why does `int myInt = 10.5;` cause a compiler error?
   * **Answer:** `10.5` is a `double` literal. Converting `double` to `int` is a narrowing conversion that may lose data, so it requires an explicit cast: `(int)10.5`.

2. **Question:** What is the purpose of the `_` in `1_000_000`?
   * **Answer:** It is a digit separator used to improve code readability; it has no effect on the actual numeric value.

3. **Question:** What happens in an `unchecked` block if a conversion overflows?
   * **Answer:** The value will typically wrap around (e.g., a positive number might become negative) rather than throwing an exception.

### Sources
* [C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)
* [Checked and Unchecked Keywords](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked)
* [.NET 11 Floating-point to Small Integer Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/11/fp-to-small-integer)
