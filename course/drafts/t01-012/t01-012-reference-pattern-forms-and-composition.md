<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Reference: Constant, type, relational, logical, recursive, and list patterns

*This is an automatically generated draft.*

# Scope and version
This lesson covers C# pattern matching forms and composition as defined in the C# 15 / .NET 11 stable specification (checked 2026-11-14). It excludes memory-safety preview features and built-in operator/conversion mechanics.

# How this group fits the mental model
Pattern matching allows you to test the "shape" of data and extract values simultaneously. Think of it as a declarative way to ask, "Does this object look like X?" If it does, you can bind parts of that object to variables for use in your logic. These patterns are the building blocks for `switch` expressions and `is` expressions, allowing you to replace complex `if-else` chains with readable, exhaustive branches.

# Supplied names explained

* `Pattern matching`: The overarching mechanism for testing values against criteria and extracting data.
* `Constant pattern`: Matches a value against a specific constant (e.g., `is 5` or `is null`).
* `Declaration pattern`: Tests if an expression is a specific type and assigns it to a new variable.
* `Var pattern`: Matches any expression and assigns it to a variable; useful for capturing intermediate results.
* `Discard pattern`: The `_` symbol; matches anything but does not assign it to a variable.
* `Type pattern`: Tests if an expression is a specific type without necessarily assigning it to a variable.
* `Parenthesized pattern`: Uses parentheses to enforce specific evaluation order in complex patterns.
* `Relational pattern`: Compares an expression to a constant using relational operators.
* `Greater-than relational pattern`: Matches if the value is `> constant`.
* `Greater-than-or-equal relational pattern`: Matches if the value is `>= constant`.
* `Less-than relational pattern`: Matches if the value is `< constant`.
* `Less-than-or-equal relational pattern`: Matches if the value is `<= constant`.
* `Logical not pattern`: The `not` keyword; inverts the result of a pattern.
* `Logical and pattern`: The `and` keyword; matches if both patterns are satisfied.
* `Logical or pattern`: The `or` keyword; matches if either pattern is satisfied.
* `Pattern combinator precedence`: The rules defining the order in which `not`, `and`, and `or` are evaluated.
* `Property pattern`: Matches an object if its properties match specified sub-patterns.
* `Extended property pattern`: Allows matching nested properties (e.g., `Person { Address.City: "London" }`).
* `Positional pattern`: Uses a type's `Deconstruct` method to match values based on their position.
* `Deconstruct pattern input`: The process of invoking a `Deconstruct` method to extract values for a positional pattern.
* `Recursive pattern`: A pattern that contains other patterns (e.g., property or positional patterns).
* `List pattern`: Matches a sequence of elements against a list or array.
* `Exact-length list pattern`: A list pattern that matches only if the sequence has a specific number of elements.
* `Slice pattern`: The `..` syntax within a list pattern to match a range of elements.
* `List pattern designation`: Assigning a variable to a list or a slice within a list pattern.
* `Indexable list pattern input`: The requirement that the input type supports indexing for list matching.
* `Span pattern input`: The ability to match against `Span<T>` or `ReadOnlySpan<T>` using list patterns.
* `Pattern variable designation`: The act of naming a variable within a pattern.
* `Pattern variable definite assignment`: The compiler's guarantee that a variable captured in a pattern is assigned before use.
* `Pattern subsumption diagnostic`: A compiler warning when a pattern is covered by a previous, more general pattern.
* `Pattern unreachable diagnostic`: A compiler warning when a branch in a switch can never be reached.
* `Pattern combinator variable consistency`: The rule that variables must be assigned consistently across all branches of a logical `or` pattern.
* `Pattern matching nullable value`: The ability to match against `Nullable<T>` types.
* `Pattern matching null`: Using `is null` or `is not null` to check for nullability.
* `Pattern matching tuple`: Matching against the structure of a tuple.
* `Pattern matching union case`: Matching against specific cases in a union type.
* `Pattern matching closed hierarchy alternative`: Matching against a specific member of a defined closed hierarchy.

# Cross-item comparison
* **Constant vs. Type vs. Var**: Constant checks a specific value; Type checks the class/struct; Var captures the value regardless of its type.
* **Property vs. Positional**: Property patterns match by name; Positional patterns match by the order defined in a `Deconstruct` method.
* **Switch statement vs. Switch expression**: Statements perform actions; expressions return a value.
* **Open vs. Closed hierarchy**: Open hierarchies require a discard arm for exhaustiveness; closed hierarchies allow the compiler to verify all cases are handled.

# Examples
```csharp
// Example: Using a property pattern and relational pattern
if (person is { Age: > 18 and < 65 } p)
{
    Console.WriteLine($"Adult: {p.Name}");
}

// Example: Using a list pattern with a slice
int[] numbers = { 1, 2, 3, 4 };
bool match = numbers is [1, .. var rest]; // rest is {2, 3, 4}
```
*Note: The code above is illustrative of pattern syntax.*

# Common mistakes
* **Ignoring Exhaustiveness**: Forgetting a discard arm (`_`) in a switch expression when the input type is an open hierarchy, leading to a runtime error.
* **Variable Scope**: Assuming a variable declared in one branch of an `or` pattern is available in the other (it is not).
* **Precedence Confusion**: Neglecting `Pattern combinator precedence`, which can lead to unexpected logic when mixing `and` and `or`.

# Knowledge checks with answers
1. **Question**: What is the difference between a `Discard pattern` and a `Var pattern`?
   **Answer**: A `Discard pattern` (`_`) ignores the value, while a `Var pattern` captures the value into a variable for later use.
2. **Question**: Why does the compiler issue a `Pattern unreachable diagnostic`?
   **Answer**: It occurs when a pattern is placed after a more general pattern that already covers all possible cases, making the subsequent pattern impossible to match.
3. **Question**: Can you use a `Slice pattern` on any type?
   **Answer**: No, the input must be an `Indexable list pattern input` (e.g., an array or `Span<T>`).

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns)*
