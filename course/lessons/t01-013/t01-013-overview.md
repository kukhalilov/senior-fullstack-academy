
# exceptions error handling and disposal — Big-picture orientation and mental model

# Problem and purpose
In software development, operations often fail due to factors outside your control, such as a missing file, a network timeout, or invalid user input. Furthermore, programs often interact with external resources—like database connections or file handles—that must be released promptly to prevent memory leaks or system instability.

The .NET exception and disposal system exists to solve two distinct but related problems:
1. **Error Handling:** Providing a structured way to report, propagate, and recover from unexpected failures without crashing the entire application.
2. **Resource Management:** Ensuring that external resources are cleaned up deterministically, even when errors occur.

# Plain-language mental model
Think of **Exception Handling** as a "panic" system. When a function encounters a problem it cannot solve, it "throws" an exception—a signal that stops normal execution. This signal travels up the call stack until it finds a "catch" block that knows how to handle that specific type of problem. If no handler accepts it at the relevant application/runtime boundary, the outcome depends on the host and execution context; unhandled exceptions on ordinary managed threads generally terminate the process.

Think of **Disposal** as an explicit lifetime contract. An `IDisposable` object may own an external resource, another disposable object, or cleanup work; the GC does not automatically call `Dispose` on arbitrary objects. A `using` scope arranges disposal when control leaves that scope, including ordinary exception unwinding and early return. It cannot guarantee cleanup after immediate process termination, and a throwing `Dispose` can affect which exception propagates.

# How the parts fit together
The system is built on three pillars:
*   **The Exception Hierarchy:** A set of classes (starting with `System.Exception`) that carry information about what went wrong.
*   **Control Flow Statements:** Keywords like `try`, `catch`, `finally`, and `throw` that manage the movement of the program when things go wrong.
*   **The Disposal Pattern:** Interfaces (`IDisposable`, `IAsyncDisposable`) and syntax (`using`) that ensure resources are released immediately after they are no longer needed.

Together these mechanisms support **exception safety**: designing operations so failures leave documented invariants intact and acquired resources are released. Exception handling and `using` do not automatically roll back partially changed data or make every operation safe.

# Concept map
1.  **Exceptions:** Report failure. Only catch what you can fix; otherwise, let it propagate.
2.  **Propagation:** Exceptions move up the stack until handled. Use `throw;` to rethrow an exception while preserving the original stack trace.
3.  **Cleanup:** Use `IDisposable` for resources. The `using` statement is the primary tool to ensure `Dispose()` is called automatically.
4.  **Finalization:** A last-resort safety net for unmanaged resources. Use `SafeHandle` instead of writing your own finalizers whenever possible.
5.  **Boundaries:** Define where your code ends and the caller begins. Translate low-level exceptions (like `IOException`) into meaningful application-level errors.

# End-to-end walkthrough
Imagine reading a file:

1.  **Setup:** You open a file stream. Because it is an external resource, you wrap it in a `using` statement.
2.  **Execution:** You attempt to read the file.
3.  **Failure:** If the file is locked, the system throws an `IOException`.
4.  **Cleanup:** As control leaves the `using` scope, its generated `finally` invokes `Dispose()` on the file stream during ordinary exception unwinding.
5.  **Handling:** An enclosing handler may receive the `IOException` and decide whether it can recover or present a safe error. This keeps a failure from escaping that application boundary.

# When to use it and tradeoffs
*   **Use Exceptions for truly exceptional cases:** Do not use them for routine control flow (like checking if a user exists). Exceptions are expensive to create and interrupt the natural flow of code.
*   **Use `using` for everything that implements `IDisposable`:** This is the safest way to prevent resource leaks.
*   **Tradeoff:** While `try-catch` blocks make code robust, over-using them can make code hard to read. Catch only what you can recover from.
*   **Tradeoff:** Finalizers are nondeterministic. You cannot predict exactly when they will run, so never rely on them for critical cleanup; always prefer `Dispose`.

# What later lessons cover
*   **Detailed API usage:** How to use specific exception types like `ArgumentNullException` or `OperationCanceledException`.
*   **Advanced Disposal:** Choosing the appropriate disposal implementation for owned resources, including the inheritable `Dispose(bool disposing)` pattern when required.
*   **SafeHandle:** How to wrap unmanaged OS handles to prevent memory corruption.
*   **Async Disposal:** Using `IAsyncDisposable` and `await using` for resources that require asynchronous cleanup (like network streams).

*Sources: [Microsoft Exception Handling](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/exceptions/exception-handling), [Best Practices for Exceptions](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions), [Implementing Dispose](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose).*
