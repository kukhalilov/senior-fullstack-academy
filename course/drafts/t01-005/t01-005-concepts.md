<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Core concepts and how they fit together

*This is an automatically generated draft.*

# C# Nullability: Nullable Value Types and Nullable Reference Analysis

## Learning objectives
* Distinguish between nullable value types and nullable reference types.
* Understand how the C# compiler uses static flow analysis to track null states.
* Learn to use attributes to communicate nullability contracts in public APIs.
* Identify the limitations of compile-time analysis versus runtime validation.

## Prerequisites
* Understanding of C# types (value types vs. reference types).
* Familiarity with basic control flow (if-statements, loops).
* Basic knowledge of C# generics and attributes.

## Core concepts
In C#, "null" represents the absence of a value. However, the language treats value types (like `int`) and reference types (like `string`) differently regarding nullability.

1. **Nullable Value Types (`Nullable<T>`):** Value types cannot normally be null. By using `T?` (or `Nullable<T>`), you create a wrapper that can hold either a value of type `T` or an "empty" state. This is a distinct runtime type.
2. **Nullable Reference Types:** By default, reference types can be null. C# 8+ introduced a feature where the compiler tracks whether a reference *should* be null. This is a **compile-time annotation system**; it does not change the runtime behavior of your objects.
3. **Static Flow Analysis:** The compiler watches your code's logic (branches, assignments, method calls) to determine if a variable is currently null. If you try to access a member of a variable that the compiler believes is null, it issues a warning.

## Mechanisms and relationships
The system relies on a "contract" between the developer and the compiler.

* **Annotations:** Using `?` (e.g., `string?`) tells the compiler: "This variable is allowed to be null."
* **Warnings:** If you have nullable warnings enabled, the compiler flags code that might cause a `NullReferenceException`.
* **Null-Forgiving Operator (`!`):** This tells the compiler, "I know this is null, but trust me, it won't be." It has **no effect at runtime**.
* **Flow Analysis Attributes:** Sometimes the compiler cannot "see" that a method ensures a variable is not null. Attributes like `[NotNullWhen(true)]` allow you to explicitly define these relationships for the compiler.

## Worked examples

### 1. Nullable Value Types
```csharp
int? age = null; // Valid: Nullable<int>
if (age.HasValue) 
{
    Console.WriteLine(age.Value); // Safe access
}
int result = age.GetValueOrDefault(0); // Returns 0 if age is null
```

### 2. Nullable Reference Analysis
```csharp
#nullable enable
string? name = GetName(); // Compiler knows this might be null
if (name != null) 
{
    Console.WriteLine(name.Length); // Compiler knows name is not null here
}
// Console.WriteLine(name.Length); // Warning: Possible null reference
```

### 3. Using Flow Attributes
```csharp
public bool TryGetItem(out string? item) { ... }

// Use [NotNullWhen] to tell the compiler about the 'out' parameter
public bool TryGetItem([NotNullWhen(true)] out string? item) { ... }
```

## Misconceptions and edge cases
* **Misconception:** "Nullable reference types prevent `NullReferenceException` at runtime."
    * **Reality:** They only provide compile-time warnings. Reflection, deserialization, and code from older libraries (nullable-oblivious) can still introduce nulls at runtime.
* **Edge Case:** **Default Structs.** A struct containing a reference type field will have that field set to `null` by default, even if you marked it as non-nullable.
* **Edge Case:** **The Null-Forgiving Operator.** Using `!` does not fix a null reference; it only silences the compiler warning. If the value is actually null, your program will still crash at runtime.

## Knowledge checks with answers

1. **Question:** Does `string?` create a new type at runtime?
   * **Answer:** No. It is a compile-time annotation. At runtime, it is still just a `string`.

2. **Question:** What is the difference between `Nullable<T>.Value` and `GetValueOrDefault()`?
   * **Answer:** `Value` throws an `InvalidOperationException` if the object is null. `GetValueOrDefault()` returns the default value (or a specified one) instead of throwing.

3. **Question:** How do you handle nulls in public APIs when the compiler cannot infer the state?
   * **Answer:** Use flow-analysis attributes like `[NotNullWhen]`, `[AllowNull]`, or `[MemberNotNull]`.

4. **Question:** What is the purpose of `ArgumentNullException.ThrowIfNull(obj)`?
   * **Answer:** It provides a runtime check to ensure a parameter is not null, which helps satisfy the compiler's flow analysis and prevents invalid state early.

*Sources: [Microsoft Learn C# Nullable Reference Types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types), [Nullable Analysis Attributes](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis).*
