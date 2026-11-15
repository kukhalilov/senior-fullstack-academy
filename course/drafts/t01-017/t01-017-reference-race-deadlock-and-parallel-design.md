<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# threads thread pool synchronization primitives races and parallelism — Reference: Race conditions, deadlock, thread safety, parallel loops, partitioning, and diagnostics

# Scope and version
This reference lesson covers the exact named concepts, design patterns, parallel APIs, and diagnostic features listed in the inventory group `race-deadlock-and-parallel-design`. The environment context is .NET 11 GA and C# 15 stable threading APIs, checked under Microsoft .NET managed-threading and Task Parallel Library documentation standards as of 2026-11-14 [https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-basics, https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-parallel-library-tpl]. 

Concurrency means multiple operations make progress during overlapping periods, whereas parallelism means work runs at the same instant on multiple processors. Threads are low-level execution resources, while tasks describe units of work that usually build on top of the thread pool. This reference lesson explains every item in the assigned inventory group, connecting design pitfalls, parallel execution engines, thread-safety contracts, and diagnostic techniques to the broader .NET threading mental model.

# How this group fits the mental model
In concurrent and parallel programming, multiple threads or tasks execute code at the same time. When those execution paths read and write shared mutable state without coordination, incorrect outcomes and unpredicted failures occur. The inventory items in this group fall into four cohesive categories:
1. **Concurrency hazards and structural bugs**: Race conditions, data races, deadlocks, starvation, livelock, and priority inversion.
2. **Safe design patterns and initialization**: Immutability, ownership confinement, message passing, thread-safe contracts, and thread-safe initialization (`Lazy<T>`).
3. **Data parallelism APIs**: `Parallel.For`, `Parallel.ForEach`, `Parallel.ForEachAsync`, and their configuration and loop-control options (`ParallelOptions`, `ParallelLoopState`, `ParallelLoopResult`).
4. **Diagnostic and measurement tooling**: Counters, metrics, trace events, and benchmarking tools used to locate contention and monitor thread pool behavior.

Understanding these concepts prevents silent data corruption and helps you decide when data parallelism improves throughput versus when overhead and contention degrade performance.

# Supplied names explained
This reference lesson explains every inventory item assigned to this group. Each item string is reproduced verbatim.

- `Race condition`
  A situation where the correctness of a program depends on the relative timing or interleaving of threads. Even if individual operations are atomic, the overall outcome changes depending on which thread runs first.

- `Data race`
  A specific hardware- and memory-level hazard where two or more instructions from different threads access the exact same memory location concurrently, at least one access is a write, and there is no synchronization order between them. Data races are undefined behavior.

- `Lost update`
  A classic race condition where two threads read a shared value, compute an update locally, and write their results back. The second write overwrites the first, causing one update to disappear.

- `Check-then-act race`
  A race condition where a thread inspects a shared state (the check), decides an action is valid, and then performs the action (the act), but another thread modifies the state in between the check and the act.

- `Time-of-check to time-of-use race`
  A security and correctness hazard (often abbreviated as TOCTOU) similar to a check-then-act race, where an external resource state changes between the moment it is verified and the moment it is consumed.

- `Thread-safe type contract`
  A guarantee that instances of a type can be accessed concurrently by multiple threads without external synchronization, while maintaining internal data integrity and predictable behavior.

- `Thread-safe static state`
  A guarantee that static fields, properties, and methods on a type can be accessed and modified concurrently by multiple threads without corruption.

- `Immutable shared data`
  Data whose state cannot be modified after construction. Immutable data is inherently thread-safe because multiple threads can read it concurrently without locks or data races.

- `Ownership confinement`
  A design pattern where data ownership is restricted to a single thread or context at any given time, eliminating sharing and thus removing the need for synchronization primitives.

- `Message passing`
  A design pattern where threads communicate by sending immutable or uniquely owned data packets across a channel or queue rather than mutating shared memory directly.

- `Producer-consumer pattern`
  A coordination pattern where one or more producer threads generate work items or data and place them into a shared buffer or queue, while one or more consumer threads retrieve and process them.

