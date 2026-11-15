<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# exceptions error handling and disposal — Reference: Standard exception types, argument validation, cancellation, and retry signals

*This is an automatically generated draft.*

# Scope and version
This lesson covers standard exception types, argument validation, and cancellation patterns in C# 15 / .NET 11. It focuses on the contracts for reporting failures and managing resource lifecycles. For further details, see the [Microsoft .NET Exception Guidance](https://learn.microsoft.com/en-us/dotnet/standard/exceptions/best-practices-for-exceptions).

# How this group fits the mental model
In .NET, an exception reports that an operation cannot complete under its current contract. You should only catch exceptions when you can recover or add meaningful context. Otherwise, let them propagate. 

This group of APIs provides:
1. **Standardized Error Reporting:** Specific types that tell the caller exactly *why* a method failed (e.g., bad input vs. invalid state).
2. **Validation Helpers:** Static methods that reduce boilerplate code when checking arguments.
3. **Cancellation Infrastructure:** A pattern to stop long-running operations gracefully.

# Supplied names explained

### Exception Types
* `ArgumentException`: Thrown when one of the arguments provided to a method is not valid.
* `ArgumentNullException`: Thrown when a null reference is passed to a method that does not accept it.
* `ArgumentOutOfRangeException`: Thrown when the value of an argument is outside the allowable range of values.
* `InvalidOperationException`: Thrown when a method call is invalid for the object's current state.
* `NotSupportedException`: Thrown when an invoked method is not supported.
* `NotImplementedException`: Thrown when a requested method or operation is not implemented.
* `ObjectDisposedException`: Thrown when an operation is performed on an object that has already been disposed.
* `FormatException`: Thrown when the format of an argument is invalid.
* `OverflowException`: Thrown when an arithmetic, casting, or conversion operation results in an error.
* `InvalidCastException`: Thrown when an explicit conversion from a base type to an interface or derived type fails.
* `NullReferenceException`: Thrown when there is an attempt to dereference a null object reference.
* `IndexOutOfRangeException`: Thrown when an attempt is made to access an array element with an index outside its bounds.
* `KeyNotFoundException`: Thrown when the key specified for accessing an element in a collection does not match any key in the collection.
* `IOException`: The exception that is thrown when an I/O error occurs.
* `UnauthorizedAccessException`: Thrown when the operating system denies access because of an I/O error or a security error.
* `TimeoutException`: Thrown when the time allotted for a process or operation expires.
* `OperationCanceledException`: Thrown in a thread upon cancellation of an operation that the thread was executing.
* `TaskCanceledException`: A specialized `OperationCanceledException` used when a task is canceled.
* `OutOfMemoryException`: Thrown when there is not enough memory to continue the execution of a program.
* `StackOverflowException`: Thrown when the execution stack overflows because it contains too many nested method calls.
* `SystemException`: The base class for all predefined system exceptions.

### Validation and Cancellation Helpers
* `ArgumentException.ThrowIfNullOrEmpty`: Throws if a string is null or empty.
* `ArgumentException.ThrowIfNullOrWhiteSpace`: Throws if a string is null, empty, or consists only of white-space characters.
* `ArgumentNullException.ThrowIfNull`: Throws if the argument is null.
* `ArgumentOutOfRangeException.ThrowIfNegative`: Throws if the value is less than zero.
* `ArgumentOutOfRangeException.ThrowIfNegativeOrZero`: Throws if the value is less than or equal to zero.
* `ArgumentOutOfRangeException.ThrowIfZero`: Throws if the value is zero.
* `ArgumentOutOfRangeException.ThrowIfGreaterThan`: Throws if the value is greater than the specified limit.
* `ArgumentOutOfRangeException.ThrowIfLessThan`: Throws if the value is less than the specified limit.
* `ArgumentOutOfRangeException.ThrowIfNotEqual`: Throws if the value is not equal to the specified value.
* `CancellationToken.ThrowIfCancellationRequested`: Throws an `OperationCanceledException` if cancellation was requested.
* `CancellationToken.IsCancellationRequested`: Returns true if cancellation was requested.
* `CancellationTokenSource.Cancel`: Communicates a request for cancellation.
* `CancellationTokenSource.CancelAfter`: Schedules a cancellation request after a specified delay.
* `CancellationTokenSource linked token`: A token created by linking two or more tokens; cancellation of any source cancels the linked token.

### Concepts
* `Catch OperationCanceledException for asynchronous cancellation`: The standard way to handle graceful task termination.
* `Cancellation versus timeout`: Cancellation is an explicit request to stop; a timeout is an implicit failure due to time limits.
* `Transient failure versus permanent failure`: Transient failures (e.g., network blip) might succeed on retry; permanent failures (e.g., invalid argument) will not.
* `Retry only when operation and failure are retryable`: Avoid retrying logic that is guaranteed to fail again.
* `Avoid exceptions for routine branching`: Use `if` statements for expected logic; use exceptions only for truly exceptional states.

# Cross-item comparison
* **`throw;` vs `throw exceptionVariable;`**: Use `throw;` to rethrow an exception while preserving the original stack trace. Using `throw ex;` resets the stack trace to the current location, losing debugging information.
* **`OperationCanceledException` vs `TaskCanceledException`**: `TaskCanceledException` is a subclass of `OperationCanceledException`. Use the base class for general cancellation handling.
* **`IDisposable` vs `IAsyncDisposable`**: Use `IDisposable` for synchronous cleanup; use `IAsyncDisposable` when cleanup requires asynchronous operations (like closing a network stream).

# Examples
```csharp
// Validation example
public void ProcessData(string name, int count)
{
    ArgumentException.ThrowIfNullOrWhiteSpace(name);
    ArgumentOutOfRangeException.ThrowIfNegative(count);
    // ... logic
}

// Cancellation example
public async Task DoWork(CancellationToken ct)
{
    ct.ThrowIfCancellationRequested();
    await Task.Delay(1000, ct);
}
```

# Common mistakes
1. **Swallowing exceptions:** Catching an exception and doing nothing (`catch {}`) hides bugs.
2. **Using exceptions for flow control:** Throwing an exception to signal a "not found" state is expensive; use a return value or `TryGet` pattern instead.
3. **Not disposing:** Forgetting to use `using` blocks for objects that implement `IDisposable` leads to resource leaks.

# Knowledge checks with answers
1. **Question:** Which exception should you throw if a method receives a null argument?
   **Answer:** `ArgumentNullException`.
2. **Question:** Why should you use `throw;` instead of `throw ex;`?
   **Answer:** `throw;` preserves the original stack trace, which is essential for debugging.
3. **Question:** Is it appropriate to use an exception to signal that a user entered an invalid password?
   **Answer:** No. This is a routine validation scenario; use a return value or result object instead.
