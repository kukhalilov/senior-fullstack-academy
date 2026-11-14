<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# value types reference types copying identity and equality — Exercises and worked solutions

# C# Value Types, Reference Types, Copying, Identity, and Equality

*Note: This is an automatically generated draft.*

## Goals
- Understand the distinction between **Value type** and **Reference type** variables, including how **Value copy** and **Reference copy** work during assignment.
- Learn how **Object identity**, **Value equality**, and **Reference equality** differ using operators like `==`, `Object.ReferenceEquals(Object?, Object?)`, and methods like `Object.Equals(Object?)` and `IEquatable<T>.Equals(T?)`.
- Recognize how **Aliasing**, **Mutable struct copy** hazards, and **Boxing conversion** affect program correctness and runtime behavior.
- Practice diagnosing equality contracts and copying behavior through hands-on exercises based on C# 15 and .NET 11 semantics.

---

## Worked example

To understand how variables store data and how they are copied, examine the following unverified code example demonstrating both a value type assignment and a reference type assignment.

```csharp
// Unverified code example
using System;

public struct PointStruct
{
    public int X;
    public int Y;
}

public class PointClass
{
    public int X;
    public int Y;
}

public class Program
{
    public static void Main()
    {
        // 1. Value type assignment: copies the actual value
        PointStruct p1 = new PointStruct { X = 10, Y = 20 };
        PointStruct p2 = p1; // Value copy occurs here
        p2.X = 99;

        Console.WriteLine($"p1.X: {p1.X}, p2.X: {p2.X}"); // Output: p1.X: 10, p2.X: 99

        // 2. Reference type assignment: copies the object reference (aliasing)
        PointClass c1 = new PointClass { X = 10, Y = 20 };
        PointClass c2 = c1; // Reference copy occurs here
        c2.X = 99;

        Console.WriteLine($"c1.X: {c1.X}, c2.X: {c2.X}"); // Output: c1.X: 99, c2.X: 99
    }
}
```

### Step-by-Step Behavior Walkthrough
1. **Value Type (`PointStruct`)**: `p1` contains its own data fields (`X = 10`, `Y = 20`). When assigned to `p2`, every field is duplicated. Mutating `p2.X` leaves `p1.X` completely untouched because they are independent variables holding separate values.
2. **Reference Type (`PointClass`)**: `c1` holds an **Object reference** pointing to an instance allocated on the **Managed heap**. When `c2 = c1` executes, a **Reference copy** occurs. Both variables now refer to the exact same object instance. Mutating `c2.X` modifies the shared instance, so `c1.X` also reflects `99`.

---

## Exercises

### Exercise 1: Identify the Output
Given the following snippet using `Record class` and `Struct type`, determine what gets printed to the console.

```csharp
// Unverified pseudocode
public record BoxRecord(int Size);
public struct BoxStruct
{
    public int Size;
}

public class Exercise1
{
    public static void Run()
    {
        BoxRecord r1 = new BoxRecord(10);
        BoxRecord r2 = r1 with { Size = 20 };

        BoxStruct s1 = new BoxStruct { Size = 10 };
        BoxStruct s2 = s1;
        s2.Size = 20;

        // Question: What are r1.Size, r2.Size, s1.Size, and s2.Size?
    }
}
```

### Exercise 2: Fix Equality and Reference Confusion
You are given a class representing a database entity where two distinct instances with the same ID should be treated as equal according to business logic, but currently default reference equality evaluates to false. Write an implementation or explain how `IEquatable<T>` or `Object.Equals(Object?)` should be structured.

---

## Progressive hints

- **Hint for Exercise 1**: 
  - Records use a **with expression** to perform a non-destructive mutation, returning a *new* instance while leaving the original intact. 
  - Structs are value types; assignment copies the values directly.
- **Hint for Exercise 2**: 
  - Classes rely on **Reference equality** by default unless you override `Object.Equals(Object?)` and `Object.GetHashCode()`, or implement `IEquatable<T>`.

---

## Complete solutions

### Solution to Exercise 1
- `r1.Size` is `10` (the `with` expression creates a shallow copy with modifications, leaving `r1` unmodified).
- `r2.Size` is `20`.
- `s1.Size` is `10` (assignment copied the struct, making `s2` independent).
- `s2.Size` is `20`.

### Solution to Exercise 2
To establish **Value equality** for a class type instead of default **Object identity comparison**, override `Equals` and `GetHashCode`:

```csharp
// Unverified code example
public class Account : IEquatable<Account>
{
    public int Id { get; set; }

    public bool Equals(Account? other)
    {
        if (other is null) return false;
        return this.Id == other.Id;
    }

    public override bool Equals(Object? obj) => Equals(obj as Account);

    public override int GetHashCode() => EqualityComparer<int>.Default.GetHashCode(Id);
}
```

---

## Tests and edge cases

1. **Null Comparison**: Comparing a nullable value type or reference type against `null` must be handled safely using pattern matching or null checks to avoid `NullReferenceException`.
2. **Boxing Allocation**: Assigning a value type (like an `int` or a `struct`) to an `object` variable or an interface type causes a **Boxing conversion** and **Boxing allocation** on the managed heap.
3. **Unboxing Cast Failure**: Attempting to unbox an object to the wrong value type throws an `InvalidCastException` (**Unboxing cast failure**).
4. **Mutable Hash Key Hazard**: Mutating an object after inserting it into a `HashSet` or as a key in a `Dictionary` changes its hash code, breaking lookups and causing memory/retrieval bugs (**Mutable hash key hazard**).

---

## Reflection questions

1. Why is relying on the physical **Stack allocation (implementation choice)** versus **Managed heap** an unreliable mental model for distinguishing value and reference types in C#?
2. When should you choose a `Struct type` versus a `Class type`, considering the performance implications of **Struct size and copy cost** versus **Aliasing risk**?
3. How does the contract between `Object.GetHashCode()` and `Object.Equals(Object?)` prevent subtle bugs when items are stored in hash-based collections?

---

*Sources referenced from Microsoft Learn C# 15 language reference and .NET 11 API reference:*
- [Types (C# Language Specification)](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/types)
- [Value Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)
- [Reference Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types)
- [Equality Comparisons](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/statements-expressions-operators/equality-comparisons)
- [Records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records)
- [Object.Equals](https://learn.microsoft.com/en-us/dotnet/api/system.object.equals)
- [Object.ReferenceEquals](https://learn.microsoft.com/en-us/dotnet/api/system.object.referenceequals)
- [IEquatable<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.iequatable-1)
- [EqualityComparer<T>](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.equalitycomparer-1)
- [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)
- [.NET 11 Overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/overview)