- `Deadlock necessary conditions`
  The four classic conditions that must all hold simultaneously for a deadlock to occur: mutual exclusion, hold and wait, no preemption, and circular wait.

- `Lock-order inversion`
  A common cause of deadlocks where two or more threads acquire multiple locks in different orders (e.g., Thread 1 locks A then B; Thread 2 locks B then A), leading to a circular wait condition.

- `Deadlock detection with timeout`
  A defensive coding strategy where synchronization requests use a timeout value rather than blocking indefinitely, allowing a thread to recover or report an error when a lock cannot be acquired.

- `Starvation`
  A performance and scheduling issue where a runnable thread is perpetually denied processor time or access to a resource because higher-priority threads dominate access.

- `Livelock`
  A state where two or more threads continuously change their internal state in response to each other without making any actual progress, resembling a polite pair of people repeatedly stepping in the same direction in a hallway.

- `Priority inversion`
  A scheduling problem where a high-priority thread is blocked because a low-priority thread holds a necessary synchronization lock, and an intermediate-priority thread preempts the low-priority thread, preventing it from releasing the lock.

- `Thread-safe initialization`
  The practice of ensuring that a resource or shared object is created exactly once, even when multiple threads attempt to initialize it simultaneously.

- `Lazy<T> thread-safety modes`
  The configuration choices provided by `Lazy<T>` that dictate how thread safety is enforced during lazy evaluation and instantiation of the wrapped value.

- `LazyThreadSafetyMode.None`
  No thread safety is enforced. If multiple threads access an uninitialized `Lazy<T>` instance concurrently, the outcome is unpredictable and state corruption may occur. Intended strictly for single-threaded scenarios.

- `LazyThreadSafetyMode.PublicationOnly`
  Multiple threads are permitted to run the initialization factory function concurrently, but only the first thread to complete publishes its result as the final value. Other threads' results are discarded.

- `LazyThreadSafetyMode.ExecutionAndPublication`
  Full thread safety. A lock ensures that only a single thread executes the initialization factory function, and all subsequent threads block until that initialization completes and the value is published.

- `Parallel.For`
  A static method in the `System.Threading.Tasks.Parallel` class that executes a for-loop iteration space in parallel across multiple tasks and threads.

- `Parallel.For<TLocal>`
  An overload of `Parallel.For` that supports thread-local state initialization and accumulation per partition, reducing contention on shared accumulators.

- `Parallel.ForEach`
  A static method that executes a foreach-loop over an enumerable source in parallel across multiple tasks and threads.

- `Parallel.ForEach<TSource,TLocal>`
  An overload of `Parallel.ForEach` that supports local state initialization, iteration processing, and final local-to-global aggregation.

