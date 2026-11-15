<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Reference: Parameter passing, optionality, argument names, and overload resolution

# Scope and version
This reference lesson covers parameter passing, optionality, argument names, and overload resolution under the C# 15 / .NET 11 stable member declarations edition (with C# 13 and C# 14 release changes checked on 2026-11-14). 

*Scope boundary notice:* This is an automatically generated draft reference lesson focusing strictly on the assigned inventory group (`parameters-and-call-binding`). Generic constraints, variance, delegates, operators, and type construction shapes belong to separate scopes. All citations below reference the official Microsoft C# language reference and release notes (`https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters`, `https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/params`, `https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution`, `https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13`, `https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14`, `https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15`).

# How this group fits the mental model
Methods represent actions, and parameters define how values cross a call boundary. When a caller invokes a method, C# evaluates arguments and maps them to parameters using positional or named syntax. The compiler then uses overload resolution to pick the best candidate method signature based on types, modifiers, and conversions. Parameter modifiers (`ref`, `out`, `in`, `params`, etc.) dictate whether storage locations or copies are passed, while contextual attributes inject caller metadata automatically.

# Supplied names explained
Every item in the parameter and call-binding inventory is detailed below, connecting its behavior directly to the broader method invocation model:

* `Value parameter`
  Passes a copy of the argument value into the method. Modifications to the parameter inside the method do not affect the original variable in the caller. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `ref parameter`
  Passes an argument by reference, meaning the parameter acts as an alias to the caller's storage location. The variable must be initialized before it is passed, and the method can read or write to it. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `out parameter`
  Passes an argument by reference for output purposes. The caller is not required to initialize the variable before passing it, but the called method must assign a value to it before returning. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `in parameter`
  Passes an argument by reference with a guarantee that the called method cannot modify it. This avoids copying large structs while preserving read-only safety. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `ref readonly parameter`
  Combines reference passing with immutability, allowing large structures to be passed by reference without allowing the method to modify the underlying storage location. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `params parameter array`
  Allows a method to accept a variable number of arguments by packing them into a single array parameter. Must be the final parameter in the signature. Source: [Microsoft C# Params Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/params).
* `params parameter collection`
  Extended in C# 13 to accept supported collection types beyond simple arrays (such as `ReadOnlySpan<T>` or custom collections), reducing allocations. Source: [Microsoft C# What's New in C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13).
* `scoped parameter`
  Restricts the lifetime of a reference parameter (`ref`, `in`, or `out`) to ensure it cannot escape outside its permitted context or allocation scope. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Optional parameter`
  A parameter defined with a default value, allowing callers to omit the corresponding argument during invocation. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Default parameter value`
  The constant compile-time value supplied for an optional parameter when no explicit argument is provided by the caller. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Named argument`
  An argument specified by explicitly naming the target parameter (e.g., `paramName: value`), allowing arguments to be passed independently of parameter position. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Positional argument`
  An argument matched to a parameter strictly by its sequential position in the argument list. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Named and positional argument ordering`
  The syntactic rule stating that all positional arguments must appear before any named arguments in a method call. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Argument evaluation order`
  The deterministic left-to-right rule by which the compiler evaluates argument expressions before the method execution begins. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Parameter default constant`
  A compile-time constant expression required as the default value for an optional parameter. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Overload resolution`
  The compiler process that analyzes a method call and selects the single best matching candidate method from a set of overloads. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `Candidate member`
  A method member that is accessible and shares the requested name, making it eligible for consideration during overload resolution. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `Applicable function member`
  A candidate member whose parameters can all be successfully matched to the arguments provided at the call site using implicit conversions. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `Better function member`
  The classification step in overload resolution that determines which applicable member has more specific or better argument conversions than other candidates. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `Implicit conversion ranking`
  The rules used by the compiler to decide whether one implicit conversion is better than another when comparing overload candidates. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `Generic type inference`
  The mechanism where the compiler deduces type arguments for a generic method based on the types of the arguments passed to its parameters. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `Method group conversion`
  The conversion of a method name directly into a compatible delegate type instance, participating in overload resolution if multiple overloads match the delegate signature. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `Optional argument overload ambiguity`
  A compilation error that occurs when optional parameters make multiple overload candidates equally applicable, preventing the compiler from choosing a single best method. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `Named argument overload ambiguity`
  A compilation error triggered when named arguments interact with optional parameters or conversions in a way that matches multiple conflicting overloads. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `ref versus out signature distinction`
  The rule governing whether two method signatures can differ solely by using `ref` instead of `out`, ensuring correct compile-time resolution. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Parameter array expansion`
  The compiler translation step that packs individual arguments into an array when calling a method with a traditional `params` array parameter. Source: [Microsoft C# Params Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/params).
* `params collection expansion`
  The C# 13 compilation step that expands or packages call-site arguments into the targeted collection type for a `params collection` parameter. Source: [Microsoft C# What's New in C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13).
* `CallerArgumentExpressionAttribute`
  An attribute that captures the expression text passed as an argument into a string parameter, useful for diagnostics and assertions. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `CallerMemberNameAttribute`
  An attribute that automatically injects the name of the calling member (property or method) into an optional string parameter. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `CallerFilePathAttribute`
  An attribute that automatically supplies the full path of the source file containing the call site. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `CallerLineNumberAttribute`
  An attribute that automatically supplies the source line number where the method invocation occurs. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `InterpolatedStringHandlerArgumentAttribute`
  An attribute used on custom interpolated string handlers to pass additional method parameters into the builder constructor. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).

# Cross-item comparison
* **Value parameter vs. ref/out/in parameters**: Value parameters copy data across the call boundary, ensuring isolation. Reference parameters (`ref`, `out`, `in`, `ref readonly`) avoid copying or enable direct mutation of caller state, requiring careful handling of storage locations.
* **Params array vs. params collection**: Traditional `params` parameters restrict collection expansion strictly to arrays. C# 13 expands this mechanism to support general collection types for improved performance and flexibility [Microsoft C# What's New in C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13).
* **Positional vs. Named arguments**: Positional arguments rely strictly on declaration sequence, while named arguments rely on parameter identifiers, permitting flexible ordering as long as positional arguments precede named ones.

# Examples
The following unverified pseudocode snippet demonstrates parameter passing modifiers and optional metadata attributes in a valid C# structure:

```csharp
// Unverified pseudocode
public class Logger
{
    public void LogMessage(
        string message, 
        [CallerMemberName] string memberName = "", 
        [CallerLineNumber] int lineNumber = 0)
    {
        // Method processes caller-injected metadata
    }

    public void Compute(ref int value, out bool success)
    {
        value++;
        success = true;
    }
}
```
*Expected result*: The compiler binds `LogMessage` calls using default parameter values and caller attributes automatically, while `Compute` requires the caller to pass an initialized variable via `ref` and an uninitialized variable via `out`.

# Common mistakes
* **Passing uninitialized `ref` variables**: Unlike `out` parameters, a `ref` parameter requires the variable to be fully assigned before the method call.
* **Violating argument ordering**: Placing positional arguments after named arguments produces a compile-time syntax error.
* **Creating overload ambiguities**: Providing too many optional parameters or similar conversions can cause the compiler to report an ambiguity error during overload resolution.

# Knowledge checks with answers
1. **Question**: What is the key difference between a `ref` parameter and an `out` parameter regarding caller initialization?
   * **Answer**: A `ref` parameter requires the caller's variable to be initialized before the call, whereas an `out` parameter does not require prior initialization but mandates that the called method assign it before returning [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
2. **Question**: Which language version expanded `params` parameters beyond simple arrays?
   * **Answer**: C# 13 extended `params` parameters to support specified collection types [Microsoft C# What's New in C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13).
3. **Question**: What rule governs the mixing of positional and named arguments in a call?
   * **Answer**: All positional arguments must appear before any named arguments in the argument list.
