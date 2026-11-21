
# inheritance polymorphism interfaces abstract classes and access modifiers — Core concepts and how they fit together

# Learning objectives
* Understand the distinction between inheritance (is-a) and composition (has-a).
* Master the mechanics of virtual dispatch versus non-virtual member lookup.
* Distinguish between `abstract class` and `interface` usage.
* Learn how access modifiers control the visibility and effective accessibility of members.

# Prerequisites
* Basic understanding of C# classes and objects.
* Familiarity with the concept of a "type" in C# (e.g., `class`, `interface`).
* Understanding that code execution occurs within a specific assembly boundary.

# Core concepts
* **Inheritance**: Allows a `Derived class` to reuse and specialize a `Base class`. It creates an "is-a" relationship.
* **Polymorphism**: The ability for code to treat different objects as the same type (usually a base class or interface) and have the correct behavior triggered at runtime.
* **Virtual Dispatch**: When a method is marked `virtual`, C# uses the `Runtime type` of the object to decide which implementation to run, rather than the `Compile-time type`.
* **Abstract Classes vs. Interfaces**: An `Abstract class` provides a shared base implementation and state. An `Interface` defines a contract of capabilities without requiring shared state.
* **Access Modifiers**: Keywords like `public`, `private`, `protected`, and `internal` define the `Accessibility domain` of a member. The `Effective accessibility` of a member cannot be broader than its containing type.

# Mechanisms and relationships
* **Dispatch Logic**: If you call a method on a variable, the compiler checks if the method is `virtual`. If it is, the runtime looks for the most derived `override method`. If it is not `virtual`, the compiler uses the `Compile-time type` to pick the method.
* **Member Hiding**: Using the `new modifier on a member` hides a base member. Unlike an `override method`, this does not participate in `Virtual dispatch`.
* **Interface Contracts**: Interfaces support `Multiple interface implementation`. Since C# 8, they can include `Default interface method` implementations. Since C# 11, they support `static abstract interface member` definitions to enforce static contracts on types.
* **Accessibility Rules**: You cannot expose a `public` method that returns a `private` type, as this would violate `Signature accessibility consistency`.

# Worked examples
Consider a scenario with a base class and a derived class:

```csharp
public class Animal {
    public virtual void Speak() => Console.WriteLine("Generic sound");
}

public class Dog : Animal {
    public override void Speak() => Console.WriteLine("Woof");
}

// Usage
Animal myPet = new Dog();
myPet.Speak(); // Output: "Woof" (Virtual dispatch)
```

If we use the `new` modifier instead:

```csharp
public class Cat : Animal {
    public new void Speak() => Console.WriteLine("Meow");
}

// Usage
Animal myCat = new Cat();
myCat.Speak(); // Output: "Generic sound" (Nonvirtual member lookup)
```

# Misconceptions and edge cases
* **Misconception**: "Inheritance is always the best way to share code." 
    * **Reality**: Excessive use leads to the `Fragile base class` problem, where changing the base class breaks derived classes. Prefer `Composition over inheritance` when you only need to reuse functionality.
* **Edge Case**: `protected internal` accessibility means the member is accessible to derived types OR types within the same assembly.
* **Edge Case**: `private protected` means the member is accessible only to derived types within the same assembly.

# Knowledge checks with answers
1. **Question**: What is the difference between `override` and `new`?
   * **Answer**: `override` participates in `Virtual dispatch` (runtime selection), while `new` performs `Member hiding` (compile-time selection).
2. **Question**: Can an `Interface` contain state (fields)?
   * **Answer**: No, interfaces do not support instance storage.
3. **Question**: Why does `Effective accessibility` matter?
   * **Answer**: It ensures that a member cannot be accessed by code that cannot access the type containing it, maintaining encapsulation.

*Sources*:
[https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)
[https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual)
[https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override)
[https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/new-modifier](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/new-modifier)
[https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/accessibility-levels](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/accessibility-levels)
[https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface)
[https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/abstract](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/abstract)
[https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-8](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-8)
[https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11)
[https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)
