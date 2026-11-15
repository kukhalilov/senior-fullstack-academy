<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Reference: Readability, edge cases, nullable values, and safe decision logic

*This is an automatically generated draft.*

# Scope and version
This lesson covers the design principles and best practices for C# pattern matching and user-defined operators/conversions as of C# 15 / .NET 11. It focuses on writing readable, safe, and predictable code when using these features. Memory-safety preview features are excluded. Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns).

# How this group fits the mental model
In C#, **operators** and **conversions** define how your custom types behave in mathematical or logical expressions. **Pattern matching** provides a declarative way to inspect the "shape" of data and make decisions. Together, they allow you to create types that feel like native language primitives while providing robust, readable control flow.

# Supplied names explained

* `Operator method versus named method`: Use operator overloads for natural, symmetric operations (like `+` or `==`). Use named methods (e.g., `CalculateComplexResult()`) for operations that are asymmetric, expensive, or non-intuitive.
* `Avoid surprising operator overloads`: Overloads should follow established mathematical or logical expectations. If an operation is not intuitive (e.g., adding two strings to perform a database query), use a named method instead.
* `Implicit conversion versus explicit conversion`: Implicit conversions are for safe, lossless transformations. Explicit conversions (casts) are required when a transformation might lose data or throw an exception.
* `Pattern matching versus cast and branch`: Prefer pattern matching (e.g., `is`, `switch`) over manual `(Type)obj` casting and null checks. Patterns are safer, more concise, and handle nulls gracefully.
* `Switch expression versus dictionary dispatch`: Use switch expressions for small, fixed sets of logic. Use dictionary dispatch (mapping keys to delegates) when the set of operations is large, dynamic, or needs to be modified at runtime.
* `Relational pattern range boundary`: Relational patterns (e.g., `< 10`) are inclusive or exclusive based on the operator. Always verify if your boundary logic covers the exact range intended.
* `Property pattern null behavior`: A property pattern (e.g., `{ Length: > 0 }`) implicitly fails if the object being matched is `null`.
* `List pattern length behavior`: List patterns (e.g., `[1, 2, ..]`) verify the structure and length of a collection. Ensure your pattern matches the minimum required elements.
* `Slice pattern capture behavior`: The slice pattern (`..`) captures the remaining elements in a sequence. Be mindful that this creates a new span or collection, which may have performance implications.
* `Type pattern and nullable value`: A type pattern (e.g., `x is int i`) checks the underlying type. If `x` is a `Nullable<T>`, the pattern matches the underlying value if it is not null.
* `Pattern variable scope`: Variables declared in a pattern (e.g., `case int i`) are scoped to the branch or the expression where they are defined.
* `Pattern guard evaluation`: Guards (the `when` clause) are evaluated after the pattern matches. Keep guards side-effect-free to ensure the decision logic remains predictable.
* `Checked and unchecked code review`: Always review arithmetic operations for overflow. Use `checked` blocks to enforce overflow exceptions or `unchecked` to allow wrapping.
* `Integral divide overflow edge case`: Dividing `int.MinValue` by `-1` throws an exception. Ensure your operator overloads handle these edge cases explicitly.
* `Pattern exhaustiveness versus runtime fallback`: The compiler checks if your switch expression covers all possible inputs. If it cannot prove exhaustiveness, you must provide a discard arm (`_ => ...`).
* `Switch expression over open hierarchy`: When matching against an open hierarchy (e.g., `object` or `interface`), you must account for unexpected types via a default/discard arm.
* `Switch expression over closed alternatives`: C# 15 allows exhaustive matching over closed hierarchies (e.g., specific record types). The compiler will warn you if a branch is missing.
* `Conversion side effects and evaluation order`: Conversions should be pure. Never perform I/O or modify state inside a conversion operator, as the compiler may invoke them at unpredictable times.

# Cross-item comparison
* **Implicit vs. Explicit Conversion**: Implicit is for "safe" widening; explicit is for "risky" narrowing.
* **Operator Overload vs. Named Method**: Overloads are for syntax sugar; named methods are for clarity and complex logic.
* **Switch Statement vs. Switch Expression**: Statements perform actions; expressions return values.
* **Open vs. Closed Hierarchy Matching**: Open hierarchies require a catch-all discard arm; closed hierarchies allow the compiler to enforce total coverage.

# Examples
```csharp
// Example: Pattern matching with a property pattern
// This is safe: if 'user' is null, the pattern simply fails to match.
if (user is { Age: >= 18, IsActive: true })
{
    Console.WriteLine("Access granted.");
}

// Example: Switch expression with exhaustiveness
// C# 15 allows exhaustive matching on closed hierarchies.
string status = user.Role switch
{
    AdminRole => "Full Access",
    UserRole => "Limited Access",
    _ => "No Access" // Discard arm required for safety
};
```

# Common mistakes
1. **Side effects in patterns**: Putting logic that changes state inside a `when` guard.
2. **Ignoring nulls**: Assuming an object is not null when using property patterns; remember that property patterns implicitly check for non-null.
3. **Overloading operators for non-mathematical tasks**: Using `+` for something that isn't an addition, which confuses developers.
4. **Missing discard arms**: Failing to handle all cases in a switch expression when the compiler cannot guarantee exhaustiveness.

# Knowledge checks with answers
1. **Q: When should you use an explicit conversion instead of an implicit one?**
   * A: When the conversion might result in data loss or throw an exception.
2. **Q: Does a property pattern match a null value?**
   * A: No, property patterns implicitly fail if the input is null.
3. **Q: Why should you avoid side effects in a `when` guard?**
   * A: Guards may be evaluated multiple times or in an order that is not immediately obvious; side effects make debugging difficult.
4. **Q: What is the benefit of a closed hierarchy in a switch expression?**
   * A: The compiler can verify that you have handled every possible alternative, removing the need for a default/discard arm.
