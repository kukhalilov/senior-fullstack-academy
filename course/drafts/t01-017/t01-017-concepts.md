<!-- GENERATED DRAFT: automated shape and editorial checks passed; independent factual verification is not implied. -->

# threads thread pool synchronization primitives races and parallelism — Core concepts and how they fit together

## Learning objectives

After this lesson, you should be able to distinguish concurrency from parallelism; explain the relationship between tasks, threads, and the thread pool; identify a shared-state invariant and its race window; choose among ownership, locks, atomics, signaling, and parallel APIs; and reason separately about safety, liveness, and performance.

## Prerequisites

You should understand ordinary method calls, variables, reference and value types, exceptions, and basic `Task`/async-await use from the task-composition module. The focus here is thread-level behavior and data parallelism, not the full async programming model.

## Core concepts

### Concurrency, parallelism, and scheduling

Concurrency means operations overlap in their periods of progress; parallelism means operations execute at the same instant. A program can be concurrent on one processor through interleaving. Parallel execution requires simultaneous execution resources, typically multiple cores. More workers do not make a workload automatically faster: work can be too small, serially dependent, memory-bound, or dominated by coordination.

A `Task` represents an operation. It is not a thread and does not reserve one. The managed thread pool reuses worker threads for suitable work and adjusts its staffing in response to workload. A dedicated `Thread` has its own lifetime and is appropriate for specialized cases such as a long-lived thread-affine API. Ordinary application code should generally express work through tasks and higher-level APIs rather than manually managing pool threads. See [managed threading](https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-basics), [the managed thread pool](https://learn.microsoft.com/en-us/dotnet/standard/threading/the-managed-thread-pool), and the [Task Parallel Library overview](https://learn.microsoft.com/en-us/dotnet/standard/parallel-programming/task-parallel-library-tpl).

Asynchronous I/O is a separate but related point: while an operation is waiting for the operating system or remote service, a naturally asynchronous operation need not occupy a worker thread for that entire wait. When it completes, continuation work may later run on a thread.

### State, invariants, and race windows

A race condition exists when a result or correctness property depends on timing. Consider `count++`: conceptually, the program reads `count`, adds one, then writes the result. Two threads can both read 0 and both write 1. The operation is a read-modify-write sequence, not an indivisible increment. Similar windows occur in check-then-act logic: “if absent, then add” is unsafe if another thread can intervene between the check and the add.

Start by writing the invariant in plain language. For example: “the available balance equals deposits minus withdrawals, and a withdrawal must not make it negative.” Then identify every operation that reads or changes the fields used by that rule. A lock is effective only if every relevant access follows the same lock protocol. Locking only the write, or protecting one property while reading another without the same lock, leaves a race.

The lowest-complexity design is often to avoid sharing:

- **Ownership/confinement:** one thread or operation owns mutable state at a time.
- **Immutability:** publish fully built data and allow concurrent readers.
- **Message passing:** send work or values across a queue/channel rather than having participants mutate the same object.
- **Partition-local state:** compute independent partial results and combine them once.

These approaches shrink the number of synchronization edges and make correctness easier to see.

### Atomicity, visibility, and ordering

These terms describe different guarantees:

- **Atomicity:** an operation appears indivisible to other participants.
- **Visibility:** one participant's writes become observable to another under defined synchronization rules.
- **Ordering:** reads and writes are constrained from being observed in an order that violates the synchronization contract.

`Interlocked` provides atomic operations for specific values, such as increment, exchange, and compare-exchange. A compare-and-swap loop can implement a conditional update, but multi-field invariants often need a lock or a higher-level design. `Volatile.Read`/`Write` provide defined acquire/release ordering for supported accesses; they do not mean “read from physical memory” and do not turn `x = x + 1` into an atomic operation. A `volatile` field likewise does not make a compound operation safe.

### Mutual exclusion and lock discipline

The C# `lock` statement ensures release on exceptional exit. For an ordinary object target it uses Monitor semantics. In C# 13/.NET 9 and later, a target statically typed as `System.Threading.Lock` receives compiler-aware `EnterScope` lowering. Use a private lock object or dedicated `Lock` so unrelated code cannot acquire the same object accidentally. Avoid locking `this`, a `Type`, or a publicly accessible object. The current [C# lock reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/lock) and [threading best practices](https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-best-practices) describe these rules.

Keep critical sections small and never call unknown or reentrant external code while holding a lock unless that behavior is deliberately understood. Establish a global lock order: if code can acquire A then B, no path should acquire B then A. Use `try/finally` or `lock`-managed release. Monitor is reentrant and thread-affine; this does not mean recursive designs are easy to reason about.

Deadlock is a cycle of waiting dependencies; the familiar necessary conditions are mutual exclusion, hold-and-wait, no preemption, and circular wait. Consistent order removes a common source. Timeouts can detect a stuck wait and support recovery/reporting, but do not by themselves repair the invariant. Starvation means a participant fails to obtain progress; livelock means participants keep reacting without useful progress; priority inversion concerns scheduling priorities and a lower-priority lock holder. These require different diagnoses.

### Coordination primitives by intent

Choose semantics before choosing a type:

| Need | Candidate family | Key idea |
|---|---|---|
| Protect a short in-process invariant | `lock`, `System.Threading.Lock`, `Monitor` | Exclusive ownership of a critical section |
| Perform one supported atomic update | `Interlocked` | Narrow atomic read-modify-write |
| Publish/observe a state transition | Event | Signal remains set or is consumed depending on event type |
| Limit simultaneous entrants | Semaphore / `SemaphoreSlim` | A permit count represents capacity |
| Coordinate a fixed group or phase | Countdown / barrier | Wait for a count or phase boundary |
| Allow readers with occasional writers | `ReaderWriterLockSlim` | More complex policy; only beneficial for measured workloads |
| Wait for a very short expected interval | Spin primitive | Burns CPU while waiting; specialized and measurement-sensitive |

Disposal and lifecycle matter. Do not dispose a synchronization primitive while participants may still be waiting or using it. A named OS-backed synchronization primitive has different scope and cost from a process-local primitive. Choose async-aware waits when a thread must not be blocked across an asynchronous operation.

### Data-parallel work and local aggregation

The TPL parallel loops distribute iterations, but they do not promise a particular order. `Parallel.ForEach<TSource,TLocal>` and related local-state forms can accumulate per partition and combine results, avoiding a lock or atomic update on every iteration. Partitioning and scheduling have overhead, so work granularity matters. Compare with a serial implementation over realistic sizes.

`Parallel.ForEachAsync` accepts asynchronous bodies and bounds concurrent operations. Its default cap is at most `Environment.ProcessorCount`; for this API, `MaxDegreeOfParallelism = -1` also means `ProcessorCount`. A cap is not a guarantee that all slots are occupied. A CPU-count-based cap may not suit an I/O service or external rate limit. Cancellation is cooperative; bodies and operations need to observe the token. See the [`Parallel.ForEachAsync` API reference](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel.foreachasync) and [`MaxDegreeOfParallelism` reference](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.paralleloptions.maxdegreeofparallelism).

Loop-control semantics matter. `Stop()` expresses that no further iteration needs to be started for the result; already-running work may finish. `Break()` records a lowest index and allows lower indices to complete for an ordered search. They cannot be combined in one loop. Neither should be used as a substitute for cancelling unrelated work.

## Mechanisms and relationships

Use this reasoning sequence before coding:

1. **Classify the work:** independent CPU computation, asynchronous I/O, blocking operation, or a mix?
2. **List mutable state:** who owns each value, and which operations must remain indivisible together?
3. **Remove sharing where practical:** local variables, immutable snapshots, ownership transfer, or partition-local results.
4. **Select the narrowest suitable coordination:** lock for a multi-step invariant, atomic operation for one supported update, signaling/capacity primitive for participant coordination.
5. **Design progress:** cancellation, timeout, lock order, bounded concurrency, and cleanup.
6. **Measure:** compare end-to-end latency, throughput, allocation, contention, and thread-pool behavior under representative load.

Correctness (“no corrupted state”) and liveness (“work can make progress”) are separate from speed. A race-free program can deadlock; a live program can be slower than a serial one.

## Worked examples

### Lost update and atomic increment

```csharp
int count = 0;
Parallel.For(0, 100_000, _ => count++); // Incorrect: read-modify-write can race.
```

If only the count itself is the invariant, use an atomic increment:

```csharp
int count = 0;
Parallel.For(0, 100_000, _ => Interlocked.Increment(ref count));
```

If each increment must also append a corresponding audit record, the invariant spans two actions. An atomic increment alone is insufficient; use a lock around both or redesign so a single owner processes messages. The choice follows the invariant, not the syntactic operation.

### Partition-local aggregation

```csharp
long total = 0;
Parallel.ForEach<int, long>(
    values,
    () => 0L,
    (value, _, local) => local + value,
    local => Interlocked.Add(ref total, local));
```

Each partition updates its own `local`; the finalizer combines a partial result. This avoids one shared update per element. Whether it beats serial aggregation depends on input size, element cost, partitioning, and contention. Benchmark both.

## Misconceptions and edge cases

- “A task is a thread.” A task represents work and may execute on a pool thread or scheduler; an asynchronous task can spend time waiting without holding a worker.
- “`lock` makes an object thread-safe.” It only protects accesses that use that same lock consistently; callers can still mutate exposed state outside it.
- “`volatile` makes increments safe.” It provides ordering for individual supported reads/writes, not compound atomicity.
- “Parallel means faster.” Small or contention-heavy workloads can be slower; outputs may arrive in a different order.
- “A semaphore is just a lock.” A semaphore represents a count of permits and generally does not have lock ownership semantics.
- “Timeout eliminates deadlocks.” A timeout can make a wait finite and observable; recovery must still preserve state and release held resources.
- “Spin waits are cheaper.” Spinning consumes CPU and can worsen contention; it is suitable only for narrowly justified short waits.
- “Every concurrency bug is a data race.” Deadlock, ordering errors, starvation, and resource exhaustion are different failure classes.

## Knowledge checks with answers

1. **Can concurrency exist without parallel execution?** Yes. A single processor can interleave operations so their progress overlaps over time.
2. **When is `Interlocked.Increment` sufficient?** When the invariant is only the atomic integer update; it is not enough for a transaction spanning other state.
3. **What makes a lock protect an invariant?** Every relevant read and write must follow the same lock protocol, and the whole invariant-changing operation must be inside the protected region.
4. **Does asynchronous I/O occupy a thread-pool worker for the entire wait?** Naturally asynchronous I/O does not; continuation work may use a worker when the operation completes.
5. **What should be measured before parallelizing?** Representative end-to-end throughput and latency, workload sizes, contention, resource limits, and the serial baseline.
