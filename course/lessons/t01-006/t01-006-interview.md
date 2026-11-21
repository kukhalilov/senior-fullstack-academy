
# C# classes structs records constructors and initialization — Interview questions and reasoning

# Core questions
When interviewing for C# roles, you will be asked to justify your choice of data structures. The core questions focus on:
*   **Identity vs. Value:** When should an object be treated as a unique entity (identity) versus a collection of data (value)?
*   **Memory Layout:** How do `class` (reference type) and `struct` (value type) differ in memory allocation and copying behavior?
*   **Initialization:** How do you guarantee an object is in a valid state upon creation using `primary constructor` and `required member`?
*   **Modern Data Modeling:** How do `record` types and the C# 15 `union` declaration simplify data-oriented programming?

# Concise interview answers
*   **Class vs. Struct:** A `class` is a reference type, so assignment copies a reference. A `struct` is a value type, so assignment copies its fields (including references held by those fields). Physical storage location is context/runtime dependent.
*   **Record vs. Class:** A record class is still a reference type but synthesizes value equality and supports `with`; an ordinary class defaults to reference equality but may implement custom equality.
*   **Primary Constructor:** A primary constructor declares parameters in the type header. Class/struct parameters are in scope in the body but aren't automatically properties; records synthesize positional properties.
*   **Required Member:** `required` makes the compiler require initialization in creation expressions unless a constructor asserts `SetsRequiredMembers`. It doesn't guarantee a non-null or domain-valid value at runtime.

# Deep follow-up answers
*   **Struct Copying:** Struct values have copy semantics, but the compiler/runtime may optimize physical copies. Large structs can make copying more expensive; benchmark first, and use `in`/`ref readonly` where the API's aliasing semantics are appropriate.
*   **Record Immutability:** Records aren't necessarily immutable. Init-only properties provide shallow immutability; referenced mutable objects can still change. Generated equality delegates to each member's equality behavior rather than recursively deep-comparing object graphs.
*   **Union Types:** C# 15 union declarations model a closed set of case types and enable exhaustiveness diagnostics. They're useful when alternatives are fixed; inheritance remains appropriate for open hierarchies or shared behavior. Generated unions use a struct representation with an `object?` payload, so don't claim a universal performance advantage.
*   **Closed Classes:** A `closed` class restricts its direct descendants to the same assembly and enables exhaustiveness over those direct descendants. Descendants are open unless separately closed or sealed, and nullable switches must handle null when applicable.

# Scenario questions
*   **Scenario:** You need a type to represent a 3D coordinate.
*   *Choice:* Consider `readonly record struct` if coordinates are small value-like data and value equality/copy semantics fit. It provides readonly state and synthesized value equality, but measure performance and account for any referenced members.
*   **Scenario:** You are building a complex business entity with a database ID.
    *   *Choice:* `class`. Entities have identity (the ID). Even if two objects have the same data, they are distinct entities.
*   **Scenario:** You need to handle a response that could be a `Success`, `Failure`, or `Loading` state.
    *   *Choice:* `union`. It explicitly defines allowed case types and enables exhaustiveness diagnostics when every case (and any possible null contents) is handled.

# Tradeoffs and alternatives
*   **Class vs. Record:** Use a `class` for behavior-heavy objects with identity. Use a `record` for data-transfer objects (DTOs) where equality and state snapshots are more important than identity.
*   **Required Member vs. Constructor:** Use `required member` when you have many optional properties and want to avoid "telescoping constructors" (many overloads). Use a `primary constructor` when the data is essential for the object's existence.
*   **Closed Class vs. Sealed Class:** A `sealed class` prevents *all* inheritance. A `closed class` allows inheritance within the assembly, providing a balance between extensibility and compiler-verified exhaustiveness.

# Common weak answers
*   **"Structs are always on the stack."** *Correction:* A struct has value semantics; storage placement depends on its containing context and runtime.
*   **"Records are immutable."** *Correction:* Records are not inherently immutable; they just provide syntax for non-destructive mutation (`with` expressions). You must explicitly design them to be immutable.
*   **"Structs are always faster because they avoid garbage collection."** *Correction:* Structs can be boxed or embedded in heap objects and may incur copying costs; choose based on semantics and measured workload.

# Self-check rubric
*   **Can I explain the difference between reference equality and value equality?** (Reference: `class` vs `record`).
*   **Do I know when to use `readonly struct` to avoid defensive copies?** (Reference: `readonly struct declaration`).
*   **Can I explain why `required` members are safer than parameterless constructors for DTOs?** (Reference: `required modifier`).
*   **Do I understand the scope of a `closed class`?** (Reference: `closed class modifier`).

*Sources: [Microsoft Learn C# Classes](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes), [Structs](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/structs), [Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records), [C# 15 Whats New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15).*
