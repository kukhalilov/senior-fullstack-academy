<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Exercises and worked solutions

*Automatically generated draft.*

# C# Built-in Type Aliases and Characteristics

## Goals
* Understand that C# keywords are aliases for underlying .NET types.
* Distinguish between **Value types** (store the actual data) and **Reference types** (store a memory address pointing to the data).
* Learn to select the appropriate type based on range, precision, and domain requirements.

## Worked example
In C#, `int` is a keyword that acts as an alias for `System.Int32`. When you declare a variable, you are telling the compiler how much memory to reserve and how to interpret the bits stored there.

```csharp
// 'int' is a value type; it holds the number directly.
int count = 10; 

// 'string' is a reference type; it holds a reference to the text in memory.
string message = "Hello"; 
```

**Step-by-step behavior:**
1. **Declaration:** `int count = 10;` reserves 4 bytes of stack memory.
2. **Assignment:** The value `10` is written into those 4 bytes.
3. **Reference:** `string message = "Hello";` creates an object on the heap and stores the memory address of that object in the `message` variable.

## Exercises
1. You need to store a value that represents a toggle (on/off). Which type from the `other-built-in` category is most appropriate?
2. You are writing a financial application requiring high precision for currency. Compare `float`, `double`, and `decimal`. Which is the safest choice?
3. You need an integer type that automatically adjusts its size (32-bit or 64-bit) based on the underlying processor architecture. Which keywords should you use?

## Progressive hints
* **Hint 1 (Exercise 1):** Look at the `other-built-in` list. Is there a type specifically for logical truth values?
* **Hint 2 (Exercise 2):** `float` and `double` are binary floating-point types (good for scientific calculations). `decimal` is a 128-bit type with higher precision and smaller range, designed specifically for financial calculations to avoid rounding errors.
* **Hint 3 (Exercise 3):** Refer to the `native-integral` category. These types were introduced in C# 9 to match the size of the native pointer on the host machine.

## Complete solutions
1. **`bool`**: It is the built-in type for Boolean values.
2. **`decimal`**: It provides the precision required for financial data, whereas `float` and `double` are prone to rounding errors in base-10 arithmetic.
3. **`nint` and `nuint`**: These are native-sized integers.

## Tests and edge cases
* **Range overflow:** Assigning a value larger than `int.MaxValue` to an `int` variable will cause a compilation error.
* **Precision loss:** Assigning a very large number to a `float` may result in a loss of precision compared to a `double`.
* **Platform dependence:** `nint` and `nuint` will behave differently on 32-bit versus 64-bit systems. Always test your logic on both architectures if you rely on their size.

## Reflection questions
* Why does C# provide both `int` and `long`? (Consider memory usage vs. range).
* How does `dynamic` differ from `object`? (Hint: `dynamic` bypasses compile-time type checking).
* When should you prefer `string` over `char`? (Consider if you are storing a single character or a sequence).

***

**Sources:**
* [Microsoft Learn: Built-in types table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)
* [C# 9 Native-sized integers](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)
