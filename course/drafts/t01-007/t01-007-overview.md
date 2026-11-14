<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Big-picture orientation and mental model

*Automatically generated draft.*

# Inheritance, Polymorphism, Interfaces, and Access Modifiers

## Problem and Purpose
In software development, you often need to represent objects that share common traits but behave differently. Without a structured way to handle this, you would end up writing duplicate code for every slight variation of an object.

This topic provides the tools to:
1. **Reuse code:** Define common logic once and share it across multiple types.
2. **Define contracts:** Specify what an object *can do* without dictating *how* it does it.
3. **Control visibility:** Ensure that internal implementation details remain hidden from users of your code.
4. **Enable flexibility:** Allow your program to treat different objects as the same type (polymorphism), making your code easier to extend.

## Plain-language mental model
Think of **Inheritance** as a family tree: a "Car" might inherit from "Vehicle." It gets the basic features of a vehicle (like an engine) for free.

Think of **Interfaces** as a job description: a "Printer" and a "Scanner" might both implement an "IWorkDevice" interface. Even though they are completely different machines, they both promise to fulfill the "Scan" or "Print" contract.

**Access Modifiers** are like security clearances. They determine who can see or change the "parts" inside your objects—whether it’s the public (everyone), your family (derived classes), or just you (private).

## How the parts fit together
These concepts work together to create a stable system:
* **Classes** provide the structure and state.
* **Inheritance** lets classes build upon each other.
* **Interfaces** allow classes to adopt multiple "roles" or capabilities.
* **Polymorphism** allows you to write code that works with a base class or interface, ignoring the specific details of the underlying object.
* **Access Modifiers** act as the "rules of engagement," ensuring that the internal state of these objects isn't accidentally broken by outside code.

## Concept map
*   **Inheritance:** Establishing "Is-a" relationships (e.g., a `Dog` is an `Animal`).
*   **Polymorphism:** Using a base type to interact with various derived types at runtime.
*   **Interfaces:** Defining "Can-do" capabilities (e.g., `ICanFly`).
*   **Abstract Classes:** A hybrid that provides some shared code but requires derived classes to finish the implementation.
*   **Access Modifiers:** Scoping rules (`public`, `private`, `protected`, `internal`) that define visibility.

## End-to-end walkthrough
Imagine a simple drawing application:

1.  **Define a Contract:** You create an interface `IShape` with a method `Draw()`.
2.  **Create Base Logic:** You create an `abstract class Shape` that holds a `Color` property (shared by all shapes).
3.  **Implement Specifics:** You create `Circle` and `Square` classes. They inherit from `Shape` (to get the `Color`) and implement `IShape` (to provide their own `Draw()` logic).
4.  **Polymorphic Usage:** You create a `List<IShape>`. You add a `Circle` and a `Square` to it.
5.  **Execution:** You loop through the list and call `Draw()` on each item. The program automatically knows to run the `Circle` version of `Draw` for the circle and the `Square` version for the square. This is **virtual dispatch**.

## When to use it and tradeoffs
*   **Use Inheritance** when there is a clear "is-a" relationship and you want to share implementation code.
*   **Use Interfaces** when you want to define a capability that unrelated classes can share.
*   **Tradeoff (Fragile Base Class):** Over-using inheritance can make your code "fragile." If you change the base class, you might accidentally break all the derived classes.
*   **Tradeoff (Composition vs. Inheritance):** Often, it is safer to use **composition** (giving an object a component) rather than inheritance (making an object a type of something else).

## What later lessons cover
*   **Generics:** How to write code that works with any type while maintaining safety.
*   **Pattern Matching:** How to check the specific type of an object at runtime and act on it.
*   **Records and Structs:** Alternative ways to define data-focused types.
*   **Variance:** How to handle complex relationships between generic types.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)*
