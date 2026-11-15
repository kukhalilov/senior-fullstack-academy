<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# generics constraints and generic methods — Interview questions and reasoning

*This is an automatically generated draft.*

# Core questions

When interviewing for C# roles, you will be asked to explain why generics exist and how they differ from older patterns.

*   **Why use generics instead of `object`?** Generics provide compile-time type safety and performance. Using `object` requires boxing (wrapping a value type in an object) and casting, which requires casting and can box value types. Generics allow the compiler to verify types at build time.
*   **What is a constraint?** A `where constraint clause` restricts the types that can be used as arguments. Without constraints, a `Generic type` can only perform operations available to all objects (like `ToString()`). Constraints allow you to use specific capabilities, such as `new()` for instantiation or `unmanaged` for memory-sensitive operations.
*   **How does inference work?** `Generic method type inference` allows the compiler to determine the `Type argument` from the arguments passed to the method. Note that inference never uses the return type to determine the argument.

# Concise interview answers

*   **Explain the difference between a generic type and a closed constructed type.** A `Generic type` (e.g., `List<T>`) is a template or definition. A `Closed constructed type` (e.g., `List<int>`) is a specific, fully realized type that the runtime can instantiate.
*   **What is the purpose of the `new()` constraint?** It allows the generic code to create an instance of the type parameter using `new T()`.
*   **Can you overload generic methods?** Yes, `Generic method overload` resolution considers both the number of type parameters and the constraints applied to them.

# Deep follow-up answers

*   **How do constraints affect runtime?** Constraints are checked at compile time. At runtime, the JIT (Just-In-Time) compiler uses `Reified generic type arguments` to generate specialized code for value types, avoiding object-based boxing in typical generic operations. Reference types share code, but the runtime maintains distinct `Generic type identity` for each `Closed constructed type`.
*   **What is the `allows ref struct` anti-constraint?** Introduced in C# 13, it allows `ref struct` types to be used as type arguments when the generic declaration uses the `allows ref struct` anti-constraint and obeys ref-safety rules; “ref-safety restricted” describes escape restrictions, not a guaranteed physical stack location.
*   **Why avoid unnecessary type parameters?** Every `Type parameter` adds complexity to the API. If a parameter is used only once or doesn't define a relationship between inputs and outputs, it is likely an abstraction error.

# Scenario questions

*   **Scenario:** You need a method that works on any numeric type.
    *   **Reasoning:** You would use a `Generic math constraint` (often via static abstract interfaces) to ensure the type supports the required operators.
*   **Scenario:** You have a generic class that needs to ensure the type is a reference type.
    *   **Reasoning:** Use the `class constraint`. If you need to allow nullable reference types, use `class? constraint`.
*   **Scenario:** You are writing a factory method.
    *   **Reasoning:** You must apply the `new()` constraint to the type parameter to allow the `new T()` syntax.

# Tradeoffs and alternatives

| Feature | Alternative | Tradeoff |
| :--- | :--- | :--- |
| `Generic type parameter` | `object` parameter | Generics provide type safety and avoid boxing; `object` is flexible but unsafe. |
| `Explicit type arguments` | `Inferred type arguments` | Explicit arguments are clearer in complex overloads; inference is cleaner for simple calls. |
| `struct constraint` | `unmanaged constraint` | `struct` allows any value type; `unmanaged` is stricter but allows pointer operations. |

# Common weak answers

*   **"Generics are just like templates in C++."** While similar, C# generics are reified at runtime, meaning the runtime knows the exact type argument, whereas C++ templates are expanded at compile time.
*   **"I can use constraints to force the compiler to pick a specific type."** Incorrect. `Constraint does not select a type argument`; constraints only validate the arguments provided by the caller.
*   **"I will use a generic type parameter for everything to make it flexible."** This is poor design. Always prefer the `Narrowest useful constraint` to keep your API predictable and safe.

# Self-check rubric

1.  **Can I explain the difference between `Generic type definition` and `Closed constructed type`?** (If no, review `generic-declarations-and-type-arguments`).
2.  **Do I know why `Inference from return type is not performed`?** (If no, review `inference-and-construction`).
3.  **Can I list the difference between `class`, `class?`, and `notnull` constraints?** (If no, review `constraints-and-capability-contracts`).
4.  **Do I understand that `Different closed types are distinct types`?** (If no, review `generic-overloads-and-runtime`).

*Sources: [Microsoft C# Generics Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/), [Constraints](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters), [C# 13/15 Whats New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13)*
