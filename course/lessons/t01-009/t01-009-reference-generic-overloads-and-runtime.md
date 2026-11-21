
# generics constraints and generic methods — Reference: Overload binding, inheritance, runtime representation, and design

# Scope and version
This lesson covers the runtime behavior, overload resolution, and design principles for C# generics as of C# 15 / .NET 11. It focuses on how generic methods and types interact with the compiler and runtime, rather than the syntax of declaring them.

# How this group fits the mental model
Generics allow you to write code that is type-safe and performant. Generic APIs preserve static type relationships and can avoid object conversions; boxing depends on actual conversions and member use. Runtime code specialization/sharing is implementation-dependent. The items in this group explain the "under the hood" mechanics: how the compiler chooses which method to call (overload resolution), how the runtime treats different types (reification), and how to design APIs that are clean and efficient.

# Supplied names explained

* `Generic method overload`: A method with the same name and a distinct signature. Signatures can differ in parameter types or generic arity; methods cannot differ only by return type, parameter names, or constraints.
* `Generic and non-generic overload`: A method group containing generic and non-generic candidates; inference, applicability, conversions, and better-member tie-breakers determine the winner. A non-generic method is not categorically preferred.
* `Overload resolution with type inference`: The process where the compiler determines the type arguments based on the arguments passed to the method.
* `Overload resolution with constraints`: Inference and applicability are evaluated for each generic candidate, and constraints can make a constructed candidate inapplicable. Constraints do not in general provide a better-member tie-breaker between otherwise applicable overloads.
* `Generic overload ambiguity`: A compile-time error occurring when the compiler cannot determine which generic method is the best match for a call.
* `Generic method hiding`: Name lookup can select a derived declaration and hide a base member; hiding does not replace a virtual base implementation as overriding does.
* `Generic method override`: Providing a specific implementation in a derived class for a virtual generic method defined in a base class.
* `Generic interface implementation`: The process of implementing an interface that has type parameters.
* `Generic base class construction`: The requirement to provide type arguments when inheriting from a generic base class.
* `Generic type identity`: A generic definition and its arity, namespace/containing type, assembly identity, and supplied arguments participate in identifying a constructed type; name and arity alone are not the whole runtime identity.
* `Different closed types are distinct types`: `List<int>` and `List<string>` are completely different types at runtime and cannot be used interchangeably.
* `Generic type static field per closed type`: Each non-equivalent closed constructed type has its own static storage; constructed types identical under type identity rules share it.
* `Generic type initialization per closed type`: A generic type initializer runs once per closed constructed type that has its own static storage, subject to ordinary type-initialization timing rules.
* `Value type generic instantiation`: The CLR commonly creates a value-type-specific generic instantiation; native-code generation and specialization details can vary by runtime and are not guaranteed by C# semantics.
* `Reference type generic instantiation`: Current CLR implementations commonly share generic code among reference-type instantiations, but this is an implementation optimization, not a language guarantee.
* `Runtime generic type information`: The ability to inspect generic types at runtime using reflection.
* `Reified generic type arguments`: The runtime preserves the actual type arguments (e.g., `int`) at execution time, allowing for type checks and reflection.
* `Generic code sharing implementation detail`: CLR implementation behavior that commonly shares native code across reference-type instantiations and specializes value-type instantiations; exact JIT/AOT strategy is runtime-dependent.
* `Boxing in generic code`: Occurs when a value type is converted to an `object` or an interface type within a generic method, potentially impacting performance.
* `Avoiding object-based casts with generics`: Typed generic APIs preserve type relationships and often avoid object casts; they do not guarantee a distinct code copy or eliminate boxing from every operation.
* `Generic API usability`: Designing generic methods so that type inference works intuitively for the caller.
* `Unnecessary type parameter`: A design flaw where a type parameter is defined but not used to express a relationship between inputs or outputs.
* `Narrowest useful constraint`: A design heuristic: state the capabilities the implementation needs and avoid unnecessary restrictions. The most specific type constraint is not automatically the best contract.
* `Generic algorithm versus generic data structure`: The distinction between a generic method that performs logic (algorithm) and a generic class that stores data (structure).

# Cross-item comparison

* **Generic type parameter vs. object parameter and cast**: Generics preserve type relationships and avoid many casts; object conversion of value types can box, while generic code may still box when it converts to object/interface or invokes certain members.
* **Generic type vs. closed constructed generic type**: A generic type is the template (e.g., `List<T>`), while a closed constructed type is the specific, usable type (e.g., `List<int>`).
* **Explicit type arguments vs. Inferred type arguments**: You can specify types manually (e.g., `Method<int>(5)`) or let the compiler infer them (e.g., `Method(5)`).
* **Generic method overload vs. Non-generic method overload**: The compiler uses the language better-function-member rules; no blanket generic/non-generic precedence applies in every case.

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
   **Answer**: Generics preserve compile-time type relationships and often avoid object casts/boxing. Boxing can still occur for particular conversions or interface/object calls, and performance depends on the operation and runtime.

3. **Question**: What is the "narrowest useful constraint"?
   **Answer**: It is a design principle where you apply the least restrictive constraint that still allows your code to perform the necessary operations, ensuring maximum flexibility for the caller.

*Source: [Microsoft C# Programming Guide - Generics](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/)*
