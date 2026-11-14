<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Exercises and worked solutions

*Automatically generated draft.*

## Goals

- Understand how C# language keywords act as convenient aliases for underlying types in the .NET type system.
- Distinguish between **value types** (which store data directly) and **reference types** (which store a reference to a memory heap location).
- Select appropriate numeric, Boolean, character, text, and special type keywords (`int`, `long`, `float`, `double`, `decimal`, `bool`, `char`, `string`, `object`, `dynamic`, `void`, `nint`, `nuint`, etc.) based on range, precision, and domain meaning.

---

## Worked example

To see how built-in type aliases map cleanly to .NET system types, consider a scenario where we track product inventory counts, price, identifier codes, and item status descriptions.

*(Note: The following code block is unverified and presented as pseudocode / instructional example context.)*

```csharp
using System;

class Program
{
    static void Main()
    {
        // 'int' is a C# keyword alias for System.Int32
        int itemCount = 42;

        // 'decimal' is an alias for System.Decimal, ideal for financial/precision quantities
        decimal itemPrice = 19.99m;

        // 'bool' is an alias for System.Boolean
        bool isInStock = true;

        // 'string' is an alias for System.String (a reference type)
        string itemName = "Widget";

        Console.WriteLine($"{itemName}: count={itemCount}, price={itemPrice}, available={isInStock}");
    }
}
```

### Step-by-Step Execution
1. `itemCount` allocates space directly on the stack for a 32-bit signed integer (`int`).
2. `itemPrice` allocates a 128-bit high-precision decimal representation (`decimal`) suited for accurate monetary calculations.
3. `isInStock` holds a single byte-backed Boolean value (`bool`).
4. `itemName` holds a reference to a string object located on the managed heap (`string`).

---

## Exercises

Complete the following independent practice tasks to build fluency:

1. **Exercise 1 (Integral Selection):** Declare an unsigned integral variable using an appropriate inventory keyword (`byte`, `ushort`, `uint`, or `ulong`) to store a maximum physical sensor reading of `65535`. Explain why you chose that specific type over `sbyte` or `int`.
2. **Exercise 2 (Floating-Point Precision):** You are writing a script that tracks precise currency exchanges where rounding errors are unacceptable. Which keyword from the floating-point inventory (`float`, `double`, or `decimal`) must you choose, and why?
3. **Exercise 3 (Native-Sized Integers):** When would you use `nint` or `nuint` instead of standard `int` or `long`? 

---

## Progressive hints

- **Hints for Exercise 1:**
  - *Hint 1:* Look at the unsigned integral inventory group.
  - *Hint 2:* What is the maximum value that a 16-bit unsigned type can hold? ($2^{16} - 1 = 65535$).
- **Hints for Exercise 2:**
  - *Hint 1:* `float` and `double` use binary floating-point representation which can introduce minor rounding discrepancies.
  - *Hint 2:* Financial calculations require base-10 precision. Check the inventory for the keyword specifically designed for high-precision decimal arithmetic.
- **Hints for Exercise 3:**
  - *Hint 1:* Think about pointer sizes or memory addresses which change depending on whether the architecture is 32-bit or 64-bit. (Introduced in C# 9).

---

## Complete solutions

- **Solution to Exercise 1:**
  ```csharp
  ushort sensorReading = 65535;
  ```
  *Reasoning:* `ushort` represents a 16-bit unsigned integer ranging from $0$ to $65535$. `sbyte` is too small (max 127), while `uint` wastes range or memory compared to the exact bounds required.

- **Solution to Exercise 2:**
  ```csharp
  decimal exchangeRate = 1.2345m;
  ```
  *Reasoning:* `decimal` provides 128-bit precise storage optimized for financial and monetary calculations where binary floating-point rounding errors are unacceptable.

- **Solution to Exercise 3:**
  ```csharp
  nint memoryAddressOrPointerIndex = 1024;
  ```
  *Reasoning:* `nint` and `nuint` are native-sized integers whose size matches the native size of the platform (32-bit on 32-bit processes, 64-bit on 64-bit processes). They are useful for interoperability and pointer-heavy logic.

---

## Tests and edge cases

- **Edge Case 1 (Overflow):** Assigning a value exceeding an alias's maximum range (e.g., assigning `300` to a `byte`) causes a compile-time error if literal bounds are violated, or overflow behavior if checked/unchecked contexts apply.
- **Edge Case 2 (Reference vs Value Semantics):** Remember that `string` and `object` are reference types (stored on the heap, nullable by default in modern nullable contexts), whereas types like `int`, `bool`, and `decimal` are value types.

---

## Reflection questions

1. Why does C# provide language keywords like `int` when it could simply use the .NET runtime names like `System.Int32`?
2. What are the performance and memory differences between a value type variable and a reference type variable?
3. When should you choose `double` over `decimal`, and what trade-offs are you making regarding speed versus precision?

---
*Source citation reference:* [Microsoft Learn C# built-in types table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table), [Integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types), [Floating-point numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types), [Value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types), [Reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types), [C# 9 whats-new](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9).
