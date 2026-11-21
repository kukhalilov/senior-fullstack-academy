
# C# built-in type aliases and characteristics — Reference: Other built-in type keywords

# C# Built-in Type Aliases: Other Built-in Types

## Scope and version
This lesson covers the non-numeric built-in type keywords in C#. It is based on the **C# 15** specification running on **.NET 11 GA**, as of November 20, 2026.
*Source: [Microsoft Learn C# Built-in Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/built-in-types-table)*

## How this group fits the mental model
In C#, every variable has a type. While numeric types handle calculations, the "other" built-in types handle logic, text, and the fundamental structure of the .NET type system. Some keywords alias .NET types, while `dynamic`, `delegate`, and `void` have distinct semantics; they are not all simple aliases.

## Supplied names explained

*   **`bool`**: Represents a Boolean value, which can only be `true` or `false`. It is used for logical operations and conditional branching.
*   **`char`**: Represents one 16-bit UTF-16 code unit, which may be only half of a surrogate pair and is not always a complete Unicode scalar or user-perceived character. It is a value type.
*   **`object`**: Alias for `System.Object`, the root base type for ordinary types in C#; `ref struct` values are excluded from boxing and cannot be assigned to `object`.
*   **`string`**: Alias for `System.String`, an immutable reference type representing a sequence of UTF-16 `char` values. Its `==` and `!=` operators compare contents.
*   **`dynamic`**: An object-like source type for which operations are bound at runtime. It is represented as `object` in metadata; it does not turn off all compile-time checks.
*   **`void`**: Represents absence of a type and is used for methods that return no value; it cannot be used for variables.
*   **`delegate`**: A built-in reference-type keyword that declares custom delegate types deriving from `System.Delegate`; it isn't an alias for one specific .NET type. This keyword is explicitly included in the manifest inventory.

## Cross-item comparison

*   **`object` vs. `dynamic`**: `object` member access is checked against `object`, so use a cast or pattern to access a more specific member. Operations on `dynamic` are runtime-bound and can throw binder exceptions.
*   **`char` vs. `string`**: `char` is a UTF-16 code unit, not necessarily a complete user-perceived character. `string` is an immutable sequence of UTF-16 code units.

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

// dynamic: this operation is bound at runtime
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
3.  **Overusing `dynamic`**: Dynamically bound member operations can fail at runtime if the runtime value lacks the member; the rest of the program remains subject to normal compile-time checks.
4.  **Object boxing:** Converting most value types to `object` boxes a copy; `ref struct` values cannot be boxed. `object` is the base of the unified type system, not a guarantee every value can be stored in an object variable.

## Knowledge checks with answers

**1. Which type is the base for all other types in C#?**
*Answer: `object`*

**2. Can you declare a variable of type `void`?**
*Answer: No, `void` is used only to indicate that a method returns no value.*

**3. What is the primary difference between `object` and `dynamic`?**
*Answer: `object` requires explicit casting to access members, while `dynamic` defers member resolution to runtime, allowing direct access without explicit casting.*

**4. Is `string` a value type or a reference type?**
*Answer: `string` is a reference type.*
