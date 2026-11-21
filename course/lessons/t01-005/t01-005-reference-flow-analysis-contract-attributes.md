
# C# nullability nullable value types and nullable reference analysis — Reference: Public nullability attributes for input and output flow contracts

*Draft: Automatically generated.*

# Scope and version
This lesson covers C# 15 and .NET 11 nullability analysis attributes. These features communicate null-state contracts to compiler analysis, not runtime enforcement. Current official documentation was checked on 2026-11-20.

Source: [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/attributes/nullable-analysis)

# How this group fits the mental model
Nullable reference types use compiler flow analysis and nullable metadata, not runtime enforcement. Nullable-analysis attributes refine caller/callee null-state contracts when ordinary annotations cannot express a relationship; implementations must satisfy any declared postcondition.

# Supplied names explained

* `AllowNullAttribute`: Permits callers to pass null to an input even when its annotated type is non-nullable; it does not ensure a property setter converts or handles null.
* `DisallowNullAttribute`: Warns callers against passing null to an input whose annotated type permits null; it does not add runtime rejection.
* `MaybeNullAttribute`: Allows a method return or output to be maybe-null even when its declared type is non-nullable; it doesn't mean every call returns null.
* `NotNullAttribute`: Describes a postcondition that an output is not null on normal return; it does not insert a check.
* `MaybeNullWhenAttribute`: Describes a parameter (commonly an `out` parameter) as maybe-null when the method returns the specified Boolean value. It does not mean the value must be null on that path.
* `NotNullWhenAttribute`: Describes a parameter as not-null when the method returns the specified Boolean value; commonly used with nullable input parameters and `out` values.
* `NotNullIfNotNullAttribute`: States that a return value or output is not-null when the named input parameter is not-null.
* `MemberNotNullAttribute`: Tells flow analysis that named members are not-null after the annotated method or property returns normally.
* `MemberNotNullWhenAttribute`: Tells flow analysis that named members are not-null when the annotated method returns the specified Boolean value.
* `DoesNotReturnAttribute`: Tells flow analysis that a method does not return normally; it does not make a method that returns behave as if it threw.
* `DoesNotReturnIfAttribute`: Tells flow analysis that a method does not return normally for the specified Boolean parameter value.
* `NotNullWhenAttribute.ReturnValue`: The Boolean return value for which flow analysis treats the annotated parameter as not-null; the method must uphold that condition.
* `MaybeNullWhenAttribute.ReturnValue`: The Boolean return value for which flow analysis treats the annotated output as maybe-null; it does not require null on that path.
* `NotNullIfNotNullAttribute.ParameterName`: The name of the parameter that determines the null-state postcondition for a return value or output.
* `MemberNotNullAttribute.Members`: Names of fields/properties asserted not-null after normal return; the implementation must establish that condition.
* `MemberNotNullWhenAttribute.ReturnValue`: The Boolean value for which flow analysis treats listed members as not-null, subject to the method honoring that postcondition.
* `MemberNotNullWhenAttribute.Members`: Names of fields/properties asserted not-null when the Boolean return matches its configured value.
* `AllowNull on property setter`: Applying the input contract to permit a null assignment even when the property's getter type is non-nullable; the setter must define its behavior.
* `DisallowNull on property setter`: Applying the input contract to warn when null is assigned even though the property's getter type permits null.
* `MaybeNull on return value`: Applying the attribute to a method return to describe a maybe-null result despite a non-nullable annotation.
* `NotNull on return value`: Applying the attribute to a method return as a postcondition; implementation must honor it.
* `MaybeNullWhen on out parameter`: Describes when an `out` value may be null based on the Boolean return.
* `NotNullWhen on Boolean return`: Describes that an input/output parameter is not null for one selected Boolean result, not necessarily for both results.
* `NotNullIfNotNull on dependent return`: Describes that the return is non-null when the named input is non-null; the implementation must satisfy that relationship.
* `MemberNotNull after helper call`: Applying `MemberNotNull` to a helper that establishes named members before normal return; callers still need runtime validation if those values can be corrupted or externally mutated.
* `DoesNotReturn on throw helper`: Marking a helper that does not return normally so flow analysis treats subsequent code as unreachable on that path; it does not itself cause an exception.
* `DoesNotReturnIf on conditional assertion`: Describes that a helper does not return normally for a configured Boolean argument value; implementation must match.
* `Conditional postcondition`: A documented/annotated claim about output or state after a method returns; attributes inform analysis but do not enforce truth at runtime.
* `Conditional precondition`: A documented/annotated input contract whose applicability depends on the call or input state; nullable analysis attributes primarily describe caller/callee null-state relationships.
* `Nullability metadata`: The information stored in the assembly about nullability.
* `NullableAttribute (compiler-emitted metadata)`: Compiler-emitted metadata used to encode nullable annotations for signatures/elements; it is not a runtime null check.
* `NullableContextAttribute (compiler-emitted metadata)`: Compiler-emitted metadata recording a default nullable annotation context for a scope; consumers/tools can inspect it.
* `NullablePublicOnlyAttribute (compiler-emitted metadata)`: Compiler-emitted metadata indicating nullable annotations are included only for public API members for an assembly build; it is not an application-level nullability switch.

# Cross-item comparison
* **`AllowNull` vs `DisallowNull`**: These attributes adjust compile-time input contracts relative to the annotated type; neither performs runtime normalization or rejection.
* **`NotNullWhen` vs `MaybeNullWhen`**: They describe conditional null-state postconditions for parameters based on the method's Boolean return; they do not enforce those postconditions at runtime.
* **`NotNullIfNotNull`**: Maps the null-state of a named input parameter to a return-value postcondition; the implementation must honor the stated relationship.

# Examples
```csharp
using System.Diagnostics.CodeAnalysis;

// Example: Using NotNullWhen for an input parameter
public bool IsPresent([NotNullWhen(true)] string? value)
{
    return value is not null;
}
```

# Common mistakes
1. **Assuming runtime enforcement**: These attributes are for the compiler. They do not throw exceptions at runtime if you pass `null` to a method marked `[NotNull]`. You must still use `ArgumentNullException.ThrowIfNull` for runtime safety.
2. **Over-using attributes**: Use attributes when a public contract has a null-state relationship the compiler cannot infer; incorrect attributes make analysis unsound, while simple flow often needs none.
3. **Ignoring warnings**: Suppressing warnings with the null-forgiving operator (`!`) instead of using these attributes hides potential bugs rather than documenting the contract.

# Knowledge checks with answers
1. **Question**: Do these attributes perform runtime null checks?
   **Answer**: No. They affect nullable analysis and metadata only; runtime validation must be implemented separately.
2. **Question**: Which attribute should you use if a method returns `null` only when a specific input parameter is `null`?
   **Answer**: `NotNullIfNotNullAttribute`.
3. **Question**: If you mark a method with `[DoesNotReturn]`, what does the compiler assume about the code immediately following a call to that method?
   **Answer**: Flow analysis treats the call as not returning normally, so following code is unreachable on that path; the implementation must honor the annotation.
