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
2.  **Nullable Reference Types (NRTs):** Reference types remain capable of holding null at runtime. NRT annotations are a **compile-time analysis and metadata feature**: the compiler tracks possible null states and issues warnings, but annotations do not insert runtime checks.

### Mechanisms and relationships
The system relies on a **Nullable Context**. When enabled, the compiler tracks the "null state" of variables:
*   **Not-null state:** Flow analysis treats the expression as not-null at that program point based on known information; this is not proof against mutation or external behavior.
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
    *   **Reality:** They provide compile-time diagnostics and metadata, not runtime enforcement. Reflection, deserialization, and code from nullable-oblivious libraries can still introduce nulls.
*   **Edge Case:** `default` structs. If a struct contains a reference type field, the `default` value of that struct will contain a null reference, even if you annotated the field as non-nullable.
*   **Edge Case:** The null-forgiving operator (`!`) is a "trust me" signal to the compiler. It does not perform a runtime check.

### Knowledge checks with answers

1.  **Question:** Does `string?` create a new type at runtime?
    *   **Answer:** No. The annotation affects compiler analysis and emitted nullability metadata, but does not create a distinct runtime type or automatic check.

2.  **Question:** What is the difference between `Nullable<T>.Value` and `GetValueOrDefault()`?
    *   **Answer:** `Value` throws an `InvalidOperationException` if no value is present. `GetValueOrDefault()` returns `default(T)`, or the supplied fallback overload; use a fallback only when it matches the domain meaning.

3.  **Question:** Why would you use `[NotNullWhen(true)]` on a method parameter?
    *   **Answer:** To describe the method's conditional postcondition to the compiler. For example, `[NotNullWhen(true)]` states that the annotated parameter is not null when the method returns true; the implementation must uphold that contract.

4.  **Question:** How do you handle nulls from external libraries that don't use nullable annotations?
    *   **Answer:** Treat them as "nullable-oblivious." Use explicit null checks (`ArgumentNullException.ThrowIfNull`) at your system boundaries to ensure safety.

*Source: [Microsoft Learn C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types)*
