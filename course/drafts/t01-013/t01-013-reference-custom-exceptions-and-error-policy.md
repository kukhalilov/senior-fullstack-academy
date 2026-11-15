<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# exceptions error handling and disposal — Reference: Exception type design, invariants, logging, boundaries, and security

*This is an automatically generated draft.*

# Scope and version
This lesson covers the design, handling, and policy patterns for exceptions and resource disposal in C# 15 and .NET 11. It focuses on the architectural standards for creating custom exceptions and managing error boundaries.

Source: [Microsoft .NET Exception Best Practices](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions)

# How this group fits the mental model
In .NET, an exception represents a failure to fulfill a contract. While managed memory is handled automatically by the Garbage Collector, external resources (like file handles or network sockets) require deterministic cleanup. This group of items defines how to create custom error types that communicate failure clearly and how to handle those failures without compromising the stability of your application.

# Supplied names explained

* `Custom exception type`: A class created to represent a specific domain-level failure. It should be used when the caller needs to programmatically distinguish this error from others.
* `Derive application exception from Exception`: All custom exceptions must inherit from `System.Exception` (or a more specific base class like `InvalidOperationException`). Never derive from `ApplicationException`.
* `Exception type name suffix convention`: Custom exception classes should end with the word `Exception` (e.g., `InvalidConfigurationException`).
* `Serializable exception guidance for legacy remoting compatibility`: If your application interacts with legacy .NET Remoting, custom exceptions should be marked with the `[Serializable]` attribute and include a serialization constructor.
* `Custom exception constructors`: A standard exception should provide at least three constructors: a parameterless one, one that takes a message string, and one that takes a message string and an inner exception.
* `Exception message as diagnostic context`: The message property should provide a human-readable explanation of the error, including relevant state information that helps a developer diagnose the root cause.
* `Inner exception preservation`: When catching an exception and throwing a new one, always pass the original exception into the new exception's constructor to preserve the full stack trace.
* `Exception.Data diagnostic metadata`: A dictionary property on the `Exception` class used to store additional key-value pairs that provide context about the state of the object when the error occurred.
* `Catch only exceptions a layer can handle`: Do not catch exceptions unless you can perform a meaningful recovery action or translate the error into a more relevant domain exception.
* `Catch specific exception type`: Always catch the most specific exception possible (e.g., `FileNotFoundException` instead of `Exception`) to avoid hiding unexpected bugs.
* `Catch and rethrow with throw`: Use the `throw;` statement inside a catch block to re-throw the original exception while preserving the original stack trace.
* `Exception translation at abstraction boundary`: When a low-level component (like a database driver) throws an error, catch it and wrap it in a domain-specific exception before passing it to higher layers.
* `Do not expose internal exception details to clients`: Avoid leaking stack traces or internal system state to end-users, as this is a security risk and poor user experience.
* `Log exception once at an ownership boundary`: Log errors at the highest level of the application where the error is "owned" or handled, preventing redundant log entries.
* `Avoid duplicate exception logging`: Ensure that an exception is logged only once to avoid cluttering logs and making debugging difficult.
* `Restore object invariants after failed operation`: If an operation fails, ensure the object is left in a valid, consistent state so that subsequent operations do not fail unpredictably.
* `Exception safety guarantee`: A promise that a method will either succeed or, if it fails, leave the system in a predictable state without leaking resources.
* `Cancellation propagation policy`: Ensure that `OperationCanceledException` is allowed to propagate up the call stack to stop background tasks correctly.
* `Fail-fast versus recoverable exception`: Distinguish between errors that require a process restart (fail-fast) and those that can be handled by retrying or informing the user (recoverable).
* `Exception filter side-effect restriction`: Exception filters (`when` clauses) should be pure and avoid modifying state, as they may be evaluated multiple times or in different contexts.
* `Do not swallow exceptions silently`: Never catch an exception and leave the block empty; this hides bugs and makes the system state unpredictable.
* `Do not catch Exception without a recovery policy`: Catching the base `Exception` type is dangerous because it can hide critical system failures like `OutOfMemoryException`.
* `Exception handling in background work`: Background tasks must explicitly handle exceptions, as unhandled exceptions in background threads can terminate the process.
* `Exception handling in event callbacks`: Event handlers should be robust; an unhandled exception in an event callback can crash the subscriber or the event publisher.

# Cross-item comparison

* **`throw;` vs `throw exceptionVariable;`**: `throw;` preserves the original stack trace, whereas `throw exceptionVariable;` resets the stack trace to the current line, losing the original point of failure.
* **`Exception` vs `Result value`**: Use exceptions for truly exceptional, unexpected failures. Use return types (like `Result<T>`) for expected outcomes that are part of the normal business flow.

# Examples

```csharp
// Example: Proper custom exception structure
public class DataProcessingException : Exception
{
    public DataProcessingException() { }
    public DataProcessingException(string message) : base(message) { }
    public DataProcessingException(string message, Exception inner) : base(message, inner) { }
}

// Example: Proper rethrowing
try {
    PerformOperation();
} catch (IOException ex) {
    // Log and wrap
    throw new DataProcessingException("Operation failed.", ex);
}
```

# Common mistakes

1. **Swallowing exceptions**: Catching an exception and doing nothing. This makes it impossible to know why a feature stopped working.
2. **Catching `System.Exception`**: Catching the base class often catches errors you cannot recover from, such as thread aborts or memory issues.
3. **Modifying state in a filter**: Using a `when` clause to increment a counter or change a variable; this can lead to non-deterministic behavior.

# Knowledge checks with answers

1. **Question**: Why should you use `throw;` instead of `throw ex;`?
   **Answer**: `throw;` preserves the original stack trace, allowing you to see exactly where the error originated. `throw ex;` resets the stack trace to the current line.

2. **Question**: Should you catch `Exception`?
   **Answer**: Only if you are at the very top level of an application and intend to log the error and shut down gracefully. Otherwise, catch specific types.

3. **Question**: What is the purpose of an inner exception?
   **Answer**: It allows you to wrap a low-level technical error (like a socket timeout) inside a high-level domain error (like "ServiceUnavailableException") while keeping the original cause available for debugging.
