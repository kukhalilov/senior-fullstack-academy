<!-- Generated with gemini-3-flash-preview; automated review only; source and code verification pending. -->

## Simple explanation

Object-Oriented Programming (OOP) is a paradigm that organizes software design around **data**, or **objects**, rather than functions and logic. An object is a self-contained unit that combines data (attributes) and behavior (methods).

Think of a **blueprint** and a **house**:
*   A **Class** is the blueprint. It is a template that defines the structure and behavior, but it doesn't exist as a physical entity.
*   An **Object** is the actual house built from that blueprint. It is an **instance** of the class, occupying memory and having specific values (e.g., a specific address, a blue door, and three bedrooms).

In C# and .NET, OOP relies on four main pillars:
1.  **Encapsulation:** Bundling data and methods into a single unit (a class) and restricting access to the inner workings to prevent accidental interference. (Example: A TV remote hides the complex circuitry while exposing only the buttons you need).
2.  **Inheritance:** Allowing a new class to acquire the properties and behaviors of an existing class. This promotes code reuse. (Example: A `Truck` and a `Sedan` both inherit from a base `Vehicle` class).
3.  **Polymorphism:** The ability for different classes to be treated as instances of the same general class through a shared interface, while each maintains its unique behavior. (Example: A `Circle` and a `Square` both have a `Draw()` method, but they draw different shapes).
4.  **Abstraction:** Focusing on the essential qualities of an object rather than the specific implementation details. (Example: You know how to use a microwave's "Start" button without knowing how the magnetron generates microwaves).

---

## How it works

In C#, code is organized into **namespaces** (logical containers), **classes**, **interfaces**, and **structs**.

*   **Class:** A reference type (stored on the heap) that defines the blueprint for objects.
*   **Object:** A specific instance of a class created using the `new` keyword.
*   **Struct:** A value type (usually stored on the stack) used for small, simple data structures that behave like built-in types.
*   **Interface:** A contract that defines a set of methods and properties that a class *must* implement, facilitating loose coupling.
*   **Access Modifiers:** Keywords that define the "visibility" of members:
    *   `public`: Accessible from any code in the assembly or another assembly that references it.
    *   `private`: Accessible only within the same class or struct.
    *   `protected`: Accessible within the same class or in a derived class.
    *   `internal`: Accessible only within the same project (assembly).

### Example Architecture
Below is a C# console application demonstrating the four pillars in a banking context.

```csharp
using System;

namespace OopPracticeApp
{
    // 1. Abstraction: The interface defines "what" can be done, not "how".
    public interface IPaymentProcessor
    {
        void ProcessPayment(decimal amount);
    }

    // 2. Inheritance & Encapsulation: Base class providing shared logic
    public abstract class BankAccount : IPaymentProcessor
    {
        // Encapsulation: Private field (data hiding)
        private decimal _balance;

        // Encapsulation: Protected property (accessible to children)
        protected string AccountNumber { get; }

        protected BankAccount(string accountNumber, decimal initialBalance)
        {
            AccountNumber = accountNumber;
            // Logic inside constructor ensures valid state
            _balance = initialBalance >= 0 ? initialBalance : throw new ArgumentException("Initial balance cannot be negative.");
        }

        public decimal Balance => _balance;

        // Virtual method: Allows Polymorphism (can be overridden)
        public virtual void Deposit(decimal amount)
        {
            if (amount <= 0) throw new ArgumentException("Deposit must be positive.");
            _balance += amount;
            Console.WriteLine($"Deposited {amount:C}. New balance: {_balance:C}");
        }

        // Abstract method: Forces derived classes to provide specific implementation
        public abstract void ProcessPayment(decimal amount);

        // Helper for derived classes to modify balance safely
        protected void UpdateBalance(decimal amount) => _balance += amount;
    }

    // 3. Concrete Implementation
    public class SavingsAccount : BankAccount
    {
        private readonly decimal _interestRate;

        public SavingsAccount(string accountNumber, decimal initialBalance, decimal interestRate) 
            : base(accountNumber, initialBalance)
        {
            _interestRate = interestRate;
        }

        // Polymorphism: Specific implementation of the abstract method
        public override void ProcessPayment(decimal amount)
        {
            if (amount > Balance)
            {
                throw new InvalidOperationException("Insufficient funds.");
            }
            UpdateBalance(-amount);
            Console.WriteLine($"Paid {amount:C} from Savings {AccountNumber}.");
        }

        public void ApplyInterest()
        {
            decimal interest = Balance * _interestRate;
            Deposit(interest);
        }
    }

    class Program
    {
        static void Main()
        {
            // Polymorphism: Using the interface type to hold a SavingsAccount object
            IPaymentProcessor myAccount = new SavingsAccount("SA-99", 1000m, 0.05m);
            
            myAccount.ProcessPayment(200m);

            // Pattern matching to access specific SavingsAccount features
            if (myAccount is SavingsAccount savings)
            {
                savings.ApplyInterest();
            }
        }
    }
}
```

---

## Examples

### Data Structures & Algorithms (DSA) Practical Problem
**Problem:** *Design an Object-Oriented LRU (Least Recently Used) Cache.*
Implement a fixed-size cache that discards the least recently used items first. `Get` and `Put` must run in **$O(1)$** time.

#### Progressive Hints
1.  **Hint 1:** To achieve $O(1)$ access, you need a `Dictionary`. However, a dictionary doesn't track the *order* of use.
2.  **Hint 2:** To track order and move items to the "front" in $O(1)$ time, use a **Doubly Linked List**.
3.  **Hint 3:** The Dictionary should store the Key as the key, and the **LinkedListNode** as the value. This allows you to jump directly to a node in the list and move it without searching.

#### Working C# Solution
```csharp
using System.Collections.Generic;

public class LruCache<TKey, TValue> where TKey : notnull
{
    private readonly int _capacity;
    private readonly Dictionary<TKey, LinkedListNode<CacheItem>> _cacheMap;
    private readonly LinkedList<CacheItem> _lruList;

    private class CacheItem
    {
        public TKey Key { get; }
        public TValue Value { get; set; }
        public CacheItem(TKey key, TValue value) { Key = key; Value = value; }
    }

    public LruCache(int capacity)
    {
        _capacity = capacity > 0 ? capacity : throw new System.ArgumentException();
        _cacheMap = new Dictionary<TKey, LinkedListNode<CacheItem>>();
        _lruList = new LinkedList<CacheItem>();
    }

    public bool TryGet(TKey key, out TValue value)
    {
        if (_cacheMap.TryGetValue(key, out var node))
        {
            // Move to front (Most Recently Used)
            _lruList.Remove(node);
            _lruList.AddFirst(node);
            value = node.Value.Value;
            return true;
        }
        value = default!;
        return false;
    }

    public void Put(TKey key, TValue value)
    {
        if (_cacheMap.TryGetValue(key, out var node))
        {
            node.Value.Value = value;
            _lruList.Remove(node);
            _lruList.AddFirst(node);
        }
        else
        {
            if (_cacheMap.Count >= _capacity)
            {
                // Evict Least Recently Used (Tail)
                var last = _lruList.Last;
                if (last != null)
                {
                    _cacheMap.Remove(last.Value.Key);
                    _lruList.RemoveLast();
                }
            }
            var newNode = new LinkedListNode<CacheItem>(new CacheItem(key, value));
            _lruList.AddFirst(newNode);
            _cacheMap[key] = newNode;
        }
    }
}
```

#### Complexity Analysis
*   **Time Complexity:** $O(1)$ for both `Get` and `Put`. Dictionary lookups are $O(1)$ average, and `LinkedList.Remove(node)`/`AddFirst` are $O(1)$ when you have the node reference.
*   **Space Complexity:** $O(n)$ where $n$ is the capacity, as we store items in both a list and a map.

---

## Tradeoffs and comparisons

| Approach | Advantages | Disadvantages | Best Used For |
| :--- | :--- | :--- | :--- |
| **Inheritance** | High code reuse; establishes a clear "is-a" relationship. | Can lead to deep, rigid hierarchies; "Fragile Base Class" problem. | When objects share a fundamental identity (e.g., `Manager` is an `Employee`). |
| **Composition** | Flexible; "has-a" relationship; easier to change at runtime. | Can result in more boilerplate code (forwarding calls). | When objects are built from parts (e.g., `Car` has an `Engine`). |
| **Interfaces** | Allows multiple implementation; decouples "what" from "how". | Cannot store state (fields); requires implementation in every class. | Defining shared capabilities across unrelated classes. |

---

## Interview questions and answers

**Q1: What is the difference between an Abstract Class and an Interface?**
**Answer:** An **Abstract Class** can contain implementation code (methods with bodies) and state (fields/properties), but you cannot instantiate it. A class can only inherit from *one* abstract class. An **Interface** defines a contract. While C# 8+ allows default implementations in interfaces, they primarily cannot hold instance state (fields). A class can implement *multiple* interfaces.

**Q2: What is "Method Overriding" vs "Method Overloading"?**
**Answer:** **Overloading** (Compile-time polymorphism) is having multiple methods in the same class with the same name but different signatures (parameters). **Overriding** (Runtime polymorphism) is providing a new implementation for a `virtual` or `abstract` method inherited from a base class using the `override` keyword.

**Q3: Explain the Liskov Substitution Principle (LSP).**
**Answer:** LSP states that objects of a superclass should be replaceable with objects of its subclasses without altering the correctness of the program. A violation occurs if a subclass changes the expected behavior of the base class (e.g., a `ReadOnlyFile` subclass of `File` that throws an exception when the `Save()` method is called).

---

## Exercises and solutions

### Exercise 1: Shape Calculator
**Task:** Create a system to calculate the area of different shapes.
1. Define an interface `IShape` with a method `double GetArea()`.
2. Implement `Circle` (requires radius) and `Rectangle` (requires width/height).
3. Create a method that takes a `List<IShape>` and returns the sum of all areas.

#### Solution
```csharp
public interface IShape { double GetArea(); }

public class Circle : IShape 
{
    public double Radius { get; set; }
    public double GetArea() => Math.PI * Radius * Radius;
}

public class Rectangle : IShape 
{
    public double Width { get; set; }
    public double Height { get; set; }
    public double GetArea() => Width * Height;
}

public static class AreaCalculator 
{
    public static double TotalArea(IEnumerable<IShape> shapes) => shapes.Sum(s => s.GetArea());
}
```

---

## Review questions

1.  Which OOP pillar is primarily concerned with "hiding the internal state"?
2.  True or False: A C# class can inherit from multiple base classes.
3.  What is the purpose of the `virtual` keyword?
4.  How does a `struct` differ from a `class` regarding memory allocation?

---

## Sources and limitations

*   **Sources:** Microsoft .NET Documentation (C# Language Reference), SOLID Principles (Robert C. Martin), and Common Design Patterns (Gang of Four).
*   **Limitations:** This guide focuses on standard C# implementations. Performance nuances (like heap vs. stack allocation) can vary based on the specific .NET runtime version and JIT compiler optimizations. Advanced topics like "Default Interface Methods" or "Record types" are mentioned only briefly.
