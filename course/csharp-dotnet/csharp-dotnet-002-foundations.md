<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

Object-Oriented Programming (OOP) is a way of writing computer code by grouping related data (attributes) and actions (methods) into **objects**. 

Think of a real-world object, like a smartphone:
* **Data (State):** Color, battery percentage, brand, storage capacity.
* **Actions (Behavior):** Make a call, take a photo, charge battery.

In C#, you do not build the smartphone directly in code. Instead, you write a **blueprint** called a **Class**. An **Object** is a physical instance built from that blueprint. 

### Why do we use OOP?
Before OOP, programs were long lists of instructions that passed raw data around. As software grew larger, this became chaotic and hard to change. OOP introduces **Modularity** (breaking code into small, independent pieces) and **Encapsulation** (hiding internal details so parts of your program do not break each other).

### Prerequisites
To understand this lesson, you should know:
* Basic C# syntax (variables, loops, `if` statements).
* How to write and call a basic method (function).

---

## How it works

To write Object-Oriented code in C#, you use four core concepts (often called the four pillars of OOP):

1. **Encapsulation:** Keeping data safe inside an object. You control who can read or change the data using access modifiers like `public` (everyone can see) and `private` (only this class can see).
2. **Inheritance:** Creating a new class based on an existing class to share code. The new class (**derived class**) gets all features of the old class (**base class**) and can add or modify its own.
3. **Polymorphism:** Meaning "many forms." It allows different classes to share the same method name, but each class performs the action in its own way.
4. **Abstraction:** Hiding complex inner workings and showing only the essential features. (e.g., You press the "Start Engine" button in a car; you do not need to know how the fuel injectors work).

### Mental Model
Imagine an assembly line in a car factory. 
* The **Class** is the engineering blueprint for a sedan.
* The **Object** is the actual blue sedan rolling off the factory floor.
* **Encapsulation** is the locked hood of the car—you can drive it using the pedals, but you cannot randomly touch the pistons inside while it runs.
* **Inheritance** means an "Electric Car" inherits all the features of a "Car" and adds a "Battery Pack."

---

## Examples

Below is a complete, runnable C# example demonstrating Classes, Objects, Encapsulation, and Inheritance.

```csharp
using System;

namespace OopFoundations
{
    // Base class (Parent)
    public class Animal
    {
        // Encapsulated field with a public property
        private string name;

        public string Name
        {
            get { return name; }
            set 
            { 
                if (!string.IsNullOrWhiteSpace(value))
                    name = value; 
            }
        }

        // Constructor
        public Animal(string name)
        {
            Name = name;
        }

        // Virtual method allows derived classes to override it (Polymorphism)
        public virtual void MakeSound()
        {
            Console.WriteLine($"{Name} makes a generic animal sound.");
        }
    }

    // Derived class (Child) inherits from Animal
    public class Dog : Animal
    {
        public Dog(string name) : base(name)
        {
        }

        // Overriding the base class method
        public override void MakeSound()
        {
            Console.WriteLine($"{Name} barks: Woof! Woof!");
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            // Creating objects (Instantiation)
            Animal genericAnimal = new Animal("Creature");
            genericAnimal.MakeSound(); // Output: Creature makes a generic animal sound.

            Dog myDog = new Dog("Buddy");
            myDog.MakeSound(); // Output: Buddy barks: Woof! Woof!
            
            // Demonstrating polymorphism: Treating a Dog as an Animal
            Animal polymorphicDog = new Dog("Max");
            polymorphicDog.MakeSound(); // Output: Max barks: Woof! Woof!
        }
    }
}
```

---

## Tradeoffs and comparisons

### OOP vs. Procedural Programming
* **Procedural Programming** (like classic C): Focuses on step-by-step procedures and functions operating on data structures.
    * *Pros:* Simple for small scripts, fast, low memory overhead.
    * *Cons:* Hard to scale; changing a data structure often breaks functions spread across the entire codebase.
* **Object-Oriented Programming** (like C#): Focuses on bundling data and behavior together.
    * *Pros:* Highly maintainable, easier to reason about in large teams, great for modeling real-world business logic.
    * *Cons:* Can lead to over-engineering (writing too many small classes), steeper learning curve, slight performance overhead due to object allocation on the heap.

---

## Interview questions and answers

1. **What is the difference between a Class and an Object?**
   * **Answer:** A class is a blueprint or template (e.g., a house plan), while an object is an instance of that class built in computer memory (e.g., the actual constructed house). You can create many objects from a single class.

2. **What are access modifiers, and why do we use `private`?**
   * **Answer:** Access modifiers control the visibility of classes, methods, and variables. We use `private` to enforce **encapsulation**. By hiding internal data, we prevent outside code from modifying an object's state in invalid or unsafe ways, ensuring our program remains predictable.

3. **Explain Polymorphism in simple terms.**
   * **Answer:** Polymorphism allows different types of objects to respond to the exact same method call in their own unique way. For example, both a `Cat` and a `Dog` class might have a `Speak()` method, but `Cat` outputs "Meow" and `Dog` outputs "Woof".

---

## Exercises and solutions

### Problem 1: Bank Account Encapsulation
Create a C# class named `BankAccount`. It should have a private field for `balance`. Provide a constructor to set an initial balance, and two methods: `Deposit(decimal amount)` and `Withdraw(decimal amount)`. Ensure the balance can never drop below zero, and negative deposit/withdrawal amounts are ignored.

#### Solution
```csharp
public class BankAccount
{
    private decimal balance;

    public BankAccount(decimal initialBalance)
    {
        if (initialBalance >= 0)
        {
            balance = initialBalance;
        }
        else
        {
            balance = 0;
        }
    }

    public void Deposit(decimal amount)
    {
        if (amount > 0)
        {
            balance += amount;
        }
    }

    public void Withdraw(decimal amount)
    {
        if (amount > 0 && amount <= balance)
        {
            balance -= amount;
        }
    }

    public decimal GetBalance()
    {
        return balance;
    }
}
```

---

## Review questions

1. Which keyword is used in C# to allow a derived class to override a method in its base class?
2. True or False: A `private` variable inside a class can be accessed directly by any child class using inheritance.
3. What is the primary benefit of Encapsulation?

*Answers:*
1. `virtual` (in the base class) and `override` (in the derived class).
2. False. `private` members are hidden even from derived classes; use `protected` if child classes need direct access.
3. Protecting internal data integrity and hiding implementation complexity from external code.

---

## Sources and limitations

*Note: This lesson is based on foundational computer science principles and standard Microsoft C# documentation guidelines. No external internet links are claimed or verified due to the offline nature of this evaluation. Readers should verify modern C# language updates via official Microsoft documentation.*
