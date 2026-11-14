<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Core concepts and how they fit together

*This lesson is an automatically generated draft.*

# Inheritance, Polymorphism, Interfaces, and Access Modifiers

## Learning objectives
* Understand the difference between inheritance (is-a) and composition (has-a).
* Distinguish between virtual dispatch (runtime) and non-virtual lookup (compile-time).
* Learn when to use an `abstract` class versus an `interface`.
* Master the rules of member accessibility and effective accessibility.

## Prerequisites
* Basic understanding of C# classes and objects.
* Familiarity with the concept of a "type" (e.g., `int`, `string`, or a custom `class`).

## Core concepts
In object-oriented programming, we often need to group related types or share logic.

1.  **Inheritance:** Allows a class to acquire the members of another class. Use this for "is-a" relationships (e.g., a `Dog` is an `Animal`).
2.  **Polymorphism:** The ability of code to treat different objects as the same base type. You call a method on a base reference, and the specific version of that method (the one in the actual object) runs.
3.  **Interfaces:** A contract that defines *what* a class can do, without dictating *how* it does it. Unlike classes, a class can implement multiple interfaces.
4.  **Access Modifiers:** Keywords that control which parts of your code can see or use your types and members.

## Mechanisms and relationships

### The Hierarchy Map
*   **Abstract Class:** Use when you want to share code (state/logic) among related classes. You cannot create an instance of an abstract class.
*   **Interface:** Use when you want to define a capability (e.g., `ICanFly`) that unrelated classes might share.
*   **Virtual vs. New:** 
    *   `virtual` + `override`: Tells the runtime to look for the most specific implementation.
    *   `new`: Tells the compiler to ignore the base member and use the new one instead (this is called **member hiding**).

### Accessibility Rules
The **effective accessibility** of a member cannot be "wider" than the class it lives in. If a class is `internal` (only visible in the current assembly), a `public` method inside it is effectively restricted to that assembly.

## Worked examples

### Example 1: Virtual Dispatch vs. Hiding
```csharp
public class Base {
    public virtual void Show() => Console.WriteLine("Base");
    public void Hide() => Console.WriteLine("Base Hide");
}

public class Derived : Base {
    public override void Show() => Console.WriteLine("Derived"); // Overrides
    public new void Hide() => Console.WriteLine("Derived Hide"); // Hides
}

// Usage:
Base b = new Derived();
b.Show(); // Prints "Derived" (Virtual dispatch)
b.Hide(); // Prints "Base Hide" (Non-virtual lookup uses compile-time type)
```

### Example 2: Interface vs. Abstract Class
```csharp
public abstract class Animal {
    public string Name { get; set; } // Shared state
    public abstract void Speak();    // Must be implemented
}

public interface IJumpable {
    void Jump(); // Capability contract
}

public class Dog : Animal, IJumpable {
    public override void Speak() => Console.WriteLine("Woof!");
    public void Jump() => Console.WriteLine("Dog jumps!");
}
```

## Misconceptions and edge cases
*   **Misconception:** "Inheritance is always the best way to reuse code." 
    *   **Reality:** Inheritance creates tight coupling. If you change the base class, you might break all derived classes (the **Fragile Base Class** problem). Prefer **composition** (holding an object as a field) when you just need to use another class's functionality.
*   **Edge Case:** If you use `new` to hide a member, you can still access the base version by casting the object to the base type. This often leads to confusing bugs.
*   **Edge Case:** Interfaces can now have default implementations (since C# 8), but they still cannot store instance state (fields).

## Knowledge checks with answers

1.  **Question:** If I have a `public` method inside an `internal` class, who can access that method?
    *   **Answer:** Only code within the same assembly. The `internal` modifier on the class restricts the "effective accessibility" of all its members.

2.  **Question:** What is the primary difference between `override` and `new`?
    *   **Answer:** `override` participates in virtual dispatch, meaning the runtime calls the method based on the actual object type. `new` hides the base member, and the compiler calls the method based on the variable's declared (compile-time) type.

3.  **Question:** When should you prefer an interface over an abstract class?
    *   **Answer:** When you need to support multiple inheritance of capabilities, or when the types involved do not share a common "is-a" hierarchy.

*Source: [Microsoft C# Inheritance Documentation](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)*
