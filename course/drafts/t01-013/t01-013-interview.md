<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# exceptions error handling and disposal — Interview questions and reasoning

*This lesson is an automatically generated draft.*

# Core questions
In an interview, you will be asked how to manage failures and resources. The core concepts are:
*   **Exceptions:** Used for reporting that an operation cannot complete its contract. They are not for routine control flow.
*   **Disposal:** A deterministic way to release non-memory resources (like file handles or network sockets) before the Garbage Collector (GC) eventually reclaims the object.
*   **Exception Safety:** Ensuring that if an operation fails, the object remains in a valid state (invariants are preserved) and resources are not leaked.

# Concise interview answers
*   **When should you throw an exception?** Only when an operation cannot fulfill its contract. Avoid using exceptions for expected outcomes or routine branching.
*   **What is the difference between `throw;` and `throw ex;`?** `throw;` preserves the original stack trace, which is critical for debugging. `throw ex;` resets the stack trace to the current line, losing the original context.
*   **Why use `IDisposable`?** It provides a standard contract for deterministic cleanup of unmanaged resources.
*   **What is the purpose of `using`?** It ensures `Dispose()` is called automatically when the object goes out of scope, even if an exception occurs.

# Deep follow-up answers
*   **How do you handle exceptions in async methods?** Exceptions in `async` methods are captured in the returned `Task` or `ValueTask`. When you `await` the task, the exception is re-thrown.
*   **What is an Exception Filter?** A `when` clause in a `catch` block. It allows you to inspect an exception without unwinding the stack. If the filter returns `false`, the catch block is skipped, and the search for a handler continues. This is safer than catching and re-throwing because it preserves the original stack state.
*   **Why use `SafeHandle` instead of a finalizer?** A finalizer is nondeterministic and runs on a dedicated thread. `SafeHandle` provides a robust, thread-safe wrapper for OS handles that prevents handle leaks and resurrection issues, making it the preferred way to manage unmanaged resources.

# Scenario questions
*   **Scenario:** You are writing a library and encounter an error. Should you catch it?
    *   **Answer:** Only if you can recover or translate it into a more meaningful exception for the caller. Otherwise, let it propagate. Never swallow exceptions silently.
*   **Scenario:** You have a resource that requires asynchronous cleanup.
    *   **Answer:** Implement `IAsyncDisposable` and use `await using` to ensure the cleanup is performed correctly without blocking the thread.

# Tradeoffs and alternatives
*   **`throw;` vs `throw exceptionVariable;`**: Always prefer `throw;` to maintain the original stack trace.
*   **`IDisposable` vs Finalizer**: `IDisposable` is for deterministic cleanup (you control when it happens). Finalizers are a last-resort safety net for unmanaged resources.
*   **`using` statement vs `try-finally`**: The `using` statement is syntactic sugar for a `try-finally` block. It is cleaner and less error-prone.
*   **`OperationCanceledException` vs `TaskCanceledException`**: `OperationCanceledException` is the base class; `TaskCanceledException` is a specific implementation. Catching the base class is generally preferred for broader cancellation handling.

# Common weak answers
*   **"I catch `Exception` to prevent the app from crashing."** 
    *   *Correction:* Catching the base `Exception` is dangerous because it hides bugs (like `NullReferenceException`) that you cannot recover from. Catch only specific exceptions you expect and can handle.
*   **"I use finalizers to close database connections."** 
    *   *Correction:* Finalizers are too slow and nondeterministic. Always use `Dispose()` or `using` blocks for database connections.
*   **"I log every exception I catch."** 
    *   *Correction:* Log only at the boundary where you decide to handle the exception. Logging at every level leads to "log noise" and makes debugging harder.

# Self-check rubric
*   **Can you explain the difference between managed memory and unmanaged resources?** (Managed memory is GC-reclaimed; unmanaged resources require `Dispose`.)
*   **Do you know when to use `await using`?** (When the resource implements `IAsyncDisposable`.)
*   **Can you identify the "Dispose Pattern"?** (Implementing `IDisposable`, using a `protected virtual Dispose(bool)` method, and calling `GC.SuppressFinalize(this)`.)
*   **Do you understand why `ExceptionFilter` is superior to `if` inside a `catch`?** (It prevents stack unwinding and preserves the original error context.)

*Source: [Microsoft .NET Exception Guidance](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions), [IDisposable Pattern](https://learn.microsoft.com/en-us/dotnet/standard/garbage-collection/implementing-dispose)*
