<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Interview questions and reasoning

*This is an automatically generated draft.*

# C# Value Types, Reference Types, Identity, and Equality

In C#, understanding how data is stored and compared is fundamental. Beginners often struggle with the "stack vs. heap" myth. In reality, the distinction between **Value types** and **Reference types** is about **semantics**: how the language treats a variable when you assign it, pass it to a method, or compare it.

### Core questions
1. What is the difference between a Value type and a Reference type?
2. How does assignment differ between these two categories?
3. What is the difference between `==`, `Equals()`, and `ReferenceEquals()`?
4. Why is mutability dangerous when using shared objects?

### Concise interview answers
*   **Value vs. Reference:** A value-type variable contains a value; a reference-type variable contains a reference to an object. Physical placement and representation are implementation details.
*   **Assignment:** Assigning a Value type creates a **Value copy** (a bit-for-bit duplicate). Assigning a Reference type creates a **Reference copy** (both variables now point to the exact same object).
*   **Equality:** `==` checks for value equality (for primitives) or reference equality (for classes). `ReferenceEquals` checks whether two references identify the same object instance. `Equals()` is a virtual method intended to check for logical equality.
*   **Mutability:** If you mutate a shared object (Reference type), all variables pointing to that object see the change. If you mutate a local copy of a Value type, the original remains unchanged.

### Deep follow-up answers
*   **"Does a Value type always live on the stack?"** No. That is a common misconception. The language specification defines behavior, not physical storage. A Value type can live on the heap if it is a field of a class, or inside an array.
*   **"What is Boxing?"** Boxing is the process of wrapping a Value type inside an object on the heap. This allows a Value type to be treated as a Reference type (e.g., when casting an `int` to `object`). This incurs a performance cost due to allocation.
*   **"How do Records handle equality?"** Records (both `record class` and `record struct`) provide synthesized equality. They automatically implement `Equals` and `GetHashCode` based on their synthesized equality rules and instance state, rather than reference identity.

### Scenario questions
*   **Scenario:** You have a `List<MyStruct>` where `MyStruct` is large. What is the performance implication?
    *   *Answer:* Because structs are copied by value, accessing or iterating over a list of large structs can cause significant performance degradation due to frequent memory copying. Consider using `ref` returns or `readonly ref` parameters to avoid these copies.
*   **Scenario:** You need to store a custom type in a `Dictionary`. What must you implement?
    *   *Answer:* You must ensure the type has a consistent `GetHashCode()` and `Equals()` implementation. If the type is mutable, using it as a dictionary key is a "mutable hash key hazard," as changing the object after it is added will make it impossible to retrieve.

### Tradeoffs and alternatives
*   **Struct vs. Class:** Use `struct` for small, immutable data carriers (Value objects) to avoid heap allocation. Use `class` for entities that require identity, inheritance, or shared mutable state.
*   **EqualityComparer<T>.Default:** Always prefer `EqualityComparer<T>.Default` over manual equality checks in generic code. It automatically selects the most efficient equality implementation (e.g., `IEquatable<T>` if available).

### Common weak answers
*   **"Value types are on the stack, Reference types are on the heap."** (Too simplistic; ignores implementation details and boxing).
*   **"I always use `==` for equality."** (Fails to account for custom operator overloads or the difference between reference and value equality).
*   **"Records are just classes."** (Ignores the critical difference: Records provide value-based equality by default, whereas classes provide reference-based equality).

### Self-check rubric
*   **Can you explain "Aliasing"?** (Do you understand that two variables pointing to the same object means changing one changes the other?)
*   **Can you identify a "Mutable value type hazard"?** (Do you know why mutable structs are generally discouraged?)
*   **Do you know when to use `IEquatable<T>`?** (Do you understand it is a performance optimization to avoid boxing during equality checks?)

***

**Sources:**
* [Microsoft Learn: Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)
* [Microsoft Learn: Equality Comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)
* [Microsoft Learn: Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records)
* [C# 15 / .NET 11 Release Notes](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)
