<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Reference: Interface implementation forms, inheritance, default members, and static contracts

## Scope and version

*Automatically generated draft.*

This reference lesson covers the exact inventory group `interface-contracts` within the C# language surface. 
- **Scope:** Interface implementation forms, inheritance, default members, and static contracts.
- **Edition / Checked State:** C# 15 / .NET 11 GA language surface checked 2026-11-14; memory-safety language preview is excluded.
- **Source Reference:** [Microsoft C# language reference and version history](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance), [virtual keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual), [override keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override), [new modifier](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/new-modifier), [accessibility levels](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/accessibility-levels), [interface keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface), [C# 8 whats-new](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-8), [C# 11 whats-new](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11), [C# 15 whats-new](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15).

## How this group fits the mental model

An **Interface** describes a capability contract. Unlike an abstract class, it defines *what* behaviors a type must support without sharing instance storage or enforcing a single ancestral line. 

In the broader object-oriented model:
1. **Inheritance** lets a derived class specialize behavior and share state, but creates tight coupling.
2. **Interfaces** decouple the caller from the implementation. Types can implement multiple interfaces, satisfying various capability contracts independently.
3. **Advanced Contracts** (such as default members and static abstract contracts) expand interfaces from pure markers into powerful capability mixins and generic constraint toolsets.

## Supplied names explained

* `Interface`: A reference type contract definition using the `interface` keyword that specifies methods, properties, events, or indexers without instance fields.
* `Interface inheritance`: The ability for an interface to derive from one or more base interfaces, requiring implementing types to satisfy all inherited contracts.
* `Multiple interface implementation`: A class or struct implementing more than one interface simultaneously by separating them with commas in its base list.
* `Interface base list`: The syntax section following a colon `:` in a type declaration where base classes and implemented interfaces are listed.
* `Implicit interface implementation`: Publicly matching interface members automatically by name and signature inside an implementing class.
* `Explicit interface implementation`: Implementing an interface member by qualifying its name with the interface type (e.g., `IDraw.Draw`), hiding it from public class access.
* `Default interface method`: An interface method defined with a body in C# 8+, providing fallback behavior when implementing classes do not override it.
* `Default interface property`: An interface property with an accessor body supplied directly within the interface declaration.
* `Default interface event`: An interface event definition featuring default implementation blocks.
* `Default interface indexer`: An interface indexer definition that includes a default body.
* `static abstract interface member`: A static member declared with `static abstract` requiring implementing types to provide a matching static implementation for generic constraints (C# 11+).
* `static virtual interface member`: A static member declared with `static virtual` that provides a default implementation and can be overridden.
* `static sealed interface member`: A static interface member that cannot be overridden further by implementing types or derived interfaces.
* `Non-virtual static interface member`: A static interface member introduced in C# 15 usable on older runtimes without virtual dispatch overhead.
* `Interface reimplementation`: The pattern where a derived class explicitly implements an interface that its base class already implements, providing a new version of those interface members.
* `Interface mapping`: The runtime mechanism that ties interface members to the exact class methods that implement them.
* `Generic interface implementation`: Implementing an interface whose contract is parameterized by one or more type parameters (e.g., `IEquatable<T>`).
* `Explicit member qualification`: Prefixes used during explicit implementation or invocation to target a specific interface member name.
* `Interface segregation`: A design principle stating that clients should not be forced to depend upon interfaces that they do not use.
* `Interface reference conversion`: An explicit or implicit cast converting an object reference to an interface reference type that the object's class supports.

## Cross-item comparison

- **Implicit vs. Explicit Interface Implementation:** Implicit implementation makes members publicly visible directly on the class instance, whereas explicit implementation hides members on the class and only exposes them through an interface reference.
- **Default Interface Method vs. Abstract Class Member:** Default interface methods provide capability mixins without sharing instance fields, whereas abstract class members reside in a single inheritance hierarchy and can access shared state fields.
- **`static abstract interface member` vs. `static virtual interface member`:** `static abstract` forces implementing types to supply their own static logic, whereas `static virtual` provides a default body that can optionally be overridden.

## Examples

*Unverified code example (pseudocode / unexecuted snippet for reference representation):*

```csharp
// Simple demonstration of an Interface and Implicit/Explicit Implementation
using System;

public interface IGreeter
{
    void Greet(); // Default abstract interface member form
    
    // Default interface method (C# 8+)
    void SayGoodbye() => Console.WriteLine("Goodbye default.");
}

public class ConsoleGreeter : IGreeter
{
    // Implicit interface implementation
    public void Greet()
    {
        Console.WriteLine("Hello implicit!");
    }
}

public class Program
{
    public static void Main()
    {
        IGreeter greeter = new ConsoleGreeter();
        greeter.Greet();          // Outputs: Hello implicit!
        greeter.SayGoodbye();     // Outputs: Goodbye default.
    }
}
```

Expected behavior: Calling `Greet()` on an `IGreeter` reference pointing to `ConsoleGreeter` dispatches to the implicit class implementation. Calling `SayGoodbye()` invokes the interface's default implementation because `ConsoleGreeter` did not override it.

## Common mistakes

* **Confusing Implicit and Explicit Access:** Attempting to call an explicitly implemented interface member directly on the class variable instance without casting to the interface type first.
* **Instance State in Interfaces:** Trying to declare instance fields inside an interface. Interfaces cannot store instance state; they only describe contracts.
* **Diamond Ambiguities with Default Methods:** Overlooking name collisions when a class inherits multiple default interface methods with identical signatures, which requires explicit override definitions to resolve.

## Knowledge checks with answers

1. **Question:** Can an interface declare instance fields?
   * **Answer:** No. Interfaces cannot contain instance state; they only define behavioral contracts, properties, events, indexers, and static members.
2. **Question:** What is the main difference between implicit and explicit interface implementation?
   * **Answer:** Implicit implementation exposes members directly on the class public surface, while explicit implementation hides members unless accessed via an interface reference.
3. **Question:** When were default interface methods introduced to C#?
   * **Answer:** C# 8 introduced default interface implementations.
