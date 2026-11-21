<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# numeric literals and numeric conversions — Reference: nuint implicit numeric conversions

# Scope and version

* **Topic:** C# numeric literals and numeric conversions (`nuint` implicit conversions group)
* **Edition / Snapshot:** C# 15 / .NET 11 GA numeric conversions and .NET 9 behavior; checked 2026-11-20 ([Microsoft Learn Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions))
* **Scope Boundary:** This reference lesson covers only the exact supplied inventory group: `nuint` implicit numeric conversions to wider numeric types. Non-numeric conversions, explicit conversions, narrowing, parsing, and arithmetic operators are excluded from this catalog.

*Note: This is an automatically generated draft.*

# How this group fits the mental model

In C#, numeric types form a hierarchy based on their storage size and range. When you perform calculations or assign values, the compiler often needs to convert one numeric type to another.

* **Implicit conversions** happen automatically without requiring special syntax or cast operators because the target type is wide enough to hold every possible value of the source type without loss of magnitude.
* **`nuint`** represents a native unsigned integer type whose size is platform-dependent (32-bit in a 32-bit process, 64-bit in a 64-bit process).
* The inventory group covered in this lesson defines the exact pathways where a native unsigned integer can safely expand into a wider or floating-point representation without explicit casts.

# Supplied names explained

* **`nuint` to `ulong` (implicit numeric conversion)**: Allows a native unsigned integer to widen into a 64-bit unsigned integer (`ulong`). On 32-bit platforms, a `nuint` fits entirely inside a 64-bit `ulong`. On 64-bit platforms, both `nuint` and `ulong` are 64 bits wide, making this conversion safe and widening in terms of type representation.
* **`nuint` to `float` (implicit numeric conversion)**: Converts a native unsigned integer into a 32-bit single-precision floating-point number (`float`). Because `float` uses an exponent and a mantissa, very large native integers may experience a loss of precision, but the C# language specification permits this conversion implicitly.
* **`nuint` to `double` (implicit numeric conversion)**: Converts a native unsigned integer into a 64-bit double-precision floating-point number (`double`). A `double` has 53 bits of significand precision: every 32-bit `nuint` value converts exactly, while some 64-bit values round to a nearby representable value.
* **`nuint` to `decimal` (implicit numeric conversion)**: Converts a native unsigned integer into a 128-bit high-precision `decimal` type. All values of `nuint` fit exactly in `decimal` on supported 32/64-bit targets; subsequent decimal arithmetic may still round.

# Cross-item comparison

The supplied items represent the target destinations for implicit widening from `nuint`:

* **`nuint` to `ulong` vs. `nuint` to `float` / `double`**: Converting to `ulong` preserves the numeric integer value exactly (the types are numeric values, not a promise about identical physical bit patterns). Converting to `float` or `double` maps the integer into a floating-point format, which can introduce rounding approximations for numbers exceeding the mantissa precision limit.
* **`nuint` to `decimal` vs. `nuint` to floating-point types (`float`, `double`)**: `decimal` represents many base-10 fractions exactly, though its finite precision means arithmetic may still round, whereas `float` and `double` use binary scientific representation. All four, however, share the ability to be reached implicitly from `nuint` according to the language specification ([Microsoft Learn Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).

# Examples

The following code snippet demonstrates the usage of the supplied implicit conversions in a valid C# context.

*Unverified code example:*

```csharp
using System;

class Program
{
    static void Main()
    {
        nuint nativeUnsigned = 42;

        // nuint to ulong (implicit numeric conversion)
        ulong asUlong = nativeUnsigned;

        // nuint to float (implicit numeric conversion)
        float asFloat = nativeUnsigned;

        // nuint to double (implicit numeric conversion)
        double asDouble = nativeUnsigned;

        // nuint to decimal (implicit numeric conversion)
        decimal asDecimal = nativeUnsigned;

        Console.WriteLine(asUlong);
        Console.WriteLine(asFloat);
        Console.WriteLine(asDouble);
        Console.WriteLine(asDecimal);
    }
}
```

# Common mistakes

* **Assuming lossless precision into `float`**: Developers sometimes forget that converting a large integer (such as a 64-bit `nuint` on a 64-bit system) to a `float` can round the least significant digits due to `float` having only 24 bits of mantissa precision.
* **Confusing implicit with explicit directions**: Attempting to convert *from* `ulong` or `double` *to* `nuint` is not an implicit conversion and requires an explicit cast (which may throw overflow exceptions in a `checked` context), whereas converting *from* `nuint` to these wider types is safely implicit.

# Knowledge checks with answers

1. **Question:** Why is converting `nuint` to `ulong` allowed implicitly by the C# compiler?
   * **Answer:** The implicit conversion to `ulong` is defined because every supported 32- or 64-bit `nuint` value fits in `ulong`.
2. **Question:** Does converting `nuint` to `float` guarantee exact preservation of every bit pattern for large native integers?
   * **Answer:** No. While the conversion is implicit, `float` uses a finite mantissa (24 bits), which can cause precision loss for large integer values.
3. **Question:** Which supplied inventory conversion maintains base-10 high precision suitable for financial representations?
   * **Answer:** `nuint to decimal (implicit numeric conversion)` ([Microsoft Learn Numeric Conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/numeric-conversions)).
