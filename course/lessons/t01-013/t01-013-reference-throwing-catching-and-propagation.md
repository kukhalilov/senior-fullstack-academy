
# exceptions error handling and disposal — Reference: Throw forms, catch selection, filters, stack behavior, and cleanup flow

# Scope and version

This lesson covers the core mechanisms for exception handling, propagation, and rethrowing in C# 15 and .NET 11. It focuses on the `System.Exception` hierarchy, control flow statements for error management, and techniques for preserving stack information during rethrows.

*Source: [Microsoft .NET Exception Guidance](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions)*

# How this group fits the mental model

In .NET, an **exception** is a signal that an operation failed to meet its contract. The mental model separates "normal" logic from "exceptional" recovery. 
1. **Throwing:** You signal a failure.
2. **Catching:** You intercept the signal to recover or log.
3. **Propagation:** If you cannot handle an error, you allow it to move up the call stack.
4. **Cleanup:** Regardless of success or failure, resources must be released (often via `finally` or `using`).

# Supplied names explained

### The Exception Base
* `Exception`: The base class for all errors in .NET.
* `System.Exception`: The fully qualified name of the base class.
* `Exception.Message`: A human-readable string explaining the error.
* `Exception.InnerException`: References the original exception that caused the current one, used for wrapping.
* `Exception.Data`: A dictionary for providing additional user-defined key-value pairs.
* `Exception.HResult`: A numeric status code associated with the exception; its interpretation is framework-, operating-system-, or API-specific, and it is not a universal unique identifier.
* `Exception.Source`: The name of the application or object that caused the error.
* `Exception.StackTrace`: A string representation of the call stack when the exception was thrown.
* `Exception.TargetSite`: The method that threw the current exception.
* `Exception.HelpLink`: A URL or URN to a help file or documentation.
* `Exception.GetBaseException()`: Returns the original exception in a chain of inner exceptions.
* `Exception.ToString()`: Returns a string representation of the exception, including the stack trace.
* `Exception constructor with message`: Initializes a new instance with a specific error message.
* `Exception constructor with inner exception`: Initializes a new instance with a reference to the inner exception that caused it.

### Throwing and Control Flow
* `throw statement`: Used to interrupt execution and raise an exception.
* `throw expression`: Allows throwing an exception within an expression (e.g., `var x = y ?? throw new Exception();`).
* `throw; rethrow`: Re-throws the current exception while preserving the original stack trace.
* `throw exception-variable rethrow`: Throws an exception variable; note that this resets the stack trace to the current location.
* `try-catch statement`: Defines a block to attempt code and a block to handle specific exceptions.
* `try-finally statement`: Ensures code in the `finally` block runs regardless of whether an exception occurred.
* `try-catch-finally statement`: Combines exception handling and cleanup when control leaves through normal language/runtime unwinding; it cannot guarantee execution after immediate process termination.
* `Catch clause ordering`: Exceptions must be caught from most specific to least specific.
* `Catch type matching`: The runtime checks if the thrown exception is of the caught type or a derived type.
* `Catch-all clause`: A `catch` block without a type (e.g., `catch {}`) that handles all exceptions.
* `Exception filter`: A mechanism to evaluate a condition before the stack is unwound.
* `when exception filter`: The keyword used to define an `Exception filter`.
* `Filter evaluation before stack unwinding`: The runtime checks `when` conditions while the stack is still intact.
* `Finally execution on control transfer`: A `finally` block runs as control leaves its associated `try` in ordinary execution, including return/break/continue and exception unwinding. Immediate process termination (for example `Environment.FailFast`) is outside that guarantee.
* `Finally during exception propagation`: The `finally` block executes as the exception moves up the stack.
* `Exception propagation up the call stack`: The process of searching for a matching `catch` block in caller methods.
* `Unhandled exception boundary`: The application/runtime boundary reached when no handler accepts the exception. The outcome depends on execution context and host; unhandled exceptions on ordinary managed threads generally terminate the process, while frameworks may provide request-level handling boundaries.
* `Exception from iterator execution`: Exceptions in an iterator body are generally deferred until the relevant `MoveNext` call during enumeration; code before the first `yield` also executes as enumeration begins.
* `Exception from async method`: Exceptions from an `async Task` or `async ValueTask` method are represented by its returned task-like value and observed by awaiting it; an `async void` exception follows the synchronization-context/event-handler exception path instead.

### Advanced Handling and Aggregation
* `ExceptionDispatchInfo.Capture`: Captures the current state of an exception to be re-thrown later.
* `ExceptionDispatchInfo.Throw`: Throws the captured exception while preserving the original stack trace.
* `ExceptionDispatchInfo.SourceException`: Gets the exception captured by the `ExceptionDispatchInfo` object.
* `Preserve stack trace when rethrowing`: The practice of using `throw;` or `ExceptionDispatchInfo` to keep debugging context.
* `AggregateException`: A container for multiple exceptions, common in parallel programming.
* `AggregateException.InnerExceptions`: A collection of all exceptions contained within the aggregate.
* `AggregateException.Flatten`: Flattens nested `AggregateException` instances into a single list.
* `AggregateException.Handle`: A method to process each inner exception and decide if it is handled.
* `Exception wrapping and translation`: The practice of catching a low-level exception and throwing a more meaningful high-level one.

# Cross-item comparison

* **`throw;` vs `throw ex;`**: `throw;` preserves the original stack trace, while `throw ex;` resets it to the current line, losing debugging information.
* **`Exception filter` vs `Catch block condition`**: Filters (`when`) are evaluated before the stack is unwound, allowing you to inspect the exception state without losing the stack trace.
* **`AggregateException` vs `Exception`**: `AggregateException` is used when multiple operations (like parallel tasks) might fail simultaneously.

# Examples

```csharp
// The filter runs during handler search, before stack unwinding.
try
{
    Process();
}
catch (IOException ex) when (IsRetryable(ex))
{
    RetryOrReport(ex);
}
finally
{
    ReleaseTemporaryState(); // Runs during ordinary control transfer/unwinding.
}
```

# Common mistakes

1. **Swallowing exceptions:** Using an empty `catch {}` block hides bugs and makes debugging impossible.
2. **Resetting the stack:** Using `throw ex;` instead of `throw;` makes it impossible to see where the original error occurred.
3. **Over-catching:** Catching `Exception` instead of specific types (like `IOException`) can hide unrelated bugs (like `NullReferenceException`).

# Knowledge checks with answers

1. **Question:** How do you re-throw an exception without losing the stack trace?
   **Answer:** Use the `throw;` statement.

2. **Question:** When does a `finally` block execute?
   **Answer:** It executes after the `try` block (and `catch` block, if any) finishes, regardless of whether an exception was thrown or a `return` statement was reached.

3. **Question:** What is the purpose of an `Exception filter`?
   **Answer:** It allows you to conditionally catch an exception based on its properties while the stack is still intact, preventing unnecessary stack unwinding.

