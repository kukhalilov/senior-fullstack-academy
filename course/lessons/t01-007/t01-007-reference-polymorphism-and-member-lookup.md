
# inheritance polymorphism interfaces abstract classes and access modifiers — Reference: Runtime dispatch, member hiding, and compile-time versus runtime type

# Scope and version
This lesson covers the mechanics of runtime dispatch, member hiding, and type-based member resolution in C# 15 / .NET 11. It focuses on how the C# compiler and runtime determine which code executes when types are related through inheritance. This content is based on the Microsoft C# language reference (checked 2026-11-17).

# How this group fits the mental model
In C#, your code interacts with objects through two lenses: the **compile-time type** (what the compiler knows about the variable) and the **runtime type** (what the object actually is in memory). 

Polymorphism allows you to treat a derived object as its base type. When you call a method, the system must decide whether to use the base implementation or the derived one. If you use `virtual` and `override`, the system uses **virtual dispatch** to find the most specific implementation. If you use the `new` modifier, you are explicitly opting out of polymorphism, creating a **hidden member** that ignores the runtime type.

# Supplied names explained

* `Runtime type`: The actual class of an object instance at execution time.
* `Compile-time type`: The type declared for a variable or expression, which determines which members the compiler allows you to access.
* `Virtual dispatch`: The process where the runtime selects the implementation of a method based on the object's actual runtime type, rather than the variable's compile-time type.
* `Override dispatch`: The specific mechanism used when a derived class provides a new implementation for a `virtual` or `abstract` base member.
* `Nonvirtual member lookup`: Member lookup and overload resolution use the compile-time type and expression context; the selected non-virtual member isn't replaced through virtual dispatch based on runtime type.
* `Member hiding`: Declaring a member in a derived type can hide a same-named base declaration during lookup through the derived type. The base member can still be reached through a base-typed expression or `base` access where permitted.
* `new modifier on a member`: A keyword used to explicitly declare that a member is intended to hide a base member, suppressing compiler warnings about accidental hiding.
* `new modifier on a nested type`: A keyword used when a nested class or struct shares a name with a member in the base class, explicitly hiding the base member.
* `Base member selection`: The logic used to identify which member from the inheritance chain is targeted by a call.
* `Polymorphic call`: A method invocation that resolves to different implementations depending on the runtime type of the target object.
* `Method overload resolution`: The process of selecting the best-matching method signature based on argument types at compile time.
* `Method override resolution`: The process of identifying the correct `override` implementation to execute during virtual dispatch.
* `Abstract dispatch`: The mechanism for invoking a method defined in an `abstract` class that must be implemented by a derived class.
* `Sealed override dispatch`: A `sealed override` prevents further derived classes from overriding that member. The runtime/JIT may devirtualize a call when it can prove the target, but the modifier itself doesn't guarantee a particular performance optimization.
* `Covariant return type`: A feature allowing an overriding method to return a more specific type than the method it overrides.
* `Fragile base class`: A design risk where changes to a base class unintentionally break derived classes due to tight coupling.
* `Substitutability`: The ability to use a derived type instance anywhere a base type instance is expected without altering the correctness of the program.
* `Liskov Substitution Principle`: A design guideline stating that objects of a superclass should be replaceable with objects of a subclass without affecting the application's correctness.
* `Composition over inheritance`: A design principle suggesting that you should favor building complex objects by combining simpler ones rather than creating deep inheritance hierarchies.
* `Protected virtual extension point`: A design pattern where a base class provides a `protected virtual` method to allow derived classes to customize internal behavior without exposing that logic to public callers.

# Cross-item comparison

* **Override vs. New**: `override` replaces an inherited virtual slot and participates in runtime dispatch. `new` introduces a hidden member; which declaration is selected depends on the compile-time type, and a hidden member may itself be virtual.
* **Virtual Dispatch vs. Nonvirtual Member Lookup**: The compiler selects an accessible member from the expression's compile-time type; for a virtual member, runtime dispatch then selects the most-derived override. A nonvirtual call doesn't perform that override dispatch.
* **Inheritance vs. Composition**: Inheritance creates a "is-a" relationship and couples types; composition creates a "has-a" relationship, which is generally more flexible and less prone to the "fragile base class" problem.

# Examples

```csharp
public class Base {
    public virtual void Show() => Console.WriteLine("Base");
}

public class Derived : Base {
    public new void Show() => Console.WriteLine("Derived (Hidden)");
}

// Usage
Base obj = new Derived();
obj.Show(); // Prints "Base" because 'new' hides the method, breaking polymorphism.
```

# Common mistakes

1. **Confusing `new` with `override`**: Using `new` when you intended to provide a polymorphic override. This leads to the base method being called when you expect the derived method.
2. **Ignoring the Fragile Base Class**: Adding `virtual` members to a base class without considering how it affects existing derived classes.
3. **Over-using Inheritance**: Creating deep hierarchies when simple composition would suffice, making the code harder to test and maintain.

# Knowledge checks with answers

1. **Question**: If a method is hidden using the `new` modifier, does it participate in virtual dispatch?
   **Answer**: A member declared with `new` doesn't override the base virtual slot. Calls through a base-typed expression still dispatch along the base slot; calls through a derived-typed expression can select the hidden member.

2. **Question**: Which type determines the outcome of a nonvirtual member lookup?
   **Answer**: The compile-time type of the variable.

3. **Question**: What is the primary design risk of deep inheritance hierarchies?
   **Answer**: The "Fragile base class" problem, where changes in the base class cause unexpected side effects in derived classes.

*Source: [Microsoft C# Inheritance Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)*
