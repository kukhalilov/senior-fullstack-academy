<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Interview questions and reasoning

*This is an automatically generated draft.*

# Core questions
In an interview, you will be asked to explain how C# manages object relationships and behavior. The core of this topic is **polymorphism**—the ability for different types to be treated as the same base type.

*   **What is the difference between an `Interface` and an `Abstract class`?**
    *   An `Abstract class` is for sharing state (fields) and implementation code among related classes. An `Interface` defines a capability contract that any class can implement, regardless of its place in the class hierarchy.
*   **How does `Virtual dispatch` differ from `Nonvirtual member lookup`?**
    *   `Virtual dispatch` uses the **Runtime type** of an object to decide which method to run. `Nonvirtual member lookup` uses the **Compile-time type** (the type of the variable).
*   **What is the `Liskov Substitution Principle`?**
    *   It states that objects of a superclass should be replaceable with objects of a subclass without breaking the application.

# Concise interview answers
*   **Why use `Composition over inheritance`?**
    *   Inheritance creates tight coupling. Composition allows you to change behavior at runtime by swapping out components, making the code more flexible and easier to test.
*   **What does the `new` modifier do on a member?**
    *   It declares a member that hides a visible base member during lookup through the derived type. A base-typed expression can still select the base member; `new` does not override the base virtual slot.
*   **What is `Effective accessibility`?**
    *   It is the actual code region that can access the member, constrained by the declared accessibility and containing-type domains. For example, a `public` method inside an `internal` class is only accessible within the same assembly.

# Deep follow-up answers
*   **Explain `Explicit interface implementation` vs `Implicit interface implementation`.**
    *   Implicit implementation makes the member available on the class instance directly. Explicit implementation hides the member from the class instance and only exposes it when the object is cast to the interface type. This is useful for avoiding name collisions or hiding implementation details.
*   **How do `static abstract interface members` change generic programming?**
    *   Introduced in C# 11, they allow interfaces to define static requirements (like operators or factory methods). This enables generic algorithms to perform math or object creation on types that satisfy the interface contract, which was previously impossible.
*   **What is the `Fragile base class` problem?**
    *   It occurs when a base class is modified, inadvertently breaking derived classes that rely on internal implementation details. This is why deep inheritance hierarchies are often discouraged in favor of interfaces.

# Scenario questions
*   **Scenario:** You have a `Shape` class and a `Circle` class. You want to ensure `Circle` cannot be inherited further.
    *   **Solution:** Use the `sealed class` modifier on `Circle`.
*   **Scenario:** You need to share logic across classes that do not share a common base class.
    *   **Solution:** Use an `Interface` with a `Default interface method`. This allows you to provide a base implementation without forcing an inheritance hierarchy.
*   **Scenario:** You are calling a method on a variable of type `Base`, but the object is actually `Derived`. The method is hidden using `new`. What happens?
    *   **Result:** The `Base` version of the method is called because `new` does not trigger virtual dispatch.

# Tradeoffs and alternatives
*   **Inheritance vs. Composition:** Inheritance is for "is-a" relationships (e.g., a `Dog` is an `Animal`). Composition is for "has-a" relationships (e.g., a `Car` has an `Engine`). Prefer composition to avoid the **Fragile base class** problem.
*   **Abstract class vs. Interface:** Use an abstract class when you need to share state (fields) or provide a partial implementation. Use an interface when you need to support multiple inheritance of capabilities or define a contract for unrelated types.
*   **Override vs. New:** Use `override` when you want polymorphic behavior (runtime dispatch). Use `new` only when you must hide a base member without affecting existing polymorphic calls.

# Common weak answers
*   **"Interfaces are just abstract classes with no code."** (Incorrect: Interfaces can now have default implementations and static members).
*   **"Inheritance is always better for code reuse."** (Incorrect: It often leads to rigid, hard-to-maintain hierarchies).
*   **"Access modifiers don't matter if the code is in the same project."** (Incorrect: `internal` and `file` accessibility modifiers are critical for enforcing encapsulation boundaries within an assembly).

# Self-check rubric
*   **Can I identify the difference between `override` and `new`?** (If not, review *Polymorphism and member lookup*).
*   **Do I understand why `Effective accessibility` is restricted by the containing type?** (If not, review *Accessibility and visibility*).
*   **Can I explain when to use `Interface` over `Abstract class`?** (If not, review *Design choice and hierarchy*).
*   **Am I aware of the runtime requirements for `Default interface methods`?** (If not, review *Version notes*).

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)*
