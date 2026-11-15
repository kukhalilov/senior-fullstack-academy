<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Big-picture orientation and mental model

*Draft: Automatically generated for educational purposes.*

# C# Value Types, Reference Types, and Equality

## Problem and purpose
In C#, you must decide how data is stored and how it behaves when passed around or compared. If you don't understand the difference between **Value Types** and **Reference Types**, you may accidentally create bugs where changing a variable in one place unexpectedly changes it everywhere else (aliasing), or you may suffer performance issues by copying large amounts of data unnecessarily. This lesson explains how to choose the right type and how to correctly compare them.

## Plain-language mental model
Think of a **Value Type** as a physical box containing a value (like a number). If you give someone a copy of that box, they have their own independent copy of the value. Changing their box does not affect yours.

Think of a **Reference Type** as a remote control for a device located elsewhere (on the "managed heap"). If you give someone a copy of your remote control, you both now point to the same device. If they use their remote to change the device's settings, your remote now points to a device with those new settings.

## How the parts fit together
The C# type system is divided into these two categories. 
* **Value Types** (e.g., `int`, `struct`, `bool`) hold the data directly. Assigning them copies the data.
* **Reference Types** (e.g., `class`, `string`, `array`) hold a pointer to the data. Assigning them copies the pointer, not the data itself.

**Equality** is a separate layer. You can ask: "Are these two variables pointing to the exact same object?" (Reference equality) or "Do these two variables contain the same data?" (Value equality).

## Concept map
*   **Storage & Copying**: Value types copy data; reference types copy pointers.
*   **Identity vs. Value**: Reference types have "identity" (the object itself). Value types are defined by their contents.
*   **Mutability**: If you share a reference, changing the object affects all holders. If you copy a value type, the original is safe.
*   **Equality**: `==` and `Equals` behave differently depending on whether the type is a class, struct, or record.

## End-to-end walkthrough
Consider a simple scenario:

```csharp
// Value Type Example
int a = 10;
int b = a; // b is a separate copy
b = 20;    // a remains 10

// Reference Type Example
var list1 = new List<int> { 1 };
var list2 = list1; // list2 points to the same list as list1
list2.Add(2);      // list1 now also contains { 1, 2 }
```

1.  **Value Type**: When we set `b = a`, the computer copies the number `10` into a new memory location. `a` and `b` are independent.
2.  **Reference Type**: When we set `list2 = list1`, we copy the *address* of the list. Both variables look at the same memory on the heap. Adding an item via `list2` modifies the shared object.

## When to use it and tradeoffs
*   **Use Value Types (structs)** for small, immutable data that represents a single value (like a coordinate `(x, y)` or a `DateTime`). They are efficient because they don't require heap allocation.
*   **Use Reference Types (classes)** for complex objects, entities with a unique identity (like a `User` or `Order`), or when you need to share state across different parts of your application.
*   **Tradeoff**: Large structs are expensive to copy. If a struct is too large, passing it as a parameter might be slower than passing a reference.

## What later lessons cover
*   **Nullable types**: How to handle "no value" for value types (t01-005).
*   **Member definitions**: How to build your own classes, structs, and records (t01-006).
*   **Generics**: How to write code that works with both types safely (t01-009).

***

*Source: [Microsoft Learn C# 15 language reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)*
