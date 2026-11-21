
# covariance contravariance invariant types and delegates — Interview questions and reasoning

# Core questions

*   **What is variance?** Variance describes how the inheritance relationship between two types (e.g., `string` and `object`) carries over to constructed generic types (e.g., `IEnumerable<string>` and `IEnumerable<object>`).
*   **What is covariance?** It allows you to use a more derived type than originally specified. It is used for "producers" (types that only output data).
*   **What is contravariance?** It allows you to use a less derived type than originally specified. It is used for "consumers" (types that only accept data).
*   **What is invariance?** It means no conversion is allowed. If a type is invariant, `List<string>` cannot be treated as `List<object>` because the list can both produce and consume data, which would break type safety.

# Concise interview answers

*   **Explain `in` vs `out`:** Use `out` for covariant type parameters (the type is only returned/produced). Use `in` for contravariant type parameters (the type is only accepted as an input).
*   **Why is `List<T>` invariant?** Because it is a read/write abstraction. If `List<string>` were treated as `List<object>`, you could add an `int` to a list of strings, causing a runtime crash.
*   **Does variance apply to classes?** No. Variance annotations are allowed only on interface and delegate type parameters; class type parameters are invariant.

# Deep follow-up answers

*   **How does array covariance differ from generic variance?** Array covariance is a legacy feature that allows `string[]` to be treated as `object[]`. Because the array remains mutable, an incompatible store through the wider reference fails at runtime with `ArrayTypeMismatchException`; this is distinct from generic interface variance. Generic variance is enforced at compile-time via the `in`/`out` contract.
*   **Can I use variance with value types?** No. Variance only applies to reference types. `IEnumerable<int>` cannot be converted to `IEnumerable<object>` by variance. Boxing an individual `int` to `object` does not create a variant conversion between those constructed interface types.
*   **Is covariant return type in C# 9 the same as generic variance?** No. Covariant return types allow an overridden method to return a more derived type than the base method. This is a feature of inheritance and virtual dispatch, whereas generic variance is a feature of type parameter substitution.

# Scenario questions

*   **Scenario:** You have a method that accepts `IEnumerable<object>`. Can you pass it an `IEnumerable<string>`?
    *   **Answer:** Yes, because `IEnumerable<T>` is covariant (`out T`).
*   **Scenario:** You have a method that accepts `IComparer<string>`. Can you pass it an `IComparer<object>`?
    *   **Answer:** Yes, because `IComparer<T>` is contravariant (`in T`). A comparer that knows how to compare any `object` is perfectly capable of comparing `string`s.
*   **Scenario:** You have a method that accepts `IList<object>`. Can you pass it an `IList<string>`?
    *   **Answer:** No. `IList<T>` is invariant because it allows both reading and writing.

# Tradeoffs and alternatives

*   **Variance vs. Adapter Allocation:** If you cannot use variance (e.g., with an invariant class), you might need to create an adapter (e.g., `list.Cast<object>().ToList()`). This provides safety but incurs a performance cost due to new allocations.
*   **Design Choice:** When designing APIs, prefer `IReadOnlyList<T>` or `IEnumerable<T>` over `IList<T>` if you don't need to modify the collection. This enables covariance and makes your API more flexible for the caller.

# Common weak answers

*   **"Variance is just casting."** Incorrect. Variance is a formal type-system rule for permitted implicit reference conversions; casts are separate explicit conversions and may fail at runtime.
*   **"Everything can be covariant."** Incorrect. A covariant parameter must be used only in output-safe positions under the language’s composed variance rules.
*   **"I can use variance to change the type of a list."** Incorrect. Variance does not change the identity of the object; it only changes the reference type through which you access it.

# Self-check rubric

*   **Can you identify the variance of an interface?** Look for `in` or `out` in the definition. If neither is present, it is invariant.
*   **Can you predict a compiler error?** If you try to use an `out` parameter in an input position (like a method argument), the compiler will trigger an `Invalid variance position` error.
*   **Do you understand the limits?** Remember that variance annotations are limited to interface/delegate parameters, and conversion requires reference-type arguments.

*Sources: [Microsoft C# Programming Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/), [Variance in Generic Interfaces](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/variance-in-generic-interfaces), [C# 9 Covariant Returns](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)*
