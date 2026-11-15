<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Core concepts and how they fit together

*This is an automatically generated draft.*

# Learning objectives
* Distinguish between statements (actions) and expressions (values).
* Understand how control flow structures (selection, iteration, jumps) dictate the execution path of a program.
* Learn how to manage resources and handle errors using dedicated statement forms.
* Recognize the role of blocks in defining scope and lifetime.

# Prerequisites
* Basic understanding of C# syntax and the concept of a program as a sequence of instructions.
* Familiarity with variables and constants.

# Core concepts
In C#, a **statement** is an instruction that performs an action, such as declaring a variable, calling a method, or looping through data. Unlike an expression, which evaluates to a value, a statement is executed for its side effects.

*   **Blocks**: A `Block statement` (enclosed in `{}`) groups multiple statements into a single unit and defines a local scope. Variables declared inside a block are only accessible within that block.
*   **Selection**: These statements choose which code to run based on a condition (e.g., `if statement`, `switch statement`).
*   **Iteration**: These statements repeat a block of code (e.g., `while statement`, `foreach statement`).
*   **Jump**: These alter the normal flow of execution, moving the program to a different point (e.g., `break statement`, `return statement`).
*   **Exception Handling**: These ensure the program can recover from errors or perform cleanup (e.g., `try-catch-finally statement`).
*   **Resource Management**: These ensure that objects that hold external resources (like files or network connections) are closed properly (e.g., `using statement`).

# Mechanisms and relationships
The execution of a program is a path through these statements. 
1. **Scope**: A `Block statement` acts as a container. When execution enters a block, new local variables can be created. When it exits, those variables go out of scope.
2. **Control Flow**: By default, C# executes statements top-to-bottom. Selection and iteration statements create branches or loops in this path.
3. **Jumps**: Statements like `break statement` or `goto statement` force the program to "jump" out of the current sequence to a specific label or the end of a loop.
4. **Safety**: `checked statement` and `unchecked statement` control how the runtime handles arithmetic overflows, while `unsafe statement` allows for direct memory access via pointers.

# Worked examples
Consider a scenario where we process a list of numbers and stop if we encounter an error.

```csharp
// Block statement defining scope
{
    int[] numbers = { 1, 2, 3, 4 };
    
    // Iteration statement
    foreach (int n in numbers)
    {
        // Selection statement
        if (n == 3)
        {
            // Jump statement
            break; 
        }
        Console.WriteLine(n);
    }
}
```
In this example:
1. The `foreach statement` iterates through the array.
2. The `if statement` checks the value.
3. The `break statement` exits the loop immediately when `n` is 3.

# Misconceptions and edge cases
*   **Statements vs. Expressions**: A common mistake is trying to use a `throw statement` where an expression is required. Remember that a `throw statement` is an action, while a `throw expression` (not covered here) produces a value.
*   **Labeled Jumps**: In C# 15, you can use `Labeled break statement` and `Labeled continue statement` to target specific outer loops, which is much safer than using a `goto statement` to jump across code blocks.
*   **Resource Disposal**: Choose `using declaration` or `using statement` to match the needed lifetime; a statement is useful when disposal should happen before the enclosing scope ends.

# Knowledge checks with answers
1. **Question**: What is the primary difference between a `Block statement` and a simple statement?
   *   **Answer**: A block statement groups multiple statements together and creates a new local scope for variables.

2. **Question**: If you want to stop the current iteration of a loop and move to the next one, which statement should you use?
   *   **Answer**: The `continue statement`.

3. **Question**: Why would you use a `try-finally statement`?
   *   **Answer**: To guarantee that specific code (like closing a file) runs regardless of whether an exception was thrown in the `try` block.

4. **Question**: What is the purpose of a `when guard` in a `switch statement`?
   *   **Answer**: It adds an additional condition to a `case pattern label` that must be true for that case to execute.

*Source: [Microsoft Learn C# statements reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/)*
