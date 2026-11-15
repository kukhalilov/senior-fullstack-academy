<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Core concepts and how they fit together

*Draft: Automatically generated.*

# C# Nullability: Nullable Value Types and Nullable Reference Analysis

### Learning objectives
*   Distinguish between `Nullable<T>` (value types) and nullable reference type annotations.
*   Understand how the compiler performs static flow analysis to track null states.
*   Learn how to use nullability attributes to communicate contracts in public APIs.
*   Recognize the boundary between compile-time warnings and runtime safety.

### Prerequisites
*   Understanding of basic C# types (value vs. reference types).
*   Familiarity with basic control flow (if/else, loops).
*   Knowledge of standard C# operators (null-coalescing `??`, null-conditional `?.`).

### Core concepts
In C#, "null" represents the absence of a value. However, C# handles this differently depending on the type:

1.  **Nullable Value Types (`Nullable<T>`):** Value types (like `int`, `bool`, `struct`) cannot be null by default. `Nullable<T>` (or `T?`) wraps these types, allowing them to hold a value or be "empty." This is a distinct runtime type.
2.  **Nullable Reference Types (NRTs):** Reference types (like `string`, `object`, `class`) can always be null. NRTs are a **compile-time feature**. They do not change the runtime behavior of your code; instead, the compiler tracks whether a variable *might* be null and issues warnings if you try to use it unsafely.

### Mechanisms and relationships
The system relies on a **Nullable Context**. When enabled, the compiler tracks the "null state" of variables:
*   **Not-null state:** The compiler is confident the variable holds an object.
*   **Maybe-null state:** The compiler warns that the variable might be null.

**The Flow Analysis:** The compiler watches your code. If you check `if (x is not null)`, the compiler updates the null state of `x` to "not-null" within that block.

**The Contract:** Public APIs use **Flow-analysis attributes** (like `[NotNullWhen(true)]`) to tell the compiler about relationships between inputs and outputs that the compiler cannot deduce on its own.

### Worked examples

#### 1. Nullable Value Types
```csharp
int? x = null; // Nullable<int>
if (x.HasValue) 
{
    Console.WriteLine(x.Value); // Safe access
}
int y = x.GetValueOrDefault(0); // Returns 0 if x is null
```

#### 2. Nullable Reference Types and Flow Analysis
```csharp
#nullable enable
string? name = GetName(); // Might be null

if (name is not null)
{
    // Compiler knows 'name' is not-null here
    Console.WriteLine(name.Length); 
}

// Console.WriteLine(name.Length); // Warning: Possible null reference
```

#### 3. Using the Null-Forgiving Operator
If you are certain a variable is not null, but the compiler disagrees, use the `!` operator:
```csharp
string? name = GetName();
Console.WriteLine(name!.Length); // Assertion: "I know this isn't null"
```
*Note: This has no effect at runtime. If `name` is null, it will still throw a `NullReferenceException`.*

### Misconceptions and edge cases
*   **Misconception:** "Nullable reference types prevent `NullReferenceException` at runtime."
    *   **Reality:** They only provide compile-time warnings. Reflection, deserialization, and code from "nullable-oblivious" libraries can still introduce nulls into your code.
*   **Edge Case:** `default` structs. If a struct contains a reference type field, the `default` value of that struct will contain a null reference, even if you annotated the field as non-nullable.
*   **Edge Case:** The null-forgiving operator (`!`) is a "trust me" signal to the compiler. It does not perform a runtime check.

### Knowledge checks with answers

1.  **Question:** Does `string?` create a new type at runtime?
    *   **Answer:** No. It is a compile-time annotation. `string` and `string?` are the same type at runtime.

2.  **Question:** What is the difference between `Nullable<T>.Value` and `GetValueOrDefault()`?
    *   **Answer:** `Value` throws an `InvalidOperationException` if the value is null. `GetValueOrDefault()` returns the default value of `T` (or a specified default) if the value is null.

3.  **Question:** Why would you use `[NotNullWhen(true)]` on a method parameter?
    *   **Answer:** To tell the compiler that if the method returns `true`, the specified parameter is guaranteed to be non-null (e.g., in `bool TryGetValue(out T? value)`).

4.  **Question:** How do you handle nulls from external libraries that don't use nullable annotations?
    *   **Answer:** Treat them as "nullable-oblivious." Use explicit null checks (`ArgumentNullException.ThrowIfNull`) at your system boundaries to ensure safety.

*Source: [Microsoft Learn C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types)*
