<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Exercises and worked solutions

*This is an automatically generated draft.*

# Goals
*   Understand the difference between **Inheritance** (is-a) and **Composition** (has-a).
*   Distinguish between **Virtual dispatch** (runtime) and **Nonvirtual member lookup** (compile-time).
*   Learn when to use an **Abstract class** versus an **Interface**.
*   Master **Access modifiers** to control the visibility of your code.

# Worked example
Imagine a game system. We need a `Player` and an `Enemy`. Both are `Entity` types, but they behave differently.

```csharp
public abstract class Entity {
    public abstract void Move(); // Must be implemented by derived classes
    public void LogStatus() => Console.WriteLine("Entity active"); // Shared logic
}

public interface IDamageable {
    void TakeDamage(int amount); // Capability contract
}

public class Player : Entity, IDamageable {
    public override void Move() => Console.WriteLine("Player moves via input");
    public void TakeDamage(int amount) => Console.WriteLine("Player health reduced");
}
```

**Step-by-step breakdown:**
1.  **Abstract class (`Entity`)**: Provides a base contract and shared logic (`LogStatus`). You cannot create an `Entity` directly (`new Entity()` is invalid).
2.  **Interface (`IDamageable`)**: Defines a capability. Any class can implement this, even if it doesn't inherit from `Entity`.
3.  **Polymorphism**: You can treat a `Player` as an `Entity` or an `IDamageable`. The runtime knows to call the `Player`'s `Move` method because it is marked `override`.

# Exercises
1.  **The Hiding Trap**: Create a base class with a method `void SayHello()`. Create a derived class that uses the `new` modifier to define `void SayHello()`. Create an instance of the derived class, assign it to a variable of the base class type, and call `SayHello()`. Does it call the base or derived version?
2.  **Interface vs Abstract**: You have a `Logger` system. Some loggers write to files (shared logic for opening/closing files), while others just send data to a network (no shared logic). Which should be an `abstract class` and which should be an `interface`?
3.  **Access Modifiers**: Create a class with a `protected` member. Try to access it from a different class in the same assembly. Then, try to access it from a class that inherits from your class. What happens?

# Progressive hints
*   **Exercise 1**: Remember that `new` performs **Member hiding**. The compiler looks at the *compile-time type* of the variable, not the *runtime type* of the object.
*   **Exercise 2**: If you need to share code (like file handling), use an `abstract class`. If you only need to ensure a class has a specific method (like `Log()`), use an `interface`.
*   **Exercise 3**: `protected` allows access only within the class and its derived types. It is not `public` to the rest of the assembly.

# Complete solutions
1.  **Hiding**: Because `new` was used, the base class version is called. If you had used `virtual` and `override`, the derived version would be called.
2.  **Design**: The `FileLogger` should inherit from an `abstract class` (to share file-handling logic). The `NetworkLogger` can implement an `interface` (or the same abstract class if it fits the hierarchy).
3.  **Access**: The `protected` member is invisible to unrelated classes, even in the same assembly. It is only visible to the class itself and its children.

# Tests and edge cases
*   **Fragile Base Class**: If you change a `virtual` method in a base class, you might break all derived classes. Always consider if `sealed` is appropriate for your classes.
*   **Interface Reimplementation**: If a class implements two interfaces with the same method name, use **Explicit interface implementation** to resolve the conflict.
*   **Effective Accessibility**: You cannot have a `public` method that returns a `private` class. The compiler will throw an error because the return type is less accessible than the method.

# Reflection questions
1.  Why is "Composition over Inheritance" often preferred in large systems?
2.  How does the `sealed` keyword protect your API design?
3.  When would you choose a `static abstract interface member` over a standard `abstract method` in a base class? (Consider the need for multiple inheritance of capabilities).

*Source: [Microsoft C# Inheritance Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)*
