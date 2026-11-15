<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# C# async and await Task ValueTask cancellation and continuation context — Reference: Task, Task<T>, ValueTask, factories, composition, waiting, and result retrieval APIs

*This is an automatically generated draft.*

# Scope and version
This lesson covers the core `Task` and `ValueTask` types, their factory methods, composition patterns, and state management APIs in .NET 11 and C# 15. It focuses on the Task-based Asynchronous Pattern (TAP).

# How this group fits the mental model
In the TAP model, a `Task` represents an operation outcome that may be pending, completed, faulted, or canceled. It does not by itself mean that work is currently running. The APIs in this group allow you to:
1. **Create tasks:** Start work (`Task.Run`) or return pre-completed states (factories).
2. **Compose tasks:** Wait for multiple operations to finish (`WhenAll`, `WhenAny`).
3. **Inspect/Wait:** Check status or force completion (`WaitAsync`, `Result`).
4. **Bridge:** Convert between types (`AsTask`) or manually signal completion (`TaskCompletionSource`).

# Supplied names explained

### Core Task Types
* `Task`: Represents an asynchronous operation that does not return a value.
* `Task<T>`: Represents an asynchronous operation that returns a value of type `T`.
* `ValueTask`: A struct-based alternative to `Task` for performance-critical paths where the operation often completes synchronously.
* `ValueTask<T>`: A struct-based alternative to `Task<T>`.

### Task Factories and Pre-completed States
* `Task.CompletedTask`: Returns a `Task` that has already finished successfully.
* `Task.FromResult<T>`: Creates a `Task<T>` that has finished with a specific result.
* `Task.FromException(Exception)`: Creates a `Task` faulted with the provided exception.
* `Task.FromException<T>(Exception)`: Creates a `Task<T>` faulted with the provided exception.
* `Task.FromCanceled(CancellationToken)`: Creates a `Task` in the `Canceled` state.
* `Task.FromCanceled<T>(CancellationToken)`: Creates a `Task<T>` in the `Canceled` state.

### Execution and Scheduling
* `Task.Run(Action)`: Queues work to the thread pool.
* `Task.Run(Func<Task>)`: Queues an async operation to the thread pool.
* `Task.Run<TResult>(Func<TResult>)`: Queues work returning a result to the thread pool.
* `Task.Run<TResult>(Func<Task<TResult>>)`: Queues an async operation returning a result to the thread pool.
* `Task.Factory.StartNew`: A lower-level, highly configurable way to create and start tasks.
* `Task.Delay`: Creates a task that completes after a time delay.
* `Task.Yield`: Returns a `YieldAwaitable`; awaiting it posts continuation to the current `SynchronizationContext`, or current task scheduler when no synchronization context exists. It does not guarantee UI responsiveness.

### Composition and Waiting
* `Task.WhenAll(Task[])`: Creates a task that completes when all supplied tasks complete.
* `Task.WhenAll<TResult>(IEnumerable<Task<TResult>>)`: Creates a task that completes when all supplied generic tasks complete.
* `Task.WhenAny(Task[])`: Creates a task that completes when any of the supplied tasks complete.
* `Task.WaitAsync(CancellationToken)`: Asynchronously waits for the task to complete or the token to trigger.
* `Task.WaitAsync(TimeSpan)`: Asynchronously waits for the task to complete or the timeout to expire.
* `Task.WaitAsync(TimeSpan,CancellationToken)`: Asynchronously waits for the task to complete, timeout, or cancellation.
* `Task.WaitAsync(TimeSpan,TimeProvider,CancellationToken)`: Asynchronously waits using a custom `TimeProvider`.

### Inspection and Synchronous Blocking
* `Task<TResult>.Result`: Blocks the calling thread until the task completes to return the value.
* `Task.Exception`: Gets the `AggregateException` if the task faulted.
* `Task.IsCompleted`: True if the task has finished (any state).
* `Task.IsCompletedSuccessfully`: True if the task finished without error or cancellation.
* `Task.IsFaulted`: True if the task threw an exception.
* `Task.IsCanceled`: True if the task was canceled.
* `Task.Status`: Returns the current `TaskStatus` (e.g., `Running`, `RanToCompletion`).
* `Task.GetAwaiter().GetResult()`: A pattern to block and unwrap exceptions without the `AggregateException` wrapper.
* `Task.Wait()`: Blocks the thread until the task completes.
* `Task<TResult>.Result synchronous blocking`: Accessing `.Result` blocks if the task has not completed; prefer `await` in asynchronous code.
* `Task.WaitAll`: Blocks until all tasks complete.
* `Task.WaitAny`: Blocks until any task completes.

