<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# properties indexers fields methods parameters and overloads — Reference: Parameter passing, optionality, argument names, and overload resolution

# Scope and version
This reference lesson covers parameter passing, optionality, argument names, and overload resolution under the C# 15 / .NET 11 stable member declarations edition (with C# 13 and C# 14 release changes checked on 2026-11-17).

*Scope boundary notice:* This is an automatically generated draft reference lesson focusing strictly on the assigned inventory group (`parameters-and-call-binding`). Generic constraints, variance, delegates, operators, and type construction shapes belong to separate scopes. All citations below reference the official Microsoft C# language reference and release notes (`https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters`, `https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/params`, `https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution`, `https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13`, `https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-14`, `https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15`).

# How this group fits the mental model
Methods represent actions, and parameters define how values cross a call boundary. When a caller invokes a method, C# evaluates arguments and maps them to parameters using positional or named syntax. The compiler then uses overload resolution to pick the best candidate method signature based on types, modifiers, and conversions. Parameter modifiers (`ref`, `out`, `in`, `params`, etc.) dictate whether storage locations or copies are passed, while contextual attributes inject caller metadata automatically.

# Supplied names explained
Every item in the parameter and call-binding inventory is detailed below, connecting its behavior directly to the broader method invocation model:

* `Value parameter`
  Passes the argument value by value. For a value type, the parameter has value-copy semantics; for a reference type, the copied value is a reference, so the method can still mutate the referenced object even though it can't reassign the caller's variable. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `ref parameter`
  Passes an argument by reference, meaning the parameter acts as an alias to the caller's storage location. The variable must be initialized before it is passed, and the method can read or write to it. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `out parameter`
  Passes an argument by reference for output purposes. The caller is not required to initialize the variable before passing it, but the called method must assign a value to it before returning. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `in parameter`
  Declares a readonly reference parameter: the method can't reassign the parameter, but referenced objects can still be mutated. The compiler may use a temporary for non-variable arguments or conversions, so it doesn't guarantee avoiding copies. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `ref readonly parameter`
  Declares a readonly by-reference parameter. It requires an argument that denotes a variable for true by-reference use; call-site `ref`/`in` modifiers communicate that intent, and omission can produce a warning or temporary for expressions. It prevents reassignment of the parameter, not mutation through referenced objects. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `params parameter array`
  Allows a method to accept a variable number of arguments by packing them into a single array parameter. Must be the final parameter in the signature. Source: [Microsoft C# Params Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/params).
* `params parameter collection`
  C# 13 allows params with arrays, Span<T>, ReadOnlySpan<T>, specified interfaces, and recognized collection types with an Add method. Interface targets use compiler-generated storage; do not infer allocation-free behavior generally. Source: [Microsoft C# What's New in C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13).
* `scoped parameter`
  Restricts the parameter's ref-safe-context so the reference or ref-like value can't escape beyond the permitted scope. It isn't a general wall-clock lifetime or a guarantee about heap/stack location. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Optional parameter`
  A parameter defined with a default value, allowing callers to omit the corresponding argument during invocation. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Default parameter value`
  The compile-time default used when an optional argument is omitted. Depending on language rules, a default can be a constant, `default(T)` for a value type, or `new T()` for a value type; optional parameters must follow required parameters. Omitted defaults are generally embedded by the caller at compile time, which matters when versioning libraries. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Named argument`
  An argument specified by explicitly naming the target parameter (e.g., `paramName: value`), allowing arguments to be passed independently of parameter position. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Positional argument`
  An argument matched to a parameter strictly by its sequential position in the argument list. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Named and positional argument ordering`
  Positional arguments can follow named arguments only when each preceding named argument is in its correct parameter position. An out-of-position named argument can't be followed by a positional argument; C# 7.2 relaxed the older blanket ordering rule. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Argument evaluation order`
  C# evaluates argument expressions in textual left-to-right order before the invocation, even when named arguments appear in a different parameter order. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Parameter default constant`
  A compile-time constant expression required as the default value for an optional parameter. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `Overload resolution`
  The compiler process that performs member lookup, determines applicable function members, and chooses a unique best member under language-defined rules; otherwise it reports no applicable member or ambiguity. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
* `Candidate member`
  A function member found during the language-defined member lookup and considered by overload resolution; accessibility and applicability are evaluated by the relevant rules, so this is more than every accessible member with the same name. Source: [Microsoft C# Overload Resolution Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/compiler-messages/overload-resolution).
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
  In expanded form, the compiler collects the supplied arguments into the parameter array; callers may also pass an array directly in normal form. Source: [Microsoft C# Params Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/params).
* `params collection expansion`
  For a params collection parameter, C# supports normal form (an existing compatible collection value) and expanded form (individual arguments collected into the target type using its supported construction pattern). Source: [Microsoft C# What's New in C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13).
* `CallerArgumentExpressionAttribute`
  An attribute that requests compiler-supplied source text for an associated argument expression in an optional string parameter, useful for diagnostics. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `CallerMemberNameAttribute`
  An attribute that automatically injects the name of the calling member (property or method) into an optional string parameter. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `CallerFilePathAttribute`
  An attribute that requests compiler-supplied file path metadata for the caller source location; it is source-compilation metadata, not a runtime stack inspection. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `CallerLineNumberAttribute`
  An attribute that requests compiler-supplied line-number metadata for the caller source location. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
* `InterpolatedStringHandlerArgumentAttribute`
  An attribute on a parameter using a custom interpolated string handler that tells the compiler which other arguments are passed to the handler constructor. Source: [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).

# Cross-item comparison
* **Value parameter vs. ref/out/in parameters**: Value parameters copy the argument value (a reference-type value is itself a reference, so the referenced object can still be mutated). By-reference parameters alias caller storage with distinct rules; in and ref readonly do not make referenced objects immutable.
* **Params array vs. params collection**: Traditional params parameters use an array. C# 13 also permits recognized collection targets; call shape, target type and construction determine allocation, so this is not inherently faster [Microsoft C# What's New in C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13).
* **Positional vs. Named arguments**: Positional arguments rely on declaration sequence; named arguments identify parameters. Positional arguments may follow correctly positioned named arguments, but cannot follow an out-of-position named argument.

# Examples
The following unverified pseudocode snippet demonstrates parameter passing modifiers and optional metadata attributes in a valid C# structure:

```csharp
// Caller information and by-reference examples
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
* **Violating argument ordering**: C# 7.2 permits positional arguments after in-position named arguments; a positional argument cannot follow an out-of-position named argument.
* **Creating overload ambiguities**: Providing too many optional parameters or similar conversions can cause the compiler to report an ambiguity error during overload resolution.

# Knowledge checks with answers
1. **Question**: What is the key difference between a `ref` parameter and an `out` parameter regarding caller initialization?
   * **Answer**: A `ref` parameter requires the caller's variable to be initialized before the call, whereas an `out` parameter does not require prior initialization but mandates that the called method assign it before returning [Microsoft C# Method Parameters Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/keywords/method-parameters).
2. **Question**: Which language version expanded `params` parameters beyond simple arrays?
   * **Answer**: C# 13 extended `params` parameters to support specified collection types [Microsoft C# What's New in C# 13](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-13).
  3. **Question**: What rule governs the mixing of positional and named arguments in a call?
   * **Answer**: Positional arguments can follow named arguments only when the preceding named arguments are in their corresponding parameter positions; positional arguments can't follow an out-of-position named argument.
