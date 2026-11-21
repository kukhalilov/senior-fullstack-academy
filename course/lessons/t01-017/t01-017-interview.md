
# threads thread pool synchronization primitives races and parallelism — Interview questions and reasoning

## Core questions

1. What is the difference between concurrency and parallelism?
2. Is a `Task` a thread? How does the managed thread pool fit in?
3. What is a race condition, and why is incrementing a shared integer unsafe?
4. How do atomicity, visibility, and ordering differ?
5. When would you use a lock, `Interlocked`, an event, or a semaphore?
6. What are the four necessary conditions commonly used to reason about deadlock?
7. When can a parallel loop be slower than a serial loop?
8. How does `Parallel.ForEachAsync` limit work, and what should you know about its default?

## Concise interview answers

1. Concurrency is overlapping progress; parallelism is simultaneous execution. Concurrent work can be interleaved on one processor.
2. No. A task represents work. It may run on a pool thread or another scheduler; a naturally asynchronous wait need not occupy a worker for the wait's full duration.
3. A race makes correctness depend on timing. `count++` is a read-modify-write sequence, so two callers can read the same old value and overwrite one another's updates.
4. Atomicity means indivisibility; visibility means writes become observable under synchronization; ordering constrains the observed sequence. One guarantee does not imply all the others.
5. A lock protects a multi-step in-process invariant; `Interlocked` performs supported narrow atomic updates; an event signals a condition; a semaphore represents a bounded number of permits.
6. Mutual exclusion, hold-and-wait, no preemption, and circular wait. Breaking a condition—often circular wait through a global lock order—can prevent that deadlock pattern.
7. For small work, expensive partitioning/scheduling, shared-state contention, or dependencies can outweigh parallel gains. Benchmark against serial execution.
8. It applies a maximum concurrent-operation cap. Its default is at most `Environment.ProcessorCount`; `-1` also means that processor count for this API, and the cap does not guarantee that many operations run. See the [`Parallel.ForEachAsync` API reference](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.parallel.foreachasync).

## Deep follow-up answers

### Why does a lock need a protocol?

A lock is not attached magically to the data it protects. Its protection comes from all code paths using the same lock for every access that participates in the invariant. If one reader accesses a field without the lock, the lock does not protect that reader. State the invariant first, then identify the complete read/write set and guard it consistently. A private lock object or dedicated `System.Threading.Lock` prevents unrelated code from acquiring the same monitor accidentally. These rules follow the [C# lock reference](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/lock) and [managed-threading best practices](https://learn.microsoft.com/en-us/dotnet/standard/threading/managed-threading-best-practices).

### Why not use `volatile` for a shared counter?

Volatile operations provide specified ordering for individual supported accesses. They do not combine a read, arithmetic operation, and write into one indivisible update. Use `Interlocked.Increment` when the counter alone is the invariant; use a lock or a design with single ownership when updates span multiple pieces of state.

### How would you distinguish safety from liveness?

Safety asks whether something bad can happen, such as corrupted state or an invalid balance. Liveness asks whether useful work can eventually proceed. A lock can preserve safety yet deadlock. A program can remain live but starve one participant. I would test and diagnose those properties separately.

### When does a reader-writer lock help?

It can allow concurrent readers while excluding writers, but it adds bookkeeping and policy costs. It helps only when read concurrency is substantial, writes are relatively uncommon, and measurements show it beats a simpler lock on the actual workload. It is not inherently faster.

### How do `Stop` and `Break` differ?

`Stop` communicates that no further iteration needs to start to determine the result. `Break` is for an indexed loop where lower indices still matter; it records a lowest break iteration and permits lower-index iterations to complete. Already-running work can finish, and a loop cannot combine both calls.

## Scenario questions

### Scenario: A counter is occasionally wrong under load

Explain how you would investigate and repair it. A strong response identifies the read-modify-write race, clarifies whether the counter is the complete invariant, selects `Interlocked` only if it is, and proposes a stress test. If the counter tracks a set of records or a ledger, it chooses a larger atomic boundary or single-owner design.

### Scenario: Two services freeze while updating customer and ledger state

Ask which locks each path acquires and in what order. Show how opposite acquisition order creates a wait cycle. Propose a global order, fewer simultaneously held locks, or ownership/transaction redesign. Add diagnostics and bounded waits as observability/recovery tools, not as proof of correctness.

### Scenario: A CPU-heavy batch is slower after parallelization

Check input size, partitioning cost, per-item granularity, shared accumulators, memory bandwidth, thread-pool saturation, and contention. Compare with a serial baseline using realistic data. Keep parallelism only where it improves the measured objective without violating resource limits.

### Scenario: An API partner allows six in-flight calls

Use bounded asynchronous concurrency and cancellation. Explain that a concurrency cap does not necessarily enforce a request-per-second limit. Track in-flight count, latency, throttling, and cancellation; choose a cap from the partner contract and measurements.

## Tradeoffs and alternatives

- **Task versus thread:** tasks compose work and usually avoid manual worker lifetime management; a dedicated thread is justified by specialized lifetime or thread affinity.
- **Lock versus atomic operation:** a lock handles multi-step invariants; an atomic operation is simpler for a supported single-location update.
- **Lock versus ownership/message passing:** ownership reduces shared-state synchronization, while locks can be direct when the state must be shared synchronously.
- **Semaphore versus lock:** permits model capacity and need not imply exclusive ownership by the acquiring thread; a lock expresses mutual exclusion.
- **Parallel versus serial:** parallelism offers throughput for sufficient independent work at coordination cost; serial execution is simpler and often best for small or dependent work.
- **Spin versus blocking:** spinning avoids a context switch only if the wait is extremely short, but consumes processor time and can make contention worse.

## Common weak answers

- “Tasks are lightweight threads.” This obscures that a task represents work and need not own a thread.
- “The lock makes the class thread-safe.” It omits the required consistent protocol and the invariant being protected.
- “Volatile prevents races.” It does not make compound operations atomic.
- “Use a concurrent collection for all shared state.” Collection safety does not automatically make a transaction across multiple collections or fields atomic.
- “Parallel loops always use every core.” Scheduling and configured limits are policies/caps, not guarantees of utilization.
- “A timeout fixes deadlock.” It bounds a wait; correct recovery and lock-order reasoning are still required.
- “Reader-writer locks are faster for reads.” They may lose to a simple lock when bookkeeping or write patterns dominate.

## Self-check rubric

Score each from 0 (cannot explain) to 2 (clear, accurate explanation with a concrete example):

1. Distinguishes concurrency, parallelism, tasks, threads, and asynchronous I/O.
2. Writes an invariant and identifies the full race window.
3. Separates atomicity, visibility, and ordering, including the limits of `Volatile`.
4. Selects a primitive based on semantics and explains its lifecycle/cancellation implications.
5. Reasons about deadlock and other liveness failures without conflating them.
6. Evaluates parallel performance against a representative serial baseline.

10–12: ready to reason through production tradeoffs; 7–9: revisit the missed categories and implement a small example; 0–6: review the concepts lesson and repeat the exercises before memorizing API names.
