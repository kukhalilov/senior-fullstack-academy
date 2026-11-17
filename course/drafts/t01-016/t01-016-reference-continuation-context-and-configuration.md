<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# async and await Task ValueTask cancellation and continuation context — Reference: Synchronization context, scheduler, execution context, ConfigureAwait, and deadlock behavior

*This is an automatically generated draft.*

# Scope and version
This lesson covers the mechanisms for managing continuation contexts in asynchronous C# code. It focuses on how .NET tracks where code resumes after an `await` expression. The information provided is accurate for .NET 11 GA and C# 15 as of 2026-11-14.

# How this group fits the mental model
In asynchronous programming, an `async` method pauses when it encounters an incomplete `await`. When the operation finishes, the method must resume. The "continuation" is the code that runs after the `await`. 

For an incomplete `await`, the default task awaiter captures a non-default `SynchronizationContext`; if none exists, it may capture a non-default `TaskScheduler`. The continuation requests execution through that captured context or scheduler. An already-completed await usually continues synchronously. `ExecutionContext` flows ambient state separately. Capturing a single-threaded UI context preserves UI affinity; blocking that thread while a continuation needs it can deadlock.

# Supplied names explained

* `SynchronizationContext`: An abstraction that can marshal work to an environment-specific execution context, commonly a UI dispatcher. ASP.NET Core normally does not install a request-specific `SynchronizationContext`.
* `SynchronizationContext.Current`: Gets the `SynchronizationContext` for the current thread.
* `SynchronizationContext.Post`: Dispatches an asynchronous message to the context.
* `SynchronizationContext.Send`: Dispatches a synchronous message to the context.
* `TaskScheduler`: Manages the queuing of tasks onto threads.
* `ExecutionContext`: A container for ambient information (like security or user identity) that flows across asynchronous points.
* `ExecutionContext flow`: The process by which `ExecutionContext` is captured when an operation starts and restored when it resumes.
* `AsyncLocal<T>`: A storage mechanism that allows data to flow with the `ExecutionContext` across asynchronous calls.
* `SynchronizationContext capture at await`: The internal mechanism where the runtime checks for a `SynchronizationContext` at the point of an `await`.
* `TaskScheduler capture at await`: The internal mechanism where the runtime checks for a `TaskScheduler` if no `SynchronizationContext` is present.
* `Continuation context restoration`: The process of returning execution to the captured context after an `await`.
* `ConfigureAwait(Boolean)`: A method used to configure the awaiter to either continue on the captured context (`true`) or not (`false`).
* `Task.ConfigureAwait(Boolean)`: Configures the awaiter for a non-generic `Task`.
* `Task<T>.ConfigureAwait(Boolean)`: Configures the awaiter for a generic `Task<T>`.
* `ValueTask.ConfigureAwait(Boolean)`: Configures the awaiter for a non-generic `ValueTask`.
* `ValueTask<T>.ConfigureAwait(Boolean)`: Configures the awaiter for a generic `ValueTask<T>`.
* `ConfigureAwaitOptions.None`: A flag indicating no specific configuration.
* `ConfigureAwaitOptions.ContinueOnCapturedContext`: A flag requesting continuation on the captured `SynchronizationContext` or non-default `TaskScheduler` when available; it does not force a thread switch.
* `ConfigureAwaitOptions.ForceYielding`: A flag that forces the task to yield even if it is already complete.
* `ConfigureAwaitOptions.SuppressThrowing`: An option for non-generic `Task.ConfigureAwait(ConfigureAwaitOptions)` that suppresses propagation of a fault or cancellation from that await; it is not a general exception-handling substitute.
* `ConfigureAwaitOptions`: An enum providing granular control over await behavior.
* `ConfiguredTaskAwaitable.ConfigureAwait(Boolean)`: Allows chaining configuration on an already configured awaitable.
* `ConfigureAwait(false) library-code convention`: A library may opt out of captured-context resumption when its continuation does not require caller affinity. This is a per-await placement choice, not a universal rule, deadlock cure, or guaranteed optimization.
* `UI synchronization context continuation`: The specific behavior of resuming on the UI thread.
* `ASP.NET Core absence of a custom SynchronizationContext`: A key architectural detail where ASP.NET Core does not use a `SynchronizationContext`, making `ConfigureAwait(false)` less critical for deadlocks but still useful for performance.
* `Blocking wait and single-threaded context deadlock`: A failure mode where a thread waits synchronously for a task that needs that same thread to complete its continuation.
* `Sync-over-async thread starvation`: A performance issue caused by blocking threads while waiting for async tasks, leading to pool exhaustion.
* `ConfigureAwait(false) does not create a thread`: A clarification that `ConfigureAwait(false)` only changes *where* the code resumes, not *how* it executes.
* `ExecutionContext versus SynchronizationContext`: The distinction between ambient data (ExecutionContext) and the environment/thread-affinity (SynchronizationContext).
* `ExecutionContext.SuppressFlow`: Temporarily prevents `ExecutionContext` from flowing to newly scheduled asynchronous work. Restore flow with the returned `AsyncFlowControl`; do not call `Undo` from a different execution context or keep flow suppressed across an `await`.
* `Task.Run ExecutionContext flow`: How `Task.Run` captures the caller's `ExecutionContext` and applies it to the task.
* `ThreadPool continuation scheduling`: With no captured context or non-default scheduler, asynchronously queued task continuations normally use the default ThreadPool scheduler; a continuation may also run inline on the completing thread when the awaiter and task permit it.

