
# properties indexers fields methods parameters and overloads — Interview questions and reasoning

# Core questions
In an interview, you will be asked to justify your choice of member type. The core problem is **encapsulation**: how do you expose data or behavior while maintaining control over the object's state?

*   **Fields** store state directly. They are the "raw" data.
*   **Properties** act as a gatekeeper. They allow you to add validation or logic (computed properties) without changing the public API.
*   **Methods** represent actions or complex transformations that don't fit into a simple "get/set" model.
*   **Indexers** allow objects to be accessed like arrays, providing a natural syntax for collections or mapped data.

**Mental Model:** Think of an object as a house. **Fields** are the items inside the house. **Properties** are the doors and windows—you can control who enters or what is seen. **Methods** are the chores or services performed inside. **Indexers** are the address labels that let you find specific rooms or items quickly.

# Concise interview answers
*   **Why use a property instead of a field?**
    Properties provide an accessor-based abstraction and can permit implementation changes without changing source-level property syntax. They are not interchangeable with fields in every binary, serialization, or interop scenario, and should not hide surprising or expensive work.
*   **What is the difference between `ref`, `in`, and `out` parameters?**
    *   `ref` allows a method to read and modify the caller's variable.
    *   `in` passes a readonly reference (or compiler-created temporary); the parameter cannot be reassigned, but a referenced object can still be mutated.
    *   `out` forces the method to assign a value to the variable before returning.
*   **What is an auto-implemented property?**
    It is shorthand where the compiler supplies backing storage and accessor implementations.

# Deep follow-up answers
*   **How does overload resolution work?**
    The compiler performs member lookup, determines applicable function members (including argument mapping, generic inference, and conversions), and compares them using the language better-member rules. If no unique best applicable member exists, the call is ambiguous; these rules are more than a simple conversion ranking.
*   **What are `required` members?**
    `required` asks the compiler to enforce that an object-creation expression initializes a member (or trusts a `[SetsRequiredMembers]` constructor). It does not validate business invariants or guarantee non-null values at runtime.
*   **Explain the `field` keyword (C# 14).**
    It allows you to access the compiler-generated backing field directly within a property's `get` or `set` accessor, eliminating the need to declare a private field manually when you only need simple logic.

# Scenario questions
*   **Scenario:** You need to expose a list of items but don't want external code to clear the list.
    *   **Answer:** Expose a read-only view or immutable/copying API whose contract prevents callers from mutating the underlying list. Returning `IEnumerable<T>` or `IReadOnlyList<T>` alone does not ensure the underlying object cannot be cast or otherwise changed.
*   **Scenario:** You have a class that represents a coordinate system. How do you allow access to points via `[x, y]`?
    *   **Answer:** Implement an `Indexer` with two parameters.
*   **Scenario:** You have a method that needs to return two values.
    *   **Answer:** Use `out` parameters or, preferably, a `ValueTuple` or a `record` type to return a structured result.

# Tradeoffs and alternatives
| Feature | Tradeoff |
| :--- | :--- |
| **Field** | Direct storage access; offers no accessor hook and can expose state if public. |
| **Property** | Accessor-based API; can store, compute, or validate, with behavior callers should find unsurprising. |
| **Extension Method** | Adds functionality without modifying the original class, but can be harder to discover than instance methods. |
| **C# 14 Extension Block** | Allows adding properties and static members to existing types, but requires careful management of "instance member precedence." |

# Common weak answers
*   **"I always use public fields because they are faster."**
    *   *Correction:* Do not assume fields are materially faster without measuring the workload. A public field exposes direct storage and has different API evolution and metadata characteristics from a property.
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
