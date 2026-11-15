<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Interview questions and reasoning

*This lesson is an automatically generated draft.*

# Interview Preparation: C# Built-in Type Aliases

## Core questions
1. What is the relationship between C# keywords (like `int`) and the .NET type system?
2. What is the fundamental difference between value types and reference types?
3. How do you choose between `float`, `double`, and `decimal`?
4. What are `nint` and `nuint`, and why were they introduced?
5. What is the difference between `object` and `dynamic`?

## Concise interview answers
1. **Keywords as Aliases:** C# keywords are aliases for underlying types in the .NET `System` namespace. For example, `int` is an alias for `System.Int32`. They are functionally identical to the framework types.
2. **Value vs. Reference:** Value types (like `int`, `bool`, `double`) store their data directly in the location where the variable is declared. Reference types (like `string`, `object`) store a reference (a memory address) to the data located elsewhere on the heap.
3. **Floating-point Choice:** Use `float` for memory efficiency, `double` for general-purpose scientific calculations, and `decimal` for financial or high-precision calculations where rounding errors are unacceptable.
4. **Native-sized Integers:** `nint` and `nuint` are native-sized integers. Their size is determined by the platform (32-bit or 64-bit). They were introduced in C# 9 to allow for efficient pointer-like arithmetic and interoperability with native APIs.
5. **Object vs. Dynamic:** `object` is the base type for all types; you must cast it to use specific members. `dynamic` tells the compiler to bypass compile-time type checking and resolve members at runtime.

## Deep follow-up answers
*   **On Memory Safety:** While C# provides these types, memory safety remains a preview feature in C# 15/.NET 11. Understanding how these types interact with memory is critical for high-performance scenarios.
*   **On Platform Dependence:** While `int` is always 32-bit, `nint` changes based on the architecture. This makes `nint` essential for cross-platform code that interacts with native memory addresses or handles large indices that might exceed 32-bit limits on 64-bit systems.
*   **On Precision:** `decimal` is not a floating-point type in the same sense as `float` or `double`. It uses a base-10 representation, which avoids the binary representation errors inherent in floating-point math, making it the standard for currency.

## Scenario questions
*   **Scenario:** You are building a high-frequency trading application. Which numeric type do you choose for currency?
    *   *Reasoning:* `decimal`. It provides the precision required for financial calculations, whereas `double` would introduce rounding errors due to its binary representation.
*   **Scenario:** You need to store a value that represents a memory address in a native C++ library. Which type is most appropriate?
    *   *Reasoning:* `nint` or `nuint`. These are designed to match the size of the native pointer on the host architecture.

## Tradeoffs and alternatives
*   **`float` vs `double` vs `decimal`:**
    *   `float`: Low precision, low memory.
    *   `double`: High precision, standard performance.
    *   `decimal`: Highest precision, slowest performance.
*   **`object` vs `dynamic`:**
    *   `object`: Type-safe (requires explicit casting), IDE support (IntelliSense works after casting).
    *   `dynamic`: Flexible, but loses compile-time safety and performance due to runtime resolution.

## Common weak answers
*   "I use `double` for everything because it's the default." (Weak because it ignores precision requirements for money or memory constraints for large arrays).
*   "I use `dynamic` because it's easier than casting." (Weak because it ignores the performance cost and the loss of compile-time error detection).
*   "I don't know the difference between `int` and `Int32`." (Weak because it shows a lack of understanding of the language's relationship with the underlying .NET framework).

## Self-check rubric
*   **Can you explain the alias concept?** (Yes: Keywords = aliases for .NET types).
*   **Can you distinguish value vs reference?** (Yes: Value = data, Reference = pointer).
*   **Do you know when to use `decimal`?** (Yes: Financial/High precision).
*   **Can you explain `nint`?** (Yes: Native-sized, platform-dependent, C# 9+).
*   **Do you understand the risk of `dynamic`?** (Yes: Runtime errors vs compile-time safety).

*Source: [Microsoft Learn C# Built-in Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table), [C# 9 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)*
