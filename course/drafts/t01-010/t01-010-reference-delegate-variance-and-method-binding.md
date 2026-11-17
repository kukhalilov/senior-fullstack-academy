<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# covariance contravariance invariant types and delegates — Reference: Variant delegate declarations, Func/Action, and method-group compatibility

# Scope and version
This reference lesson covers the exact named group **delegate-variance-and-method-binding**, focused on variant delegate declarations, `Func` and `Action` usages, and method-group compatibility rules under .NET 11 and C# 15 variance rules checked on 2026-11-14 (source: [.NET generic variance documentation](https://learn.microsoft.com/en-us/dotnet/standard/generics/covariance-and-contravariance)).

# How this group fits the mental model
*Mental model:* Variance controls whether a reference to a constructed generic or delegate type can be implicitly converted to a differently parameterized version of the same type based on inheritance. 
- **Covariance** (marked with `out`) preserves the inheritance direction, allowing a delegate that *produces* a derived type to be assigned where a base type is expected.
- **Contravariance** (marked with `in`) reverses the inheritance direction, allowing a delegate that *consumes* a base type to be assigned where a derived type is expected.
- **Method-group binding** allows existing methods and lambdas to fit delegate targets flexibly when parameter and return types are compatible through subtyping.

# Supplied names explained
- `Variant generic delegate declaration`: Defining a delegate type with `in` or `out` variance annotations on its generic type parameters, establishing compile-time assignment safety across derived and base types.
- `Covariant delegate return type parameter`: A delegate type parameter annotated with `out`, whose occurrences satisfy output-safety rules, enabling safe assignment of delegates returning more derived types.
- `Contravariant delegate parameter type parameter`: A delegate type parameter annotated with `in`, whose occurrences satisfy input-safety rules, enabling safe assignment of delegates accepting wider (base) types.
- `Func<TResult> covariance`: The built-in zero-argument `Func<TResult>` delegate is covariant in its `TResult` parameter, permitting assignment of a delegate returning a derived type to a variable expecting a base type result.
- `Func<T,TResult> input contravariance`: The behavior where the input parameter `T` of a single-argument `Func` delegate is contravariant, allowing a function expecting a base parameter to be used where a derived parameter is requested.
- `Func<T,TResult> result covariance`: The behavior where the output parameter `TResult` of a single-argument `Func` delegate is covariant, allowing a function returning a derived result to be used where a base result is requested.
- `Action<T> contravariance`: The built-in single-argument `Action<T>` delegate is contravariant in `T`, allowing a method that handles a base type to be assigned where an action handling a derived type is required.
- `Action<T1,T2> contravariance`: Multi-argument `Action` delegates are contravariant across all their type parameters (`T1`, `T2`, etc.), allowing each input parameter to accept base types safely.
- `Predicate<T> contravariance`: The `Predicate<T>` delegate is contravariant in `T`, permitting a predicate checking a base type to be used where a predicate checking a derived type is needed.
- `Comparison<T> contravariance`: The `Comparison<T>` delegate is contravariant in `T`, allowing a comparison function operating on base items to be assigned where a comparison for derived items is requested.
- `Converter<TInput,TOutput> input and output variance`: The `Converter<TInput, TOutput>` delegate combines contravariant input (`TInput`) and covariant output (`TOutput`), allowing source conversion inputs to widen and output types to narrow safely according to variance rules.
- `Delegate variance conversion`: An implicit reference conversion applied by the compiler when assigning variant delegates, guaranteeing type safety at call sites without altering the underlying target methods.
- `Method-group covariance`: The ability to bind a method returning a more derived type to a delegate signature expecting a base return type.
- `Method-group contravariance`: The ability to bind a method accepting a less derived (base) parameter type to a delegate signature expecting a derived parameter type.
- `Delegate binding with derived return type`: Specific compiler support allowing a method whose return type is a subclass of the delegate's return type to serve as a valid delegate target.
- `Delegate binding with base parameter type`: Specific compiler support allowing a method taking a superclass parameter to serve as a delegate target requiring a subclass parameter.
- `Lambda conversion to variant delegate`: The mechanism where anonymous functions and lambdas convert implicitly to variant delegate types based on their parameter and return type assignments.
- `Delegate invocation through variant reference`: Invoking a delegate instance through a variable whose generic type parameters have been converted via variance, executing the original target safely.
- `Event handler contravariance`: Assigning event handler methods with base parameter types (such as `object` and `EventArgs`) to event delegate slots requiring specific derived argument types.
- `Delegate combination requires identical delegate type`: The rule stating that the `+` operator (`Delegate.Combine`) requires exact matching delegate types and does not perform variance conversions when combining invocation lists.
- `Variance does not alter invocation list element types`: The principle that combining or invoking variant delegates preserves their individual targets' signatures; variance changes reference assignment compatibility, not the underlying signature types stored in the multicast invocation list.

