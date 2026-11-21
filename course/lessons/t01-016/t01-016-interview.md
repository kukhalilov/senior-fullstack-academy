
# C# async and await Task ValueTask cancellation and continuation context — Interview questions and reasoning

# Core questions
- What problem does `async` and `await` solve in C#, and what is the plain-language mental model for how they work?
- How does cooperative cancellation function using `CancellationToken` and `CancellationTokenSource`, and why is it not forcible thread termination?
- What is the role of `SynchronizationContext` during an `await` continuation, and when should you use `ConfigureAwait(false)`?
- When should an API return `ValueTask` or `ValueTask<T>` instead of `Task` or `Task<T>`, and what are the consumption constraints?

# Concise interview answers
- **`async`/`await` mental model**: They implement the Task-based Asynchronous Pattern (TAP) to let code yield control while waiting for I/O or asynchronous events without blocking a thread. An async method runs synchronously until it hits an incomplete awaitable; execution then pauses and resumes later via a continuation. They do not automatically create threads or make CPU-bound work parallel.
- **Cooperative cancellation**: `CancellationTokenSource` creates and triggers a token (`CancellationToken`). Code checks `IsCancellationRequested` or calls `ThrowIfCancellationRequested()`. It is cooperative because the running operation must explicitly observe and honor the token; it never forcibly kills arbitrary threads or running instructions.
- **Continuation context (`ConfigureAwait`)**: For an incomplete await, the default task awaiter captures a non-default `SynchronizationContext`; if absent, it may capture a non-default `TaskScheduler`. `ExecutionContext` flows ambient state separately. `ConfigureAwait(false)` opts out of captured-context resumption for that await, but does not guarantee a thread switch, performance gain, or deadlock prevention.
- **`ValueTask` vs `Task`**: Use `Task` and `Task<T>` as the default for most asynchronous methods because they are safe to await repeatedly and cache. Use `ValueTask<T>` only when measurements justify its complexity. Some source-backed values impose single-consumption constraints, so follow the producer contract; do not assume every `ValueTask<T>` is single-use.

# Deep follow-up answers
- **How do `async` methods compile under the hood?**
  The C# compiler rewrites an `async` method into a state machine implementing internal interfaces like `IAsyncStateMachine`. Local variables across `await` boundaries become fields in the state machine struct or class, tracking progress and resuming execution when the awaited task completes.
- **Explain exception propagation and why `Task.WhenAll` behaves differently than sequential awaits.**
  When you `await` a task, exceptions are unwrapped and thrown directly into the caller. However, when using `Task.WhenAll`, if multiple tasks fault, `Task.WhenAll` typically surfaces only one exception directly while the others reside in the resulting `Task.Exception` (an `AggregateException`), unless inspected carefully or unwrapped via specific helpers.
- **Why is `async void` dangerous outside of top-level event handlers?**
  `async void` methods cannot be awaited. Exceptions are propagated through the `SynchronizationContext` active when the method starts rather than being captured into a returned `Task`; the host decides how an unhandled exception is handled.
- **What is the difference between `ExecutionContext` and `SynchronizationContext`?**
  `ExecutionContext` flows ambient data like `AsyncLocal<T>` values, security context, and logical call context across asynchronous points. `SynchronizationContext` controls *where* or *how* continuations are posted back (such as dispatching back to a single-threaded UI loop).

# Scenario questions
- **Scenario A**: You have a desktop UI application where an async method calls a library method, but the entire UI freezes and deadlocks when you call `.Result` or `.Wait()` on the task. Why does this happen, and how do you fix it?
  *Answer*: The UI thread has a single-threaded `SynchronizationContext`. When you synchronously block the UI thread with `.Result`, the continuation tries to post back to that same UI thread. But the UI thread is blocked waiting for `.Result` to finish, creating a classic deadlock. The preferred fix is to use `await` through the call chain. `ConfigureAwait(false)` can remove a library continuation's dependency on the captured context when it has no affinity requirement, but is not a universal fix for sync-over-async.
- **Scenario B**: You need to perform twenty independent I/O requests. A junior developer writes a loop that awaits each request sequentially. How do you refactor this, and what risks must you manage?
  *Answer*: Sequential `await` turns concurrent I/O operations into a slow serial pipeline. Refactor by starting all independent operations first (getting their `Task` objects without awaiting them immediately), and then passing them to `Task.WhenAll(...)`. To protect downstream services, you must bound concurrency using `SemaphoreSlim.WaitAsync()` rather than spawning unbounded parallel work.

# Tradeoffs and alternatives
- **`Task` vs `ValueTask`**: 
  - *`Task`*: Reference type (`class`), reusable and often cacheable; do not assume a fresh allocation per call, supports caching (`Task.CompletedTask`, `Task.FromResult`).
  - *`ValueTask`*: Struct type that can avoid a `Task` allocation for some synchronous completions; consumption constraints depend on its backing source, and conversion or async completion may still allocate.
- **`ConfigureAwait(true)` vs `ConfigureAwait(false)`**:
  - *`ConfigureAwait(true)`* (default): Restores the captured `SynchronizationContext` or `TaskScheduler`. Essential for UI event handlers or UI-bound components that must update visual elements on the correct thread.
  - *`ConfigureAwait(false)`*: Bypasses context capture. Opts out of captured-context resumption for that await. Use when the continuation has no affinity requirement; it does not guarantee throughput improvements or prevent every deadlock.
- **`Task.Run` vs Direct Asynchronous I/O**:
  - *`Task.Run`*: Offloads work to the ThreadPool. Useful for CPU-bound computations in client apps to keep the UI responsive. Wrapping naturally asynchronous I/O in `Task.Run` is usually unnecessary and adds scheduling overhead; it does not make the I/O operation itself more asynchronous.
  - *Direct I/O*: Efficiently uses async drivers (like network or disk sockets) without consuming a dedicated thread while waiting.

# Common weak answers
- *Weak answer*: "`async` and `await` make your program run faster by running code on multiple threads simultaneously."
  *Correction*: `async` and `await` do not inherently create threads or make code run faster or in parallel. They allow a single thread to perform other work while waiting for I/O operations to complete.
- *Weak answer*: "You can use `ValueTask` everywhere instead of `Task` for better performance."
  *Correction*: `ValueTask` has strict usage rules (such as single-consumption constraints on certain backing sources). Using it without measuring the allocation tradeoff or without following the backing source's consumption contract can create correctness bugs.
- *Weak answer*: "Cancellation tokens immediately kill the running async operation when you call cancel."
  *Correction*: Cancellation in .NET is strictly cooperative. The token only signals intent; the underlying method must check `CancellationToken.ThrowIfCancellationRequested()` or observe the token to clean up and exit gracefully.

# Self-check rubric
- [ ] Can you explain why `async`/`await` does not equal multi-threading or parallel execution?
- [ ] Do you know how to write cooperative cancellation handling with `CancellationToken` and `CancellationTokenSource`?
- [ ] Can you articulate when and why to apply `ConfigureAwait(false)` versus relying on default context capture?
- [ ] Do you understand the performance tradeoffs and consumption constraints of `ValueTask<T>` versus `Task<T>`?
- [ ] Can you identify why blocking on async code via `.Result` or `.Wait()` leads to deadlocks in context-bound environments?

Sources: [Topic reference](https://learn.microsoft.com/en-us/dotnet/csharp/asynchronous-programming/)
