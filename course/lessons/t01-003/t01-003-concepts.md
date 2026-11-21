
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
In C#, every expression has a type. Most built-in type keywords are aliases for .NET types (`int` and `System.Int32` are the same type). `dynamic` has runtime-binding semantics, while `void` represents the absence of a return type.

### Mental Model: The Container vs. The Label
* **Value Types:** A variable contains an instance of its value type. Ordinary assignment copies that instance; if it contains reference-typed fields, those references are copied too.
* **Reference Types:** A variable contains a reference to an object. C# does not specify a physical address representation or prescribe the object's storage location.

### The Type Map
1. **Integral Types:** Represent whole numbers. These are divided into signed (can be negative) and unsigned (only zero or positive).
2. **Floating-point types:** `float` and `double` are IEEE 754 binary formats. `decimal` is a finite-precision base-10 scaled representation, not an IEEE binary floating-point format.
3. **Other Types:** Include logical values (`bool`), text (`char`, `string`), and special types like `object`, `dynamic`, and `void`.

## Mechanisms and relationships
Most built-in type keywords alias .NET types; for example, `int` and `System.Int32` name the same type. `dynamic` is represented as `object` in metadata but changes binding behavior, and `void` denotes no return type.

### Key Distinctions
* **Range and precision:** `long` has a wider range than `int`; storage width alone doesn't determine total memory use or speed.
* **Native-sized Integers (`nint`, `nuint`):** Their width follows the process architecture (32 or 64 bits) and they can fit native-sized integer APIs. They are not managed object references; follow the interop API's contract.
* **`object` vs. `dynamic`:** `object` is the root base type for ordinary .NET types (with `ref struct` restrictions); member access is statically checked against `object`. Operations on `dynamic` are runtime-bound and can fail at runtime.

## Worked examples

### Example 1: Choosing a Numeric Type
If you are counting items in a list, `int` is usually sufficient. If you are dealing with financial data, `decimal` often fits decimal-domain financial rules because many base-10 fractions are exact in it; it has finite precision and arithmetic can still round.

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
    * **Reality:** They differ significantly in precision and performance. `float` and `double` are binary floating-point types (fast, but can have rounding errors), while `decimal` uses a base-10 scaled representation (often useful for decimal-domain amounts, though finite precision can still round); benchmark performance for the actual workload.
* **Edge Case:** `void` represents absence of a type and is used for methods that return no value; it cannot be used for variables.
* **Edge Case:** `dynamic` is a source-level type with runtime-bound operations, represented as `object` in metadata; it does not disable all compile-time checking.
* **Unicode:** `char` is one 16-bit UTF-16 code unit, not necessarily a complete Unicode scalar. `string` is immutable and its `==` operator compares contents.

## Knowledge checks with answers

1. **Question:** Is `int` a value type or a reference type?
   * **Answer:** `int` is a value type.

2. **Question:** Why would you choose `decimal` over `double`?
   * **Answer:** You choose `decimal` when you need high precision, such as in financial calculations, because many base-10 fractions are represented exactly; decimal arithmetic still has finite precision and may round.

3. **Question:** What is the purpose of `nint`?
   * **Answer:** `nint` is a native-sized integer that adjusts its size (32-bit or 64-bit) to match the underlying processor architecture.

4. **Question:** What happens if you use `dynamic`?
   * **Answer:** Operations on a dynamic expression are bound at runtime, while other expressions and surrounding code retain ordinary compile-time checks.

***

**Sources:**
* [Microsoft Learn: Built-in types table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)
* [Microsoft Learn: Integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types)
* [Microsoft Learn: Floating-point numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)
* [Microsoft Learn: Value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)
* [C# 9 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)
