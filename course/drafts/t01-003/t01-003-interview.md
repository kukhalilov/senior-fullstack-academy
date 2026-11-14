<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Interview questions and reasoning

*Draft status: Automatically generated draft.*

## Core questions

1. What is the relationship between a C# keyword like `int` and the underlying .NET type system?
2. How do value types and reference types differ in how they store data in memory?
3. What are the key distinctions between floating-point types (`float`, `double`, `decimal`) when choosing precision and range?
4. How do native-sized integers (`nint`, `nuint`) differ from fixed-size integral types like `int` or `uint`?
5. What differentiates `object` from `dynamic` in C# type handling?

---

## Concise interview answers

1. **Keywords vs .NET Types:** C# built-in type keywords (such as `int`, `bool`, or `long`) are simply convenient aliases for underlying types defined in the .NET type system (such as `System.Int32`, `System.Boolean`, and `System.Int64`). They compile down to the exact same IL (Intermediate Language) types.
2. **Value Types vs Reference Types:** Value types store their actual values directly in memory (typically on the stack or inline within containing structures), whereas reference types store a reference (pointer) to an object allocated on the managed heap.
3. **`float`, `double`, and `decimal`:** `float` (32-bit single-precision) and `double` (64-bit double-precision) use binary floating-point representation, which is fast but can introduce rounding errors. `decimal` uses a 128-bit decimal representation designed for financial and monetary calculations where exact base-10 precision is required, though it comes with a performance cost.
4. **Native-sized Integers (`nint`, `nuint`):** Unlike fixed-size types (`int` is always 32-bit), native-sized integers (`nint` and `nuint`) match the size of the underlying processor architecture—evaluating to 32-bit on 32-bit processes and 64-bit on 64-bit processes. They are useful for pointer math and interop scenarios.
5. **`object` vs `dynamic`:** `object` is the root of the .NET type system, but variables typed as `object` require explicit casting or reflection to access specific members. `dynamic` tells the C# compiler to bypass static type checking; member resolution and operations on `dynamic` objects are deferred until runtime.

---

## Deep follow-up answers

* **Interviewer:** "If `int` is just an alias for `System.Int32`, does it matter whether I write `int` or `System.Int32` in my C# code?"
  * **Answer:** Functionally and at the compiled IL level, they are identical. However, standard C# style guidelines strongly prefer using the language keyword (`int`) over the framework type name (`System.Int32`) when declaring local variables, fields, or method signatures, reserving framework names primarily when referring specifically to static API utilities or when clarity demands it.

* **Interviewer:** "How do value types behave when they are boxed?"
  * **Answer:** When a value type (like an `int`) is assigned to a variable of type `object`, the runtime allocates an object instance on the heap and copies the value into it. This process is called **boxing**. **Unboxing** is the explicit extraction of the value type from the object reference. Boxing incurs a performance and memory allocation overhead, which is important to avoid in high-throughput or low-latency code paths.

---

## Scenario questions

* **Scenario:** You are building an e-commerce checkout service that calculates tax, discounts, and total order amounts. Which built-in type should you select for monetary values, and why?
  * **Guidance:** You should select `decimal`. Binary floating-point types (`float` and `double`) cannot precisely represent certain fractional base-10 numbers (like `0.1`), leading to rounding errors that accumulate over multiple calculations. `decimal` provides exact base-10 representation, preventing financial discrepancy errors.

* **Scenario:** You are writing low-level interop code that interacts with native handles and pointers on varying host architectures (both 32-bit and 64-bit platforms). Which integral types should you use for pointer-sized indices?
  * **Guidance:** You should use `nint` (native-signed integer) or `nuint` (native-unsigned integer). These keywords adjust their size automatically to match the pointer width of the target platform at runtime, avoiding overflow or truncation issues common with fixed-size types like `int` or `long`.

---

## Tradeoffs and alternatives

* **`float` vs `double` vs `decimal`:**
  * *Tradeoff:* `float` uses less memory (4 bytes) than `double` (8 bytes), but `double` provides greater precision. `decimal` provides high-precision base-10 accuracy (16 bytes) but is significantly slower for general mathematical operations compared to binary floating-point types.
* **`object` vs `dynamic`:**
  * *Tradeoff:* `object` guarantees type safety at compile time, requiring explicit casts to access specific properties or methods. `dynamic` provides writing convenience and simplifies interop with dynamic languages or COM objects, but completely sacrifices compile-time safety, pushing type mismatches and missing member errors to runtime exceptions.
* **Fixed-size (`int`, `uint`, `long`, `ulong`) vs Native-sized (`nint`, `nuint`):**
  * *Tradeoff:* Fixed-size types guarantee identical bit-widths and behaviors across all platforms, ensuring predictable serialization and data storage. Native-sized types adapt to the host architecture for efficient pointer manipulation and interop, but introduce platform-dependent size variations.

---

## Common weak answers

* *Weak Answer:* "I always use `double` for every number in my application because it has the most precision."
  * *Why it is weak:* It ignores domain meaning and performance tradeoffs. Using `double` for currency is a severe bug due to rounding errors, and using `double` where a small integer or `float` suffices wastes memory and bandwidth.
* *Weak Answer:* "Built-in types like `string` and `object` are value types because they live in .NET."
  * *Why it is weak:* It demonstrates confusion regarding fundamental memory models. `string` and `object` are reference types stored on the heap, while value types store their data directly.

---

## Self-check rubric

* Can you explain why C# keywords map directly to the underlying .NET type system?
* Do you know the memory distinction between value types and reference types?
* Can you justify when to use `decimal` instead of `double` or `float`?
* Can you explain how `nint` and `nuint` differ from fixed-size integral types?
* Do you understand the difference between compile-time safety with `object` and runtime binding with `dynamic`?

*Sources cited:*
* [Microsoft Learn: C# built-in types reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)
* [Microsoft Learn: Integral numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/integral-numeric-types)
* [Microsoft Learn: Floating-point numeric types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/floating-point-numeric-types)
* [Microsoft Learn: Value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)
* [Microsoft Learn: Reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/reference-types)
* [Microsoft Learn: What's new in C# 9 (Native integers)](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-9)
