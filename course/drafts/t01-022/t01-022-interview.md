<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Interview questions and reasoning

*Automatically generated draft.*

# Core questions

In C#, **statements** are the fundamental building blocks that perform actions, while **expressions** are units of code that produce values. Understanding statements is essential because they dictate the flow of your program—how it decides, repeats, and handles errors.

**Mental Model:** Think of your code as a recipe. **Expressions** are the ingredients (e.g., "5 + 3"), and **statements** are the instructions (e.g., "Add the eggs," "If the oven is hot, bake for 20 minutes"). Without statements, your program would have no logic to process the ingredients.

# Concise interview answers

*   **What is the difference between a `using statement` and a `using declaration`?**
    A `using statement` defines a scope (a block) where a resource is disposed of at the end of that block. A `using declaration` (introduced in later versions) disposes of the resource when the enclosing scope (like a method) ends, making the code cleaner by removing indentation levels.
*   **When should you use `foreach` instead of `for`?**
    Use `foreach` when you need to iterate over a collection and do not need to modify the collection or track the specific index. It is safer and more readable.
*   **What is an `exception filter`?**
    It is a `when` clause added to a `catch` block that allows you to catch an exception only if a specific condition is met, without unwinding the stack prematurely.

# Deep follow-up answers

*   **How do `break` and `continue` behave in C# 15?**
    C# 15 introduced **Labeled break statement** and **Labeled continue statement**. These allow you to target a specific outer loop or switch block by name, which is significantly more efficient and readable than using `goto` to escape nested structures.
*   **Why use `await using` instead of `using`?**
    `await using` is used for resources that implement `IAsyncDisposable`. It ensures that the cleanup process (which might involve network or disk I/O) is performed asynchronously, preventing the thread from blocking during disposal.
*   **What is the purpose of the `fixed` statement?**
    The `fixed` statement is used within an `unsafe` context to "pin" a managed object in memory. This prevents the Garbage Collector from moving the object while you are accessing it via a pointer.

# Scenario questions

*   **Scenario:** You have a nested loop and need to exit the entire process when a specific condition is met.
    *   **Approach:** Use a `Labeled break statement` targeting the outer loop. This is cleaner than setting a boolean flag and checking it in every iteration.
*   **Scenario:** You are reading a file and want to ensure it closes even if an error occurs.
    *   **Approach:** Use a `try-finally` statement or a `using declaration`. The `finally` clause or the disposal mechanism guarantees the file handle is released regardless of whether an exception was thrown.

# Tradeoffs and alternatives

*   **`if statement` vs `switch statement`:** Use `if` for simple boolean conditions or ranges. Use `switch` when comparing a single variable against many discrete values or patterns; it is often more readable and can be optimized by the compiler into a jump table.
*   **`throw statement` vs `throw expression`:** A `throw statement` is a standalone instruction. A `throw expression` allows you to throw an exception inside an expression (like a ternary operator), which is useful for concise validation.
*   **`using statement` vs `using declaration`:** Use the `using statement` if you need to limit the resource's lifetime to a specific, small block. Use the `using declaration` to keep the resource alive until the end of the current method scope.

# Common weak answers

*   **"I always use `goto` to jump out of loops."**
    *   *Correction:* `goto` is generally discouraged because it makes control flow difficult to trace ("spaghetti code"). Use `break`, `continue`, or labeled jumps instead.
*   **"I don't need `try-finally` if I use `try-catch`."**
    *   *Correction:* `try-catch` handles errors, but it does not guarantee cleanup. `finally` is required to ensure resources (like file handles or database connections) are closed even if no exception occurs or if an exception is re-thrown.

# Self-check rubric

1.  **Can you identify the scope?** Do you know where a variable declared in a `for` loop or `block statement` exists?
2.  **Do you handle resources?** Do you automatically reach for `using` or `try-finally` when working with external resources?
3.  **Are you using modern features?** Are you using `await using` for asynchronous cleanup and labeled jumps for nested loops?
4.  **Is your control flow readable?** If you find yourself using `goto` or deeply nested `if` statements, can you refactor them into `switch` statements or early returns?

*Source: [Microsoft Learn C# statements reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/)*
