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
* `ValueTask.CompletedTask`: A successfully completed non-generic `ValueTask` value.
* `ValueTask<T>`: A struct-based alternative to `Task<T>`.

### Task Factories and Pre-completed States
* `Task.CompletedTask`: Returns a `Task` that has already finished successfully.
* `Task.FromResult<T>`: Creates a `Task<T>` that has finished with a specific result.
* `Task.FromException(Exception)`: Creates a `Task` faulted with the provided exception.
* `Task.FromException<T>(Exception)`: Creates a `Task<T>` faulted with the provided exception.
* `Task.FromCanceled(CancellationToken)`: Creates a `Task` in the `Canceled` state.
* `Task.FromCanceled<T>(CancellationToken)`: Creates a `Task<T>` in the `Canceled` state.
* `Task.FromCanceled` token precondition: The supplied token must already be canceled; a non-canceled token causes the factory to throw `ArgumentOutOfRangeException`.

### Execution and Scheduling
* `Task.Run(Action)`: Queues work to the thread pool; cancellation-token overloads can cancel queued work before it begins but do not pass the token into the delegate.
* `Task.Run(Func<Task>)`: Queues an async operation to the thread pool and unwraps the returned task; cancellation-token overloads cancel scheduling before start and do not pass the token into the delegate.
* `Task.Run<TResult>(Func<TResult>)`: Queues work returning a result to the thread pool.
* `Task.Run<TResult>(Func<Task<TResult>>)`: Queues an async operation returning a result to the thread pool.
* `Task.Factory.StartNew`: A lower-level, highly configurable way to create and start tasks. With an `async` delegate it normally returns `Task<Task>` or `Task<Task<T>>`; call `Unwrap()` or use `Task.Run` when a single proxy task is intended.
* `Task.Delay`: Creates a task that completes after a time delay. Overloads accept milliseconds or `TimeSpan`, cancellation, and (in current .NET) a `TimeProvider` for deterministic timing.
* `Task.Yield`: Returns a `YieldAwaitable`; awaiting it posts continuation to the current `SynchronizationContext`, or current task scheduler when no synchronization context exists. It does not guarantee UI responsiveness.

### Composition and Waiting
* `Task.WhenAll(Task[])` and `Task.WhenAll(IEnumerable<Task>)`: Create a task that completes when all supplied tasks complete; the returned task's `Exception` aggregates faults from all failed tasks.
* `Task.WhenAll<TResult>(IEnumerable<Task<TResult>>)` and array overload: Create a task returning results in the same order as the input tasks. .NET 9 also adds `ReadOnlySpan<Task>` and generic `ReadOnlySpan<Task<T>>` overloads.
* `Task.WhenAny(Task[])` and `Task.WhenAny(IEnumerable<Task>)`: Create a task that completes with the first completed task; they do not cancel the remaining tasks. Generic overloads return the first completed `Task<T>`.
* `Task.WaitAsync(CancellationToken)`: Asynchronously waits for the task to complete or the token to trigger; cancellation cancels this wait, not necessarily the underlying task.
* `Task.WaitAsync(TimeSpan)`: Asynchronously waits for the task to complete or the timeout to expire; an elapsed timeout faults the wait with `TimeoutException`.
* `Task.WaitAsync(TimeSpan,CancellationToken)`: Asynchronously waits for the task to complete, timeout, or cancellation.
* `Task.WaitAsync(TimeSpan,TimeProvider,CancellationToken)`: Asynchronously waits using a custom `TimeProvider`.
* `Task.WaitAsync(TimeSpan,TimeProvider)`: Asynchronously waits using a custom `TimeProvider` without a cancellation token.

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
* `Task.Run cancellation-token overloads and pre-start cancellation`: These overloads can prevent queued work from starting but do not inject the token into the delegate; running work must observe a separately passed token.
* `Task.Delay(TimeSpan) and Task.Delay(Int32) overload families`: Delay accepts either duration representation, with overloads for cancellation and a `TimeProvider` on current .NET.
* `Task.Delay(TimeSpan,TimeProvider,CancellationToken)`: Uses a supplied clock and cancellation token, which supports deterministic time-based tests.
* `Task.WhenAll(IEnumerable<Task>) overload`: Accepts a sequence of non-generic tasks and returns one task that completes after all have completed.
* `Task.WhenAll(ReadOnlySpan<Task>) .NET 9 overload`: Avoids requiring a task array or enumerable wrapper for a span-based input.
* `Task.WhenAll<TResult>(Task<TResult>[]) overload`: Accepts an array and returns results in input order after all generic tasks complete.
* `Task.WhenAll<TResult>(ReadOnlySpan<Task<TResult>>) .NET 9 overload`: Span-based generic aggregation with ordered result values.
* `Task.WhenAny(IEnumerable<Task>) overload`: Accepts an enumerable and returns a task whose result is the first completed input task.
* `Task.WhenAny<TResult>(IEnumerable<Task<TResult>>) overload`: Generic enumerable overload returning the first completed generic input task.
* `Task.WhenAny(ReadOnlySpan<Task>) .NET 9 overload`: Span-based overload for non-generic task inputs.
* `Task.WhenAny<TResult>(ReadOnlySpan<Task<TResult>>) .NET 9 overload`: Span-based overload for generic task inputs.
* `Task.WhenAny(Task,Task) overload`: Convenience overload returning whichever of the two tasks completes first.
* `Task.WhenAny result and empty input`: The returned task itself completes successfully with the first completed input, even if that input faulted or canceled; then await or inspect that input task. An empty input collection throws `ArgumentException`.
* `Task.WhenAll empty input`: An empty input collection returns an already-successful task (or an empty result array for the generic form).
* `Task.WaitAsync(TimeSpan,TimeProvider) overload`: Provides a time-provider-based timeout without a cancellation token.
* `Task.Factory.StartNew async delegate returns nested Task`: Unlike `Task.Run`, an async delegate passed to `StartNew` produces a nested task unless `Unwrap()` is called.
* `Task.FromCanceled requires an already-canceled token`: Both generic and non-generic factories reject a token whose cancellation has not yet been requested.
* `TaskCompletionSource non-generic .NET 6 API`: The non-generic producer type is available from .NET 6 for operations without a result value.
* `TaskCompletionSource.SetCanceled and TrySetCanceled`: Complete the non-generic task in the canceled state; `TrySetCanceled` returns false if another completion already won.
* `TaskCompletionSource<T>.SetCanceled and TrySetCanceled`: Generic equivalents may carry a cancellation token; `TrySetCanceled` reports whether this call transitioned the task.
* `TaskCompletionSource.SetResult and TrySetResult non-generic methods`: Complete a non-generic task successfully, with `TrySetResult` reporting whether it won the race.

