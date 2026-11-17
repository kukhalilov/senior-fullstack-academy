<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# async and await Task ValueTask cancellation and continuation context — Reference: Task-based asynchronous pattern, async methods, awaitables, and compiler behavior

*This is an automatically generated draft.*

# Scope and version
This lesson covers the core language constructs and patterns for asynchronous programming in C# as of .NET 11 GA and C# 15. It focuses on the mechanics of the Task-based Asynchronous Pattern (TAP) and the compiler-generated machinery that enables `async` and `await`.

# How this group fits the mental model
Asynchronous programming in C# is built on the **Task-based Asynchronous Pattern (TAP)**. The mental model is that an `async` method is a state machine that runs synchronously until it hits an incomplete `await` expression. At that point, it pauses, registers a continuation, and returns control to the caller. When the awaited operation completes, the state machine resumes. The items below represent the language keywords, method signatures, and low-level interfaces that the compiler uses to transform your code into this state machine.

# Supplied names explained

* `Task-based Asynchronous Pattern (TAP)`: The fundamental design pattern in .NET where asynchronous operations return a `Task` or `ValueTask` to represent ongoing work.
* `async modifier`: A keyword applied to a method, lambda, or anonymous function to enable the use of `await` inside it and trigger compiler state-machine generation.
* `await expression`: An operator that obtains an awaiter result; when the awaiter is incomplete, the async method suspends and yields control to its caller, then resumes after completion. An already-completed awaiter need not suspend.
* `async method`: A method marked with the `async` modifier that returns a supported task-like type, including `Task`, `Task<T>`, `ValueTask`, `ValueTask<T>`, a custom type with an appropriate async method builder, or `void` for event-handler signatures. Async iterators return `IAsyncEnumerable<T>` or `IAsyncEnumerator<T>`.
* `async lambda expression`: An anonymous function marked `async` that can be passed as a delegate.
* `async anonymous function`: A delegate defined with the `async` keyword, often used for callbacks.
* `async local function`: A method defined inside another method, marked `async`, used to encapsulate asynchronous logic locally.
* `async Main`: The entry point of a C# application, which can be marked `async` to allow top-level `await` calls.
* `Task-returning method`: An async method that returns `Task`, representing an operation that completes without a result.
* `Task<T>-returning method`: An async method that returns `Task<T>`, representing an operation that completes with a result of type `T`.
* `ValueTask-returning method`: An async method that returns `ValueTask`, which may reduce `Task` allocations when operations often complete synchronously.
* `ValueTask<T>-returning method`: An async method that returns `ValueTask<T>`, which may reduce `Task<T>` allocations when operations often complete synchronously.
* `async void method`: An async method returning `void`, primarily for event handlers; it cannot be awaited and its caller cannot observe completion or catch exceptions through a returned task.
* `Async method builder`: The builder associated with the async return type that coordinates state-machine execution and completion; custom task-like types use `AsyncMethodBuilderAttribute` to identify a builder.
* `Async state machine`: A compiler-generated implementation that tracks execution across incomplete `await` points. Its emitted representation is a compiler detail and should not be described as always being a class.
* `Generalized async return type`: C# permits an async method to return a task-like type with the required awaiter and a compatible async method builder.
* `Custom task-like return type and AsyncMethodBuilderAttribute`: A custom task-like return type associates its builder through `AsyncMethodBuilderAttribute`; this is an advanced library-author feature.
* `AsyncStateMachineAttribute and generated state-machine implementation`: The compiler emits this metadata to associate the async method with its generated state-machine type; generated representation details are compiler implementation details.
* `Awaitable pattern`: The set of requirements (a `GetAwaiter` method) that allows a type to be used with the `await` keyword.
* `GetAwaiter pattern`: The specific method signature that returns an object capable of handling the `await` process.
* `INotifyCompletion`: An interface that allows the state machine to register a callback (continuation) to run when an operation completes.
* `ICriticalNotifyCompletion`: An interface extending `INotifyCompletion` with `UnsafeOnCompleted`, allowing the awaiter contract to register a continuation without requesting `ExecutionContext` flow for that callback; the compiler-generated async machinery manages its own required context behavior.
* `TaskAwaiter`: The struct that provides the `await` logic for `Task`.
* `TaskAwaiter<T>`: The struct that provides the `await` logic for `Task<T>`.
* `ValueTaskAwaiter`: The struct that provides the `await` logic for `ValueTask`.
* `ValueTaskAwaiter<T>`: The struct that provides the `await` logic for `ValueTask<T>`.
* `ConfiguredTaskAwaitable`: The result of calling `ConfigureAwait` on a `Task`, used to control continuation behavior.
* `ConfiguredTaskAwaitable<T>`: The result of calling `ConfigureAwait` on a `Task<T>`.
* `ConfiguredValueTaskAwaitable`: The result of calling `ConfigureAwait` on a `ValueTask`.
* `ConfiguredValueTaskAwaitable<T>`: The result of calling `ConfigureAwait` on a `ValueTask<T>`.
* `Awaiter.IsCompleted`: A property indicating if the awaited operation is already finished.
* `Awaiter.GetResult`: A method that returns the result of the operation or rethrows the exception if the operation failed.
* `Awaiter.OnCompleted`: A method to register a continuation to execute when the operation completes.
* `Awaiter.UnsafeOnCompleted`: The awaiter hook for registering a continuation without requesting `ExecutionContext` flow for that callback; async method builders preserve the context behavior required by the generated state machine.
* `Execution before first incomplete await`: The synchronous portion of an `async` method that runs before the first `await`.
* `Continuation after incomplete await`: The code block that resumes execution once the awaited task completes.
* `Exception propagation through await`: The behavior where exceptions in an awaited task are rethrown in the caller's context when `await` is called.
* `Task-returning async method versus direct Task return`: The difference between `async` methods (which create a state machine) and methods that return a `Task` directly (which avoid the state machine overhead).
* `Async suffix naming convention`: The standard practice of appending "Async" to the names of asynchronous methods.
* `async void event-handler exception behavior`: The specific rule that exceptions in `async void` methods cannot be caught by the caller and are propagated through the applicable `SynchronizationContext`; an unhandled exception may terminate the application depending on the host.
* `Top-level async entry point`: The ability to use `await` directly in the global scope of a C# file (C# 9+).

