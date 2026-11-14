<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Reference: Unsigned integral type keywords

*Note: This is an automatically generated draft.*

## Scope and version

* **Topic Scope:** This reference lesson covers the exact unsigned integral type keywords supplied in the inventory group (`byte`, `ushort`, `uint`, `ulong`). It excludes numeric literal syntax, numeric conversion rules, nullable forms, compound structures (such as arrays, tuples, enums, structs, classes, interfaces, and delegates), framework types not exposed as C# keywords, and formatting or parsing APIs.
* **Edition/Version:** C# 15 stable on .NET 11 GA (checked 2026-11-14). 
* **Authority & Source Citation:** [Microsoft Learn C# built-in type reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table) and [Microsoft Learn Integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types).

---

## How this group fits the mental model

In C#, keywords are shorthand aliases for underlying types in the .NET type system. Value types store their actual values directly in memory rather than storing a reference to an object. Unsigned integral types specifically represent whole numbers (integers) that cannot be negative, meaning their entire bit range is dedicated to positive values and zero. 

Choosing an unsigned integral type balances domain meaning (such as counting items or raw memory offsets that cannot be negative), range requirements (preventing overflow by choosing a type with enough capacity), and interoperability with other .NET libraries or low-level APIs.

---

## Supplied names explained

* **`byte`**: An 8-bit unsigned integer type. It maps to the .NET type `System.Byte`. It is useful for representing raw binary data, streams of bytes, or small positive counters ranging from 0 to 255.
* **`ushort`**: A 16-bit unsigned integer type. It maps to the .NET type `System.UInt16`. It holds positive whole numbers and zero, ranging from 0 to 65,535.
* **`uint`**: A 32-bit unsigned integer type. It maps to the .NET type `System.UInt32`. It is a standard choice for positive whole numbers, indices, or sizes, ranging from 0 to 4,294,967,295.
* **`ulong`**: A 64-bit unsigned integer type. It maps to the .NET type `System.UInt64`. It provides a very large range for positive whole numbers, from 0 to 18,446,744,073,709,551,615, making it suitable for large identifiers or high-capacity counts.

---

## Cross-item comparison

* **`uint` vs `ulong`**: While both represent non-negative whole numbers, `uint` uses 32 bits of storage (up to ~4.29 billion), whereas `ulong` uses 64 bits of storage (up to ~18.4 quintillion). Use `uint` for standard positive counts and `ulong` only when the domain requires values exceeding the 32-bit limit.
* **`byte` vs `ushort`**: `byte` occupies 8 bits (max value 255), while `ushort` occupies 16 bits (max value 65,535). Choose `byte` for tight memory packing of byte-level data (like buffers), and `ushort` when values exceed 255 but fit within 16 bits.

---

## Examples

The following code example is unverified and presented as pseudocode because execution results were not captured in a test harness:

```csharp
// Unverified / Pseudocode example demonstrating unsigned integral types
byte sampleByte = 200;
ushort sampleUshort = 50000;
uint sampleUint = 3000000000U;
ulong sampleUlong = 10000000000000UL;

// Each variable stores a non-negative whole number within its specific bit-width range.
```

---

## Common mistakes

* **Assigning negative numbers**: Attempting to assign a negative value to an unsigned type (`byte b = -5;`) will result in a compile-time error because unsigned types cannot store negative values.
* **Ignoring overflow behavior**: Assuming an unsigned type will "roll over" or behave like a signed type without checking bounds can introduce subtle logic bugs in calculations.
* **Confusing bit-widths with domain types**: Using `ulong` everywhere "just in case" wastes memory and can violate API expectations where external libraries strictly require a 32-bit `uint` or 8-bit `byte`.

---

## Knowledge checks with answers

1. **Question:** What is the .NET system type underlying the C# `byte` keyword?
   * **Answer:** `System.Byte`.
2. **Question:** What is the maximum range constraint for choosing an unsigned type compared to a signed type?
   * **Answer:** Unsigned types (`byte`, `ushort`, `uint`, `ulong`) only store numbers $\ge 0$, dedicating their full bit-width range to positive values and zero, whereas signed types split their range between negative and positive values.
3. **Question:** Why would a developer choose `uint` over `ulong`?
   * **Answer:** To restrict values to the 32-bit range (up to ~4.29 billion), save memory relative to 64-bit storage, and match APIs or data structures that explicitly expect 32-bit unsigned integers.
