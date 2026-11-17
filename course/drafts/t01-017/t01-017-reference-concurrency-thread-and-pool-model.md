<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# threads thread pool synchronization primitives races and parallelism — Reference: Concurrency model, managed threads, thread pool, and execution ownership

*This is an automatically generated draft.*

# Scope and version
This lesson covers the core concurrency model, managed threads, and the thread pool in .NET 11 and C# 15. It focuses on the fundamental execution primitives that underpin parallel and concurrent programming.

# How this group fits the mental model
In .NET, a **Process** is the container for your application, while a **Thread** is the unit of execution. **Concurrency** is the ability to handle multiple tasks by overlapping their execution, and **Parallelism** is the ability to execute multiple tasks simultaneously on different CPU cores.

The **Thread Pool** is a managed collection of worker threads that the runtime maintains to execute short-lived tasks efficiently, avoiding the overhead of creating and destroying threads repeatedly. Use `Thread` for specialized cases needing a dedicated thread, stable identity, foreground lifetime, priority, or long blocking. Use the thread pool for queued work such as TPL tasks, callbacks, timers, registered waits, and I/O completion processing. Naturally asynchronous I/O generally does not occupy a worker thread for the entire wait.

# Supplied names explained

### Threading Fundamentals
* `Concurrency`: The concept of managing multiple tasks that make progress during overlapping time periods.
* `Parallelism`: The execution of multiple tasks at the exact same instant across multiple processors.
* `Multithreading`: The capability of a program to manage its use of the operating system's threads to achieve concurrency.
* `Managed thread`: A thread created and managed by the .NET runtime (CLR).
* `Operating-system thread`: The underlying execution unit provided by the OS kernel.
* `Process versus thread`: A process is an isolated execution environment; a thread is a path of execution within that process.

### Thread Instance Properties and Methods
* `Thread.CurrentThread`: Gets the currently executing thread.
* `Thread.ManagedThreadId`: A unique integer identifier for the managed thread.
* `Thread.Name`: A string property used to name a thread for debugging purposes.
* `Thread.IsAlive`: A boolean indicating if the thread has started and not yet terminated.
* `Thread.IsBackground`: If true, the thread does not keep the process alive when all foreground threads finish.
* `Thread.Priority`: Determines the relative scheduling priority of the thread.
* `Thread.ThreadState`: A flags enumeration describing an observed thread state (for example, `Running` or `WaitSleepJoin`). It is a snapshot that may already be stale; it is not a synchronization mechanism or a reliable way to control a thread.
* `Thread.Start()`: Begins the execution of the thread.
* `Thread.Join()`: Blocks the calling thread until the target thread completes.
* `Thread.Join(TimeSpan)`: Blocks the calling thread until the target thread completes or the timeout expires.
* `Thread.Sleep(Int32)`: Suspends the current thread for a specified number of milliseconds.
* `Thread.Interrupt()`: Requests interruption of a target thread blocked in `WaitSleepJoin`; a `ThreadInterruptedException` is thrown when that thread resumes from the wait, or at a later wait if it was not currently waiting. It is not a safe general-purpose cancellation mechanism.
* `Thread.Yield()`: Causes the calling thread to yield execution to another thread on the same processor.
* `Thread.BeginCriticalRegion()`: Legacy host notification that code is entering a region where thread abort or an unhandled exception could affect other tasks in an application domain; it is not a mutual-exclusion lock and ordinary applications generally should not call it.
* `Thread.EndCriticalRegion()`: Legacy host notification that the previously declared critical region has ended; it does not release a lock.

### Thread-Local Storage
* `ThreadLocal<T>`: Provides thread-local storage of data.
* `ThreadLocal<T>.Value`: Gets or sets the value for the current thread.
* `ThreadLocal<T>.Values`: Gets all values stored by all threads (if tracking is enabled).
* `ThreadLocal<T>.TrackAllValues`: A constructor flag to enable tracking of all values across threads.
* `ThreadStaticAttribute`: A static field attribute that ensures each thread has its own copy of a static variable.

