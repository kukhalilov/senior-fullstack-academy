<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Interview questions and reasoning

*This lesson is an automatically generated draft.*

# Core questions
When interviewing for C# roles, you will be asked to justify your choice of data structures. The core questions focus on:
*   **Identity vs. Value:** When should an object be treated as a unique entity (identity) versus a collection of data (value)?
*   **Memory Layout:** How do `class` (reference type) and `struct` (value type) differ in memory allocation and copying behavior?
*   **Initialization:** How do you guarantee an object is in a valid state upon creation using `primary constructor` and `required member`?
*   **Modern Data Modeling:** How do `record` types and the C# 15 `union` declaration simplify data-oriented programming?

# Concise interview answers
*   **Class vs. Struct:** A `class` is a reference type with identity; it is stored on the heap. A `struct` is a value type; it is copied by value and typically stored where it is declared (stack or inline in a containing type).
*   **Record vs. Class:** A `record` provides synthesized value-based equality and `with` expression support for non-destructive mutation, whereas a `class` uses reference equality by default.
*   **Primary Constructor:** A `primary constructor` allows you to declare parameters directly in the type header, which are then available for field/property initialization throughout the class or struct body.
*   **Required Member:** The `required` modifier forces the caller to initialize a property during object creation, ensuring the object cannot exist in an invalid state.

# Deep follow-up answers
*   **Struct Copying:** Because structs are copied by value, passing a large `struct` to a method can cause performance degradation due to the cost of copying. Use `in` parameters or `readonly struct` to mitigate defensive copies.
*   **Record Immutability:** Records are not automatically deeply immutable. If a record contains a reference type (like a `List<T>`), the record's value equality is shallow; the reference remains the same, and the underlying data can still be mutated.
*   **Union Types:** In C# 15, a `union` declaration allows a type to represent one of several cases. This is superior to traditional inheritance hierarchies for data modeling because it provides exhaustive pattern matching and avoids the overhead of virtual method tables.
*   **Closed Classes:** A `closed class` limits inheritance to the same assembly. This allows the compiler to guarantee exhaustiveness in `switch` expressions, as no external code can derive new types from the hierarchy.

# Scenario questions
*   **Scenario:** You need a type to represent a 3D coordinate.
    *   *Choice:* `readonly record struct`. It is a value type (efficient for small data), immutable (prevents accidental coordinate changes), and provides value equality (so two points with the same X, Y, Z are equal).
*   **Scenario:** You are building a complex business entity with a database ID.
    *   *Choice:* `class`. Entities have identity (the ID). Even if two objects have the same data, they are distinct entities.
*   **Scenario:** You need to handle a response that could be a `Success`, `Failure`, or `Loading` state.
    *   *Choice:* `union`. It explicitly defines the allowed states and forces the developer to handle every case via pattern matching.

# Tradeoffs and alternatives
*   **Class vs. Record:** Use a `class` for behavior-heavy objects with identity. Use a `record` for data-transfer objects (DTOs) where equality and state snapshots are more important than identity.
*   **Required Member vs. Constructor:** Use `required member` when you have many optional properties and want to avoid "telescoping constructors" (many overloads). Use a `primary constructor` when the data is essential for the object's existence.
*   **Closed Class vs. Sealed Class:** A `sealed class` prevents *all* inheritance. A `closed class` allows inheritance within the assembly, providing a balance between extensibility and compiler-verified exhaustiveness.

# Common weak answers
*   **"Structs are always on the stack."** *Correction:* Structs are stored wherever they are declared. If a struct is a field in a class, it lives on the heap.
*   **"Records are immutable."** *Correction:* Records are not inherently immutable; they just provide syntax for non-destructive mutation (`with` expressions). You must explicitly design them to be immutable.
*   **"I always use classes because they are easier."** *Correction:* This ignores memory pressure and performance. Structs are vital for high-performance scenarios to reduce garbage collection (GC) pressure.

# Self-check rubric
*   **Can I explain the difference between reference equality and value equality?** (Reference: `class` vs `record`).
*   **Do I know when to use `readonly struct` to avoid defensive copies?** (Reference: `readonly struct declaration`).
*   **Can I explain why `required` members are safer than parameterless constructors for DTOs?** (Reference: `required modifier`).
*   **Do I understand the scope of a `closed class`?** (Reference: `closed class modifier`).

*Sources: [Microsoft Learn C# Classes](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes), [Structs](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/structs), [Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records), [C# 15 Whats New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15).*
