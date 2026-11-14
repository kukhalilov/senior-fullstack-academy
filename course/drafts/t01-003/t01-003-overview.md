<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Big-picture orientation and mental model

*This is an automatically generated draft.*

# C# Built-in Type Aliases and Characteristics

## Problem and purpose
In C#, every piece of data must have a defined type. While the underlying .NET system provides thousands of types, C# provides "built-in type aliases"—short, convenient keywords that represent these fundamental types. The purpose of these aliases is to make code readable and consistent. Without them, you would have to use long, complex names for basic data like numbers or text.

## Plain-language mental model
Think of C# built-in types as the "atoms" of your program. 
*   **Value types** are like physical containers: when you assign one to another, you copy the actual value inside.
*   **Reference types** are like labels on a map: when you assign one to another, you are just pointing to the same location (the object) in memory.

Choosing a type is like choosing a container for a move: you need to pick one that is large enough to hold your items (range), precise enough for your needs (precision), and appropriate for the task (domain meaning).

## How the parts fit together
C# keywords act as aliases for types defined in the .NET system. For example, the keyword `int` is simply a shorthand for `System.Int32`. 

The system is organized into:
1.  **Numeric types:** Used for calculations. These vary by how much memory they use and whether they can store negative numbers.
2.  **Other built-in types:** Used for logic (`bool`), text (`char`, `string`), or general-purpose references (`object`, `dynamic`).
3.  **Special forms:** `void` represents the absence of a value, often used to indicate a method does not return data.

## Concept map
*   **Keywords as Aliases:** C# keywords map directly to .NET system types.
*   **Value vs. Reference:** Value types hold data directly; reference types hold a pointer to data.
*   **Numeric Characteristics:** Types differ based on range (how big a number), precision (how many decimal places), and platform dependence (native-sized integers).
*   **Domain Selection:** Choosing the right type balances memory usage, accuracy, and compatibility with other APIs.

## End-to-end walkthrough
Imagine you are building a simple inventory tracker.

1.  **Define a quantity:** You use `int` (a signed integral type) because you need to count items.
2.  **Define a price:** You use `decimal` because it provides the high precision required for financial calculations, unlike `float` or `double` which are better for scientific measurements.
3.  **Define a name:** You use `string` to store the text name of the item.
4.  **Check availability:** You use `bool` to store `true` or `false` if the item is in stock.

When you pass these variables to a method, the compiler ensures that the "container" matches the data. If you try to put a large number into a small container (like `byte`), the compiler will warn you or prevent the action to avoid data loss.

## When to use it and tradeoffs
*   **Use built-in types** for all basic data. They are optimized by the compiler and are the standard way to communicate between different parts of your code.
*   **Tradeoffs:**
    *   **Range vs. Memory:** Using `long` allows for massive numbers but uses more memory than `int`.
    *   **Precision:** `decimal` is slower than `double` but is required for accuracy in money-related math.
    *   **Native-sized (`nint`/`nuint`):** Use these when you need an integer that matches the size of the processor's pointer (32-bit or 64-bit), which is useful for low-level memory operations.

**Common Mistake:** Using `double` for currency. Because `double` is a floating-point type, it can introduce tiny rounding errors. Always use `decimal` for money.

## What later lessons cover
*   **Numeric Literals:** How to write numbers (e.g., `100L`, `1.5f`) in your code.
*   **Conversion Rules:** How to safely move data from one type to another (e.g., converting an `int` to a `long`).
*   **Nullable Types:** How to represent the absence of a value (e.g., `int?`).
*   **Complex Types:** How to build your own structures using `struct` and `class`.

*Source: [Microsoft Learn C# built-in types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)*
