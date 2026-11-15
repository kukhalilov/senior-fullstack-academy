<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# async and await Task ValueTask cancellation and continuation context — Reference: Composition, concurrency, exception aggregation, blocking hazards, and API design

# Scope and version

This lesson covers the composition, concurrency, and performance patterns for C# asynchronous programming as of .NET 11 GA and C# 15. It focuses on the correct usage of `Task` and `ValueTask` patterns, avoiding blocking hazards, and managing asynchronous lifecycles.

# How this group fits the mental model

In the Task-based Asynchronous Pattern (TAP), asynchronous methods represent work that may complete in the future. The items in this group provide the "best practices" for orchestrating this work. They ensure that you do not accidentally block threads (which causes starvation), that you handle exceptions correctly (which bubble up through `await`), and that you manage resources (like memory and concurrency limits) efficiently.

# Supplied names explained

* `Sequential awaits for independent operations`: A pattern where tasks are awaited one after another, causing the second to wait for the first to finish even if they could have run concurrently.
* `Start independent tasks before Task.WhenAll`: The practice of initiating multiple asynchronous operations before awaiting their combined completion, enabling parallel execution.
* `Task.WhenAll all-failure behavior`: The behavior where `Task.WhenAll` aggregates all exceptions from faulted tasks into a single `AggregateException` if multiple tasks fail.
* `Task.WhenAny result ownership`: The requirement to handle the specific task returned by `WhenAny`, as it represents the first completed operation among many.
* `Bounded asynchronous concurrency`: The strategy of limiting the number of concurrent asynchronous operations to prevent resource exhaustion.
* `SemaphoreSlim.WaitAsync`: An asynchronous method to enter a semaphore, allowing a task to wait for access to a resource without blocking the thread.
* `SemaphoreSlim.WaitAsync(CancellationToken)`: A version of `WaitAsync` that allows the wait operation to be cancelled via a token.
* `SemaphoreSlim.Release`: The method used to exit the semaphore, signaling that the resource is now available for other tasks.
* `Async throttling with SemaphoreSlim`: Using a semaphore to limit how many tasks can execute a specific block of code concurrently.
* `Unobserved task exception`: An exception that occurs in a task that is never awaited or checked, potentially causing process termination in older .NET versions.
* `Observe every started task`: The requirement to ensure every `Task` is either awaited, returned to a caller, or explicitly handled to prevent silent failures.
* `Fire-and-forget task ownership`: The pattern of starting a task without awaiting it; this is dangerous because exceptions may go unobserved and the caller cannot track completion.
* `Task exception observed by await`: The mechanism where `await` unwraps the first exception from a `Task` and re-throws it in the current context.
* `AggregateException from Wait and Result`: The exception type thrown when using synchronous blocking methods (`Wait()`, `Result`), which wraps the underlying exception.
* `Task.WhenAll.Exception aggregate`: The property containing all exceptions if multiple tasks passed to `WhenAll` fail.
* `ExceptionDispatchInfo and asynchronous stack traces`: A mechanism to preserve the original stack trace when re-throwing exceptions across asynchronous boundaries.
* `Exception after await`: The point in code where an exception from an awaited task is thrown into the calling method.
* `Cancellation exception after await`: The `OperationCanceledException` thrown when an awaited task is cancelled.
* `ThreadPool starvation from blocking`: A performance issue where synchronous blocking (e.g., `.Result`) consumes all available `ThreadPool` threads, preventing new tasks from starting.
* `CPU-bound work versus I/O-bound work`: The distinction between work that requires processor cycles (CPU-bound) and work that waits for external resources (I/O-bound).
* `Task.Run for CPU-bound work in responsive client application`: Using `Task.Run` to offload heavy calculations to a background thread to keep the UI responsive.
* `Task.Run is not required for naturally asynchronous I/O`: The principle that I/O-bound methods (like `HttpClient.GetAsync`) are already asynchronous and do not need `Task.Run`.
* `Async does not imply parallel execution`: The fact that `async` methods run on the current thread until they reach an `await`, meaning they are not automatically parallel.
* `Async does not guarantee faster execution`: The reality that async code adds overhead; it is designed for scalability and responsiveness, not raw speed.
* `Async API contagion through caller chain`: The requirement that once a method is `async`, its callers usually must also be `async` to await it properly.
* `Avoid async method without await`: A warning that async methods without `await` run synchronously and may hide exceptions.
* `Avoid async void except event-handler boundary`: The rule that `async void` should only be used for event handlers, as it cannot be awaited and its exceptions cannot be caught through a returned task; they are posted to the active synchronization context and may be unhandled by the host.
* `Avoid blocking with Wait and Result`: Avoid synchronous blocking within asynchronous call chains because it can deadlock or cause starvation; isolate any deliberate synchronous boundary.
* `Avoid unnecessary Task.Run wrappers`: The advice to avoid wrapping already-asynchronous I/O calls in `Task.Run`, which wastes thread resources.
* `Task versus ValueTask API return choice`: The decision to use `Task` for general cases and `ValueTask` for performance-critical, synchronous-completion scenarios.
* `Task caching and repeat await semantics`: A `Task` can be awaited repeatedly; a `ValueTask` may be backed by a reusable result or by a source with a stricter single-consumption contract, so callers must follow its API contract.
* `ValueTask conversion and allocation tradeoff`: The consideration that `ValueTask` avoids allocations for synchronous results but incurs overhead if converted to a `Task`.
* `Async disposal with await using`: The pattern for disposing of objects asynchronously using `await using`.
* `IAsyncDisposable.DisposeAsync`: The interface method for performing cleanup operations asynchronously.
* `await foreach cancellation with WithCancellation`: The method to pass a `CancellationToken` to an asynchronous stream iteration.
* `Background work lifetime in ASP.NET Core hosted service`: The management of long-running tasks within the application lifecycle.