### Thread Pool Management
* `ThreadPool`: The static class used to manage the global pool of worker threads.
* `ThreadPool.QueueUserWorkItem(WaitCallback)`: Queues a task to the thread pool.
* `ThreadPool.QueueUserWorkItem<TState>(Action<TState>,TState)`: Queues a task with state to the thread pool.
* `ThreadPool.UnsafeQueueUserWorkItem`: Queues work without flowing the caller's `ExecutionContext`; use only when omitting ambient context is intentional.
* `ThreadPool.RegisterWaitForSingleObject`: Registers a delegate to be called when a wait handle is signaled.
* `ThreadPool.UnsafeRegisterWaitForSingleObject`: Registers a wait callback without flowing the caller's `ExecutionContext`; use only when omitting ambient context is intentional.
* `ThreadPool.GetMinThreads`: Gets the minimum number of threads the pool will maintain.
* `ThreadPool.SetMinThreads`: Sets the minimum number of threads.
* `ThreadPool.GetMaxThreads`: Gets the maximum number of threads allowed in the pool.
* `ThreadPool.SetMaxThreads`: Sets the maximum number of threads.
* `ThreadPool.GetAvailableThreads`: Gets the number of threads currently available in the pool.
* `ThreadPool.PendingWorkItemCount`: Gets the number of work items currently queued.
* `ThreadPool.CompletedWorkItemCount`: Gets the total number of work items processed.
* `ThreadPool.ThreadCount`: Gets the current number of threads in the pool.
* `ThreadPool starvation`: A condition where the pool cannot create threads fast enough to handle demand.
* `Thread-pool hill climbing`: The algorithm used by the runtime to adjust thread counts based on throughput.
* `Thread-pool worker thread`: A thread dedicated to executing user-queued tasks.
* `Thread-pool I/O completion thread`: Runtime and platform implementations use thread-pool mechanisms to dispatch some I/O completions; do not assume every asynchronous I/O wait occupies a dedicated completion thread.

### Lifecycle and Behavior
* `Foreground thread process lifetime`: The process remains alive as long as at least one foreground thread is running.
* `Background thread process lifetime`: These threads are terminated automatically when all foreground threads exit.
* `Dedicated Thread versus ThreadPool thread`: Dedicated threads are for long-running tasks; pool threads are for short, efficient tasks.
* `Thread.Abort unsupported on modern .NET`: `Abort` is not available in .NET Core/5+ to prevent unstable state.
* `Thread.Suspend and Thread.Resume obsolete hazards`: These legacy APIs are obsolete and unsupported on modern .NET; suspending another thread can leave locks or invariants held and deadlock the process.
* `Unhandled thread exception process behavior`: In modern .NET, unhandled exceptions in threads typically terminate the process.
* `Thread affinity`: The requirement that a task must run on a specific thread (e.g., UI threads).
* `CPU-bound work scheduling`: The strategy of distributing heavy calculations across available cores.

# Cross-item comparison
* **`Thread` vs `ThreadPool`**: Use a dedicated `Thread` when a dedicated execution resource or identity is required, especially for long blocking work. Use TPL/thread-pool work for queued computation and callbacks; asynchronous I/O usually does not require wrapping the wait in `Task.Run`.
* **`ThreadLocal<T>` vs `ThreadStaticAttribute`**: `ThreadLocal<T>` is a class-based approach that supports lazy initialization and dynamic creation. `ThreadStaticAttribute` is a declarative attribute for static fields, which is simpler but less flexible.
* **`Thread.Join` vs `Thread.Sleep`**: `Join` waits for a specific thread to finish. `Sleep` pauses the current thread for a fixed duration regardless of other threads.

# Examples
```csharp
// Using the ThreadPool for a simple task
ThreadPool.QueueUserWorkItem(_ => {
    Console.WriteLine($"Running on thread: {Thread.CurrentThread.ManagedThreadId}");
});

// Using ThreadLocal for thread-safe data
ThreadLocal<int> threadData = new ThreadLocal<int>(() => Thread.CurrentThread.ManagedThreadId);
Console.WriteLine($"Data for this thread: {threadData.Value}");
```

# Common mistakes
1. **Blocking the ThreadPool**: Avoid blocking pool workers for long periods when possible; many blocked workers can cause starvation. Some blocking may be required, but use async APIs, dedicated threads, or appropriate coordination where the workload warrants it.
2. **Ignoring Background Threads**: Assuming a background thread will finish its work before the application exits.
3. **Overusing Dedicated Threads**: Creating a new `Thread` for every small task instead of using the `ThreadPool` or `Task` APIs.

# Knowledge checks with answers
1. **Question**: What happens to background threads when all foreground threads finish?
   **Answer**: The process may terminate without waiting for background threads when no foreground threads remain; do not rely on their cleanup or completion.
2. **Question**: Why is `Thread.Abort` unsupported in modern .NET?
   **Answer**: It can leave the application in an inconsistent state (e.g., locks not released, corrupted memory).
3. **Question**: What is the primary purpose of the `ThreadPool`?
   **Answer**: To manage a pool of worker threads to execute short-lived tasks efficiently, reducing the cost of thread creation.

*Sources: [Managed Threading Basics](https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-basics), [Managed Threading Best Practices](https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-best-practices)*
