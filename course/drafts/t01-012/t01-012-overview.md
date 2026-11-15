<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Big-picture orientation and mental model

*This is an automatically generated draft.*

# Problem and purpose

In C#, developers often need to transform data between types or make complex decisions based on the shape and value of an object. Without specialized tools, this leads to "boilerplate" code: long chains of `if-else` statements, manual type casting, and repetitive conversion logic.

This topic covers two powerful features that solve these problems:
1. **User-defined operators and conversions:** These allow your custom types to behave like built-in types (like `int` or `double`), enabling natural syntax for math and data transformation.
2. **Pattern matching:** This provides a declarative way to test data against specific shapes or values, making decision-making logic much more readable and less error-prone.

# Plain-language mental model

Think of **conversions** as a translator. If you have a `Celsius` type and a `Fahrenheit` type, a conversion allows the compiler to automatically "translate" one to the other when needed. **Operators** are like shorthand: instead of writing `myTemp.Add(otherTemp)`, you can simply write `myTemp + otherTemp`.

Think of **pattern matching** as a sophisticated "sorting machine." Instead of asking a series of "Is this X? Is this Y?" questions, you place an object into the machine and define "bins" (patterns). The machine checks the object's shape, value, or type and drops it into the correct bin automatically.

# How the parts fit together

These features work together to create expressive, "value-like" types:

*   **Operators and Conversions** define how your objects interact with the language's math and assignment rules.
*   **Pattern Matching** provides the logic to inspect those objects.
*   **Switch Expressions** act as the primary engine for pattern matching, allowing you to map specific object states to specific results.

Together, they allow you to write code that reads more like a business rule than a series of low-level computer instructions.

# Concept map

1.  **Conversions:** Define how one type becomes another. Use `implicit` for safe, loss-free changes and `explicit` for potentially lossy or expensive ones.
2.  **Operators:** Define how types interact. Use these to support math (`+`, `-`) or comparisons (`==`, `>`) so your types feel native to C#.
3.  **Patterns:** Use these to inspect data. You can check for specific values (`Constant pattern`), types (`Type pattern`), or internal structure (`Property` or `List patterns`).
4.  **Decision Logic:** Use `switch` expressions to combine patterns. The compiler ensures you have covered all possibilities (exhaustiveness), preventing runtime errors.

# End-to-end walkthrough

Imagine a `Temperature` struct.

1.  **Define the Operator:** You define an `operator +` so you can add two temperatures together.
2.  **Define a Conversion:** You define an `implicit operator` to convert `Temperature` to a `double` (the raw value).
3.  **Use Pattern Matching:** You receive a `Temperature` object and want to categorize it:

```csharp
// Unverified example
string status = temp switch
{
    { Value: < 0 } => "Freezing",
    { Value: >= 0 and < 30 } => "Moderate",
    _ => "Hot" // The discard pattern handles everything else
};
```

The compiler checks the `Value` property against the relational patterns (`< 0`, `>= 0`). Because you included the discard pattern (`_`), the compiler knows the switch is "exhaustive" (all cases are handled).

# When to use it and tradeoffs

*   **Use Operators** when the operation is intuitive (e.g., adding two vectors). **Avoid** them if the operation is surprising or expensive (e.g., a database call inside an `+` operator).
*   **Use Conversions** to make your API easier to use, but prefer explicit conversions if the change could result in data loss (like converting a `long` to an `int`).
*   **Use Pattern Matching** to replace complex `if-else` chains. It is safer because the compiler can warn you if you forget to handle a specific case.
*   **Tradeoff:** Overusing custom operators can make code hard to debug because the logic is hidden behind symbols. Always prioritize readability.

# What later lessons cover

*   **Standard and user-defined conversions:** Deep dive into how the compiler chooses between different conversion paths.
*   **Operator declarations:** How to implement specific math and equality contracts.
*   **Pattern forms:** Detailed syntax for property, positional, and list patterns.
*   **Exhaustiveness:** How the compiler proves that your `switch` expressions cover every possible input.

*Source: [Microsoft C# Language Reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns)*
