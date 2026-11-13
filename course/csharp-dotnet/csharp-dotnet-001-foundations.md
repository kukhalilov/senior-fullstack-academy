<!-- Generated with gemini-3.5-flash-lite; automated review only; source and code verification pending. -->

## Simple explanation

C# is a modern, object-oriented programming language created by Microsoft. It runs on **.NET**, a developer platform that provides the tools, libraries, and runtime needed to execute C# code. 

Think of C# as a set of rules and grammar you use to write instructions. Think of .NET as the engine and workshop that actually runs those instructions and provides pre-built tools (like hammers and screwdrivers) so you do not have to build everything from scratch.

At its core, C# relies on a **type system**. A *type* is a classification that tells the computer what kind of data a variable holds—such as a whole number (`int`), text (`string`), or true/false (`bool`). C# is a **statically typed** language, meaning the type of every variable must be known at **compile-time** (when you build the code, before it runs). This catches many errors early, preventing your app from crashing unexpectedly due to basic data mistakes.

---

## How it works

### Compilation and Execution Pipeline
When you write C# code, it goes through a multi-step process before the computer executes it:
1. **Source Code (.cs):** You write human-readable code.
2. **Roslyn Compiler:** The C# compiler checks your code for syntax errors and compiles it into **IL (Intermediate Language)** and metadata. IL is a universal assembly language for .NET—it is not tied to Windows, Mac, or specific hardware yet.
3. **CLR (Common Language Runtime):** When you run the program, the CLR takes over as the execution engine. 
4. **JIT (Just-In-Time) Compiler:** The CLR uses a JIT compiler to translate the IL into native machine code (binary zeros and ones) specific to the user's CPU *just* before execution.

```
[C# Source Code (.cs)] 
        ↓ (Roslyn Compiler)
[Intermediate Language (IL) + Metadata] 
        ↓ (CLR / JIT Compiler at runtime)
[Native Machine Code (CPU instructions)]
```

### The Common Type System (CTS)
The CTS is a universal standard built into .NET that ensures all languages running on .NET (like C#, F#, and Visual Basic) share the same data types and rules for type declaration, usage, and management. 

Under the CTS, every type falls into one of two fundamental categories based on its logical memory behavior:
* **Value Types:** Derived from `System.ValueType`. They contain their data directly, and variables of these types each have their own copy of the data (unless passed by reference using keywords like `ref` or `in`). *Note on memory placement:* While conceptually value types often live on the stack (such as local variables and method parameters), value types embedded inside a reference type or captured in closures are allocated on the heap. Examples: `int`, `bool`, `double`, `struct`.
* **Reference Types:** Store a reference (a memory address or pointer) to the actual data, which always lives on the **managed heap**. When you copy a reference type, you copy the address, meaning two variables now point to the exact same object in memory. Examples: `string`, arrays, classes, interfaces.

---

## Examples

The following program demonstrates basic types, variable declarations, type inference, and value vs. reference type behavior.

```csharp
using System;

class Program
{
    static void Main()
    {
        // 1. Explicit Typing vs Implicit Typing (var)
        int explicitInt = 42;
        var inferredInt = 42; // Compiler determines this is an int based on the value

        // 2. Value Types vs Reference Types demonstration
        Point valuePoint = new Point { X = 10, Y = 20 };
        Point valuePointCopy = valuePoint; // Copies the data
        valuePointCopy.X = 99;

        Console.WriteLine($"valuePoint.X: {valuePoint.X}");         // Output: 10 (unaffected)
        Console.WriteLine($"valuePointCopy.X: {valuePointCopy.X}"); // Output: 99

        Person refPerson = new Person { Name = "Alice" };
        Person refPersonCopy = refPerson; // Copies the reference (address)
        refPersonCopy.Name = "Bob";

        Console.WriteLine($"refPerson.Name: {refPerson.Name}");         // Output: Bob (affected!)
        Console.WriteLine($"refPersonCopy.Name: {refPersonCopy.Name}"); // Output: Bob
    }
}

// Struct is a Value Type
public struct Point
{
    public int X;
    public int Y;
}

// Class is a Reference Type
public class Person
{
    public string Name;
}
```

---

## Tradeoffs and comparisons

### C# vs. Dynamic Languages (e.g., Python, JavaScript)
* **C# (Statically Typed):** Errors are caught at compile-time before your code runs. IDEs provide superior autocompletion (IntelliSense) because they always know the type of every object. However, it requires more upfront syntax and explicit type declarations.
* **Python/JavaScript (Dynamically Typed):** Faster to write initially because you don't declare types. However, type mismatches often only reveal themselves at runtime (when a user triggers the bug in production).

### Value Types (`struct`) vs. Reference Types (`class`)
* **Value Types (`struct`):** Ideal for small, lightweight data structures that behave like values (e.g., coordinates, vectors, complex numbers). Because they are copied on assignment and when passed by value, copying very large structs can incur severe performance overhead. Additionally, passing them to methods copies the entire structure unless `ref` or `in` modifiers are used.
* **Reference Types (`class`):** Allocated on the managed heap, requiring tracking and cleanup by the Garbage Collector. Ideal for complex objects with distinct identity and state. Copying them only copies a reference pointer, but excessive heap allocation can lead to performance overhead due to memory fragmentation and collection pauses.

---

## Interview questions and answers

1. **What is the difference between a value type and a reference type in C#?**
   * *Answer:* Value types store their actual data directly (with local instances typically living on the stack) and are copied on assignment. Reference types store a memory address pointing to data allocated on the managed heap, and copying a reference type copies the address, meaning multiple variables point to the same underlying object.

2. **What does the `var` keyword mean? Is C# dynamically typed when using `var`?**
   * *Answer:* No, `var` is **statically typed**. It instructs the compiler to use **type inference** to deduce the type of the variable from the right-hand side of the assignment at compile-time. Once compiled, the type is permanently locked.

3. **What is the role of the Common Language Runtime (CLR)?**
   * *Answer:* The CLR is the execution engine for .NET applications. It provides services such as memory management (Garbage Collection), exception handling, security enforcement, thread management, and JIT compilation of IL code into native machine code.

---

## Exercises and solutions

### Exercise 1: Basic Type Operations & Conversions
Write a C# program that declares an integer, explicitly casts it to a double, performs division, and parses a string representing a number into an integer safely using `int.TryParse`.

#### Solution:
```csharp
using System;

class Exercise1
{
    public static void Main()
    {
        int numerator = 7;
        int denominator = 2;

        // Explicit cast to double to avoid integer truncation division
        double result = (double)numerator / denominator;
        Console.WriteLine($"Result: {result}"); // Output: 3.5

        // Safe parsing
        string input = "12345";
        if (int.TryParse(input, out int parsedValue))
        {
            Console.WriteLine($"Successfully parsed: {parsedValue}");
        }
        else
        {
            Console.WriteLine("Failed to parse string.");
        }
    }
}
```

---

## Review questions

1. What tool compiles C# source code into Intermediate Language (IL)?
2. Where are reference types primarily allocated in memory?
3. True or False: Changing a property on a copied instance of a `struct` alters the original instance.
4. What is the primary benefit of static typing over dynamic typing?

---

## Sources and limitations

* *Limitations:* This lesson provides a conceptual foundation for C# and .NET type fundamentals. Advanced memory internals (such as pinning, boxing/unboxing performance penalties, and low-level stack/heap mechanics) require deeper platform-specific study.
* *Verification Note:* Official Microsoft .NET architecture guidelines serve as the conceptual basis for this material. External links are omitted due to lack of real-time web verification capability.
