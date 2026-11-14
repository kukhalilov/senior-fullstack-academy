<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Exercises and worked solutions

*This is an automatically generated draft.*

# C# Nullability: Nullable Value Types and Nullable Reference Analysis

## Goals
*   Understand the distinction between `Nullable<T>` (value types) and nullable reference type annotations.
*   Master the compiler's static null-state flow analysis.
*   Learn to use flow-analysis attributes to define clear API contracts.
*   Distinguish between compile-time safety and runtime validation.

---

## Worked Example

In C#, `null` represents the absence of a value. However, we handle value types (like `int`) and reference types (like `string`) differently.

### 1. Nullable Value Types
A value type cannot be `null` by default. To allow it, we use `Nullable<T>` or the `T?` shorthand.

```csharp
int? age = null; // Nullable value type
if (age.HasValue) 
{
    Console.WriteLine(age.Value);
}
else 
{
    int result = age.GetValueOrDefault(0); // Returns 0 if age is null
}
```

### 2. Nullable Reference Types
Reference types (classes) can be `null` by default. C# 15 uses static analysis to warn you if you might be dereferencing a `null`.

```csharp
#nullable enable
string? name = null; // Explicitly nullable
string greeting = "Hello"; // Non-nullable

// Console.WriteLine(name.Length); // Compiler Warning: Possible null reference
if (name is not null) 
{
    Console.WriteLine(name.Length); // Safe: Flow analysis knows it's not null
}
```

---

## Exercises

1.  **Value Types:** Create a `double?` variable. Assign it a value, then set it to `null`. Use `GetValueOrDefault()` to print it safely.
2.  **Flow Analysis:** Write a method that accepts a `string?`. Use `ArgumentNullException.ThrowIfNull` to ensure the string is not null, then print its length. Observe how the compiler stops warning you after the guard clause.
3.  **Attributes:** Create a method that returns a `string?`. Use the `[return: MaybeNull]` attribute to signal to the caller that the result might be null even if the signature suggests otherwise.

---

## Progressive Hints

*   **Hint 1:** For Exercise 2, `ArgumentNullException.ThrowIfNull(myString)` is a built-in helper that throws an exception if the argument is null, effectively telling the compiler "this variable is not null from this point forward."
*   **Hint 2:** For Exercise 3, remember that attributes are placed in brackets `[]` before the return type.
*   **Hint 3:** If you get a warning you know is a false positive, use the null-forgiving operator `!` (e.g., `myVar!`), but be careful—it does nothing at runtime!

---

## Complete Solutions

```csharp
// Exercise 1
double? price = 19.99;
price = null;
Console.WriteLine(price.GetValueOrDefault(0.0));

// Exercise 2
void PrintLength(string? input)
{
    ArgumentNullException.ThrowIfNull(input);
    Console.WriteLine(input.Length); // No warning here
}

// Exercise 3
[return: MaybeNull]
string GetValue(bool condition) => condition ? "Data" : null;
```

---

## Tests and Edge Cases

*   **Default Structs:** A `default` struct containing a reference type field will have a `null` field. The compiler may not warn you about this.
*   **External Code:** If you call a library compiled with `#nullable disable`, the compiler treats those types as "oblivious." It will not warn you about potential nulls coming from that library.
*   **The `!` Operator:** `string s = null!;` compiles without warning but will throw a `NullReferenceException` at runtime if you try to use `s`.

---

## Reflection Questions

1.  Why does `Nullable<T>` create a new type, but `string?` does not?
2.  If nullable reference types are just compile-time warnings, how can you ensure your application is safe at runtime?
3.  When would you choose `ArgumentNullException.ThrowIfNull` over a simple `if (x == null)` check?
4.  What is the risk of using the null-forgiving operator (`!`) excessively?

---

## Sources
*   [Nullable value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types)
*   [Nullable reference types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types)
*   [Nullable analysis attributes](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis)
*   [ArgumentNullException.ThrowIfNull](https://learn.microsoft.com/en-us/dotnet/api/system.argumentnullexception.throwifnull)
