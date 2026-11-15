<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# pattern matching user-defined operators and conversions — Interview questions and reasoning

This is an automatically generated draft.

# Core questions
In an interview, you may be asked how C# manages data transformation and decision-making. Key questions include:
*   **How do you decide between an operator overload and a named method?** (Focus on semantic expectation; operators should feel natural, like math, while named methods are better for expensive or asymmetric operations.)
*   **What is the difference between `Implicit conversion` and `Explicit conversion`?** (Implicit is for safe, loss-less transformations; explicit is for potentially lossy or expensive ones.)
*   **How does `Pattern matching` improve code over traditional `if-else` chains?** (It allows for declarative, readable checks of data structure and type, often with built-in exhaustiveness checking.)

# Concise interview answers
*   **Pattern matching:** A way to test a value's shape and extract data simultaneously. It replaces complex type-casting and conditional logic with clear, branch-based expressions.
*   **User-defined conversion:** A way to define how a custom type transforms into another type. Use `Implicit conversion operator` for safe changes and `Explicit conversion operator` for lossy ones.
*   **Switch expression:** A concise, result-producing decision structure. Unlike a `switch statement`, it returns a value and enforces `Switch expression exhaustiveness` at compile time.

# Deep follow-up answers
*   **Why avoid surprising operator overloads?** Operators like `+` or `==` carry strong mathematical or logical expectations. If an operation is expensive, side-effect-heavy, or non-associative, a `Named method` is safer because it doesn't mislead the developer about the operation's cost or behavior.
*   **How do `Checked user-defined conversion operator` and `Unchecked integral overflow behavior` interact?** C# allows you to define how types behave during arithmetic. In a `Checked integral arithmetic context`, the compiler ensures that overflows throw exceptions, which is critical for financial or safety-sensitive data.
*   **What is the role of `Switch expression exhaustiveness`?** It ensures that every possible input is handled. If you use a `Switch expression` on a `closed hierarchy`, the compiler verifies that all cases are covered, preventing runtime errors.

# Scenario questions
*   **Scenario:** You have a list of objects and need to process them based on their type and properties.
    *   **Approach:** Use a `switch expression` with `Property pattern` or `Positional pattern` to deconstruct the object and match its state. This is cleaner than multiple `is` checks and casts.
*   **Scenario:** You are building a custom numeric type.
    *   **Approach:** Implement `IAdditionOperators<TSelf,TOther,TResult>` and other generic math contracts. This allows your type to participate in `Generic math static abstract operator contract` scenarios, making it behave like a built-in numeric type.

# Tradeoffs and alternatives
*   **`Switch expression` vs. `Switch statement`:** Use expressions for returning values and ensuring exhaustiveness. Use statements for side-effect-heavy logic or when you need to perform actions rather than return a result.
*   **`Implicit conversion` vs. `Explicit conversion`:** Always prefer implicit for safe, lossless data movement. Use explicit when the conversion might lose precision or throw an error, as it forces the caller to acknowledge the risk.
*   **`Pattern matching` vs. `Cast and branch`:** Pattern matching is generally preferred because it is more readable, handles `null` values gracefully, and reduces the risk of `InvalidCastException`.

# Common weak answers
*   **"I always use implicit conversions to make code cleaner."** (Weak because implicit conversions can hide expensive logic or precision loss, leading to bugs.)
*   **"I use switch statements for everything."** (Weak because it ignores the safety and conciseness of `switch expressions` and their ability to enforce exhaustiveness.)
*   **"Operators are just shortcuts."** (Weak because it ignores the semantic contract; operators should follow expected mathematical rules, not just provide a convenient syntax.)

# Self-check rubric
*   **Can I explain the difference between `Implicit conversion` and `Explicit conversion`?** (Source: [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/user-defined-conversion-operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/user-defined-conversion-operators))
*   **Do I understand why `Switch expression exhaustiveness` is a safety feature?** (Source: [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/selection-statements](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/selection-statements))
*   **Can I identify when to use a `Property pattern` versus a `Positional pattern`?** (Source: [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/patterns))
*   **Do I know the requirements for `Operator must be public and static`?** (Source: [https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/conversions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/language-specification/conversions))
*   **Am I aware of the C# 15 additions regarding closed hierarchies?** (Source: [https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15))
