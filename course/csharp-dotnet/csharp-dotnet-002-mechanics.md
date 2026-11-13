<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Object-Oriented Programming (OOP) is a way of writing software by modeling real-world concepts as **objects**. Think of an object as a self-contained unit that encapsulates both **data** (state, or what it knows) and **behavior** (methods, or what it can do). 

In C# and .NET, object-oriented design and its core mechanisms provide the architectural rules and language features you use to connect these objects together. This allows them to collaborate and produce **end-to-end behavior**—meaning a complete sequence of coordinated actions that achieves a specific goal, such as processing an online shopping order from cart checkout to payment and fulfillment.

To understand OOP mechanisms, you need to know four core pillars:
1. **Encapsulation**: Hiding the internal state and implementation details of an object, exposing only a controlled public interface (like using a television remote to change channels instead of rewiring the internal circuits).
2. **Inheritance**: Creating a new class based on an existing class to inherit and share code (e.g., a `Dog` class inherits common properties from an `Animal` base class).
3. **Polymorphism**: The ability of different objects to respond to the same method call or command through their own unique implementations (e.g., calling `MakeSound()` on both a `Cat` and a `Dog`, resulting in a meow or a bark respectively).
4. **Abstraction**: Hiding complex subsystems behind a simplified interface or abstract class so that consumers focus strictly on *what* an operation achieves rather than *how* it is executed.

---

## How it works

When building an application in C#, your high-level code compiles into managed types and executes as memory structures managed by the .NET runtime (CLR). Here is how the key mechanisms operate under the hood:

### Classes vs. Objects (Reference Types)
* A **class** is a blueprint or template definition. In C#, classes are **reference types**. When you instantiate an object from a class using the `new` keyword, the actual object instance data is allocated on the managed **heap**, and your local variable holds a **memory reference** pointing to that heap address.
* An **object** (or instance) is the concrete realization built from that blueprint. You can instantiate many distinct object instances from a single class definition, each holding its own unique state in memory.

### End-to-End Behavior via Collaboration
An enterprise application rarely relies on a single isolated object. Instead, end-to-end behavior is achieved through **collaboration**—objects invoking methods on other dependent objects. 
* **Dependency Injection (DI)**: In modern C#, objects generally do not instantiate their dependencies directly using `new`. Instead, they receive them via constructor injection, making the application modular, loosely coupled, and easily testable.
* **Control Flow**: Execution typically flows from an entry point (such as an API controller or background worker service), passes through business service components that enforce application logic, and interacts with data access layers (such as Entity Framework Core repositories) to persist state changes.

### Virtual Methods and Dispatch
When you use inheritance and polymorphism, C# utilizes a mechanism called **virtual method dispatch** (or runtime polymorphism). When a base class method is marked as `virtual` and overridden in a derived class using `override`, the .NET runtime inspects the *actual runtime type of the object instance*—rather than the compile-time type of the variable reference—to determine which version of the method to execute.

---

## Examples

Below is a complete, end-to-end C# example demonstrating encapsulation, abstraction, inheritance, polymorphism, and dependency injection within a notification processing system.

```csharp
using System;
using System.Collections.Generic;

namespace OopMechanismsDemo
{
    // 1. Abstraction: Define a common contract for all notification channels
    public interface INotificationSender
    {
        void Send(string recipient, string message);
    }

    // 2. Inheritance & Polymorphism: Concrete implementation for Email
    public class EmailSender : INotificationSender
    {
        public void Send(string recipient, string message)
        {
            // Encapsulated logic specific to email delivery
            Console.WriteLine($"[Email] To: {recipient} | Message: {message}");
        }
    }

    // 2. Inheritance & Polymorphism: Concrete implementation for SMS
    public class SmsSender : INotificationSender
    {
        public void Send(string recipient, string message)
        {
            // Encapsulated logic specific to SMS delivery
            Console.WriteLine($"[SMS] To: {recipient} | Message: {message}");
        }
    }

    // 3. Encapsulation & Collaboration: A service that orchestrates end-to-end behavior
    public class NotificationService
    {
        private readonly IEnumerable<INotificationSender> _senders;

        // Dependency Injection via constructor
        public NotificationService(IEnumerable<INotificationSender> senders)
        {
            _senders = senders ?? throw new ArgumentNullException(nameof(senders));
        }

        public void NotifyAllChannels(string recipient, string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                throw new ArgumentException("Message cannot be empty.", nameof(message));
            }

            // Polymorphic behavior: We iterate over senders polymorphically without knowing concrete types
            foreach (var sender in _senders)
            {
                sender.Send(recipient, message);
            }
        }
    }

    // Program entry point demonstrating execution
    public class Program
    {
        public static void Main(string[] args)
        {
            // Setup dependencies (in a real app, this is handled by a DI container)
            var senders = new List<INotificationSender>
            {
                new EmailSender(),
                new SmsSender()
            };

            // Instantiate the orchestrator with its dependencies
            var notificationService = new NotificationService(senders);

            // Trigger end-to-end behavior
            notificationService.NotifyAllChannels("alice@example.com", "System maintenance scheduled for midnight.");
        }
    }
}
```

---

## Tradeoffs and comparisons

Every OOP mechanism involves architectural tradeoffs between flexibility, maintainability, and complexity.