# Cross-item comparison
* **`SynchronizationContext` vs `TaskScheduler`**: `SynchronizationContext` is a higher-level abstraction often tied to specific application models (like UI), while `TaskScheduler` is a lower-level mechanism for managing task execution.
* **`ConfigureAwait(true)` vs `ConfigureAwait(false)`**: `true` (the default) requests use of a captured `SynchronizationContext` or non-default `TaskScheduler`; `false` opts out of that request. It does not guarantee a different thread, and a continuation can run inline on the completing thread.
* **`Task` vs `ValueTask` configuration**: Both support `ConfigureAwait`. `ValueTask` can avoid a `Task` allocation for some synchronous completions; do not assume it is allocation-free.

# Examples
```csharp
// This continuation does not need the caller's captured context
public async Task<string> GetDataAsync()
{
    // We don't need the UI context here, so we opt out.
    var result = await _httpClient.GetStringAsync("...").ConfigureAwait(false);
    return result;
}
```

# Common mistakes
* **Deadlocking**: Calling `.Result` or `.Wait()` on a task in a UI or ASP.NET (legacy) context while the task is trying to resume on that same context.
* **Using `ConfigureAwait(false)` before UI-affine work**: The continuation is not guaranteed to return through the UI context. It may still run on the UI thread in some executions, so code must not rely on that; explicitly dispatch UI work through the framework when needed.
* **Assuming `ConfigureAwait(false)` creates parallelism**: It does not; it only allows the continuation to run on a different thread if the task completes asynchronously.

# Knowledge checks with answers
1. **Question**: Why should library code use `ConfigureAwait(false)`?
   **Answer**: To opt out of captured-context resumption where the library continuation has no affinity requirement. This can avoid some dispatches, but is not a universal requirement or guarantee against deadlock.
2. **Question**: Does `ConfigureAwait(false)` force code to run on a background thread?
   **Answer**: No. It opts out of captured-context resumption. If the task is already complete, execution usually continues inline; otherwise the continuation may run on the thread that completes the operation or be scheduled elsewhere.
3. **Question**: What is the difference between `ExecutionContext` and `SynchronizationContext`?
   **Answer**: `ExecutionContext` carries ambient data (like `AsyncLocal` or security tokens), while `SynchronizationContext` manages the environment/thread where code resumes.

*Source: [Microsoft C# asynchronous programming guide](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)*