### ValueTask Specifics
* `ValueTask.AsTask()`: Converts a `ValueTask` to a `Task`.
* `ValueTask<T>.AsTask()`: Converts a `ValueTask<T>` to a `Task`.
* `ValueTask<T>.Result`: Gets the result and may block if the operation is incomplete; prefer awaiting it.
* `ValueTask<T>.IsCompletedSuccessfully`: Checks if the `ValueTask<T>` finished successfully.
* `ValueTask<T>.Preserve()`: Returns a `ValueTask<T>` that can be awaited multiple times.
* `ValueTask<T> single-consumption constraint`: A source-backed `ValueTask<T>` may be single-consumption; follow the specific implementation contract. Do not generalize this to every `ValueTask<T>` instance.
* `ValueTask<T> source-backed implementation constraint`: Limitations on how `ValueTask` interacts with underlying sources.

### Manual Completion and Advanced Control
* `ManualResetValueTaskSourceCore<T>`: A helper for implementing `IValueTaskSource`.
* `IValueTaskSource<T>`: Interface for custom awaitable objects.
* `TaskCompletionSource<T>`: Allows manual control over a `Task<T>`'s lifecycle.
* `TaskCompletionSource<T>.SetResult`: Transitions the task to `RanToCompletion`.
* `TaskCompletionSource<T>.TrySetResult`: Attempts to transition the task to `RanToCompletion`.
* `TaskCompletionSource<T>.SetException`: Transitions the task to `Faulted`.
* `TaskCompletionSource<T>.TrySetException`: Attempts to transition the task to `Faulted`.
* `TaskCreationOptions.RunContinuationsAsynchronously`: Ensures continuations registered with the task are scheduled asynchronously; it does not specify a particular thread or require the thread pool.
* `TaskScheduler.Current`: The scheduler associated with the current task.
* `TaskScheduler.Default`: The default thread pool scheduler.
* `TaskCreationOptions.DenyChildAttach`: Prevents child tasks from attaching to the parent.
* `Attached child task`: A task that is a child of another task.
* `Task continuation with ContinueWith`: Schedules a delegate to run after a task finishes.
* `Task continuation ExecuteSynchronously option`: `TaskContinuationOptions.ExecuteSynchronously` requests inline execution when the scheduler permits; scheduler and task conditions can result in scheduled execution instead.

# Cross-item comparison
* **`Task` vs `ValueTask`**: `Task` is a class (reference type) suitable for most scenarios. `ValueTask` is a struct (value type) designed to reduce heap allocations for methods that often complete synchronously.
* **`WaitAsync` vs `Wait()`**: `WaitAsync` asynchronously waits; cancellation of that wait does not necessarily cancel the underlying operation. `Wait()` blocks the current thread and can deadlock in some contexts.
* **`TaskCompletionSource` vs `Task.Run`**: `Task.Run` is for offloading work to the thread pool; `TaskCompletionSource` is for wrapping non-task-based asynchronous APIs (like event-based patterns) into a `Task`.

# Examples
```csharp
// Simple Task creation
Task task = Task.Run(() => Console.WriteLine("Work"));

// Waiting for multiple tasks
Task[] tasks = { Task.Delay(100), Task.Delay(200) };
await Task.WhenAll(tasks);

// Using TaskCompletionSource to wrap an event
var tcs = new TaskCompletionSource<string>(TaskCreationOptions.RunContinuationsAsynchronously);
// ... later ...
tcs.TrySetResult("Done");
```

# Common mistakes
1. **Blocking on Async:** Using `.Result` or `.Wait()` in UI or ASP.NET code often causes deadlocks because the continuation tries to resume on a captured context that is currently blocked by the wait.
2. **Ignoring ValueTask consumption rules:** Some source-backed `ValueTask` instances can be consumed only once. Follow the particular API contract; use `Preserve()` when repeated consumption is needed and supported.
3. **Ignoring Cancellation:** Passing a `CancellationToken` to a method is useless if the method does not check `token.ThrowIfCancellationRequested()`.

# Knowledge checks with answers
1. **Question:** When should you use `ValueTask`?
   **Answer:** Only when performance profiling shows that `Task` allocations are a bottleneck and the method frequently completes synchronously.
2. **Question:** What is the difference between `Task.WhenAll` and `Task.WaitAll`?
   **Answer:** `Task.WhenAll` returns a `Task` and is non-blocking (asynchronous). `Task.WaitAll` blocks the current thread until all tasks finish.
3. **Question:** Why is `async void` generally discouraged?
   **Answer:** `async void` methods cannot be awaited, making it impossible for the caller to track completion or catch exceptions.

*Sources: [Microsoft TAP Guidance](https://learn.microsoft.com/en-us/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap), [Task API Reference](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task), [Task.Yield](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.yield), [TaskCreationOptions](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskcreationoptions), [TaskContinuationOptions](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.taskcontinuationoptions), [Task.WaitAsync](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.waitasync)*
