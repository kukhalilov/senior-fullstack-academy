<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Reference: Jump and iterator statements

*This is an automatically generated draft.*

# Scope and version
This lesson covers the jump and iterator statements in C# 15, running on .NET 11 GA. The information is based on the official Microsoft Learn C# statements reference and language specification, last checked on 2026-11-14.

# How this group fits the mental model
In C#, **statements** perform actions, while **expressions** produce values. Jump and iterator statements are specialized tools for controlling the execution path of your code:
* **Jump statements** alter the "next" instruction, allowing you to exit loops, skip iterations, or move to specific labels.
* **Iterator statements** allow a method to return a sequence of values one at a time, pausing execution between each value.

These statements are essential for managing complex logic, such as breaking out of nested loops or generating data streams lazily.

# Supplied names explained
* `break statement`: Terminates the closest enclosing loop or `switch` statement.
* `continue statement`: Skips the remaining statements in the current iteration of the closest enclosing loop and starts the next iteration.
* `goto statement`: Transfers control directly to a labeled statement.
* `goto case statement`: Transfers control to the statement associated with a specific `case` label within a `switch` statement.
* `goto default statement`: Transfers control to the statement associated with the `default` label within a `switch` statement.
* `return statement`: Terminates the execution of the method in which it appears and returns control to the caller, optionally returning a value.
* `ref return statement`: Returns a reference to a variable rather than a copy of its value, allowing the caller to modify the original variable.
* `throw statement`: Explicitly signals that an error (exception) has occurred, transferring control to the nearest matching `catch` block.
* `yield return statement`: Returns the next element in an iterator sequence and pauses the method's execution until the next element is requested.
* `yield break statement`: Signals that the iterator sequence is complete and stops the iteration.
* `Labeled break statement`: A `break` statement that targets a specific enclosing loop or `switch` identified by a label (introduced in C# 15).
* `Labeled continue statement`: A `continue` statement that targets a specific enclosing loop identified by a label (introduced in C# 15).

# Cross-item comparison
* **Loop Control:** `break` and `continue` affect the immediate loop. In C# 15, `Labeled break statement` and `Labeled continue statement` allow you to target outer loops, which is more precise than a standard `break` or `continue`.
* **Switch Control:** `goto case` and `goto default` are specific to `switch` blocks, whereas `break` is used to exit them.
* **Iterator Flow:** `yield return` produces a value, while `yield break` terminates the sequence entirely.
* **Method Exit:** `return` exits a method, while `ref return` exits a method while maintaining a memory reference to the returned data.

# Examples
```csharp
// Labeled break example (C# 15)
OuterLoop: for (int i = 0; i < 5; i++)
{
    for (int j = 0; j < 5; j++)
    {
        if (i + j > 5) break OuterLoop; // Exits both loops
    }
}

// Iterator example
IEnumerable<int> GetNumbers()
{
    yield return 1;
    yield return 2;
    yield break; // Stops here
    yield return 3; // Unreachable
}
```

# Common mistakes
* **Unreachable code:** Placing code after a `return`, `throw`, or `yield break` statement often results in a compiler warning or error because that code can never execute.
* **Label scope:** Attempting to use `goto` to jump into a block or out of a method is prohibited.
* **Iterator misuse:** Using `yield` inside a `try-catch` block is restricted; `yield` cannot be used in a `try` block that has a `catch` clause.

# Knowledge checks with answers
1. **Question:** How does a `Labeled break statement` differ from a standard `break statement`?
   **Answer:** A standard `break` only exits the innermost loop or `switch`. A `Labeled break` can exit an outer loop that has been marked with a label.

2. **Question:** What is the purpose of `yield break`?
   **Answer:** It signals the end of an iterator sequence, effectively telling the caller that no more values will be produced.

3. **Question:** Can you use `goto` to jump from one method to another?
   **Answer:** No, `goto` is restricted to the scope of the current method.

*Source: [Microsoft Learn C# Statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/), [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)*
