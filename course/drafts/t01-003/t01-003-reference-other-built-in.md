<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Reference: Other built-in type keywords

## Scope and version

*Automatically generated draft.*

This lesson covers the exact group of C# built-in type keywords categorized under "Other built-in type keywords" from the .NET type system. 

- **Scope:** Defines the behavior, purpose, and distinctions among `bool`, `char`, `object`, `string`, `dynamic`, and `void`.
- **Exclusions:** Numeric literal syntax, conversion rules, nullable forms (`T?`), arrays, tuples, custom structs, classes, and parsing APIs are excluded as per the topic boundaries.
- **Source Authority & Edition:** C# 15 stable on .NET 11 GA (checked November 14, 2026). See the official reference on [Microsoft Learn C# built-in types table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table) and [Value Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types).

---

## How this group fits the mental model

In C#, keywords act as convenient shorthand aliases for underlying types defined in the .NET type system (`System.Boolean`, `System.Char`, etc.). While numeric keywords handle math and measurements, this specific group of "other" built-in types handles logical decisions (`bool`), individual text symbols (`char`), universal root inheritance (`object`), text sequences (`string`), runtime type safety bypassing (`dynamic`), and the absence of a return value (`void`). 

A foundational mental model requires distinguishing between **value types** (which store their data directly) and **reference types** (which store a reference to a memory heap location). Within this group:
- `bool` and `char` are value types.
- `object`, `string`, and `dynamic` are reference types.
- `void` is a special structural keyword representing no type rather than a storable value.

---

## Supplied names explained

* **`bool`**: An alias for `System.Boolean`. It represents a Boolean value that can be either `true` or `false`. It is a value type and occupies 1 byte of storage.
* **`char`**: An alias for `System.Char`. It represents a 16-bit Unicode character used to store a single UTF-16 code unit. It is a value type.
* **`object`**: An alias for `System.Object`. It serves as the ultimate base class for all .NET types. Because every type inherits from `object`, variables of type `object` can store values of any type, though doing so with value types incurs boxing overhead. It is a reference type.
* **`string`**: An alias for `System.String`. It represents a sequential collection of Unicode characters used to represent text. Strings are immutable (their contents cannot be changed after creation). It is a reference type.
* **`dynamic`**: A special type indicator that tells the C# compiler to bypass compile-time type checking. Operations involving `dynamic` expressions are resolved at runtime through Dynamic Language Runtime (DLR) binding. It is a reference type concept used for interoperability and late-bound scenarios.
* **`void`**: A keyword that specifies an absence of a return value. It is used exclusively as the return type of a method to indicate that the method does not return a value. It is not a storable variable type.

---

## Cross-item comparison

Based on the official specifications and comparison sources ([Microsoft Learn Built-in Types Table](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table) and [Value Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types)), consider these comparisons:

* **`char` vs. `string`**: 
  - `char` stores a *single* 16-bit Unicode code unit and is a value type.
  - `string` stores an *ordered sequence* of characters, is immutable, and is a reference type.
* **`object` vs. `dynamic`**:
  - `object` provides universal compatibility at the expense of compile-type safety; to call methods on an object value, you must explicitly cast or use pattern matching to restore its specific type.
  - `dynamic` also accepts any value, but automatically defers member resolution (method calls, property access) to runtime, removing the need for explicit casts.

---

## Examples

*Note: The following code examples are unverified pseudocode and have not been executed on a live compiler.*

```csharp
// Unverified example demonstrating other built-in type keywords
bool isActive = true;
char ratingCode = 'A';

// object can hold any value, but requires casting/type checking to use specific features
object universalBox = "Hello World"; 
string textMessage = "C# 15";

// dynamic defers type resolution to runtime
dynamic flexibleData = 42;
flexibleData = "Now I am a string"; // Valid because type checking is deferred

// void method signature indicating no return value
void LogStatus()
{
    // Implementation details
}
```

---

## Common mistakes

1. **Treating `string` as a value type:** Assuming `string` behaves like a primitive value type due to its literal syntax. Remember that `string` is reference-typed and immutable; string modifications create new string instances in memory.
2. **Overusing `dynamic` for convenience:** Using `dynamic` when standard types or `object` would suffice, which forfeits compile-time error catching and degrades performance due to runtime binding overhead.
3. **Attempting to declare a variable of type `void`:** Trying to write `void myVariable;`. `void` is a structural indicator for method return signatures, not a storage container.
4. **Confusing single quotes with double quotes for `char` and `string`:** Assigning a string in double quotes (`"A"`) to a `char` variable, which causes a compile-time type mismatch because `char` requires single quotes (`'A'`).

---

## Knowledge checks with answers

1. **Question:** Is `string` a value type or a reference type, and what underlying .NET type does it alias?
   * **Answer:** `string` is a reference type, and it is an alias for `System.String`.

2. **Question:** What is the primary operational difference between using an `object` variable and a `dynamic` variable when accessing a custom property on stored data?
   * **Answer:** With an `object` variable, you must explicitly cast or pattern-match the variable back to its specific underlying type before accessing its members at compile time. With a `dynamic` variable, the compiler permits property access without casting, deferring resolution to runtime via the DLR.

3. **Question:** Can you declare a local variable using the `void` keyword? Explain why or why not.
   * **Answer:** No, you cannot. `void` represents the absence of a type and is used exclusively as a method return type to indicate that the method returns no value.
