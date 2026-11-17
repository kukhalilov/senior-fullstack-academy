<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Reference: Standard conversions, user-defined conversions, overload resolution, and checked context

*This is an automatically generated draft.*

# Scope and version
This lesson covers standard and user-defined conversions, overload resolution, and checked arithmetic contexts in C#. The content is based on the stable C# 15 / .NET 11 specification as of 2026-11-14. Memory-safety preview features are excluded.

# How this group fits the mental model
In C#, types are strictly enforced. Conversions act as the bridge between these types, allowing data to flow between different representations.
*   **Standard conversions** are built-in rules (like `int` to `long`) that the compiler handles automatically.
*   **User-defined conversions** allow your custom types to participate in these same flows.
*   **Overload resolution** is the process the compiler uses to choose the "best" conversion when multiple paths exist.
*   **Checked contexts** manage how the system handles potential data loss (overflow) during these conversions.

# Supplied names explained

* `Implicit conversion`: A conversion permitted without a cast. Predefined implicit conversions always succeed, but some can lose precision; well-designed user-defined implicit conversions should not lose information or throw.
* `Explicit conversion`: A conversion that requires a cast (e.g., `(T)x`) because it might result in data loss or is not guaranteed to succeed.
* `Standard conversion`: The set of built-in conversion rules defined by the C# language specification.
* `Identity conversion`: A conversion from a type to itself; it does nothing at runtime.
* `Numeric conversion`: Converting between numeric types (e.g., `int` to `double`).
* `Constant expression conversion`: A specific rule allowing implicit conversion of constant expressions to a target type if the value fits.
* `Implicit constant expression conversion`: A subset of constant conversions that the compiler permits without an explicit cast.
* `Enumeration conversion`: Explicit conversions exist between an enum and its underlying integral type; constant zero has special implicit conversion to an enum, and enum-to-enum conversions have their own explicit rules.
* `Nullable conversion`: Converting between a value type and its `Nullable<T>` counterpart.
* `Reference conversion`: A standard conversion between reference types, including identity, inheritance/interface, array covariance, and applicable delegate/interface variance conversions.
* `Boxing conversion`: Converting a non-nullable value type to `object`, `System.ValueType`, or an implemented interface boxes it. Boxing a nullable value with a value boxes the underlying value; a nullable with no value boxes to null.
* `Unboxing conversion`: An explicit conversion from `object` or an interface to a value type performs a runtime unboxing check; nullable unboxing also accepts null as an empty nullable.
* `Implicit reference conversion`: A reference conversion that is always safe (e.g., derived class to base class).
* `Explicit reference conversion`: A reference conversion that requires a cast because it might fail at runtime (e.g., base class to derived class).
* `User-defined conversion`: A conversion declared by an `implicit` or `explicit` conversion operator. A conversion operation uses at most one user-defined conversion operator, though standard conversions can occur before and/or after it.
* `Implicit conversion operator`: A user-defined operator that allows automatic conversion.
* `Explicit conversion operator`: A user-defined operator that requires a cast.
* `Checked user-defined conversion operator`: A checked explicit conversion operator, declared with `operator checked`, selected in checked context when applicable; it must be paired with the corresponding unchecked explicit conversion operator in the same type.
* `Conversion operator overload resolution`: The language rules that identify applicable source/target types and the most-specific user-defined conversion; standard conversions may surround the selected operator. Ambiguous candidates make the conversion invalid.
* `Conversion chaining restriction`: A conversion operation uses at most one user-defined conversion operator; standard conversions can surround that operator.
* `Conversion from dynamic`: Rules for converting from the `dynamic` type to other types at runtime.
* `Conversion to dynamic`: Rules for converting any type to `dynamic`.
* `Conversion from object`: An explicit conversion may be a checked reference cast or unboxing conversion depending on the target; failure can throw at runtime.
* `Conversion from null literal`: The null literal converts to reference types, nullable value types, and pointer types in allowed unsafe contexts; nullable reference annotations affect warnings.
* `Conversion to nullable value type`: The process of wrapping a value type in `Nullable<T>`.
* `Conversion between nullable value types`: Rules for converting between different `Nullable<T>` types.
* `Conversion and nullable reference annotations`: How nullability metadata affects reference conversions.
* `Checked integral arithmetic context`: A scope in which applicable integral arithmetic and explicit numeric conversions throw `OverflowException` on overflow; constant-expression overflow is generally a compile-time error unless explicitly unchecked.
* `Checked explicit numeric conversion`: An explicit integral conversion in a checked context throws `OverflowException` when the value is outside range; decimal-to-integral overflow throws regardless of checked context.
* `Unchecked integral overflow behavior`: For applicable integral runtime operations in an unchecked context, overflow truncates/wraps without throwing. The default for nonconstant expressions is usually unchecked but is affected by the compiler option; constant expressions are checked by default.
* `Overflow in constant expression`: Integral constant expressions are checked by default and overflow is a compile-time error; an explicit `unchecked` constant expression can request truncation.
* `Overflow in runtime expression`: Applicable integral runtime overflow throws in a checked context and truncates in an unchecked context; decimal-to-integral out-of-range conversions throw regardless of context.
* `Built-in conversion candidate`: A standard conversion that the compiler considers during overload resolution.
* `User-defined conversion candidate`: A user-defined operator that the compiler considers during overload resolution.
* `Conversion overload resolution ambiguity`: A compile-time error when the compiler cannot determine a single best conversion.
* `Lifted conversion for nullable value type`: A conversion applied to the underlying value of a `Nullable<T>`.
* `Prefer explicit conversion for lossy transformation`: A design guideline to use `explicit` operators for operations that might lose data.
* `Implicit conversion design restriction`: A design guideline: user-defined implicit conversions should be unsurprising, not lose information, and not throw; this is not a full description of predefined implicit conversions.

