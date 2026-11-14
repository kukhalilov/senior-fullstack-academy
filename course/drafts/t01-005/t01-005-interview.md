<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Interview questions and reasoning

# C# Nullability: Interview Preparation

This lesson covers the distinction between nullable value types and nullable reference types, the mechanics of static flow analysis, and how to communicate nullability contracts in public APIs.

*Draft status: Automatically generated.*

---

## Core questions

1. **What is the difference between a `Nullable<T>` value type and a nullable reference type?**
2. **How does the C# compiler determine the "null state" of a variable?**
3. **Why do nullable reference types not prevent `NullReferenceException` at runtime?**
4. **When should you use the null-forgiving operator (`!`)?**
5. **How do flow-analysis attributes improve API design?**

---

## Concise interview answers

1. **`Nullable<T>` vs. Reference Types:** `Nullable<T>` is a struct that wraps a value type to allow an "absent" state. Nullable reference types are purely compile-time annotations; they do not change the underlying runtime type (which remains a reference).
2. **Null-state analysis:** The compiler tracks variables through assignments, branches, and patterns. It maintains a "null state" (e.g., *maybe-null* or *not-null*) for every reference to predict if a dereference is safe.
3. **Runtime safety:** Nullable reference types are a static analysis tool. They provide warnings during development to catch bugs early, but they do not inject runtime checks. Code from older libraries or reflection can still introduce `null` into a non-nullable variable.
4. **Null-forgiving operator:** Use `!` only when you have external knowledge the compiler lacks (e.g., a property initialized by a framework via reflection). It is an assertion, not a check; it suppresses the warning but does nothing at runtime.
5. **Flow-analysis attributes:** Attributes like `[NotNullWhen]` or `[MemberNotNull]` allow you to describe complex relationships between inputs and outputs that the compiler cannot infer on its own, making your public API contracts more precise.

---

## Deep follow-up answers

*   **"If nullable reference types aren't runtime checks, why use them?"**
    They shift the burden of null-checking from the consumer to the producer. By enabling the nullable warning context, you force developers to handle potential nulls explicitly, reducing the surface area for `NullReferenceException` before the code ever runs.
*   **"How do I handle nullability when working with legacy code?"**
    You can use `#nullable disable` or `#nullable restore` directives to manage the context. When consuming "oblivious" (legacy) libraries, treat all returned references as *maybe-null* regardless of annotations, as the library does not participate in the contract.
*   **"What is the risk of the null-forgiving operator?"**
    The risk is a false sense of security. If your assumption is wrong, you bypass the compiler's protection, leading to a `NullReferenceException` at runtime. It should be used sparingly and documented.

---

## Scenario questions

*   **Scenario:** You are writing a method that returns a value from a dictionary. How do you ensure the caller knows if the value exists?
    *   *Answer:* Use the `Try-pattern` (`bool TryGetValue(TKey key, out TValue? value)`). Annotate the `out` parameter as `TValue?` and use `[NotNullWhen(true)]` on the return type to inform the compiler that if the method returns `true`, the `out` parameter is guaranteed to be non-null.
*   **Scenario:** You have a class property that is initialized in a helper method rather than the constructor. The compiler warns that the property is uninitialized. How do you fix this?
    *   *Answer:* Use the `[MemberNotNull(nameof(PropertyName))]` attribute on the helper method. This tells the compiler that after this method executes, the specified property is guaranteed to be non-null.

---

## Tradeoffs and alternatives

| Feature | Alternative | Tradeoff |
| :--- | :--- | :--- |
| `Nullable<T>` | Sentinel value | `Nullable<T>` is type-safe and explicit; sentinels (like -1) are error-prone. |
| `T?` (Reference) | `null` checks | `T?` provides compile-time warnings; `null` checks are runtime-only. |
| `!` operator | `if (x is null)` | `!` is a silent assertion; `if` checks are safe but add runtime overhead. |
| `MaybeNull` | `T?` | `MaybeNull` is for generic return types where `T` might be a value type or reference type. |

---

## Common weak answers

*   **"Nullable reference types prevent null errors."** (Weak: They *reduce* them by providing warnings; they do not *prevent* them at runtime.)
*   **"I use `!` whenever I get a compiler warning to make it go away."** (Weak: This ignores the underlying design issue and creates a hidden runtime risk.)
*   **"Nullable reference types change the memory layout of my objects."** (Weak: They are metadata only; they have no impact on the runtime memory footprint.)

---

## Self-check rubric

*   **Can you explain the difference between a compile-time warning and a runtime exception?**
*   **Do you know when to use `[NotNullWhen]` versus `[MaybeNull]`?**
*   **Can you identify why `default!` might be dangerous in a generic class?**
*   **Are you able to distinguish between `Nullable<T>` (the struct) and `T?` (the annotation)?**

*Source: [Microsoft Learn C# Nullable Reference Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types)*
