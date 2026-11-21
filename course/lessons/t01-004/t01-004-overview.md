
# C# value types reference types copying identity and equality — Big-picture orientation and mental model

*Draft: Automatically generated for educational purposes.*

# C# Value Types, Reference Types, and Equality

## Problem and purpose
In C#, you must decide how data is stored and how it behaves when passed around or compared. If you don't understand the difference between **Value Types** and **Reference Types**, you may accidentally create bugs where changing a variable in one place unexpectedly changes it everywhere else (aliasing), or you may suffer performance issues by copying large amounts of data unnecessarily. This lesson explains how to choose the right type and how to correctly compare them.

## Plain-language mental model
Think of a **Value Type** variable as holding a value. Assignment copies that value, so changing the destination variable doesn't change the source variable. A struct's copied fields may themselves contain references to shared objects.

Think of a **Reference Type** variable as holding a reference to an object. If you copy that variable, both variables can refer to the same object; mutating the object through either reference is observable through the other. The language doesn't define the reference as a raw address.

## How the parts fit together
The C# type system is divided into these two categories. 
* **Value Types** (e.g., `int`, `struct`, `bool`) hold the data directly. Assigning them copies the data.
* **Reference Types** (e.g., `class`, `string`, `array`) hold an object reference. Assigning them copies the reference, not the object itself.

**Equality** is a separate layer. You can ask: "Are these two variables pointing to the exact same object?" (Reference equality) or "Do these two variables contain the same data?" (Value equality).

## Concept map
*   **Storage & Copying**: Value-type assignment copies the value; reference-type assignment copies the reference.
*   **Identity vs. Value**: Reference objects have identity, but reference types may define value equality; value types also use type-specific equality contracts.
*   **Mutability**: If multiple references designate one mutable object, changes through one can be observed through the others. A copied struct is a separate value, but may contain references to shared objects.
*   **Equality**: `==` and `Equals` are type-specific; class/struct/record alone doesn't determine every operator or method's behavior.

## End-to-end walkthrough
Consider a simple scenario:

```csharp
using System.Collections.Generic;

// Value Type Example
int a = 10;
int b = a; // b is a separate copy
b = 20;    // a remains 10

// Reference Type Example
var list1 = new List<int> { 1 };
var list2 = list1; // list2 points to the same list as list1
list2.Add(2);      // list1 now also contains { 1, 2 }
```

1.  **Value Type**: When we set `b = a`, `b` receives its own value under C# assignment semantics; physical storage is an implementation detail.
2.  **Reference Type**: When we set `list2 = list1`, we copy the reference. Both variables can refer to the same list, so adding through `list2` modifies the object observed through `list1`.

## When to use it and tradeoffs
*   **Consider Value Types (structs)** for small values with value semantics and limited copying. A value type doesn't inherently avoid heap allocation: it may be a field in an object, an array element, or boxed.
*   **Consider Reference Types (classes)** when reference semantics, inheritance, or shared state suit the model; identity-based equality is a design choice, not automatic for every class.
*   **Tradeoff**: Larger structs may incur copy costs in some contexts. Measure the workload; passing by reference changes API semantics and is not always faster.

## What later lessons cover
*   **Nullable types**: How to handle "no value" for value types (t01-005).
*   **Member definitions**: How to build your own classes, structs, and records (t01-006).
*   **Generics**: How to write code that works with both types safely (t01-009).

***

*Source: [Microsoft Learn C# 15 language reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)*
