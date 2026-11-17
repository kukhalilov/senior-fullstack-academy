<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# statements, control flow, and exception-handling statement forms — Reference: Jump and iterator statements

*This is an automatically generated draft.*

# Scope and version
This lesson covers the jump and iterator statements in C# 15, running on .NET 11 GA. C# 13 permits iterator methods to contain unsafe blocks while requiring each yield statement to remain in a safe context; ref locals and ref struct locals cannot be live across a yield boundary. The information is based on the official Microsoft Learn C# statements reference and language specification, last checked on 2026-11-14.

# How this group fits the mental model
In C#, **statements** perform actions, while **expressions** produce values. Jump and iterator statements are specialized tools for controlling the execution path of your code:
* **Jump statements** alter the "next" instruction, allowing you to exit loops, skip iterations, or move to specific labels.
* **Iterator statements** allow a method to return a sequence of values one at a time, pausing execution between each value.

These statements are essential for managing complex logic, such as breaking out of nested loops or generating data streams lazily.

# Supplied names explained
* `break statement`: Terminates the closest enclosing loop or `switch` statement.
* `continue statement`: Skips the remaining statements in the current iteration of the closest enclosing loop and starts the next iteration.
* `goto statement`: Transfers control to a labeled statement in the same function, subject to scope and definite-assignment restrictions.
* `goto label scope and definite assignment rules`: A jump must not enter a local variable scope in a way that bypasses initialization or violates definite assignment; labels are limited to the containing function.
* `throw statement rethrow stack-trace preservation`: Use bare `throw;` inside a catch to rethrow while preserving the original stack; `throw ex;` starts a new throw location.
* `yield statement placement restrictions`: `yield return` and `yield break` cannot appear in catch/finally clauses or in a try statement with catch clauses; a try-finally without catch can contain them.
* `C# 13 iterator unsafe-context relaxation`: C# 13 permits unsafe blocks elsewhere in iterator methods, but `yield` statements must remain in safe contexts.
* `C# 13 ref struct locals in iterators across yield boundary`: C# 13 permits ref locals/ref struct locals in iterator methods when they are not live across a `yield` boundary.
* `goto case statement`: Transfers control to the statement associated with a specific `case` label within a `switch` statement.
* `goto default statement`: Transfers control to the statement associated with the `default` label within a `switch` statement.
* `return statement`: Terminates the execution of the method in which it appears and returns control to the caller, optionally returning a value.
* `ref return statement`: Returns a reference to a variable rather than a copy of its value, allowing the caller to modify the original variable.
* `throw statement`: Raises an exception. Control transfers to a matching handler if one exists; otherwise the exception propagates up the call stack.
* `yield return statement`: Returns the next element in an iterator sequence and pauses the method's execution until the next element is requested.
* `yield break statement`: Signals that the iterator sequence is complete and stops the iteration.
* `Labeled break statement`: A C# 15 `break` form that names a label placed directly on an enclosing loop or `switch` statement to exit.
* `Labeled continue statement`: A C# 15 `continue` form that names a label placed directly on an enclosing loop to start its next iteration; the target must be a loop, not a `switch`.

# Cross-item comparison
* **Loop Control:** Unlabeled `break` and `continue` target the closest applicable construct. C# 15 adds labeled forms for targeting enclosing loops; labeled `break` can also target an enclosing switch.
* **Switch Control:** `goto case` and `goto default` are specific to `switch` blocks, whereas `break` is used to exit them.
* **Iterator Flow:** `yield return` produces a value, while `yield break` terminates the sequence entirely.
* **Rethrow:** A bare `throw;` preserves the original exception stack location; `throw exception;` resets the throw location to the current statement.
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
* **Label scope:** A `goto` cannot leave its function or bypass local-variable initialization in a way that violates scope/definite-assignment rules; it can target valid labels elsewhere in the same function.
* **Iterator misuse:** Neither `yield return` nor `yield break` may appear in a `catch`/`finally` clause or a `try` statement with a `catch`; both are allowed in a `try` with `finally` and no `catch`. In C# 13+, unsafe blocks may occur elsewhere in an iterator, but yield statements themselves must be in safe context.

# Knowledge checks with answers
1. **Question:** How does a `Labeled break statement` differ from a standard `break statement`?
   **Answer:** A standard `break` exits the closest enclosing loop or switch. C# 15 labeled `break` can exit a named enclosing loop or switch.

2. **Question:** What is the purpose of `yield break`?
   **Answer:** It signals the end of an iterator sequence, effectively telling the caller that no more values will be produced.

3. **Question:** Can you use `goto` to jump from one method to another?
   **Answer:** No, `goto` is restricted to the scope of the current method.

*Source: [Microsoft Learn C# Statements](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/statements/), [C# 15 What's New](https://learn.microsoft.com/en-us/dotnet/csharp/whats-new/csharp-15)*
