<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Reference: Runtime validation, optional values, generic contracts, and boundary hazards

*Draft: Automatically generated.*

# Scope and version
This lesson covers C# 15 and .NET 11 nullability features, focusing on runtime validation, API design, and the distinction between compile-time analysis and runtime behavior. 

Source: [Microsoft Learn C# language reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-value-types), [Nullable analysis attributes](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis), [.NET 11 API reference](https://learn.microsoft.com/en-us/dotnet/api/system.argumentnullexception.throwifnull).

# How this group fits the mental model
In C#, nullability is split into two worlds:
1. **Nullable Value Types (`T?`)**: A distinct runtime type (`Nullable<T>`) that holds a value or is empty.
2. **Nullable Reference Types**: A compile-time system that uses annotations to track potential nulls.

The inventory below addresses the "boundary" problem: how to bridge the gap between compile-time safety (annotations) and runtime reality (external data, reflection, or legacy code). We use **Guard clauses** and **Input validation** to enforce contracts at runtime, ensuring that the assumptions made by the compiler are actually true when the program executes.

# Supplied names explained

* `ArgumentNullException.ThrowIfNull(Object?, String?)`: A helper method that throws an exception if the provided argument is null.
* `ObjectDisposedException.ThrowIf(Boolean, Object)`: Throws if the condition is true, indicating the object is disposed.
* `ObjectDisposedException.ThrowIf(Boolean, Type)`: Throws if the condition is true, identifying the type of the disposed object.
* `ArgumentNullException`: The exception type thrown when a null argument is passed to a method that does not accept it.
* `ArgumentException.ThrowIfNullOrEmpty(String, String?)`: Throws if a string is null or empty.
* `ArgumentException.ThrowIfNullOrWhiteSpace(String, String?)`: Throws if a string is null, empty, or whitespace.
* `ArgumentOutOfRangeException`: Exception thrown when an argument is outside the allowable range.
* `Guard clause`: A conditional check at the start of a method to validate inputs before proceeding.
* `Input validation`: The process of verifying that data meets expected criteria.
* `Boundary validation`: Checking data as it enters your system from an external source.
* `Deserialization nullability boundary`: The risk that deserialized data may contain nulls even if the type is marked as non-nullable.
* `Database nullable column mapping`: The configuration linking database nullability to C# types.
* `Nullable reference annotations are not runtime checks`: A reminder that annotations do not prevent nulls at runtime.
* `Null-forgiving operator has no runtime effect`: The `!` operator suppresses compiler warnings but does not perform a null check.
* `Null-safe operator chain`: Using `?.` to access members safely.
* `Optional parameter versus nullable parameter`: A distinction between a parameter with a default value and one that accepts `null`.
* `Optional<T> domain type`: A custom type used to represent the presence or absence of data.
* `Maybe type`: A functional programming pattern for handling optional values.
* `Try-pattern nullable output`: A method pattern (e.g., `bool TryGet(out T? value)`) that returns a status and a value.
* `out T? result`: An output parameter that may be null.
* `Dictionary.TryGetValue nullable annotation`: The specific contract for dictionary lookups.
* `FirstOrDefault nullable result`: Returns the first element or null (if reference type) or default (if value type).
* `SingleOrDefault nullable result`: Returns the single element or null/default.
* `Null object pattern`: Providing a non-null object that implements an interface to avoid null checks.
* `Sentinel value`: A specific value used to represent "no data" (e.g., -1 for an index).
* `Empty collection instead of null`: Returning `Enumerable.Empty<T>()` instead of `null` to simplify consumer logic.
* `Null object versus absent data`: The conceptual choice between a default instance and an explicit "nothing" state.
* `NotNullWhen on TryGetValue`: An attribute indicating that if the method returns true, the output parameter is not null.
* `Nullable flow annotation on external API`: Using attributes to describe nullability for code you cannot modify.
* `Nullable warning in generated code`: Warnings that occur in machine-generated files.
* `Nullable annotation mismatch`: When code behavior contradicts its nullability annotation.
* `Oblivious library boundary`: The interface between code using nullable annotations and legacy code that does not.
* `Public API nullability compatibility`: Ensuring that changes to nullability do not break existing consumers.
* `Nullability change as source compatibility issue`: A breaking change where updating nullability annotations causes compilation errors for users.
* `Nullable value type and nullable reference type distinction`: The core difference between `Nullable<T>` (runtime) and annotations (compile-time).

# Cross-item comparison
* **`Nullable<T>` vs. Nullable reference annotation**: `Nullable<T>` is a struct that exists at runtime; reference annotations are metadata for the compiler.
* **`null-forgiving operator` vs. `Runtime null check`**: The operator (`!`) tells the compiler to be quiet; a runtime check (like `ThrowIfNull`) actually validates the state.
* **`Sentinel value` vs. `Null object pattern`**: A sentinel is a "magic value" (like -1), while a Null Object is a real object that does nothing.

# Examples
```csharp
// Guard clause example
public void ProcessData(string? input)
{
    // Runtime validation
    ArgumentException.ThrowIfNullOrWhiteSpace(input, nameof(input));
    
    // Now the compiler knows 'input' is not null
    Console.WriteLine(input.Length); 
}
```

# Common mistakes
* **Assuming annotations are validation**: Adding `string?` to a parameter does not stop a caller from passing `null` at runtime. You must still use `ArgumentNullException.ThrowIfNull`.
* **Overusing the null-forgiving operator**: Using `!` to silence warnings without verifying the null state leads to `NullReferenceException` at runtime.

# Knowledge checks with answers
1. **Question**: Does the null-forgiving operator (`!`) prevent a `NullReferenceException`?
   - **Answer**: No. It only suppresses compiler warnings.
2. **Question**: Why use `ArgumentNullException.ThrowIfNull` if you have already annotated a parameter as non-nullable?
   - **Answer**: Because the annotation is only a compile-time check. External callers (or reflection) can still pass `null` at runtime.
3. **Question**: What is the difference between a `Sentinel value` and `Nullable<T>`?
   - **Answer**: A sentinel value uses a valid value (like -1) to represent "missing," while `Nullable<T>` uses a dedicated wrapper type to explicitly represent "no value."
