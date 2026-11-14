<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Interview questions and reasoning

*Draft: Automatically generated for self-study.*

# C# Classes, Structs, and Records: Interview Preparation

This lesson focuses on the architectural choices between C# types and how to justify them during technical interviews.

### Core Questions
1. **What is the fundamental difference between a `class` and a `struct`?**
2. **When should you use a `record` instead of a `class`?**
3. **How do `primary constructors` differ from traditional constructors?**
4. **What is the purpose of the `required` modifier?**
5. **What are the implications of `value equality` versus `reference identity`?**

### Concise Interview Answers
*   **Class vs. Struct:** A `class` is a reference type (stored on the heap, managed by GC) with identity. A `struct` is a value type (copied by value) that is typically used for small, short-lived data structures to reduce heap allocation.
*   **Record vs. Class:** A `record` is designed for data-centric types. It provides synthesized members for value-based equality, `GetHashCode`, and a `with` expression for non-destructive mutation.
*   **Primary Constructors:** They allow declaring parameters directly in the type header. These parameters are available throughout the class/struct body, often used to initialize fields or properties.
*   **Required Members:** The `required` modifier forces the caller to initialize a property or field during object creation (via object initializers), ensuring the object is never in an invalid "partially initialized" state.
*   **Value vs. Reference:** Reference identity means two objects are the same if they point to the same memory address. Value equality means two objects are "equal" if their data contents match.

### Deep Follow-up Answers
*   **Why avoid mutable structs?** Mutable structs are dangerous because they are copied by value. If you pass a mutable struct to a method, the method receives a copy; any changes made to that copy are lost when the method returns. Furthermore, calling a method on a `readonly` struct field can trigger a "defensive copy" to prevent accidental mutation, which impacts performance.
*   **How do records handle immutability?** Records provide syntax for non-destructive mutation (`with` expressions), but they are not deeply immutable by default. If a record contains a reference type (like a `List<T>`), the record's equality check is shallow; it only checks the reference to the list, not the contents of the list.
*   **When to use `closed` hierarchies (C# 15)?** Use a `closed` class hierarchy when you want to restrict inheritance to a specific set of types within your assembly. This allows the compiler to perform exhaustive checks in `switch` expressions, ensuring all possible subtypes are handled.

### Scenario Questions
*   **Scenario:** You are designing a coordinate system (X, Y). Should you use a `class` or a `struct`?
    *   *Reasoning:* Use a `readonly struct`. It is small, immutable, and avoids heap allocation overhead.
*   **Scenario:** You need a DTO (Data Transfer Object) that represents a user profile and requires frequent comparisons.
    *   *Reasoning:* Use a `record class`. It provides built-in value equality, reducing boilerplate code.
*   **Scenario:** You have a large object that is passed around many methods.
    *   *Reasoning:* Use a `class`. Passing large structs by value causes expensive memory copies.

### Tradeoffs and Alternatives
*   **Primary Constructor vs. Traditional:** Primary constructors are concise but can lead to "parameter capture" issues where variables stay in memory longer than intended. Traditional constructors are more explicit and better for complex validation logic.
*   **Union Types vs. Inheritance:** C# 15 union declarations provide a way to represent "one of" several types without the overhead of a full inheritance hierarchy. They are preferred when the set of types is fixed and known at compile time.
*   **Required Members vs. Constructor Parameters:** Constructor parameters are better for mandatory dependencies (e.g., a database connection). `required` members are better for optional configuration properties that must be set at creation time.

### Common Weak Answers
*   **"Structs are always faster."** *Correction:* Structs are only faster if they are small. Large structs are slower due to the cost of copying them on every assignment or method call.
*   **"Records are immutable."** *Correction:* Records are not automatically immutable. You can define mutable properties in a record. They only provide the *syntax* for non-destructive mutation.
*   **"I don't need to worry about constructors if I use object initializers."** *Correction:* Object initializers run *after* the constructor. If you have logic that must run before the object is usable, it must be in the constructor.

### Self-check Rubric
*   **Can you explain the difference between reference and value types?** (If not, review `t01-004`).
*   **Can you identify when a "defensive copy" occurs?** (Look for `readonly` structs and `in` parameters).
*   **Can you explain why a `record struct` might be better than a `struct`?** (Focus on synthesized equality).
*   **Do you understand the difference between `sealed` and `closed`?** (`sealed` prevents inheritance; `closed` limits it to specific types).

*Source: [Microsoft Learn C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes)*
