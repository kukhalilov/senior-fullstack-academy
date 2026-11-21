
# C# value types reference types copying identity and equality — Interview questions and reasoning

# C# Value Types, Reference Types, Identity, and Equality

In C#, understanding how data is stored and compared is fundamental. Beginners often struggle with the "stack vs. heap" myth. In reality, the distinction between **Value types** and **Reference types** is about **semantics**: how the language treats a variable when you assign it, pass it to a method, or compare it.

### Core questions
1. What is the difference between a Value type and a Reference type?
2. How does assignment differ between these two categories?
3. What is the difference between `==`, `Equals()`, and `ReferenceEquals()`?
4. Why is mutability dangerous when using shared objects?

### Concise interview answers
*   **Value vs. Reference:** A value-type variable contains a value; a reference-type variable contains a reference to an object. Physical placement and representation are implementation details.
*   **Assignment:** Assigning a value type copies its value (for a struct with reference fields, those references are also copied). Assigning a reference type copies the reference, so both variables can refer to the same object.
*   **Equality:** `==` is type-dependent and can be overloaded. `ReferenceEquals` checks object identity; `Equals()` is virtual and its meaning depends on the implementation. Base `Object.Equals` uses identity for ordinary classes, while value types provide value equality.
*   **Mutability:** Mutating an object through one alias can be observed through another alias. Mutating a copied struct value doesn't mutate the source variable, though copied reference fields can still share mutable objects.

### Deep follow-up answers
*   **"Does a value type always live on the stack?"** No. The specification defines semantics, not physical storage. A value can be embedded in an object or array, boxed, or stored according to runtime implementation.
*   **"What is Boxing?"** Boxing creates an object containing a copy of a value type, enabling conversion to `object` or an implemented interface. It commonly allocates, though optimization may remove an unobservable allocation.
*   **"How do Records handle equality?"** Records synthesize value equality and matching hash codes. A `record class` remains a reference type; a `record struct` remains a value type. A `with` expression makes a shallow copy.

### Scenario questions
*   **Scenario:** You have a `List<MyStruct>` where `MyStruct` is large. What is the performance implication?
    *   *Answer:* Cost depends on struct size and access pattern; `List<T>` indexer returns `T` by value, while enumeration has its own semantics. Measure before redesigning; `ref`-returning APIs or `in` parameters may help in selected cases but add constraints and aren't universally faster.
*   **Scenario:** You need to store a custom type in a `Dictionary`. What must you implement?
    *   *Answer:* Equality and hash code must be consistent, and dictionary lookup uses its comparer. If key state used by the comparer changes after insertion, lookup may fail because the key may be searched in a different bucket.

### Tradeoffs and alternatives
*   **Struct vs. Class:** Consider `struct` for small values with value semantics; it does not guarantee avoiding heap allocation. Use `class` when reference identity, inheritance, or shared object state is needed.
*   **EqualityComparer<T>.Default:** Use it when generic code needs type-appropriate equality. It uses `IEquatable<T>` when available and otherwise falls back to object equality; avoid promising a particular performance gain without measurement.

### Common weak answers
*   **"Value types are on the stack, Reference types are on the heap."** (Too simplistic; ignores implementation details and boxing).
*   **"I always use `==` for equality."** (Fails to account for custom operator overloads or the difference between reference and value equality).
*   **"Records are just classes."** (`record class` is a reference type with synthesized value equality; `record struct` is a value type with synthesized value equality. Ordinary classes don't synthesize that contract.)

### Self-check rubric
*   **Can you explain "Aliasing"?** (Do you understand that mutations to one object through one reference can be observed through another reference to that same object?)
*   **Can you identify a "Mutable value type hazard"?** (Do you know that copies and property/indexer access can produce separate values?)
*   **Do you know when to implement `IEquatable<T>`?** (Do you know it supplies strongly typed equality and generic comparers can call it without boxing value types when that path applies?)

***

**Sources:**
* [Microsoft Learn: Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)
* [Microsoft Learn: Equality Comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)
* [Microsoft Learn: Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records)
* [C# 15 / .NET 11 Release Notes](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)
