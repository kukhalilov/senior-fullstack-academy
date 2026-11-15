<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# async and await Task ValueTask cancellation and continuation context — Reference: Synchronization context, scheduler, execution context, ConfigureAwait, and deadlock behavior

*This is an automatically generated draft.*

# Scope and version
This lesson covers the mechanisms for managing continuation contexts in asynchronous C# code. It focuses on how .NET tracks where code resumes after an `await` expression. The information provided is accurate for .NET 11 GA and C# 15 as of 2026-11-14.

# How this group fits the mental model
In asynchronous programming, an `async` method pauses when it encounters an incomplete `await`. When the operation finishes, the method must resume. The "continuation" is the code that runs after the `await`. 

By default, .NET attempts to resume on the same "context" (like the UI thread) that was present before the `await`. This ensures that code interacting with UI elements does not cause cross-thread errors. However, this behavior can lead to deadlocks if the UI thread is blocked waiting for the task to finish. `ConfigureAwait` and context-related APIs allow you to control or bypass this behavior, which is critical for writing responsive applications and efficient, deadlock-free libraries.

# Supplied names explained

* `SynchronizationContext`: An abstraction that represents a specific environment (like a UI thread or a request context) where code should execute.
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
* `ConfigureAwaitOptions.ContinueOnCapturedContext`: A flag to force continuation on the captured context.
* `ConfigureAwaitOptions.ForceYielding`: A flag that forces the task to yield even if it is already complete.
* `ConfigureAwaitOptions.SuppressThrowing`: A flag that prevents the awaiter from throwing exceptions directly.
* `ConfigureAwaitOptions`: An enum providing granular control over await behavior.
* `ConfiguredTaskAwaitable.ConfigureAwait(Boolean)`: Allows chaining configuration on an already configured awaitable.
* `ConfigureAwait(false) library-code convention`: The best practice of using `ConfigureAwait(false)` in libraries to avoid deadlocks and improve performance.
* `UI synchronization context continuation`: The specific behavior of resuming on the UI thread.
* `ASP.NET Core absence of a custom SynchronizationContext`: A key architectural detail where ASP.NET Core does not use a `SynchronizationContext`, making `ConfigureAwait(false)` less critical for deadlocks but still useful for performance.
* `Blocking wait and single-threaded context deadlock`: A failure mode where a thread waits synchronously for a task that needs that same thread to complete its continuation.
* `Sync-over-async thread starvation`: A performance issue caused by blocking threads while waiting for async tasks, leading to pool exhaustion.
* `ConfigureAwait(false) does not create a thread`: A clarification that `ConfigureAwait(false)` only changes *where* the code resumes, not *how* it executes.
* `ExecutionContext versus SynchronizationContext`: The distinction between ambient data (ExecutionContext) and the environment/thread-affinity (SynchronizationContext).
* `ExecutionContext.SuppressFlow`: Prevents the `ExecutionContext` from being captured and restored.
* `Task.Run ExecutionContext flow`: How `Task.Run` captures the caller's `ExecutionContext` and applies it to the task.
* `ThreadPool continuation scheduling`: The default behavior when no `SynchronizationContext` is present, where continuations run on the ThreadPool.

# Cross-item comparison
* **`SynchronizationContext` vs `TaskScheduler`**: `SynchronizationContext` is a higher-level abstraction often tied to specific application models (like UI), while `TaskScheduler` is a lower-level mechanism for managing task execution.
* **`ConfigureAwait(true)` vs `ConfigureAwait(false)`**: `true` (the default) attempts to marshal the continuation back to the original context; `false` allows the continuation to run on any available thread (usually from the ThreadPool).
* **`Task` vs `ValueTask` configuration**: Both support `ConfigureAwait`, but `ValueTask` is optimized for synchronous completion, whereas `Task` is a heap-allocated object.

# Examples
```csharp
// Library code example: Always use ConfigureAwait(false)
public async Task<string> GetDataAsync()
{
    // We don't need the UI context here, so we opt out.
    var result = await _httpClient.GetStringAsync("...").ConfigureAwait(false);
    return result;
}
```

# Common mistakes
* **Deadlocking**: Calling `.Result` or `.Wait()` on a task in a UI or ASP.NET (legacy) context while the task is trying to resume on that same context.
* **Overusing `ConfigureAwait(false)`**: Applying it in UI-layer code where you actually *need* to update the UI; this will cause an exception because you cannot update UI elements from a background thread.
* **Assuming `ConfigureAwait(false)` creates parallelism**: It does not; it only allows the continuation to run on a different thread if the task completes asynchronously.

# Knowledge checks with answers
1. **Question**: Why should library code use `ConfigureAwait(false)`?
   **Answer**: To avoid deadlocks in environments with a `SynchronizationContext` and to improve performance by avoiding unnecessary context switching.
2. **Question**: Does `ConfigureAwait(false)` force code to run on a background thread?
   **Answer**: No. It allows the continuation to run on the thread that completes the task. If the task completes synchronously, the continuation may still run on the current thread.
3. **Question**: What is the difference between `ExecutionContext` and `SynchronizationContext`?
   **Answer**: `ExecutionContext` carries ambient data (like `AsyncLocal` or security tokens), while `SynchronizationContext` manages the environment/thread where code resumes.

*Source: [Microsoft C# asynchronous programming guide](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)*
