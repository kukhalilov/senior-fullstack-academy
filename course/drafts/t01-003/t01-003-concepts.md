<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Core concepts and how they fit together

*This is an automatically generated draft.*

# C# Built-in Type Aliases and Characteristics

## Learning objectives
* Understand that C# keywords are aliases for underlying .NET types.
* Distinguish between value types and reference types.
* Identify the purpose of different numeric, character, and special types.
* Learn how to choose the appropriate type based on range, precision, and intent.

## Prerequisites
* Basic familiarity with programming concepts like variables and data storage.
* Understanding that computers store data in memory (RAM).

## Core concepts
In C#, you use keywords like `int` or `string` to declare variables. These are **aliases**—shorthand names—for specific types defined in the .NET type system. For example, `int` is an alias for `System.Int32`.

### Mental Model: The Box vs. The Label
* **Value Types:** Think of these as a **box**. When you declare a value type (like `int` or `bool`), the actual data is stored directly in that box. When you copy it, you copy the data itself.
* **Reference Types:** Think of these as a **label** on a box. The variable holds a "reference" (an address) pointing to where the actual data lives in memory. When you copy it, you only copy the address, not the data.

### The Type Map
1. **Numeric Types:** Used for math. They differ by range (how big a number) and precision (how many decimal places).
2. **Boolean/Character:** `bool` for true/false; `char` for a single character.
3. **Special Types:** `object` (the base of everything), `string` (a sequence of characters), `dynamic` (bypasses compile-time checking), and `void` (indicates no return value).

## Mechanisms and relationships
### Numeric Categories
* **Signed vs. Unsigned:** Signed types (e.g., `int`) can represent negative numbers. Unsigned types (e.g., `uint`) only represent zero and positive numbers, effectively doubling the positive range.
* **Native-sized (`nint`, `nuint`):** These types automatically adjust their size based on the underlying processor architecture (32-bit vs 64-bit).
* **Floating-point:** 
    * `float` and `double` are binary-based (fast, but can have rounding errors).
    * `decimal` is base-10 (slower, but precise—perfect for financial calculations).

### Reference vs. Value
* **Value types:** `sbyte`, `short`, `int`, `long`, `byte`, `ushort`, `uint`, `ulong`, `nint`, `nuint`, `float`, `double`, `decimal`, `bool`, `char`.
* **Reference types:** `object`, `string`, `dynamic`.

## Worked examples
Imagine you are building a simple inventory system.

```csharp
// Using an integral type for a count
int itemCount = 10; 

// Using a decimal for price (precision is critical for money)
decimal price = 19.99m; 

// Using a string for a name
string itemName = "Widget";

// Using a bool for availability
bool isAvailable = true;
```

**Step-by-step behavior:**
1. `itemCount` is a value type. The number `10` is stored in the memory allocated for the variable.
2. `price` is a value type. The exact decimal representation is stored.
3. `itemName` is a reference type. The variable `itemName` holds a memory address pointing to the actual text "Widget" stored elsewhere in the heap.

## Misconceptions and edge cases
* **Misconception:** `object` and `dynamic` are the same. 
    * *Reality:* `object` requires you to "cast" (convert) the type before using it. `dynamic` tells the compiler to wait until the program is actually running to figure out what the type is.
* **Edge Case:** `float` vs `double`. Always prefer `double` for general math unless you have a specific memory constraint, as it is the default for floating-point operations in .NET.
* **Edge Case:** `char` vs `string`. A `char` is a single character (uses single quotes: `'A'`). A `string` is a collection of characters (uses double quotes: `"A"`).

## Knowledge checks with answers

1. **Question:** If you need to store a financial value, should you use `double` or `decimal`?
   * **Answer:** `decimal`. It provides the precision required for financial calculations, whereas `double` can introduce small rounding errors.

2. **Question:** What is the difference between `int` and `uint`?
   * **Answer:** `int` is a signed type (can be negative), while `uint` is an unsigned type (only zero or positive).

3. **Question:** Is `string` a value type or a reference type?
   * **Answer:** Reference type.

4. **Question:** Why would you use `nint` instead of `int`?
   * **Answer:** To ensure the integer size matches the native size of the processor (32-bit or 64-bit), which is useful for memory addresses or interop scenarios.

*Source: [Microsoft Learn C# Built-in Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)*
