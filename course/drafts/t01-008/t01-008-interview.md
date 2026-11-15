<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Interview questions and reasoning

*This is an automatically generated draft.*

# Core questions
In an interview, you will be asked to justify your choice of member type. The core problem is **encapsulation**: how do you expose data or behavior while maintaining control over the object's state?

*   **Fields** store state directly. They are the "raw" data.
*   **Properties** act as a gatekeeper. They allow you to add validation or logic (computed properties) without changing the public API.
*   **Methods** represent actions or complex transformations that don't fit into a simple "get/set" model.
*   **Indexers** allow objects to be accessed like arrays, providing a natural syntax for collections or mapped data.

**Mental Model:** Think of an object as a house. **Fields** are the items inside the house. **Properties** are the doors and windows—you can control who enters or what is seen. **Methods** are the chores or services performed inside. **Indexers** are the address labels that let you find specific rooms or items quickly.

# Concise interview answers
*   **Why use a property instead of a field?**
    Properties provide an abstraction layer. They allow you to change the internal implementation (e.g., adding logging, validation, or lazy loading) without breaking the code that consumes the class.
*   **What is the difference between `ref`, `in`, and `out` parameters?**
    *   `ref` allows a method to read and modify the caller's variable.
    *   `in` ensures the method cannot modify the variable (read-only).
    *   `out` forces the method to assign a value to the variable before returning.
*   **What is an auto-implemented property?**
    It is a shorthand syntax where the compiler automatically generates a private backing field for you, reducing boilerplate code.

# Deep follow-up answers
*   **How does overload resolution work?**
    The compiler looks at the method name and the provided arguments. It identifies "candidate members" and uses "implicit conversion ranking" to determine the "better function member." If multiple methods are equally applicable, it results in an ambiguity error.
*   **What are `required` members?**
    Introduced to ensure that specific properties are initialized during object creation. This prevents objects from existing in an invalid "partially initialized" state.
*   **Explain the `field` keyword (C# 14).**
    It allows you to access the compiler-generated backing field directly within a property's `get` or `set` accessor, eliminating the need to declare a private field manually when you only need simple logic.

# Scenario questions
*   **Scenario:** You need to expose a list of items but don't want external code to clear the list.
    *   **Answer:** Expose a `get`-only property that returns an `IEnumerable<T>` or `IReadOnlyList<T>`. Keep the actual `List<T>` as a private field.
*   **Scenario:** You have a class that represents a coordinate system. How do you allow access to points via `[x, y]`?
    *   **Answer:** Implement an `Indexer` with two parameters.
*   **Scenario:** You have a method that needs to return two values.
    *   **Answer:** Use `out` parameters or, preferably, a `ValueTuple` or a `record` type to return a structured result.

# Tradeoffs and alternatives
| Feature | Tradeoff |
| :--- | :--- |
| **Field** | Fast, but exposes internal state; no validation. |
| **Property** | Encapsulated, but slightly more verbose than a field. |
| **Extension Method** | Adds functionality without modifying the original class, but can be harder to discover than instance methods. |
| **C# 14 Extension Block** | Allows adding properties and static members to existing types, but requires careful management of "instance member precedence." |

# Common weak answers
*   **"I always use public fields because they are faster."**
    *   *Correction:* While fields are technically faster, the performance difference is negligible in most applications. The cost of losing encapsulation (the ability to change logic later) is much higher.
*   **"I don't use indexers because they are confusing."**
    *   *Correction:* Indexers are standard in .NET for collection-like types. Using them makes your API feel "native" to C# developers.
*   **"I use `ref` for everything to save memory."**
    *   *Correction:* `ref` should only be used when you specifically need to modify the caller's variable or pass large structs efficiently. Overusing it makes code harder to read and reason about.

# Self-check rubric
1.  **Can I explain the difference between a field and a property?** (If not, review "Stored members" vs "Read/write contracts").
2.  **Do I understand why `required` members exist?** (They solve the problem of incomplete object initialization).
3.  **Can I describe how `params` arrays/collections work?** (They allow passing a variable number of arguments to a method).
4.  **Do I know the difference between `virtual` and `abstract`?** (Virtual has a default implementation; abstract requires a derived class to provide one).
5.  **Am I aware of the new C# 14/15 features?** (Review the `field` keyword and extension blocks).

*Source: [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/properties), [C# 14 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14), [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15).*
