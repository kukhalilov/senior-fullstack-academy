<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Reference: Statement forms and declarations

*This is an automatically generated draft.*

# Scope and version
This lesson covers the fundamental statement forms and declarations in C# 15, running on .NET 11 GA. The scope is limited to the structural building blocks of C# code: blocks, empty statements, expression statements, and declarations. It excludes expression-based forms (like switch expressions) and type/member declarations.
Source: [Microsoft Learn C# statements reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/)

# How this group fits the mental model
In C#, **statements** are the instructions that perform actions, whereas **expressions** are fragments that produce values. These specific statement forms act as the "grammar" of your code:
*   **Blocks** define scope and group multiple instructions.
*   **Declarations** introduce names (variables/constants) into that scope.
*   **Expression statements** allow you to execute logic (like method calls or assignments) where a statement is required.
*   **Empty and Labeled statements** provide structural markers for control flow.

# Supplied names explained

*   `Block statement`: A sequence of zero or more statements enclosed in braces `{}`. It creates a new local variable scope; variables declared inside are not accessible outside the block.
*   `Empty statement`: A single semicolon `;`. It is used when the language syntax requires a statement but your logic requires no action (e.g., in a `while` loop body that does all its work in the condition).
*   `Expression statement`: A permitted statement-expression followed by a semicolon. C# does not permit every expression as a standalone expression statement; common forms include invocations, assignments, increments/decrements, object creation, and await expressions.
*   `Expression statement permitted forms`: C# permits specific expression categories as statements; an arithmetic expression like `x + 1;` is not valid by itself.
*   `Declaration statement`: A statement that introduces a new local variable or constant. It is the umbrella category for the following two items.
*   `Local variable declaration`: Introduces a variable whose value can change. It specifies a type and a name, optionally followed by an initialization (e.g., `int x = 5;`).
*   `Local constant declaration`: Introduces a constant using the `const` keyword. It must be initialized at the time of declaration, and its value cannot be changed thereafter.
*   `Labeled statement`: A name followed by a colon and a statement. A `goto` can target an in-scope label in the same function, subject to definite-assignment and scope rules; C# 15 also lets labeled `break`/`continue` target enclosing constructs.

# Cross-item comparison
*   `Local variable declaration` vs `Local constant declaration`: Both introduce names into the current scope. However, variables can be reassigned, while a `const` requires a compile-time constant value at its declaration and cannot be reassigned.
*   `Block statement` vs `Labeled statement`: A block groups statements to manage scope, while a label provides a target for control flow jumps. They are often used together, as a label can precede a block.

# Examples

```csharp
// Block statement: defines a scope
{
    // Local variable declaration
    int count = 10;
    
    // Local constant declaration
    const int Max = 100;

    // Expression statement: method call
    Console.WriteLine(count);

    // Labeled statement
    targetPoint:
    count++;
    
    if (count < Max)
    {
        // Jump statement using the label
        goto targetPoint;
    }
}

// Empty statement: used here as a placeholder
while (SomeCondition()) ; 
```

# Common mistakes
*   **Scope confusion**: Attempting to access a variable declared inside a `Block statement` from outside that block.
*   **Missing semicolons**: Forgetting that an `Expression statement` must end with a `;`.
*   **Constant initialization**: Attempting to declare a `Local constant declaration` without assigning a value immediately, which causes a compilation error.
*   **Label placement**: A label must label a statement. If no operation follows, use an empty statement (`;`); labels also have function-level scope rules and cannot be duplicated in the same function.

# Knowledge checks with answers

1.  **Question**: If you need to perform an action but the logic requires no code, which statement form should you use?
    *   **Answer**: The `Empty statement` (a single semicolon).
2.  **Question**: Can you change the value of a `Local constant declaration` after it is initialized?
    *   **Answer**: No, constants are immutable and must be assigned a value at the time of declaration.
3.  **Question**: Does a `Block statement` create a new scope?
    *   **Answer**: Yes, variables declared within a block are local to that block and cannot be accessed outside of it.
4.  **Question**: What is the difference between an `Expression statement` and an expression?
    *   **Answer**: An expression statement is limited to expression forms C# permits as statements (such as an invocation or assignment); appending a semicolon to any arbitrary value-producing expression is not valid.
