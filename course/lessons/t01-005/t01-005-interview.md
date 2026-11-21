
# C# nullability nullable value types and nullable reference analysis — Interview questions and reasoning

# Core questions

When interviewing for C# roles, you will likely be asked to explain the difference between `Nullable<T>` and nullable reference types. 

*   **What is a nullable value type?** It is `Nullable<T>`, a generic struct representing either no value or an underlying non-nullable value type value.
*   **What are nullable reference types?** Nullable reference annotations participate in compile-time flow analysis and are recorded in metadata. They do not create a new runtime type or automatically validate values; compiler warnings help identify possible contract violations.
*   **Why do we need both?** A value type such as `int` needs `Nullable<int>` to represent absence. Reference values can be null at runtime already; nullable reference annotations help static analysis identify possible null misuse but don't prevent runtime exceptions.

# Concise interview answers

*   **How do you handle nulls in C#?** I use `Nullable<T>` for optional value types, reference annotations to communicate intended contracts, and runtime guards where API boundaries require them. Flow attributes describe relationships the compiler cannot infer.
*   **Does `string?` change the runtime behavior?** It does not create a distinct CLR type or runtime check; the compiler can emit nullable metadata for analysis and tooling.
*   **What is the null-forgiving operator (`!`)?** It suppresses nullable flow diagnostics for an expression. It neither checks the value nor changes it at runtime.

# Deep follow-up answers

*   **How does the compiler track null state?** With nullable analysis enabled, it tracks assignments, branches, patterns, and recognized contracts. For example, after `if (obj is not null)`, flow analysis treats `obj` as not-null in that branch; this does not prevent external mutation or contract violations.
*   **Why might a nullable annotation be wrong?** Annotations are not proof. They can be violated by reflection, deserialization, arrays, or external code that was compiled without nullable warnings enabled.
*   **How do you handle complex validation?** When a public method has a null-state relationship that ordinary annotations and flow can't express, I use the appropriate attribute (for example, `NotNullWhen` for an input parameter); its stated postcondition must match runtime behavior.

# Scenario questions

*   **Scenario:** You have a library that accepts a string that might be null, but you want to ensure it is not null before processing.
    *   **Answer:** I would use `ArgumentNullException.ThrowIfNull(input)` at the start when null is invalid. It performs runtime validation, and its annotated contract lets compiler flow analysis treat input as non-null after the continuing path.
*   **Scenario:** You are working with an older library that does not use nullable annotations.
    *   **Answer:** The compiler treats these as "nullable-oblivious." I would use the null-forgiving operator (`!`) if I am certain the value is safe, or perform explicit null checks to be defensive.

# Tradeoffs and alternatives

*   **`Nullable<T>` vs. `T?` (Reference):** `Nullable<T>` is a distinct runtime value type. Nullable reference `T?` doesn't create a distinct CLR type; compilers emit nullable metadata used by tools and analysis.
*   **`GetValueOrDefault()` vs. `.Value`:** `.Value` throws an `InvalidOperationException` if empty; `GetValueOrDefault()` returns a default or supplied fallback. Whether silently substituting a default is safe depends on the domain contract.
*   **Sentinel values vs. Null:** A sentinel can collide with valid data or require special handling; `Nullable<int>` represents absence explicitly for value types. Null Object and optional-result types address different domain/API needs, with no universal best choice.

# Common weak answers

*   "Nullable reference types prevent `NullReferenceException` at runtime." (Incorrect: They are a compile-time tool; runtime checks are still required.)
*   "The `!` operator checks for null." (Incorrect: It suppresses warnings; it does not perform a check.)
*   "I always use `?` on every variable to be safe." (Incorrect: This ignores the intent of the feature, which is to distinguish between variables that *should* be null and those that *should not*.)

# Self-check rubric

*   **Can you distinguish between compile-time analysis and runtime enforcement?** (Annotations and flow attributes inform compile-time analysis; explicit guards validate runtime values.)
*   **Do you know when to use `ThrowIfNull`?** (Reference: [ArgumentNullException.ThrowIfNull](https://learn.microsoft.com/en-us/dotnet/api/system.argumentnullexception.throwifnull))
*   **Can you explain the purpose of flow-analysis attributes?** (Reference: [Nullable analysis attributes](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis))
*   **Do you understand that `Nullable<T>` is a struct?** (Reference: [Nullable value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types))
