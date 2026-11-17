<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Reference: is patterns, switch statements, switch expressions, guards, and exhaustiveness

*This is an automatically generated draft.*

# Scope and version
This lesson covers C# pattern matching, selection statements, and control flow features as of C# 15 / .NET 11. It focuses on the stable language features for testing values, branching logic, and ensuring exhaustiveness. Memory-safety preview features are excluded. Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns).

# How this group fits the mental model
Pattern matching tests values against language-defined constant, type, and structural rules; it is not merely equality testing. By combining patterns with `switch` expressions and statements, you create clear, declarative branches.

- **Patterns** (like `is`) test if a value matches a criteria.
- **Switch structures** organize these tests into a decision tree.
- **Exhaustiveness analysis** checks whether the compiler recognizes all alternatives; an unmatched value can still throw `SwitchExpressionException` when a switch expression has no fallback.
- **Control flow** (like labeled breaks) allows you to exit complex nested loops cleanly.

# Supplied names explained

* `is pattern expression`: An expression that returns `true` if the input matches the specified pattern, often used for type checking or data extraction.
* `switch statement`: A traditional control flow statement that executes code blocks based on matching patterns or constants.
* `switch expression`: A concise, result-producing expression that evaluates a value against multiple patterns.
* `Switch expression arm`: A single branch within a `switch` expression, consisting of a pattern and a result.
* `Switch expression governing expression`: The input value being tested by the `switch` expression.
* `Switch expression arm result type`: The compiler finds a result type compatible with all arm expressions, using best-common-type and target-typing rules; not every arm has to be written in the same type.
* `Switch arm pattern`: The specific condition (e.g., type, property, or constant) used to match the input.
* `Switch arm when guard`: An additional boolean condition that must be true for the arm to be selected.
* `Switch expression discard arm`: The `_` pattern that acts as a catch-all for any value not matched by previous arms.
* `Switch expression exhaustiveness`: The compiler’s analysis of whether all recognized inputs are handled; a non-exhaustive switch expression can produce a warning, and an unmatched runtime value throws `SwitchExpressionException`.
* `Non-exhaustive switch expression diagnostic`: Usually a warning when the compiler can identify an unhandled input; a non-exhaustive switch expression throws `SwitchExpressionException` if no arm matches at runtime.
* `Unreachable switch expression arm diagnostic`: A compiler warning triggered when an arm can never be reached because a previous arm covers its cases.
* `Switch statement case pattern label`: The syntax used in a `switch` statement to define a pattern match.
* `Switch statement when guard`: A boolean condition applied to a `switch` statement case.
* `Switch statement default label`: The fallback section in a `switch` statement if no other cases match.
* `Switch statement case section`: A block of code associated with one or more labels in a `switch` statement.
* `Switch expression evaluation order`: Arms are considered in source order; a matching pattern whose `when` guard is false allows later arms to be considered. Evaluation order within complex pattern member accesses is not generally guaranteed.
* `Switch expression result conversion`: The implicit conversion applied to the result of an arm to match the expression's return type.
* `Switch expression versus switch statement`: The distinction between a statement (which performs actions) and an expression (which returns a value).
* `Switch expression with union type`: Type/declaration patterns match the union’s contained case value; the compiler can check all declared cases for exhaustiveness under union rules.
* `Switch expression with closed hierarchy`: Matching against a set of types where the compiler knows all possible subtypes.
* `Exhaustive pattern matching with closed hierarchy`: The ability to omit a discard arm when the compiler proves all subtypes are handled.
* `Pattern guard side effects`: State changes from code inside a `when` guard. Side-effect-free guards are easier to reason about; evaluation of pattern subexpressions may not have a specified order.
* `C# 15 labeled break statement`: A statement that exits a specific loop identified by a label.
* `C# 15 labeled continue statement`: A statement that jumps to the next iteration of a specific loop identified by a label.
* `Labeled loop nesting target`: The identifier used to mark a loop for `break` or `continue`.
* `Labeled control transfer in nested loops`: The mechanism of jumping out of or skipping iterations in deeply nested structures.

# Cross-item comparison
- **Switch statement vs. Switch expression**: Use a statement for side-effect-heavy logic (e.g., writing to a database). Use an expression when you need to calculate and return a value.
- **Exhaustiveness**: In older C# versions, you often needed a `default` or `_` discard. With C# 15 unions and closed hierarchies, the compiler can prove exhaustiveness when all recognized cases are handled.

# Examples
```csharp
// Example of a switch expression
int result = input switch
{
    int i when i > 10 => 1, // Switch arm with when guard
    int i => 0,             // Switch arm pattern
    _ => -1                 // Switch expression discard arm
};
```

# Common mistakes
- **Side effects in guards**: Using a guard to mutate state. Guards should be simple and side-effect free for readability; pattern members and guard calls can have side effects, so do not depend on unspecified evaluation order of pattern subexpressions.
- **Ignoring exhaustiveness**: Assuming every hierarchy is closed to future cases; only unions/closed hierarchies provide the relevant finite-case analysis, and version/compiler diagnostics still matter.
- **Over-nesting**: Using nested `if` statements when a single `switch` expression with patterns would be more readable.

# Knowledge checks with answers
1. **Question**: Why does the compiler provide a "Non-exhaustive switch expression diagnostic"?
   **Answer**: To flag incomplete handling when the compiler can identify missing cases; if execution reaches no arm, a switch expression throws `SwitchExpressionException`.
2. **Question**: What is the primary difference between a `switch` statement and a `switch` expression?
   **Answer**: A `switch` statement performs actions (side effects), while a `switch` expression evaluates to a value.
3. **Question**: What is the benefit of a `C# 15 labeled break statement`?
   **Answer**: It allows you to break out of multiple nested loops at once by targeting a specific outer loop label, rather than just the innermost one.
