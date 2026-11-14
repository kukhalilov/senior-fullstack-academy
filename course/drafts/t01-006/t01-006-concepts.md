<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# classes structs records constructors and initialization — Core concepts and how they fit together

*This lesson is an automatically generated draft.*

# C# Classes, Structs, Records, and Initialization

### Learning objectives
* Distinguish between reference types (classes) and value types (structs).
* Understand how records provide data-oriented features.
* Master the lifecycle of an object, from constructors to initialization.
* Learn when to use specific type declarations based on identity and performance needs.

### Prerequisites
* Basic familiarity with C# syntax and the concept of variables.
* Understanding that memory is managed by the runtime (the "heap" vs. the "stack").

### Core concepts
In C#, a **type declaration** defines a contract and a representation for your data.

1.  **Classes (Reference Types):** Objects that have a unique identity. When you pass a class instance, you are passing a reference (a pointer) to the same object in memory.
2.  **Structs (Value Types):** Objects that represent data directly. When you pass a struct, the entire value is copied.
3.  **Records:** A specialized syntax for data-centric types. They provide "value equality" (comparing the data inside rather than the memory address) and concise syntax for creating copies with modifications.
4.  **Constructors:** Special methods that ensure an object starts in a valid state.

### Mechanisms and relationships
Think of a **Class** as a "thing" with an identity (like a User), and a **Struct** as a "value" (like a Coordinate). 

*   **Identity vs. Value:** If you change a property on a class instance, everyone holding a reference to that instance sees the change. If you change a property on a struct, you are only changing your local copy.
*   **Records:** A `record class` acts like a class but with built-in equality logic. A `record struct` acts like a struct but with that same built-in equality.
*   **Initialization:** Before an object is ready, it must be initialized. C# uses **Constructors** to set initial values, and **Object Initializers** (e.g., `new User { Name = "Alice" }`) to set properties after the object is created. The `required` modifier forces the developer to provide a value for a property during initialization.

### Worked examples

#### 1. Class vs. Struct
```csharp
// Class: Reference type
public class Person { public string Name; }

// Struct: Value type
public struct Point { public int X; public int Y; }

// Usage
var p1 = new Person { Name = "Alice" };
var p2 = p1; 
p2.Name = "Bob"; // p1.Name is now "Bob" because they share the same reference.

var pt1 = new Point { X = 1, Y = 2 };
var pt2 = pt1;
pt2.X = 10; // pt1.X remains 1 because pt2 is a copy.
```

#### 2. Primary Constructors
Primary constructors allow you to define parameters directly on the type declaration:
```csharp
public class Book(string title, string author)
{
    public string Title { get; } = title;
    public string Author { get; } = author;
}
```

### Misconceptions and edge cases
*   **"Structs are always on the stack":** This is a common misconception. Structs are stored wherever their parent is stored. If a struct is a field inside a class, it lives on the heap.
*   **Shallow Immutability:** Records make it easy to create copies with the `with` expression, but they only perform a "shallow copy." If your record contains a list, the record copy and the original will both point to the same list in memory.
*   **Required Members:** If you mark a property as `required`, you must initialize it when creating the object, or the code will not compile.

### Knowledge checks with answers

1.  **Question:** If you want a type that represents a simple data point and is copied by value, should you use a `class` or a `struct`?
    *   **Answer:** A `struct`.

2.  **Question:** What is the primary difference between a `class` and a `record class`?
    *   **Answer:** `record class` provides built-in value-based equality (comparing the data) instead of reference-based equality (comparing memory addresses).

3.  **Question:** Why would you use the `required` modifier on a property?
    *   **Answer:** To ensure that the caller provides a value for that property when the object is initialized, preventing the object from existing in an incomplete or invalid state.

*Source: [Microsoft Learn C# Type Fundamentals](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/classes)*
