
# C# statements, control flow, and exception-handling statement forms — Big-picture orientation and mental model

# Problem and purpose
In C#, programs are built from instructions that tell the computer what to do. While expressions calculate values (like `1 + 1`), statements perform actions (like assigning a value to a variable or deciding which code to run next). The C# statement system exists to provide a structured way to manage program flow, handle errors, and ensure that system resources—like files or network connections—are cleaned up properly even when unexpected problems occur.

# Plain-language mental model
Think of a C# program as a recipe. 
*   **Statements** are the individual steps (e.g., "Crack an egg").
*   **Blocks** are the sections of the recipe (e.g., "The Batter Phase").
*   **Selection statements** are the "if" decisions (e.g., "If the oven is hot, put the tray in").
*   **Iteration statements** are the loops (e.g., "Stir the mixture 50 times").
*   **Exception handling** is your safety net (e.g., "If you drop the egg, clean it up immediately").
*   **Resource management** is your cleanup crew (e.g., "Always wash the bowl when finished").

# How the parts fit together
Statements are the building blocks of your methods. They are organized into **Blocks** (delimited by `{` and `}`) which define a scope—a boundary where variables live and die. 

The flow of execution usually moves from top to bottom, but statements allow you to:
1.  **Branch:** Choose different paths based on conditions.
2.  **Loop:** Repeat actions until a condition is met.
3.  **Jump:** Skip ahead or exit a block early.
4.  **Protect:** Handle errors or manage resources safely.

# Concept map
*   **Statements vs. Expressions:** Statements perform actions; expressions produce values.
*   **Blocks:** Group statements and define local scopes.
*   **Selection:** Choose a path (e.g., `if`, `switch`).
*   **Iteration:** Repeat work (e.g., `for`, `foreach`).
*   **Jump:** Alter the execution point (e.g., `break`, `return`).
*   **Exception Handling:** Transfer control and guarantee cleanup.
*   **Resource Management:** Dispose of resources synchronously or asynchronously.
*   **Iterator Statements:** Produce values incrementally.
*   **Unsafe Statements:** Enable explicitly scoped pointer operations.

# End-to-end walkthrough
Imagine you are processing a list of files:
1.  **Declaration:** You declare a variable to hold the file path.
2.  **Resource Management:** You use a `using` statement to open the file, ensuring it closes automatically when done.
3.  **Iteration:** You use a `foreach` loop to read each line.
4.  **Selection:** Inside the loop, an `if` statement checks if a line contains an error.
5.  **Exception Handling:** You wrap the logic in a `try-catch` block to handle potential file access errors.
6.  **Jump:** If a critical error occurs, you use `throw` to signal the problem or `break` to exit the loop.

# When to use it and tradeoffs
*   **Use `if` vs `switch`:** Use `if` for simple boolean conditions; use `switch` for complex pattern matching against a single value.
*   **Use `for` vs `foreach`:** Use `for` when you need an index or a specific counter; use `foreach` for cleaner, safer iteration over collections.
*   **Use `break`/`continue` vs `goto`:** Prefer `break` and `continue` for readability. `goto` is rarely needed and can make code difficult to follow.
*   **`using statement` vs `using declaration`:** The `using statement` defines a block scope; the `using declaration` (e.g., `using var x = ...`) is more concise and disposes of the object when the enclosing block ends.
*   **`using declaration` vs `await using declaration`:** Use `using declaration` for standard synchronous disposal; use `await using declaration` when the resource requires asynchronous cleanup (e.g., closing a network stream).
*   **`throw statement` vs `throw expression`:** The `throw statement` is used to trigger an exception as a standalone action; the `throw expression` allows you to throw an exception within an expression (e.g., in a null-coalescing operator).

*Note: C# 15 introduces labeled `break` and `continue` statements: labeled `break` exits a named enclosing loop or switch, and labeled `continue` starts the next iteration of a named enclosing loop. The label belongs on the target loop or switch.*

# What later lessons cover
This overview covers the structure of C# statements. Later lessons will dive into:
*   Detailed syntax for pattern matching in `switch` statements.
*   Advanced iterator patterns using `yield`.
*   Memory safety and pointer operations in `unsafe` blocks.
*   The full hierarchy of exception types.

*Source: [Microsoft Learn C# statements reference](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/), [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)*
