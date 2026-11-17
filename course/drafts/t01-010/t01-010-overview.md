<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# covariance contravariance invariant types and delegates — Big-picture orientation and mental model

*This is an automatically generated draft.*

# Problem and purpose
In C#, generic types are usually **invariant**. This means that even if `Dog` inherits from `Animal`, a `List<Dog>` is not considered a `List<Animal>`. If you try to pass a `List<Dog>` to a method expecting `List<Animal>`, the compiler will stop you. This exists to prevent type-safety errors: if you could treat a `List<Dog>` as a `List<Animal>`, you might accidentally add a `Cat` to that list, which would crash your program when the original code tries to treat that `Cat` as a `Dog`.

**Variance** is the solution to this problem. It allows you to safely treat a generic type as a more general (or more specific) version of itself, provided the relationship is logically sound. It enables flexible, reusable code without sacrificing the type safety that C# is known for.

# Plain-language mental model
Think of a **Producer** and a **Consumer**:

*   **Covariance (The Producer):** If you have a machine that produces `Dog` objects, it is also a machine that produces `Animal` objects. Because a `Dog` *is* an `Animal`, you can safely use a "Dog-producer" whenever you need an "Animal-producer." We mark this with the `out` keyword because the data is "coming out" of the interface.
*   **Contravariance (The Consumer):** If you have a machine that knows how to handle (consume) any `Animal`, it is also perfectly capable of handling a `Dog`. You can use an "Animal-handler" whenever you need a "Dog-handler." We mark this with the `in` keyword because the data is "going in" to the interface.
*   **Invariance:** If a machine both takes in and gives out the same type (like a `List<T>`), it cannot be safely treated as a different type. If you change the input or output, you break the contract.

# How the parts fit together
Variance is declared with `in` and `out` on interface/delegate type parameters. The language checks safe and unsafe positions, with a specific exception for non-virtual, non-abstract static members of interfaces.

1.  **Interfaces:** You declare `out T` for a covariant parameter and `in T` for a contravariant parameter. The compiler checks all relevant member positions, including nested interface/delegate variance; these are not merely syntactic return/input tests.
2.  **Delegates:** Similar rules apply to `Func<T>` (covariant result) and `Action<T>` (contravariant input).
3.  **Conversion:** Once these contracts are in place, the compiler allows an **implicit reference conversion**. You can assign a variable of a more specific type to a variable of a more general type (or vice versa, depending on the variance).

# Concept map
*   **Variance:** The umbrella term for safe type conversions.
*   **Covariance (`out`):** Preserves the inheritance hierarchy (e.g., `IEnumerable<Dog>` can be treated as `IEnumerable<Animal>`).
*   **Contravariance (`in`):** Reverses the inheritance hierarchy (e.g., `IComparer<Animal>` can be treated as `IComparer<Dog>`).
*   **Invariance:** No conversion allowed (e.g., `IList<T>`).
*   **Boundaries:** Variance annotations are available only on generic interfaces and delegates. Variance conversions are reference conversions and require reference-type arguments for the variant parameters.

# End-to-end walkthrough
Imagine you have a `List<Dog>` and a method that processes `IEnumerable<Animal>`.

1.  **The Interface:** `IEnumerable<T>` is defined as `IEnumerable<out T>`. Because it is marked `out`, the compiler knows it only *produces* items.
2.  **The Conversion:** When you pass `List<Dog>` to a method expecting `IEnumerable<Animal>`, the compiler checks the `out` modifier.
3.  **Safety Check:** Since `IEnumerable<T>` only lets you read from the collection, the compiler knows you cannot accidentally add a `Cat` to your `List<Dog>`.
4.  **Result:** The conversion is allowed. You can iterate over your `Dog` objects as if they were `Animal` objects.

If you tried this with `IList<T>`, which is invariant, the compiler would throw an error because `IList<T>` allows you to *add* items, which would violate type safety.

# When to use it and tradeoffs
*   **Use it when:** You are designing libraries or APIs where you want to allow users to pass in more specific types than you requested (for consumers) or treat your results as more general types (for producers).
*   **Tradeoffs:** 
    *   **Complexity:** Overusing variance can make code harder to reason about. 
    *   **Limitations:** It only works for reference types. You cannot use variance with `int`, `double`, or other value types.
    *   **Design constraints:** You must strictly follow the "producer/consumer" rule. If your interface needs to both accept and return `T`, it must be invariant.

# What later lessons cover
*   **Delegate specifics:** How `Func` and `Action` use these rules.
*   **Array variance:** Why arrays behave differently (and why they can cause runtime `ArrayTypeMismatchException` errors).
*   **C# 9+ features:** How covariant return types in method overrides provide a different kind of flexibility.
*   **Diagnostic errors:** How to fix "Invalid variance" compiler errors when you accidentally use a type in the wrong position.

*Source: [Microsoft .NET Generic Variance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/covariance-contravariance/)*