| Mechanism / Pattern | Advantages (Pros) | Disadvantages (Cons) | When to Use |
| :--- | :--- | :--- | :--- |
| **Inheritance (`class B : A`)** | Code reuse; establishes clear "is-a" structural hierarchies. | Tight coupling; fragile base class problem (modifying base classes can inadvertently break child implementations). | When objects share a strict hierarchical taxonomy (e.g., `Manager` is an `Employee`). In general, favor object composition over deep inheritance trees. |
| **Interfaces (`interface I1`)** | Loose coupling; supports multiple implementations and polymorphism; highly testable. | Requires writing more boilerplate code and delegating execution calls. | When unrelated classes need to expose a common behavioral contract or capability ("can-do"). |
| **Encapsulation** | Protects internal object state; prevents invalid data states; hides implementation refactoring. | Can require writing extra properties, validation checks, and wrapper methods. | Always. Object state should rarely be exposed publicly without access control. |

---

## Interview questions and answers

### 1. What is the difference between an Abstract Class and an Interface in C#?
* **Answer:** An abstract class can contain state (instance fields), constructor logic, and partially implemented methods (`virtual` methods with bodies), and a class can inherit from only *one* abstract class. An interface defines a structural contract containing method signatures, properties, events, or indexers (though modern C# supports default interface implementations), and a class can implement *multiple* interfaces. Use abstract classes to share implementation details among closely related types ("is-a"), and interfaces to define decoupled capabilities across unrelated classes ("can-do").

### 2. What is the "Fragile Base Class" problem, and how do you avoid it?
* **Answer:** The fragile base class problem occurs when a base class is modified in a way that unexpectedly breaks behavior in derived classes. Because derived classes often depend on the internal implementation details and protected members of their parent class, upstream changes can cause downstream runtime bugs. You avoid this problem by favoring **composition over inheritance**, marking classes or methods as `sealed` when extension is not intended, and programming strictly against interfaces.

### 3. Explain how runtime polymorphism works under the hood in .NET.
* **Answer:** When a class declares a `virtual` method that is overridden (`override`) in a derived class, the C# compiler and CLR use a mechanism called a Virtual Method Table (vtable). Every class type maintains a vtable containing pointers to the memory addresses of its virtual methods. When a method is invoked on an object reference, the runtime inspects the object's actual type in the vtable at execution time to dispatch the correct overridden method, rather than resolving it based solely on the compile-time variable type.

---

## Exercises and solutions

### Exercise 1: Refactoring Tight Coupling
**Problem Statement:**
You are given a monolithic class `OrderProcessor` that directly instantiates a concrete `SqlDatabase` and an `EmailNotifier`. Refactor this code using interfaces and constructor dependency injection so that `OrderProcessor` is decoupled from concrete implementations, making it unit-testable.

#### Starter Code (For reference structure):
```csharp
public class OrderProcessor 
{
    public void ProcessOrder(string orderId) 
    {
        // Tight coupling to concrete classes
        var db = new SqlDatabase();
        db.Save(orderId);
        
        var email = new EmailNotifier();
        email.Send("User", "Order processed");
    }
}
```

#### Solution:
```csharp
using System;

namespace OopExercise1
{
    // 1. Define contracts (Interfaces)
    public interface IDatabase
    {
        void Save(string orderId);
    }

    public interface INotifier
    {
        void Send(string recipient, string message);
    }

    // 2. Implement concrete classes
    public class SqlDatabase : IDatabase
    {
        public void Save(string orderId)
        {
            Console.WriteLine($"Order {orderId} saved to SQL Database.");
        }
    }

    public class EmailNotifier : INotifier
    {
        public void Send(string recipient, string message)
        {
            Console.WriteLine($"Email sent to {recipient}: {message}");
        }
    }

    // 3. Refactored OrderProcessor using Dependency Injection
    public class OrderProcessor
    {
        private readonly IDatabase _database;
        private readonly INotifier _notifier;

        public OrderProcessor(IDatabase database, INotifier notifier)
        {
            _database = database ?? throw new ArgumentNullException(nameof(database));
            _notifier = notifier ?? throw new ArgumentNullException(nameof(notifier));
        }

        public void ProcessOrder(string orderId)
        {
            if (string.IsNullOrWhiteSpace(orderId))
                throw new ArgumentException("Invalid order ID.", nameof(orderId));

            _database.Save(orderId);
            _notifier.Send("Customer", $"Your order {orderId} has been successfully processed.");
        }
    }

    public class Program
    {
        public static void Main()
        {
            // Injecting dependencies at runtime
            IDatabase db = new SqlDatabase();
            INotifier notifier = new EmailNotifier();
            
            var processor = new OrderProcessor(db, notifier);
            processor.ProcessOrder("ORD-98765");
        }
    }
}
```

---

## Review questions

1. What keyword is used in C# to prevent a class or a virtual method from being inherited or overridden further?
2. Explain why exposing public fields (e.g., `public int Age;`) violates the principle of encapsulation.
3. What is the fundamental difference between method overloading (compile-time polymorphism) and method overriding (runtime polymorphism)?
4. How does Dependency Injection help adhere to good object-oriented design and SOLID principles?

---

## Sources and limitations

* *Note:* This instructional material is derived from standard computer science software engineering principles, Microsoft C# language documentation standards, and general object-oriented design patterns (such as SOLID principles). 
* *Limitations:* External web links and third-party verification tools have not been accessed or integrated. Code examples are simplified for educational clarity and do not include production-grade enterprise logging, thread-safety locking, or complete container configuration frameworks unless explicitly demonstrated.
