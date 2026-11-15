<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# generics constraints and generic methods — Reference: Overload binding, inheritance, runtime representation, and design

*This is an automatically generated draft.*

# Scope and version
This lesson covers the runtime behavior, overload resolution, and design principles for C# generics as of C# 15 / .NET 11. It focuses on how generic methods and types interact with the compiler and runtime, rather than the syntax of declaring them.

# How this group fits the mental model
Generics allow you to write code that is type-safe and performant. Unlike using `object` (which requires casting and boxing), generics allow the compiler to generate specific code for the types you use. The items in this group explain the "under the hood" mechanics: how the compiler chooses which method to call (overload resolution), how the runtime treats different types (reification), and how to design APIs that are clean and efficient.

# Supplied names explained

* `Generic method overload`: A method with the same name as another, but with different type parameters or signatures.
* `Generic and non-generic overload`: A scenario where a method name is shared between a generic version and a non-generic version; the compiler prefers the non-generic version if it is an exact match.
* `Overload resolution with type inference`: The process where the compiler determines the type arguments based on the arguments passed to the method.
* `Overload resolution with constraints`: The compiler uses constraints to filter out methods that do not satisfy the required capabilities of the type arguments.
* `Generic overload ambiguity`: A compile-time error occurring when the compiler cannot determine which generic method is the best match for a call.
* `Generic method hiding`: Occurs when a derived class declares a method with the same signature as a base class, effectively hiding the base implementation.
* `Generic method override`: Providing a specific implementation in a derived class for a virtual generic method defined in a base class.
* `Generic interface implementation`: The process of implementing an interface that has type parameters.
* `Generic base class construction`: The requirement to provide type arguments when inheriting from a generic base class.
* `Generic type identity`: The principle that a generic type is defined by its name and the number of type parameters.
* `Different closed types are distinct types`: `List<int>` and `List<string>` are completely different types at runtime and cannot be used interchangeably.
* `Generic type static field per closed type`: Each unique closed type (e.g., `MyClass<int>`) has its own independent set of static fields.
* `Generic type initialization per closed type`: Static constructors for generic types run once for each unique closed type.
* `Value type generic instantiation`: When a value type (like `int`) is used as a type argument, the runtime creates a specialized version of the generic type for that value type.
* `Reference type generic instantiation`: When a reference type is used, the runtime shares code across different reference types, as they all share the same memory representation (pointers).
* `Runtime generic type information`: The ability to inspect generic types at runtime using reflection.
* `Reified generic type arguments`: The runtime preserves the actual type arguments (e.g., `int`) at execution time, allowing for type checks and reflection.
* `Generic code sharing implementation detail`: The runtime optimization where code is shared between different reference type instantiations to reduce memory usage.
* `Boxing in generic code`: Occurs when a value type is converted to an `object` or an interface type within a generic method, potentially impacting performance.
* `Avoiding object-based casts with generics`: The primary performance benefit of generics, where the compiler generates code that works directly on the type rather than casting from `object`.
* `Generic API usability`: Designing generic methods so that type inference works intuitively for the caller.
* `Unnecessary type parameter`: A design flaw where a type parameter is defined but not used to express a relationship between inputs or outputs.
* `Narrowest useful constraint`: The best practice of applying the most specific constraint possible to enable the required functionality while keeping the API flexible.
* `Generic algorithm versus generic data structure`: The distinction between a generic method that performs logic (algorithm) and a generic class that stores data (structure).

# Cross-item comparison

* **Generic type parameter vs. object parameter and cast**: Generics provide compile-time safety and avoid the performance cost of casting and boxing associated with `object`.
* **Generic type vs. closed constructed generic type**: A generic type is the template (e.g., `List<T>`), while a closed constructed type is the specific, usable type (e.g., `List<int>`).
* **Explicit type arguments vs. Inferred type arguments**: You can specify types manually (e.g., `Method<int>(5)`) or let the compiler infer them (e.g., `Method(5)`).
* **Generic method overload vs. Non-generic method overload**: The compiler follows specific rules to prioritize non-generic methods over generic ones when both are applicable.

# Examples

```csharp
// Example: Generic type static field per closed type
public class Counter<T> {
    public static int Count = 0;
}

// Counter<int>.Count and Counter<string>.Count are separate variables.
Counter<int>.Count++; 
Counter<string>.Count++;
// Result: Counter<int>.Count is 1, Counter<string>.Count is 1.
```

# Common mistakes

* **Over-constraining**: Adding constraints that are not strictly necessary, which limits the usability of your API.
* **Ignoring inference**: Manually specifying type arguments when the compiler is perfectly capable of inferring them, leading to verbose code.
* **Assuming shared static state**: Expecting `MyClass<int>` and `MyClass<double>` to share the same static fields; they do not.

# Knowledge checks with answers

1. **Question**: If I have `List<int>` and `List<string>`, do they share the same static fields?
   **Answer**: No. Each closed constructed type has its own independent static fields and static constructors.

2. **Question**: Why should I prefer a generic method over a method that takes `object`?
   **Answer**: Generics provide static type safety (catching errors at compile time) and avoid the performance overhead of boxing and casting.

3. **Question**: What is the "narrowest useful constraint"?
   **Answer**: It is a design principle where you apply the least restrictive constraint that still allows your code to perform the necessary operations, ensuring maximum flexibility for the caller.

*Source: [Microsoft C# Programming Guide - Generics](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/)*
