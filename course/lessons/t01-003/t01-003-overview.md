
# C# built-in type aliases and characteristics — Big-picture orientation and mental model

*Draft: Automatically generated for educational purposes.*

# Problem and purpose
In C#, every piece of data must have a defined type. Without types, the computer would not know how much memory to allocate for a variable or how to interpret the bits stored in that memory (e.g., is this sequence of bits a number or a character?).

The purpose of C# built-in type aliases is to provide a convenient, readable shorthand for fundamental types defined in the .NET type system. Instead of writing long, complex names, you use keywords like `int` or `string`. These keywords ensure that your code is consistent, portable, and easy for the compiler to understand.

# Plain-language mental model
Think of C# types as describing values and operations. A value-type variable contains an instance; ordinary assignment copies that instance. A reference-type variable contains a reference to an object. The language doesn't specify that reference as a physical address or prescribe where objects are stored.

When you use a keyword like `int`, you select a defined 32-bit signed integer type. The keyword aliases `System.Int32`; the language specifies its value semantics and range, while physical storage is context-dependent.

# How the parts fit together
C# built-in types are organized by how they store data and what kind of data they represent:
1.  **Integral types:** Represent whole numbers (e.g., `int`, `long`).
2.  **Floating-point types:** Represent numbers with fractional parts (e.g., `double`, `decimal`).
3.  **Other built-ins:** Handle logic (`bool`), text (`char`, `string`), or special cases (`object`, `dynamic`, `void`).

Most keywords are aliases for .NET types: `int` and `System.Int32` are interchangeable. `dynamic` represents runtime binding (and is encoded as `object` in metadata); `void` denotes no return type. `delegate` declares a custom delegate type rather than aliasing one specific .NET type.

# Concept map
*   **Keywords as Aliases:** C# keywords map directly to the .NET type system.
*   **Value vs. Reference:** A variable contains a value-type instance or a reference to a reference-type object. Physical layout is an implementation detail.
*   **Numeric Characteristics:** Types differ based on their range (how big a number they hold), precision (how accurate they are), and representation.
*   **Domain Selection:** Choosing a type involves balancing the need for accuracy, memory efficiency, and compatibility with other APIs.

# End-to-end walkthrough
Imagine you are writing a program to track a user's age and their name.

1.  **Declaration:** You choose `int` for the age because it is a whole number. You choose `string` for the name because it is a sequence of characters.
    ```csharp
    int age = 25;
    string name = "Alex";
    ```
2.  **Type behavior:** `int` is a value type; `string` is a reference type. Their runtime storage and generated instructions depend on context and implementation.
3.  **Usage:** The compiler and runtime apply the operations defined for each type; source-level type semantics do not promise a particular physical layout.
4.  **Result:** The program safely handles the data because the types defined exactly what the computer should expect.

# When to use it and tradeoffs
*   **Use built-in keywords** for standard operations because they are concise and universally understood by C# developers.
*   **Tradeoffs:**
    *   **Range vs. Memory:** Using a `long` instead of an `int` allows for larger numbers but uses more memory.
    *   **Precision:** `float` has less precision than `decimal`; do not assume it is faster without measuring. `decimal` may suit decimal-domain financial calculations, but it too has finite precision.
    *   **Interoperability:** Sometimes you must choose a type based on what an external API expects, even if it isn't your first choice for the domain.

**Common Mistake:** Confusing `object` (which can hold anything but requires "boxing" to convert value types) with `dynamic` (whose operations are bound at runtime).

# What later lessons cover
This overview provides the foundation. Future lessons will explore:
*   **Numeric Literals and Conversions:** How to write numbers in code and move data between different types (e.g., converting `int` to `double`).
*   **Nullable Types:** How to handle the absence of a value using `T?` syntax.
*   **Complex Structures:** How to build your own types using `struct`, `class`, and `enum`.
*   **Formatting and Parsing:** How to convert these types into user-readable text and vice versa.

***

*Source: [Microsoft Learn C# built-in types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)*
