<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# generics constraints and generic methods — Reference: Type parameters, constructed types, and generic member declarations

*This is an automatically generated draft.*

# Scope and version
This lesson covers the syntax and terminology for generic declarations and type arguments in C# 15 / .NET 11. It focuses on the structural components of generics rather than variance or specific math operators. Source: [Microsoft C# Programming Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/).

# How this group fits the mental model
Generics allow you to write code once that works across multiple types while maintaining static type safety. You define a template using a **Generic type definition** (the blueprint), which includes a **Type parameter list**. When you use that template, you provide a **Type argument list** to create a **Constructed generic type**. Typed generic use avoids many object-based casts and boxing conversions; boxing can still occur when values convert to object or interfaces.

# Supplied names explained
* `Generic type`: A class, struct, interface, or delegate declared with one or more type parameters.
* `Generic class`: A class that defines a type parameter to be used as a placeholder for its members.
* `Generic struct`: A value type that defines a type parameter, allowing for type-safe, high-performance data structures.
* `Generic interface`: An interface that defines a type parameter, ensuring implementing classes adhere to a generic contract.
* `Generic delegate`: A delegate that defines a type parameter, allowing for type-safe method references.
* `Generic method`: A method declared with its own type parameter list, independent of the containing type's parameters.
* `Generic local function`: A local function defined within a method that includes its own type parameters.
* `Generic type parameter`: The placeholder name (e.g., `T`) used in a definition.
* `Type argument`: The actual type (e.g., `int`) substituted for a type parameter.
* `Type parameter list`: The comma-separated list of placeholders enclosed in angle brackets (e.g., `<T, U>`).
* `Type argument list`: The comma-separated list of actual types provided when using a generic (e.g., `<int, string>`).
* `Arity`: The number of type parameters a generic type or method accepts.
* `Open constructed type`: A constructed type that still involves at least one type parameter in itself or a containing type. A bare generic definition is unbound rather than an open constructed type.
* `Closed constructed type`: A generic type where all type parameters have been replaced by actual types.
* `Unbound generic type`: A type definition referred to without providing type arguments (e.g., `List<>`).
* `Generic type definition`: The runtime/reflection definition of a generic type; it is not merely the source-code declaration.
* `Constructed generic type`: The resulting type after substituting type arguments into a generic type definition.
* `Nested generic type`: A generic type defined inside another generic or non-generic type.
* `Containing type type parameter`: A type parameter defined in the outer class that is accessible to a nested type.
* `Generic member of a non-generic type`: A method or delegate inside a standard class that uses its own type parameters.
* `Generic member of a generic type`: A method inside a generic class that may use the class's parameters or its own.
* `Generic method type parameter scope`: The visibility of a type parameter, which is limited to the method body and signature.
* `Multiple type parameters`: The ability to define more than one placeholder (e.g., `Dictionary<TKey, TValue>`).
* `Same-name type parameter shadowing`: A nested type cannot redeclare an enclosing type parameter name. A generic method can redeclare it, producing warning CS0693 and shadowing the outer parameter in that method scope.
* `Type parameter naming convention`: The standard practice of using a descriptive name prefixed with 'T' (e.g., `TResult`).

# Cross-item comparison
* **Generic type** vs **Closed constructed type**: A generic type definition can be unbound (`List<>`) or used in a constructed form; `List<T>` in a generic declaration is open, while `List<int>` is closed.
* **Generic method** vs **Non-generic method**: Generic methods allow the logic to vary based on the type argument, whereas non-generic methods are bound to specific types or `object`.
* **Explicit type arguments** vs **Inferred type arguments**: You can specify types manually (e.g., `Method<int>()`) or let the compiler infer them from arguments (e.g., `Method(5)`).

# Examples
```csharp
// Generic class definition
public class Container<T> 
{
    private T _item;
    // Generic method within a generic class
    public void SetItem<U>(U item) { /* ... */ }
}

// Usage
var myContainer = new Container<int>(); // Closed constructed type
```

# Common mistakes
* **Ignoring Arity**: Attempting to use a generic type without providing the correct number of type arguments (e.g., using `List<T>` as `List` without arguments).
* **Shadowing Confusion**: Using the same name for a method type parameter as a class type parameter, which makes the class-level parameter inaccessible within that method.
* **Over-constraining**: Adding constraints that are not strictly necessary, which limits the usability of your generic code.

# Knowledge checks with answers
1. **Question**: What is the difference between an open and closed constructed type?
   **Answer**: An open constructed type still contains at least one type parameter (e.g., `List<T>`), while a closed constructed type has replaced all parameters with concrete types (e.g., `List<int>`).
2. **Question**: Can a generic method have its own type parameters if the containing class is not generic?
   **Answer**: Yes, a generic member of a non-generic type can define its own type parameters independent of the class.
3. **Question**: What does "Arity" refer to in the context of generics?
   **Answer**: Arity refers to the number of type parameters a generic type or method accepts.
