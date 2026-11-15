<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Reference: Interface implementation forms, inheritance, default members, and static contracts

*This is an automatically generated draft.*

# Scope and version
This lesson covers the C# 15 / .NET 11 language surface regarding interface contracts, inheritance, and static members. It focuses on how interfaces define behavior and how types implement those contracts. Memory-safety previews are excluded. Reference: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance).

# How this group fits the mental model
In C#, an **interface** acts as a contract. While inheritance (classes) creates a "is-a" relationship that shares implementation, interfaces define "can-do" capabilities. You use interfaces to decouple your code from specific implementations, allowing different types to be treated interchangeably through **polymorphism**. By using interfaces, you can support multiple behaviors on a single object, which is not possible with class-based inheritance alone.

# Supplied names explained

* `Interface`: A reference type that defines a contract. It contains members (methods, properties, events, indexers) that implementing classes or structs must provide.
* `Interface inheritance`: The ability for an interface to inherit from one or more other interfaces, requiring the implementing type to satisfy all inherited contracts.
* `Multiple interface implementation`: A class or struct can implement any number of interfaces, allowing it to fulfill multiple distinct roles.
* `Interface base list`: The syntax where a type declares the interfaces it implements, following the base class (if any).
* `Implicit interface implementation`: The standard way to implement an interface where the class member is public and matches the interface member signature.
* `Explicit interface implementation`: A way to implement an interface member by prefixing it with the interface name (e.g., `InterfaceName.MemberName`). This hides the member from the class's public API and resolves naming conflicts.
* `Default interface method`: A method within an interface that provides a body, allowing existing interfaces to evolve without breaking implementing types.
* `Default interface property`: A property within an interface that includes an implementation for its accessors.
* `Default interface event`: An event within an interface that provides default add/remove logic.
* `Default interface indexer`: An indexer within an interface that provides a default implementation.
* `static abstract interface member`: A member that must be implemented by a static member in the implementing type; used to enforce static contracts (like operators) on generic types.
* `static virtual interface member`: A static member in an interface that provides a default implementation but can be overridden by the implementing type.
* `static sealed interface member`: A static member in an interface that provides an implementation that cannot be overridden by implementing types.
* `Non-virtual static interface member`: A static member in an interface that does not participate in virtual dispatch and is available across various runtime versions.
* `Interface reimplementation`: The process where a derived class re-declares an interface that was already implemented by a base class to provide a different implementation.
* `Interface mapping`: The internal process by which the runtime matches interface members to the specific methods in a class.
* `Generic interface implementation`: Implementing an interface that uses type parameters, allowing for type-safe contracts.
* `Explicit member qualification`: Using the interface name to call an explicitly implemented member, necessary because the member is not directly visible on the class instance.
* `Interface segregation`: A design principle where large interfaces are split into smaller, more specific ones so that clients only depend on what they use.
* `Interface reference conversion`: The implicit or explicit conversion of a class instance to an interface type it implements.

# Cross-item comparison

* **Interface vs. Abstract class**: An abstract class shares state (fields) and implementation; an interface defines a contract and supports multiple inheritance without instance storage.
* **Implicit vs. Explicit implementation**: Implicit is the default and makes the member part of the class's public API. Explicit hides the member, making it accessible only when the object is cast to the interface type.
* **Static abstract vs. Default interface members**: Static abstract members define a contract for static behavior (like factories or operators) on types; default interface members provide instance-level logic for existing contracts.

# Examples

```csharp
// Interface definition with a default method
interface ILogger {
    void Log(string message);
    void LogDefault() => Console.WriteLine("Default log"); // Default interface method
}

// Implicit implementation
class ConsoleLogger : ILogger {
    public void Log(string message) => Console.WriteLine(message);
}

// Explicit implementation
class FileLogger : ILogger {
    void ILogger.Log(string message) => System.IO.File.WriteAllText("log.txt", message);
}
```

# Common mistakes

* **Confusing `new` with `override`**: Using `new` hides a base member but does not participate in virtual dispatch. If you want polymorphism, use `virtual` and `override`.
* **Accessing explicit members**: A common error is trying to call an explicitly implemented method directly on the class instance. You must cast the object to the interface type first.
* **Ignoring interface segregation**: Creating "fat" interfaces that force implementing classes to provide methods they don't need leads to fragile code.

# Knowledge checks with answers

1. **Question**: Can a class implement multiple interfaces?
   **Answer**: Yes, C# supports multiple interface implementation.

2. **Question**: How do you resolve a naming conflict when a class implements two interfaces that have the same method name?
   **Answer**: Use explicit interface implementation to provide separate logic for each interface member.

3. **Question**: Does an interface support instance fields?
   **Answer**: No, interfaces cannot contain instance state (fields). They define contracts for behavior.

4. **Question**: What is the primary difference between `virtual` dispatch and `new` member hiding?
   **Answer**: Virtual dispatch uses the runtime type to select the method, while `new` (non-virtual) lookup uses the compile-time type.
