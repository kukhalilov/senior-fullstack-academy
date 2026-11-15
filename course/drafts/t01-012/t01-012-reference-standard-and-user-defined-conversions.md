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

* `Implicit conversion`: A conversion that the compiler performs automatically because it is guaranteed to be safe and non-lossy.
* `Explicit conversion`: A conversion that requires a cast (e.g., `(T)x`) because it might result in data loss or is not guaranteed to succeed.
* `Standard conversion`: The set of built-in conversion rules defined by the C# language specification.
* `Identity conversion`: A conversion from a type to itself; it does nothing at runtime.
* `Numeric conversion`: Converting between numeric types (e.g., `int` to `double`).
* `Constant expression conversion`: A specific rule allowing implicit conversion of constant expressions to a target type if the value fits.
* `Implicit constant expression conversion`: A subset of constant conversions that the compiler permits without an explicit cast.
* `Enumeration conversion`: Converting between an `enum` and its underlying integral type.
* `Nullable conversion`: Converting between a value type and its `Nullable<T>` counterpart.
* `Reference conversion`: Converting between reference types based on inheritance or interface implementation.
* `Boxing conversion`: Converting a value type to the `object` type or an interface type it implements.
* `Unboxing conversion`: Converting an `object` or interface type back to a specific value type.
* `Implicit reference conversion`: A reference conversion that is always safe (e.g., derived class to base class).
* `Explicit reference conversion`: A reference conversion that requires a cast because it might fail at runtime (e.g., base class to derived class).
* `User-defined conversion`: A custom conversion defined by a developer using `implicit` or `explicit` operators.
* `Implicit conversion operator`: A user-defined operator that allows automatic conversion.
* `Explicit conversion operator`: A user-defined operator that requires a cast.
* `Checked user-defined conversion operator`: A conversion operator that respects the `checked` context for overflow.
* `Conversion operator overload resolution`: The algorithm the compiler uses to select the best user-defined conversion.
* `Conversion chaining restriction`: A rule preventing the compiler from applying more than one user-defined conversion in a single step.
* `Conversion from dynamic`: Rules for converting from the `dynamic` type to other types at runtime.
* `Conversion to dynamic`: Rules for converting any type to `dynamic`.
* `Conversion from object`: Rules for converting from `object` to a specific type (often involving unboxing).
* `Conversion from null literal`: The ability to assign `null` to nullable types or reference types.
* `Conversion to nullable value type`: The process of wrapping a value type in `Nullable<T>`.
* `Conversion between nullable value types`: Rules for converting between different `Nullable<T>` types.
* `Conversion and nullable reference annotations`: How nullability metadata affects reference conversions.
* `Checked integral arithmetic context`: A scope where overflow causes a runtime exception.
* `Checked explicit numeric conversion`: An explicit cast that throws an exception on overflow.
* `Unchecked integral overflow behavior`: The default behavior where overflow wraps around without an exception.
* `Overflow in constant expression`: A compile-time error when a constant calculation exceeds the target type's range.
* `Overflow in runtime expression`: A potential runtime exception or wrap-around depending on the `checked` context.
* `Built-in conversion candidate`: A standard conversion that the compiler considers during overload resolution.
* `User-defined conversion candidate`: A user-defined operator that the compiler considers during overload resolution.
* `Conversion overload resolution ambiguity`: A compile-time error when the compiler cannot determine a single best conversion.
* `Lifted conversion for nullable value type`: A conversion applied to the underlying value of a `Nullable<T>`.
* `Prefer explicit conversion for lossy transformation`: A design guideline to use `explicit` operators for operations that might lose data.
* `Implicit conversion design restriction`: A guideline that `implicit` operators should only be used for safe, non-lossy transformations.

# Cross-item comparison
* **Implicit vs. Explicit:** Implicit is for safe, lossless operations; explicit is for potentially lossy or failing operations.
* **Built-in vs. User-defined:** Built-in conversions are provided by the language; user-defined conversions are provided by the developer to integrate custom types.
* **Checked vs. Unchecked:** Checked contexts ensure safety by throwing exceptions on overflow; unchecked contexts prioritize performance by allowing wrap-around.

# Examples
```csharp
// Implicit conversion (safe)
int myInt = 10;
long myLong = myInt; 

// Explicit conversion (potentially lossy)
double myDouble = 10.5;
int myInt2 = (int)myDouble; // Data loss occurs here

// User-defined conversion
public struct Celsius {
    public double Degrees;
    public static explicit operator Fahrenheit(Celsius c) => new Fahrenheit { Degrees = c.Degrees * 9 / 5 + 32 };
}
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
