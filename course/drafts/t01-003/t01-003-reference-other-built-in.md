<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# built-in type aliases and characteristics — Reference: Other built-in type keywords

*Automatically generated draft.*

# C# Built-in Type Aliases: Other Built-in Types

## Scope and version
This lesson covers the non-numeric built-in type keywords in C#. It is based on the **C# 15** specification running on **.NET 11 GA**, as of November 14, 2026. 
*Source: [Microsoft Learn C# Built-in Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)*

## How this group fits the mental model
In C#, every variable has a type. While numeric types handle calculations, the "other" built-in types handle logic, text, and the fundamental structure of the .NET type system. These keywords act as aliases for underlying .NET types, providing a shorthand that makes code more readable while ensuring the compiler knows exactly how to store and process the data.

## Supplied names explained

*   **`bool`**: Represents a Boolean value, which can only be `true` or `false`. It is used for logical operations and conditional branching.
*   **`char`**: Represents a single 16-bit Unicode character. It is a value type.
*   **`object`**: The ultimate base type for all other types in the .NET type system. Every type, whether built-in or custom, inherits from `object`.
*   **`string`**: Represents a sequence of zero or more Unicode characters. Unlike `char`, `string` is a reference type.
*   **`dynamic`**: A special type that tells the compiler to bypass compile-time type checking. Type resolution happens at runtime.
*   **`void`**: A keyword used to indicate that a method does not return a value. It is not a type that can be used for variables.

## Cross-item comparison

*   **`object` vs. `dynamic`**: `object` requires you to explicitly cast (convert) the variable back to its original type before accessing its members. `dynamic` allows you to call members directly, and the runtime attempts to resolve them.
*   **`char` vs. `string`**: `char` is a single value (a single character). `string` is an immutable reference type that acts as a collection of characters.

## Examples

```csharp
// bool: Logic
bool isReady = true;

// char: Single character
char letter = 'A';

// object: Can hold any type
object data = 10; 
data = "Hello";

// string: Text sequence
string greeting = "Hello, World!";

// dynamic: Bypasses compile-time checks
dynamic flexible = 5;
flexible = "Now I am a string";

// void: Method return type
void LogMessage() {
    Console.WriteLine("Done");
}
```

## Common mistakes

1.  **Using `void` as a variable type**: You cannot declare `void x;`. `void` is only for method signatures.
2.  **Confusing `char` and `string`**: `char` uses single quotes (`'A'`), while `string` uses double quotes (`"A"`).
3.  **Overusing `dynamic`**: Because `dynamic` skips compile-time checking, you lose the safety of the compiler. If you try to call a method that doesn't exist on the underlying object, your program will crash at runtime.

## Knowledge checks with answers

**1. Which type is the base for all other types in C#?**
*Answer: `object`*

**2. Can you declare a variable of type `void`?**
*Answer: No, `void` is used only to indicate that a method returns no value.*

**3. What is the primary difference between `object` and `dynamic`?**
*Answer: `object` requires explicit casting to access members, while `dynamic` defers member resolution to runtime, allowing direct access without explicit casting.*

**4. Is `string` a value type or a reference type?**
*Answer: `string` is a reference type.*
