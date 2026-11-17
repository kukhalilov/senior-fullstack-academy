<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# threads thread pool synchronization primitives races and parallelism — Reference: C# lock, System.Threading.Lock, Monitor, Interlocked, Volatile, and memory visibility

# Scope and version
This reference lesson covers the exact named APIs, statements, and patterns in the `.NET 11 GA and C# 15 stable threading APIs` inventory group: `mutual-exclusion-and-atomic-memory` checked on `2026-11-14`. Source documentation is maintained by Microsoft for managed threading, synchronization primitives, and the Task Parallel Library [https://learn.microsoft.com/en-us/dotnet/standard/threading/overview-of-synchronization-primitives].

# How this group fits the mental model
In modern software, concurrency refers to multiple operations making progress during overlapping periods of time, while parallelism means work executes at the exact same instant across multiple processor cores. Threads represent the underlying operating system execution resources, whereas tasks describe units of work assigned to the managed thread pool. When multiple threads access shared mutable state, timing-dependent defects known as race conditions can corrupt data or violate application invariants.

To prevent race conditions, developers use synchronization primitives to protect critical sections or coordinate participants. Mutual exclusion primitives ensure that only one thread executes a designated block of code at a time. In .NET, mutual exclusion ranges from language-level syntax like the `lock` statement down to low-level atomic read-modify-write operations via `Interlocked` and ordered reads/writes via `Volatile`. Volatile semantics do not mean bypassing CPU caches or fetching directly from physical memory. Understanding how mutual exclusion, memory visibility, and atomicity fit together allows developers to protect shared data without introducing deadlocks, heavy contention, or lock convoys.

# Supplied names explained
This section explains every item in the assigned inventory group, connecting each item to its role in managed threading and mutual exclusion.

* `lock statement`
  A C# language statement that acquires an exclusive mutual-exclusion lock on a given reference object, executes a block of statements, and reliably releases the lock even if exceptions occur.

* `System.Threading.Lock`
  A dedicated mutual-exclusion lock type introduced in .NET 9 and C# 13 to provide a dedicated lock type; Microsoft recommends it with the C# `lock` statement on .NET 9+ for best performance and to avoid locking on shared objects.

* `Lock.EnterScope()`
  An instance method on `System.Threading.Lock` that enters the lock and returns a ref struct scope whose disposal releases the lock, enabling modern `using` statement patterns.

* `Lock.Scope.Dispose()`
  The disposal method on the ref struct scope returned by `EnterScope()`, which releases the `System.Threading.Lock` instance.

* `Lock.Enter()`
  An instance method on `System.Threading.Lock` that blocks until the current thread obtains exclusive access to the lock.

* `Lock.TryEnter()`
  An instance method on `System.Threading.Lock` that attempts to acquire the lock immediately without blocking, returning `true` if successful or `false` otherwise.

* `Lock.TryEnter(Int32)`
  An overload of `TryEnter` that accepts an integer millisecond timeout, attempting to acquire the `System.Threading.Lock` within that time limit.

* `Lock.TryEnter(TimeSpan)`
  An overload of `TryEnter` that accepts a `TimeSpan` timeout, attempting to acquire the `System.Threading.Lock` before the time expires.

* `Lock.Exit()`
  An instance method on `System.Threading.Lock` that releases the lock. It must be called by the thread that currently holds the lock.

* `Lock.IsHeldByCurrentThread`
  A boolean property on `System.Threading.Lock` indicating whether the calling thread currently holds the exclusive lock.

* `lock statement lowering with System.Threading.Lock`
  The compiler translation strategy introduced in C# 13 where a `lock` statement operating on a `System.Threading.Lock` expression lowers into calls to `EnterScope` and disposal.

* `lock statement lowering with object`
  The traditional compiler translation strategy where a `lock` statement operating on an ordinary reference object lowers into a `Monitor.Enter` and a `try-finally` block invoking `Monitor.Exit`.

* `Monitor.Enter(Object)`
  Acquires an exclusive lock on the specified object, blocking the calling thread until the lock is obtained.

* `Monitor.Enter(Object,Boolean)`
  Acquires an exclusive lock on the specified object and sets a reference boolean parameter to indicate whether the lock was successfully acquired.

* `Monitor.TryEnter(Object)`
  Attempts to acquire an exclusive lock on the specified object without blocking, returning `true` if acquired.

* `Monitor.TryEnter(Object,TimeSpan)`
  Attempts to acquire an exclusive lock on the specified object within a specified `TimeSpan` timeout.

* `Monitor.Exit(Object)`
  Releases an exclusive lock on the specified object.

* `Monitor.IsEntered(Object)`
  Returns a boolean value indicating whether the current thread holds the lock on the specified object.

* `Monitor.Wait(Object)`
  Releases the lock on an object and blocks the current thread until it reacquires the lock via a pulse notification.

* `Monitor.Wait(Object,TimeSpan)`
  Releases the lock on an object and blocks the current thread until it reacquires the lock or the specified timeout elapses.

* `Monitor.Pulse(Object)`
  Notifies a waiting thread in the queue of a change in the locked object's state.

* `Monitor.PulseAll(Object)`
  Notifies all waiting threads in the queue of a change in the locked object's state.

* `Monitor reentrant ownership`
  The behavior where a thread that already holds a `Monitor` lock can re-enter it without deadlocking itself, incrementing an internal acquisition counter.

* `Monitor thread affinity`
  The rule that a `Monitor` lock acquired by a specific thread must be released by that same thread.

* `Monitor.Enter and try-finally release`
  The coding pattern required with `Monitor.Enter` to guarantee that `Monitor.Exit` executes in a `finally` block if an exception occurs inside the critical section.

* `Interlocked.Increment`
  Atomically increments a variable by 1 and returns the resulting value.

* `Interlocked.Decrement`
  Atomically decrements a variable by 1 and returns the resulting value.

* `Interlocked.Add`
  Atomically adds two integers and replaces the first variable with the sum, returning the new total.

* `Interlocked.Exchange`
  Atomically replaces a variable with a specified value and returns its original value.

* `Interlocked.CompareExchange`
  Atomically compares two values for equality and, if they match, replaces the target with a third value.

* `Interlocked.Read(Int64)`
  Atomically reads a 64-bit integer value on 32-bit or 64-bit architectures.

* `Interlocked.And`
  Atomically performs a bitwise AND operation on two integers and stores the result.

* `Interlocked.Or`
  Atomically performs a bitwise OR operation on two integers and stores the result.

* `Interlocked.Xor`
  Atomically performs a bitwise exclusive OR (XOR) operation on two integers and stores the result.

* `Interlocked.MemoryBarrier`
  Synchronizes memory access by establishing a memory barrier that prevents CPU processors from reordering memory reads and writes across the barrier.

* `Interlocked.MemoryBarrierProcessWide`
  A process-wide memory barrier that prevents reads and writes from any CPU from moving across the barrier; this specialized API is rarely needed in application code.

* `Thread.MemoryBarrier()`
  Establishes a memory barrier that prevents the calling thread's memory operations from being reordered across the barrier. Use the synchronization primitives designed for the shared-state protocol (such as a lock or an appropriate Interlocked operation) instead of treating a barrier alone as a replacement for mutual exclusion.

* `Interlocked.CompareExchange<T> reference overload`
  A generic reference-type overload of `CompareExchange` that performs atomic reference comparisons and replacements.

* `Interlocked.Exchange<T> reference overload`
  A generic reference-type overload of `Exchange` that atomically replaces a reference variable with a new reference and returns the old reference.

* `Interlocked.Increment(Int32)`
  An explicit 32-bit integer overload of `Interlocked.Increment`.

* `Interlocked.Increment(Int64)`
  An explicit 64-bit integer overload of `Interlocked.Increment`.

* `Volatile.Read<T>`
  Reads a field with volatile ordering semantics. It constrains the ordering of memory operations as specified by .NET; it does not require a physical-memory fetch or make a compound read-modify-write operation atomic.

* `Volatile.Write<T>`
  Writes a field with volatile ordering semantics. It constrains the ordering of memory operations as specified by .NET; it does not promise an immediate write to physical memory.

* `Volatile.Read(Int32)`
  A specialized 32-bit integer overload for `Volatile.Read`.

* `Volatile.Read(Int64)`
  A specialized 64-bit integer overload for `Volatile.Read`.

* `Volatile.Write(Int32)`
  A specialized 32-bit integer overload for `Volatile.Write`.

* `Volatile.Write(Int64)`
  A specialized 64-bit integer overload for `Volatile.Write`.

* `Volatile.Read reference overload`
  A volatile read overload specifically handling reference types.

* `Volatile.Write reference overload`
  A volatile write overload specifically handling reference types.

* `Volatile does not guarantee direct physical-memory access`
  Volatile ordering semantics do not require the processor to fetch each value from physical memory; the contract describes ordering and visibility between threads, not a specific hardware cache implementation.

* `Volatile does not make compound read-modify-write atomic`
  Separate volatile reads and writes do not make a compound increment or check-then-act sequence atomic. Use a suitable Interlocked operation or protect the complete invariant with a consistent lock.

* `Volatile memory ordering`
  The ordering guarantees associated with volatile reads and writes. These operations are not a substitute for a lock when multiple operations must preserve a shared invariant, and they do not make a read-modify-write sequence atomic.

* `Atomicity versus visibility versus ordering`
  The distinction between uninterrupted execution of a single instruction (atomicity), whether other threads can see updated values (visibility), and the sequence in which memory operations execute (ordering).

* `Compare-and-swap loop`
  A lock-free concurrency pattern that repeatedly calls `Interlocked.CompareExchange` until an atomic update succeeds against changing concurrent state.

* `Double-checked locking`
  An optimization pattern used to lazy-initialize shared resources while minimizing locking overhead by checking a volatile field before entering a synchronized block.

* `Locking a private dedicated object`
  A safe encapsulation practice where an unexposed, dedicated reference object is used as a lock token to prevent external code from contending on or releasing the monitor.

* `Locking this object hazard`
  An anti-pattern where an instance locks on `this`, allowing public code outside the class to acquire the same lock, causing unpredictable deadlocks and contention.

* `Locking a Type object hazard`
  An anti-pattern where code locks on a `typeof(T)` object, which is visible across the entire application domain and creates severe cross-component contention.

* `Lock ordering`
  A deadlock-reduction strategy: when code must acquire multiple locks, consistently order them across all paths to avoid circular wait; it does not address every deadlock source.

* `Critical section duration`
  The elapsed execution time spent inside a locked block; keeping critical sections short reduces contention and improves throughput.

* `Lock contention`
  A performance bottleneck that occurs when multiple threads attempt to acquire the same busy lock simultaneously, forcing threads to block or spin.

* `Lock convoy`
  A performance degradation scenario where a queue of threads repeatedly blocks waiting for a lock, wasting CPU cycles on context switches and thread scheduling overhead.

* `Reader-writer lock tradeoff`
  The design choice between allowing multiple concurrent readers with exclusive writers (`ReaderWriterLockSlim`) versus simpler exclusive locks (`lock`), weighed against lock acquisition overhead and complexity.

# Cross-item comparison
Within this inventory group, several primitives and patterns share overlapping utility for protecting state:
* `lock statement` versus `System.Threading.Lock` versus `Monitor`: The `lock` statement is compiler sugar. Prior to .NET 9, it lowered to `Monitor.Enter` and `Monitor.Exit` wrapped in a `try-finally` block. In .NET 9 and C# 13, locking on a `System.Threading.Lock` instance lowers to `EnterScope()` and `Dispose()`, offering better performance and explicit lock scoping.
* `Interlocked` versus `lock`: `Interlocked` provides atomic operations on single scalar values as one atomic update, suitable for simple state changes; it is not necessarily lock-free at the hardware level and is not a substitute for a lock when invariants span multiple locations. `lock` protects multi-step critical sections that require atomicity across several variables or statements.
* `Volatile` methods versus `Interlocked` methods: `Volatile.Read` and `Volatile.Write` ensure memory visibility and ordering without atomicity guarantees for compound changes, whereas `Interlocked` methods provide atomic read-modify-write operations and the memory-ordering guarantees of their API contract.

# Examples
The following example demonstrates a single synchronization protocol: every access to the counter uses the same lock. Do not mix locked writes with unsynchronized or Interlocked writes and assume the lock protects those other accesses.

```csharp
using System;
using System.Threading;
using System.Threading.Tasks;

public class ThreadingDemo
{
    // A dedicated private lock instance (.NET 9+)
    private readonly System.Threading.Lock _lockObj = new();
    private int _sharedCounter = 0;

    public void Increment()
    {
        // The compiler lowers this lock to EnterScope / Dispose for System.Threading.Lock.
        lock (_lockObj)
        {
            _sharedCounter++;
        }
    }

    public int GetCounter()
    {
        lock (_lockObj)
        {
            return _sharedCounter;
        }
    }
}

public class Program
{
    public static async Task Main()
    {
        var demo = new ThreadingDemo();

        // Run concurrent tasks updating the counter through the same lock protocol.
        Task t1 = Task.Run(() => {
            for (int i = 0; i < 1000; i++) demo.Increment();
        });

        Task t2 = Task.Run(() => {
            for (int i = 0; i < 1000; i++) demo.Increment();
        });

        await Task.WhenAll(t1, t2);

        Console.WriteLine($"Final Counter: {demo.GetCounter()}");
    }
}
```

Expected output:
```text
Final Counter: 2000
```

# Common mistakes
* **Locking on `this` or public types**: Locking on `this` or `typeof(MyClass)` exposes internal synchronization state to external callers, leading to unexpected deadlocks and denial of service. Always lock on a private, dedicated instance field.
* **Forgetting `try-finally` with raw `Monitor.Enter`**: If an exception occurs between `Monitor.Enter(obj)` and `Monitor.Exit(obj)` without a `try-finally` block, the lock remains permanently acquired, causing other threads to hang indefinitely.
* **Confusing atomicity with visibility**: A volatile read or write does not make a compound update atomic. Protect every access that participates in a multi-step invariant with the same lock, or use a suitable atomic operation for a single supported update.
* **Unbounded critical sections**: Performing blocking I/O or heavy computations inside a locked section starves other threads and creates severe lock contention.

# Knowledge checks with answers
1. **Question:** What is the primary advantage of using `System.Threading.Lock` over locking on an ordinary `object` in .NET 9 and C# 13?
   **Answer:** Starting with .NET 9 and C# 13, the compiler recognizes a `System.Threading.Lock` expression in a `lock` statement and lowers it through `EnterScope()` and disposal. Microsoft recommends it for best performance and to reduce mistakes from locking the wrong or shared object; performance depends on the workload, and the API is not described as eliminating object-header allocation.

2. **Question:** Why is locking on `typeof(string)` or a public instance (`this`) considered a hazard?
   **Answer:** It exposes the lock token externally, allowing outside code to acquire the lock unintentionally, which can result in deadlocks and unpredicted thread contention.

3. **Question:** When should you choose `Interlocked.Increment` instead of a `lock` statement?
   **Answer:** Choose `Interlocked.Increment` for a supported single-variable atomic increment when that operation alone preserves the invariant. Use a lock when the invariant spans multiple operations or state. Do not mix locking and Interlocked operations on the same state unless the complete synchronization protocol is explicitly designed for that combination.

4. **Question:** What does `Volatile.Read` guarantee that a normal field read does not?
   **Answer:** It applies volatile ordering semantics to the read as defined by .NET. It does not promise a physical-memory fetch and does not make a read-modify-write sequence atomic.

Sources: [Topic reference](https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-basics), [Volatile API reference](https://learn.microsoft.com/en-us/dotnet/api/system.threading.volatile), [Thread.MemoryBarrier API reference](https://learn.microsoft.com/en-us/dotnet/api/system.threading.thread.memorybarrier)