# Cross-item comparison
No within-group comparison applies, as these items represent distinct components of the compiler-driven async infrastructure.

# Examples
```csharp
// Example of an async method
public async Task<int> GetDataAsync() // Async suffix naming convention
{
    // Execution before first incomplete await
    var result = await FetchFromNetworkAsync(); // await expression
    // Continuation after incomplete await
    return result.Length;
}
```

# Common mistakes
* **Using `async void` for non-event handlers:** This makes it impossible to await the method or catch exceptions, so callers cannot await completion or handle exceptions through a returned `Task`; the host determines how unhandled exceptions are handled.
* **Forgetting `ConfigureAwait(false)` in libraries:** A library that requires no caller affinity may opt out of captured-context resumption at relevant awaits, but `ConfigureAwait(false)` is not a universal requirement or complete deadlock fix.
* **Blocking on async code:** Using `.Result` or `.Wait()` instead of `await` can lead to thread pool starvation and deadlocks.

# Knowledge checks with answers
1. **Question:** What happens if an exception is thrown in an `async void` method?
   **Answer:** The caller cannot catch it through a returned task. It is posted to the applicable synchronization context and may be unhandled by the host.
2. **Question:** Why should you prefer `Task` over `ValueTask` for general-purpose APIs?
   **Answer:** `Task` is a reference type that is easier to manage, cache, and await multiple times, whereas `ValueTask` has specific consumption rules and is intended for performance-sensitive scenarios.
3. **Question:** What is the purpose of the `Async state machine`?
   **Answer:** It allows the compiler to break a method into pieces, enabling the method to pause at `await` points and resume later without blocking a thread.

*Source: [Microsoft C# asynchronous programming guide](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)*
