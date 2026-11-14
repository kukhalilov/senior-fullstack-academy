<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Reference: Public nullability attributes for input and output flow contracts

## Scope and version

*Automatically generated draft.*

This reference lesson covers the C# nullability feature set specifically tied to public nullability attributes for input and output flow contracts. 

- **Scope:** This lesson explains the exact inventory of flow analysis contract attributes, properties, and compiler-emitted metadata names defined in the manifest for `t01-005`. It focuses on how libraries communicate nullability contracts that static analysis cannot infer automatically.
- **Scope Exclusions:** Null reference, value/reference types, copying, and equality foundations are covered in `t01-004`. The full DataAnnotations validation API is outside this nullability topic. EF Core required/optional column mapping and ASP.NET Core request validation are covered in their respective tracks.
- **Version Context:** C# 15 stable and .NET 11 GA (checked November 14, 2026). .NET 11 adds asynchronous validation APIs, but these are separate and do not change nullable reference type annotations into runtime enforcement.
- **Sources:** [Microsoft Learn C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/nullable-reference-types), [Nullable Analysis Attributes](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis), and [.NET 11 Overview](https://learn.microsoft.com/en-us/dotnet/core/whats-new/dotnet-11/overview).

---

## How this group fits the mental model

In C#, nullable reference types use a compile-time static-flow-analysis system. The compiler inspects assignments, branches, and patterns to track whether a variable holds a null reference. However, the compiler's view is limited to the code visible within a scope. 

When writing reusable libraries or complex APIs, the standard rules of nullability annotations are sometimes too rigid. For instance, a property might accept `null` on assignment but always return a non-null value, or a method might return `null` only when a Boolean return parameter is `false`. 

The inventory group of **Public nullability attributes for input and output flow contracts** solves this problem. These attributes act as metadata contracts. They instruct the compiler's static analysis engine to relax or tighten assumptions about inputs and outputs across API boundaries, ensuring that library authors can express precise nullability guarantees without turning off compiler warnings globally.

---

## Supplied names explained

### Input and Output Contract Attributes
* **`AllowNullAttribute`**: Allows a non-nullable input parameter or property to be assigned `null`. Useful when a property has a non-null default or fallback value.
* **`DisallowNullAttribute`**: Requires a nullable input parameter or property to be non-null when assigned, even if its type allows nulls.
* **`MaybeNullAttribute`**: Signifies that a non-nullable return value or output might actually be `null` under certain conditions.
* **`NotNullAttribute`**: Signifies that a nullable return value or output will never be `null` under certain conditions.
* **`MaybeNullWhenAttribute`**: Specifies that a method output parameter may be `null` when the method returns a specific Boolean value.
* **`NotNullWhenAttribute`**: Specifies that a method output parameter will not be `null` when the method returns a specific Boolean value.
* **`NotNullIfNotNullAttribute`**: Specifies that a return value is non-null if and only if a specified input parameter is non-null.
* **`MemberNotNullAttribute`**: Specifies that a method or property will ensure that listed class or struct members are non-null after execution.
* **`MemberNotNullWhenAttribute`**: Specifies that the listed members will be non-null when the method returns a specific Boolean value.
* **`DoesNotReturnAttribute`**: Specifies that a method never returns (e.g., it always throws an exception).
* **`DoesNotReturnIfAttribute`**: Specifies that a method never returns if the associated Boolean parameter has a specified value.

### Attribute Properties and Member Targets
* **`NotNullWhenAttribute.ReturnValue`**: The Boolean value condition representing when the target parameter is guaranteed non-null.
* **`MaybeNullWhenAttribute.ReturnValue`**: The Boolean value condition representing when the target parameter may be `null`.
* **`NotNullIfNotNullAttribute.ParameterName`**: The name of the input parameter whose null state dictates the return value's null state.
* **`MemberNotNullAttribute.Members`**: The array of field or property names guaranteed to be initialized or non-null.
* **`MemberNotNullWhenAttribute.ReturnValue`**: The Boolean return value condition for conditional member initialization.
* **`MemberNotNullWhenAttribute.Members`**: The array of field or property names guaranteed non-null under the specified return condition.

### Usage Contexts and Language Patterns
* **`AllowNull on property setter`**: Applying `[AllowNull]` to a property setter to accept null assignments for a non-nullable property type.
* **`DisallowNull on property setter`**: Applying `[DisallowNull]` to a property setter to reject null assignments on a nullable property type.
* **`MaybeNull on return value`**: Applying `[MaybeNull]` to a return type to indicate a potential null return from a non-nullable signature.
* **`NotNull on return value`**: Applying `[NotNull]` to a return type to guarantee a non-null return from a nullable signature.
* **`MaybeNullWhen on out parameter`**: Applying `[MaybeNullWhen(bool)]` to an `out` parameter to communicate conditional nullability.
* **`NotNullWhen on Boolean return`**: Applying `[NotNullWhen(bool)]` to indicate an output is non-null when a method returns `true` or `false`.
* **`NotNullIfNotNull on dependent return`**: Applying `[NotNullIfNotNull("paramName")]` so the return value nullability mirrors a parameter.
* **`MemberNotNull after helper call`**: Using member-checking attributes to inform the compiler that helper methods successfully initialize fields.
* **`DoesNotReturn on throw helper`**: Marking custom exception-throwing methods with `[DoesNotReturn]` so flow analysis knows execution stops.
* **`DoesNotReturnIf on conditional assertion`**: Marking validation helpers with `[DoesNotReturnIf(bool)]` to halt flow analysis on specific conditions.
* **`Conditional postcondition`**: A contract guaranteeing an output state based on method outcomes.
* **`Conditional precondition`**: A contract requiring specific input states before execution proceeds.

### Compiler Metadata Infrastructure
* **`Nullability metadata`**: The underlying binary information embedded in assemblies to describe nullability annotations.
* **`NullableAttribute (compiler-emitted metadata)`**: The compiler-generated attribute used to emit type-level nullability data into assemblies.
* **`NullableContextAttribute (compiler-emitted metadata)`**: The compiler-generated attribute applied to scopes or types to indicate the active nullable context.
* **`NullablePublicOnlyAttribute (compiler-emitted metadata)`**: The compiler-emitted metadata indicator when nullable context is enabled only for public APIs.

---

## Cross-item comparison

- **`Nullable<T>` vs. `Nullable reference type annotation`**: `Nullable<T>` (`System.Nullable<T>`) is a distinct runtime value type for structs that adds a boolean presence flag. Nullable reference type annotations are compile-time static analysis markers that do not alter runtime types or create new object types.
- **`AllowNull` vs. `DisallowNull`**: `AllowNull` loosens a setter so callers can pass `null` to a non-nullable property. `DisallowNull` tightens a setter so callers cannot pass `null` to a nullable property.
- **`MaybeNullWhen` vs. `NotNullWhen`**: `MaybeNullWhen(true)` states that an output becomes `null` if the method returns `true`. `NotNullWhen(true)` states that an output becomes non-null if the method returns `true`.
- **`MemberNotNull` vs. `MemberNotNullWhen`**: `MemberNotNull` unconditionally guarantees that specified fields or properties are initialized after a method runs (common in helper methods). `MemberNotNullWhen` provides this guarantee conditionally based on a Boolean method return value.

---

## Examples

### Example 1: Conditional Postconditions with `NotNullWhen` (Unverified / Pseudocode)
```csharp
using System.Diagnostics.CodeAnalysis;

public class ResourceCache
{
    private string? _cachedData;

    // Compiler knows _cachedData is not null if TryGetData returns true.
    public bool TryGetData([NotNullWhen(true)] out string? data)
    {
        data = _cachedData;
        return data != null;
    }
}
```
*Expected result:* Callers who check `if (cache.TryGetData(out var val))` can use `val` directly as a non-nullable string inside the conditional block without triggering compiler warnings.

### Example 2: Dependent Return Nullability with `NotNullIfNotNull` (Unverified / Pseudocode)
```csharp
using System.Diagnostics.CodeAnalysis;

public static class StringUtils
{
    [return: NotNullIfNotNull(nameof(input))]
    public static string? Transform(string? input)
    {
        return input?.ToUpperInvariant();
    }
}
```
*Expected result:* If a caller passes a non-null string, the compiler treats the return value as non-null. If the caller passes `null`, the compiler recognizes the return value may be `null`.

---

## Common mistakes

* **Expecting runtime enforcement:** Believing that applying `[DisallowNull]` or `[NotNull]` throws an immediate exception when `null` is encountered. These attributes are instructions for the static analysis compiler, not runtime guards. Explicit checks like `ArgumentNullException.ThrowIfNull` are still required for runtime safety.
* **Misunderstanding `NotNullWhen` polarity:** Applying `[NotNullWhen(true)]` when a method actually guarantees a non-null output only when it returns `false`. This leads to false confidence and unexpected null reference warnings or runtime faults.
* **Overusing the null-forgiving operator (`!`) instead of attributes:** Suppressing compiler warnings manually with `!` everywhere rather than correctly modeling API contracts using `NotNullIfNotNull` or `AllowNull`.

---

## Knowledge checks with answers

1. **Question:** What is the primary operational difference between `Nullable<T>` and a nullable reference type annotation?
   * **Answer:** `Nullable<T>` represents a distinct runtime value type (`System.Nullable<T>`) for value types. A nullable reference type annotation is strictly a compile-time static analysis and annotation feature that does not create a new runtime type.
2. **Question:** When should you use `NotNullIfNotNullAttribute`?
   * **Answer:** Use it when a method's return value should be treated as non-null if and only if a specific input parameter is non-null.
3. **Question:** Do flow-analysis contract attributes perform automatic runtime null validation?
   * **Answer:** No. They are read by the compiler during static analysis to guide warnings and contracts; they do not emit runtime exception checks.