# Cross-item comparison
* **Implicit vs. Explicit:** Implicit syntax is expected to be unsurprising and not lose information; explicit syntax signals a conversion that may lose information or fail. These are design guidelines, not a complete definition of language conversion categories.
* **Built-in vs. User-defined:** Built-in conversions are provided by the language; user-defined conversions are provided by the developer to integrate custom types.
* **Checked vs. Unchecked:** For applicable integral operations, checked context throws on overflow and unchecked context truncates. The context is a correctness choice, not primarily a performance switch.

# Examples
```csharp
// Implicit conversion (safe)
int myInt = 10;
long myLong = myInt;

// Explicit conversion (potentially lossy)
double myDouble = 10.5;
int myInt2 = (int)myDouble; // Data loss occurs here

// User-defined conversion
public readonly record struct Celsius(double Degrees)
{
    public static explicit operator Fahrenheit(Celsius c) => new(c.Degrees * 9 / 5 + 32);
}
public readonly record struct Fahrenheit(double Degrees);
```

# Common mistakes
1. **Chaining conversions:** Trying to perform two user-defined conversions in one line (e.g., `A -> B -> C`). C# only allows one user-defined conversion per step.
2. **Lossy implicit conversions:** Defining an `implicit` operator for a conversion that loses data. This violates the "Implicit conversion design restriction."
3. **Ignoring context:** Assuming an operation will throw an exception on overflow when it is actually in an `unchecked` context.

# Knowledge checks with answers
1. **Question:** Why must you use an `explicit` operator for a conversion that might lose data?
   **Answer:** To follow the "Prefer explicit conversion for lossy transformation" guideline, ensuring the developer acknowledges the potential data loss.
2. **Question:** What happens if the compiler finds two equally good user-defined conversion candidates?
   **Answer:** It results in "Conversion overload resolution ambiguity," and the code will not compile.
3. **Question:** Can you chain two user-defined conversions?
   **Answer:** No, the "Conversion chaining restriction" prevents this.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/user-defined-conversion-operators)*
