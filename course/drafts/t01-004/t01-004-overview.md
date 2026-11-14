<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Big-picture orientation and mental model

*Automatically generated draft.*

## Problem and purpose

When writing C# code, developers constantly assign variables, pass data into methods, and check whether two variables refer to "the same thing." However, C# draws a strict foundational line between **value types** (where variables hold the actual data) and **reference types** (where variables hold pointers or handles to an object located elsewhere). 

The problem this topic solves is preventing silent bugs caused by accidental data sharing or incorrect equality checks. If you do not understand how copying, memory aliasing (where multiple variables point to the same underlying data), and equality work, you may accidentally mutate data you intended to keep safe, or write conditions that fail because they compare object addresses instead of data contents. This lesson establishes the mental model for how C# handles data storage, copying behavior, and equality contracts.

## Plain-language mental model

To understand value types and reference types, think of two everyday scenarios:

1. **A Value Type is like a physical photocopy of a recipe card.** If you hand a photocopy of a recipe to a friend, and they cross out an ingredient and write a new one on *their* paper, your original recipe card remains completely unchanged. You have two independent pieces of paper.
2. **A Reference Type is like a shared digital document link (or a house key).** If you send a cloud document link to five people, they are all opening and editing the exact same underlying file. If one person deletes a paragraph, everyone sees that paragraph disappear. Multiple variables point to a single shared entity.

Equality operates on a similar split: asking "Are these two things equal?" can mean "Are they the exact same piece of paper with identical text?" (value equality) or "Are they pointing to the exact same room/key?" (reference equality).

## How the parts fit together

The topic divides into three core pillars that work together:

* **Categorization and Copying:** How variables are declared (`struct` vs `class`), how assignment copies data (value copy vs reference copy), and how parameters are passed into methods.
* **Identity and Equality:** How C# determines if two items are equal using operators (`==`, `!=`), methods (`Equals`, `ReferenceEquals`), and lookup contracts (`GetHashCode`).
* **Design Tradeoffs:** Deciding when to use value semantics versus reference semantics based on size, mutability, performance, and domain modeling.

```
[ Type Categories ] --(Determines)--► [ Copying Behavior ]
        |                                     |
        v                                     v
[ Struct vs Class ]                     [ Value vs Reference Copy ]
        |                                     |
        +-----------------+-------------------+
                          |
                          v
               [ Equality & Identity ]
```

## Concept map

```
C# Value & Reference Types
 ├── Type Categories
 │    ├── Value Types (struct, enum, numeric primitives)
 │    └── Reference Types (class, interface, array, delegate, string)
 ├── Copying & Aliasing
 │    ├── Value Copy (independent copies)
 │    ├── Reference Copy (shared object aliasing)
 │    └── Boxing & Unboxing (bridging value and reference worlds)
 └── Equality & Identity
      ├── Reference Equality (same object instance in memory)
      └── Value Equality (equivalent data content)
```

## End-to-end walkthrough

Consider a small conceptual example demonstrating the difference between copying a value type and copying a reference type. *(Note: Code examples in this overview are unverified conceptual illustrations).*

```csharp
// 1. Value Type (struct)
public struct Point {
    public int X;
    public int Y;
}

// 2. Reference Type (class)
public class Person {
    public string Name;
}

// Usage scenario:
Point p1 = new Point { X = 10, Y = 20 };
Point p2 = p1; // Value copy: p2 gets its own independent copy of X and Y
p2.X = 99;
// Result: p1.X is still 10, because p1 and p2 are independent.

Person person1 = new Person { Name = "Alice" };
Person person2 = person1; // Reference copy: both variables point to the same Person object
person2.Name = "Bob";
// Result: person1.Name is now "Bob", because mutating the shared object affects all references.
```

When `p1` is assigned to `p2`, the bits representing the numbers are duplicated. When `person1` is assigned to `person2`, only the reference (the address pointing to the heap object) is duplicated, leading to shared state (aliasing).

## When to use it and tradeoffs

* **Value Types (`struct`, `record struct`):** 
  * *When to use:* Small, lightweight data structures that represent simple values (like coordinates, measurements, or small tuples) and should behave immutably.
  * *Tradeoffs:* Copying large structs can degrade performance because the entire structure is duplicated on assignment or method invocation. Mutable structs easily lead to subtle bugs where defensive copies prevent modifications from sticking.
* **Reference Types (`class`, `record class`, `string`):**
  * *When to use:* Complex entities that require distinct identity, inheritance hierarchies, or shared mutable state across an application.
  * *Tradeoffs:* Every allocation goes on the managed heap, increasing garbage collection pressure. Multiple parts of your code holding references to the same object can lead to unintended side effects if the object is mutable.

## What later lessons cover

Subsequent lessons and tracks build directly upon these foundational mechanics:
* Nullable value and reference type annotation design (`t01-005`).
* Comprehensive class, struct, record, and constructor member inventories (`t01-006`).
* Generic type variance and delegate variance (`t01-009` and `t01-010`).
* LINQ sequence operators (`t01-015`).
* Domain-driven value-object modeling within the architecture track.

***

*Source references:*
* [Microsoft Learn: Types specification](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)
* [Microsoft Learn: Value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)
* [Microsoft Learn: Reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types)
* [Microsoft Learn: Equality comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)
