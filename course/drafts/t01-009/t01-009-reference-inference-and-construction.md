<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# generics constraints and generic methods — Reference: Type inference, explicit type arguments, and generic construction

*This is an automatically generated draft.*

# Scope and version
This lesson covers the mechanics of generic type inference and construction in C# 15 / .NET 11. It focuses on how the compiler resolves type parameters when you use generic methods and types.

*Source: [Microsoft C# Programming Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/)*

# How this group fits the mental model
Generics allow you to write code once that works for many types. The "mental model" is a template: you define the logic, and the compiler fills in the blanks (type arguments). 

Construction is the act of filling those blanks. You can either provide the types explicitly (e.g., `MyMethod<int>()`) or let the compiler "infer" them from the arguments you pass. This group of concepts defines the rules the compiler follows to ensure that the types you provide (or that it guesses) are safe and valid.

# Supplied names explained

* `Explicit generic type argument`: Providing the type inside angle brackets (e.g., `Method<int>(...)`). This overrides inference and forces the compiler to use a specific type.
* `Omitted method type arguments`: Leaving out the angle brackets (e.g., `Method(x)`). The compiler attempts to deduce the type from the arguments.
* `Generic method type inference`: The process where the compiler examines method arguments to determine the type parameters.
* `Input type`: The type of an argument passed into a method; used as a primary source for inference.
* `Output type in inference`: The return type of a method; note that inference does not look at the expected return type of the caller to guess the generic parameter.
* `Exact inference`: When the compiler requires the inferred type to match the argument type exactly, without implicit conversions.
* `Lower-bound inference`: When the compiler determines a type parameter based on a requirement that the type must be at least as specific as a provided argument.
* `Upper-bound inference`: When the compiler determines a type parameter based on a requirement that the type must be a base class or interface of the provided argument.
* `Inference from argument expressions`: Using the types of the values passed to a method to determine the generic parameter.
* `Inference from lambda expression`: Deducing type parameters based on the signature of a passed delegate or lambda.
* `Inference from method group`: Deducing type parameters when a method name is passed as a delegate.
* `Inference from array creation expression`: Deducing types when initializing arrays within a generic context.
* `Inference from return type is not performed`: A critical rule: the compiler never looks at the variable receiving the result to decide what the generic type should be.
* `Inference with nullable annotations`: How the compiler handles `T?` versus `T` during the inference process.
* `Type inference phase`: The internal steps the compiler takes to validate and resolve type parameters.
* `Failed type inference`: Occurs when the compiler cannot find a single, unambiguous type that satisfies all constraints and arguments.
* `Type argument substitution`: The final step where the compiler replaces the placeholder (e.g., `T`) with the resolved type (e.g., `int`).
* `Type argument compatibility`: Checking if the resolved type satisfies the `where` constraints defined on the generic.
* `Generic type construction`: The process of creating a concrete type from a generic definition (e.g., `List<int>`).
* `Generic method construction`: The process of creating a concrete method call from a generic method definition.
* `Generic constructor restriction`: The rule that you cannot directly instantiate a generic type parameter (e.g., `new T()`) unless it has a `new()` constraint.
* `Generic type in typeof expression`: Using `typeof(List<>)` to get metadata for an open generic type.
* `Generic type in default expression`: Using `default(T)` to get the default value for a type parameter.
* `Generic type in is and as operators`: Checking or casting types at runtime using generic parameters.
* `Generic type argument must be a type`: The fundamental rule that you cannot pass a value or a namespace where a type is expected.

# Cross-item comparison

| Feature | Role |
| :--- | :--- |
| `Explicit generic type argument` | Used when inference is ambiguous or impossible. |
| `Omitted method type arguments` | Used for cleaner, more readable code when inference is reliable. |
| `Inference from argument expressions` | The most common way to trigger inference. |
| `Inference from return type is not performed` | A common "gotcha" where developers expect the compiler to "know" the type based on the assignment target. |

# Examples

```csharp
// Explicit construction
List<int> numbers = new List<int>(); 

// Inference from argument expressions
void Process<T>(T item) { }
Process(10); // T is inferred as int

// Failed type inference example
void Compare<T>(T a, T b) { }
Compare(10, "hello"); // Fails: cannot infer T as both int and string
```

# Common mistakes

1. **Expecting return-type inference:** Writing `List<string> list = CreateList();` where `CreateList<T>()` is defined. The compiler cannot infer `T` from the left side of the assignment. You must use `CreateList<string>()`.
2. **Ignoring constraints:** Trying to pass a type that doesn't satisfy the `where` clause (e.g., passing a class to a method constrained by `where T : struct`).
3. **Ambiguous inference:** Passing multiple arguments that suggest different types, causing `Failed type inference`.

# Knowledge checks with answers

**Q1: If I call a generic method `void Do<T>(T x)` and pass it a `string`, what is the inferred type of `T`?**
*Answer: `string`.*

**Q2: Can the compiler infer the type parameter of a method based on the variable I assign the result to?**
*Answer: No. `Inference from return type is not performed`.*

**Q3: What happens if I try to use `new T()` inside a generic method without a `new()` constraint?**
*Answer: The compiler will report an error because it cannot guarantee that the type `T` has a parameterless constructor.*
