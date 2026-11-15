<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# generics constraints and generic methods — Big-picture orientation and mental model

*This is an automatically generated draft.*

# Problem and purpose
In programming, you often need to write the same logic for different types of data. For example, a "list" of integers works exactly like a "list" of strings. Without generics, you might be tempted to use `object` to store everything, but this forces you to "cast" (convert) types constantly, which is slow and error-prone.

Generics solve this by allowing you to write a class or method once with a "placeholder" for the type. The compiler then fills in that placeholder with the specific type you provide, ensuring that your code remains type-safe and performant.

# Plain-language mental model
Think of a generic type as a **template** or a **blueprint**. 

Imagine a factory machine that can package items. If you build a machine that only packages apples, you have to build a whole new machine to package oranges. A "generic" machine is one where you provide the "type" of item (apple or orange) as an input. The machine then adjusts itself to handle that specific item. Because the machine knows exactly what it is handling, it doesn't need to guess or perform expensive checks—it just works.

# How the parts fit together
Generics consist of three main pillars:
1. **The Declaration:** You define a class or method using a "type parameter" (like `<T>`).
2. **The Constraints:** You tell the compiler what the type parameter is allowed to do. For example, if your code needs to call a method on the object, you must constrain the type to an interface that defines that method.
3. **The Construction:** When you actually use the code, you provide a "type argument" (like `int` or `string`). The compiler creates a "closed constructed type" specifically for that argument.

# Concept map
*   **Type Parameters:** The placeholders (e.g., `T`) used in the definition.
*   **Constraints:** Rules (e.g., `where T : struct`) that limit which types can be used as arguments.
*   **Inference:** The compiler's ability to guess the type argument based on the data you pass in, so you don't have to type it out every time.
*   **Substitution:** The process where the compiler replaces the placeholder with the real type, creating a specialized version of your code.

# End-to-end walkthrough
Consider a simple method that compares two items to see if they are equal:

```csharp
// Definition: T is the type parameter
bool AreEqual<T>(T first, T second) {
    return first.Equals(second);
}
```

1. **Call:** You call `AreEqual(10, 10)`.
2. **Inference:** The compiler sees two integers and infers that `T` is `int`.
3. **Substitution:** The compiler effectively creates a version of `AreEqual` that works specifically for `int`.
4. **Execution:** The code runs with full type safety. If you tried to call `AreEqual(10, "hello")`, the compiler would stop you because the types don't match, preventing runtime errors.

# When to use it and tradeoffs
**Use generics when:**
*   You are writing an algorithm (like sorting or searching) that should work on many different data types.
*   You want to avoid the performance overhead of boxing (storing value types as `object`).
*   You want to catch type-mismatch errors at compile-time rather than runtime.

**Tradeoffs:**
*   **Complexity:** Over-using generics can make code harder to read.
*   **Binary Size:** Because the compiler creates specialized versions of your code for different types, using too many different type arguments can increase the size of your compiled application.
*   **Constraints:** If you choose a constraint that is too narrow, your code becomes less reusable. If it is too broad, you might not be able to access the features you need.

# What later lessons cover
*   **Variance:** How to handle relationships between generic types (e.g., is a `List<string>` also a `List<object>`?).
*   **Delegates and Expressions:** Using generics with functional programming patterns.
*   **Generic Math:** Advanced numeric operations using static abstract interface constraints.
*   **Reflection:** How to inspect generic types while the program is running.

*Source: [Microsoft C# Programming Guide - Generics](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/)*
