<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Big-picture orientation and mental model

*This lesson is an automatically generated draft.*

# C# Classes, Structs, Records, and Initialization

### Problem and Purpose
In C#, you need to define the "shape" of your data and the logic that manages it. The core challenge is deciding how that data is stored in memory and how it behaves when passed around your program. Should it be a unique object that lives on the heap (a **class**), a lightweight value copied like an integer (a **struct**), or a data-focused container that handles equality for you (**record**)? Choosing the right type ensures your program is both performant and easy to reason about.

### Plain-language Mental Model
Think of these types as different ways to package information:
*   **Class:** A "blueprint" for an object. It has a unique identity. If you give a copy of a class to a friend, you are both looking at the same original object.
*   **Struct:** A "box" of values. It has no unique identity. If you give a copy of a struct to a friend, they get their own independent copy of the data inside.
*   **Record:** A "snapshot." It is designed to hold data. Two records are considered "equal" if their contents are the same, regardless of whether they are the same object in memory.

### How the Parts Fit Together
These types form a hierarchy of complexity. At the base, you have **classes** and **structs** for general-purpose design. **Records** are a specialized layer built on top of these to simplify data handling. **Constructors** act as the "gatekeepers," ensuring that whenever you create one of these types, it starts in a valid, predictable state.

### Concept Map
1.  **Type Declaration:** Defines the contract (what it is).
2.  **Memory Semantics:** Determines if it is a reference type (class) or value type (struct).
3.  **Initialization:** Uses constructors and initializers to set the starting state.
4.  **Data Orientation:** Records add synthesized equality and "with-copy" behavior.
5.  **Advanced Constraints:** Unions and closed hierarchies (C# 15) allow you to restrict how types are used or extended.

### End-to-End Walkthrough
Imagine you are building a system to track user profiles.

1.  **Define the type:** You use a `record` because you want to compare two users by their data (e.g., ID and Name).
    ```csharp
    public record User(int Id, string Name);
    ```
2.  **Initialize:** You create an instance. The **primary constructor** automatically assigns the values.
    ```csharp
    var user1 = new User(1, "Alice");
    ```
3.  **Modify:** You want to change the name but keep the ID. You use a `with` expression to create a new record based on the old one.
    ```csharp
    var user2 = user1 with { Name = "Bob" };
    ```
4.  **Compare:** Because it is a record, `user1 == user2` will return `false` (different names), but if you created `var user3 = new User(1, "Alice")`, then `user1 == user3` would be `true`.

### When to Use It and Tradeoffs
*   **Use Classes** when you need a complex object with a distinct identity that persists throughout your application.
*   **Use Structs** for small, frequently created data (like coordinates or colors) to reduce memory pressure, but be careful: copying large structs is expensive.
*   **Use Records** when your primary goal is to store and compare data.
*   **Tradeoff:** Classes are easier to share but harder to track for changes. Structs are safer because they are copied, but they can be accidentally copied too often, hurting performance.

### What Later Lessons Cover
*   **Inheritance and Interfaces (t01-007, t01-010):** How to build hierarchies and share behavior.
*   **Members (t01-008):** Deep dive into properties, methods, and fields.
*   **Generics (t01-009):** How to write types that work with any data type.
*   **Equality (t01-004):** The technical details of how `==` and `Equals` work under the hood.

*Source: [Microsoft Learn C# Fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes)*
