
# inheritance polymorphism interfaces abstract classes and access modifiers — Reference: Base classes, derived classes, constructor chaining, and abstract types

# Scope and version
This lesson covers C# 15 / .NET 11 GA language features related to class inheritance, abstract types, and member overriding. It excludes memory-safety previews, records, structs, and generic variance. All information is based on the C# language reference as of 2026-11-17.

# How this group fits the mental model
Inheritance allows you to create a hierarchy where a `Derived class` inherits the state and behavior of a `Base class`. This establishes an "is-a" relationship. 
- **Abstract types** provide a blueprint that cannot be instantiated, forcing derived classes to provide specific implementations.
- **Virtual dispatch** allows the runtime to choose the correct implementation of a method based on the actual object type, rather than the variable type.
- **Access modifiers** control the visibility of these members, ensuring that internal implementation details remain hidden while public contracts remain stable.

# Supplied names explained

* `Base class`: The class from which another class inherits. It provides the foundation of members and state.
* `Derived class`: A class that inherits members from a base class. It can extend or modify the base behavior.
* `Direct base class`: The class immediately above the current class in the inheritance hierarchy.
* `Indirect base class`: A class further up the hierarchy (e.g., the grandparent of the current class).
* `Single class inheritance`: A class has at most one direct base class (besides the implicit `object` base where applicable); it can implement multiple interfaces.
* `base class constructor`: The constructor of the base class, which must be initialized before the derived class constructor completes.
* `base constructor initializer : base(...)`: Syntax used in a derived constructor to explicitly call a specific constructor of the base class.
* `base member access expression`: The `base` keyword used to access a base implementation or member hidden by the current derived type where permitted; `base` calls do not redispatch to the current override.
* `Abstract class`: A class declared with `abstract` that cannot be instantiated; it serves as a base for other classes.
* `abstract method`: A method without an implementation in an abstract class; a concrete derived class must provide an implementation, though an abstract intermediate class may defer it.
* `abstract property`: A property without an implementation in an abstract class; a concrete derived class must implement the required abstract accessors; an abstract intermediate class may defer them.
* `abstract indexer`: An indexer without an implementation in an abstract class; derived classes must implement it.
* `Abstract accessor`: The `get` or `set` portion of an abstract property or indexer that lacks a body.
* `Concrete implementation of abstract member`: The actual code provided by a derived class for an abstract member.
* `Concrete class`: A class that is not abstract and can be instantiated.
* `Cannot instantiate abstract class`: A compiler rule preventing the creation of objects from types marked `abstract`.
* `Virtual method`: A method that can be overridden in a derived class to change its behavior.
* `Virtual property`: A property that can be overridden in a derived class.
* `Virtual indexer`: An indexer that can be overridden in a derived class.
* `virtual accessor`: The `get` or `set` portion of a virtual property or indexer that can be overridden.
* `Override member`: A member in a derived class that provides a new implementation for a virtual or abstract member.
* `override method`: The specific syntax used to replace a virtual method's implementation.
* `override property`: The specific syntax used to replace a virtual property's implementation.
* `override indexer`: The specific syntax used to replace a virtual indexer's implementation.
* `sealed override`: An `override` member that also includes the `sealed` modifier, preventing further overrides in deeper derived classes.
* `sealed class`: A class that cannot be inherited from.
* `Cannot inherit from sealed class`: A compiler rule preventing a class from deriving from a type marked `sealed`.

# Cross-item comparison
- **Override member vs. Hidden member with new**: An `override` member participates in virtual dispatch (runtime choice), while a member hidden with `new` is resolved based on the compile-time type.
- **Abstract class vs. Interface**: An `abstract class` can hold state (fields) and share implementation, while an `interface` defines a contract and supports multiple inheritance of capabilities.
- **Virtual dispatch vs. Nonvirtual member lookup**: Virtual dispatch uses the object's actual type at runtime; nonvirtual lookup uses the variable's declared type.
- **Inheritance vs. Composition**: Inheritance creates a rigid "is-a" hierarchy; composition builds objects by containing other objects, which is often more flexible.

# Examples
```csharp
// Abstract base class and concrete override
public abstract class Animal {
    public abstract void Speak(); // abstract method
}

public class Dog : Animal {
    public override void Speak() => System.Console.WriteLine("Woof"); // Concrete implementation
}
```

# Common mistakes
- **Fragile Base Class**: Adding members to a base class that inadvertently break derived classes.
- **Forgetting `override`**: If you define a method in a derived class with the same name as a base method without using `override` or `new`, the compiler will issue a warning, and the base method will be hidden.
- **Over-inheritance**: Using inheritance for code reuse when composition would be more appropriate, leading to deep, hard-to-maintain hierarchies.

# Knowledge checks with answers
1. **Q: Can you instantiate an `Abstract class`?**
   A: No, the compiler prevents this.
2. **Q: What is the difference between `virtual` and `abstract`?**
   A: `virtual` members have a default implementation that derived classes may override; `abstract` members have no implementation and must be implemented before a concrete derived type can be instantiated.
3. **Q: What does `sealed` do to a class?**
   A: It prevents any other class from inheriting from it.

*Source: [Microsoft C# Inheritance Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)*
