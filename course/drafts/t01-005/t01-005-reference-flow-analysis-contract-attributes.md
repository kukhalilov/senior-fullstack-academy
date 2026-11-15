<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# nullability nullable value types and nullable reference analysis — Reference: Public nullability attributes for input and output flow contracts

*Draft: Automatically generated.*

# Scope and version
This lesson covers C# 15 and .NET 11 nullability analysis attributes. These features provide a way to communicate nullability contracts to the compiler's static flow analysis engine. All information is based on the C# 15 and .NET 11 GA release (checked 2026-11-14).

Source: [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis)

# How this group fits the mental model
In C#, nullable reference types are a compile-time system. The compiler tracks the "null state" of variables through your code. However, the compiler cannot always see inside external libraries or complex logic. These attributes act as "hints" or "contracts" that tell the compiler: "I know this might look null, but it isn't," or "This method will only return null if the input was null." They bridge the gap between your code's logic and the compiler's static analysis.

# Supplied names explained

* `AllowNullAttribute`: Used on a property or field to indicate that while the type is non-nullable, the caller is allowed to pass `null` (the setter handles it).
* `DisallowNullAttribute`: Used on a property or field to indicate that while the type is nullable, the caller should not pass `null`.
* `MaybeNullAttribute`: Indicates that a return value or field might be `null` even if the type is marked as non-nullable.
* `NotNullAttribute`: Indicates that a return value or field will never be `null`, even if the type is marked as nullable.
* `MaybeNullWhenAttribute`: Used on a parameter to indicate that the argument might be `null` when the method returns a specific `bool` value.
* `NotNullWhenAttribute`: Used on a parameter to indicate that the argument will not be `null` when the method returns a specific `bool` value.
* `NotNullIfNotNullAttribute`: Indicates that the return value is non-null if the specified argument is non-null.
* `MemberNotNullAttribute`: Indicates that the method ensures specific fields or properties are not null upon return.
* `MemberNotNullWhenAttribute`: Indicates that the method ensures specific fields or properties are not null when it returns a specific `bool` value.
* `DoesNotReturnAttribute`: Indicates that a method never returns (e.g., it always throws an exception).
* `DoesNotReturnIfAttribute`: Indicates that a method never returns if the associated boolean parameter has a specific value.
* `NotNullWhenAttribute.ReturnValue`: The boolean value that indicates the parameter is not null.
* `MaybeNullWhenAttribute.ReturnValue`: The boolean value that indicates the parameter might be null.
* `NotNullIfNotNullAttribute.ParameterName`: The name of the parameter that determines the nullability of the return.
* `MemberNotNullAttribute.Members`: The list of fields or properties guaranteed to be non-null.
* `MemberNotNullWhenAttribute.ReturnValue`: The boolean value that triggers the member nullability guarantee.
* `MemberNotNullWhenAttribute.Members`: The list of fields or properties guaranteed to be non-null if the return matches the value.
* `AllowNull on property setter`: Applying the attribute to a setter to permit null inputs for non-nullable types.
* `DisallowNull on property setter`: Applying the attribute to a setter to forbid null inputs for nullable types.
* `MaybeNull on return value`: Applying the attribute to a method return to signal potential nullability.
* `NotNull on return value`: Applying the attribute to a method return to guarantee a non-null result.
* `MaybeNullWhen on out parameter`: Using the attribute to describe the state of an `out` parameter based on the method's boolean result.
* `NotNullWhen on Boolean return`: Using the attribute to inform the compiler that a `true` or `false` return implies a non-null argument.
* `NotNullIfNotNull on dependent return`: Linking the nullability of a return value to an input parameter.
* `MemberNotNull after helper call`: Using the attribute to inform the compiler that a helper method initialized specific members.
* `DoesNotReturn on throw helper`: Marking custom exception-throwing methods so the compiler knows code following the call is unreachable.
* `DoesNotReturnIf on conditional assertion`: Marking methods that throw only if a condition is met.
* `Conditional postcondition`: A contract describing the state of data after a method finishes.
* `Conditional precondition`: A contract describing the required state of data before a method starts.
* `Nullability metadata`: The information stored in the assembly about nullability.
* `NullableAttribute (compiler-emitted metadata)`: Internal attribute used by the compiler to store nullability state.
* `NullableContextAttribute (compiler-emitted metadata)`: Internal attribute defining the default nullability context for a scope.
* `NullablePublicOnlyAttribute (compiler-emitted metadata)`: Internal attribute indicating only public members have nullability metadata.

# Cross-item comparison
* **`AllowNull` vs `DisallowNull`**: `AllowNull` makes a non-nullable type accept `null` (useful for lazy initialization); `DisallowNull` makes a nullable type reject `null` (useful for validation).
* **`NotNullWhen` vs `MaybeNullWhen`**: These are used on parameters to describe the state of that parameter based on the method's return value (e.g., `bool TryGet(out T value)`).
* **`NotNullIfNotNull`**: This is a powerful tool for mapping input nullability to output nullability, commonly used in string manipulation methods.

# Examples
```csharp
// Example: Using NotNullWhen
public bool TryGetValue(string key, [NotNullWhen(true)] out string? value)
{
    // If this returns true, the compiler knows 'value' is not null.
    // If this returns false, the compiler knows 'value' might be null.
    // ... logic ...
}
```

# Common mistakes
1. **Assuming runtime enforcement**: These attributes are for the compiler. They do not throw exceptions at runtime if you pass `null` to a method marked `[NotNull]`. You must still use `ArgumentNullException.ThrowIfNull` for runtime safety.
2. **Over-using attributes**: Only use these when the compiler's default analysis is insufficient. Simple code usually does not need them.
3. **Ignoring warnings**: Suppressing warnings with the null-forgiving operator (`!`) instead of using these attributes hides potential bugs rather than documenting the contract.

# Knowledge checks with answers
1. **Question**: Do these attributes perform runtime null checks?
   **Answer**: No. They are strictly for compile-time static flow analysis.
2. **Question**: Which attribute should you use if a method returns `null` only when a specific input parameter is `null`?
   **Answer**: `NotNullIfNotNullAttribute`.
3. **Question**: If you mark a method with `[DoesNotReturn]`, what does the compiler assume about the code immediately following a call to that method?
   **Answer**: The compiler assumes that code is unreachable.
