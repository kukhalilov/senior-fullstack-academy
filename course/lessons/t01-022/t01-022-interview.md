
# C# statements, control flow, and exception-handling statement forms — Interview questions and reasoning

# Core questions

In C#, **statements** are the fundamental building blocks that perform actions, while **expressions** are units of code that produce values. Understanding statements is essential because they dictate the flow of your program—how it decides, repeats, and handles errors.

**Mental Model:** Think of your code as a recipe. **Expressions** are the ingredients (e.g., "5 + 3"), and **statements** are the instructions (e.g., "Add the eggs," "If the oven is hot, bake for 20 minutes"). Without statements, your program would have no logic to process the ingredients.

# Concise interview answers

*   **What is the difference between a `using statement` and a `using declaration`?**
    A `using statement` defines a scope (a block or embedded statement) where a resource is disposed when control leaves that statement. A `using declaration` (introduced in later versions) disposes of the resource when the enclosing scope (like a method) ends, making the code cleaner by removing indentation levels.
*   **When should you use `foreach` instead of `for`?**
    Use `foreach` when you want to process elements without managing an index. It avoids common index mistakes, but mutation rules depend on the collection and enumerator; ref iteration can modify elements when supported.
*   **What is an `exception filter`?**
    It is a `when` clause added to a `catch` block that allows you to catch an exception only if a specific condition is met, without unwinding the stack prematurely.

# Deep follow-up answers

*   **How do `break` and `continue` behave in C# 15?**
    C# 15 introduced **Labeled break statement** and **Labeled continue statement**. A labeled `break` can target an enclosing loop or switch; a labeled `continue` can target only an enclosing loop. These forms can make nested-loop control clearer than a flag or `goto`, depending on context.
*   **Why use `await using` instead of `using`?**
    `await using` works with `IAsyncDisposable` or a suitable awaitable `DisposeAsync` pattern. It awaits the asynchronous disposal operation. This can avoid blocking while that operation is pending, but does not guarantee that the implementation itself never blocks.
*   **What is the purpose of the `fixed` statement?**
    The `fixed` statement is used within an `unsafe` context to "pin" a managed object in memory. This prevents the Garbage Collector from moving the object while you are accessing it via a pointer.

# Scenario questions

*   **Scenario:** You have a nested loop and need to exit the entire process when a specific condition is met.
    *   **Approach:** Use a labeled break targeting the outer loop when that makes the control flow clearer; the label exits that loop, not the process. Place the label directly on the outer loop.
*   **Scenario:** You are reading a file and want to ensure it closes even if an error occurs.
    *   **Approach:** Use a `try-finally` statement or a `using declaration`. The `finally` clause or the disposal mechanism guarantees the file handle is released regardless of whether an exception was thrown.

# Tradeoffs and alternatives

*   **`if statement` vs `switch statement`:** Use `if` for simple boolean conditions or ranges. Use `switch` when comparing a single variable against many discrete values or patterns; it can be clearer; generated code and optimization depend on the expression and compiler.
*   **`throw statement` vs `throw expression`:** A `throw statement` is a standalone instruction. A `throw expression` allows you to throw an exception inside an expression (like a ternary operator), which is useful for concise validation.
*   **`using statement` vs `using declaration`:** Use the `using statement` if you need to limit the resource's lifetime to a specific, small block. Use the `using declaration` to keep the resource alive until the end of the current method scope.

# Common weak answers

*   **"I always use `goto` to jump out of loops."**
    *   *Correction:* `goto` is generally discouraged because it makes control flow difficult to trace ("spaghetti code"). Use `break`, `continue`, or labeled jumps instead.
*   **"I don't need `try-finally` if I use `try-catch`."**
    *   *Correction:* `try-catch` handles errors but does not itself guarantee cleanup. Use `finally`, `using`, or `await using` as appropriate so resources (like file handles or database connections) are released even on exceptional exit.

# Self-check rubric

1.  **Can you identify the scope?** Do you know where a variable declared in a `for` loop or `block statement` exists?
2.  **Do you handle resources?** Do you automatically reach for `using` or `try-finally` when working with external resources?
3.  **Are you using modern features?** Are you using `await using` for asynchronous cleanup and labeled jumps for nested loops?
4.  **Is your control flow readable?** If you find yourself using `goto` or deeply nested `if` statements, can you refactor them into `switch` statements or early returns?

*Source: [Microsoft Learn C# statements reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/)*