# Cross-item comparison

* **`Task` vs `ValueTask`**: `Task` is the default for general APIs and supports repeated awaits. `ValueTask` is a struct that can avoid allocation in some synchronous-completion cases, but may add complexity; consumption constraints depend on its backing source.
* **`Wait()`/`Result` vs `await`**: `Wait()` and `Result` block the current thread and wrap exceptions in `AggregateException`. `await` suspends the method asynchronously and unwraps the original exception, making it the preferred approach.
* **`Task.Run` vs I/O-bound calls**: `Task.Run` is for offloading CPU-bound work to the `ThreadPool`. It usually adds needless scheduling overhead for I/O-bound work that already has an asynchronous API.

# Examples

**Parallelizing independent tasks:**
```csharp
// Bad: Sequential
var a = await DoWorkA();
var b = await DoWorkB();

// Good: Parallel
var taskA = DoWorkA();
var taskB = DoWorkB();
await Task.WhenAll(taskA, taskB);
```

**Avoiding blocking:**
```csharp
// Bad: Causes potential deadlock and starvation
var result = MyAsyncMethod().Result;

// Good: Non-blocking
var result = await MyAsyncMethod();
```

# Common mistakes

1. **Using `async void`**: This prevents the caller from awaiting the task or catching exceptions, often leaving exceptions unobserved by the caller; unhandled exceptions are delivered through the active synchronization context and may terminate the application depending on the host.
2. **Blocking on async code**: Using `.Result` or `.Wait()` can deadlock when a continuation needs a captured single-threaded context that is blocked by the wait; blocking can also contribute to thread-pool starvation.
3. **Ignoring `CancellationToken`**: Failing to pass tokens to methods that accept them prevents the application from responding to shutdown or user-cancellation requests.

# Knowledge checks with answers

1. **Question**: Why should you avoid `async void`?
   **Answer**: Because it cannot be awaited and exceptions are not captured in a returned task. They are propagated through the active synchronization context and may be unhandled by the host.
2. **Question**: When should you use `ValueTask`?
   **Answer**: Only when you have measured performance and determined that the allocation of a `Task` object is a bottleneck, and the API contract and callers can honor the particular `ValueTask` source’s consumption requirements.
3. **Question**: What is the difference between `Task.WhenAll` and `Task.WhenAny`?
   **Answer**: `Task.WhenAll` waits for all provided tasks to complete, while `Task.WhenAny` completes as soon as any one of the tasks finishes.

*Draft automatically generated. Sources: [Microsoft TAP Guidance](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap), [C# Async Programming](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/).*
