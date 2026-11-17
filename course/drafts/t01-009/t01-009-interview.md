<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# generics constraints and generic methods — Interview questions and reasoning

*This is an automatically generated draft.*

# Core questions

When interviewing for C# roles, you will be asked to explain why generics exist and how they differ from older patterns.

*   **Why use generics instead of `object`?** Generics preserve compile-time relationships between input and output types. Object-based APIs often require casts and box when value types convert to object; generic operations usually avoid those costs, though boxing can still occur in particular operations.
*   **What is a constraint?** A `where constraint clause` restricts the types that can be used as arguments. Without constraints, a type parameter exposes only operations valid for an unconstrained type parameter (including members available through object/type parameter rules). Constraints allow you to use specific capabilities, such as `new()` for instantiation or `unmanaged` for memory-sensitive operations.
*   **How does inference work?** `Generic method type inference` allows the compiler to determine the `Type argument` from the arguments passed to the method. The expected type of the invocation result does not infer a method type argument, although lambda and method-group output inference rules can contribute.

# Concise interview answers

*   **Explain the difference between a generic type and a closed constructed type.** A generic type definition has type parameters; a closed constructed type (e.g. `List<int>`) supplies all arguments. Open generic forms can appear in generic declarations and reflection, while executable generic code runs with closed arguments.
*   **What is the purpose of the `new()` constraint?** It allows the generic code to create an instance of the type parameter using `new T()`.
*   **Can you overload generic methods?** Yes, if their signatures differ, including parameter types or generic arity. They cannot be overloaded solely by different constraints; constraints can affect applicability, but do not generally rank otherwise applicable candidates.

# Deep follow-up answers

*   **How do constraints affect runtime?** Constraints are checked at compile time. Runtime metadata preserves type arguments. Current CLR implementations commonly specialize value-type instantiations and share reference-type code, but that is implementation-specific. Generic type identity is distinct from native-code sharing, and typed generic operations can still box in some cases.
*   **What is the `allows ref struct` anti-constraint?** Introduced in C# 13, it allows `ref struct` types to be used as type arguments when the generic declaration uses the `allows ref struct` anti-constraint and obeys ref-safety rules; “ref-safety restricted” describes escape restrictions, not a guaranteed physical stack location.
*   **Why avoid unnecessary type parameters?** Every `Type parameter` adds complexity to the API. If a parameter is used only once or doesn't define a relationship between inputs and outputs, it is likely an abstraction error.

# Scenario questions

*   **Scenario:** You need a method that works on any numeric type.
    *   **Reasoning:** You would use a `Generic math constraint` (often via static abstract interfaces) to ensure the type supports the required operators.
*   **Scenario:** You have a generic class that needs to ensure the type is a reference type.
    *   **Reasoning:** Use the `class constraint`. If you need to allow nullable reference types, use `class? constraint`.
*   **Scenario:** You are writing a factory method.
    *   **Reasoning:** Use `new()` when the generic implementation must invoke `new T()` for an arbitrary type parameter. A value-type constraint also permits construction; a concrete type argument or factory abstraction may be preferable for other design needs.

# Tradeoffs and alternatives

| Feature | Alternative | Tradeoff |
| :--- | :--- | :--- |
| `Generic type parameter` | `object` parameter | Generics preserve type relationships and avoid many object conversions; object can be useful for intentionally heterogeneous data but may require casts and box value types. |
| `Explicit type arguments` | `Inferred type arguments` | Explicit arguments are clearer in complex overloads; inference is cleaner for simple calls. |
| `struct constraint` | `unmanaged constraint` | `struct` allows any value type; `unmanaged` is stricter but allows pointer operations. |

# Common weak answers

*   **"Generics are just like templates in C++."** C# generic type arguments are represented in runtime metadata; native-code sharing or specialization is runtime-dependent. C++ templates have different compilation and instantiation rules, so the comparison depends on the specific implementation and question.
*   **"I can use constraints to force the compiler to pick a specific type."** Incorrect. `Constraint does not select a type argument`; constraints only validate the arguments provided by the caller.
*   **"I will use a generic type parameter for everything to make it flexible."** This is poor design. Choose constraints that express the capabilities the implementation actually relies on; extra constraints can unnecessarily restrict callers.

# Self-check rubric

1.  **Can I explain the difference between `Generic type definition` and `Closed constructed type`?** (If no, review `generic-declarations-and-type-arguments`).
2.  **Do I know why `Inference from return type is not performed`?** (If no, review `inference-and-construction`).
3.  **Can I list the difference between `class`, `class?`, and `notnull` constraints?** (If no, review `constraints-and-capability-contracts`).
4.  **Do I understand that `Different closed types are distinct types`?** (If no, review `generic-overloads-and-runtime`).

*Sources: [Microsoft C# Generics Guide](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/), [Constraints](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/generics/constraints-on-type-parameters), [C# 13/15 Whats New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13)*
