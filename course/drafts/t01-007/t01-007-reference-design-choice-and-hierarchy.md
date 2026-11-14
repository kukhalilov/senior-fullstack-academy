<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Reference: Choosing classes, interfaces, composition, and inheritance boundaries

*Automatically generated draft.*

## Scope and version

- **Topic:** Inheritance, polymorphism, interfaces, abstract classes, and access modifiers (Design choice and hierarchy inventory group).
- **Scope:** This reference lesson explains the architectural and design-time inventory names associated with choosing classes, interfaces, composition, and inheritance boundaries. Records, structs, constructors, object equality, union declaration syntax, generic variance, constraint grammar, and the C# 15 memory-safety preview are excluded.
- **Edition and Checked Date:** C# 15 / .NET 11 GA language surface checked on 2026-11-14.
- **Source Authority:** Microsoft C# language reference and version history (Source: [Microsoft Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance), [Virtual Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual), [Override Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override), [New Modifier](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/new-modifier), [Accessibility Levels](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/accessibility-levels), [Interface Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface), [C# 8 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-8), [C# 11 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11), [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)).

## How this group fits the mental model

When building software architectures, developers decide how different pieces of code relate to one another. 
- **Inheritance** lets a derived type reuse code and specialize behavior from a base class, establishing an **is-a relationship**. However, it creates strong coupling and risks the **fragile base class problem** if the base implementation changes unexpectedly.
- **Composition** connects objects where one type contains or uses another, forming a **has-a relationship**. This decouples behavior and keeps hierarchies shallow.
- **Interfaces** define **capability contracts** (what an object can do) without enforcing shared storage or heavy class ancestry, supporting **dependency inversion through interfaces**.
- Modern C# features like **closed hierarchies**, **union types**, and **exhaustive pattern matching over closed alternatives** allow developers to define explicit sets of derived types whose shapes are known at compile time, ensuring pattern matching handles every legal variant safely.

## Supplied names explained

*Unexecuted code example / pseudocode: The following entries describe design-time and architectural concepts.*

- **Interface versus abstract class:** An abstract class shares state and implementation while requiring derived types to override abstract members. An interface describes a capability contract and supports multiple implementation inheritance without sharing instance storage. (Source: [Microsoft Interface Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface)).
- **Inheritance versus composition:** Inheritance reuses and specializes an existing class contract, creating strict coupling. Composition delegates work to internal component objects, avoiding deep class hierarchies. (Source: [Microsoft Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)).
- **Is-a relationship:** A true substitutable classification where a derived type completely fulfills the behavioral contract of its base type. (Source: [Microsoft Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)).
- **Has-a relationship:** A structural arrangement where a containing type holds an instance of another type as a field or property to delegate operations. (Source: [Microsoft Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)).
- **Capability interface:** An interface named after an isolated ability (such as formatting or rendering) that any unrelated class can implement. (Source: [Microsoft Interface Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface)).
- **Shared base implementation:** Common code, fields, or helper methods housed inside a base class for derived classes to inherit. (Source: [Microsoft Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)).
- **Template method pattern:** A software design pattern where a base class defines the skeleton of an algorithm in a method, deferring specific steps to derived class overrides. (Source: [Microsoft Override Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override)).
- **Fragile base class problem:** An architectural issue where modifications to a base class unintentionally break behavior or compilation in derived classes. (Source: [Microsoft Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)).
- **Deep inheritance hierarchy:** A multi-layered tree of classes inheriting from classes, which makes state management and debugging difficult. (Source: [Microsoft Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)).
- **Sealed-by-default design choice:** The practice of making classes non-inheritable by default unless explicitly designed, documented, and tested for extension. (Source: [Microsoft Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)).
- **Extension point:** A designed hook (such as a virtual method or interface implementation slot) where custom behavior can be plugged into a system. (Source: [Microsoft Virtual Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual)).
- **Liskov substitutability check:** Verifying that any object of a derived type can safely replace an object of its base type without altering correct program behavior. (Source: [Microsoft Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)).
- **Dependency inversion through interface:** Designing high-level modules to depend on abstraction contracts (interfaces) rather than concrete implementations. (Source: [Microsoft Interface Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface)).
- **Closed hierarchy:** A restricted type hierarchy whose complete set of derived types is bounded and known to the compiler (expanded in C# 15). (Source: [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)).
- **Union type:** A type structure representing a value that may take one of several discrete closed alternatives. (Source: [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)).
- **Exhaustive pattern matching over closed alternatives:** Pattern matching checks that guarantee every possible variant in a closed hierarchy or union type is handled by matching branches. (Source: [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)).

## Cross-item comparison

- **Inheritance vs. Composition:** Inheritance relies on class derivation and binds types via an *is-a* relationship with shared base implementations. Composition relies on containment (*has-a*), keeping objects decoupled and preventing deep hierarchies.
- **Abstract Class vs. Interface:** An abstract class can store instance state (fields) and supply method bodies, whereas an interface focuses on capability contracts and supports multiple implementation without single-class ancestry limits.
- **Closed Hierarchy vs. Open Hierarchy:** An open hierarchy permits unknown third-party derived types to be written anywhere. A closed hierarchy restricts valid subtypes, allowing the compiler to perform exhaustive checks.

## Examples

*Note: The following code snippet is unverified pseudocode illustrating architectural boundaries.*

```csharp
// Unverified pseudocode
public interface IRenderable // Capability interface
{
    void Render();
}

public abstract class Shape : IRenderable // Abstract class with shared base implementation
{
    public int X { get; set; }
    public int Y { get; set; }

    public abstract void Render(); // Template method / extension point
}

public sealed class Circle : Shape // Sealed-by-default child class
{
    public double Radius { get; set; }

    public override void Render() 
    {
        // Renders circle
    }
}
```

- **Expected Behavior:** `Circle` satisfies the *is-a* relationship of `Shape` and fulfills `IRenderable`. Because `Circle` is marked `sealed`, further derivation is stopped, avoiding deep inheritance hierarchies.

## Common mistakes

- **Violating Liskov Substitutability:** Forcing an inheritance relationship where the derived class throws exceptions or ignores core behaviors required by the base contract.
- **Overusing Deep Hierarchies:** Creating multi-level class trees when simple composition or capability interfaces would suffice.
- **Ignoring the Fragile Base Class Problem:** Changing internal base class logic without realizing how it impacts derived overrides and state assumptions.

## Knowledge checks with answers

1. **Question:** What is the primary difference between an *is-a* relationship and a *has-a* relationship in object-oriented design?
   - **Answer:** An *is-a* relationship represents inheritance where a derived type specializes a base type contract. A *has-a* relationship represents composition where a type contains another object to delegate functionality.
2. **Question:** Why does a capability interface differ from an abstract class regarding instance storage?
   - **Answer:** An interface defines a capability contract without holding instance storage (fields), whereas an abstract class can declare fields and manage shared state.
3. **Question:** What benefit does exhaustive pattern matching over closed alternatives provide?
   - **Answer:** It ensures that every permissible subtype in a closed hierarchy is explicitly handled by pattern-matching constructs, preventing unhandled runtime branch omissions.
