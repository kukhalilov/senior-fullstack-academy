
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
An **implicit conversion** is one the language permits without a cast; it is not always exact (for example, `long` to `float` can lose precision). An **explicit conversion** requires a cast because it can lose information or fail, but the cast alone does not choose a rounding or overflow policy.

### Literals
Literals are the raw values written in your code.
* **Integer Literals:** Can be decimal, hexadecimal (prefixed with `0x`), or binary (prefixed with `0b`). Use the `_` digit separator for readability (e.g., `1_000_000`).
* **Suffixes:** Append letters to literals to force a specific type: `U` (unsigned), `L` (long), `F` (float), `M` (decimal), or `D` (double).

### Conversions
* **Implicit:** The language permits the conversion without cast syntax. Some preserve the value exactly; others can lose floating-point precision while preserving order of magnitude.
* **Explicit:** A cast is required for paths where range, precision, or representation requires explicit handling. Runtime behavior depends on source/target types and checked context.

## Mechanisms and relationships
### Numeric Promotion
When performing arithmetic, C# applies operator-specific numeric promotion rules. For example, `int + long` produces `long`; decimal cannot be mixed with `float` or `double` without an explicit conversion.

### Checked and Unchecked Contexts
`checked` and `unchecked` affect integral arithmetic/conversions and floating-point-to-integral conversions, not every kind of numeric operation.
* **`checked`:** Applicable integral overflow and out-of-range floating-point-to-integral conversions throw `OverflowException`. Decimal-to-integral overflow throws regardless of context.
* **`unchecked`:** Integral-to-integral conversions use specified truncation/extension behavior. For floating-point-to-integral values outside range, C# leaves the result unspecified; .NET 9+ and .NET 11 add saturation for specified targets/runtimes. Decimal arithmetic can still throw in unchecked context.

### Runtime Behavior
Version-specific runtime behavior must be separated from C# language rules: .NET 9 documents saturation for unchecked conversions to `int`, `uint`, `long`, and `ulong` on x86 and x64; .NET 11 adds `sbyte`, `byte`, `short`, `ushort`, and `char` on CoreCLR (including its interpreter) and Native AOT, but not Mono. Checked conversions throw on out-of-range values.

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
* **Precision Loss:** `float`, `double`, and `decimal` have different representations and ranges. `decimal` can exactly represent many decimal fractions but isn't automatically the right financial model; follow domain scale and rounding rules.
* **NaN and Infinity:** Floating-point types support `NaN` (Not a Number), `PositiveInfinity`, and `NegativeInfinity`. Converting these to integral types behaves differently depending on the runtime version.
* **Runtime Differences:** Always check your target runtime. .NET 11 introduced more consistent saturation behavior for small integer conversions compared to older versions.

## Knowledge checks with answers

1. **Question:** Why does `int myInt = 10.5;` cause a compiler error?
   * **Answer:** `10.5` is a `double` literal. Converting `double` to `int` is a narrowing conversion that may lose data, so it requires an explicit cast: `(int)10.5`.

2. **Question:** What is the purpose of the `_` in `1_000_000`?
   * **Answer:** It is a digit separator used to improve code readability; it has no effect on the actual numeric value.

3. **Question:** What happens in an `unchecked` block if a conversion overflows?
   * **Answer:** It depends on source and destination. Unchecked integral casts truncate according to language rules; unchecked out-of-range floating-point results are unspecified at language level; decimal-to-integral out-of-range conversions throw even in unchecked code.

### Sources
* [C# Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)
* [Checked and Unchecked Keywords](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/checked-and-unchecked)
* [.NET 11 Floating-point to Small Integer Compatibility](https://learn.microsoft.com/en-us/dotnet/core/compatibility/jit/11/fp-to-small-integer)
