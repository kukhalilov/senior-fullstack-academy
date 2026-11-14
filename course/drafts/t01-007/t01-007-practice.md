<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Exercises and worked solutions

# Inheritance, Polymorphism, and Interfaces: Practice Lesson

*Draft: Automatically generated.*

## Goals
*   Understand the difference between `override` (polymorphism) and `new` (hiding).
*   Practice choosing between `abstract class` (shared state/logic) and `interface` (capability contracts).
*   Apply access modifiers to control member visibility.
*   Master the distinction between compile-time and runtime types.

## Worked example
Consider a system for a game character. We want a base class for shared state and an interface for specific capabilities.

```csharp
public abstract class Character {
    public string Name { get; set; }
    public abstract void Attack(); // Must be implemented by derived classes
}

public interface IMovable {
    void Move(); // Capability contract
}

public class Warrior : Character, IMovable {
    public override void Attack() => Console.WriteLine($"{Name} swings a sword!");
    public void Move() => Console.WriteLine($"{Name} marches forward.");
}
```

**Key Concepts:**
1.  **Abstract Class:** Used for "is-a" relationships (A Warrior *is a* Character).
2.  **Interface:** Used for "can-do" capabilities (A Warrior *can* move).
3.  **Virtual Dispatch:** If we hold a `Character` reference, calling `Attack()` triggers the `Warrior` implementation at runtime.

## Exercises

1.  **The Hiding Trap:** Create a class `Base` with a method `void Show()`. Create a `Derived` class that uses the `new` modifier to define `void Show()`. What happens when you call `Show()` on a `Base` reference pointing to a `Derived` instance?
2.  **Interface vs. Abstract:** You are designing a plugin system. Should you use an `abstract class` or an `interface` if the plugins share no code but must all implement a `Run()` method?
3.  **Access Modifiers:** Create a class with a `protected` member. Can an instance of a different class in the same assembly access it? What about a class in a different assembly?

## Progressive hints

*   **Hint 1 (Hiding):** Remember that `new` hides the base member. The compiler looks at the *compile-time* type for non-virtual members.
*   **Hint 2 (Design):** Interfaces are for contracts. If you don't need to share fields or constructors, prefer interfaces to avoid the "Fragile Base Class" problem.
*   **Hint 3 (Access):** `protected` allows access only within the class and its derived types. `internal` allows access anywhere within the same assembly.

## Complete solutions

1.  **Hiding:** The `Base.Show()` method will execute. Because `new` is not an override, the runtime does not perform virtual dispatch.
2.  **Design:** Use an `interface`. It is more flexible and avoids forcing a specific inheritance hierarchy on the plugin developers.
3.  **Access:** `protected` is not accessible to other classes in the same assembly unless they inherit from the base class. `internal` would be accessible to any class in the same assembly.

## Tests and edge cases

*   **Edge Case:** What happens if you try to instantiate an `abstract class`? (Result: Compiler error).
*   **Edge Case:** What happens if a `sealed` class tries to inherit from another class? (Result: Compiler error).
*   **Test:** Verify that `protected internal` allows access from both derived classes *and* any class in the same assembly.

## Reflection questions

1.  Why is "Composition over Inheritance" often recommended? (Hint: Think about how deep hierarchies become hard to change).
2.  How does `static abstract interface member` (C# 11+) change how we write generic algorithms compared to older versions?
3.  When would you choose `explicit interface implementation` over `implicit`? (Hint: Think about name collisions).

*Source: [Microsoft C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)*
