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

* `ArgumentNullException.ThrowIfNull(Object?, String?)`: Throws `ArgumentNullException` when the argument is null; the parameter name may be inferred by the compiler when omitted.
* `ObjectDisposedException.ThrowIf(Boolean, Object)`: Throws `ObjectDisposedException` when its condition is true, using the supplied object instance for exception context.
* `ObjectDisposedException.ThrowIf(Boolean, Type)`: Throws `ObjectDisposedException` when its condition is true, using the supplied type for exception context.
* `ArgumentNullException`: An exception commonly used when an argument violates a method's non-null input contract; the runtime doesn't infer that contract solely from nullable annotations.
* `ArgumentException.ThrowIfNullOrEmpty(String, String?)`: Throws `ArgumentNullException` for null and `ArgumentException` for an empty string.
* `ArgumentException.ThrowIfNullOrWhiteSpace(String, String?)`: Throws `ArgumentNullException` for null and `ArgumentException` for empty or whitespace-only input.
* `ArgumentOutOfRangeException`: Exception thrown when an argument is outside the allowable range.
* `Guard clause`: A conditional check at the start of a method to validate inputs before proceeding.
* `Input validation`: The process of verifying that data meets expected criteria.
* `Boundary validation`: Validating shape and domain constraints when data crosses a trust boundary; null checks alone do not validate all input requirements.
* `Deserialization nullability boundary`: The risk that deserialized data may contain nulls even if the type is marked as non-nullable.
* `Database nullable column mapping`: A data-access mapping between database column nullability and application types; provider/ORM configuration and schema determine behavior, not C# nullable annotations alone.
* `Nullable reference annotations are not runtime checks`: A reminder that annotations do not prevent nulls at runtime.
* `Null-forgiving operator has no runtime effect`: The `!` operator suppresses compiler warnings but does not perform a null check.
* `Null-safe operator chain`: Using `?.` to skip member/index access when a receiver is null; it does not catch exceptions thrown by a called member or by indexing a non-null collection.
* `Optional parameter versus nullable parameter`: An optional parameter can be omitted at the call site due to a default value; a nullable parameter accepts null. These are independent properties.
* `Optional<T> domain type`: A custom type used to represent the presence or absence of data.
* `Maybe type`: A functional programming pattern for handling optional values.
* `Try-pattern nullable output`: A method pattern (for example, `bool TryGet(out T? value)`) that returns a status and output; the meaning of false/null and nullable postconditions are defined by that method's contract.
* `out T? result`: An output parameter whose nullable annotation permits a null result; success/failure semantics depend on the API contract.
* `Dictionary.TryGetValue nullable annotation`: With nullable annotations, the out value's null state is conditional on the Boolean result and TValue's annotation; verify the overload contract rather than assuming every successful lookup proves a non-null value.
* `FirstOrDefault nullable result`: Returns the first element or default(T) when empty. With nullable annotations, the reference-type overload may return maybe-null; for value types it returns default(T), which is not necessarily a meaningful sentinel.
* `SingleOrDefault nullable result`: Returns the only element or default(T) when empty; throws if more than one element exists. Reference-type annotations may express a maybe-null result; value types yield default(T).
* `Null object pattern`: Providing a non-null implementation with benign/no-op behavior where that behavior is semantically valid; it is not a universal replacement for representing absent data.
* `Sentinel value`: A chosen in-band value (such as -1) used to signal absence; it is safe only when that value cannot be a valid result or the ambiguity is otherwise resolved.
* `Empty collection instead of null`: Returning an empty collection when empty and absent have the same domain meaning; otherwise preserve the distinction explicitly.
* `Null object versus absent data`: The conceptual choice between a default instance and an explicit "nothing" state.
* `NotNullWhen on TryGetValue`: A conditional nullable-flow contract; whether successful dictionary lookup implies non-null depends on TValue annotations and the specific API signature.
* `Nullable flow annotation on external API`: Using attributes to describe nullability for code you cannot modify.
* `Nullable warning in generated code`: Nullable diagnostics in generated source; generator output, generated-code classification, and project/compiler settings affect whether/how warnings are reported.
* `Nullable annotation mismatch`: When code behavior contradicts its nullability annotation.
* `Oblivious library boundary`: The interface between code using nullable annotations and legacy code that does not.
* `Public API nullability compatibility`: Considering source-analysis and metadata compatibility when changing a public API's nullability annotations; effects depend on consumer compiler settings and usage.
* `Nullability change as source compatibility issue`: Tightening an annotation can introduce new warnings (or build failures when warnings are errors) for consumers; ordinary annotation changes generally don't change CLR signatures, but can affect metadata and source analysis.
* `Nullable value type and nullable reference type distinction`: The core difference between `Nullable<T>` (runtime) and annotations (compile-time).

# Cross-item comparison
* **`Nullable<T>` vs. Nullable reference annotation**: `Nullable<T>` is a distinct runtime value type; reference annotations influence analysis and emitted nullable metadata without adding a distinct runtime type.
* **`null-forgiving operator` vs. `Runtime null check`**: The operator suppresses nullable-flow warnings for an expression; a runtime check (like `ThrowIfNull`) validates the value.
* **`Sentinel value` vs. `Null object pattern`**: A sentinel encodes absence in a value and can collide with valid values; a Null Object is a behavior-bearing substitute appropriate only when its behavior matches the domain.

# Examples
```csharp
// Guard clause example
public void ProcessData(string? input)
{
    // Runtime validation
    ArgumentException.ThrowIfNullOrWhiteSpace(input);
    
    // The API's nullable annotations let flow analysis treat input as non-null after the guard.
    Console.WriteLine(input.Length); 
}
```

# Common mistakes
* **Assuming annotations are validation**: Adding `string?` to a parameter does not stop callers from passing null; add a runtime guard only when the API contract requires non-null input.
* **Overusing the null-forgiving operator**: Using `!` to silence warnings without verifying the null state leads to `NullReferenceException` at runtime.

# Knowledge checks with answers
1. **Question**: Does the null-forgiving operator (`!`) prevent a `NullReferenceException`?
   - **Answer**: No. It only suppresses compiler warnings.
2. **Question**: Why use `ArgumentNullException.ThrowIfNull` if you have already annotated a parameter as non-nullable?
   - **Answer**: Because the annotation is only a compile-time check. External callers (or reflection) can still pass `null` at runtime.
3. **Question**: What is the difference between a `Sentinel value` and `Nullable<T>`?
   - **Answer**: A sentinel value uses a valid value (like -1) to represent "missing," while `Nullable<T>` uses a dedicated wrapper type to explicitly represent "no value."
