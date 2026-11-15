<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Core concepts and how they fit together

*Draft: Automatically generated.*

# C# Built-in Type Aliases and Characteristics

## Learning objectives
* Understand that C# keywords are aliases for underlying .NET types.
* Distinguish between value types and reference types.
* Identify the appropriate use cases for numeric, Boolean, character, and object-based types.
* Recognize the role of native-sized integers and the `dynamic` type.

## Prerequisites
* Basic familiarity with programming concepts like variables and data storage.
* Understanding that computer memory stores data as bits and bytes.

## Core concepts
In C#, every piece of data you use is an instance of a type. C# provides **built-in type aliases**—keywords like `int` or `bool`—that act as shorthand for specific types defined in the .NET type system.

### Mental Model: The Container vs. The Label
* **Value Types:** Think of these as a box that holds the actual data (e.g., the number `5`). When you copy a value type, you copy the data itself.
* **Reference Types:** Think of these as a label or a pointer. The variable doesn't hold the data; it holds the address of where the data lives in memory.

### The Type Map
1. **Integral Types:** Represent whole numbers. These are divided into signed (can be negative) and unsigned (only zero or positive).
2. **Floating-Point Types:** Represent numbers with fractional parts.
3. **Other Types:** Include logical values (`bool`), text (`char`, `string`), and special types like `object`, `dynamic`, and `void`.

## Mechanisms and relationships
The C# compiler maps keywords to the .NET runtime types. For example, the keyword `int` is an alias for `System.Int32`. 

### Key Distinctions
* **Range and Precision:** Numeric types differ in how much memory they consume and the range of values they can represent. For instance, `long` holds a larger range than `int`.
* **Native-sized Integers (`nint`, `nuint`):** Introduced in C# 9, these types change their size (32-bit or 64-bit) based on the underlying processor architecture, making them ideal for memory addresses or interop scenarios.
* **`object` vs. `dynamic`:** `object` is the base type for all types in .NET. `dynamic` tells the compiler to bypass compile-time type checking, deferring resolution until the code actually runs.

## Worked examples

### Example 1: Choosing a Numeric Type
If you are counting items in a list, `int` is usually sufficient. If you are dealing with financial data, `decimal` is preferred because it provides higher precision and avoids rounding errors common with `float` or `double`.

```csharp
// Unverified example
int itemCount = 10;
decimal price = 19.99m; 
```

### Example 2: Reference vs. Value
```csharp
// Unverified example
int a = 10; // Value type: 'a' holds 10
string name = "C#"; // Reference type: 'name' holds a reference to the string object
```

## Misconceptions and edge cases
* **Misconception:** `float`, `double`, and `decimal` are interchangeable. 
    * **Reality:** They differ significantly in precision and performance. `float` and `double` are binary floating-point types (fast, but can have rounding errors), while `decimal` is a base-10 type (slower, but precise for money).
* **Edge Case:** `void` is a special keyword used to indicate that a method does not return a value; it is not a type that can hold data.
* **Edge Case:** `dynamic` is not a "type" in the traditional sense; it is a directive to the compiler to skip type checking for that variable.

## Knowledge checks with answers

1. **Question:** Is `int` a value type or a reference type?
   * **Answer:** `int` is a value type.

2. **Question:** Why would you choose `decimal` over `double`?
   * **Answer:** You choose `decimal` when you need high precision, such as in financial calculations, to avoid the rounding errors inherent in binary floating-point types.

3. **Question:** What is the purpose of `nint`?
   * **Answer:** `nint` is a native-sized integer that adjusts its size (32-bit or 64-bit) to match the underlying processor architecture.

4. **Question:** What happens if you use `dynamic`?
   * **Answer:** The compiler skips type checking for that variable, and the type is resolved at runtime.

***

**Sources:**
* [Microsoft Learn: Built-in types table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)
* [Microsoft Learn: Integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types)
* [Microsoft Learn: Floating-point numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)
* [Microsoft Learn: Value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)
* [C# 9 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)
