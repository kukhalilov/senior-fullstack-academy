<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Core concepts and how they fit together

*This is an automatically generated draft.*

# C# Value Types, Reference Types, Copying, Identity, and Equality

## Learning objectives
* Distinguish between value types and reference types based on assignment and copying behavior.
* Understand the difference between object identity and value equality.
* Identify when to use structs versus classes based on design goals like mutability and identity.
* Recognize how equality contracts (==, Equals, GetHashCode) function across different type categories.

## Prerequisites
* Basic familiarity with C# variable declaration and assignment.
* Understanding that C# is a type-safe, managed language.

## Core concepts
The fundamental distinction in C# is how variables store data:

1.  **Value Types**: A variable of a value type contains the actual data. When you assign one value-type variable to another, the system performs a **Value copy**, creating an independent duplicate of the data.
2.  **Reference Types**: A variable of a reference type contains a reference (a memory address) to an object stored on the **Managed heap**. When you assign one reference-type variable to another, you copy the reference, not the object. Both variables now point to the same **Object identity**.

**Mental Model**: Think of a value type as a physical box containing an item; if you copy the box, you have two boxes with identical items. Think of a reference type as a piece of paper with an address written on it; if you copy the paper, you have two pieces of paper pointing to the same house.

## Mechanisms and relationships
The behavior of your code depends on these interactions:

*   **Aliasing**: Because reference types share the same object, changing a property through one variable affects all other variables pointing to that object. This is "aliasing."
*   **Mutability**: Mutating a value type only affects the local copy. However, if a struct contains a reference type (like a class instance), the struct's copy will still point to the same shared object as the original.
*   **Storage**: While developers often associate value types with the "stack" and reference types with the "heap," this is an implementation detail. The runtime may optimize storage based on context, such as **Escape analysis** or **Boxing**.
*   **Equality**:
    *   **Reference equality**: Checks if two variables point to the exact same memory location (`Object.ReferenceEquals`).
    *   **Value equality**: Checks if two objects contain the same data. This is often implemented via `IEquatable<T>` or overridden `Equals` methods.

## Worked examples

### Example 1: Copying Behavior
```csharp
// Value Type (struct)
int a = 10;
int b = a; // b is a copy of a
b = 20;    // a remains 10

// Reference Type (class)
List<int> list1 = new List<int> { 1 };
List<int> list2 = list1; // list2 points to the same object as list1
list2.Add(2);            // list1 now also contains { 1, 2 }
```

### Example 2: Equality
```csharp
string s1 = "hello";
string s2 = new string("hello");

bool refEq = object.ReferenceEquals(s1, s2); // False: different objects
bool valEq = s1 == s2;                       // True: string overrides == for value equality
```

## Misconceptions and edge cases
*   **"Value types always live on the stack"**: This is false. Value types can live on the heap if they are members of a class or captured in a closure.
*   **"Boxing is free"**: **Boxing conversion** (wrapping a value type in an object) involves a heap allocation and a performance cost.
*   **Mutable Structs**: Mutating a struct that is a field of a class is safe, but mutating a struct returned from a property or method can lead to bugs because you are mutating a temporary **Defensive copy**.

## Knowledge checks with answers

1.  **Question**: If you assign one `struct` variable to another, what happens?
    *   **Answer**: A **Value copy** occurs; the new variable gets a complete, independent copy of the data.

2.  **Question**: Why is it dangerous to have a mutable struct?
    *   **Answer**: Because structs are copied by value, it is easy to accidentally mutate a copy rather than the intended original, leading to confusing state changes.

3.  **Question**: What is the difference between `==` and `Object.ReferenceEquals`?
    *   **Answer**: `==` is an operator that can be overloaded to provide value equality (as in `string` or `record`), whereas `ReferenceEquals` strictly checks if two references point to the same memory address.

*Source: [Microsoft Learn C# Type Specification](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types), [Equality Comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)*