### ValueTask Specifics
* `ValueTask.AsTask()`: Converts a `ValueTask` to a `Task`.
* `ValueTask<T>.AsTask()`: Converts a `ValueTask<T>` to a `Task`.
* `ValueTask<T>.Result`: Gets the result and may block if the operation is incomplete; prefer awaiting it.
* `ValueTask<T>.IsCompletedSuccessfully`: Checks if the `ValueTask<T>` finished successfully.
* `ValueTask<T>.Preserve()` and `ValueTask.Preserve()`: Return a value task that can safely be consumed later or repeatedly. They may wrap a `Task` when the original is backed by a pooled `IValueTaskSource`; after calling `Preserve`, do not use the original value task.
* `ValueTask<T> single-consumption constraint`: A source-backed `ValueTask<T>` may be single-consumption; follow the specific implementation contract. Do not generalize this to every `ValueTask<T>` instance.
* `ValueTask<T> source-backed implementation constraint`: Limitations on how `ValueTask` interacts with underlying sources.

### Manual Completion and Advanced Control
* `ManualResetValueTaskSourceCore<T>`: A helper for implementing `IValueTaskSource`.
* `IValueTaskSource<T>`: Interface for custom awaitable objects.
* `TaskCompletionSource` and `TaskCompletionSource<T>`: Non-generic and generic types for manually controlling task completion; the non-generic type is available starting in .NET 6.
* `TaskCompletionSource<T>.SetResult`: Transitions the task to `RanToCompletion`.
* `TaskCompletionSource<T>.TrySetResult`: Attempts to transition the task to `RanToCompletion`.
* `TaskCompletionSource<T>.SetException`: Transitions the task to `Faulted`.
* `TaskCompletionSource<T>.TrySetException`: Attempts to transition the task to `Faulted`.
* `TaskCompletionSource.SetCanceled`/`TrySetCanceled` and generic equivalents: Transition a task to the canceled state; `TrySet` forms return false if another completion already won.
* `TaskCompletionSource.SetResult()` and `TrySetResult()`: Complete a non-generic task successfully; `SetResult` throws if it was already completed, while `TrySetResult` reports whether it won the race.
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
1. **Blocking on async:** Using `.Result` or `.Wait()` can deadlock when the awaited operation needs a captured single-threaded context that is blocked by that wait; blocking can also contribute to thread-pool starvation.
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
