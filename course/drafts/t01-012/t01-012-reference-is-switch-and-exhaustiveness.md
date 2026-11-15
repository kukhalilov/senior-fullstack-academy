<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Reference: is patterns, switch statements, switch expressions, guards, and exhaustiveness

*This is an automatically generated draft.*

# Scope and version
This lesson covers C# pattern matching, selection statements, and control flow features as of C# 15 / .NET 11. It focuses on the stable language features for testing values, branching logic, and ensuring exhaustiveness. Memory-safety preview features are excluded. Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns).

# How this group fits the mental model
Pattern matching allows you to test the "shape" of data rather than just its equality. By combining patterns with `switch` expressions and statements, you create clear, declarative branches. 

- **Patterns** (like `is`) test if a value matches a criteria.
- **Switch structures** organize these tests into a decision tree.
- **Exhaustiveness** ensures your code handles every possible input, preventing runtime errors.
- **Control flow** (like labeled breaks) allows you to exit complex nested loops cleanly.

# Supplied names explained

* `is pattern expression`: An expression that returns `true` if the input matches the specified pattern, often used for type checking or data extraction.
* `switch statement`: A traditional control flow statement that executes code blocks based on matching patterns or constants.
* `switch expression`: A concise, result-producing expression that evaluates a value against multiple patterns.
* `Switch expression arm`: A single branch within a `switch` expression, consisting of a pattern and a result.
* `Switch expression governing expression`: The input value being tested by the `switch` expression.
* `Switch expression arm result type`: The type produced by an arm; all arms must be implicitly convertible to a common type.
* `Switch arm pattern`: The specific condition (e.g., type, property, or constant) used to match the input.
* `Switch arm when guard`: An additional boolean condition that must be true for the arm to be selected.
* `Switch expression discard arm`: The `_` pattern that acts as a catch-all for any value not matched by previous arms.
* `Switch expression exhaustiveness`: The compiler's verification that all possible inputs are handled.
* `Non-exhaustive switch expression diagnostic`: A compiler warning/error triggered when a `switch` expression misses a possible input value.
* `Unreachable switch expression arm diagnostic`: A compiler warning triggered when an arm can never be reached because a previous arm covers its cases.
* `Switch statement case pattern label`: The syntax used in a `switch` statement to define a pattern match.
* `Switch statement when guard`: A boolean condition applied to a `switch` statement case.
* `Switch statement default label`: The fallback section in a `switch` statement if no other cases match.
* `Switch statement case section`: A block of code associated with one or more labels in a `switch` statement.
* `Switch expression evaluation order`: The top-to-bottom sequence in which arms are checked.
* `Switch expression result conversion`: The implicit conversion applied to the result of an arm to match the expression's return type.
* `Switch expression versus switch statement`: The distinction between a statement (which performs actions) and an expression (which returns a value).
* `Switch expression with union type`: Using a union type to define a finite set of possibilities for exhaustive matching.
* `Switch expression with closed hierarchy`: Matching against a set of types where the compiler knows all possible subtypes.
* `Exhaustive pattern matching with closed hierarchy`: The ability to omit a discard arm when the compiler proves all subtypes are handled.
* `Pattern guard side effects`: Unintended changes to state caused by code inside a `when` guard; these should be avoided.
* `C# 15 labeled break statement`: A statement that exits a specific loop identified by a label.
* `C# 15 labeled continue statement`: A statement that jumps to the next iteration of a specific loop identified by a label.
* `Labeled loop nesting target`: The identifier used to mark a loop for `break` or `continue`.
* `Labeled control transfer in nested loops`: The mechanism of jumping out of or skipping iterations in deeply nested structures.

# Cross-item comparison
- **Switch statement vs. Switch expression**: Use a statement for side-effect-heavy logic (e.g., writing to a database). Use an expression when you need to calculate and return a value.
- **Exhaustiveness**: In older C# versions, you often needed a `default` or `_` discard. With C# 15's **closed hierarchies**, the compiler can verify that you have covered all possibilities without a discard.

# Examples
```csharp
// Unverified example of a switch expression
int result = input switch
{
    int i when i > 10 => 1, // Switch arm with when guard
    int i => 0,             // Switch arm pattern
    _ => -1                 // Switch expression discard arm
};
```

# Common mistakes
- **Side effects in guards**: Putting logic that modifies variables inside a `when` guard. Guards should be pure (side-effect free) because the compiler may evaluate them in any order or multiple times.
- **Ignoring exhaustiveness**: Relying on a `default` label instead of letting the compiler verify your logic against a closed hierarchy.
- **Over-nesting**: Using nested `if` statements when a single `switch` expression with patterns would be more readable.

# Knowledge checks with answers
1. **Question**: Why does the compiler provide a "Non-exhaustive switch expression diagnostic"?
   **Answer**: To warn you that your code might fail at runtime if it encounters an input value that doesn't match any of your defined patterns.
2. **Question**: What is the primary difference between a `switch` statement and a `switch` expression?
   **Answer**: A `switch` statement performs actions (side effects), while a `switch` expression evaluates to a value.
3. **Question**: What is the benefit of a `C# 15 labeled break statement`?
   **Answer**: It allows you to break out of multiple nested loops at once by targeting a specific outer loop label, rather than just the innermost one.
