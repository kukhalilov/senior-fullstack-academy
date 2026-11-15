<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Core concepts and how they fit together

*This is an automatically generated draft.*

# Learning objectives
* Understand the distinction between reference types (`class`) and value types (`struct`).
* Learn how to use `record` types for data-oriented programming.
* Master the lifecycle of an object, from `Instance constructor` to `Object initializer`.
* Recognize the role of `required member` and `Primary constructor` in ensuring valid state.
* Identify the purpose of modern C# features like `union declaration` and `closed class hierarchy`.

# Prerequisites
* Basic understanding of C# syntax and variable declaration.
* Familiarity with the concept of memory (stack vs. heap) and object identity.
* Understanding of basic access modifiers (`public`, `private`).

# Core concepts
In C#, a `type declaration` defines a blueprint for data. 
* **Classes** are reference types. They have identity; if you pass a class instance to a method, you are passing a reference to the same object in memory.
* **Structs** are value types. They are copied by value. When you pass a struct, the entire object is copied.
* **Records** are specialized types designed for data. They provide built-in `Synthesized record equality` and a concise syntax for creating copies using the `with expression`.

# Mechanisms and relationships
The lifecycle of an object is managed through constructors and initializers:
1. **Primary constructor**: A concise way to declare parameters directly on the type header. These parameters are often used to initialize fields or properties.
2. **Instance constructor**: The traditional method for setting up an object. You can use `this constructor initializer` to chain multiple constructors together.
3. **Object initializer**: A syntax (`new Type { Property = value }`) that allows you to set properties immediately after construction.
4. **Required member**: A feature that forces the caller to provide a value for a specific property during initialization, ensuring the object is never in an invalid state.

**Memory and Performance:**
* `Struct` types are efficient for small data, but copying large structs can be expensive.
* `ref struct declaration` is a special type of struct that cannot be stored on the heap, ensuring it stays on the stack for performance and safety.
* `readonly struct declaration` prevents accidental mutation, which is a common source of bugs in value types.

# Worked examples

### 1. Using a Record for Data
Records are ideal for DTOs (Data Transfer Objects).
```csharp
// Positional record: concise and immutable-friendly
public record Person(string Name, int Age);

var p1 = new Person("Alice", 30);
var p2 = p1 with { Age = 31 }; // Non-destructive mutation
```

### 2. Ensuring Valid State with Required Members
```csharp
public class User
{
    public required string Username { get; init; }
    public int Age { get; set; }
}

// var u = new User(); // Error: Username is required
var u = new User { Username = "Dev1" }; // Valid
```

# Misconceptions and edge cases
* **Misconception:** "Structs are always on the stack." **Fact:** Structs are stored wherever their container is. If a struct is a field in a class, it lives on the heap.
* **Misconception:** "Records are deeply immutable." **Fact:** Records provide shallow equality and shallow copying. If a record contains a reference to a mutable list, the list itself can still be changed.
* **Edge Case:** `readonly struct` defensive copies. If you call a non-readonly method on a `readonly struct`, the compiler may create a hidden copy to prevent mutation, which can hurt performance.

# Knowledge checks with answers

1. **Question:** What is the primary difference between a `class` and a `struct` regarding assignment?
   * **Answer:** A `class` is a reference type; assigning it copies the reference. A `struct` is a value type; assigning it copies the entire object.

2. **Question:** When should you use a `required member`?
   * **Answer:** When an object must have a specific property set to be considered valid, and you want to enforce this at compile-time during object initialization.

3. **Question:** What does the `with` expression do in a record?
   * **Answer:** It creates a shallow copy of the record with specific properties modified, leaving the original record unchanged.

4. **Question:** What is the purpose of a `closed class hierarchy`?
   * **Answer:** It limits direct derivation to the current assembly, allowing the compiler to perform exhaustive checks (like in `switch` expressions) because it knows all possible subtypes.

*Sources: [Microsoft Learn C# Classes](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes), [Microsoft Learn C# Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records), [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)*
