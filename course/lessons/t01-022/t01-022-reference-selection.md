
# C# statements, control flow, and exception-handling statement forms — Reference: Selection statements

*Draft: Automatically generated.*

# Scope and version
This lesson covers C# selection statements as defined in C# 15, running on .NET 11 GA. The scope is limited to the syntax and behavior of selection statements and their constituent parts. It does not cover expression-based alternatives (like switch expressions) or type declarations. Source: [Microsoft Learn C# Statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/selection-statements).

# How this group fits the mental model
In C#, **statements** are the building blocks that perform actions, whereas expressions produce values. Selection statements are the "decision-makers" of your code. They allow the program to evaluate a condition and choose a specific path of execution. By using these statements, you can control the flow of your logic based on runtime data, ensuring that only the relevant blocks of code are executed.

# Supplied names explained

* `if statement`: A conditional structure that executes a block of code only if a specified boolean expression evaluates to `true`.
* `if-else statement`: An extension of the `if` statement that provides an alternative path of execution to be taken if the initial boolean expression evaluates to `false`.
* `switch statement`: A control structure that selects a single code block to execute from a list of candidates, based on a match between a control expression and a set of labels.
* `switch section`: A block of code within a `switch` statement that contains one or more labels followed by the statements to execute when those labels match.
* `case constant label`: A label within a `switch` section that specifies a constant value to compare against the switch expression.
* `case pattern label`: A label within a `switch` section that uses a pattern (such as type or property patterns) to match the switch expression.
* `default label`: A special label within a `switch` statement that executes if no other `case` labels match the switch expression.
* `when guard`: A conditional clause used with a `case` label to further refine whether that specific `case` should execute, even if the pattern matches.

# Cross-item comparison

* **`if statement` vs `if-else statement`**: The `if` statement is for simple "do this if true" logic. The `if-else` statement is for binary "either this or that" logic.
* **`if statement` vs `switch statement`**: Use `if` for complex boolean conditions or ranges. Use `switch` when comparing a single expression against multiple discrete values or patterns.
* **`case constant label` vs `case pattern label`**: Constant labels match exact values (like integers or strings). Pattern labels match shapes or types (like checking if an object is a specific class).
* **`default label`**: This is the "catch-all" for a `switch` statement, similar to the `else` block in an `if-else` chain.

# Examples

```csharp
// Using if-else
int score = 85;
if (score >= 90) { /* ... */ }
else { /* ... */ }

// Using switch with patterns and guards
object input = 42;
switch (input)
{
    case int i when i > 0: // case pattern label with when guard
        Console.WriteLine("Positive integer");
        break;
    case string s:         // case pattern label
        Console.WriteLine("String");
        break;
    default:               // default label
        Console.WriteLine("Other");
        break;
}
```

# Common mistakes

1. **Assuming C-style fall-through**: A non-empty switch section generally must end with a jump that prevents control from falling into the next section; the compiler reports an error otherwise. Multiple labels can share one section. If no case matches and there is no `default`, execution continues after the switch.
2. **Overusing `if-else`**: When checking a single variable against many values, a long chain of `if-else` statements is harder to read than a `switch` statement.
3. **Ignoring `default`**: Forgetting a `default` label in a `switch` can lead to unexpected behavior if the input does not match any of your defined cases.

# Knowledge checks with answers

1. **Question**: Which statement should you use if you need to check a variable against five different specific integer values?
   **Answer**: A `switch statement` with multiple `case constant labels`.

2. **Question**: What is the purpose of a `when guard`?
   **Answer**: It adds an extra boolean condition that must be `true` for the associated `case` to execute, even if the pattern match itself is successful.

3. **Question**: Can an `if` statement exist without an `else`?
   **Answer**: Yes, an `if statement` is a complete structure on its own.
