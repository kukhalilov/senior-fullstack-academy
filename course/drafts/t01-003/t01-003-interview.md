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
1. **Keywords and .NET types:** Most built-in type keywords alias .NET types; `int` and `System.Int32` name the same type. `dynamic` represents runtime binding and is encoded as `object`; `delegate` declares a new delegate type, and `void` denotes no return type.
2. **Value vs. Reference:** Value-type variables contain values; reference-type variables contain references to objects. The language does not guarantee a stack location for values or define object references as physical memory addresses.
3. **Numeric choice:** `float`/`double` are binary IEEE 754 formats; `decimal` uses finite-precision decimal scaling. Choose by range, precision, special values, domain rounding rules, and APIs, not a universal finance rule.
4. **Native-sized Integers:** `nint` and `nuint` are native-sized integers. Their size is determined by the platform (32-bit or 64-bit). They were introduced in C# 9 to allow for efficient pointer-like arithmetic and interoperability with native APIs.
5. **Object vs. Dynamic:** `object` is the base type for all types; you must cast it to use specific members. `dynamic` tells the compiler to bypass compile-time type checking and resolve members at runtime.

## Deep follow-up answers
*   **On memory safety:** Memory safety is not a property of this type list and the claim that it is preview-only is unsupported. Unsafe code, managed references, and ref safety are separate topics.
*   **On platform dependence:** `nint` follows process pointer width and is useful when an API specifies a native-sized integer. It is not inherently required for cross-platform code or large indices; `long` remains fixed-width.
*   **On precision:** `decimal` exactly represents many decimal fractions, but has finite range and precision and can round. Financial calculations must follow domain-defined scale and rounding rules.

## Scenario questions
*   **Scenario:** You are building a high-frequency trading application. Which numeric type do you choose for currency?
    *   *Reasoning:* `decimal`. It represents many decimal fractions exactly, unlike binary floating point, but arithmetic can still round. Use the type and rounding policy required by the domain.
*   **Scenario:** You need to store a value that represents a memory address in a native C++ library. Which type is most appropriate?
    *   *Reasoning:* `nint` or `nuint`. These are designed to match the size of the native pointer on the host architecture.

## Tradeoffs and alternatives
*   **`float` vs `double` vs `decimal`:**
    *   `float`: Low precision, low memory.
    *   `double`: High precision, standard performance.
    *   `decimal`: base-10 scaled representation with a smaller range than `double`; performance depends on operation and runtime.
*   **`object` vs `dynamic`:**
    *   `object`: Type-safe (requires explicit casting), IDE support (IntelliSense works after casting).
    *   `dynamic`: Flexible, but loses compile-time safety and performance due to runtime resolution.

## Common weak answers
*   "I use `double` for everything because it's the default." (Weak because type choice should follow domain, range, precision, rounding, and API requirements).
*   "I use `dynamic` because it's easier than casting." (Weak because it ignores the performance cost and the loss of compile-time error detection).
*   "I don't know the difference between `int` and `Int32`." (Weak because it shows a lack of understanding of the language's relationship with the underlying .NET framework).

## Self-check rubric
*   **Can you explain the built-in keyword set?** (Most keywords alias .NET types; `dynamic`, `delegate`, and `void` have distinct language semantics).
*   **Can you distinguish value vs reference?** (Yes: Value = data, Reference = pointer).
*   **Do you know when to use `decimal`?** (Yes: Financial/High precision).
*   **Can you explain `nint`?** (Yes: Native-sized, platform-dependent, C# 9+).
*   **Do you understand the risk of `dynamic`?** (Yes: Runtime errors vs compile-time safety).

*Source: [Microsoft Learn C# Built-in Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table), [C# 9 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)*
