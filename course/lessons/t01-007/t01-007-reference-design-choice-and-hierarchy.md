
# inheritance polymorphism interfaces abstract classes and access modifiers — Reference: Choosing classes, interfaces, composition, and inheritance boundaries

# Scope and version
This lesson covers the design principles and architectural choices for object-oriented hierarchies in C# 15 / .NET 11. It focuses on the conceptual boundaries between inheritance, interfaces, and composition. This content is based on the official Microsoft C# language reference as of 2026-11-17.

# How this group fits the mental model
In C#, you organize code by defining how types relate to one another. 
- **Inheritance** creates a strict "Is-a" relationship where a derived class inherits state and behavior from a base class. 
- **Interfaces** define "Capability" contracts, allowing for flexible, decoupled designs. 
- **Composition** ("Has-a") is often preferred over deep inheritance to avoid the "Fragile base class problem," where changes to a base class unintentionally break derived classes. 
- **Polymorphism** allows you to treat different objects as the same base type, provided they adhere to the expected contract.

# Supplied names explained

* `Interface versus abstract class`: A design choice between defining a pure contract (interface) versus sharing state and implementation (abstract class).
* `Inheritance versus composition`: The decision to extend a base class (inheritance) versus containing an object to delegate work (composition).
* `Is-a relationship`: The logical basis for inheritance; a `Dog` is an `Animal`.
* `Has-a relationship`: The logical basis for composition; a `Car` has an `Engine`.
* `Capability interface`: An interface that defines a specific behavior (e.g., `IDisposable`), allowing types to opt-in to features regardless of their inheritance tree.
* `Shared base implementation`: Code defined in a base class that all derived classes automatically receive.
* `Template method pattern`: A design where a base class defines the skeleton of an algorithm, leaving specific steps to be implemented by derived classes.
* `Fragile base class problem`: A risk in deep inheritance where modifying a base class causes unexpected errors in derived classes.
* `Deep inheritance hierarchy`: A design with many layers of inheritance, which often makes code harder to maintain and reason about.
* `Sealed-by-default design choice`: A design practice of sealing classes that aren't designed as extension points. It limits inheritance but isn't a security boundary, and performance effects should be measured.
* `Extension point`: A location in code (like a virtual method or interface) designed to allow future customization without modifying the original source.
* `Liskov substitutability check`: A principle stating that objects of a superclass should be replaceable with objects of a subclass without breaking the application.
* `Dependency inversion through interface`: Using interfaces to decouple high-level logic from low-level implementations.
* `Closed hierarchy`: A set of types where the inheritance tree is restricted to a known, finite list of members.
* `Union type`: A type that represents a value that can be one of several distinct types, often used with closed hierarchies.
* `Exhaustive pattern matching over closed alternatives`: For C# 15 closed classes, a compiler check can ensure every direct descendant is covered by a switch expression; a non-closed descendant remains extensible, and nullable values may also require a null arm.

# Cross-item comparison

| Comparison | Context |
| :--- | :--- |
| `Inheritance` vs `Composition` | Inheritance couples types tightly; composition allows for easier swapping of behaviors. |
| `Abstract class` vs `Interface` | Abstract classes share state; interfaces define contracts and support multiple implementation. |
| `Closed hierarchy` vs `Open hierarchy` | A C# 15 `closed` class restricts direct derivation to its declaring assembly/module and supports exhaustive switches over direct descendants. Those descendants aren't transitively closed unless separately marked; open classes can be derived from across assemblies. |

# Examples

**Inheritance vs. Composition:**
```csharp
// Inheritance: A Dog IS-A Animal
public class Dog : Animal { }

// Composition: A Car HAS-A Engine
public class Car {
    private readonly Engine _engine = new();
    public void Start() => _engine.Run();
}
```

**Exhaustive Pattern Matching (Closed Hierarchy):**
```csharp
// A C# 15 closed class makes its direct descendant set known to the compiler.
public closed record Shape;
public record Circle(double R) : Shape;
public record Square(double S) : Shape;

public double GetArea(Shape s) => s switch {
    Circle c => Math.PI * c.R * c.R,
    Square sq => sq.S * sq.S
    // Adding a new direct Shape descendant in this assembly produces a non-exhaustive-switch diagnostic.
};
```

# Common mistakes
1. **Over-using Inheritance:** Creating deep hierarchies for simple code reuse instead of using composition.
2. **Violating Liskov:** Creating a subclass that throws an exception for a method defined in the base class, breaking the contract.
3. **Ignoring `sealed`:** Leaving classes open for inheritance when they were not designed to be extended, leading to fragile code.

# Knowledge checks with answers
1. **Question:** Why prefer composition over inheritance?
   **Answer:** Composition avoids the "Fragile base class problem" and reduces tight coupling between types.
2. **Question:** What is the primary benefit and limitation of a "Closed hierarchy"?
   **Answer:** It enables exhaustiveness checking over known direct descendants. Each descendant remains open unless separately restricted, and nullable switches may also need a null arm.
3. **Question:** Can an interface hold instance state?
   **Answer:** No, interfaces define contracts; they do not store instance data (unlike abstract classes).

*Sources: [Microsoft C# Inheritance](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance), [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)*
