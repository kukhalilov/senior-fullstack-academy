<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Big-picture orientation and mental model

*This lesson is an automatically generated draft.*

# Problem and purpose

In C#, you need ways to organize data and behavior. The primary challenge is balancing **identity** (knowing if two things are the same object) with **value** (knowing if two things contain the same data). 

Classes, structs, and records exist to solve this. They allow you to define custom types that represent your domain—like a `User`, a `Coordinate`, or a `Transaction`. By choosing the right type, you control how your data is stored in memory, how it is copied, and how it behaves when compared to other data.

# Plain-language mental model

Think of these types as different ways to package information:

*   **Classes** are like **blueprints for unique entities**. If you have two "Person" classes, they are distinct individuals even if they have the same name. They live on the "heap" (a large area of memory) and are managed by reference.
*   **Structs** are like **simple containers for values**. They are like numbers or coordinates. If you copy a struct, you get a completely independent duplicate. They are often stored directly where they are used, making them efficient for small data.
*   **Records** are like **snapshots of data**. They are designed to represent "what" something is, rather than "who" it is. If two records have the same data, C# considers them equal.

# How the parts fit together

The C# type system is built on a hierarchy of declarations and initialization rules:

1.  **Declaration**: You define the "shape" of your data using `class`, `struct`, or `record`.
2.  **Initialization**: You use **constructors** (the logic that runs when you create an object) and **initializers** (shortcuts to set values) to ensure the object starts in a valid state.
3.  **Refinement**: You use modifiers (like `readonly`, `sealed`, or `required`) to enforce rules, such as preventing a value from changing after it is set or ensuring a specific field is provided during creation.

# Concept map

*   **Type Categories**:
    *   **Reference Types** (`class`, `record class`): Managed by reference; identity matters.
    *   **Value Types** (`struct`, `record struct`): Copied by value; data content matters.
*   **Initialization**:
    *   **Primary Constructors**: A concise way to define parameters directly in the type declaration.
    *   **Object Initializers**: A syntax to set properties immediately after creation.
    *   **Required Members**: A contract ensuring specific properties are set before an object is considered "ready."
*   **Modern Data Handling**:
    *   **Records**: Synthesize equality and "with-copy" behavior automatically.
    *   **Unions and Closed Hierarchies**: (C# 15) Advanced ways to restrict what types can exist in a family, ensuring your logic covers all possibilities.

# End-to-end walkthrough

Imagine you are building a system to track points on a map.

1.  **Define the type**: You choose a `record struct` because a point is just a value (x, y).
    ```csharp
    public record struct Point(int X, int Y);
    ```
2.  **Create an instance**: You use the `new` expression.
    ```csharp
    var p1 = new Point(10, 20);
    ```
3.  **Modify safely**: Because it is a record, you can use a `with` expression to create a new point based on an old one without changing the original.
    ```csharp
    var p2 = p1 with { X = 15 }; // p2 is {15, 20}, p1 remains {10, 20}
    ```
4.  **Enforce rules**: If you needed a `User` class where a `Name` is mandatory, you would use `required`:
    ```csharp
    public class User {
        public required string Name { get; init; }
    }
    // var u = new User(); // This would cause a compiler error
    var u = new User { Name = "Alice" }; // This is valid
    ```

# When to use it and tradeoffs

*   **Use Classes** when you need identity (e.g., a `DatabaseConnection` or a `Customer` entity).
*   **Use Structs** for small, immutable data types (usually under 16 bytes) to reduce memory pressure. Avoid mutable structs, as they can lead to confusing bugs where you accidentally modify a copy instead of the original.
*   **Use Records** when you want value-based equality (e.g., Data Transfer Objects). They save you from writing boilerplate code like `Equals` or `GetHashCode`.
*   **Tradeoff**: Records and classes involve heap allocation, which is generally fine but can impact performance in high-frequency loops. Structs avoid this but are copied every time they are passed to a method, which is expensive if the struct is large.

# What later lessons cover

*   **Inheritance and Interfaces** (t01-007, t01-010): How to build complex hierarchies and shared behaviors.
*   **Member Details** (t01-008): Deep dives into properties, methods, and fields.
*   **Generics** (t01-009): How to write types that work with any data type.
*   **Equality** (t01-004): The technical details of how C# determines if two objects are "the same."

*Source: [Microsoft Learn C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes)*
