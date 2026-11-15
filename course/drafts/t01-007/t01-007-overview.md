<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Big-picture orientation and mental model

*This is an automatically generated draft.*

# Problem and purpose
In software development, you often need to represent objects that share common traits but behave differently. If you write separate code for every specific type of object, your codebase becomes repetitive and difficult to maintain.

Inheritance, polymorphism, and interfaces solve this by allowing you to define shared structures and behaviors. They enable you to write code that works with a general category (like "Shape") while automatically handling specific types (like "Circle" or "Square") at runtime. This reduces code duplication and makes your system flexible enough to handle new types without rewriting existing logic.

# Plain-language mental model
Imagine a **Blueprint** (a class). You can create a "House" blueprint that defines basic features like walls and a roof.
*   **Inheritance** is like creating a "Mansion" blueprint that starts with the "House" blueprint but adds extra rooms. The Mansion *is a* House.
*   **Polymorphism** is the ability to treat a Mansion as a House. If you tell a contractor to "paint the House," they can paint the Mansion without needing to know it has extra rooms.
*   **Interfaces** are like a "Contract." A building might sign a contract to be "AirConditioned." A House, a Mansion, and an Office building can all sign this contract, even if they are built from completely different blueprints.

# How the parts fit together
These features work together to define how objects relate to each other:
1.  **Classes** provide the structure and state (data).
2.  **Inheritance** creates a hierarchy where a **Derived class** inherits members from a **Base class**.
3.  **Polymorphism** allows you to use a base class reference to call methods on a derived object. **Virtual dispatch** ensures the correct version of a method runs based on the actual object type, not the reference type.
4.  **Interfaces** provide a way to define capabilities that classes must implement, allowing for **Multiple interface implementation** where a class can fulfill many different contracts.
5.  **Access modifiers** act as the "security guard," determining which parts of your code can see or change your classes and members.

# Concept map
*   **Hierarchy:** Use **Inheritance** for "is-a" relationships (e.g., a `Dog` is an `Animal`). Use **Composition** (holding an object inside another) for "has-a" relationships.
*   **Contracts:** Use **Interfaces** to define what an object can *do* (e.g., `ICanFly`). Use **Abstract classes** when you want to share code *and* define a contract.
*   **Visibility:** Use **Access modifiers** (like `public` or `protected`) to hide internal details and expose only what is necessary.
*   **Dispatch:** Use `virtual` and `override` to allow derived classes to change behavior. Use `new` only when you need to hide a base member (rarely recommended).

# End-to-end walkthrough
Consider a simple system for a drawing application:

1.  **Define a Base:** You create an `abstract class Shape`. It has an `abstract void Draw();` method. Because it is abstract, you cannot create a `Shape` directly.
2.  **Create Derived Classes:** You create `Circle` and `Square`. They inherit from `Shape` and provide their own `Draw()` implementation using the `override` keyword.
3.  **Use Polymorphism:** You create a `List<Shape>`. You add a `Circle` and a `Square` to it.
4.  **Execution:** When you loop through the list and call `shape.Draw()`, the runtime uses **Virtual dispatch** to call the `Circle.Draw()` method for the circle and the `Square.Draw()` method for the square.
5.  **Add a Contract:** You define an `interface IColorable` with a `void Paint()` method. `Circle` implements this interface. Now, your code can treat the `Circle` as a `Shape` (to draw it) or as an `IColorable` (to paint it).

# When to use it and tradeoffs
*   **Use Inheritance** when you have a clear "is-a" relationship and want to share implementation code. **Tradeoff:** It creates tight coupling; changes to the base class can break all derived classes (the "Fragile base class" problem).
*   **Use Interfaces** when you want to define capabilities across unrelated classes. **Tradeoff:** They do not store state, so you may repeat code if you don't use default interface implementations.
*   **Use Access Modifiers** to follow the principle of least privilege. Keep members `private` or `protected` by default to prevent external code from relying on your internal implementation details.

# What later lessons cover
*   **Generic constraints:** How to restrict types in collections (t01-009).
*   **Generic variance:** How interfaces behave with different types (t01-010).
*   **Pattern matching:** How to check types and extract data safely (t01-012).
*   **Records and Structs:** Alternative ways to define data types (separate type-shape topics).

*Source: [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)*