# Cross-item comparison
- **`Func<T,TResult> input contravariance` vs. `Func<T,TResult> result covariance`**: Input contravariance allows assigning delegate targets that accept wider (base) arguments, whereas result covariance allows assigning delegate targets that return narrower (derived) results.
- **`Action<T> contravariance` vs. `Action<T1,T2> contravariance`**: Both provide contravariant parameter safety for procedures, but multi-argument actions (`Action<T1,T2>`) require contravariant safety rules to hold independently across every individual input parameter position.
- **`Method-group covariance` vs. `Delegate variance conversion`**: Method-group covariance describes target method binding behavior at assignment time based on return subtyping, while delegate variance conversion describes the broader umbrella of implicit reference conversions allowed between constructed generic delegate instances.

# Examples
The following code example illustrates variant delegate and method-group compatibility concepts:

```csharp
using System;

class Base {}
class Derived : Base {}

class Program
{
    static Base ProduceBase() => new Base();
    static Derived ProduceDerived() => new Derived();

    static void ConsumeBase(Base b) {}

    static void Main()
    {
        // Covariance: Func returning Derived assigned to Func returning Base
        Func<Derived> getDerived = ProduceDerived;
        Func<Base> getBase = getDerived; // Valid due to covariant TResult

        // Contravariance: Action accepting Base assigned where Action accepting Derived is expected
        Action<Base> actBase = ConsumeBase;
        Action<Derived> actDerived = actBase; // Valid due to contravariant input T
    }
}
```

*Expected results:* The code compiles successfully under .NET 11 and C# 15 rules. Assigning `getDerived` to `getBase` succeeds because `Func<TResult>` is covariant in `TResult`. Assigning `actBase` to `actDerived` succeeds because `Action<T>` is contravariant in `T`.

# Common mistakes
- **Confusing delegate combination with assignment variance**: Attempting to use `+` or `Delegate.Combine` on delegates of differing variant generic types without exact type matches. Remember: *Delegate combination requires identical delegate type*.
- **Violating input/output position rules**: Attempting to mark a parameter position that accepts data with `out`, or a position that returns data with `in`.
- **Assuming value types support variance**: Expecting variance conversions to work across value-type generic arguments (e.g., `int` and `long`). Variance conversions apply exclusively to reference types.

# Knowledge checks with answers
1. **Question:** Why does `Delegate combination requires identical delegate type` hold true even when individual delegate references can undergo variance conversions?
   - **Answer:** Variance governs implicit reference conversions during assignment or argument passing, whereas multicast delegate combination (`Delegate.Combine`) requires exact runtime type matching of the delegate instances being concatenated into an invocation list.
2. **Question:** In `Func<T, TResult>`, which type parameter is contravariant, and which is covariant?
   - **Answer:** `T` (the input parameter) is contravariant (marked with `in`), and `TResult` (the return value) is covariant (marked with `out`).
3. **Question:** Can you combine an `Action<Base>` and an `Action<Derived>` directly using `Delegate.Combine`?
   - **Answer:** No, because delegate combination requires identical delegate types, and variance conversions do not alter invocation list element types or bypass exact type checking during combination.

---
*Automatically generated draft.*
