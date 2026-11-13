<!-- Generated with gemini-3.1-flash-lite; automated review only; source and code verification pending. -->

This revised document corrects minor typos (e.g., "ENCARIULATION" to "ENCAPSULATION"), improves technical precision regarding C# language features, and clarifies the distinction between concepts.

---

## Simple explanation

Object-Oriented Programming (OOP) is a way of writing software by modeling real-world things as **objects**. An object is a container that holds two things:
1. **Data** (called *fields* or *properties*), which describe what the object is or has.
2. **Behavior** (called *methods*), which describe what the object can do.

Think of a real-world **Car**:
* **Data:** Color, brand, current speed, fuel level.
* **Behaviors:** `Accelerate()`, `Brake()`, `Refuel()`.

### The 4 Pillars of OOP

To design good software, OOP relies on four core concepts:

1. **Encapsulation (Hiding details):** Bundling data and the methods that operate on that data inside a single unit (a class), and restricting direct access to the object's internal state. You use access modifiers like `private` and `public`. Think of a car dashboard: you press the accelerator pedal (`public`), but you don't need to manually inject fuel into the engine cylinders (`private`).
2. **Inheritance (Reusing code):** Creating a new class based on an existing class. The new class (child/derived) automatically gets the data and behaviors of the old class (parent/base). For example, an `ElectricCar` can inherit from a general `Car` class.
3. **Polymorphism (Many forms):** The ability of different classes to respond to the same method call in their own unique way. If you tell both a `Car` and a `Bicycle` to `StartMoving()`, the car starts its engine, while the bicycle starts pedaling.
4. **Abstraction (Simplifying complexity):** Hiding complex internal logic behind a simple interface. A driver uses a steering wheel without needing to know how the hydraulic power steering fluid flows.

---

## How it works

In C# and .NET, OOP is implemented using types, primarily **Classes** and **Interfaces**. 

### Classes vs. Objects
* **Class:** A blueprint or template. It defines what data and methods *will* exist. It takes up no memory for actual data storage until instantiated.
* **Object (Instance):** The actual item built from the blueprint. It lives in memory (on the heap for reference types) and holds specific values.

### Access Modifiers
Control visibility and security:
* `public`: Accessible from anywhere.
* `private`: Accessible only within the same class.
* `protected`: Accessible within the class and any child classes.
* `internal`: Accessible anywhere within the same assembly (project/DLL).

### Interfaces vs. Abstract Classes
* **Abstract Class (`abstract`):** A partial blueprint. It can have code implementation, fields, and constructors. A child class can inherit from *only one* abstract class (single inheritance). Use it when classes share an *“is-a”* relationship (e.g., a `Dog` *is an* `Animal`).
* **Interface (`interface`):** A strict contract. It declares *what* members must exist, not *how* they work. A class can implement *multiple* interfaces. Use it when unrelated classes share a *“can-do”* capability (e.g., a `Car` and a `Printer` can both implement `ILoggable`).

---

## Examples

```csharp
using System;
using System.Collections.Generic;

namespace OopLesson
{
    // 1. ABSTRACTION: Abstract base class defining common structure
    public abstract class Vehicle
    {
        // ENCAPSULATION: Private field exposed via public property
        private string _brand;
        public string Brand 
        { 
            get => _brand; 
            protected set => _brand = string.IsNullOrWhiteSpace(value) ? "Unknown" : value; 
        }

        public int Speed { get; private set; }

        protected Vehicle(string brand)
        {
            Brand = brand;
            Speed = 0;
        }

        public abstract void StartEngine();

        public virtual void Accelerate(int increment)
        {
            Speed += increment;
            Console.WriteLine($"{Brand} accelerated to {Speed} km/h.");
        }
    }

    // 2. INHERITANCE: Car inherits from Vehicle
    public class Car : Vehicle
    {
        public Car(string brand) : base(brand) { }

        public override void StartEngine() => Console.WriteLine($"{Brand} engine starts.");

        // POLYMORPHISM: Overriding base behavior
        public override void Accelerate(int increment) => base.Accelerate(increment + 5);
    }

    class Program
    {
        static void Main()
        {
            List<Vehicle> vehicles = new List<Vehicle> { new Car("Toyota") };

            foreach (var vehicle in vehicles)
            {
                vehicle.StartEngine();
                vehicle.Accelerate(20);
            }
        }
    }
}
```

---

## Tradeoffs and comparisons

### OOP vs. Procedural Programming
* **Procedural:** Focuses on routines (functions) acting on data. Efficient for simple scripts.
* **OOP:** Focuses on bundling data and behavior. Excels at scaling large applications, though it can introduce boilerplate.

### Inheritance vs. Composition
* **Inheritance ("Is-a"):** `Dog` inherits from `Animal`. 
* **Composition ("Has-a"):** A `Car` *has an* `Engine` object.
* **Tradeoff:** Deep inheritance hierarchies create "fragile" code. Composition is generally preferred for flexibility and decoupling.

---

## Interview questions and answers

**Q1: Difference between Interface and Abstract Class?**
* **Answer:** Abstract classes allow shared implementation and state (fields); interfaces define contracts. A class can implement multiple interfaces but inherit only one abstract class.

**Q2: Method Overloading vs. Overriding?**
* **Answer:** *Overloading* is compile-time (same method name, different parameters). *Overriding* is runtime (redefining a virtual method in a derived class).

**Q3: Explain SOLID.**
* **Answer:** 
  * **S**ingle Responsibility: One reason to change.
  * **O**pen/Closed: Open for extension, closed for modification.
  * **L**iskov Substitution: Subtypes must be substitutable for base types.
  * **I**nterface Segregation: Don't force dependencies on unused methods.
  * **D**ependency Inversion: Depend on abstractions, not concretions.

---

## Exercises and solutions

### DSA Problem: The Plugin Register System
**Problem:** Create a `PluginManager` that executes `IPlugin` objects sorted by `Priority`.

```csharp
public interface IPlugin { int Priority { get; } void Execute(); }

public class PluginManager
{
    private readonly List<IPlugin> _plugins = new();
    public void Register(IPlugin p) => _plugins.Add(p);
    public void RunAll() => _plugins.OrderByDescending(p => p.Priority).ToList().ForEach(p => p.Execute());
}
```

---

## Review questions

1. Which modifier restricts access to the current class? (`private`)
2. Why is deep inheritance a "code smell"? (It creates tight coupling and the "Fragile Base Class" problem.)
3. What is the difference between compile-time and runtime polymorphism? (Overloading vs. Overriding.)
4. How does the Interface Segregation Principle help? (It prevents "fat" interfaces by breaking them into smaller, specific ones.)

---

## Sources and limitations

* *Notice:* Best practices evolve (e.g., C# 8+ default interface methods). This content reflects standard industry practices for C# 10+.