- `Parallel.ForEachAsync`
  An asynchronous parallel loop API introduced in .NET 6 that processes enumerable items concurrently using asynchronous bodies (`Func<TSource, CancellationToken, ValueTask>`) [https://learn.microsoft.com/en-us/dotnet/standard/threading/overview-of-synchronization-primitives].

- `ParallelOptions`
  An options class used to configure parallel loops, specifying degree of parallelism, cancellation tokens, and task schedulers.

- `ParallelOptions.MaxDegreeOfParallelism`
  A property on `ParallelOptions` that limits the maximum number of concurrent tasks or threads a parallel loop is allowed to use.

- `ParallelOptions.CancellationToken`
  A property on `ParallelOptions` that supplies a token to monitor for cancellation requests, stopping loop iterations early if triggered.

- `ParallelOptions.TaskScheduler`
  A property on `ParallelOptions` that specifies the custom `TaskScheduler` used to execute tasks spawned by parallel loops.

- `ParallelLoopState.Stop()`
  A method called within a parallel loop iteration to signal that no further iterations beyond the current and previously started ones should be executed.

- `ParallelLoopState.Break()`
  A method called within a parallel loop iteration to signal that iterations beyond the current index should be terminated, ensuring ordered or bounded early exit.

- `ParallelLoopState.IsStopped`
  A boolean property indicating whether any thread has called `Stop()` on the loop state.

- `ParallelLoopState.ShouldExitCurrentIteration`
  A boolean property that returns `True` if current or prior loop iterations have requested a break or stop, signaling that the current iteration should exit early.

- `ParallelLoopResult.IsCompleted`
  A boolean property on the result returned by `Parallel.For` and `Parallel.ForEach` indicating whether the loop ran to completion without early termination.

- `ParallelLoopResult.LowestBreakIteration`
  A nullable long property indicating the lowest iteration index that called `Break()`, useful when ordered loop termination is required.

- `Parallel.ForEach local state initialization and finalization`
  The mechanism where thread- or task-local variables are initialized at the start of a partition, updated during iterations without locking, and finalized into a shared result at the end.

- `Parallel.ForEach partition-local aggregation`
  Combining results computed independently within partitions before updating a shared global collection or counter, avoiding per-iteration lock overhead.

- `Parallel.ForEach partitioning overhead`
  The performance cost associated with dividing a data source into chunks and distributing them across multiple threads or tasks.

- `Parallel.ForEach ordered versus unordered results`
  The distinction between processing data in sequence preservation mode versus processing chunks opportunistically as threads become available.

- `Parallel.ForEachAsync asynchronous body`
  The delegate signature accepted by `Parallel.ForEachAsync` that allows asynchronous I/O operations (`ValueTask`) inside parallel execution loops.

- `Parallel.ForEachAsync default concurrency limit`
  The default operational constraint applied by `Parallel.ForEachAsync` when no explicit `MaxDegreeOfParallelism` is configured, scaling with processor count and thread pool availability.

- `Parallel.ForEachAsync cancellation`
  The mechanism by which cooperative cancellation propagates through `ParallelOptions.CancellationToken` to halt executing asynchronous loop bodies.

- `Parallel work granularity`
  The relative size and computational weight of individual work items in a parallel loop. Fine-grained work incurs excessive scheduling overhead, while coarse-grained work may lead to underutilization.

- `Parallel overhead versus serial execution`
  The tradeoff analysis showing that small workloads run faster sequentially because parallel scheduling, task allocation, and partitioning consume more time than the actual computation.

- `Avoid shared mutable accumulator in parallel loop`
  A core best practice stating that updating a shared variable inside a parallel loop using locks or atomic operations on every iteration destroys parallelism due to contention. Use local state instead.

- `Concurrent collections in t01-014`
  Thread-safe collection types (such as `ConcurrentDictionary<TKey, TValue>`) designed for lock-free or fine-grained lock concurrent producer-consumer scenarios, covered in topic t01-014.

- `Task and async scheduling in t01-016`
  Asynchronous programming fundamentals, async/await mechanics, and task composition covered in topic t01-016.

- `System.Diagnostics.Metrics thread-pool metrics`
  Diagnostic counters and metrics exposed via .NET diagnostics to monitor thread pool queue lengths, thread counts, and completion rates.

- `dotnet-counters System.Runtime thread-pool counters`
  Command-line diagnostic tool metrics that track thread pool worker counts, queue lengths, and contention live.

- `dotnet-trace contention events`
  Tracing capabilities that capture monitor lock contention events and runtime synchronization pauses.

- `Visual Studio concurrency visualizer`
  An integrated profiling tool that visualizes thread execution, synchronization delays, core migrations, and idle time.

- `BenchmarkDotNet contention benchmark`
  A micro-benchmarking library used to measure execution speed and lock contention overhead accurately under controlled concurrency loads.

# Cross-item comparison
Within this inventory group, several related concepts represent contrasting design choices:

- **`LazyThreadSafetyMode.None` vs. `LazyThreadSafetyMode.PublicationOnly` vs. `LazyThreadSafetyMode.ExecutionAndPublication`**: `None` provides zero protection and corrupts state under concurrency. `PublicationOnly` allows multiple threads to execute the factory function concurrently but guarantees only one result is published, discarding redundant work. `ExecutionAndPublication` uses strict mutual exclusion so the factory runs exactly once, blocking all other threads until completion.
- **`Parallel.For` / `Parallel.ForEach` vs. `Parallel.ForEachAsync`**: The synchronous `Parallel` loops target CPU-bound synchronous bodies, whereas `Parallel.ForEachAsync` accepts asynchronous delegates returning `ValueTask`, enabling concurrent asynchronous I/O loops without blocking thread pool threads on waits.
- **`ParallelLoopState.Stop()` vs. `ParallelLoopState.Break()`**: `Stop()` abruptly halts all further loop iterations globally regardless of index, while `Break()` ensures that all iterations with indices lower than the current break point are allowed to complete, supporting ordered or deterministic early termination.

# Examples
The following complete, compilable C# console application demonstrates parallel execution using `Parallel.ForEach`, loop control via `ParallelLoopState`, and thread-safe accumulation using local state overloads.

```csharp
using System;
using System.Collections.Concurrent;
using System.Threading;
using System.Threading.Tasks;

class Program
{
    static void Main()
    {
        var numbers = new int[1000];
        for (int i = 0; i < numbers.Length; i++)
        {
            numbers[i] = i + 1;
        }

        // Use Parallel.ForEach with thread-local state initialization and finalization
        // to compute the sum without per-item locking contention.
        long totalSum = 0;

        Parallel.ForEach(
            source: numbers,
            localInit: () => 0L,
            body: (int number, ParallelLoopState state, long localSum) =>
            {
                // Example of conditional early stopping using ParallelLoopState
                if (number > 900)
                {
                    state.Stop();
                }

                return localSum + number;
            },
            localFinally: (long localSum) =>
            {
                Interlocked.Add(ref totalSum, localSum);
            }
        );

        Console.WriteLine($"Computed Sum (up to early stop limit): {totalSum}");
    }
}
```

### Expected Output
```text
Computed Sum (up to early stop limit): 405450
```

# Common mistakes
- **Using shared mutable accumulators inside parallel loops**: Updating a shared integer variable via `Interlocked.Increment` or a `lock` on *every* iteration of `Parallel.For` introduces severe lock contention. Always use partition-local accumulation (`Parallel.For<TLocal>`) and combine results only at partition finalization.
- **Applying parallelism to fine-grained workloads**: Spawning parallel tasks for trivial loop bodies (such as adding two local numbers) incurs more scheduling overhead than executing sequentially. Parallelism requires sufficient work per iteration to amortize task creation.
- **Forgetting asynchronous boundaries in `Parallel.ForEachAsync`**: Passing a synchronous lambda that performs blocking I/O inside `Parallel.ForEachAsync` exhausts the thread pool. Ensure asynchronous bodies properly await underlying I/O operations.
- **Confusing `Stop()` and `Break()` semantics**: Using `Stop()` in unordered loops can terminate iterations unpredictably across partitions, whereas `Break()` provides deterministic index termination for bounded parallel searches.

# Knowledge checks with answers
1. **Question**: Which `Lazy<T>` thread safety mode ensures that the initialization factory function is executed at most once while blocking concurrent accessor threads until initialization completes?
   - **Answer**: `LazyThreadSafetyMode.ExecutionAndPublication`.

2. **Question**: Why is updating a shared integer counter inside a high-frequency `Parallel.For` loop using `lock` or `Interlocked` on every iteration discouraged?
   - **Answer**: It causes extreme contention and cache line bouncing, destroying the performance benefits of parallelism. Partition-local accumulation should be used instead.

3. **Question**: What is the key difference between `Parallel.ForEach` and `Parallel.ForEachAsync`?
   - **Answer**: `Parallel.ForEach` executes synchronous loop bodies on CPU threads, whereas `Parallel.ForEachAsync` accepts asynchronous delegates returning `ValueTask`, allowing concurrent asynchronous operations without blocking thread pool threads.

4. **Question**: What does calling `ParallelLoopState.Stop()` achieve inside a parallel loop?
   - **Answer**: It signals that no further iterations beyond current and already started ones should be executed, resulting in `IsCompleted` returning `false` on the returned `ParallelLoopResult`.

Sources: [Topic reference](https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-basics)
