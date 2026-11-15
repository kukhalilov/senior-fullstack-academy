<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Reference: Signed integral type keywords

*This is an automatically generated draft.*

# Scope and version
This lesson covers the signed integral type keywords in C# 15, running on .NET 11 GA. The information provided is accurate as of the checked date: 2026-11-14. Source: [Microsoft Learn C# built-in types table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table).

# How this group fits the mental model
In C#, every piece of data must have a type. The language provides "built-in type aliases," which are keywords that act as shorthand for specific types in the .NET type system. 

Signed integral types are **value types**. A variable of one of these types contains its value; the language does not promise that a local occupies a particular physical memory location. They are "signed," which means they can represent both positive and negative whole numbers. Choosing the right type from this group is a balance between the range of numbers you need to store and the amount of memory you want to consume.

# Supplied names explained
The following keywords are aliases for signed integral types:

*   **`sbyte`**: An 8-bit signed integer. It is the smallest signed integral type, useful for saving memory when you know the value will always be between -128 and 127.
*   **`short`**: A 16-bit signed integer. It provides a larger range than `sbyte` (up to 32,767) while still being more memory-efficient than a standard integer.
*   **`int`**: A 32-bit signed integer. This is the default choice for most whole-number calculations in C#.
*   **`long`**: A 64-bit signed integer. Use this when you need to represent very large numbers that exceed the capacity of an `int`.

# Cross-item comparison
The primary difference between these types is their storage size and the range of values they can hold.

| Type | Size (bits) | Range |
| :--- | :--- | :--- |
| `sbyte` | 8 | -128 to 127 |
| `short` | 16 | -32,768 to 32,767 |
| `int` | 32 | -2,147,483,648 to 2,147,483,647 |
| `long` | 64 | -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807 |

Source: [Integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types)

# Examples
```csharp
// Unverified example
sbyte smallValue = 100;
short mediumValue = 30000;
int standardValue = 2000000000;
long largeValue = 9000000000000000000L;
```

# Common mistakes
*   **Overflow**: Assigning a value that is too large for the chosen type will cause an error or unexpected behavior. For example, trying to store 200 in an `sbyte` will result in a compilation error because 200 exceeds the maximum value of 127.
*   **Choosing `long` by default**: While `long` can hold any value an `int` can, it uses twice the memory. Use the smallest type that fits your data requirements to keep your application memory-efficient.

# Knowledge checks with answers

**1. Which signed integral type is the most appropriate default for general-purpose whole-number math?**
*   *Answer:* `int`. It is the standard 32-bit type used across the .NET ecosystem.

**2. If you need to store the number 40,000, why can't you use `short`?**
*   *Answer:* The maximum value for a `short` is 32,767. 40,000 exceeds this limit, so you would need to use an `int` instead.

**3. Are these types reference types or value types?**
*   *Answer:* They are value types; they store the actual numeric value in memory.
