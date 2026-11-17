<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Reference: Constant, type, relational, logical, recursive, and list patterns

*This is an automatically generated draft.*

# Scope and version
This lesson covers C# pattern matching forms and composition as defined in the C# 15 / .NET 11 stable specification (checked 2026-11-17). It excludes memory-safety preview features and built-in operator/conversion mechanics.

# How this group fits the mental model
Pattern matching allows you to test the "shape" of data and extract values simultaneously. Think of it as a declarative way to ask, "Does this object look like X?" If it does, you can bind parts of that object to variables for use in your logic. These patterns are the building blocks for `switch` expressions and `is` expressions, allowing you to replace complex `if-else` chains with readable, exhaustive branches.

# Supplied names explained

* `Pattern matching`: The overarching mechanism for testing values against criteria and extracting data.
* `Constant pattern`: Matches a value against a specific constant (e.g., `is 5` or `is null`).
* `Declaration pattern`: Tests if an expression is a specific type and assigns it to a new variable.
* `Var pattern`: Matches any expression and assigns it to a variable; useful for capturing intermediate results.
* `Discard pattern`: The `_` symbol; matches anything but does not assign it to a variable.
* `Type pattern`: Tests if an expression is a specific type without necessarily assigning it to a variable.
* `Parenthesized pattern`: Uses parentheses to group a pattern and override the precedence of `not`, `and`, and `or`; it does not define general member-evaluation order.
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
* `List pattern`: Matches an indexable, countable input by checking length/count and matching indexed elements; arrays, strings, spans, and suitable custom types are supported.
* `Exact-length list pattern`: A list pattern that matches only if the sequence has a specific number of elements.
* `Slice pattern`: The `..` syntax within a list pattern to match a range of elements.
* `List pattern designation`: Assigning a variable to a list or a slice within a list pattern.
* `Indexable list pattern input`: The compile-time type must expose an accessible `Length` or `Count` and indexing by `Index` or a single `int` parameter, according to pattern rules.
* `Span pattern input`: Span and read-only span support list patterns when their compile-time type exposes the required count/index operations.
* `Pattern variable designation`: The act of naming a variable within a pattern.
* `Pattern variable definite assignment`: The compiler's guarantee that a variable captured in a pattern is assigned before use.
* `Pattern subsumption diagnostic`: A compiler diagnostic for a pattern made unreachable by prior coverage; severity and exact cases depend on the pattern construct.
* `Pattern unreachable diagnostic`: A compiler diagnostic for a pattern/arm that cannot be reached because earlier patterns subsume it; exact diagnostic and severity depend on context.
* `Pattern combinator variable consistency`: The rule that variables must be assigned consistently across all branches of a logical `or` pattern.
* `Pattern matching nullable value`: Nullable value types can be tested and unwrapped by type/declaration patterns; a pattern fails when a nullable has no value except `null`/`not null` patterns handle that state explicitly.
* `Pattern matching null`: Using `is null` or `is not null` to check for nullability.
* `Pattern matching tuple`: Matching against the structure of a tuple.
* `Pattern matching union case`: Type/declaration patterns over a union match its contained case value; `var` and discard patterns match the union instance itself.
* `Pattern matching closed hierarchy alternative`: Matching a known direct subtype of a C# 15 `closed` class; a switch can be exhaustive when its cases cover the compiler-recognized hierarchy.

# Cross-item comparison
* **Constant vs. Type vs. Var**: Constant checks a specific value; Type checks the class/struct; Var captures the value regardless of its type.
* **Property vs. Positional**: Property patterns match by name; Positional patterns match by the order defined in a `Deconstruct` method.
* **Switch statement vs. Switch expression**: Statements perform actions; expressions return a value.
* **Open vs. Closed hierarchy**: Switch expressions over open hierarchies may warn if not exhaustive and can throw `SwitchExpressionException` for unmatched values; C# 15 closed hierarchies and unions can support exhaustiveness checks under their specific rules.

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


# Common mistakes
* **Ignoring Exhaustiveness**: If no switch arm matches at runtime, a switch expression throws `SwitchExpressionException`; the compiler may warn when it cannot prove exhaustiveness, and a discard arm supplies a fallback.
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
