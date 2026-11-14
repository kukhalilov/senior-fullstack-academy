<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Interview questions and reasoning

*This is an automatically generated draft.*

# Interview Lesson: Inheritance, Polymorphism, and Interfaces in C#

This lesson prepares you to discuss object-oriented design in C# 15. We focus on how to reason about code structure, explain design choices, and navigate the tradeoffs between inheritance and composition.

---

### Core questions

1.  **What is the difference between an abstract class and an interface?**
2.  **How does virtual dispatch differ from non-virtual member lookup?**
3.  **When should you prefer composition over inheritance?**
4.  **What is the "Fragile Base Class" problem?**
5.  **How do access modifiers determine the "effective accessibility" of a member?**

---

### Concise interview answers

*   **Abstract Class vs. Interface:** An abstract class provides a base implementation and shared state (fields); it represents an "is-a" relationship. An interface defines a capability contract; it allows for multiple implementation inheritance without sharing state.
*   **Virtual Dispatch vs. Non-virtual:** Virtual dispatch uses the **runtime type** of an object to select the implementation (e.g., `override`). Non-virtual lookup uses the **compile-time type** (the variable's declared type).
*   **Composition vs. Inheritance:** Inheritance creates a tight coupling between base and derived classes. Composition (giving a class an instance of another class) is preferred when you need to reuse functionality without forcing an "is-a" relationship, avoiding deep, rigid hierarchies.
*   **Fragile Base Class:** This occurs when changes to a base class unintentionally break derived classes because the derived classes rely on internal implementation details of the base.
*   **Effective Accessibility:** A member's accessibility cannot be broader than its containing type. For example, a `public` method inside an `internal` class is only accessible within the same assembly.

---

### Deep follow-up answers

*   **Explain `new` vs `override`:** `override` participates in virtual dispatch, meaning the runtime will call the derived version even if the reference is of the base type. The `new` modifier performs **member hiding**; it does not override the base member. If you call the method via a base-type reference, the base implementation will execute, not the hidden one.
*   **Static Abstract Interface Members:** Introduced in C# 11, these allow interfaces to define static contracts (like operators or factory methods). This enables generic algorithms to enforce that a type provides specific static behavior, which was previously impossible with standard instance-based interfaces.
*   **Explicit vs. Implicit Interface Implementation:** Implicit implementation makes the member available on the class instance directly. Explicit implementation hides the member unless the object is cast to the interface type, which is useful for avoiding name collisions or hiding implementation details from the public API.

---

### Scenario questions

*   **Scenario:** You have a `Shape` class and a `Circle` class. You want to ensure `Circle` cannot be inherited further.
    *   *Answer:* Mark the `Circle` class as `sealed`. This prevents further derivation and allows the compiler to optimize calls to its members.
*   **Scenario:** You need to share logic across several unrelated classes, but they don't share a common base class.
    *   *Answer:* Use an interface with a **Default Interface Method** (C# 8+). This allows you to provide a shared implementation directly in the interface without requiring a common base class.

---

### Tradeoffs and alternatives

| Feature | Tradeoff | Alternative |
| :--- | :--- | :--- |
| **Inheritance** | High coupling; fragile base class risk. | Composition (Has-a). |
| **Virtual Methods** | Runtime overhead; harder to reason about flow. | Non-virtual methods or sealed classes. |
| **Interface** | Requires implementing all members. | Abstract class (if shared state is needed). |
| **Member Hiding (`new`)** | Confusing; breaks polymorphic expectations. | Proper `virtual`/`override` design. |

---

### Common weak answers

*   **"Interfaces are just abstract classes without code."** (Weak: Ignores default interface implementations and static abstract members).
*   **"I always use inheritance to reuse code."** (Weak: Ignores the risks of tight coupling and the benefits of composition).
*   **"Access modifiers are just for security."** (Weak: They are primarily for API design and managing the "surface area" of your code to prevent unintended dependencies).

---

### Self-check rubric

*   **Can you explain the difference between compile-time and runtime types?** (If not, review "Polymorphism and member lookup").
*   **Can you identify when to use `sealed`?** (If not, review "Class inheritance and construction").
*   **Do you understand why `public` members in an `internal` class are restricted?** (If not, review "Accessibility and visibility").
*   **Can you describe the "Is-a" vs "Has-a" relationship?** (If not, review "Design choice and hierarchy").

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)*
