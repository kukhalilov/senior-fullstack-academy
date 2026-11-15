<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# threads thread pool synchronization primitives races and parallelism — Reference: Spin waiting, SpinLock, atomic algorithms, and choosing synchronization costs

# Scope and version
This reference lesson covers the exact named inventory group for **Spin waiting, SpinLock, atomic algorithms, and choosing synchronization costs** within .NET 11 GA and C# 15 stable threading APIs (checked 2026-11-14). 

Concurrency means multiple operations make progress during overlapping periods; parallelism means work runs at the same instant on multiple processors. Threads are execution resources, while tasks describe units of work and usually build on the thread pool [https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-basics]. When threads share mutable state, timing-dependent race conditions can occur. While high-level constructs or the Task Parallel Library handle most parallel workloads, low-level spin primitives and spin locks are specialized mechanisms used to avoid full kernel thread blocking when a resource is expected to become available almost immediately.

Source snapshot reference: [Microsoft .NET managed-threading, synchronization primitive, and Task Parallel Library documentation](https://learn.microsoft.com/en-us/dotnet/standard/threading/overview-of-synchronization-primitives).

# How this group fits the mental model
To understand spin and lock-free primitives, imagine an execution pipeline where a worker thread needs a piece of shared data. Instead of immediately calling an operating system sleep or kernel-level block—which incurs expensive context-switching overhead—the thread can "spin" (busy-wait in a tight loop) for a brief duration, checking if the condition changes. If the wait takes too long, the thread yields or escalates to a proper block. 

```
[ Thread Needs Resource ] 
         │
         ▼
  ┌──────────────┐      Condition met quickly?      ┌─────────────────────────┐
  │  SpinWait    │ ───────────────────────────────► │ Proceed with work       │
  └──────────────┘                                  └─────────────────────────┘
         │
         │ Condition takes longer / limit reached
         ▼
  ┌──────────────┐
  │ Yield / Wait │
  └──────────────┘
```

The items in this group represent low-level performance tools:
- **SpinWait** offers helper methods to execute brief CPU-bound waiting loops combined with yield behavior.
- **SpinLock** provides a lightweight mutual exclusion lock structured as a value type (`struct`) designed for scenarios with very short critical sections and minimal contention.
- **Progress guarantees, atomic concepts, and performance pitfalls** (such as the ABA problem, false sharing, and cache-line contention) dictate how safely and efficiently custom concurrent algorithms operate.

# Supplied names explained
This section explains every supplied name in the inventory group.

* `SpinWait`
  - Purpose and behavior: A value type (`struct`) that encapsulates common logic for spinning before yielding or forcing a true wait. It tracks spin counts and determines whether the current thread should yield the processor using `Thread.Yield()` or `Thread.Sleep(0)` to prevent 100% CPU core utilization during busy waits.

* `SpinWait.SpinOnce()`
  - Purpose and behavior: Performs a single spin iteration. As the internal spin count increases, it progressively transitions from a pure processor-bound loop hint (`Thread.SpinWait`) to yielding the processor or sleeping briefly, helping reduce CPU wastage.

* `SpinWait.NextSpinWillYield`
  - Purpose and behavior: A read-only boolean property indicating whether the next call to `SpinOnce()` will trigger a processor yield (or sleep) instead of just performing a light CPU spin.

* `SpinWait.Count`
  - Purpose and behavior: Gets the number of times `SpinOnce()` has been called on this instance, allowing custom algorithms to inspect or branch based on how long the current spin phase has run.

* `SpinWait.Reset()`
  - Purpose and behavior: Resets the internal spin counter back to its initial state, typically used when a retry loop encounters progress and needs to restart its spinning heuristic.

* `SpinWait.SpinUntil(Func<Boolean>)`
  - Purpose and behavior: Spins until the specified condition delegate evaluates to `true`. It internally loops, calling `SpinOnce()` between condition checks until the predicate is satisfied.

* `SpinWait.SpinUntil(Func<Boolean>,TimeSpan)`
  - Purpose and behavior: Spins until the specified condition is met or the given `TimeSpan` timeout expires, returning a boolean indicating whether the condition became true before time ran out.

* `SpinWait.SpinUntil(Func<Boolean>,Int32)`
  - Purpose and behavior: Spins until the condition is met or the timeout in milliseconds (`Int32`) elapses, returning `true` if the condition succeeded or `false` if it timed out.

* `SpinLock`
  - Purpose and behavior: A low-level, lightweight mutual exclusion lock structure (`struct`) that tracks thread ownership. Unlike `Monitor` or `System.Threading.Lock`, it uses a spin-based wait loop rather than kernel blocking, making it suitable exclusively for ultra-short critical sections.

* `SpinLock.Enter(Boolean)`
  - Purpose and behavior: Acquires the lock in a robust manner. The boolean parameter `lockTaken` is passed by reference; upon return, it is set to `true` if the lock was successfully acquired, allowing safe cleanup in try/finally blocks if acquisition throws.

* `SpinLock.TryEnter(Boolean)`
  - Purpose and behavior: Attempts to acquire the lock atomically without blocking or spinning indefinitely, setting the passed reference parameter `lockTaken` to `true` on success and `false` if the lock is currently held.

* `SpinLock.Exit(Boolean)`
  - Purpose and behavior: Releases the spin lock. The boolean argument must match whether thread ownership tracking was enabled and whether the lock was successfully acquired during entry.

* `SpinLock.IsHeld`
  - Purpose and behavior: Gets a value indicating whether the spin lock is currently held by any thread.

* `SpinLock.IsHeldByCurrentThread`
  - Purpose and behavior: Gets a value indicating whether the spin lock is held by the currently executing thread (requires thread-ownership tracking to be enabled).

* `SpinLock.IsThreadOwnerTrackingEnabled`
  - Purpose and behavior: Gets a value indicating whether thread owner tracking is enabled for this `SpinLock` instance, which helps catch programming errors like unlocking from the wrong thread at the cost of slight overhead.

* `SpinLock thread ownership tracking`
  - Purpose and behavior: An optional configuration feature of `SpinLock` that records which thread holds the lock to enforce correctness rules and throw exceptions on invalid re-entrancy or cross-thread exits.

* `SpinLock struct-copy hazard`
  - Purpose and behavior: A critical usage hazard where copying a `SpinLock` instance (because it is a `struct`) duplicates state or creates a distinct lock tracking object, breaking synchronization invariants. `SpinLock` fields should always be treated as read-only or held within reference-type instances (`class`).

* `SpinLock versus Monitor`
  - Purpose and behavior: A conceptual contrast where `SpinLock` avoids kernel transitions via busy-waiting (best for microsecond-scale critical sections under low contention), whereas `Monitor` blocks threads via the operating system (best for longer operations or high contention).

* `SpinWait versus blocking wait`
  - Purpose and behavior: The design choice between keeping a CPU core active to check for conditions instantly (`SpinWait`) versus relinquishing the core entirely to let other work run (blocking wait via semaphores, events, or monitors).

* `Lock-free algorithm progress guarantee`
  - Purpose and behavior: A concurrency guarantee ensuring that at least one thread makes progress globally across the system within a finite number of steps, even if other threads experience delays or contention.

* `Wait-free algorithm progress guarantee`
  - Purpose and behavior: The strongest progress guarantee, ensuring that *every* individual thread is guaranteed to complete its operation within a bounded number of steps, regardless of the behavior or interference of other threads.

* `Obstruction-free algorithm progress guarantee`
  - Purpose and behavior: A guarantee that a thread will make progress if it runs in isolation (unobstructed by other threads), which requires a conflict-resolution mechanism to resolve concurrent collisions.

* `ABA problem`
  - Purpose and behavior: A concurrency hazard where a memory location is read as value `A`, changed to `B`, and then changed back to `A`. A lock-free algorithm relying solely on a simple value check might incorrectly assume no changes occurred.

* `Version-tagged compare-and-swap`
  - Purpose and behavior: A mitigation pattern for the ABA problem where an atomic operation compares both the target value and an accompanying counter/version stamp simultaneously.

* `False sharing`
  - Purpose and behavior: A performance degradation issue that occurs when two separate threads modify independent variables that happen to reside on the same CPU cache line, causing unnecessary cache invalidation traffic between processor cores.

* `Cache-line contention`
  - Purpose and behavior: Hardware-level performance degradation caused by multiple processor cores repeatedly attempting to read and write to memory addresses falling within the exact same cache line.

* `Contention profiling`
  - Purpose and behavior: The diagnostic process of measuring and identifying where threads block or compete intensely for synchronization locks, guiding architecture refactoring to reduce bottlenecks.

* `Throughput versus tail latency under contention`
  - Purpose and behavior: The operational trade-off where heavy spinning maximizes raw operation throughput for short tasks by avoiding context switches, but can severely spike tail latencies (p99/p999) if threads starve or CPU cores saturate.

* `Bounded wait and timeout policy`
  - Purpose and behavior: A strategy where synchronization operations enforce strict time limits or maximum spin counts to prevent permanent thread hanging or infinite busy-waiting loops.

* `Cancellation-aware synchronization`
  - Purpose and behavior: The integration of cancellation tokens (`CancellationToken`) into waiting primitives so that blocked or spinning threads can abort immediately when an external cancellation request occurs.

* `Primitive disposal while waiters remain`
  - Purpose and behavior: A dangerous usage error where synchronization primitives or underlying handles are disposed while other threads are actively waiting on or spinning against them, leading to undefined behavior or exceptions.

# Cross-item comparison
Within this assigned group, items fall into distinct functional categories:
- **`SpinWait` and its methods** (`SpinWait.SpinOnce()`, `SpinWait.NextSpinWillYield`, `SpinWait.Count`, `SpinWait.Reset()`, and the `SpinUntil` overloads) provide generic helper logic for building custom polling and backoff loops.
- **`SpinLock` and its methods/properties** (`SpinLock.Enter(Boolean)`, `SpinLock.TryEnter(Boolean)`, `SpinLock.Exit(Boolean)`, `SpinLock.IsHeld`, `SpinLock.IsHeldByCurrentThread`, `SpinLock.IsThreadOwnerTrackingEnabled`, and thread ownership tracking) form a concrete mutual exclusion primitive specialized for low-overhead, non-blocking-entry critical sections.
- **Progress guarantees and hazards** (`Lock-free algorithm progress guarantee`, `Wait-free algorithm progress guarantee`, `Obstruction-free algorithm progress guarantee`, `ABA problem`, `Version-tagged compare-and-swap`, `False sharing`, `Cache-line contention`, `Contention profiling`, `Throughput versus tail latency under contention`, `Bounded wait and timeout policy`, `Cancellation-aware synchronization`, and `Primitive disposal while waiters remain`) define theoretical bounds, hardware constraints, and failure modes that govern advanced low-level concurrent programming.

# Examples
The following snippet demonstrates how `SpinWait` can be used to wait for a boolean flag to change without immediately invoking heavy thread blocking.

```csharp
using System;
using System.Threading;

public class SpinExample
{
    private static volatile bool _isReady = false;

    public static void RunDemo()
    {
        // Start a background thread that sets the flag after a brief delay
        Thread worker = new Thread(() =>
        {
            Thread.Sleep(50);
            _isReady = true;
        });
        worker.Start();

        // Use SpinWait to wait efficiently for the flag
        SpinWait spinner = new SpinWait();
        while (!_isReady)
        {
            spinner.SpinOnce();
        }

        worker.Join();
        Console.WriteLine("Condition met via SpinWait.");
    }
}
```

*Note: The snippet above illustrates how `SpinWait` interacts with a volatile flag. Expected output when run successfully:*
```text
Condition met via SpinWait.
```

# Common mistakes
- **Treating `SpinLock` as a class**: Because `SpinLock` is a `struct`, passing it by value copies the lock state and breaks mutual exclusion. Always store it as a private readonly field inside a reference class or manage it carefully.
- **Spinning indefinitely**: Using raw spin loops without a yield or timeout mechanism on single-core or heavily saturated systems burns 100% CPU cycles and can lead to thread starvation.
- **Ignoring false sharing**: Placing independent mutable fields accessed by different threads adjacent to one another in memory causes cache-line bouncing, degrading performance.
- **Calling blocking APIs inside spin locks**: Performing I/O or long operations inside a `SpinLock` critical section defeats its purpose and harms system throughput.

# Knowledge checks with answers
1. **Question**: Why should `SpinLock` never be passed around as a method parameter by value?
   - **Answer**: Because `SpinLock` is a value type (`struct`), passing it by value creates a copy of the lock state rather than referencing the original lock, destroying mutual exclusion guarantees and risking severe race conditions.
2. **Question**: What is the primary difference between `SpinWait` and a kernel-blocking wait?
   - **Answer**: `SpinWait` keeps the CPU core active by performing a busy-wait loop (optionally yielding after initial spins) to check for conditions with minimal latency, whereas a kernel-blocking wait yields the processor and puts the thread to sleep until explicitly signaled by the operating system.
3. **Question**: What concurrency hazard does a version-tagged compare-and-swap address?
   - **Answer**: It addresses the ABA problem, where a memory location changes from `A` to `B` and back to `A`, by ensuring that modifications are tracked alongside a version number or counter so that intermediate changes are detected.

---
*Draft automatically generated from frozen topic snapshot t01-017 (.NET 11 GA and C# 15 stable threading APIs checked 2026-11-14).*
