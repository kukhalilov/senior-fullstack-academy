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

The `ArgumentException.ThrowIfNullOrEmpty` helper is available starting in .NET 7; `ThrowIfNullOrWhiteSpace` and the generic `ArgumentOutOfRangeException.ThrowIf*` numeric helpers are available starting in .NET 8. `CancellationTokenSource.CancelAsync` is available in .NET 8 and later. Check the target framework when using these APIs in a multi-targeted library.

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
* `InvalidCastException`: Thrown when a runtime conversion cannot be performed, for example an invalid unboxing or explicit reference conversion; the exact contract depends on the operation.
* `NullReferenceException`: Thrown when there is an attempt to dereference a null object reference.
* `IndexOutOfRangeException`: Thrown when an attempt is made to access an array element with an index outside its bounds.
* `KeyNotFoundException`: Thrown when the key specified for accessing an element in a collection does not match any key in the collection.
* `IOException`: The exception that is thrown when an I/O error occurs.
* `UnauthorizedAccessException`: Thrown when the operating system denies access to a resource or operation; it is distinct from the broader set of I/O failures.
* `TimeoutException`: Thrown when the time allotted for a process or operation expires.
* `OperationCanceledException`: The standard exception signal for cooperative cancellation. APIs can throw it (or a derived type) when an operation observes cancellation; cancellation is not automatically forced by the runtime.
* `TaskCanceledException`: A derived `OperationCanceledException` commonly used when a task is canceled. Callers that handle cancellation generally catch the base type unless they need task-specific details.
* `OutOfMemoryException`: Thrown when there is not enough memory to continue the execution of a program.
* `StackOverflowException`: Reports stack exhaustion. In modern .NET, most stack-overflow cases terminate the process and are not a recoverable condition for ordinary application code.
* `SystemException`: A base class for many runtime-defined exceptions; it is not the base class of every exception (all exceptions derive from `Exception`).

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
* `CancellationTokenSource.Token`: Gets the token clients receive and observe for cancellation.
* `CancellationTokenSource.CreateLinkedTokenSource`: Creates and owns a source that relays cancellation from one or more supplied tokens; dispose the linked source when the combined operation ends.
* `Task cancellation state and token matching`: A task becomes `Canceled` when it cooperatively acknowledges cancellation according to task/token rules; merely returning after observing a token can instead complete successfully. Inspect the exception token when distinguishing cancellation sources.
* `CancellationTokenRegistration.DisposeAsync`: Asynchronously unregisters a callback and completes after it is no longer running, except the documented self-unregistering edge case.
* `CancellationTokenSource.CancelAsync`: Requests cancellation and asynchronously completes after registered callbacks finish; unlike `Cancel`, it does not synchronously wait for all callback execution.
* `CancellationTokenSource.Dispose`: Releases resources used by the source. Dispose a source and linked sources when their operation lifetime ends.
* `CancellationTokenSource.TryReset`: Attempts to reset an eligible source that has not had cancellation requested. It is intended for a sole owner after its operation completes; concurrent cancellation/reset is not thread-safe, and a new source per operation is often simpler.
* `CancellationToken.Register`: Registers a callback to run when cancellation is requested; dispose its returned registration when its lifetime ends if needed to release captured state promptly.
* `CancellationToken.CanBeCanceled`: Indicates whether the token can ever transition to canceled.
* `CancellationToken.WaitHandle`: Provides a wait handle signaled on cancellation for integration with wait-based APIs.
* `CancellationTokenRegistration.Dispose` / `DisposeAsync`: Releases a registered callback; the async form can avoid synchronously blocking while waiting for callback completion.

### Concepts
* `Catch OperationCanceledException for asynchronous cancellation`: A common way to recognize cooperative cancellation at a boundary that can respond to it. Preserve cancellation semantics when the caller's request should continue propagating.
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
