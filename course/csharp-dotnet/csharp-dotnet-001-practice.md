<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

C# is a strongly typed, modern, general-purpose programming language developed by Microsoft. It runs on the **.NET runtime**, which manages memory and executes your code safely. 

When we talk about **type fundamentals**, we mean how C# handles data types (the kinds of values you can store, such as numbers, text, or custom objects). 

C# uses a unified type system. This means that every type—even a simple number like `int`—ultimately inherits from a single root type called `object`. 

### Key concepts explained
*   **Type Safety:** C# prevents you from accidentally mixing up unrelated data types (for example, trying to treat a piece of text as a mathematical number). The compiler checks your types before the program runs.
*   **Value Types:** These variables store their data directly. Depending on where they are declared (such as local variables within a method vs. fields inside a class), they reside on the stack or inline within containing objects. Examples include `int`, `double`, `bool`, and custom `struct` types. When you copy a value type, you get a completely independent copy of the data.
*   **Reference Types:** These variables store a *reference* (a memory address) pointing to where the actual data lives on the managed heap. Examples include <code>string</code>, arrays, and custom <code>class</code> types. When you copy a reference type, both variables point to the exact same data instance.

---

## How it works

### 1. Value Types vs. Reference Types in Memory
*   **Stack:** A memory structure that operates on a Last-In, First-Out (LIFO) basis. It is extremely fast to allocate and clear. Local value types and method parameters live here.
*   **Heap:** A larger, shared pool of memory managed by the **Garbage Collector (GC)**. Reference type instances and value types boxed onto the heap live here.
*   *Nuance Note:* Value types are not *strictly* always on the stack. If a value type is declared as a field inside a `class`, its data lives inside that class instance on the heap.

### 2. Boxing and Unboxing
Because every type inherits from `object`, C# lets you convert a value type into a reference type. 
*   **Boxing:** Wrapping a value type inside an `object` container on the heap.
*   **Unboxing:** Explicitly casting and extracting the original value type back out of the `object` container.

*Tradeoff:* Boxing and unboxing introduce performance penalties because they cause memory allocations on the heap and require extra CPU instructions for type checks and copying. Modern C# code avoids them by using **Generics** (like `List<T>`).

---

## Examples

The following fully runnable C# console program demonstrates type fundamentals, value versus reference semantics, and generics.

```csharp
using System;

// 1. Defining a Value Type (struct)
public struct PointStruct
{
    public int X;
    public int Y;
}

// 2. Defining a Reference Type (class)
public class PointClass
{
    public int X;
    public int Y;
}

public class Program
{
    public static void Main()
    {
        Console.WriteLine("--- Value Type Demonstration ---");
        PointStruct p1 = new PointStruct { X = 10, Y = 20 };
        PointStruct p2 = p1; // Copy by value
        p2.X = 99;

        Console.WriteLine($"p1.X: {p1.X}"); // Output: 10 (Unchanged)
        Console.WriteLine($"p2.X: {p2.X}"); // Output: 99

        Console.WriteLine("\n--- Reference Type Demonstration ---");
        PointClass c1 = new PointClass { X = 10, Y = 20 };
        PointClass c2 = c1; // Copy by reference (points to same object)
        c2.X = 99;

        Console.WriteLine($"c1.X: {c1.X}"); // Output: 99 (Changed because c1 and c2 share the instance)
        Console.WriteLine($"c2.X: {c2.X}"); // Output: 99

        Console.WriteLine("\n--- Generics avoiding Boxing ---");
        // Using List<int> is type-safe and avoids boxing overhead
        System.Collections.Generic.List<int> numbers = new System.Collections.Generic.List<int>();
        numbers.Add(42); // No boxing occurs here
        int firstNum = numbers[0]; // No unboxing occurs here
        Console.WriteLine($"Retrieved number: {firstNum}");
    }
}
```

---

## Tradeoffs and comparisons

| Feature | Value Types (`struct`, `int`, `bool`) | Reference Types (`class`, `string`, arrays) |
| :--- | :--- | :--- |
| **Memory Location** | Stack (for local variables) or inline inside enclosing heap objects. | The managed heap. |
| **Assignment / Passing** | Copied completely value-by-value. | Copied by reference (the memory address is copied). |
| **Lifespan** | Destroyed immediately when the method scope ends (if local). | Managed and cleaned up asynchronously later by the Garbage Collector. |
| **Nullability** | Normally cannot be `null` (unless made nullable via `int?`). | Can always be `null` (uninitialized reference). |
| **Performance** | Faster for small data items; zero GC pressure. | Slower due to heap allocation and GC overhead. |

---

## Interview questions and answers

**Q1: What is the primary difference between a `struct` and a `class` in C#?**  
**Answer:** A `struct` is a value type where assignment copies its data directly. A `class` is a reference type where assignment copies the reference pointing to the object. Structs are ideal for small, lightweight data structures (like coordinates or measurements), whereas classes are used for complex objects that require reference semantics, inheritance, and identity behavior.

**Q2: What is boxing and why should you avoid it in performance-critical code?**  
**Answer:** Boxing is the process of converting a value type (like an `int`) into a reference type (`object`). This forces the runtime to allocate memory on the heap, copy the value over, and track it for garbage collection. Doing this inside a tight loop creates high memory overhead, puts pressure on the Garbage Collector, and slows down application execution.

**Q3: Can a `struct` inherit from another `struct` or `class`?**  
**Answer:** No. Structs cannot inherit from other structs or classes, nor can a class inherit from a struct (though structs can implement interfaces). All structs implicitly inherit from `System.ValueType`, which inherits from `System.Object`.

---

## Exercises and solutions

### Exercise 1: Reference Mutation Bug
**Problem:** You are given a method that processes user profiles. However, calling the method accidentally modifies the original object outside the method scope. Fix the code by converting the class to an immutable-style or value-bound approach, or by making a defensive copy.

**Initial Buggy Code:**
```csharp
public class UserProfile {
    public string Name { get; set; }
}

public class Test {
    public static void Main() {
        UserProfile user = new UserProfile { Name = "Alice" };
        ModifyUser(user);
        // We want this to print "Alice", but it prints "Hacker" because of reference sharing!
        System.Console.WriteLine(user.Name); 
    }

    public static void ModifyUser(UserProfile u) {
        u.Name = "Hacker";
    }
}
```

**Solution:**
To prevent unintended mutations of shared references, use a `readonly record struct` or return a new instance (immutability pattern), or duplicate the object before modification.

```csharp
// Using an immutable record struct (modern C# approach)
public readonly record struct UserProfile(string Name);

public class Test {
    public static void Main() {
        UserProfile user = new UserProfile("Alice");
        UserProfile modifiedUser = ModifyUser(user);
        
        System.Console.WriteLine(user.Name);         // Output: Alice
        System.Console.WriteLine(modifiedUser.Name); // Output: Hacker
    }

    public static UserProfile ModifyUser(UserProfile u) {
        // Returns a completely new value copy with the updated name
        return u with { Name = "Hacker" };
    }
}
```

---

## Review questions

1. If you assign one class variable to another, do you duplicate the underlying data object in memory? Explain why or why not.
2. What happens when you try to assign `null` to a standard integer variable like `int x = null;`? How do you fix it?
3. Explain what the Garbage Collector does when dealing with reference types on the heap.

---

## Sources and limitations

*   This content is based on core .NET type system specifications and C# language standards.
*   *Limitation:* Specific memory addresses and low-level runtime layout optimizations managed by the Common Language Runtime (CLR) are abstracted away and subject to change across different .NET versions (e.g., .NET 8 vs .NET 9). No external web links or unverified platform claims are included.
