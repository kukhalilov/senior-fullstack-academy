<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# inheritance polymorphism interfaces abstract classes and access modifiers — Reference: Runtime dispatch, member hiding, and compile-time versus runtime type

*Note: This is an automatically generated draft.*

## Scope and version

This reference lesson covers the C# 15 / .NET 11 General Availability (GA) language surface checked on 2026-11-14, specifically focusing on runtime dispatch, member hiding, and compile-time versus runtime types. 

Source snapshot and authority: [Microsoft C# language reference and version history](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance).

**Scope Inclusions:**
* The runtime behavior of object types, virtual/override dispatch, non-virtual member lookup, member hiding (`new` modifier), and polymorphic calls.
* Method resolution mechanics (overload versus override), abstract and sealed overrides, and covariant return types.
* Architectural constraints and principles including substitutability, the Liskov Substitution Principle, fragile base classes, protected virtual extension points, and composition versus inheritance.

**Scope Exclusions:**
* Records, structs, constructors, object equality, and union declaration syntax (covered in separate C# type-shape topics).
* Generic variance rules (covered in t01-010).
* Generics and constraint grammar (covered in t01-009).
* Pattern matching syntax (covered in t01-012).
* The C# 15 memory-safety language preview.

Sources:
* [Microsoft Inheritance Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/object-oriented/inheritance)
* [Microsoft Virtual Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/virtual)
* [Microsoft Override Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/override)
* [Microsoft New Modifier](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/new-modifier)
* [Microsoft Accessibility Levels](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/accessibility-levels)
* [Microsoft Interface Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/interface)
* [Microsoft Abstract Keyword](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/abstract)
* [Microsoft What's new in C# 8](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-8)
* [Microsoft What's new in C# 11](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-11)
* [Microsoft What's new in C# 15](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)

---

## How this group fits the mental model

When writing object-oriented code in C#, variables and expressions possess a **compile-time type** (known to the compiler during analysis), whereas instantiated objects in memory possess a **runtime type** (known when the program executes). 

* **Compile-time safety and binding:** The compiler uses the compile-time type to decide which members can legally be accessed and which method signatures match an overload.
* **Runtime flexibility (Polymorphism):** When a member is marked virtual in a base class and overridden in a derived class, C# performs **virtual dispatch** (or **override dispatch**), meaning the runtime engine inspects the actual object in memory (**runtime type**) to invoke the most specialized override.
* **Separation from Hiding:** Conversely, if a member is hidden rather than overridden, the compile-time type entirely dictates which member is selected, ignoring the runtime object shape.

Understanding this boundary prevents bugs where variable declarations dictate unexpected method calls or where hidden members break expected subclass substitutability.

---

## Supplied names explained

* **Compile-time type:** The static type of a variable, parameter, or expression known at compile time. It governs which members are accessible for binding.
* **Runtime type:** The actual class instantiated in memory when a program executes. It determines which implementation is executed during virtual or override dispatch.
* **Virtual dispatch:** The mechanism by which the runtime resolves a method call on a virtual member by inspecting the runtime type of the object rather than its compile-time type.
* **Override dispatch:** The specific execution path taken when a derived class member marked with `override` is invoked via a base class reference.
* **Nonvirtual member lookup:** The process by which the compiler resolves a standard, non-virtual member call strictly using the variable's compile-time type.
* **Member hiding:** Declaring a member in a derived class that shares a name with a base class member without overriding it, effectively shadowing the base member within derived scopes.
* **new modifier on a member:** An explicit keyword placed on a derived class member declaration to signal intent that the member intentionally hides a base class member, suppressing compiler warnings about accidental hiding.
* **new modifier on a nested type:** An explicit keyword used when a nested class or struct shares its name with a type nested inside a base class, hiding the inherited nested type.
* **Base member selection:** The rule-driven process used by the language compiler to choose which ancestor member is referenced when ambiguity or explicit qualification (`base.Member`) is applied.
* **Polymorphic call:** A method invocation on an interface or base class reference that dynamically dispatches to whichever overriding implementation matches the concrete runtime type.
* **Method overload resolution:** The compile-time algorithm that examines method parameter types, counts, and arguments to choose the exact signature to invoke.
* **Method override resolution:** The combination of compile-time signature matching and runtime type inspection that routes a virtual call to a matching `override` method.
* **Abstract dispatch:** The routing of method calls on an abstract base class reference to concrete implementations provided by non-abstract derived classes.
* **Sealed override dispatch:** Dispatch targeting an override member that has been explicitly marked `sealed`, preventing any further derived classes from overriding it further and optimizing dispatch resolution.
* **Covariant return type:** A language capability allowing an overriding method in a derived class to return a more specialized (derived) type than the base method's return type.
* **Fragile base class:** An architectural vulnerability where modifications to a base class unintentionally break behavior, state invariants, or compilation in derived classes.
* **Substitutability:** The design property where an instance of a derived type can be safely used anywhere an instance of its base type or interface is expected.
* **Liskov Substitution Principle:** An object-oriented design principle stating that software entities must be able to use objects of derived types without knowing it, ensuring base contracts are preserved.
* **Composition over inheritance:** A design guideline favoring building complex types by combining smaller component objects rather than creating deep inheritance hierarchies.
* **Protected virtual extension point:** A design pattern where a class exposes a `protected virtual` method to allow derived classes to hook into or customize internal algorithms safely without exposing those internals publicly.

---

## Cross-item comparison

* **Override member vs. Hidden member with new:** An *override member* replaces base behavior dynamically through virtual dispatch, allowing runtime polymorphism. A *hidden member with new* keeps the base member intact and statically shadows it based solely on the compile-time type.
* **Virtual dispatch vs. Nonvirtual member lookup:** *Virtual dispatch* evaluates the runtime type of an object to pick the correct implementation. *Nonvirtual member lookup* uses the compile-time type statically, ignoring any runtime specialization.
* **Inheritance vs. Composition:** *Inheritance* creates a rigid "is-a" relationship coupling derived code to base implementations. *Composition* builds "has-a" relationships, providing loose coupling and higher flexibility.
* **Method overload resolution vs. Method override resolution:** *Overload resolution* occurs entirely at compile time based on parameter types and counts. *Override resolution* uses both compile-time signature matching and runtime type inspection to execute dynamic overrides.

---

## Examples

*Note: The following code examples are unverified and presented as pseudocode illustrative of C# syntax rules.*

### Example 1: Virtual Dispatch vs. Non-Virtual Hiding (Unverified)

```csharp
class BaseClass
{
    public virtual void Show() => Console.WriteLine("Base virtual");
    public void Display() => Console.WriteLine("Base nonvirtual");
}

class DerivedClass : BaseClass
{
    // Override participates in virtual dispatch
    public override void Show() => Console.WriteLine("Derived override");

    // New hides the nonvirtual member
    public new void Display() => Console.WriteLine("Derived hidden");
}

// Usage:
BaseClass obj = new DerivedClass();
obj.Show();    // Outputs: "Derived override" (Virtual dispatch uses runtime type)
obj.Display(); // Outputs: "Base nonvirtual" (Nonvirtual lookup uses compile-time type)
```

### Example 2: Covariant Return Types (Unverified)

```csharp
class Animal { }
class Dog : Animal { }

class Kennel
{
    public virtual Animal Adopt() => new Animal();
}

class SpecializedKennel : Kennel
{
    // Covariant return type: returns Dog instead of Animal
    public override Dog Adopt() => new Dog();
}
```

---

## Common mistakes

* **Forgetting `override` and using `new` accidentally:** Omitting the `override` keyword when intending to specialize a virtual method triggers a compiler warning and results in member hiding instead of virtual dispatch.
* **Violating the Liskov Substitution Principle:** Overriding a base method to throw a `NotImplementedException` or drastically altering expected preconditions breaks substitutability and causes unexpected runtime failures.
* **Creating Fragile Base Classes:** Exposing internal implementation details or concrete protected fields to derived classes makes the base class difficult to refactor safely without breaking downstream code.
* **Confusing Overloading with Overriding:** Expecting `override` behavior from a method that merely has the same name but different parameter signatures (which is an overload, not an override).

---

## Knowledge checks with answers

1. **Question:** What determines which implementation is executed when a virtual method is called on a variable of a base type containing a derived instance?
   * **Answer:** The **runtime type** of the object in memory, evaluated via **virtual dispatch** / **override dispatch**.

2. **Question:** Does the `new` modifier on a member create a polymorphic override?
   * **Answer:** No. The `new` modifier performs **member hiding**, meaning the member is selected statically based on the **compile-time type** rather than dispatching dynamically.

3. **Question:** What design principle requires that derived types must be completely usable wherever their base types are expected without violating correctness?
   * **Answer:** The **Liskov Substitution Principle** (supporting **substitutability**).

4. **Question:** What is the term for a base class whose internal implementation details are tightly coupled to derived classes, making future updates risky?
   * **Answer:** A **fragile base class**.
