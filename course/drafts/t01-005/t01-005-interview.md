<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Interview questions and reasoning

*Automatically generated draft.*

# Core questions

When interviewing for C# roles, you will likely be asked to explain the difference between `Nullable<T>` and nullable reference types. 

*   **What is a nullable value type?** It is a struct (`System.Nullable<T>`) that wraps a value type to allow it to represent an additional "null" state.
*   **What are nullable reference types?** They are a compile-time feature that uses static flow analysis to track nullability. Unlike value types, they do not change the runtime type of the object; they only provide warnings to the developer.
*   **Why do we need both?** Value types (like `int`) cannot be null by default, so `Nullable<T>` provides a container for them. Reference types (like `string`) can always be null, so nullable reference types provide a way to express intent and catch potential `NullReferenceException` errors before the code runs.

# Concise interview answers

*   **How do you handle nulls in C#?** I use `Nullable<T>` for value types and nullable reference annotations for reference types. I rely on `ArgumentNullException.ThrowIfNull` for runtime validation and use flow-analysis attributes like `NotNullWhen` to help the compiler understand complex logic.
*   **Does `string?` change the runtime behavior?** No. It is a compile-time annotation. The runtime sees a standard `string`.
*   **What is the null-forgiving operator (`!`)?** It is a way to tell the compiler, "I know this expression is not null, even if you think it might be." It has no effect at runtime.

# Deep follow-up answers

*   **How does the compiler track null state?** The compiler performs null-state analysis by tracking assignments, branches, and patterns. For example, after an `if (obj is not null)` check, the compiler updates the state of `obj` to "not-null" within that scope.
*   **Why might a nullable annotation be wrong?** Annotations are not proof. They can be violated by reflection, deserialization, arrays, or external code that was compiled without nullable warnings enabled.
*   **How do you handle complex validation?** If a method returns a value only when a condition is met, I use `MaybeNullWhen` or `NotNullWhen` attributes. This allows the compiler to understand the relationship between the return value and the method's output parameters.

# Scenario questions

*   **Scenario:** You have a library that accepts a string that might be null, but you want to ensure it is not null before processing.
    *   **Answer:** I would use `ArgumentNullException.ThrowIfNull(input)` at the start of the method. This acts as a guard clause that satisfies the compiler's null-state analysis.
*   **Scenario:** You are working with an older library that does not use nullable annotations.
    *   **Answer:** The compiler treats these as "nullable-oblivious." I would use the null-forgiving operator (`!`) if I am certain the value is safe, or perform explicit null checks to be defensive.

# Tradeoffs and alternatives

*   **`Nullable<T>` vs. `T?` (Reference):** `Nullable<T>` is a distinct type at runtime; `T?` (reference) is a metadata-only hint.
*   **`GetValueOrDefault()` vs. `.Value`:** `.Value` throws an `InvalidOperationException` if the value is null. `GetValueOrDefault()` is safer as it returns the default value of the type if the container is empty.
*   **Sentinel values vs. Null:** Using a sentinel value (like -1 for an ID) can be faster but is often less expressive than `Nullable<int>`. The Null Object pattern is a better alternative for complex objects to avoid null checks entirely.

# Common weak answers

*   "Nullable reference types prevent `NullReferenceException` at runtime." (Incorrect: They are a compile-time tool; runtime checks are still required.)
*   "The `!` operator checks for null." (Incorrect: It suppresses warnings; it does not perform a check.)
*   "I always use `?` on every variable to be safe." (Incorrect: This ignores the intent of the feature, which is to distinguish between variables that *should* be null and those that *should not*.)

# Self-check rubric

*   **Can you distinguish between compile-time analysis and runtime enforcement?** (Reference: [Nullable reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types))
*   **Do you know when to use `ThrowIfNull`?** (Reference: [ArgumentNullException.ThrowIfNull](https://learn.microsoft.com/en-us/dotnet/api/system.argumentnullexception.throwifnull))
*   **Can you explain the purpose of flow-analysis attributes?** (Reference: [Nullable analysis attributes](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis))
*   **Do you understand that `Nullable<T>` is a struct?** (Reference: [Nullable value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types))
